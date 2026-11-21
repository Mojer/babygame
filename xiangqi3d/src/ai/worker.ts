import { parseFen } from '../rules/position'
import { moveToIccs } from '../rules/moves'
import { type Level, chooseMove } from './search'

export interface ThinkRequest {
  id: number
  fen: string
  level: Level
  repeated: string[]
}

export interface ThinkResponse {
  id: number
  move: string | null
}

self.onmessage = (e: MessageEvent<ThinkRequest>) => {
  const { id, fen, level, repeated } = e.data
  const move = chooseMove(parseFen(fen), level, { repeated: new Set(repeated) })
  self.postMessage({ id, move: move && moveToIccs(move) } satisfies ThinkResponse)
}
