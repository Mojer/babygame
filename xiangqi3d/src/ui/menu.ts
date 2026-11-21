import type { Level } from '../ai/search'
import type { GameSettings } from '../game/controller'
import type { Side } from '../rules/position'
import { button, el } from './hud'
import { STR } from './strings'

/** Start screen: hotseat or vs AI (difficulty + side). */
export class Menu {
  private readonly root: HTMLDivElement
  private level: Level = 'easy'
  private human: Side = 'red'

  constructor(parent: HTMLElement, private readonly onStart: (s: GameSettings) => void) {
    this.root = el('div', 'menu')
    parent.append(this.root)
  }

  show(): void {
    this.root.classList.add('show')
    this.renderMain()
  }

  private hide(): void {
    this.root.classList.remove('show')
  }

  private renderMain(): void {
    const card = el('div', 'menu-card')
    const title = el('h1', 'menu-title')
    title.textContent = STR.title
    card.append(
      title,
      bigChoice(STR.hotseat, STR.hotseatHint, () => {
        this.hide()
        this.onStart({ mode: 'hotseat' })
      }),
      bigChoice(STR.vsAi, STR.vsAiHint, () => this.renderAi()),
    )
    this.root.replaceChildren(card)
  }

  private renderAi(): void {
    const card = el('div', 'menu-card')
    const title = el('h1', 'menu-title')
    title.textContent = STR.vsAi
    const levels = segmented(STR.level, STR.levels, this.level, (v) => (this.level = v))
    const sides = segmented(STR.side, STR.sides, this.human, (v) => (this.human = v))
    const actions = el('div', 'row')
    const start = button(STR.start, () => {
      this.hide()
      this.onStart({ mode: 'ai', level: this.level, human: this.human })
    })
    start.classList.add('primary')
    actions.append(button(STR.back, () => this.renderMain()), start)
    card.append(title, levels, sides, actions)
    this.root.replaceChildren(card)
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
