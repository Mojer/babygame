import { type Position, type Side, START_FEN, parseFen, toFen } from './position'
import { type Move, applyMove, isInCheck, legalMoves, moveToIccs, parseMove } from './moves'

export type MatchStatus =
  | { kind: 'ongoing' }
  | { kind: 'checkmate'; winner: Side }
  | { kind: 'stalemate'; winner: Side }
  | { kind: 'perpetual-check'; winner: Side }
  | { kind: 'repetition-draw' }

interface Ply {
  move: Move
  mover: Side
  givesCheck: boolean
  /** position after the move */
  position: Position
  key: string
}

const REPETITION_LIMIT = 3
const other = (side: Side): Side => (side === 'red' ? 'black' : 'red')

export class Match {
  private readonly start: Position
  private readonly plies: Ply[] = []
  private cachedStatus: MatchStatus

  constructor(fen: string = START_FEN) {
    this.start = parseFen(fen)
    this.cachedStatus = this.evaluate()
  }

  get position(): Position {
    return this.plies.at(-1)?.position ?? this.start
  }

  get status(): MatchStatus {
    return this.cachedStatus
  }

  get history(): readonly Move[] {
    return this.plies.map((p) => p.move)
  }

  legalMoves(): Move[] {
    return this.cachedStatus.kind === 'ongoing' ? legalMoves(this.position) : []
  }

  play(move: Move | string): void {
    const m = typeof move === 'string' ? parseMove(move) : move
    if (this.cachedStatus.kind !== 'ongoing') throw new Error('Match is over')
    const legal = legalMoves(this.position).some((l) => l.from === m.from && l.to === m.to)
    if (!legal) throw new Error(`Illegal move: ${moveToIccs(m)}`)
    const mover = this.position.turn
    const position = applyMove(this.position, m)
    this.plies.push({ move: m, mover, givesCheck: isInCheck(position, other(mover)), position, key: toFen(position) })
    this.cachedStatus = this.evaluate()
  }

  undo(): void {
    if (!this.plies.length) return
    this.plies.pop()
    this.cachedStatus = this.evaluate()
  }

  private evaluate(): MatchStatus {
    const pos = this.position
    if (legalMoves(pos).length === 0) {
      const winner = other(pos.turn)
      return isInCheck(pos, pos.turn) ? { kind: 'checkmate', winner } : { kind: 'stalemate', winner }
    }
    return this.repetitionStatus()
  }

  private repetitionStatus(): MatchStatus {
    const last = this.plies.at(-1)
    if (!last) return { kind: 'ongoing' }
    const keys = [toFen(this.start), ...this.plies.map((p) => p.key)]
    const occurrences = keys.flatMap((k, i) => (k === last.key ? [i] : []))
    if (occurrences.length < REPETITION_LIMIT) return { kind: 'ongoing' }

    // plies[i - 1] produced keys[i]; the cycle is every ply after the first occurrence
    const cycle = this.plies.slice(occurrences[0])
    const alwaysChecks = (side: Side) =>
      cycle.filter((p) => p.mover === side).every((p) => p.givesCheck)
    const redPerpetual = alwaysChecks('red')
    const blackPerpetual = alwaysChecks('black')
    if (redPerpetual && !blackPerpetual) return { kind: 'perpetual-check', winner: 'black' }
    if (blackPerpetual && !redPerpetual) return { kind: 'perpetual-check', winner: 'red' }
    return { kind: 'repetition-draw' }
  }
}
