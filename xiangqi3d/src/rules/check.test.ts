import { describe, expect, it } from 'vitest'
import { parseFen, pieceAt, toFen } from './position'
import { applyMove, isInCheck, legalMoves, moveToIccs, parseMove } from './moves'

const movesOf = (fen: string, from?: string) =>
  legalMoves(parseFen(fen))
    .map(moveToIccs)
    .filter((m) => !from || m.startsWith(from))
    .sort()

describe('applyMove', () => {
  it('moves the piece, captures, and passes the turn', () => {
    const pos = applyMove(parseFen('3k5/9/9/9/9/4p4/9/9/9/3KR4 w'), parseMove('e0e4'))
    expect(pieceAt(pos, 'e4')).toEqual({ side: 'red', kind: 'rook' })
    expect(pieceAt(pos, 'e0')).toBeNull()
    expect(pos.turn).toBe('black')
  })

  it('does not mutate the original position', () => {
    const fen = '3k5/9/9/9/9/9/9/9/9/3KR4 w'
    const pos = parseFen(fen)
    applyMove(pos, parseMove('e0e5'))
    expect(toFen(pos)).toBe(fen)
  })
})

describe('isInCheck', () => {
  it('detects a horse check and respects a blocked horse leg', () => {
    expect(isInCheck(parseFen('3k5/9/9/9/9/9/9/3n5/9/4K4 w'), 'red')).toBe(true)
    expect(isInCheck(parseFen('3k5/9/9/9/9/9/9/3n5/3A5/4K4 w'), 'red')).toBe(false)
  })

  it('treats facing kings on an open file as check', () => {
    expect(isInCheck(parseFen('4k4/9/9/9/9/9/9/9/9/4K4 w'), 'red')).toBe(true)
  })
})

describe('legal moves exclude self-check', () => {
  it('lets a pinned rook move only along the pin', () => {
    expect(movesOf('3k5/4r4/9/9/9/9/4R4/9/9/4K4 w', 'e3')).toEqual([
      'e3e1', 'e3e2', 'e3e4', 'e3e5', 'e3e6', 'e3e7', 'e3e8',
    ])
  })

  it('forbids the king from stepping onto an open file facing the other king', () => {
    expect(movesOf('4k4/9/9/9/9/9/9/9/9/3K5 w', 'd0')).toEqual(['d0d1'])
  })

  it('forbids the only blocker between the kings from leaving the file', () => {
    expect(movesOf('4k4/9/9/9/9/9/9/9/4A4/4K4 w')).toEqual(['e0d0', 'e0f0'])
  })
})
