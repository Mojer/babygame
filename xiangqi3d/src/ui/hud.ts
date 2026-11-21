import type { MatchStatus } from '../rules/match'
import type { Side } from '../rules/position'
import { STR } from './strings'
import { sound } from '../audio/sound'
import type { ReplayState } from '../game/controller'

export interface HudActions {
  hint(): void
  openSettings(): void
  undo(): void
  restart(): void
  cycleView(): string
  menu(): void
  replay(): void
  replayNav(cmd: 'start' | 'back' | 'toggle' | 'forward' | 'end'): void
  replaySeek(n: number): void
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
  private readonly replayBar: HTMLDivElement
  private readonly replaySlider: HTMLInputElement
  private readonly replayPlay: HTMLButtonElement
  private readonly replayLabel: HTMLDivElement
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
    const settingsBtn = button(STR.settings, actions.openSettings)
    const viewBtn = button('', () => (viewBtn.textContent = actions.cycleView()))
    this.skipHint = el('div', 'skip-hint')
    this.skipHint.textContent = STR.skipHint
    const restartBtn = button(STR.restart, () => {
      if (confirm(STR.confirmRestart)) actions.restart()
    })
    restartBtn.classList.add('match-only')
    bar.append(
      this.hintBtn,
      settingsBtn,
      button(STR.menu, () => {
        if (this.root.dataset.mode !== 'hotseat' && this.root.dataset.mode !== 'ai') return actions.menu()
        if (this.overlay.classList.contains('show')) return actions.menu()
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
      if (action === 'replay') actions.replay()
    })

    // replay controls: transport buttons over a scrubber
    this.replayBar = el('div', 'replay-bar')
    this.replayLabel = el('div', 'replay-label')
    const nav = (cmd: Parameters<HudActions['replayNav']>[0], icon: string, label: string) => {
      const b = button(icon, () => actions.replayNav(cmd))
      b.classList.add('replay-btn')
      b.setAttribute('aria-label', label)
      b.title = label
      return b
    }
    this.replayPlay = nav('toggle', `▶ ${STR.replayNav.play}`, STR.replayNav.play)
    this.replayPlay.classList.add('primary', 'replay-play')
    const transport = el('div', 'replay-transport')
    transport.append(
      nav('start', '⏮\uFE0E', STR.replayNav.start),
      nav('back', '◀', STR.replayNav.back),
      this.replayPlay,
      nav('forward', '▶', STR.replayNav.forward),
      nav('end', '⏭\uFE0E', STR.replayNav.end),
    )
    this.replaySlider = el('input', 'replay-slider')
    this.replaySlider.type = 'range'
    this.replaySlider.min = '0'
    this.replaySlider.step = '1'
    this.replaySlider.setAttribute('aria-label', STR.replayTitle)
    this.replaySlider.addEventListener('input', () => actions.replaySeek(Number(this.replaySlider.value)))
    this.replayBar.append(this.replayLabel, this.replaySlider, transport)

    root.append(this.turn, this.toast, this.skipHint, this.replayBar, bar, this.overlay)
    parent.append(root)
    this.setViewLabel = (label) => (viewBtn.textContent = label)
  }

  readonly setViewLabel: (label: string) => void

  /** Lessons and the guide use their own panel; hide the match-only controls there. */
  setMode(mode: string): void {
    this.root.dataset.mode = mode
    if (mode === 'lesson' || mode === 'guide' || mode === 'replay') {
      this.turn.textContent = ''
      this.overlay.classList.remove('show')
    }
  }

  /** Replay position: the top pill shows the step and its notation, the bar mirrors the cursor. */
  setReplay(s: ReplayState): void {
    this.turn.textContent = `${STR.replayTitle}　${STR.replayStep(s.cursor, s.total)}`
    this.turn.dataset.side = s.side
    this.turn.classList.remove('thinking')
    this.replayLabel.textContent = s.cursor ? s.notation : STR.replayStartPos
    this.replayLabel.dataset.side = s.side
    this.replaySlider.max = String(s.total)
    this.replaySlider.value = String(s.cursor)
    this.replaySlider.style.setProperty('--fill', `${s.total ? (s.cursor / s.total) * 100 : 0}%`)
    this.replayPlay.textContent = s.playing ? `⏸\uFE0E ${STR.replayNav.pause}` : `▶ ${STR.replayNav.play}`
    const label = s.playing ? STR.replayNav.pause : STR.replayNav.play
    this.replayPlay.setAttribute('aria-label', label)
    this.replayPlay.title = label
    this.overlay.classList.remove('show')
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
      <div class="row"><button data-action="replay">${STR.replay}</button><button data-action="again">${STR.playAgain}</button><button data-action="menu">${STR.menu}</button></div></div>`
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
  b.addEventListener('click', () => {
    sound.play('click')
    onClick()
  })
  return b
}
