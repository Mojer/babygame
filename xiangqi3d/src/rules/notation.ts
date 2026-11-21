import { FILES, type PieceKind, type Position, type Side } from './position'
import type { Move } from './moves'

const NAMES: Record<Side, Record<PieceKind, string>> = {
  red: { king: '帥', advisor: '仕', elephant: '相', rook: '俥', horse: '傌', cannon: '炮', pawn: '兵' },
  black: { king: '將', advisor: '士', elephant: '象', rook: '車', horse: '馬', cannon: '砲', pawn: '卒' },
}

const CN = ['一', '二', '三', '四', '五', '六', '七', '八', '九']

/** Red counts in Chinese numerals, black in Arabic digits. */
const numeral = (side: Side, n: number) => (side === 'red' ? CN[n - 1] : String(n))

/** Files are numbered 1–9 from each player's own right-hand side. */
const fileNumber = (side: Side, file: number) => (side === 'red' ? FILES - file : file + 1)

/** Pieces that move diagonally name the destination file instead of a distance. */
const DIAGONAL: PieceKind[] = ['horse', 'advisor', 'elephant']

/** Traditional notation for a move in `pos`, e.g. 炮二平五, 馬8進7, 前俥進二. */
export function moveToChinese(pos: Position, move: Move): string {
  const piece = pos.board[move.from]
  if (!piece) return ''
  const { side, kind } = piece
  const fromFile = move.from % FILES
  const fromRank = Math.floor(move.from / FILES)
  const toFile = move.to % FILES
  const toRank = Math.floor(move.to / FILES)
  const advance = side === 'red' ? toRank - fromRank : fromRank - toRank

  // same piece kind stacked on this file: name it by position (front first) instead of by file
  const stacked: number[] = []
  for (let rank = 0; rank < 10; rank++) {
    const p = pos.board[rank * FILES + fromFile]
    if (p && p.side === side && p.kind === kind) stacked.push(rank)
  }
  let head: string
  if (stacked.length >= 2) {
    const frontFirst = side === 'red' ? [...stacked].reverse() : stacked
    const labels = stacked.length === 2 ? ['前', '後'] : stacked.length === 3 ? ['前', '中', '後'] : CN
    head = labels[frontFirst.indexOf(fromRank)] + NAMES[side][kind]
  } else {
    head = NAMES[side][kind] + numeral(side, fileNumber(side, fromFile))
  }

  if (advance === 0) return `${head}平${numeral(side, fileNumber(side, toFile))}`
  const target = DIAGONAL.includes(kind) ? fileNumber(side, toFile) : Math.abs(advance)
  return `${head}${advance > 0 ? '進' : '退'}${numeral(side, target)}`
}
