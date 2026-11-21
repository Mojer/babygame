import { describe, expect, it } from 'vitest'
import { START_FEN, parseFen, pieceAt, toFen } from './position'

describe('FEN', () => {
  it('round-trips the starting position', () => {
    expect(toFen(parseFen(START_FEN))).toBe(START_FEN)
  })

  it('places red rook on a0 and black king on e9, red to move', () => {
    const pos = parseFen(START_FEN)
    expect(pieceAt(pos, 'a0')).toEqual({ side: 'red', kind: 'rook' })
    expect(pieceAt(pos, 'e9')).toEqual({ side: 'black', kind: 'king' })
    expect(pieceAt(pos, 'e1')).toBeNull()
    expect(pos.turn).toBe('red')
  })
})
