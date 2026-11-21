import { Board } from './render/board'
import { loadPieceModels } from './render/models'
import { Stage } from './render/stage'
import { FpsWatch, type QualityMode, looksLowEnd } from './render/quality'
import { type GameSettings, GameController } from './game/controller'
import type { CutsceneMode } from './game/cutscene'
import { loadFinishedMatch, loadSavedMatch, storeFinishedMatch, storeSavedMatch } from './game/save'
import { sound } from './audio/sound'
import { Hud } from './ui/hud'
import { Menu } from './ui/menu'
import { SettingsPanel } from './ui/settings'
import { STR } from './ui/strings'
import { TeachPanel } from './ui/teach'
import { LESSONS } from './teach/lessons'
import { VfxManager } from './vfx/vfx'

const modelsReady = loadPieceModels()

// ---------- persisted preferences ----------

const PREFS_KEY = 'xq3d.prefs'
interface Prefs {
  cutscene?: CutsceneMode
  quality?: QualityMode
}

function loadPrefs(): Prefs {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}') as Prefs
  } catch {
    return {}
  }
}

function savePrefs(p: Prefs): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(p))
  } catch {
    /* preference lasts for this visit only */
  }
}

const prefs = loadPrefs()
const lowEndGuess = looksLowEnd()

// ---------- scene ----------

const app = document.getElementById('app')!
const stage = new Stage(app)
const vfx = new VfxManager(stage.renderer)
stage.scene.add(vfx.root)
stage.onTick((dt) => vfx.update(dt))

let game: GameController | null = null
let menu: Menu | null = null
let teach: TeachPanel | null = null
let settings: SettingsPanel | null = null

// ---------- quality ----------

let qualityMode: QualityMode = prefs.quality ?? 'auto'
let autoDowngraded = false

function applyQuality(): void {
  const low = qualityMode === 'low' || (qualityMode === 'auto' && (lowEndGuess || autoDowngraded))
  stage.setLowQuality(low)
  vfx.quality = low ? 'low' : 'high'
}

const fpsWatch = new FpsWatch(() => {
  if (qualityMode !== 'auto' || autoDowngraded) return
  autoDowngraded = true
  applyQuality()
})
stage.onTick((dt) => fpsWatch.sample(dt))
applyQuality()

// ---------- UI ----------

const hud = new Hud(document.body, {
  hint: () => void game?.hint(),
  openSettings: () => settings?.open(),
  undo: () => game?.undo(),
  restart: () => game?.restart(),
  cycleView: () => STR.view[stage.cycleView()],
  menu: () => {
    game?.replayPause()
    teach?.hide()
    menu?.show()
  },
  replay: () => game?.replayCurrent(),
  replayNav: (cmd) => {
    if (!game) return
    if (cmd === 'toggle') return game.replayToggle()
    if (cmd === 'back') return game.replayBack()
    game.replayPause()
    if (cmd === 'start') game.replayTo(0)
    else if (cmd === 'end') game.replayTo(Number.MAX_SAFE_INTEGER)
    else void game.replayForward()
  },
  replaySeek: (n) => {
    game?.replayPause()
    game?.replayTo(n)
  },
})

await modelsReady
game = new GameController(stage, new Board(), hud, vfx)
// low-end devices default to fewer cutscenes unless the player already chose
game.cutsceneMode = prefs.cutscene ?? (lowEndGuess ? 'major' : 'all')
game.onMatchChange = storeSavedMatch
game.onMatchEnd = storeFinishedMatch
game.onReplayChange = (s) => hud.setReplay(s)

function startGame(s: GameSettings): void {
  game!.newGame(s)
  hud.setViewLabel(STR.view[stage.view])
  if (s.mode === 'guide') teach!.showGuide(s.entry)
  else if (s.mode === 'lesson') teach!.showLesson(game!.lessonRun!)
  else teach!.hide()
}

teach = new TeachPanel(document.body, {
  openGuide: (entry) => startGame({ mode: 'guide', entry }),
  openLesson: (i) => startGame({ mode: 'lesson', lesson: LESSONS[i] }),
  restart: () => {
    game!.restart()
    if (game!.mode === 'lesson') teach!.showLesson(game!.lessonRun!)
  },
  hint: () => void game?.hint(),
  lessonList: () => {
    teach!.hide()
    menu!.showLessons()
  },
})
game.teach = { lessonStep: (result, run) => teach!.lessonStep(result, run) }

settings = new SettingsPanel(
  document.body,
  STR.settings,
  [
    {
      label: STR.cutsceneLabel,
      options: STR.cutscene,
      get: () => game!.cutsceneMode,
      set: (v) => {
        game!.cutsceneMode = v as CutsceneMode
        prefs.cutscene = game!.cutsceneMode
        savePrefs(prefs)
      },
    },
    {
      label: STR.qualityLabel,
      options: STR.quality,
      get: () => qualityMode,
      set: (v) => {
        qualityMode = v as QualityMode
        prefs.quality = qualityMode
        savePrefs(prefs)
        applyQuality()
      },
    },
    {
      label: STR.sfxLabel,
      options: STR.onOff,
      get: () => (sound.sfxOn ? 'on' : 'off'),
      set: (v) => sound.setSfx(v === 'on'),
    },
    {
      label: STR.musicLabel,
      options: STR.onOff,
      get: () => (sound.musicOn ? 'on' : 'off'),
      set: (v) => sound.setMusic(v === 'on'),
    },
  ],
  STR.close,
)

menu = new Menu(
  document.body,
  startGame,
  loadSavedMatch,
  (save) => {
    game!.resume(save)
    hud.setViewLabel(STR.view[stage.view])
    teach!.hide()
  },
  loadFinishedMatch,
)
menu.show()
hud.setViewLabel(STR.view[stage.view])

// effects and shader warm-up happen behind the menu
requestAnimationFrame(() => {
  stage.prewarmImpact()
  void vfx.load(stage.scene, stage.camera)
})

if (import.meta.env.DEV) Object.assign(window, { __xq: { stage, game, vfx, sound } })
