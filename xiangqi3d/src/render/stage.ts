import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { Pass } from 'three/examples/jsm/postprocessing/Pass.js'
import createImpactFramePass, { type ImpactFramePass } from '../vfx/vendor/effect-impact-frame.js'
import { ColorImpactPass } from './colorImpact'
import { FOG_COLOR } from './terrain'

const MASK_LAYER = 5

/**
 * Interpolate a camera offset around its look-at point on a sphere (radius, height angle,
 * azimuth via the shorter way round), so switching sides orbits the board instead of
 * cutting straight through the point above it, where lookAt flips the view.
 */
function orbitLerp(from: THREE.Vector3, to: THREE.Vector3, k: number): THREE.Vector3 {
  const a = new THREE.Spherical().setFromVector3(from)
  const b = new THREE.Spherical().setFromVector3(to)
  let dTheta = b.theta - a.theta
  if (dTheta > Math.PI) dTheta -= Math.PI * 2
  if (dTheta < -Math.PI) dTheta += Math.PI * 2
  const out = new THREE.Spherical(
    THREE.MathUtils.lerp(a.radius, b.radius, k),
    Math.max(1e-4, THREE.MathUtils.lerp(a.phi, b.phi, k)),
    a.theta + dTheta * k,
  )
  return new THREE.Vector3().setFromSpherical(out)
}

export type ViewPreset = 'top' | 'red' | 'black'

const VIEWS: Record<ViewPreset, THREE.Vector3> = {
  top: new THREE.Vector3(0, 16.8, 0.001),
  red: new THREE.Vector3(0, 11, 10.5),
  black: new THREE.Vector3(0, 11, -10.5),
}

interface CameraTween {
  fromPos: THREE.Vector3
  toPos: THREE.Vector3
  fromLook: THREE.Vector3
  toLook: THREE.Vector3
  t: number
  dur: number
  done?: () => void
}

/** Renders the scene through OutlineEffect so the composer keeps the toon outlines. */
class OutlineScenePass extends Pass {
  constructor(
    private readonly outline: OutlineEffect,
    private readonly scene: THREE.Scene,
    private readonly camera: THREE.Camera,
  ) {
    super()
    this.needsSwap = false
  }

  render(renderer: THREE.WebGLRenderer, _write: THREE.WebGLRenderTarget, read: THREE.WebGLRenderTarget): void {
    renderer.setRenderTarget(this.renderToScreen ? null : read)
    renderer.clear()
    this.outline.render(this.scene, this.camera)
  }
}

export class Stage {
  readonly renderer: THREE.WebGLRenderer
  readonly scene = new THREE.Scene()
  readonly camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200)
  readonly controls: OrbitControls
  private readonly outline: OutlineEffect
  private readonly composer: EffectComposer
  private readonly impactPass: ImpactFramePass
  private readonly colorPass = new ColorImpactPass()
  private hitStopLeft = 0
  private readonly clock = new THREE.Clock()
  private readonly tickers = new Set<(dt: number, t: number) => void>()
  private preset: ViewPreset = 'top'
  private tween: CameraTween | null = null
  private readonly look = new THREE.Vector3()
  private cinematic = false
  /** where the camera was before a cutscene, so it can fly back to the player's own framing */
  private beforeCinematic: { pos: THREE.Vector3; look: THREE.Vector3 } | null = null
  private shakeAmount = 0
  private impactCenter: THREE.Vector3 | null = null
  private readonly sun: THREE.DirectionalLight
  private outlines = true
  private impactSubjects: THREE.Object3D[] = []
  private readonly maskTarget = new THREE.WebGLRenderTarget(1, 1)
  private readonly maskMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })

  constructor(private readonly container: HTMLElement) {
    const r = (this.renderer = new THREE.WebGLRenderer({ antialias: true }))
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    r.shadowMap.enabled = true
    r.shadowMap.type = THREE.PCFShadowMap
    container.appendChild(r.domElement)
    this.outline = new OutlineEffect(r, { defaultThickness: 0.004, defaultColor: [0.3, 0.2, 0.16], defaultAlpha: 0.9 })

    // the sky dome and the radial fog of war live in Terrain; this only shows past the dome
    this.scene.background = new THREE.Color(FOG_COLOR)
    const hemi = new THREE.HemisphereLight(0xfff8ec, 0x9cc7a0, 1.8)
    const sun = (this.sun = new THREE.DirectionalLight(0xfff1dc, 1.7))
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

    this.composer = new EffectComposer(r)
    this.composer.addPass(new OutlineScenePass(this.outline, this.scene, this.camera))
    this.impactPass = createImpactFramePass({ backgroundSuppression: 0.5 })
    this.composer.addPass(this.impactPass)
    this.composer.addPass(this.colorPass)
    this.composer.addPass(new OutputPass())

    window.addEventListener('resize', () => this.resize())
    this.resize()
    r.setAnimationLoop(() => this.frame())
  }

  onTick(fn: (dt: number, t: number) => void): () => void {
    this.tickers.add(fn)
    return () => this.tickers.delete(fn)
  }

  /** Low quality: 1x pixel ratio, no shadows, no toon outlines. */
  setLowQuality(low: boolean): void {
    this.renderer.setPixelRatio(low ? 1 : Math.min(window.devicePixelRatio, 2))
    this.sun.castShadow = !low
    this.outlines = !low
    this.resize()
  }

  get view(): ViewPreset {
    return this.preset
  }

  /** Step through top → red → black and return the new preset. */
  cycleView(): ViewPreset {
    const order: ViewPreset[] = ['top', 'red', 'black']
    this.setView(order[(order.indexOf(this.preset) + 1) % order.length])
    return this.preset
  }

  setView(preset: ViewPreset, animate = true): void {
    this.preset = preset
    if (this.cinematic) {
      this.beforeCinematic = { pos: this.fittedView(preset), look: new THREE.Vector3() }
      return
    }
    const to = this.fittedView(preset)
    if (!animate) {
      this.tween = null
      this.camera.position.copy(to)
      this.controls.target.set(0, 0, 0)
      this.controls.update()
      return
    }
    this.moveCamera(to, new THREE.Vector3(), 0.9)
  }

  // ---------- cinematic camera (battle cutscenes) ----------

  beginCinematic(): void {
    this.beforeCinematic = this.tween
      ? { pos: this.tween.toPos.clone(), look: this.tween.toLook.clone() }
      : { pos: this.camera.position.clone(), look: this.controls.target.clone() }
    this.cinematic = true
    this.controls.enabled = false
  }

  /** Fly the camera to a shot; resolves when it arrives. */
  shot(position: THREE.Vector3, lookAt: THREE.Vector3, dur: number): Promise<void> {
    return new Promise((done) => this.moveCamera(position, lookAt, dur, done))
  }

  endCinematic(dur = 0.45): void {
    if (!this.cinematic) return
    this.cinematic = false
    const back = this.beforeCinematic ?? { pos: this.fittedView(this.preset), look: new THREE.Vector3() }
    this.beforeCinematic = null
    this.moveCamera(back.pos, back.look, dur, () => {
      this.controls.enabled = true
    })
  }

  shake(amount: number): void {
    this.shakeAmount = Math.max(this.shakeAmount, amount)
  }

  /** Freeze gameplay time (not the camera or screen effects) for a beat on a hit. */
  hitStop(seconds: number): void {
    this.hitStopLeft = Math.max(this.hitStopLeft, seconds)
  }

  /** Full-colour hit flash with speed lines tinted `color`, centred on a world point. */
  colorImpact(worldPoint: THREE.Vector3, color: number): void {
    this.impactCenter = worldPoint.clone()
    this.colorPass.trigger(this.toUv(worldPoint), color)
  }

  /** Black-and-white comic impact frame, kept for the checkmate; `subjects` stay as silhouettes. */
  impact(worldPoint: THREE.Vector3, subjects: THREE.Object3D[]): void {
    this.setSubjectLayer(false)
    this.impactSubjects = subjects
    this.setSubjectLayer(true)
    this.impactCenter = worldPoint.clone()
    this.impactPass.setSubjectMask(this.maskTarget.texture)
    this.impactPass.trigger(this.toUv(worldPoint))
  }

  private setSubjectLayer(on: boolean): void {
    for (const s of this.impactSubjects) s.traverse((o) => (on ? o.layers.enable(MASK_LAYER) : o.layers.disable(MASK_LAYER)))
  }

  /**
   * Our own subject mask: the built-in one rejects scenes containing the vendor effects'
   * custom shaders, so we draw only the subjects (layer MASK_LAYER) white on black.
   */
  private renderSubjectMask(): void {
    const r = this.renderer
    const size = r.getDrawingBufferSize(new THREE.Vector2())
    if (this.maskTarget.width !== size.x || this.maskTarget.height !== size.y) this.maskTarget.setSize(size.x, size.y)
    const background = this.scene.background
    const fog = this.scene.fog
    const clear = r.getClearColor(new THREE.Color())
    const clearAlpha = r.getClearAlpha()
    const shadows = r.shadowMap.autoUpdate
    this.scene.background = null
    this.scene.fog = null
    this.scene.overrideMaterial = this.maskMaterial
    r.shadowMap.autoUpdate = false
    this.camera.layers.set(MASK_LAYER)
    r.setRenderTarget(this.maskTarget)
    r.setClearColor(0x000000, 1)
    r.clear()
    r.render(this.scene, this.camera)
    this.camera.layers.set(0)
    r.setRenderTarget(null)
    r.setClearColor(clear, clearAlpha)
    r.shadowMap.autoUpdate = shadows
    this.scene.overrideMaterial = null
    this.scene.background = background
    this.scene.fog = fog
  }

  /** Compile the impact shaders behind the menu so the first hit does not stall. */
  prewarmImpact(): void {
    this.impactPass.setSubjectMask(this.maskTarget.texture)
    this.impactPass.trigger()
    this.renderSubjectMask()
    this.composer.render(0)
    this.impactPass.reset()
    this.restoreViewport()
  }

  /** The impact pass leaves its own viewport behind; put the full canvas back. */
  private restoreViewport(): void {
    const size = this.renderer.getSize(new THREE.Vector2())
    this.renderer.setRenderTarget(null)
    this.renderer.setScissorTest(false)
    this.renderer.setViewport(0, 0, size.x, size.y)
  }

  private toUv(p: THREE.Vector3): { x: number; y: number } {
    const ndc = p.clone().project(this.camera)
    return { x: ndc.x * 0.5 + 0.5, y: ndc.y * 0.5 + 0.5 }
  }

  private moveCamera(pos: THREE.Vector3, look: THREE.Vector3, dur: number, done?: () => void): void {
    this.tween?.done?.()
    this.tween = {
      fromPos: this.camera.position.clone(),
      toPos: pos.clone(),
      fromLook: this.cinematic || this.tween ? this.look.clone() : this.controls.target.clone(),
      toLook: look.clone(),
      t: 0,
      dur: Math.max(dur, 0.001),
      done,
    }
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
    this.composer.setPixelRatio(this.renderer.getPixelRatio())
    this.composer.setSize(w, h)
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.colorPass.setAspect(w / h)
    this.controls.maxDistance = 24 * Math.max(1, 1 / this.camera.aspect)
    if (!this.tween && !this.cinematic) this.setView(this.preset, false)
  }

  private frame(): void {
    const dt = Math.min(this.clock.getDelta(), 0.05)
    const t = this.clock.elapsedTime
    this.impactPass.update(dt)
    this.colorPass.update(dt)
    let gameDt = dt
    if (this.hitStopLeft > 0) {
      this.hitStopLeft -= dt
      gameDt = 0
    }

    if (this.tween) {
      const tw = this.tween
      tw.t = Math.min(1, tw.t + dt / tw.dur)
      const k = tw.t < 0.5 ? 4 * tw.t ** 3 : 1 - Math.pow(-2 * tw.t + 2, 3) / 2
      this.look.lerpVectors(tw.fromLook, tw.toLook, k)
      this.camera.position.copy(this.look).add(orbitLerp(tw.fromPos.clone().sub(tw.fromLook), tw.toPos.clone().sub(tw.toLook), k))
      this.camera.lookAt(this.look)
      if (tw.t >= 1) {
        this.tween = null
        if (!this.cinematic) this.controls.target.copy(this.look)
        tw.done?.()
      }
    }
    if (!this.cinematic && !this.tween) this.controls.update()

    for (const fn of this.tickers) fn(gameDt, t)

    const shaking = this.shakeAmount > 0.001
    const saved = this.camera.position.clone()
    if (shaking) {
      this.camera.position.x += (Math.random() - 0.5) * this.shakeAmount
      this.camera.position.y += (Math.random() - 0.5) * this.shakeAmount
      this.shakeAmount *= Math.pow(0.002, dt)
    }

    if (this.impactPass.active || this.colorPass.active) {
      if (this.impactCenter) {
        const uv = this.toUv(this.impactCenter)
        this.impactPass.setCenter(uv)
        this.colorPass.setCenter(uv)
      }
      if (this.impactPass.active) this.renderSubjectMask()
      this.composer.render(dt)
      this.restoreViewport()
    } else if (this.outlines) {
      this.outline.render(this.scene, this.camera)
    } else {
      this.renderer.render(this.scene, this.camera)
    }
    if (shaking) this.camera.position.copy(saved)
  }
}
