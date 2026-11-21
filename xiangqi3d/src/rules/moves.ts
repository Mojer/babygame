import { FILES, RANKS, type Position, type Side, squareIndex, squareName } from './position'

/** Squares are board indices (rank * 9 + file). */
export interface Move {
  from: number
  to: number
}

const fileOf = (i: number) => i % FILES
const rankOf = (i: number) => Math.floor(i / FILES)
const onBoard = (file: number, rank: number) => file >= 0 && file < FILES && rank >= 0 && rank < RANKS
const at = (file: number, rank: number) => rank * FILES + file

const inPalace = (side: Side, file: number, rank: number) =>
  file >= 3 && file <= 5 && (side === 'red' ? rank <= 2 : rank >= 7)
const onOwnSide = (side: Side, rank: number) => (side === 'red' ? rank <= 4 : rank >= 5)
const forward = (side: Side) => (side === 'red' ? 1 : -1)

const ORTHOGONAL = [[1, 0], [-1, 0], [0, 1], [0, -1]] as const
const DIAGONAL = [[1, 1], [1, -1], [-1, 1], [-1, -1]] as const

export function moveToIccs(move: Move): string {
  return squareName(move.from) + squareName(move.to)
}

export function parseMove(iccs: string): Move {
  return { from: squareIndex(iccs.slice(0, 2)), to: squareIndex(iccs.slice(2, 4)) }
}

function pseudoMovesFrom(pos: Position, from: number, out: Move[]): void {
  const piece = pos.board[from]
  if (!piece) return
  const { side } = piece
  const f = fileOf(from)
  const r = rankOf(from)
  const canLand = (file: number, rank: number) => {
    const target = pos.board[at(file, rank)]
    return !target || target.side !== side
  }
  const push = (file: number, rank: number) => {
    if (onBoard(file, rank) && canLand(file, rank)) out.push({ from, to: at(file, rank) })
  }

  switch (piece.kind) {
    case 'king':
      for (const [df, dr] of ORTHOGONAL) if (inPalace(side, f + df, r + dr)) push(f + df, r + dr)
      break
    case 'advisor':
      for (const [df, dr] of DIAGONAL) if (inPalace(side, f + df, r + dr)) push(f + df, r + dr)
      break
    case 'elephant':
      for (const [df, dr] of DIAGONAL) {
        const tf = f + 2 * df
        const tr = r + 2 * dr
        if (onBoard(tf, tr) && onOwnSide(side, tr) && !pos.board[at(f + df, r + dr)]) push(tf, tr)
      }
      break
    case 'horse':
      for (const [df, dr] of ORTHOGONAL) {
        if (!onBoard(f + df, r + dr) || pos.board[at(f + df, r + dr)]) continue
        // leg is clear: step one more orthogonally then one sideways
        const sides = df === 0 ? [[1, 0], [-1, 0]] : [[0, 1], [0, -1]]
        for (const [sf, sr] of sides) push(f + 2 * df + sf, r + 2 * dr + sr)
      }
      break
    case 'rook':
      for (const [df, dr] of ORTHOGONAL) {
        for (let tf = f + df, tr = r + dr; onBoard(tf, tr); tf += df, tr += dr) {
          const target = pos.board[at(tf, tr)]
          if (!target || target.side !== side) out.push({ from, to: at(tf, tr) })
          if (target) break
        }
      }
      break
    case 'cannon':
      for (const [df, dr] of ORTHOGONAL) {
        let screened = false
        for (let tf = f + df, tr = r + dr; onBoard(tf, tr); tf += df, tr += dr) {
          const target = pos.board[at(tf, tr)]
          if (!screened) {
            if (target) screened = true
            else out.push({ from, to: at(tf, tr) })
          } else if (target) {
            if (target.side !== side) out.push({ from, to: at(tf, tr) })
            break
          }
        }
      }
      break
    case 'pawn': {
      push(f, r + forward(side))
      if (!onOwnSide(side, r)) {
        push(f - 1, r)
        push(f + 1, r)
      }
      break
    }
  }
}

function pseudoLegalMoves(pos: Position): Move[] {
  const out: Move[] = []
  pos.board.forEach((p, i) => {
    if (p && p.side === pos.turn) pseudoMovesFrom(pos, i, out)
  })
  return out
}

export function applyMove(pos: Position, move: Move): Position {
  const board = pos.board.slice()
  board[move.to] = board[move.from]
  board[move.from] = null
  return { board, turn: pos.turn === 'red' ? 'black' : 'red' }
}

function kingSquare(pos: Position, side: Side): number {
  for (let i = 0; i < pos.board.length; i++) {
    const p = pos.board[i]
    if (p && p.kind === 'king' && p.side === side) return i
  }
  return -1
}

/** Looks outward from the king for every way an enemy piece (or the facing king) could reach it. */
export function isInCheck(pos: Position, side: Side): boolean {
  const king = kingSquare(pos, side)
  if (king < 0) return false
  const b = pos.board
  const kf = fileOf(king)
  const kr = rankOf(king)
  const isEnemy = (file: number, rank: number, kind: string) => {
    if (!onBoard(file, rank)) return false
    const p = b[at(file, rank)]
    return !!p && p.side !== side && p.kind === kind
  }

  for (const [df, dr] of ORTHOGONAL) {
    let seen = 0
    for (let f = kf + df, r = kr + dr; onBoard(f, r); f += df, r += dr) {
      const p = b[at(f, r)]
      if (!p) continue
      seen++
      if (seen === 1) {
        if (p.side !== side && (p.kind === 'rook' || (p.kind === 'king' && df === 0))) return true
      } else {
        if (p.side !== side && p.kind === 'cannon') return true
        break
      }
    }
  }

  for (const [df, dr] of [[1, 2], [-1, 2], [1, -2], [-1, -2], [2, 1], [2, -1], [-2, 1], [-2, -1]] as const) {
    if (!isEnemy(kf + df, kr + dr, 'horse')) continue
    const legF = Math.abs(df) === 2 ? kf + df - Math.sign(df) : kf + df
    const legR = Math.abs(dr) === 2 ? kr + dr - Math.sign(dr) : kr + dr
    if (!b[at(legF, legR)]) return true
  }

  const enemy: Side = side === 'red' ? 'black' : 'red'
  if (isEnemy(kf, kr - forward(enemy), 'pawn')) return true
  for (const df of [-1, 1]) {
    if (isEnemy(kf + df, kr, 'pawn') && !onOwnSide(enemy, kr)) return true
  }
  return false
}

export function legalMoves(pos: Position): Move[] {
  return pseudoLegalMoves(pos).filter((m) => !isInCheck(applyMove(pos, m), pos.turn))
}
