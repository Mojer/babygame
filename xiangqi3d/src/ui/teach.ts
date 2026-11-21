import type { GuideEntry } from '../teach/guide'
import { GUIDE } from '../teach/guide'
import type { LessonRun, StepResult } from '../teach/lessonRun'
import { LESSONS } from '../teach/lessons'
import { markPassed } from '../teach/progress'
import { button, el } from './hud'
import { STR } from './strings'
import { sound } from '../audio/sound'

export interface TeachActions {
  openGuide(entry: GuideEntry): void
  openLesson(index: number): void
  restart(): void
  hint(): void
  lessonList(): void
}

/** Side panel for the piece guide and lessons, plus the lesson result card. */
export class TeachPanel {
  private readonly panel: HTMLDivElement
  private readonly result: HTMLDivElement
  private movesLine: HTMLElement | null = null

  constructor(parent: HTMLElement, private readonly actions: TeachActions) {
    this.panel = el('div', 'teach-panel')
    this.result = el('div', 'overlay teach-result')
    parent.append(this.panel, this.result)
  }

  hide(): void {
    this.panel.classList.remove('show')
    this.result.classList.remove('show')
  }

  showGuide(entry: GuideEntry): void {
    this.result.classList.remove('show')
    const tabs = el('div', 'guide-tabs')
    for (const g of GUIDE) {
      const b = button(g.names.split('／')[0], () => this.actions.openGuide(g))
      b.classList.toggle('on', g === entry)
      tabs.append(b)
    }
    const title = el('h2', 'teach-title')
    title.textContent = entry.names
    const list = el('ul', 'teach-lines')
    for (const line of entry.lines) {
      const li = el('li', '')
      li.textContent = line
      list.append(li)
    }
    const tryIt = el('p', 'teach-tip')
    tryIt.textContent = STR.guideTry
    this.panel.replaceChildren(tabs, title, list, tryIt, this.row(button(STR.reset, this.actions.restart)))
    this.panel.classList.add('show')
  }

  showLesson(run: LessonRun): void {
    this.result.classList.remove('show')
    const index = LESSONS.indexOf(run.lesson)
    const title = el('h2', 'teach-title')
    title.textContent = `${STR.lessonNo(index + 1)}：${run.lesson.title}`
    const goal = el('p', 'teach-goal')
    goal.textContent = `🎯 ${run.lesson.goalText}`
    const tip = el('p', 'teach-tip')
    tip.textContent = run.lesson.tip
    this.movesLine = el('p', 'teach-moves')
    this.movesLine.textContent = STR.movesLeft(run.movesLeft)
    this.panel.replaceChildren(
      title,
      goal,
      tip,
      this.movesLine,
      this.row(button(STR.hint, this.actions.hint), button(STR.retry, this.actions.restart), button(STR.lessonList, this.actions.lessonList)),
    )
    this.panel.classList.add('show')
  }

  lessonStep(result: StepResult, run: LessonRun): void {
    if (this.movesLine) this.movesLine.textContent = STR.movesLeft(run.movesLeft)
    if (result === 'continue') return
    const index = LESSONS.indexOf(run.lesson)
    const card = el('div', 'card')
    const h = el('h2', '')
    const p = el('p', '')
    if (result === 'success') {
      sound.play('pass')
      markPassed(run.lesson.id)
      const last = index === LESSONS.length - 1
      h.textContent = `🎉 ${STR.lessonPassed}`
      p.textContent = last ? STR.allPassed : run.lesson.tip
      const next = button(last ? STR.lessonList : STR.nextLesson, () =>
        last ? this.actions.lessonList() : this.actions.openLesson(index + 1),
      )
      next.classList.add('primary')
      card.append(h, p, this.row(button(STR.retry, this.actions.restart), next))
    } else {
      sound.play('fail')
      h.textContent = STR.lessonFailed
      p.textContent = run.lesson.tip
      const retry = button(STR.retry, this.actions.restart)
      retry.classList.add('primary')
      card.append(h, p, this.row(button(STR.hint, () => {
        this.actions.restart()
        this.actions.hint()
      }), retry))
    }
    this.result.replaceChildren(card)
    // let the capture or mate play out before covering the board
    window.setTimeout(() => this.result.classList.add('show'), 500)
  }

  private row(...buttons: HTMLElement[]): HTMLElement {
    const r = el('div', 'row')
    r.append(...buttons)
    return r
  }
}
