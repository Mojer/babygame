import { describe, expect, it } from 'vitest'
import { START_FEN, toFen } from './position'
import { Match } from './match'

const playAll = (match: Match, moves: string) => moves.split(' ').forEach((m) => match.play(m))

describe('Match', () => {
  it('starts ongoing from the standard position with red to move', () => {
    const match = new Match()
    expect(match.status).toEqual({ kind: 'ongoing' })
    expect(toFen(match.position)).toBe(START_FEN)
  })

  it('ends in checkmate when the side to move has no escape from check', () => {
    const match = new Match('4k4/1R7/9/9/9/9/9/9/9/R2K5 w')
    match.play('a0a9')
    expect(match.status).toEqual({ kind: 'checkmate', winner: 'red' })
  })

  it('awards the win to the stalemating side (困斃)', () => {
    const match = new Match('4k4/9/7R1/9/9/9/9/9/5R3/3K5 w')
    match.play('h7h8')
    expect(match.status).toEqual({ kind: 'stalemate', winner: 'red' })
  })

  it('rejects illegal moves and moves after the match is over', () => {
    const match = new Match()
    expect(() => match.play('a0a5')).toThrow()
    const mated = new Match('4k4/1R7/9/9/9/9/9/9/9/R2K5 w')
    mated.play('a0a9')
    expect(() => mated.play('e9d9')).toThrow()
  })

  it('undoes the last move, including a finished match', () => {
    const match = new Match('4k4/1R7/9/9/9/9/9/9/9/R2K5 w')
    match.play('a0a9')
    match.undo()
    expect(toFen(match.position)).toBe('4k4/1R7/9/9/9/9/9/9/9/R2K5 w')
    expect(match.status).toEqual({ kind: 'ongoing' })
  })

  it('draws when the same position occurs a third time without perpetual check', () => {
    const match = new Match('3k4r/9/9/9/9/9/9/9/9/R3K4 w')
    playAll(match, 'a0a1 i9i8 a1a0 i8i9 a0a1 i9i8 a1a0')
    expect(match.status).toEqual({ kind: 'ongoing' })
    match.play('i8i9')
    expect(match.status).toEqual({ kind: 'repetition-draw' })
  })

  it('makes the side giving perpetual check lose (長將判負)', () => {
    const match = new Match('4k4/7R1/9/9/9/9/9/9/9/3K5 w')
    playAll(match, 'h8h9 e9e8 h9h8 e8e9 h8h9 e9e8 h9h8 e8e9')
    expect(match.status).toEqual({ kind: 'perpetual-check', winner: 'black' })
  })
})
