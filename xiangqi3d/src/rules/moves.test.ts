import { describe, expect, it } from 'vitest'
import { START_FEN, parseFen } from './position'
import { legalMoves, moveToIccs } from './moves'

const movesOf = (fen: string, from?: string) =>
  legalMoves(parseFen(fen))
    .map(moveToIccs)
    .filter((m) => !from || m.startsWith(from))
    .sort()

describe('legalMoves', () => {
  it('gives red 44 moves in the starting position', () => {
    expect(legalMoves(parseFen(START_FEN))).toHaveLength(44)
  })

  it('blocks a horse whose leg is occupied', () => {
    expect(movesOf('4k4/9/9/9/9/9/9/4P4/4N4/3K5 w', 'e1')).toEqual(['e1c0', 'e1c2', 'e1g0', 'e1g2'])
  })

  it('keeps an elephant on its own side of the river', () => {
    expect(movesOf('4k4/9/9/9/9/2B6/9/9/9/3K5 w', 'c4')).toEqual(['c4a2', 'c4e2'])
  })

  it('blocks an elephant whose eye is occupied', () => {
    expect(movesOf('4k4/9/9/9/9/9/9/9/3P5/2BK5 w', 'c0')).toEqual(['c0a2'])
  })

  it('lets a cannon slide freely but capture only over exactly one screen', () => {
    expect(movesOf('4k4/9/1p7/9/1p7/9/9/1C7/9/3K5 w', 'b2')).toEqual([
      'b2a2', 'b2b0', 'b2b1', 'b2b3', 'b2b4', 'b2b7',
      'b2c2', 'b2d2', 'b2e2', 'b2f2', 'b2g2', 'b2h2', 'b2i2',
    ])
  })

  it('moves a pawn only forward before the river and also sideways after', () => {
    expect(movesOf('4k4/9/9/9/9/9/2P6/9/9/3K5 w', 'c3')).toEqual(['c3c4'])
    expect(movesOf('4k4/9/9/9/2P6/9/9/9/9/3K5 w', 'c5')).toEqual(['c5b5', 'c5c6', 'c5d5'])
  })

  it('keeps king and advisor inside the palace', () => {
    expect(movesOf('4k4/9/9/9/9/9/9/9/9/3KA4 w', 'd0')).toEqual(['d0d1'])
    expect(movesOf('4k4/9/9/9/9/9/9/9/9/3KA4 w', 'e0')).toEqual(['e0d1', 'e0f1'])
  })
})
