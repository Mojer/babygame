import { describe, expect, it } from 'vitest'
import { parseFen } from '../rules/position'
import { isInCheck, legalMoves, moveToIccs, parseMove } from '../rules/moves'
import { LESSONS } from './lessons'
import { LessonRun } from './lessonRun'

describe('LESSONS', () => {
  it('has twelve lessons with unique ids', () => {
    expect(LESSONS).toHaveLength(12)
    expect(new Set(LESSONS.map((l) => l.id)).size).toBe(12)
  })

  it.each(LESSONS.map((l) => [l.title, l] as const))('%s starts from a fair position', (_, lesson) => {
    const pos = parseFen(lesson.fen)
    expect(pos.turn).toBe('red')
    expect(isInCheck(pos, 'red')).toBe(false)
    expect(pos.board.some((p) => p?.kind === 'king' && p.side === 'black')).toBe(true)
    expect(lesson.solution.length).toBeLessThanOrEqual(lesson.maxMoves)
  })

  it.each(LESSONS.map((l) => [l.title, l] as const))('%s is solved by its solution', (_, lesson) => {
    const run = new LessonRun(lesson)
    const results = lesson.solution.map((m) => run.play(m))
    expect(results.at(-1)).toBe('success')
    expect(results.slice(0, -1).every((r) => r === 'continue')).toBe(true)
  })
})

describe('LessonRun', () => {
  const capturePawn = LESSONS.find((l) => l.id === 'pawn-sideways')!
  const crossRiver = LESSONS.find((l) => l.id === 'pawn-forward')!

  it('fails a one-move lesson when the move misses the goal', () => {
    const run = new LessonRun(capturePawn)
    const wrong = legalMoves(run.position).map(moveToIccs).find((m) => m !== capturePawn.solution[0])!
    expect(run.play(wrong)).toBe('failed')
    expect(run.status).toBe('failed')
  })

  it('keeps the learner to move between steps while black stays still', () => {
    const run = new LessonRun(crossRiver)
    expect(run.play(crossRiver.solution[0])).toBe('continue')
    expect(run.position.turn).toBe('red')
    expect(run.movesLeft).toBe(crossRiver.maxMoves - 1)
  })

  it('offers the next solution move as a hint until the learner strays', () => {
    const run = new LessonRun(crossRiver)
    expect(moveToIccs(run.hint()!)).toBe(crossRiver.solution[0])
    run.play(crossRiver.solution[0])
    expect(moveToIccs(run.hint()!)).toBe(crossRiver.solution[1])
  })

  it('rejects illegal moves and restarts cleanly', () => {
    const run = new LessonRun(crossRiver)
    expect(() => run.play('c3d3')).toThrow()
    run.play(crossRiver.solution[0])
    run.restart()
    expect(run.movesLeft).toBe(crossRiver.maxMoves)
    expect(run.status).toBe('playing')
    expect(legalMoves(run.position).map(moveToIccs)).toContain(moveToIccs(parseMove(crossRiver.solution[0])))
  })
})
