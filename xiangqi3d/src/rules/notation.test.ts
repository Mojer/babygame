import { describe, expect, it } from 'vitest'
import { START_FEN, parseFen } from './position'
import { parseMove } from './moves'
import { moveToChinese } from './notation'

const say = (fen: string, iccs: string) => moveToChinese(parseFen(fen), parseMove(iccs))
const BLACK_START = START_FEN.replace(' w', ' b')

describe('moveToChinese', () => {
  it('names red files right to left in Chinese numerals', () => {
    expect(say(START_FEN, 'h2e2')).toBe('炮二平五')
    expect(say(START_FEN, 'a0a1')).toBe('俥九進一')
  })

  it('gives the destination file for diagonal movers', () => {
    expect(say(START_FEN, 'h0g2')).toBe('傌二進三')
    expect(say(START_FEN, 'f0e1')).toBe('仕四進五')
  })

  it('names black files from black’s right in Arabic digits', () => {
    expect(say(BLACK_START, 'h9g7')).toBe('馬8進7')
    expect(say(BLACK_START, 'b7e7')).toBe('砲2平5')
    expect(say(BLACK_START, 'c6c5')).toBe('卒3進1')
  })

  it('counts ranks for a straight retreat', () => {
    expect(say('4k4/9/9/9/R8/9/9/9/9/3K5 w', 'a5a3')).toBe('俥九退二')
  })

  it('marks front and rear when two of the same piece share a file', () => {
    const fen = '4k4/9/9/9/9/R8/9/9/9/R2K5 w'
    expect(say(fen, 'a4a6')).toBe('前俥進二')
    expect(say(fen, 'a0a2')).toBe('後俥進二')
  })
})
