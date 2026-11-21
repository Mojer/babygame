import { type Position, toFen } from '../rules/position'
import { type Move, parseMove } from '../rules/moves'
import type { Level } from './search'
import type { ThinkRequest, ThinkResponse } from './worker'

/** Runs the search off the main thread; stale answers (after undo/restart) are dropped. */
export class AiClient {
  private readonly worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
  private nextId = 1
  private pending = new Map<number, (move: Move | null) => void>()

  constructor() {
    this.worker.onmessage = (e: MessageEvent<ThinkResponse>) => {
      const resolve = this.pending.get(e.data.id)
      this.pending.delete(e.data.id)
      resolve?.(e.data.move ? parseMove(e.data.move) : null)
    }
  }

  async think(pos: Position, level: Level, repeated: Iterable<string>, minMs = 600): Promise<Move | null> {
    const id = this.nextId++
    const request: ThinkRequest = { id, fen: toFen(pos), level, repeated: [...repeated] }
    const answer = new Promise<Move | null>((resolve) => this.pending.set(id, resolve))
    this.worker.postMessage(request)
    const [move] = await Promise.all([answer, new Promise((r) => setTimeout(r, minMs))])
    return move
  }

  /** Forget in-flight requests so their answers are ignored. */
  cancel(): void {
    for (const resolve of this.pending.values()) resolve(null)
    this.pending.clear()
  }
}
