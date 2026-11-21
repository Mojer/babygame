import type { PieceKind } from '../rules/position'

export interface GuideEntry {
  kind: PieceKind
  /** red and black names */
  names: string
  lines: string[]
  /** red pieces to explore with (plus props); the focus piece is selected on load */
  fen: string
  focus: string
}

export const GUIDE: GuideEntry[] = [
  {
    kind: 'king',
    names: '帥／將',
    lines: ['只能待在九宮（畫叉叉的格子）裡。', '一次前後左右走一格，不能斜走。', '帥和將不能在同一條直線上直接面對面。'],
    fen: '9/9/9/9/9/9/9/9/4K4/9 w',
    focus: 'e1',
  },
  {
    kind: 'advisor',
    names: '仕／士',
    lines: ['也只能待在九宮裡。', '一次斜走一格，負責保護帥。'],
    fen: '9/9/9/9/9/9/9/9/4A4/9 w',
    focus: 'e1',
  },
  {
    kind: 'elephant',
    names: '相／象',
    lines: ['一次斜走兩格，像「田」字的對角。', '田字中間有棋子擋住就不能走，叫「塞象眼」。', '不能過河。'],
    fen: '9/9/9/9/9/9/5P3/4B4/9/9 w',
    focus: 'e2',
  },
  {
    kind: 'rook',
    names: '俥／車',
    lines: ['沿著直線想走多遠都可以。', '中間不能有棋子擋住。', '最厲害的棋子之一！'],
    fen: '9/9/4p4/9/9/1P2R4/9/9/9/9 w',
    focus: 'e4',
  },
  {
    kind: 'horse',
    names: '傌／馬',
    lines: ['先直走一格，再斜走一格，像「日」字的對角。', '要先走的那一格被擋住，就不能往那邊跳，叫「蹩馬腳」。'],
    fen: '9/9/9/9/4P4/4N4/9/9/9/9 w',
    focus: 'e4',
  },
  {
    kind: 'cannon',
    names: '炮／砲',
    lines: ['平常像車一樣直走。', '要吃子時，中間一定要剛好隔一個棋子（炮架）。', '旁邊的黑卒沒有炮架，所以吃不到。'],
    fen: '9/9/4n4/9/4P4/9/9/1p2C4/9/9 w',
    focus: 'e2',
  },
  {
    kind: 'pawn',
    names: '兵／卒',
    lines: ['還沒過河時，只能往前走一格。', '過了河以後，也可以往左右走一格。', '兵永遠不能後退。'],
    fen: '9/9/9/6P2/9/9/2P6/9/9/9 w',
    focus: 'c3',
  },
]
