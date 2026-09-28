import * as THREE from 'three';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';
import { CHARACTERS, COMING_SOON, ROOMS } from './config';
import { sfx, unlockAudio } from './core/audio';
import { Character } from './entities/character';
import { Room, type Door, type Interactable } from './scene/room';
import { Fx } from './systems/fx';

export interface GameHooks {
  onSelect(key: string): void;
  toast(msg: string): void;
}

const CAM_DIR = new THREE.Vector3(0.5, Math.SQRT1_2, 0.5).normalize(); // 45° down, from south-east
const NO_OUTLINE = { visible: false };

export class Game {
  readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  private readonly outline: OutlineEffect;
  private readonly timer = new THREE.Timer();
  private readonly fx: Fx;
  private readonly ray = new THREE.Raycaster();
  private room!: Room;
  private chars: Character[] = [];
  private selected!: Character;
  private selRing: THREE.Mesh;
  private seats = new Map<Character, Interactable>();
  private camTarget = new THREE.Vector3(0, 0.3, 0);
  private zoom = 1;
  private lightsOn = true;
  private candleLight = new THREE.PointLight(0xffb45a, 0, 2.5);

  constructor(
    private readonly container: HTMLElement,
    private readonly hooks: GameHooks,
  ) {
    const r = (this.renderer = new THREE.WebGLRenderer({ antialias: true }));
    r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFShadowMap;
    r.toneMapping = THREE.NoToneMapping;
    container.appendChild(r.domElement);
    this.outline = new OutlineEffect(r, { defaultThickness: 0.0035, defaultColor: [0.3, 0.2, 0.16], defaultAlpha: 0.9 });

    this.scene.background = new THREE.Color(0xf3e6d3);
    const hemi = new THREE.HemisphereLight(0xfff6e8, 0xe0bf98, 1.9);
    const sun = new THREE.DirectionalLight(0xfff1dc, 1.6);
    sun.position.set(3, 7, 4.5);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera;
    sc.left = sc.bottom = -5;
    sc.right = sc.top = 5;
    sc.near = 1;
    sc.far = 20;
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.02;
    this.scene.add(hemi, sun, this.candleLight);

    this.fx = new Fx(this.scene);

    this.selRing = new THREE.Mesh(
      new THREE.RingGeometry(0.2, 0.25, 40),
      new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, opacity: 0.9, depthWrite: false }),
    );
    (this.selRing.material as THREE.Material).userData.outlineParameters = NO_OUTLINE;
    this.selRing.rotation.x = -Math.PI / 2;
    this.selRing.position.y = 0.015;
    this.selRing.renderOrder = 1;

    window.addEventListener('resize', () => this.resize());
    this.bindInput();
  }

  async load(onProgress: (k: number) => void) {
    let done = 0;
    const total = 1 + CHARACTERS.length;
    const tick = <T>(p: Promise<T>) => p.then((v) => (onProgress(++done / total), v));
    const [room, ...chars] = await Promise.all([
      tick(Room.load(ROOMS.cafe.model)),
      ...CHARACTERS.map((d) => tick(Character.load(d))),
    ]);
    this.room = room;
    this.chars = chars;
    this.scene.add(room.root);
    chars.forEach((c) => this.scene.add(c.root));
    const candle = room.interactables.find((i) => i.action === 'flicker');
    if (candle) this.candleLight.position.copy(candle.pivot.position).add(new THREE.Vector3(0, 0.25, 0));
    this.select(chars.find((c) => c.def.key === 'bunny') ?? chars[0], false);
    this.resize();
    this.snapCamera();
    this.renderer.setAnimationLoop((ts) => this.frame(ts));
  }

  select(c: Character, greet = true) {
    this.selected = c;
    c.root.add(this.selRing);
    this.hooks.onSelect(c.def.key);
    if (greet) {
      c.happy();
      sfx('hi', c.def.voice);
    }
  }

  selectKey(key: string) {
    const c = this.chars.find((ch) => ch.def.key === key);
    if (c) this.select(c);
  }

  // ------------------------------------------------------------------ input
  private bindInput() {
    const el = this.renderer.domElement;
    const pointers = new Map<number, { x: number; y: number; sx: number; sy: number; t: number }>();
    let pinchD = 0;
    el.addEventListener('pointerdown', (e) => {
      unlockAudio();
      el.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, t: performance.now() });
      if (pointers.size === 2) pinchD = this.pinchDistance(pointers);
    });
    el.addEventListener('pointermove', (e) => {
      const p = pointers.get(e.pointerId);
      if (!p) return;
      p.x = e.clientX;
      p.y = e.clientY;
      if (pointers.size === 2) {
        const d = this.pinchDistance(pointers);
        if (pinchD > 0) this.setZoom(this.zoom * (pinchD / d));
        pinchD = d;
      }
    });
    const end = (e: PointerEvent) => {
      const p = pointers.get(e.pointerId);
      pointers.delete(e.pointerId);
      if (!p || pointers.size > 0 || pinchD) {
        if (!pointers.size) pinchD = 0;
        return;
      }
      const moved = Math.hypot(p.x - p.sx, p.y - p.sy);
      if (moved < 14 && performance.now() - p.t < 700) this.tap(e.clientX, e.clientY);
    };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', (e) => {
      pointers.delete(e.pointerId);
      if (!pointers.size) pinchD = 0;
    });
    el.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.setZoom(this.zoom * Math.exp(e.deltaY * 0.0015));
      },
      { passive: false },
    );
  }

  private pinchDistance(ps: Map<number, { x: number; y: number }>) {
    const [a, b] = [...ps.values()];
    return Math.hypot(a.x - b.x, a.y - b.y) || 1;
  }

  private setZoom(z: number) {
    this.zoom = THREE.MathUtils.clamp(z, 0.55, 1.45);
  }

  private tap(x: number, y: number) {
    if (!this.room) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(((x - rect.left) / rect.width) * 2 - 1, -((y - rect.top) / rect.height) * 2 + 1);
    this.ray.setFromCamera(ndc, this.camera);
    const charParts = this.chars.flatMap((c) => c.pickables);
    const hit = this.ray.intersectObjects([...charParts, ...this.room.pickables], false)[0];
    if (!hit) return;

    const who = this.chars.find((c) => c.pickables.includes(hit.object));
    if (who) return this.select(who);

    const it = this.room.partOwner.get(hit.object);
    if (it) return this.interact(it);

    const door = this.room.doorParts.get(hit.object);
    if (door) return this.useDoor(door);

    this.walkTo(hit.point, true);
  }

  // ------------------------------------------------------------------ actions
  private walkTo(point: THREE.Vector3, ripple: boolean, onArrive?: () => void): boolean {
    const c = this.selected;
    const goal = this.room.nav.nearestFree(point.x, point.z);
    if (!goal) return false;
    const path = this.room.nav.findPath(c.position, goal);
    if (!path) return false;
    this.leaveSeat(c);
    if (ripple) {
      this.fx.tapRipple(goal);
      sfx('tap');
    }
    c.walk(path, onArrive);
    return true;
  }

  private leaveSeat(c: Character) {
    const it = this.seats.get(c);
    if (it) {
      it.occupant = undefined;
      this.seats.delete(c);
    }
  }

  private useDoor(door: Door) {
    this.walkTo(door.position, true, () => {
      sfx('boing');
      this.selected.happy();
      this.hooks.toast(COMING_SOON[door.to] ?? '🚪 這扇門還沒開喔');
    });
  }

  private interact(it: Interactable) {
    const c = this.selected;
    if (it.action === 'sit') return this.sit(c, it);

    this.react(it);
    this.walkTo(it.approach, false, () => {
      c.face(it.pivot.position);
      c.happy();
    });
  }

  private sit(c: Character, it: Interactable) {
    if (!it.snap) return;
    const occ = it.occupant as Character | undefined;
    if (occ && occ !== c) {
      occ.happy();
      sfx('hi', occ.def.voice);
      this.fx.jelly(it.pivot, 0.1);
      return;
    }
    if (occ === c) {
      c.happy();
      sfx('hi', c.def.voice);
      return;
    }
    this.fx.jelly(it.pivot, 0.12);
    sfx('tap');
    this.walkTo(it.approach, false, () => {
      if (it.occupant) return c.happy();
      it.occupant = c;
      this.seats.set(c, it);
      c.face(this.camera.position); // sit facing the player so the face stays visible
      c.sitOn(it.snap!);
      this.fx.jelly(it.pivot, 0.15);
      sfx(it.sfx);
    });
  }

  /** Immediate visual + audio feedback when an object is tapped. */
  private react(it: Interactable) {
    const top = new THREE.Box3().setFromObject(it.pivot).max.y;
    const at = new THREE.Vector3(it.pivot.position.x, top + 0.05, it.pivot.position.z);
    sfx(it.sfx);
    switch (it.action) {
      case 'brew': {
        this.fx.jelly(it.pivot, 0.12);
        let n = 0;
        this.fx.tween(1.4, (k) => {
          if (k * 10 > n) {
            n++;
            this.fx.burst('puff', at, 1, { spread: 0.08, up: 0.5, size: 0.12, life: 1.1 });
          }
          it.pivot.position.x += Math.sin(k * 90) * 0.0015;
        });
        const cup = it.parts.find((p) => p.name.endsWith('_cup'));
        setTimeout(() => {
          if (cup) this.fx.jelly(cup, 0.4);
          this.fx.burst('star', at, 5);
        }, 1350);
        break;
      }
      case 'toggle_lights': {
        this.lightsOn = !this.lightsOn;
        const bulbs = it.parts.filter((p) => p.name.includes('bulb'));
        bulbs.forEach((b, i) => {
          setTimeout(() => {
            const m = b.material as THREE.MeshToonMaterial;
            m.emissiveIntensity = this.lightsOn ? 2.5 : 0;
            m.color.setScalar(this.lightsOn ? 1 : 0.55);
            this.fx.jelly(b, 0.5);
          }, i * 45);
        });
        this.fx.burst('star', at.setY(at.y - 0.2), 6);
        break;
      }
      case 'glow': {
        this.fx.jelly(it.pivot, 0.08);
        const mats = it.parts.map((p) => p.material as THREE.MeshToonMaterial);
        mats.forEach((m) => m.emissive.set(0xfff2b0));
        this.fx.tween(1.6, (k) => mats.forEach((m) => (m.emissiveIntensity = Math.sin(k * Math.PI) * 0.9)));
        this.fx.burst('note', at, 4, { spread: 0.6 });
        break;
      }
      case 'ding':
        this.fx.jelly(it.pivot, 0.25);
        this.fx.burst('star', at, 6);
        this.fx.burst('note', at, 2);
        break;
      case 'eat':
        this.fx.jelly(it.pivot, 0.3);
        this.fx.burst('heart', at, 7);
        break;
      case 'flicker': {
        const flame = it.parts.find((p) => p.name.includes('flame'));
        this.fx.tween(2.2, (k) => {
          const f = 1 + Math.sin(k * 60) * 0.25 * (1 - k) + 0.3 * Math.sin(k * Math.PI);
          flame?.scale.set(f, f * 1.2, f);
          this.candleLight.intensity = Math.sin(k * Math.PI) * 1.5;
        });
        this.fx.burst('star', at, 3, { size: 0.1 });
        break;
      }
      default:
        this.fx.jelly(it.pivot);
        this.fx.burst('star', at, 5);
    }
  }

  // ------------------------------------------------------------------ frame
  private resize() {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  private camDistance() {
    const a = this.camera.aspect;
    const base = 11.5 * (a < 1.3 ? Math.pow(1.3 / a, 0.7) : 1);
    return base * this.zoom;
  }

  private desiredTarget(out: THREE.Vector3) {
    const p = this.selected.position;
    const follow = THREE.MathUtils.clamp(1.1 - this.zoom * 0.7, 0.25, 0.75);
    return out.set(p.x * follow, 0.3, p.z * follow);
  }

  private snapCamera() {
    this.desiredTarget(this.camTarget);
    this.placeCamera();
  }

  private placeCamera() {
    this.camera.position.copy(this.camTarget).addScaledVector(CAM_DIR, this.camDistance());
    this.camera.lookAt(this.camTarget);
  }

  private frame(ts: number) {
    this.timer.update(ts);
    const dt = Math.min(this.timer.getDelta(), 1 / 20);
    const t = this.timer.getElapsed();
    for (const c of this.chars) c.update(dt, t);
    this.fx.update(dt);
    const s = 1 + Math.sin(t * 4) * 0.06;
    this.selRing.scale.set(s, s, s);
    this.camTarget.lerp(this.desiredTarget(new THREE.Vector3()), Math.min(1, dt * 2.5));
    this.placeCamera();
    this.outline.render(this.scene, this.camera);
  }
}
