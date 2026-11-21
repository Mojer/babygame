export type QualityMode = 'auto' | 'high' | 'low'

/** Best guess before measuring: few cores, little memory or a small touch screen means low. */
export function looksLowEnd(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number }
  const cores = nav.hardwareConcurrency ?? 8
  const memory = nav.deviceMemory ?? 8
  const smallTouch = matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 500
  return cores <= 4 || memory <= 3 || (smallTouch && cores <= 6)
}

/**
 * Watches real frame times while the game runs; reports once if the average stays under
 * `minFps` for a full sample window, so 'auto' can step down after the fact.
 */
export class FpsWatch {
  private elapsed = 0
  private frames = 0
  private done = false

  constructor(
    private readonly onSlow: () => void,
    private readonly minFps = 40,
    private readonly window = 4,
  ) {}

  sample(dt: number): void {
    if (this.done) return
    this.elapsed += dt
    this.frames++
    if (this.elapsed < this.window) return
    const fps = this.frames / this.elapsed
    if (fps < this.minFps) {
      this.done = true
      this.onSlow()
    }
    this.elapsed = 0
    this.frames = 0
  }

  stop(): void {
    this.done = true
  }
}
