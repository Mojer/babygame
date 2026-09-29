import * as THREE from 'three';
import { OutlineEffect } from 'three/examples/jsm/effects/OutlineEffect.js';
import { CHARACTERS, COMING_SOON, DEFAULT_BG, INTRO, ROOMS, START_ROOM } from './config';
import { sfx, unlockAudio } from './core/audio';
import { Character } from './entities/character';
import { Room, type Door, type Interactable } from './scene/room';
import { Fx } from './systems/fx';
import { Bubbles } from './ui/bubbles';

export interface GameHooks {
  onSelect(key: string): void;
  toast(msg: string): void;
  /** Toon-rendered head shots for the cast bar, keyed by character. */
  onPortraits?(urls: Record<string, string>): void;
}

const CAM_DIR = new THREE.Vector3(0.5, Math.SQRT1_2, 0.5).normalize(); // 45° down, from south-east
const NO_OUTLINE = { visible: false };
const FADE_MS = 320;

interface Emitter {
  at: THREE.Vector3;
  kind: 'drop' | 'bubble';
  every: number;
  acc: number;
  left: number;
  sound?: { name: string; every: number; acc: number };
}

export class Game {
  readonly renderer: THREE.WebGLRenderer;
  private readonly scene = new THREE.Scene();
  private readonly camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  private readonly outline: OutlineEffect;
  private readonly timer = new THREE.Timer();
  private readonly fx: Fx;
  private readonly ray = new THREE.Raycaster();
  private readonly rooms = new Map<string, Promise<Room>>();
  private room!: Room;
  private chars: Character[] = [];
  private selected!: Character;
  private selRing: THREE.Mesh;
  private seats = new Map<Character, Interactable>();
  private camTarget = new THREE.Vector3(0, 0.3, 0);
  private zoom = 1;
  private lightsOn = true;
  private candleLight = new THREE.PointLight(0xffb45a, 0, 2.5);
  private emitters = new Map<string, Emitter>();
  private busy = false;
  private readonly fade: HTMLDivElement;
  /** Seconds of self-rocking left for an unoccupied rocking horse. */
  private rockLeft = new Map<Interactable, number>();
  /** On/off state of toggles (lamp). */
  private toggles = new WeakMap<Interactable, boolean>();
  private readonly speech: Bubbles;
  private lastLine = new Map<Character, string>();

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

    this.speech = new Bubbles(document.body);

    this.fade = document.createElement('div');
    this.fade.className = 'fade';
    document.body.appendChild(this.fade);

    window.addEventListener('resize', () => this.resize());
    this.bindInput();
  }

  async load(onProgress: (k: number) => void) {
    let done = 0;
    const total = 1 + CHARACTERS.length;
    const tick = <T>(p: Promise<T>) => p.then((v) => (onProgress(++done / total), v));
    const [room, ...chars] = await Promise.all([
      tick(this.getRoom(START_ROOM)),
      ...CHARACTERS.map((d) => tick(Character.load(d))),
    ]);
    this.chars = chars;
    chars.forEach((c) => this.scene.add(c.root));
    this.activateRoom(START_ROOM, room);
    chars.forEach((c, i) => {
      const p = room.castSpawns[i];
      if (p) c.teleport(room.nav.nearestFree(p.x, p.z) ?? p, c.def.facing);
    });
    this.select(chars[0], false);
    this.hooks.onPortraits?.(this.renderPortraits());
    const host = chars.find((c) => c.def.key === INTRO.speaker);
    if (host) setTimeout(() => this.say(host, INTRO.text), 900);
    this.resize();
    this.snapCamera();
    this.renderer.setAnimationLoop((ts) => this.frame(ts));
    // Warm up the other rooms so doors open instantly.
    for (const key of Object.keys(ROOMS)) if (key !== START_ROOM) void this.getRoom(key);
  }

  private getRoom(key: string): Promise<Room> {
    let p = this.rooms.get(key);
    if (!p) {
      p = Room.load(ROOMS[key].model).then((room) => {
        // Foam only appears once someone takes a bath.
        for (const it of room.interactables) {
          for (const part of it.parts) if (part.name.includes('_foam')) part.scale.setScalar(0.001);
        }
        return room;
      });
      this.rooms.set(key, p);
    }
    return p;
  }

  private activateRoom(key: string, room: Room) {
    (this.scene.background as THREE.Color).set(ROOMS[key].bg ?? DEFAULT_BG);
    if (this.room) {
      this.scene.remove(this.room.root);
      for (const it of this.room.interactables) it.occupant = undefined;
    }
    this.seats.clear();
    this.emitters.clear();
    this.room = room;
    this.scene.add(room.root);
    const candle = room.interactables.find((i) => i.action === 'flicker');
    this.candleLight.intensity = 0;
    if (candle) this.candleLight.position.copy(candle.pivot.position).add(new THREE.Vector3(0, 0.25, 0));
  }

  select(c: Character, greet = true) {
    this.selected = c;
    c.root.add(this.selRing);
    this.hooks.onSelect(c.def.key);
    if (greet) {
      const pool = c.def.lines.filter((l) => l !== this.lastLine.get(c));
      this.say(c, pool[Math.floor(Math.random() * pool.length)] ?? c.def.lines[0]);
    }
  }

  /** Speech bubble above a character's head, with a little hop and voice. */
  say(c: Character, text: string) {
    this.lastLine.set(c, text);
    if (!c.busy && !c.isSitting) c.face(this.camera.position);
    c.happy();
    sfx('hi', c.def.voice);
    const tmp = new THREE.Vector3();
    this.speech.say(c, () => c.headTop(tmp), text);
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
    if (!this.room || this.busy) return;
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

  // ------------------------------------------------------------------ rooms
  private useDoor(door: Door) {
    this.walkTo(door.position, true, () => {
      if (ROOMS[door.to]) return void this.enterRoom(door);
      sfx('boing');
      this.selected.happy();
      this.hooks.toast(COMING_SOON[door.to] ?? '🚪 這扇門還沒開喔');
    });
  }

  private async enterRoom(from: Door) {
    if (this.busy) return;
    this.busy = true;
    this.speech.clear();
    sfx('door');
    this.fade.classList.add('on');
    const [room] = await Promise.all([this.getRoom(from.to), new Promise((r) => setTimeout(r, FADE_MS))]);
    this.activateRoom(from.to, room);

    // Arrive at the matching door, everyone steps a little into the room.
    const door = room.door(from.spawn) ?? room.doors[0];
    const base = door ? door.position.clone() : room.spawn.clone();
    const inward = new THREE.Vector3(-base.x, 0, -base.z).normalize();
    const side = new THREE.Vector3(-inward.z, 0, inward.x);
    const yaw = Math.atan2(inward.x, inward.z);
    const spots = [
      base.clone().addScaledVector(inward, 0.35),
      base.clone().addScaledVector(inward, 0.95).addScaledVector(side, 0.45),
      base.clone().addScaledVector(inward, 0.95).addScaledVector(side, -0.45),
    ];
    const order = [this.selected, ...this.chars.filter((c) => c !== this.selected)];
    order.forEach((c, i) => {
      const p = spots[i] ?? spots[0];
      c.teleport(room.nav.nearestFree(p.x, p.z) ?? p, yaw);
    });
    this.snapCamera();
    this.hooks.toast(ROOMS[from.to].label);
    setTimeout(() => this.fade.classList.remove('on'), 40);
    setTimeout(() => {
      this.busy = false;
      this.selected.happy();
    }, FADE_MS);
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
    c.rock = 0;
  }

  private interact(it: Interactable) {
    const c = this.selected;
    if (c.busy) return;
    if (it.action === 'slide') return this.slide(c, it);
    if (it.snap) return this.sit(c, it);

    this.react(it);
    this.walkTo(it.approach, false, () => {
      c.face(it.pivot.position);
      c.happy();
    });
  }

  /** Stools, benches and the bathtub: walk over, hop on, occupy. */
  private sit(c: Character, it: Interactable) {
    const snap = it.snap!;
    const pose = snap.userData.pose === 'bath' ? 'bath' : 'sit';
    const occ = it.occupant as Character | undefined;
    if (occ) {
      occ.happy();
      if (it.action === 'drive' || it.action === 'rock') return this.react(it);
      sfx(occ === c && pose === 'bath' ? 'splash' : 'hi', occ.def.voice);
      if (pose === 'bath') this.bubbles(it);
      else this.fx.jelly(it.pivot, 0.1);
      return;
    }
    this.fx.jelly(it.pivot, 0.12);
    sfx('tap');
    this.walkTo(it.approach, false, () => {
      if (it.occupant) return c.happy();
      it.occupant = c;
      this.seats.set(c, it);
      // Ride-ons (car, horse) face their own way; everything else faces the player.
      if (snap.userData.align) c.faceYaw(new THREE.Euler().setFromQuaternion(snap.getWorldQuaternion(new THREE.Quaternion()), 'YXZ').y);
      else c.face(this.camera.position);
      c.sitOn(snap, pose);
      this.fx.jelly(it.pivot, 0.15);
      sfx(it.sfx);
      if (pose === 'bath') setTimeout(() => this.bubbles(it), 350);
    });
  }

  /** Walk to the ladder, climb up, then whoosh down the ramp. */
  private slide(c: Character, it: Interactable) {
    const pts = this.room.fxPoints;
    const ladder = pts.get('slide_ladder');
    const ramp = [pts.get('slide_0'), pts.get('slide_1'), pts.get('slide_2')];
    if (!ladder || !it.snap || ramp.some((p) => !p)) {
      this.fx.jelly(it.pivot);
      return;
    }
    if (it.occupant) {
      (it.occupant as Character).happy();
      return;
    }
    this.fx.jelly(it.pivot, 0.06);
    sfx('tap');
    const top = it.snap.getWorldPosition(new THREE.Vector3());
    this.walkTo(ladder, false, () => {
      if (it.occupant) return c.happy();
      it.occupant = c;
      c.face(top);
      c.jump(top, 0.35, () => {
        c.face(ramp[1]!);
        sfx('hi', c.def.voice);
        setTimeout(() => {
          sfx(it.sfx);
          c.ride(ramp as THREE.Vector3[], 2.4, () => {
            it.occupant = undefined;
            c.happy();
            this.fx.burst('star', ramp[2]!.clone().setY(0.4), 7);
          });
        }, 380);
      });
    });
  }

  private bubbles(tub: Interactable) {
    const foam = tub.parts.filter((p) => p.name.includes('_foam'));
    foam.forEach((f, i) => {
      const from = f.scale.x;
      this.fx.tween(0.5 + i * 0.05, (k) => f.scale.setScalar(THREE.MathUtils.lerp(from, 1, k) * (1 + Math.sin(k * Math.PI) * 0.25)));
    });
    const top = new THREE.Box3().setFromObject(tub.pivot).max.y;
    this.fx.burst('bubble', new THREE.Vector3(tub.pivot.position.x, top, tub.pivot.position.z), 12, {
      spread: 0.35,
      up: 0.35,
      size: 0.12,
      life: 2.2,
      jitter: 0.9,
    });
  }

  private emit(key: string, at: THREE.Vector3 | undefined, e: Partial<Emitter> & Pick<Emitter, 'kind' | 'left'>) {
    if (!at) return;
    this.emitters.set(key, { at, every: 0.04, acc: 0, ...e });
  }

  /** Immediate visual + audio feedback when an object is tapped. */
  private react(it: Interactable) {
    const top = new THREE.Box3().setFromObject(it.pivot).max.y;
    const at = new THREE.Vector3(it.pivot.position.x, top + 0.05, it.pivot.position.z);
    switch (it.action) {
      case 'shower': {
        this.fx.jelly(it.pivot, 0.05);
        if (this.emitters.has('shower')) {
          this.emitters.delete('shower');
          sfx('tap');
        } else {
          sfx('water');
          this.emit('shower', this.room.fxPoints.get('shower'), {
            kind: 'drop',
            left: 8,
            every: 0.03,
            sound: { name: 'water', every: 1.1, acc: 0 },
          });
          const tub = this.room.interactables.find((i) => i.action === 'bath');
          if (tub) setTimeout(() => this.bubbles(tub), 900);
        }
        return;
      }
      case 'wash':
        sfx(it.sfx);
        this.fx.jelly(it.pivot, 0.1);
        this.emit('sink', this.room.fxPoints.get('sink'), { kind: 'drop', left: 2, every: 0.05 });
        setTimeout(() => this.fx.burst('bubble', at, 6, { spread: 0.2, up: 0.3, size: 0.08, life: 1.6 }), 600);
        return;
    }
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
      case 'glow':
      case 'sparkle': {
        this.fx.jelly(it.pivot, 0.08);
        const mats = it.parts.map((p) => p.material as THREE.MeshToonMaterial);
        mats.forEach((m) => m.emissive.set(0xfff2b0));
        this.fx.tween(1.6, (k) => mats.forEach((m) => (m.emissiveIntensity = Math.sin(k * Math.PI) * 0.9)));
        if (it.action === 'glow') this.fx.burst('note', at, 4, { spread: 0.6 });
        else this.fx.burst('star', at.setY(at.y - 0.3), 8, { spread: 0.5, up: 0.4 });
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
      case 'tv': {
        this.fx.jelly(it.pivot, 0.06);
        const screen = it.parts.find((p) => p.name === 'INT_tv') ?? it.parts[0];
        const m = screen.material as THREE.MeshToonMaterial;
        const cols = [0xf28c7a, 0xfff3c4, 0xa5dcc8, 0xa9d3f2, 0xc9b8e8];
        this.fx.tween(2.6, (k) => {
          m.emissive.setHex(cols[Math.floor(k * 13) % cols.length]);
          m.emissiveIntensity = k < 0.95 ? 0.9 : 0;
        });
        this.fx.burst('note', at, 5, { spread: 0.5 });
        break;
      }
      case 'books': {
        const books = it.parts.filter((p) => p.name.includes('_books_'));
        books.forEach((bk, i) => setTimeout(() => this.fx.jelly(bk, 0.35), i * 70));
        this.fx.burst('heart', at.setY(at.y - 0.4), 4, { spread: 0.4 });
        this.fx.burst('star', at, 3);
        break;
      }
      case 'lamp': {
        const on = !(this.toggles.get(it) ?? true);
        this.toggles.set(it, on);
        const shade = it.parts.find((p) => p.name === 'INT_lamp') ?? it.parts[0];
        (shade.material as THREE.MeshToonMaterial).emissiveIntensity = on ? 2.5 : 0;
        this.fx.jelly(it.pivot, 0.08);
        if (on) this.fx.burst('star', at, 4, { size: 0.1 });
        break;
      }
      case 'cuckoo': {
        this.fx.jelly(it.pivot, 0.1);
        const bird = it.parts.find((p) => p.name.includes('_bird'));
        const hands = it.parts.filter((p) => p.name.includes('_hand'));
        const bz = bird?.position.z ?? 0;
        this.fx.tween(1.1, (k) => {
          if (bird) bird.position.z = bz + Math.sin(k * Math.PI) * 0.12;
          hands.forEach((h, i) => (h.rotation.z = -k * Math.PI * 2 * (i ? 1 : 3)));
        });
        this.fx.burst('note', at, 3);
        break;
      }
      case 'flowers': {
        const blooms = it.parts.filter((p) => p.name.includes('_bloom'));
        blooms.forEach((bl, i) => setTimeout(() => this.fx.jelly(bl, 0.6), i * 60));
        this.fx.burst('heart', at, 6, { spread: 0.7 });
        break;
      }
      case 'shake': {
        this.fx.tween(1.2, (k) => (it.pivot.rotation.z = Math.sin(k * Math.PI * 8) * (1 - k) * 0.08));
        it.parts.filter((p) => p.name.includes('_apple')).forEach((a) => this.fx.jelly(a, 0.6));
        this.fx.burst('star', at.setY(at.y - 0.3), 6, { spread: 0.8, up: 0.2 });
        break;
      }
      case 'bounce': {
        const y0 = it.pivot.position.y;
        this.fx.tween(0.9, (k) => (it.pivot.position.y = y0 + Math.abs(Math.sin(k * Math.PI * 2)) * (1 - k) * 0.35));
        this.fx.jelly(it.pivot, 0.15);
        this.fx.burst('star', at, 4);
        break;
      }
      case 'drive': {
        const rider = it.occupant as Character | undefined;
        const lights = it.parts.filter((p) => p.name.includes('_light'));
        lights.forEach((l) => ((l.material as THREE.MeshToonMaterial).emissiveIntensity = 4));
        setTimeout(() => lights.forEach((l) => ((l.material as THREE.MeshToonMaterial).emissiveIntensity = 2.5)), 600);
        if (rider) {
          const z0 = it.pivot.position.z;
          const rz0 = rider.position.z;
          this.fx.tween(1.6, (k) => {
            const off = Math.sin(k * Math.PI) * 0.4;
            it.pivot.position.z = z0 + off;
            rider.position.z = rz0 + off;
          });
        } else {
          this.fx.jelly(it.pivot, 0.12);
        }
        this.fx.burst('note', at, 2);
        break;
      }
      case 'rock':
        this.rockLeft.set(it, 2.2);
        this.fx.burst('heart', at, 3, { size: 0.1 });
        break;
      case 'squeak':
        this.fx.jelly(it.pivot, 0.45);
        this.fx.burst('heart', at, 3, { size: 0.1 });
        this.fx.burst('note', at, 2, { size: 0.1 });
        break;
      case 'bubbles':
        this.fx.jelly(it.pivot, 0.2);
        this.fx.burst('bubble', at, 10, { spread: 0.45, up: 0.4, size: 0.1, life: 2 });
        break;
      case 'swing':
        this.fx.tween(1.2, (k) => (it.pivot.rotation.x = Math.sin(k * Math.PI * 6) * (1 - k) * 0.25));
        this.fx.burst('star', at, 3, { size: 0.1 });
        break;
      case 'toot':
        this.fx.jelly(it.pivot, 0.25);
        this.fx.burst('note', at, 4, { spread: 0.5 });
        this.fx.burst('star', at, 3);
        break;
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

  private updateEmitters(dt: number) {
    for (const [key, e] of this.emitters) {
      e.left -= dt;
      if (e.left <= 0) {
        this.emitters.delete(key);
        continue;
      }
      e.acc += dt;
      while (e.acc >= e.every) {
        e.acc -= e.every;
        this.fx.burst(e.kind, e.at, 1, { spread: 0.05, up: -0.6, size: 0.08, life: 0.42, jitter: 0.2 });
      }
      if (e.sound) {
        e.sound.acc += dt;
        if (e.sound.acc >= e.sound.every) {
          e.sound.acc = 0;
          sfx(e.sound.name);
        }
      }
    }
  }

  private updateRockers(dt: number, t: number) {
    for (const it of this.room.interactables) {
      if (it.action !== 'rock') continue;
      const rider = it.occupant as Character | undefined;
      const left = Math.max(0, (this.rockLeft.get(it) ?? 0) - dt);
      this.rockLeft.set(it, left);
      const amp = rider ? 0.16 : 0.16 * Math.min(1, left);
      const angle = Math.sin(t * 4.5) * amp;
      it.pivot.rotation.x = angle;
      if (rider) rider.rock = angle;
    }
  }

  /** Render each character's head and shoulders with the game's toon look. */
  private renderPortraits(): Record<string, string> {
    const size = 160;
    const r = this.renderer;
    const rt = new THREE.WebGLRenderTarget(size, size, { samples: 4, colorSpace: THREE.SRGBColorSpace });
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xfff6e8, 0xe0bf98, 2.2));
    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(1, 2, 3);
    scene.add(key);
    const cam = new THREE.PerspectiveCamera(26, 1, 0.05, 20);
    const prevColor = r.getClearColor(new THREE.Color());
    const prevAlpha = r.getClearAlpha();
    r.setClearColor(0x000000, 0);
    const out: Record<string, string> = {};
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const px = new Uint8Array(size * size * 4);
    for (const c of this.chars) {
      const m = c.model.clone(true);
      scene.add(m);
      const box = new THREE.Box3().setFromObject(m);
      const h = box.max.y;
      const focus = new THREE.Vector3(0, h * 0.6, 0);
      const d = (h * 0.5) / Math.tan(THREE.MathUtils.degToRad(13));
      cam.position.set(d * 0.3, focus.y + h * 0.15, d * 0.95);
      cam.lookAt(focus);
      r.setRenderTarget(rt);
      r.clear();
      this.outline.render(scene, cam);
      r.readRenderTargetPixels(rt, 0, 0, size, size, px);
      const img = ctx.createImageData(size, size);
      for (let y = 0; y < size; y++) img.data.set(px.subarray((size - 1 - y) * size * 4, (size - y) * size * 4), y * size * 4);
      ctx.putImageData(img, 0, 0);
      out[c.def.key] = canvas.toDataURL('image/png');
      scene.remove(m);
    }
    r.setRenderTarget(null);
    r.setClearColor(prevColor, prevAlpha);
    rt.dispose();
    return out;
  }

  private frame(ts: number) {
    this.timer.update(ts);
    const dt = Math.min(this.timer.getDelta(), 1 / 20);
    const t = this.timer.getElapsed();
    for (const c of this.chars) c.update(dt, t);
    this.updateEmitters(dt);
    this.updateRockers(dt, t);
    this.fx.update(dt);
    const s = 1 + Math.sin(t * 4) * 0.06;
    this.selRing.scale.set(s, s, s);
    this.camTarget.lerp(this.desiredTarget(new THREE.Vector3()), Math.min(1, dt * 2.5));
    this.placeCamera();
    this.outline.render(this.scene, this.camera);
    this.speech.update(this.camera, this.renderer.domElement);
  }
}
