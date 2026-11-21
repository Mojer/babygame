import { Board } from './render/board'
import { Stage } from './render/stage'
import { GameController } from './game/controller'
import type { CutsceneMode } from './game/cutscene'
import { Hud } from './ui/hud'
import { Menu } from './ui/menu'
import { STR } from './ui/strings'
import { VfxManager } from './vfx/vfx'

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
const hud = new Hud(document.body, {
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
  menu: () => menu?.show(),
})
game = new GameController(stage, new Board(), hud, vfx)
game.cutsceneMode = loadCutsceneMode()
hud.setCutsceneLabel(STR.cutscene[game.cutsceneMode])
menu = new Menu(document.body, (settings) => {
  game?.newGame(settings)
  hud.setViewLabel(STR.view[stage.view])
})
hud.setViewLabel(STR.view[stage.view])
menu.show()

requestAnimationFrame(() => {
  vfx.prewarm(stage.scene, stage.camera)
  stage.prewarmImpact()
})

if (import.meta.env.DEV) Object.assign(window, { __xq: { stage, game, vfx } })
