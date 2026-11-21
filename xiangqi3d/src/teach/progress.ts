const KEY = 'xq3d.lessonsPassed'

export function loadPassed(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY)
    const ids = raw ? (JSON.parse(raw) as unknown) : []
    return new Set(Array.isArray(ids) ? ids.filter((x): x is string => typeof x === 'string') : [])
  } catch {
    return new Set()
  }
}

export function markPassed(id: string): void {
  const passed = loadPassed()
  passed.add(id)
  try {
    localStorage.setItem(KEY, JSON.stringify([...passed]))
  } catch {
    /* storage unavailable: progress lasts for this visit only */
  }
}
