import { Board } from './render/board'
import { Stage } from './render/stage'
import { GameController } from './game/controller'
import { Hud } from './ui/hud'

const app = document.getElementById('app')!
const stage = new Stage(app)
let game: GameController | null = null
const hud = new Hud(document.body, {
  undo: () => game?.undo(),
  restart: () => game?.restart(),
  resetView: () => stage.resetView(),
})
game = new GameController(stage, new Board(), hud)
game.start()

if (import.meta.env.DEV) Object.assign(window, { __xq: { stage, game } })
