import { Board } from './render/board'
import { Stage } from './render/stage'
import { GameController } from './game/controller'
import { Hud } from './ui/hud'
import { Menu } from './ui/menu'

const app = document.getElementById('app')!
const stage = new Stage(app)
let game: GameController | null = null
let menu: Menu | null = null
const hud = new Hud(document.body, {
  undo: () => game?.undo(),
  restart: () => game?.restart(),
  resetView: () => stage.resetView(),
  menu: () => menu?.show(),
})
game = new GameController(stage, new Board(), hud)
menu = new Menu(document.body, (settings) => game?.newGame(settings))
menu.show()

if (import.meta.env.DEV) Object.assign(window, { __xq: { stage, game } })
