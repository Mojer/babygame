import * as THREE from 'three'
import { Match } from '../rules/match'
import { type Move, isInCheck } from '../rules/moves'
import { Board, squareToWorld, worldToSquare } from '../render/board'
import { PieceView } from '../render/pieces'
import type { Stage } from '../render/stage'
import type { Hud } from '../ui/hud'

export class GameController {
  private match = new Match()
  private readonly views = new Map<number, PieceView>()
  private readonly pieceLayer = new THREE.Group()
  private selected: number | null = null
  private busy = false
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

  restart(): void {
    this.match = new Match()
    this.rebuild()
    this.updateHud()
  }

  undo(): void {
    if (this.busy || !this.match.history.length) return
    this.match.undo()
    this.rebuild()
    this.updateHud()
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
    this.hud.update(pos.turn, this.match.status, isInCheck(pos, pos.turn), this.match.history.length > 0)
  }

  private onSquare(square: number): void {
    if (this.busy || this.match.status.kind !== 'ongoing') return
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
    this.busy = true
    const mover = this.views.get(move.from)!
    const victim = this.views.get(move.to)
    this.match.play(move)
    this.selected = null
    this.refresh()

    await mover.moveTo(squareToWorld(move.to))
    if (victim) {
      await victim.die()
      this.pieceLayer.remove(victim.root)
    }
    this.views.delete(move.from)
    this.views.set(move.to, mover)
    this.busy = false
    this.updateHud()
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

  start(): void {
    this.updateHud()
  }
}
