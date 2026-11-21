import type { Side } from '../rules/position'
import type { MatchStatus } from '../rules/match'

export const SIDE_NAME: Record<Side, string> = { red: '紅方', black: '黑方' }

export const STR = {
  title: '3D 象棋',
  turn: (side: Side) => `${SIDE_NAME[side]}走棋`,
  yourTurn: (side: Side) => `輪到你了（${SIDE_NAME[side]}）`,
  aiThinking: '電腦思考中…',
  menu: '選單',
  hint: '💡 提示',
  learn: '學下棋',
  learnHint: '認識棋子、一關一關練習',
  guide: '棋子圖鑑',
  guideHint: '看看每種棋子怎麼走',
  lessons: '教學關卡',
  lessonsHint: '12 個小挑戰',
  assist: '走法提示',
  assistSides: { red: '紅方', black: '黑方' } as const,
  on: '開',
  off: '關',
  reset: '重設',
  retry: '再試一次',
  lessonList: '關卡列表',
  nextLesson: '下一關',
  lessonNo: (n: number) => `第 ${n} 關`,
  movesLeft: (n: number) => `還可以走 ${n} 步`,
  lessonPassed: '過關了！',
  lessonFailed: '差一點點！',
  allPassed: '全部過關，你好棒！',
  guideTry: '點棋子，再點亮起來的格子，試試看怎麼走。',
  skipHint: '點一下跳過 ▶▶',
  settings: '⚙️ 設定',
  close: '好了',
  cutsceneLabel: '戰鬥過場',
  cutscene: { all: '每次', major: '只有大子', off: '關閉' } as const,
  qualityLabel: '畫質',
  quality: { auto: '自動', high: '高', low: '省電' } as const,
  sfxLabel: '音效',
  musicLabel: '音樂',
  onOff: { on: '開', off: '關' } as const,
  continueGame: '繼續上一盤',
  continueHint: (mode: string) => `接著下剛才的${mode}`,
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
  view: { top: '視角：俯視', red: '視角：紅方', black: '視角：黑方' } as const,
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
