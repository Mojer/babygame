import type { Level } from '../ai/search'
import type { Assist, GameSettings } from '../game/controller'
import type { Side } from '../rules/position'
import { GUIDE } from '../teach/guide'
import { LESSONS } from '../teach/lessons'
import { loadPassed } from '../teach/progress'
import { button, el } from './hud'
import { STR } from './strings'

/** Start screen: hotseat, vs AI, or learning (piece guide and lessons). */
export class Menu {
  private readonly root: HTMLDivElement
  private level: Level = 'easy'
  private human: Side = 'red'
  private assist: Assist = { red: true, black: true }

  constructor(parent: HTMLElement, private readonly onStart: (s: GameSettings) => void) {
    this.root = el('div', 'menu')
    parent.append(this.root)
  }

  show(): void {
    this.root.classList.add('show')
    this.renderMain()
  }

  showLessons(): void {
    this.root.classList.add('show')
    this.renderLessons()
  }

  private start(s: GameSettings): void {
    this.root.classList.remove('show')
    this.onStart(s)
  }

  private card(title: string, ...children: HTMLElement[]): void {
    const card = el('div', 'menu-card')
    const h = el('h1', 'menu-title')
    h.textContent = title
    card.append(h, ...children)
    this.root.replaceChildren(card)
  }

  private renderMain(): void {
    this.card(
      STR.title,
      bigChoice(STR.hotseat, STR.hotseatHint, () => this.renderHotseat()),
      bigChoice(STR.vsAi, STR.vsAiHint, () => this.renderAi()),
      bigChoice(STR.learn, STR.learnHint, () => this.renderLearn()),
    )
  }

  private renderHotseat(): void {
    const assist = el('div', 'field')
    const caption = el('div', 'field-label')
    caption.textContent = STR.assist
    const rows = (['red', 'black'] as const).map((side) =>
      segmented(STR.assistSides[side], { on: STR.on, off: STR.off }, this.assist[side] ? 'on' : 'off', (v) => {
        this.assist = { ...this.assist, [side]: v === 'on' }
      }),
    )
    assist.append(caption, ...rows)
    this.card(STR.hotseat, assist, this.actions(() => this.start({ mode: 'hotseat', assist: { ...this.assist } })))
  }

  private renderAi(): void {
    const levels = segmented(STR.level, STR.levels, this.level, (v) => (this.level = v))
    const sides = segmented(STR.side, STR.sides, this.human, (v) => (this.human = v))
    const assist = segmented(STR.assist, { on: STR.on, off: STR.off }, this.assist[this.human] ? 'on' : 'off', (v) => {
      this.assist = { red: v === 'on', black: v === 'on' }
    })
    this.card(
      STR.vsAi,
      levels,
      sides,
      assist,
      this.actions(() => this.start({ mode: 'ai', level: this.level, human: this.human, assist: { ...this.assist } })),
    )
  }

  private renderLearn(): void {
    const back = button(STR.back, () => this.renderMain())
    this.card(
      STR.learn,
      bigChoice(STR.guide, STR.guideHint, () => this.start({ mode: 'guide', entry: GUIDE[0] })),
      bigChoice(STR.lessons, STR.lessonsHint, () => this.renderLessons()),
      back,
    )
  }

  private renderLessons(): void {
    const passed = loadPassed()
    const grid = el('div', 'lesson-grid')
    LESSONS.forEach((lesson, i) => {
      const b = button('', () => this.start({ mode: 'lesson', lesson }))
      b.classList.add('lesson-btn')
      if (passed.has(lesson.id)) b.classList.add('passed')
      b.innerHTML = `<b>${i + 1}</b><span>${lesson.title}</span>`
      grid.append(b)
    })
    this.card(STR.lessons, grid, button(STR.back, () => this.renderLearn()))
  }

  private actions(onStart: () => void): HTMLElement {
    const row = el('div', 'row')
    const start = button(STR.start, onStart)
    start.classList.add('primary')
    row.append(button(STR.back, () => this.renderMain()), start)
    return row
  }
}

function bigChoice(label: string, hint: string, onClick: () => void): HTMLButtonElement {
  const b = button('', onClick)
  b.classList.add('big')
  b.innerHTML = `<span>${label}</span><small>${hint}</small>`
  return b
}

function segmented<K extends string>(label: string, options: Record<K, string>, value: K, onChange: (v: K) => void): HTMLElement {
  const wrap = el('div', 'field')
  const caption = el('div', 'field-label')
  caption.textContent = label
  const group = el('div', 'seg')
  const buttons = (Object.keys(options) as K[]).map((key) => {
    const b = button(options[key], () => {
      onChange(key)
      buttons.forEach((x) => x.classList.toggle('on', x === b))
    })
    b.classList.toggle('on', key === value)
    return b
  })
  group.append(...buttons)
  wrap.append(caption, group)
  return wrap
}
