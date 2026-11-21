import * as THREE from 'three'
import { AiClient } from '../ai/client'
import type { Level } from '../ai/search'
import { Match } from '../rules/match'
import { type Move, isInCheck } from '../rules/moves'
import type { Side } from '../rules/position'
import { Board, squareToWorld, worldToSquare } from '../render/board'
import { PieceView } from '../render/pieces'
import type { Stage } from '../render/stage'
import type { Hud } from '../ui/hud'

export type GameSettings = { mode: 'hotseat' } | { mode: 'ai'; level: Level; human: Side }

export class GameController {
  private match = new Match()
  private settings: GameSettings = { mode: 'hotseat' }
  private readonly views = new Map<number, PieceView>()
  private readonly pieceLayer = new THREE.Group()
  private selected: number | null = null
  private busy = false
  private thinking = false
  /** bumped on restart/undo so in-flight animations and AI answers are discarded */
  private generation = 0
  private ai: AiClient | null = null
  private readonly raycaster = new THREE.Raycaster()
  private readonly ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)

  constructor(
    private readonly stage: Stage,
    private readonly board: Board,
    private readonly hud: Hud,
  ) {
    stage.scene.add(board.root, this.pieceLayer)
    stage.onTick((dt, t) => {
      board.tick(t)
      for (const v of this.views.values()) v.tick(dt, t)
    })
    this.bindPointer()
    this.rebuild()
  }

  newGame(settings: GameSettings): void {
    this.settings = settings
    if (settings.mode === 'ai' && !this.ai) this.ai = new AiClient()
    this.stage.setView(settings.mode === 'ai' ? settings.human : 'top')
    this.restart()
  }

  restart(): void {
    this.reset(new Match())
  }

  undo(): void {
    if (!this.match.history.length || (this.busy && !this.thinking)) return
    do this.match.undo()
    while (this.match.history.length && !this.isHumanTurn())
    this.reset(this.match)
  }

  private reset(match: Match): void {
    this.generation++
    this.ai?.cancel()
    this.busy = false
    this.thinking = false
    this.match = match
    this.rebuild()
    this.updateHud()
    void this.maybeAiTurn()
  }

  private isHumanTurn(): boolean {
    return this.settings.mode === 'hotseat' || this.match.position.turn === this.settings.human
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
    this.selected = null
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
      this.selected === null
        ? []
        : this.match
            .legalMoves()
            .filter((m) => m.from === this.selected)
            .map((m) => ({ square: m.to, capture: !!pos.board[m.to] }))
    this.board.showMarkers(this.selected, targets, this.match.history.at(-1))
    for (const [sq, v] of this.views) v.setSelected(sq === this.selected)
  }

  private updateHud(): void {
    const pos = this.match.position
    const ai = this.settings.mode === 'ai' ? { human: this.settings.human, thinking: this.thinking } : null
    this.hud.update({
      turn: pos.turn,
      status: this.match.status,
      inCheck: isInCheck(pos, pos.turn),
      canUndo: this.match.history.length > 0 && !(ai && this.match.history.length === 1 && ai.human === 'black'),
      ai,
    })
  }

  private onSquare(square: number): void {
    if (this.busy || this.match.status.kind !== 'ongoing' || !this.isHumanTurn()) return
    const pos = this.match.position
    const piece = pos.board[square]
    if (piece && piece.side === pos.turn) {
      this.selected = this.selected === square ? null : square
      this.refresh()
      return
    }
    if (this.selected === null) return
    const move = this.match.legalMoves().find((m) => m.from === this.selected && m.to === square)
    if (!move) {
      this.selected = null
      this.refresh()
      return
    }
    void this.perform(move)
  }

  private async perform(move: Move): Promise<void> {
    const gen = this.generation
    this.busy = true
    const mover = this.views.get(move.from)!
    const victim = this.views.get(move.to)
    this.match.play(move)
    this.selected = null
    this.refresh()

    await mover.moveTo(squareToWorld(move.to))
    if (gen !== this.generation) return
    if (victim) {
      await victim.die()
      if (gen !== this.generation) return
      this.pieceLayer.remove(victim.root)
    }
    this.views.delete(move.from)
    this.views.set(move.to, mover)
    this.busy = false
    this.updateHud()
    void this.maybeAiTurn()
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
