export type Side = 'red' | 'black'
export type PieceKind = 'king' | 'advisor' | 'elephant' | 'rook' | 'horse' | 'cannon' | 'pawn'

export interface Piece {
  side: Side
  kind: PieceKind
}

/** ICCS square name: file a–i from red's left, rank 0–9 from red's back rank, e.g. "e0". */
export type SquareName = string

export interface Position {
  /** index = rank * 9 + file */
  readonly board: readonly (Piece | null)[]
  readonly turn: Side
}

export const FILES = 9
export const RANKS = 10

export const START_FEN = 'rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w'

const KIND_BY_LETTER: Record<string, PieceKind> = {
  k: 'king', a: 'advisor', b: 'elephant', e: 'elephant',
  r: 'rook', n: 'horse', h: 'horse', c: 'cannon', p: 'pawn',
}
const LETTER_BY_KIND: Record<PieceKind, string> = {
  king: 'k', advisor: 'a', elephant: 'b', rook: 'r', horse: 'n', cannon: 'c', pawn: 'p',
}

export function squareIndex(name: SquareName): number {
  const file = name.charCodeAt(0) - 97
  const rank = Number(name.slice(1))
  if (!(file >= 0 && file < FILES && rank >= 0 && rank < RANKS) || name.length !== 2) {
    throw new Error(`Invalid square: ${name}`)
  }
  return rank * FILES + file
}

export function squareName(index: number): SquareName {
  return String.fromCharCode(97 + (index % FILES)) + Math.floor(index / FILES)
}

export function pieceAt(pos: Position, square: SquareName): Piece | null {
  return pos.board[squareIndex(square)]
}

export function parseFen(fen: string): Position {
  const [placement, sideField = 'w'] = fen.trim().split(/\s+/)
  const rows = placement.split('/')
  if (rows.length !== RANKS) throw new Error(`FEN needs ${RANKS} ranks: ${fen}`)
  const board: (Piece | null)[] = new Array(FILES * RANKS).fill(null)
  rows.forEach((row, i) => {
    const rank = RANKS - 1 - i
    let file = 0
    for (const ch of row) {
      if (/\d/.test(ch)) {
        file += Number(ch)
        continue
      }
      const kind = KIND_BY_LETTER[ch.toLowerCase()]
      if (!kind || file >= FILES) throw new Error(`Bad FEN rank "${row}"`)
      board[rank * FILES + file] = { side: ch === ch.toUpperCase() ? 'red' : 'black', kind }
      file++
    }
    if (file !== FILES) throw new Error(`Bad FEN rank "${row}"`)
  })
  const turn: Side = sideField === 'b' ? 'black' : 'red'
  return { board, turn }
}

export function toFen(pos: Position): string {
  const rows: string[] = []
  for (let rank = RANKS - 1; rank >= 0; rank--) {
    let row = ''
    let empty = 0
    for (let file = 0; file < FILES; file++) {
      const p = pos.board[rank * FILES + file]
      if (!p) {
        empty++
        continue
      }
      if (empty) row += empty
      empty = 0
      const letter = LETTER_BY_KIND[p.kind]
      row += p.side === 'red' ? letter.toUpperCase() : letter
    }
    if (empty) row += empty
    rows.push(row)
  }
  return `${rows.join('/')} ${pos.turn === 'red' ? 'w' : 'b'}`
}
