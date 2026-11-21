import type { MatchStatus } from '../rules/match'
import type { Side } from '../rules/position'
import { STR } from './strings'

export interface HudActions {
  undo(): void
  restart(): void
  resetView(): void
}

export class Hud {
  private readonly turn: HTMLDivElement
  private readonly toast: HTMLDivElement
  private readonly overlay: HTMLDivElement
  private readonly undoBtn: HTMLButtonElement
  private toastTimer = 0

  constructor(parent: HTMLElement, actions: HudActions) {
    const root = el('div', 'hud')
    this.turn = el('div', 'turn')
    this.toast = el('div', 'toast')
    const bar = el('div', 'bar')
    this.undoBtn = button(STR.undo, actions.undo)
    bar.append(
      this.undoBtn,
      button(STR.restart, () => {
        if (confirm(STR.confirmRestart)) actions.restart()
      }),
      button(STR.resetView, actions.resetView),
    )
    this.overlay = el('div', 'overlay')
    this.overlay.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).dataset.action === 'again') actions.restart()
    })
    root.append(this.turn, this.toast, bar, this.overlay)
    parent.append(root)
  }

  update(turn: Side, status: MatchStatus, inCheck: boolean, canUndo: boolean): void {
    this.turn.textContent = STR.turn(turn)
    this.turn.dataset.side = turn
    this.undoBtn.disabled = !canUndo
    if (status.kind === 'ongoing') {
      this.overlay.classList.remove('show')
      if (inCheck) this.flash(STR.check)
      return
    }
    const { title, detail } = STR.result(status)
    this.overlay.innerHTML = `<div class="card"><h2>${title}</h2><p>${detail}</p><button data-action="again">${STR.playAgain}</button></div>`
    this.overlay.classList.add('show')
  }

  private flash(text: string): void {
    this.toast.textContent = text
    this.toast.classList.remove('show')
    void this.toast.offsetWidth
    this.toast.classList.add('show')
    clearTimeout(this.toastTimer)
    this.toastTimer = window.setTimeout(() => this.toast.classList.remove('show'), 1400)
  }
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag)
  e.className = cls
  return e
}

function button(label: string, onClick: () => void): HTMLButtonElement {
  const b = el('button', 'btn')
  b.textContent = label
  b.addEventListener('click', onClick)
  return b
}
