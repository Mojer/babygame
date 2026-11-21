import { Board } from './render/board'
import { Stage } from './render/stage'
import { GameController } from './game/controller'
import type { CutsceneMode } from './game/cutscene'
import { Hud } from './ui/hud'
import { Menu } from './ui/menu'
import { STR } from './ui/strings'
import { VfxManager } from './vfx/vfx'
import { TeachPanel } from './ui/teach'
import { LESSONS } from './teach/lessons'
import type { GameSettings } from './game/controller'

const CUTSCENE_KEY = 'xq3d.cutscene'
const CUTSCENE_ORDER: CutsceneMode[] = ['all', 'major', 'off']

function loadCutsceneMode(): CutsceneMode {
  try {
    const v = localStorage.getItem(CUTSCENE_KEY) as CutsceneMode | null
    return v && CUTSCENE_ORDER.includes(v) ? v : 'all'
  } catch {
    return 'all'
  }
}

const app = document.getElementById('app')!
const stage = new Stage(app)
const vfx = new VfxManager(stage.renderer)
stage.scene.add(vfx.root)
stage.onTick((dt) => vfx.update(dt))

let game: GameController | null = null
let menu: Menu | null = null
let teach: TeachPanel | null = null
const hud = new Hud(document.body, {
  hint: () => void game?.hint(),
  cycleCutscene: () => {
    if (!game) return ''
    const next = CUTSCENE_ORDER[(CUTSCENE_ORDER.indexOf(game.cutsceneMode) + 1) % CUTSCENE_ORDER.length]
    game.cutsceneMode = next
    try {
      localStorage.setItem(CUTSCENE_KEY, next)
    } catch {
      /* storage unavailable: keep the choice for this session only */
    }
    return STR.cutscene[next]
  },
  undo: () => game?.undo(),
  restart: () => game?.restart(),
  cycleView: () => STR.view[stage.cycleView()],
  menu: () => {
    teach?.hide()
    menu?.show()
  },
})
game = new GameController(stage, new Board(), hud, vfx)
game.cutsceneMode = loadCutsceneMode()
hud.setCutsceneLabel(STR.cutscene[game.cutsceneMode])
function startGame(settings: GameSettings): void {
  game?.newGame(settings)
  hud.setViewLabel(STR.view[stage.view])
  if (settings.mode === 'guide') teach?.showGuide(settings.entry)
  else if (settings.mode === 'lesson') teach?.showLesson(game!.lessonRun!)
  else teach?.hide()
}

teach = new TeachPanel(document.body, {
  openGuide: (entry) => startGame({ mode: 'guide', entry }),
  openLesson: (i) => startGame({ mode: 'lesson', lesson: LESSONS[i] }),
  restart: () => {
    game?.restart()
    if (game?.mode === 'lesson') teach?.showLesson(game.lessonRun!)
  },
  hint: () => void game?.hint(),
  lessonList: () => {
    teach?.hide()
    menu?.showLessons()
  },
})
game.teach = { lessonStep: (result, run) => teach?.lessonStep(result, run) }
menu = new Menu(document.body, startGame)
hud.setViewLabel(STR.view[stage.view])
menu.show()

requestAnimationFrame(() => {
  vfx.prewarm(stage.scene, stage.camera)
  stage.prewarmImpact()
})

if (import.meta.env.DEV) Object.assign(window, { __xq: { stage, game, vfx } })
