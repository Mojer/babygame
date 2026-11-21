import { button, el } from './hud'

export interface SettingRow<K extends string> {
  label: string
  options: Record<K, string>
  get(): K
  set(v: K): void
}

/** Small popover with segmented choices (cutscene frequency, quality, sound, music). */
export class SettingsPanel {
  private readonly root: HTMLDivElement

  constructor(
    parent: HTMLElement,
    private readonly title: string,
    private readonly rows: SettingRow<string>[],
    private readonly closeLabel: string,
  ) {
    this.root = el('div', 'overlay settings')
    this.root.addEventListener('click', (e) => {
      if (e.target === this.root) this.close()
    })
    parent.append(this.root)
  }

  open(): void {
    const card = el('div', 'card settings-card')
    const h = el('h2', '')
    h.textContent = this.title
    card.append(h)
    for (const row of this.rows) {
      const field = el('div', 'field')
      const caption = el('div', 'field-label')
      caption.textContent = row.label
      const group = el('div', 'seg')
      const buttons = Object.entries(row.options).map(([key, text]) => {
        const b = button(text as string, () => {
          row.set(key)
          buttons.forEach((x) => x.classList.toggle('on', x === b))
        })
        b.classList.toggle('on', row.get() === key)
        return b
      })
      group.append(...buttons)
      field.append(caption, group)
      card.append(field)
    }
    const close = button(this.closeLabel, () => this.close())
    close.classList.add('primary')
    card.append(close)
    this.root.replaceChildren(card)
    this.root.classList.add('show')
  }

  close(): void {
    this.root.classList.remove('show')
  }
}
