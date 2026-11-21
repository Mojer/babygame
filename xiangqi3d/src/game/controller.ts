import * as THREE from 'three'
import { AiClient } from '../ai/client'
import type { Level } from '../ai/search'
import { Match } from '../rules/match'
import { type Move, isInCheck, moveToIccs, parseMove } from '../rules/moves'
import { moveToChinese } from '../rules/notation'
import { type Side, squareIndex, toFen } from '../rules/position'
import { LessonRun, type StepResult } from '../teach/lessonRun'
import type { Lesson } from '../teach/lessons'
import type { GuideEntry } from '../teach/guide'
import { Board, squareToWorld, worldToSquare } from '../render/board'
import { PieceView } from '../render/pieces'
import type { Stage } from '../render/stage'
import type { Hud } from '../ui/hud'
import type { VfxManager } from '../vfx/vfx'
import { sound } from '../audio/sound'
import type { MatchSettings, SavedMatch } from './save'
import { BattleCutscene, type CutsceneMode, wantsCutscene } from './cutscene'

export type Assist = Record<Side, boolean>

export type GameSettings =
  | { mode: 'hotseat'; assist: Assist }
  | { mode: 'ai'; level: Level; human: Side; assist: Assist }
  | { mode: 'lesson'; lesson: Lesson }
  | { mode: 'guide'; entry: GuideEntry }
  | { mode: 'replay'; source: MatchSettings; moves: string[] }

export type PlayMode = GameSettings['mode']

export interface TeachHooks {
  lessonStep(result: StepResult, run: LessonRun): void
}

const FULL_ASSIST: Assist = { red: true, black: true }

/** Where a replay stands: `cursor` moves of `total` have been played on the board. */
export interface ReplayState {
  cursor: number
  total: number
  playing: boolean
  /** notation of the last move shown, empty at the start */
  notation: string
  /** side that made that move (red before the first move) */
  side: Side
}

const REPLAY_PAUSE_MS = 650
/** rough share of the screen height taken by the replay panel and the button bar */
const REPLAY_PANEL_INSET = 0.2

export class GameController {
  private match = new Match()
  private settings: GameSettings = { mode: 'hotseat', assist: FULL_ASSIST }
  private lesson: LessonRun | null = null
  private readonly views = new Map<number, PieceView>()
  private readonly pieceLayer = new THREE.Group()
  private selected: number | null = null
  private hintMove: Move | null = null
  private busy = false
  private thinking = false
  /** bumped on restart/undo so in-flight animations and AI answers are discarded */
  private generation = 0
  private ai: AiClient | null = null
  private readonly raycaster = new THREE.Raycaster()
  private readonly ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  private readonly cutscene: BattleCutscene
  cutsceneMode: CutsceneMode = 'all'
  teach: TeachHooks | null = null
  /** called after every change to a hotseat/AI match; null once it is over or left */
  onMatchChange: ((save: SavedMatch | null) => void) | null = null
  /** called once when a hotseat/AI match finishes, with its full move list */
  onMatchEnd: ((game: SavedMatch) => void) | null = null
  onReplayChange: ((state: ReplayState) => void) | null = null
  private replayMoves: Move[] = []
  private replayNotation: string[] = []
  private replayPlaying = false
  private replayLoopId = 0

  constructor(
    private readonly stage: Stage,
    private readonly board: Board,
    private readonly hud: Hud,
    private readonly vfx: VfxManager,
  ) {
    this.cutscene = new BattleCutscene(stage, vfx)
    stage.scene.add(board.root, this.pieceLayer)
    stage.onTick((dt, t) => {
      board.tick(t)
      for (const v of this.views.values()) v.tick(dt, t)
    })
    this.bindPointer()
    this.rebuild()
  }

  get lessonRun(): LessonRun | null {
    return this.lesson
  }

  get mode(): PlayMode {
    return this.settings.mode
  }

  newGame(settings: GameSettings): void {
    this.settings = settings
    this.replayPlaying = false
    if (settings.mode === 'ai' && !this.ai) this.ai = new AiClient()
    this.lesson = settings.mode === 'lesson' ? new LessonRun(settings.lesson) : null
    if (settings.mode === 'replay') this.loadReplay(settings.moves)
    this.hud.setMode(settings.mode)
    this.stage.setBottomInset(settings.mode === 'replay' ? REPLAY_PANEL_INSET : 0)
    this.stage.setView(this.viewFor(settings))
    this.restart()
  }

  private viewFor(s: GameSettings): 'top' | 'red' | 'black' {
    if (s.mode === 'ai') return s.human
    if (s.mode === 'replay') return s.source.mode === 'ai' ? s.source.human : 'top'
    return s.mode === 'hotseat' ? 'top' : 'red'
  }

  // ---------- replay ----------

  /** Replay the match just finished (or still on the board). */
  replayCurrent(): void {
    const s = this.settings
    if (s.mode !== 'hotseat' && s.mode !== 'ai') return
    this.newGame({ mode: 'replay', source: s, moves: this.match.history.map(moveToIccs) })
  }

  private loadReplay(moves: string[]): void {
    const check = new Match()
    this.replayMoves = []
    this.replayNotation = []
    for (const iccs of moves) {
      try {
        const move = parseMove(iccs)
        const before = check.position
        check.play(move)
        this.replayMoves.push(move)
        this.replayNotation.push(moveToChinese(before, move))
      } catch {
        break
      }
    }
  }

  get replayCursor(): number {
    return this.mode === 'replay' ? this.match.history.length : 0
  }

  /** Jump straight to the position after `n` moves, without animation. */
  replayTo(n: number): void {
    if (this.mode !== 'replay') return
    const target = Math.max(0, Math.min(this.replayMoves.length, n))
    const match = new Match()
    for (const m of this.replayMoves.slice(0, target)) match.play(m)
    this.reset(match)
    this.showCheck(false)
    this.emitReplay()
  }

  /** Animate the next move; resolves when it has landed. */
  async replayForward(): Promise<void> {
    if (this.mode !== 'replay' || this.busy) return
    const next = this.replayMoves[this.match.history.length]
    if (!next) return
    await this.perform(next, true)
    this.emitReplay()
  }

  replayBack(): void {
    this.replayPlaying = false
    this.replayTo(this.replayCursor - 1)
  }

  replayToggle(): void {
    if (this.mode !== 'replay') return
    this.replayPlaying = !this.replayPlaying
    if (this.replayPlaying && this.replayCursor >= this.replayMoves.length) this.replayTo(0)
    this.emitReplay()
    if (this.replayPlaying) void this.replayLoop()
  }

  replayPause(): void {
    this.replayPlaying = false
    this.emitReplay()
  }

  private async replayLoop(): Promise<void> {
    // a fresh loop retires any earlier one still sleeping between moves
    const id = ++this.replayLoopId
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms))
    while (id === this.replayLoopId && this.replayPlaying && this.mode === 'replay' && this.replayCursor < this.replayMoves.length) {
      if (this.busy) {
        await wait(100)
        continue
      }
      await this.replayForward()
      await wait(REPLAY_PAUSE_MS)
    }
    if (id !== this.replayLoopId) return
    this.replayPlaying = false
    this.emitReplay()
  }

  private emitReplay(): void {
    if (this.mode !== 'replay') return
    const cursor = this.replayCursor
    const last = this.replayMoves[cursor - 1]
    const mover = last ? this.match.position.board[last.to]?.side : undefined
    this.onReplayChange?.({
      cursor,
      total: this.replayMoves.length,
      playing: this.replayPlaying,
      notation: cursor ? this.replayNotation[cursor - 1] : '',
      side: mover ?? 'red',
    })
  }

  /** Continue a saved hotseat/AI match by replaying its moves without animation. */
  resume(save: SavedMatch): void {
    this.settings = save.settings
    if (save.settings.mode === 'ai' && !this.ai) this.ai = new AiClient()
    this.lesson = null
    this.hud.setMode(save.settings.mode)
    this.stage.setView(save.settings.mode === 'ai' ? save.settings.human : 'top')
    const match = new Match()
    for (const m of save.moves) {
      try {
        match.play(m)
      } catch {
        break
      }
    }
    this.reset(match)
  }

  private emitSave(): void {
    const s = this.settings
    if (!this.onMatchChange) return
    if (s.mode !== 'hotseat' && s.mode !== 'ai') return
    if (this.match.status.kind !== 'ongoing' || !this.match.history.length) return this.onMatchChange(null)
    this.onMatchChange({ version: 1, settings: s, moves: this.match.history.map(moveToIccs) })
  }

  restart(): void {
    const s = this.settings
    if (s.mode === 'lesson') {
      this.lesson!.restart()
      this.reset(new Match(s.lesson.fen))
    } else if (s.mode === 'replay') {
      this.reset(new Match())
      this.emitReplay()
    } else if (s.mode === 'guide') {
      this.reset(new Match(s.entry.fen))
      this.selected = squareIndex(s.entry.focus)
      this.refresh()
    } else {
      this.reset(new Match())
    }
  }

  undo(): void {
    if (this.mode === 'lesson' || this.mode === 'guide' || this.mode === 'replay') return
    if (!this.match.history.length || (this.busy && !this.thinking)) return
    do this.match.undo()
    while (this.match.history.length && !this.isHumanTurn())
    this.reset(this.match)
  }

  /** Whether the side to move may see legal-move dots and ask for a hint. */
  assistOn(): boolean {
    const s = this.settings
    if (s.mode === 'lesson' || s.mode === 'guide') return true
    if (s.mode === 'replay') return false
    return s.assist[this.match.position.turn]
  }

  /** Highlight a suggested move: from the lesson solution, or from the computer. */
  async hint(): Promise<void> {
    if (this.busy || !this.assistOn() || !this.isHumanTurn() || this.match.status.kind !== 'ongoing') return
    if (this.lesson) {
      this.showHint(this.lesson.hint())
      return
    }
    if (!this.ai) this.ai = new AiClient()
    const gen = this.generation
    this.busy = true
    const move = await this.ai.think(this.match.position, 'normal', this.match.repeatedPositions(), 0)
    if (gen !== this.generation) return
    this.busy = false
    this.showHint(move)
  }

  private showHint(move: Move | null): void {
    this.hintMove = move
    this.selected = move ? move.from : null
    this.refresh()
  }

  private reset(match: Match): void {
    this.generation++
    this.ai?.cancel()
    this.busy = false
    this.thinking = false
    this.match = match
    this.rebuild()
    this.updateHud()
    this.emitSave()
    void this.maybeAiTurn()
  }

  private isHumanTurn(): boolean {
    if (this.settings.mode === 'replay') return false
    return this.settings.mode !== 'ai' || this.match.position.turn === this.settings.human
  }

  private async maybeAiTurn(): Promise<void> {
    if (this.settings.mode !== 'ai' || this.isHumanTurn() || this.match.status.kind !== 'ongoing' || !this.ai) return
    const gen = this.generation
    this.busy = this.thinking = true
    this.updateHud()
    const move = await this.ai.think(this.match.position, this.settings.level, this.match.repeatedPositions())
    if (gen !== this.generation) return
    this.thinking = false
    if (move) await this.perform(move)
  }

  private rebuild(): void {
    this.cutscene.skip()
    this.vfx.clearCheck()
    this.selected = null
    this.hintMove = null
    for (const v of this.views.values()) this.pieceLayer.remove(v.root)
    this.views.clear()
    this.match.position.board.forEach((piece, square) => {
      if (!piece) return
      const view = new PieceView(piece)
      view.root.position.copy(squareToWorld(square))
      this.views.set(square, view)
      this.pieceLayer.add(view.root)
    })
    this.refresh()
  }

  private refresh(): void {
    const pos = this.match.position
    const targets =
      this.selected === null || !this.assistOn()
        ? []
        : this.match
            .legalMoves()
            .filter((m) => m.from === this.selected)
            .map((m) => ({ square: m.to, capture: !!pos.board[m.to] }))
    this.board.showMarkers(this.selected, targets, this.match.history.at(-1), this.hintMove)
    for (const [sq, v] of this.views) v.setSelected(sq === this.selected)
  }

  private updateHud(): void {
    if (this.mode === 'lesson' || this.mode === 'guide' || this.mode === 'replay') return
    const pos = this.match.position
    const ai = this.settings.mode === 'ai' ? { human: this.settings.human, thinking: this.thinking } : null
    this.hud.update({
      turn: pos.turn,
      status: this.match.status,
      inCheck: isInCheck(pos, pos.turn),
      canUndo: this.match.history.length > 0 && !(ai && this.match.history.length === 1 && ai.human === 'black'),
      canHint: this.assistOn() && this.isHumanTurn() && !this.busy,
      ai,
    })
  }

  private onSquare(square: number): void {
    if (this.busy || this.match.status.kind !== 'ongoing' || !this.isHumanTurn()) return
    const pos = this.match.position
    const piece = pos.board[square]
    if (piece && piece.side === pos.turn) {
      if (this.selected !== square) sound.play('select')
      this.hintMove = null
      this.selected = this.selected === square ? null : square
      this.refresh()
      return
    }
    if (this.selected === null) return
    const move = this.match.legalMoves().find((m) => m.from === this.selected && m.to === square)
    if (!move) {
      if (this.mode === 'guide') return
      this.hintMove = null
      this.selected = null
      this.refresh()
      return
    }
    void this.perform(move)
  }

  /** `quick` (replay) skips battle cutscenes except the mating blow. */
  private async perform(move: Move, quick = false): Promise<void> {
    const gen = this.generation
    this.busy = true
    const mover = this.views.get(move.from)!
    const victim = this.views.get(move.to)
    this.match.play(move)
    this.selected = null
    this.hintMove = null
    this.refresh()
    const status = this.match.status
    const mating = status.kind === 'checkmate'

    if (victim) {
      if (wantsCutscene(quick ? 'off' : this.cutsceneMode, mover.piece, victim.piece, mating)) {
        this.hud.showSkipHint(true)
        await this.cutscene.playCapture(mover, victim, move.from, move.to, mating)
        this.hud.showSkipHint(false)
      } else {
        await mover.moveTo(squareToWorld(move.to))
        if (gen !== this.generation) return
        sound.play('capture')
        this.vfx.capture(mover.piece.kind, squareToWorld(move.to), squareToWorld(move.to).sub(squareToWorld(move.from)), 1)
        await victim.die()
      }
      if (gen !== this.generation) return
      this.pieceLayer.remove(victim.root)
    } else if (mating) {
      const loser = this.match.position.turn
      const kingSquare = this.match.position.board.findIndex((p) => p?.kind === 'king' && p.side === loser)
      this.hud.showSkipHint(true)
      await this.cutscene.playCheckmate(mover, move.from, move.to, this.views.get(kingSquare)!, kingSquare)
      this.hud.showSkipHint(false)
    } else {
      await mover.moveTo(squareToWorld(move.to))
      sound.play('place')
    }
    if (gen !== this.generation) return
    this.views.delete(move.from)
    this.views.set(move.to, mover)
    this.busy = false
    this.afterTeachMove(move)
    this.showCheck()
    this.announceEnd()
    this.updateHud()
    this.emitSave()
    this.emitEnd()
    void this.maybeAiTurn()
  }

  private emitEnd(): void {
    const s = this.settings
    if ((s.mode !== 'hotseat' && s.mode !== 'ai') || this.match.status.kind === 'ongoing') return
    this.onMatchEnd?.({ version: 1, settings: s, moves: this.match.history.map(moveToIccs) })
  }

  /** Lessons and the guide keep the learner on the move: black never answers. */
  private afterTeachMove(move: Move): void {
    if (this.mode === 'guide') {
      this.match = new Match(toFen({ ...this.match.position, turn: 'red' }))
      this.selected = move.to
      this.refresh()
    } else if (this.lesson) {
      const result = this.lesson.play(move)
      if (result === 'continue') this.match = new Match(toFen(this.lesson.position))
      this.refresh()
      this.teach?.lessonStep(result, this.lesson)
    }
  }

  private announceEnd(): void {
    const status = this.match.status
    if (this.mode === 'lesson' || this.mode === 'guide' || status.kind === 'ongoing') return
    if (!('winner' in status)) return sound.play('draw')
    const s = this.settings
    sound.play(s.mode === 'ai' && status.winner !== s.human ? 'lose' : 'win')
  }

  private showCheck(withSound = true): void {
    const pos = this.match.position
    if (this.mode === 'lesson' || this.mode === 'guide') {
      this.vfx.clearCheck()
      return
    }
    if (this.match.status.kind !== 'ongoing' || !isInCheck(pos, pos.turn)) {
      this.vfx.clearCheck()
      return
    }
    const king = pos.board.findIndex((p) => p?.kind === 'king' && p.side === pos.turn)
    this.vfx.warnCheck(squareToWorld(king, 0.02))
    if (withSound) sound.play('check')
  }

  private bindPointer(): void {
    const canvas = this.stage.renderer.domElement
    const downs = new Map<number, { x: number; y: number }>()
    let multiTouch = false
    canvas.addEventListener('pointerdown', (e) => {
      downs.set(e.pointerId, { x: e.clientX, y: e.clientY })
      if (downs.size > 1) multiTouch = true
    })
    const end = (e: PointerEvent) => {
      const start = downs.get(e.pointerId)
      downs.delete(e.pointerId)
      const wasMulti = multiTouch
      if (downs.size === 0) multiTouch = false
      if (!start || wasMulti || e.button > 0) return
      if (this.cutscene.active) {
        this.cutscene.skip()
        return
      }
      if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 10) return
      const square = this.pick(e.clientX, e.clientY)
      if (square !== null) this.onSquare(square)
    }
    canvas.addEventListener('pointerup', end)
    canvas.addEventListener('pointercancel', (e) => downs.delete(e.pointerId))
  }

  private pick(clientX: number, clientY: number): number | null {
    const rect = this.stage.renderer.domElement.getBoundingClientRect()
    const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1)
    this.raycaster.setFromCamera(ndc, this.stage.camera)
    const hit = this.raycaster.intersectObjects([...this.views.values()].map((v) => v.root), true)[0]
    if (hit) {
      for (const [sq, v] of this.views) {
        let o: THREE.Object3D | null = hit.object
        while (o && o !== v.root) o = o.parent
        if (o) return sq
      }
    }
    const p = new THREE.Vector3()
    if (!this.raycaster.ray.intersectPlane(this.ground, p)) return null
    return worldToSquare(p.x, p.z)
  }
}
