import { type Position, parseFen, squareIndex } from '../rules/position'
import { type Move, applyMove, isInCheck, legalMoves, moveToIccs, parseMove } from '../rules/moves'
import type { Lesson } from './lessons'

export type LessonStatus = 'playing' | 'success' | 'failed'
export type StepResult = 'continue' | 'success' | 'failed'

/** Plays a lesson: only red moves, black stands still, and the goal is checked after every move. */
export class LessonRun {
  private pos!: Position
  private played: string[] = []
  private state: LessonStatus = 'playing'

  constructor(readonly lesson: Lesson) {
    this.restart()
  }

  get position(): Position {
    return this.pos
  }

  get status(): LessonStatus {
    return this.state
  }

  get movesLeft(): number {
    return this.lesson.maxMoves - this.played.length
  }

  restart(): void {
    this.pos = parseFen(this.lesson.fen)
    this.played = []
    this.state = 'playing'
  }

  /** The next solution move, while the learner has followed the solution so far. */
  hint(): Move | null {
    if (this.state !== 'playing') return null
    const onTrack = this.played.every((m, i) => m === this.lesson.solution[i])
    const next = this.lesson.solution[this.played.length]
    return onTrack && next ? parseMove(next) : null
  }

  play(move: Move | string): StepResult {
    if (this.state !== 'playing') throw new Error('Lesson is over')
    const m = typeof move === 'string' ? parseMove(move) : move
    if (!legalMoves(this.pos).some((l) => l.from === m.from && l.to === m.to)) {
      throw new Error(`Illegal move: ${moveToIccs(m)}`)
    }
    const captured = !!this.pos.board[m.to]
    const after = applyMove(this.pos, m)
    this.played.push(moveToIccs(m))
    if (this.reached(m, after, captured)) {
      this.pos = after
      this.state = 'success'
      return 'success'
    }
    this.pos = { board: after.board, turn: 'red' }
    if (this.movesLeft <= 0) {
      this.state = 'failed'
      return 'failed'
    }
    return 'continue'
  }

  private reached(m: Move, after: Position, captured: boolean): boolean {
    const goal = this.lesson.goal
    switch (goal.kind) {
      case 'reach':
        return m.to === squareIndex(goal.square)
      case 'capture':
        return captured && m.to === squareIndex(goal.square)
      case 'captureAny':
        return captured
      case 'check':
        return isInCheck(after, 'black')
      case 'mate':
        return isInCheck(after, 'black') && legalMoves(after).length === 0
    }
  }
}
