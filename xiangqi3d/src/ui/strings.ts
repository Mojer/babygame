import type { Side } from '../rules/position'
import type { MatchStatus } from '../rules/match'

export const SIDE_NAME: Record<Side, string> = { red: '紅方', black: '黑方' }

export const STR = {
  title: '3D 象棋',
  turn: (side: Side) => `${SIDE_NAME[side]}走棋`,
  check: '將軍！',
  undo: '悔棋',
  restart: '重新開始',
  resetView: '視角',
  playAgain: '再來一局',
  confirmRestart: '確定要重新開始這一局嗎？',
  result(status: MatchStatus): { title: string; detail: string } {
    switch (status.kind) {
      case 'checkmate':
        return { title: `${SIDE_NAME[status.winner]}勝！`, detail: '將死' }
      case 'stalemate':
        return { title: `${SIDE_NAME[status.winner]}勝！`, detail: '困斃：對方無棋可走' }
      case 'perpetual-check':
        return { title: `${SIDE_NAME[status.winner]}勝！`, detail: '對方長將判負' }
      case 'repetition-draw':
        return { title: '和棋', detail: '同一局面重複三次' }
      case 'ongoing':
        return { title: '', detail: '' }
    }
  },
}
