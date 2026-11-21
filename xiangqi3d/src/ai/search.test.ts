import { describe, expect, it } from 'vitest'
import { START_FEN, parseFen, toFen } from '../rules/position'
import { applyMove, isInCheck, legalMoves, moveToIccs, parseMove } from '../rules/moves'
import { chooseMove } from './search'

const best = (fen: string, level: 'easy' | 'normal' | 'hard') => {
  const move = chooseMove(parseFen(fen), level)
  return move && moveToIccs(move)
}

describe('chooseMove', () => {
  it.each(['normal', 'hard'] as const)('finds a mate in one (%s)', (level) => {
    expect(best('4k4/1R7/9/9/9/9/9/9/9/R2K5 w', level)).toBe('a0a9')
  })

  it.each(['normal', 'hard'] as const)('captures an unprotected rook (%s)', (level) => {
    expect(best('4k4/9/9/9/r8/9/9/9/9/R2K5 w', level)).toBe('a0a5')
  })

  it.each(['normal', 'hard'] as const)('refuses a bait capture that allows mate in one (%s)', (level) => {
    const pos = parseFen('3k4r/9/9/9/9/9/2n5R/9/r8/4K4 w')
    const after = applyMove(pos, chooseMove(pos, level)!)
    const mateReplies = legalMoves(after).filter((reply) => {
      const next = applyMove(after, reply)
      return legalMoves(next).length === 0 && isInCheck(next, next.turn)
    })
    expect(mateReplies.map(moveToIccs)).toEqual([])
  })

  it('always returns a legal move on easy', () => {
    const pos = parseFen(START_FEN)
    for (let i = 0; i < 20; i++) {
      const move = chooseMove(pos, 'easy')!
      expect(legalMoves(pos).map(moveToIccs)).toContain(moveToIccs(move))
    }
  })

  it('returns null when there is no legal move', () => {
    expect(chooseMove(parseFen('R3k4/1R7/9/9/9/9/9/9/9/3K5 b'), 'normal')).toBeNull()
  })

  it.each(['normal', 'hard'] as const)('answers the opening within 3 seconds (%s)', (level) => {
    const started = performance.now()
    chooseMove(parseFen(START_FEN), level)
    expect(performance.now() - started).toBeLessThan(3000)
  })

  it('finds a quiet move that forces mate in two (hard)', () => {
    const pos = parseFen('4k4/9/9/9/9/9/1R7/R8/9/3K5 w')
    const after = applyMove(pos, chooseMove(pos, 'hard')!)
    const replies = legalMoves(after)
    const forcedMate = replies.every((reply) => {
      const next = applyMove(after, reply)
      return legalMoves(next).some((finish) => {
        const end = applyMove(next, finish)
        return legalMoves(end).length === 0
      })
    })
    expect(forcedMate || replies.length === 0).toBe(true)
  })

  it('varies its opening choice on easy so children can win', () => {
    const pos = parseFen(START_FEN)
    const picks = new Set(Array.from({ length: 20 }, () => moveToIccs(chooseMove(pos, 'easy')!)))
    expect(picks.size).toBeGreaterThanOrEqual(3)
  })

  it('wins material with a skewering check when the position is fresh', () => {
    expect(best('3k4r/9/9/9/9/9/9/9/9/R4K3 w', 'normal')).toBe('a0a9')
  })

  it('avoids a check that would repeat the position a third time (長將判負)', () => {
    const pos = parseFen('3k4r/9/9/9/9/9/9/9/9/R4K3 w')
    const repeated = new Set([toFen(applyMove(pos, parseMove('a0a9')))])
    expect(moveToIccs(chooseMove(pos, 'normal', { repeated })!)).not.toBe('a0a9')
  })
})
