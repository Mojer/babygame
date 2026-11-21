import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js'

export type ViewPreset = 'top' | 'red' | 'black'

const VIEWS: Record<ViewPreset, THREE.Vector3> = {
  top: new THREE.Vector3(0, 16.8, 0.001),
  red: new THREE.Vector3(0, 11, 10.5),
  black: new THREE.Vector3(0, 11, -10.5),
}

export class Stage {
  readonly renderer: THREE.WebGLRenderer
  readonly scene = new THREE.Scene()
  readonly camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200)
  readonly controls: OrbitControls
  private readonly outline: OutlineEffect
  private readonly clock = new THREE.Clock()
  private readonly tickers = new Set<(dt: number, t: number) => void>()
  private preset: ViewPreset = 'top'
  private viewTween: { from: THREE.Vector3; to: THREE.Vector3; t: number } | null = null

  constructor(private readonly container: HTMLElement) {
    const r = (this.renderer = new THREE.WebGLRenderer({ antialias: true }))
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    r.shadowMap.enabled = true
    r.shadowMap.type = THREE.PCFShadowMap
    container.appendChild(r.domElement)
    this.outline = new OutlineEffect(r, { defaultThickness: 0.004, defaultColor: [0.3, 0.2, 0.16], defaultAlpha: 0.9 })

    this.scene.background = new THREE.Color(0xbfe6ff)
    this.scene.fog = new THREE.Fog(0xbfe6ff, 30, 60)
    const hemi = new THREE.HemisphereLight(0xfff8ec, 0x9cc7a0, 1.8)
    const sun = new THREE.DirectionalLight(0xfff1dc, 1.7)
    sun.position.set(4, 12, 6)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    const sc = sun.shadow.camera
    sc.left = sc.bottom = -8
    sc.right = sc.top = 8
    sc.near = 1
    sc.far = 30
    sun.shadow.bias = -0.0005
    sun.shadow.normalBias = 0.02
    this.scene.add(hemi, sun)

    const c = (this.controls = new OrbitControls(this.camera, r.domElement))
    c.enableDamping = true
    c.enablePan = false
    c.minDistance = 8
    c.maxDistance = 24
    c.maxPolarAngle = 1.15
    c.mouseButtons = { LEFT: null as unknown as THREE.MOUSE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }
    c.touches = { ONE: null as unknown as THREE.TOUCH, TWO: THREE.TOUCH.DOLLY_ROTATE }
    this.camera.position.copy(VIEWS.top)
    c.update()

    window.addEventListener('resize', () => this.resize())
    this.resize()
    r.setAnimationLoop(() => this.frame())
  }

  onTick(fn: (dt: number, t: number) => void): () => void {
    this.tickers.add(fn)
    return () => this.tickers.delete(fn)
  }

  setView(preset: ViewPreset, animate = true): void {
    this.preset = preset
    const to = this.fittedView(preset)
    if (!animate) {
      this.camera.position.copy(to)
      this.controls.update()
      return
    }
    this.viewTween = { from: this.camera.position.clone(), to, t: 0 }
  }

  resetView(): void {
    this.setView(this.preset)
  }

  /** Pull the camera back on portrait screens so the whole board fits. */
  private fittedView(preset: ViewPreset): THREE.Vector3 {
    const aspect = this.camera.aspect
    const scale = aspect < 1 ? Math.min(1.9, 0.95 / aspect) : 1
    return VIEWS[preset].clone().multiplyScalar(scale)
  }

  private resize(): void {
    const w = this.container.clientWidth || window.innerWidth
    const h = this.container.clientHeight || window.innerHeight
    this.renderer.setSize(w, h)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.controls.maxDistance = 24 * Math.max(1, 1 / this.camera.aspect)
    if (!this.viewTween) this.setView(this.preset, false)
  }

  private frame(): void {
    const dt = Math.min(this.clock.getDelta(), 0.05)
    const t = this.clock.elapsedTime
    if (this.viewTween) {
      const tw = this.viewTween
      tw.t = Math.min(1, tw.t + dt / 0.6)
      const k = 1 - Math.pow(1 - tw.t, 3)
      this.camera.position.lerpVectors(tw.from, tw.to, k)
      if (tw.t >= 1) this.viewTween = null
    }
    this.controls.update()
    for (const fn of this.tickers) fn(dt, t)
    this.outline.render(this.scene, this.camera)
  }
}
