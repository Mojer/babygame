import * as THREE from 'three';
import { WALK_SPEED, type CharacterDef } from '../config';
import { loadGLB, toonify } from '../core/assets';
import { sfx } from '../core/audio';

type State = 'idle' | 'walk' | 'hop' | 'sit';

interface Limb {
  obj: THREE.Object3D;
  base: THREE.Vector3;
  side: number;
}

/**
 * Chibi character with procedural animation (no rig yet): waddle walk,
 * breathing idle, blinking, hop onto seats, happy jump.
 */
export class Character {
  readonly root = new THREE.Group();
  /** Inner node that carries bob / squash so root stays on the floor. */
  private readonly body = new THREE.Group();
  private legs: Limb[] = [];
  private arms: Limb[] = [];
  private eyes: THREE.Object3D[] = [];
  private state: State = 'idle';
  private path: THREE.Vector3[] = [];
  private onArrive?: () => void;
  private phase = 0;
  private stepAcc = 0;
  private yaw = 0;
  private targetYaw = 0;
  private happyT = -1;
  private blinkT = 2 + Math.random() * 3;
  private hopFrom = new THREE.Vector3();
  private hopTo = new THREE.Vector3();
  private hopT = 0;
  private hopArc = 0.28;
  private hopDone?: () => void;
  /** Floor position the character left when it sat down. */
  private standSpot = new THREE.Vector3();
  seat?: THREE.Object3D;
  /** How the character rests on its seat: perched on a stool, or sunk into a tub. */
  private pose: 'sit' | 'bath' = 'sit';
  readonly pickables: THREE.Object3D[] = [];

  private constructor(readonly def: CharacterDef) {}

  static async load(def: CharacterDef): Promise<Character> {
    const gltf = await loadGLB(`models/char_${def.key}.glb`);
    const c = new Character(def);
    const model = gltf.scene;
    toonify(model, { castShadow: true, receiveShadow: false });
    c.body.add(model);
    c.root.add(c.body);
    c.root.position.set(def.spawn[0], 0, def.spawn[1]);
    c.yaw = c.targetYaw = def.facing;
    c.root.rotation.y = c.yaw;
    model.traverse((o) => {
      const n = o.name;
      if ((o as THREE.Mesh).isMesh) c.pickables.push(o);
      if (/_leg_[LR]$/.test(n)) c.legs.push({ obj: o, base: o.position.clone(), side: n.endsWith('L') ? -1 : 1 });
      if (/_arm_[LR]$/.test(n)) c.arms.push({ obj: o, base: o.position.clone(), side: n.endsWith('L') ? -1 : 1 });
      if (/_eye_(hi_)?-?1$/.test(n)) c.eyes.push(o);
    });
    return c;
  }

  get position() {
    return this.root.position;
  }

  get isSitting() {
    return this.state === 'sit' || (this.state === 'hop' && !!this.seat);
  }

  walk(path: THREE.Vector3[], onArrive?: () => void) {
    if (this.state === 'hop') return;
    const go = () => {
      this.path = path.map((p) => p.clone());
      this.onArrive = onArrive;
      this.state = this.path.length ? 'walk' : 'idle';
      if (!this.path.length) onArrive?.();
    };
    if (this.state === 'sit') this.standUp(go);
    else go();
  }

  sitOn(seat: THREE.Object3D, pose: 'sit' | 'bath' = 'sit') {
    this.standSpot.copy(this.root.position);
    this.seat = seat;
    this.pose = pose;
    const to = seat.getWorldPosition(new THREE.Vector3());
    this.startHop(to, () => {
      this.state = 'sit';
    });
  }

  standUp(done?: () => void) {
    if (!this.seat) return done?.();
    this.seat = undefined;
    this.startHop(this.standSpot.clone(), () => {
      this.state = 'idle';
      done?.();
    });
  }

  happy() {
    this.happyT = 0;
  }

  /** Instantly place the character (used when entering a room). */
  teleport(pos: THREE.Vector3, yaw: number) {
    this.root.position.copy(pos).setY(0);
    this.path = [];
    this.onArrive = undefined;
    this.hopDone = undefined;
    this.seat = undefined;
    this.state = 'idle';
    this.yaw = this.targetYaw = yaw;
    this.root.rotation.y = yaw;
  }

  face(point: THREE.Vector3) {
    this.targetYaw = Math.atan2(point.x - this.root.position.x, point.z - this.root.position.z);
  }

  private startHop(to: THREE.Vector3, done: () => void) {
    this.hopFrom.copy(this.root.position);
    this.hopTo.copy(to);
    this.hopT = 0;
    this.hopArc = this.pose === 'bath' ? 0.6 : 0.28;
    this.hopDone = done;
    this.state = 'hop';
    sfx('hop');
  }

  update(dt: number, t: number) {
    const body = this.body;
    let bob = 0;
    let tilt = 0;
    let squash = 1;
    let swing = 0;

    if (this.state === 'walk') {
      const target = this.path[0];
      const pos = this.root.position;
      const dx = target.x - pos.x;
      const dz = target.z - pos.z;
      const d = Math.hypot(dx, dz);
      const step = WALK_SPEED * dt;
      if (d <= step) {
        pos.x = target.x;
        pos.z = target.z;
        this.path.shift();
        if (!this.path.length) {
          this.state = 'idle';
          const cb = this.onArrive;
          this.onArrive = undefined;
          cb?.();
        }
      } else {
        pos.x += (dx / d) * step;
        pos.z += (dz / d) * step;
        this.targetYaw = Math.atan2(dx, dz);
      }
      this.phase += dt * 11;
      bob = Math.abs(Math.sin(this.phase)) * 0.035;
      tilt = Math.sin(this.phase) * 0.09;
      swing = Math.sin(this.phase);
      this.stepAcc += dt;
      if (this.stepAcc > Math.PI / 11) {
        this.stepAcc = 0;
        sfx('step');
      }
    } else if (this.state === 'hop') {
      this.hopT = Math.min(1, this.hopT + dt / 0.38);
      const k = this.hopT;
      this.root.position.lerpVectors(this.hopFrom, this.hopTo, k);
      this.root.position.y += Math.sin(Math.PI * k) * this.hopArc;
      squash = 1 + Math.sin(Math.PI * k) * 0.08;
      if (k >= 1) {
        const done = this.hopDone;
        this.hopDone = undefined;
        done?.();
      }
    } else {
      squash = 1 + Math.sin(t * 2.4) * 0.015;
    }

    if (this.happyT >= 0) {
      this.happyT += dt;
      const k = this.happyT / 0.9;
      if (k >= 1) this.happyT = -1;
      else {
        bob += Math.abs(Math.sin(k * Math.PI * 2)) * 0.12;
        squash *= 1 + Math.sin(k * Math.PI * 4) * 0.06;
      }
    }

    const sitting = this.state === 'sit';
    body.position.y = bob + (sitting ? (this.pose === 'bath' ? 0 : -0.1) : 0);
    body.rotation.z = tilt;
    body.scale.set(1 / Math.sqrt(squash), squash, 1 / Math.sqrt(squash));

    for (const l of this.legs) {
      l.obj.position.copy(l.base);
      l.obj.position.z += sitting ? 0.07 : swing * l.side * 0.035;
      if (sitting) l.obj.position.y += 0.035;
    }
    const cheer = this.happyT >= 0 ? 0.08 : 0;
    for (const a of this.arms) {
      a.obj.position.copy(a.base);
      a.obj.position.z -= swing * a.side * 0.03;
      a.obj.position.y += cheer;
    }

    // Blink.
    this.blinkT -= dt;
    const closed = this.blinkT < 0.12;
    if (this.blinkT < 0) this.blinkT = 2.5 + Math.random() * 3;
    for (const e of this.eyes) e.scale.y = closed ? 0.15 : 1;

    // Turn smoothly.
    let dy = this.targetYaw - this.yaw;
    dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    this.yaw += dy * Math.min(1, dt * 10);
    this.root.rotation.y = this.yaw;
  }
}
