import type { Side } from '../rules/position'
import type { MatchStatus } from '../rules/match'

export const SIDE_NAME: Record<Side, string> = { red: '紅方', black: '黑方' }

export const STR = {
  title: '3D 象棋',
  turn: (side: Side) => `${SIDE_NAME[side]}走棋`,
  yourTurn: (side: Side) => `輪到你了（${SIDE_NAME[side]}）`,
  aiThinking: '電腦思考中…',
  menu: '選單',
  skipHint: '點一下跳過 ▶▶',
  cutscene: { all: '過場：每次', major: '過場：大子', off: '過場：關閉' } as const,
  hotseat: '雙人對戰',
  hotseatHint: '兩個人用同一台輪流下',
  vsAi: '電腦對戰',
  vsAiHint: '跟電腦下一盤',
  level: '難度',
  levels: { easy: '簡單', normal: '普通', hard: '困難' } as const,
  side: '我要執',
  sides: { red: '紅方（先走）', black: '黑方' } as const,
  start: '開始',
  back: '返回',
  youWin: '你贏了！',
  youLose: '電腦贏了',
  check: '將軍！',
  undo: '悔棋',
  restart: '重新開始',
  resetView: '視角',
  playAgain: '再來一局',
  confirmRestart: '確定要重新開始這一局嗎？',
  confirmMenu: '要離開這一局回到選單嗎？',
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
