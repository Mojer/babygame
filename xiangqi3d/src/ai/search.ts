import { type Piece, type PieceKind, type Position, type Side, toFen } from '../rules/position'
import { type Move, applyMove, isInCheck, legalMoves } from '../rules/moves'

export type Level = 'easy' | 'normal' | 'hard'

interface LevelConfig {
  maxDepth: number
  timeMs: number
  quiescence: boolean
  /** random score jitter added at the root; large values make the AI blunder on purpose */
  noise: number
}

const LEVELS: Record<Level, LevelConfig> = {
  easy: { maxDepth: 1, timeMs: 200, quiescence: false, noise: 60 },
  normal: { maxDepth: 3, timeMs: 1000, quiescence: true, noise: 6 },
  hard: { maxDepth: 6, timeMs: 1800, quiescence: true, noise: 0 },
}

const MATE = 100_000
const VALUE: Record<PieceKind, number> = {
  king: 0, advisor: 20, elephant: 20, horse: 45, rook: 90, cannon: 46, pawn: 10,
}

/** rank counted from the piece owner's back rank (0–9) */
const relRank = (side: Side, index: number) => (side === 'red' ? Math.floor(index / 9) : 9 - Math.floor(index / 9))
const centrality = (index: number) => 4 - Math.abs((index % 9) - 4)

function positional(p: Piece, index: number): number {
  const rr = relRank(p.side, index)
  const c = centrality(index)
  switch (p.kind) {
    case 'pawn':
      if (rr < 5) return 0
      return rr >= 9 ? 6 : 12 + (rr - 5) * 3 + c * 2
    case 'horse':
      return c * 2 + Math.min(rr, 6) * 1.5
    case 'cannon':
      return (index % 9 === 4 ? 4 : 0) + c
    case 'rook':
      return c + (rr >= 5 ? 4 : 0)
    default:
      return 0
  }
}

function evaluate(pos: Position): number {
  let score = 0
  pos.board.forEach((p, i) => {
    if (!p) return
    const v = VALUE[p.kind] + positional(p, i)
    score += p.side === pos.turn ? v : -v
  })
  return score
}

function ordered(pos: Position, moves: Move[], first?: Move): Move[] {
  const key = (m: Move) => {
    if (first && m.from === first.from && m.to === first.to) return 1e6
    const victim = pos.board[m.to]
    return victim ? VALUE[victim.kind] * 10 - VALUE[pos.board[m.from]!.kind] : 0
  }
  return moves.map((m) => [key(m), m] as const).sort((a, b) => b[0] - a[0]).map(([, m]) => m)
}

class Timeout extends Error {}

class Searcher {
  private nodes = 0

  constructor(
    private readonly cfg: LevelConfig,
    private readonly deadline: number,
  ) {}

  private tick(): void {
    if ((++this.nodes & 1023) === 0 && performance.now() > this.deadline) throw new Timeout()
  }

  quiesce(pos: Position, alpha: number, beta: number, ply: number, qdepth: number): number {
    this.tick()
    const moves = legalMoves(pos)
    if (moves.length === 0) return -MATE + ply
    const standPat = evaluate(pos)
    if (qdepth <= 0) return standPat
    if (standPat >= beta) return standPat
    if (standPat > alpha) alpha = standPat
    for (const m of ordered(pos, moves.filter((mv) => pos.board[mv.to]))) {
      const score = -this.quiesce(applyMove(pos, m), -beta, -alpha, ply + 1, qdepth - 1)
      if (score >= beta) return score
      if (score > alpha) alpha = score
    }
    return alpha
  }

  negamax(pos: Position, depth: number, alpha: number, beta: number, ply: number): number {
    this.tick()
    if (depth <= 0) {
      if (this.cfg.quiescence) return this.quiesce(pos, alpha, beta, ply, 4)
      return legalMoves(pos).length === 0 ? -MATE + ply : evaluate(pos)
    }
    const moves = legalMoves(pos)
    // no legal move loses in xiangqi, whether checkmated or stalemated
    if (moves.length === 0) return -MATE + ply
    const extend = isInCheck(pos, pos.turn) ? 1 : 0
    let best = -Infinity
    for (const m of ordered(pos, moves)) {
      const score = -this.negamax(applyMove(pos, m), depth - 1 + extend, -beta, -alpha, ply + 1)
      if (score > best) best = score
      if (score > alpha) alpha = score
      if (alpha >= beta) break
    }
    return best
  }

  root(pos: Position, moves: Move[], depth: number, pv: Move | undefined): { move: Move; score: number }[] {
    const results: { move: Move; score: number }[] = []
    let alpha = -Infinity
    for (const m of ordered(pos, moves, pv)) {
      // full window when noise is used so every root score is exact enough to compare
      const lower = this.cfg.noise ? -Infinity : alpha
      const score = -this.negamax(applyMove(pos, m), depth - 1, -Infinity, -lower, 1)
      results.push({ move: m, score })
      if (score > alpha) alpha = score
    }
    return results
  }
}

export interface ChooseOptions {
  rng?: () => number
  /** positions (FEN) that have already occurred twice; reaching one again ends the match */
  repeated?: ReadonlySet<string>
}

export function chooseMove(pos: Position, level: Level, opts: ChooseOptions = {}): Move | null {
  const rng = opts.rng ?? Math.random
  const moves = legalMoves(pos)
  if (moves.length === 0) return null
  if (moves.length === 1) return moves[0]
  const cfg = LEVELS[level]
  const searcher = new Searcher(cfg, performance.now() + cfg.timeMs)

  let scored: { move: Move; score: number }[] | null = null
  for (let depth = 1; depth <= cfg.maxDepth; depth++) {
    try {
      const pv: Move | undefined = scored ? best(scored).move : undefined
      scored = searcher.root(pos, moves, depth, pv)
      if (best(scored).score >= MATE - 100) break
    } catch (e) {
      if (!(e instanceof Timeout)) throw e
      break
    }
  }
  if (!scored) scored = moves.map((move) => ({ move, score: 0 }))
  if (opts.repeated?.size) scored = scored.map((s) => repetitionScore(pos, s, opts.repeated!))

  if (!cfg.noise) return best(scored).move
  // never throw away a forced mate, even on easy
  const mating = scored.find((s) => s.score >= MATE - 100)
  if (mating) return mating.move
  return best(scored.map((s) => ({ move: s.move, score: s.score + (rng() - 0.5) * 2 * cfg.noise }))).move
}

/** A third repetition is a loss for the side giving perpetual check, otherwise a draw. */
function repetitionScore(pos: Position, s: { move: Move; score: number }, repeated: ReadonlySet<string>) {
  const next = applyMove(pos, s.move)
  if (!repeated.has(toFen(next))) return s
  return { move: s.move, score: isInCheck(next, next.turn) ? -MATE / 2 : 0 }
}

function best<T extends { score: number }>(xs: T[]): T {
  return xs.reduce((a, b) => (b.score > a.score ? b : a))
}
