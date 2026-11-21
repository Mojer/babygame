import type { MatchStatus } from '../rules/match'
import type { Side } from '../rules/position'
import { STR } from './strings'

export interface HudActions {
  hint(): void
  cycleCutscene(): string
  undo(): void
  restart(): void
  cycleView(): string
  menu(): void
}

export interface HudState {
  turn: Side
  status: MatchStatus
  inCheck: boolean
  canUndo: boolean
  canHint: boolean
  ai: { human: Side; thinking: boolean } | null
}

export class Hud {
  private readonly turn: HTMLDivElement
  private readonly toast: HTMLDivElement
  private readonly overlay: HTMLDivElement
  private readonly undoBtn: HTMLButtonElement
  private readonly hintBtn: HTMLButtonElement
  private readonly root: HTMLDivElement
  private readonly skipHint: HTMLDivElement
  private toastTimer = 0

  constructor(parent: HTMLElement, actions: HudActions) {
    const root = (this.root = el('div', 'hud'))
    this.turn = el('div', 'turn')
    this.toast = el('div', 'toast')
    const bar = el('div', 'bar')
    this.undoBtn = button(STR.undo, actions.undo)
    this.undoBtn.classList.add('match-only')
    this.hintBtn = button(STR.hint, actions.hint)
    this.hintBtn.classList.add('match-only')
    const cutsceneBtn = button('', () => (cutsceneBtn.textContent = actions.cycleCutscene()))
    const viewBtn = button('', () => (viewBtn.textContent = actions.cycleView()))
    this.skipHint = el('div', 'skip-hint')
    this.skipHint.textContent = STR.skipHint
    const restartBtn = button(STR.restart, () => {
      if (confirm(STR.confirmRestart)) actions.restart()
    })
    restartBtn.classList.add('match-only')
    bar.append(
      this.hintBtn,
      cutsceneBtn,
      button(STR.menu, () => {
        if (this.root.dataset.mode !== 'hotseat' && this.root.dataset.mode !== 'ai') return actions.menu()
        if (confirm(STR.confirmMenu)) actions.menu()
      }),
      this.undoBtn,
      restartBtn,
      viewBtn,
    )
    this.overlay = el('div', 'overlay')
    this.overlay.addEventListener('click', (e) => {
      const action = (e.target as HTMLElement).dataset.action
      if (action === 'again') actions.restart()
      if (action === 'menu') actions.menu()
    })
    root.append(this.turn, this.toast, this.skipHint, bar, this.overlay)
    parent.append(root)
    this.setCutsceneLabel = (label) => (cutsceneBtn.textContent = label)
    this.setViewLabel = (label) => (viewBtn.textContent = label)
  }

  readonly setCutsceneLabel: (label: string) => void
  readonly setViewLabel: (label: string) => void

  /** Lessons and the guide use their own panel; hide the match-only controls there. */
  setMode(mode: string): void {
    this.root.dataset.mode = mode
    if (mode === 'lesson' || mode === 'guide') {
      this.turn.textContent = ''
      this.overlay.classList.remove('show')
    }
  }

  showSkipHint(on: boolean): void {
    this.skipHint.classList.toggle('show', on)
  }

  update(s: HudState): void {
    this.turn.textContent = !s.ai ? STR.turn(s.turn) : s.ai.thinking ? STR.aiThinking : s.turn === s.ai.human ? STR.yourTurn(s.turn) : STR.turn(s.turn)
    this.turn.dataset.side = s.turn
    this.turn.classList.toggle('thinking', !!s.ai?.thinking)
    this.undoBtn.disabled = !s.canUndo
    this.hintBtn.disabled = !s.canHint
    if (s.status.kind === 'ongoing') {
      this.overlay.classList.remove('show')
      if (s.inCheck) this.flash(STR.check)
      return
    }
    const result = STR.result(s.status)
    let title = result.title
    if (s.ai && 'winner' in s.status) title = s.status.winner === s.ai.human ? STR.youWin : STR.youLose
    this.overlay.innerHTML = `<div class="card"><h2>${title}</h2><p>${result.detail}</p>
      <div class="row"><button data-action="again">${STR.playAgain}</button><button data-action="menu">${STR.menu}</button></div></div>`
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

export function el<K extends keyof HTMLElementTagNameMap>(tag: K, cls: string): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag)
  e.className = cls
  return e
}

export function button(label: string, onClick: () => void): HTMLButtonElement {
  const b = el('button', 'btn')
  b.textContent = label
  b.addEventListener('click', onClick)
  return b
}
