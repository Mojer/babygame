export type LessonGoal =
  | { kind: 'reach'; square: string }
  | { kind: 'capture'; square: string }
  | { kind: 'captureAny' }
  | { kind: 'check' }
  | { kind: 'mate' }

export interface Lesson {
  id: string
  title: string
  /** what the learner must do, shown in the lesson panel */
  goalText: string
  /** short rule reminder shown under the goal */
  tip: string
  fen: string
  maxMoves: number
  goal: LessonGoal
  solution: string[]
}

export const LESSONS: Lesson[] = [
  {
    id: 'pawn-forward',
    title: '兵：過河前只能前進',
    goalText: '把兵走過楚河漢界',
    tip: '還沒過河的兵，一次只能往前走一格。',
    fen: '4k4/9/9/9/9/9/2P6/9/9/3K5 w',
    maxMoves: 2,
    goal: { kind: 'reach', square: 'c5' },
    solution: ['c3c4', 'c4c5'],
  },
  {
    id: 'pawn-sideways',
    title: '兵：過河後可以橫走',
    goalText: '用兵吃掉旁邊的黑卒',
    tip: '過了河的兵，可以往前，也可以往左右走一格。',
    fen: '4k4/9/9/9/3pP4/9/9/9/9/3K5 w',
    maxMoves: 1,
    goal: { kind: 'capture', square: 'd5' },
    solution: ['e5d5'],
  },
  {
    id: 'rook-line',
    title: '車：直線想走多遠都可以',
    goalText: '用車吃掉遠方的黑馬',
    tip: '車可以沿著直線一直走，中間不能有棋子擋住。',
    fen: '4k4/n8/9/9/9/9/9/9/9/R2K5 w',
    maxMoves: 1,
    goal: { kind: 'capture', square: 'a8' },
    solution: ['a0a8'],
  },
  {
    id: 'horse-ri',
    title: '馬：走「日」字',
    goalText: '用馬吃掉黑卒',
    tip: '馬先直走一格，再斜走一格，像「日」字的對角。',
    fen: '4k4/9/9/9/9/9/9/2p6/9/1N1K5 w',
    maxMoves: 1,
    goal: { kind: 'capture', square: 'c2' },
    solution: ['b0c2'],
  },
  {
    id: 'horse-leg',
    title: '馬：蹩馬腳',
    goalText: '用馬吃掉一個黑子',
    tip: '馬要先走的那一格有棋子擋住，就不能往那邊跳，這叫「蹩馬腳」。',
    fen: '4k4/9/9/9/9/3r5/4P1c2/4N4/9/5K3 w',
    maxMoves: 1,
    goal: { kind: 'captureAny' },
    solution: ['e2g3'],
  },
  {
    id: 'elephant-field',
    title: '象：走「田」字、不能過河',
    goalText: '用相吃掉黑卒',
    tip: '相一次斜走兩格，像「田」字的對角，而且不能過河。',
    fen: '4k4/9/9/9/9/6p2/9/9/9/2BK5 w',
    maxMoves: 2,
    goal: { kind: 'capture', square: 'g4' },
    solution: ['c0e2', 'e2g4'],
  },
  {
    id: 'advisor-palace',
    title: '士：只在九宮裡斜走',
    goalText: '用仕吃掉闖進九宮的黑卒',
    tip: '仕只能在九宮（畫叉叉的地方）裡斜走一格。',
    fen: '4k4/9/9/9/9/9/9/9/4p4/3A1K3 w',
    maxMoves: 1,
    goal: { kind: 'capture', square: 'e1' },
    solution: ['d0e1'],
  },
  {
    id: 'king-palace',
    title: '帥：在九宮裡一步一格',
    goalText: '用帥吃掉黑馬',
    tip: '帥只能在九宮裡前後左右走一格，不能斜走。',
    fen: '3k5/9/9/9/9/9/9/9/5n3/4K4 w',
    maxMoves: 2,
    goal: { kind: 'capture', square: 'f1' },
    solution: ['e0e1', 'e1f1'],
  },
  {
    id: 'cannon-screen',
    title: '炮：隔一個子才能吃',
    goalText: '用炮吃掉黑馬',
    tip: '炮平常像車一樣走，但要吃子時，中間一定要剛好隔一個棋子。',
    fen: '4k4/9/1n7/9/1p7/9/9/1C7/9/3K5 w',
    maxMoves: 1,
    goal: { kind: 'capture', square: 'b7' },
    solution: ['b2b7'],
  },
  {
    id: 'check',
    title: '將軍',
    goalText: '走一步，讓黑將被你攻擊到',
    tip: '下一步就能吃到對方的將，就叫「將軍」。',
    fen: '4k4/9/9/9/9/9/9/9/9/R2K5 w',
    maxMoves: 1,
    goal: { kind: 'check' },
    solution: ['a0a9'],
  },
  {
    id: 'mate',
    title: '將死',
    goalText: '一步將死黑將',
    tip: '將軍之後，對方怎麼走都躲不掉，就是「將死」，你就贏了！',
    fen: '4k4/1R7/9/9/9/9/9/9/9/R2K5 w',
    maxMoves: 1,
    goal: { kind: 'mate' },
    solution: ['a0a9'],
  },
  {
    id: 'flying-general',
    title: '將帥不能照面',
    goalText: '請你的帥幫忙，一步將死黑將',
    tip: '帥和將在同一條直線上、中間沒有棋子，就叫照面，這是不可以的。所以黑將不敢走到帥的對面！',
    fen: '3k5/9/9/9/9/9/9/9/9/R3K4 w',
    maxMoves: 1,
    goal: { kind: 'mate' },
    solution: ['a0d0'],
  },
]
