import type { GameSettings } from './controller'

export type MatchSettings = Extract<GameSettings, { mode: 'hotseat' | 'ai' }>

export interface SavedMatch {
  version: 1
  settings: MatchSettings
  moves: string[]
}

const KEY = 'xq3d.savedMatch'

export function loadSavedMatch(): SavedMatch | null {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) ?? 'null') as SavedMatch | null
    if (!data || data.version !== 1 || !Array.isArray(data.moves)) return null
    if (data.settings?.mode !== 'hotseat' && data.settings?.mode !== 'ai') return null
    return data
  } catch {
    return null
  }
}

export function storeSavedMatch(save: SavedMatch | null): void {
  try {
    if (save) localStorage.setItem(KEY, JSON.stringify(save))
    else localStorage.removeItem(KEY)
  } catch {
    /* storage unavailable: no resume after reload */
  }
}

// ---------- last finished game, kept for replay ----------

const FINISHED_KEY = 'xq3d.lastFinished'

export function loadFinishedMatch(): SavedMatch | null {
  try {
    const data = JSON.parse(localStorage.getItem(FINISHED_KEY) ?? 'null') as SavedMatch | null
    if (!data || data.version !== 1 || !Array.isArray(data.moves) || !data.moves.length) return null
    if (data.settings?.mode !== 'hotseat' && data.settings?.mode !== 'ai') return null
    return data
  } catch {
    return null
  }
}

export function storeFinishedMatch(game: SavedMatch): void {
  try {
    localStorage.setItem(FINISHED_KEY, JSON.stringify(game))
  } catch {
    /* storage unavailable: replay only right after the game */
  }
}
