import { describe, expect, it } from 'vitest'
import { type Position, START_FEN, parseFen } from './position'
import { applyMove, legalMoves } from './moves'

function perft(pos: Position, depth: number): number {
  if (depth === 0) return 1
  const moves = legalMoves(pos)
  if (depth === 1) return moves.length
  return moves.reduce((n, m) => n + perft(applyMove(pos, m), depth - 1), 0)
}

describe('perft from the starting position (published reference counts)', () => {
  it.each([
    [1, 44],
    [2, 1920],
    [3, 79666],
  ])('depth %i = %i', (depth, nodes) => {
    expect(perft(parseFen(START_FEN), depth)).toBe(nodes)
  })

  it.runIf(process.env.PERFT_DEEP)('depth 4 = 3290240', () => {
    expect(perft(parseFen(START_FEN), 4)).toBe(3290240)
  }, 600_000)
})
