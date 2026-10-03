import * as THREE from 'three';
import { sfx } from '../core/audio';
import type { Character } from '../entities/character';
import type { Interactable, Room } from '../scene/room';

type Mode = 'away' | 'fly' | 'idle' | 'walk' | 'hop';

interface Critter {
  it: Interactable;
  kind: 'bird' | 'chick';
  /** Yaw the model was built facing (so we can turn it to any heading). */
  baseYaw: number;
  mode: Mode;
  timer: number;
  from: THREE.Vector3;
  to: THREE.Vector3;
  t: number;
  dur: number;
  peck: number;
  wings: THREE.Object3D[];
  wingBase: number[];
  headParts: THREE.Object3D[];
  headBase: number[];
}

interface Area {
  min: THREE.Vector2;
  max: THREE.Vector2;
}

/**
 * Little animals: birds that fly in, hop about the lawn pecking, and take
 * off when tapped or when someone walks up; chicks that potter about their
 * pen and hop when tapped. Their meshes are `dynamic` (not in the walk grid).
 */
export class Critters {
  private readonly ready = new WeakSet<Room>();
  private readonly all: Critter[] = [];
  private readonly areas = new WeakMap<Room, { lawn?: Area; pen?: Area }>();
  private active: Critter[] = [];
  private room?: Room;

  enter(room: Room) {
    this.room = room;
    if (!this.ready.has(room)) {
      this.ready.add(room);
      const area = (a?: THREE.Vector3, b?: THREE.Vector3): Area | undefined =>
        a && b
          ? {
              min: new THREE.Vector2(Math.min(a.x, b.x), Math.min(a.z, b.z)),
              max: new THREE.Vector2(Math.max(a.x, b.x), Math.max(a.z, b.z)),
            }
          : undefined;
      const fx = room.fxPoints;
      this.areas.set(room, { lawn: area(fx.get('lawn_a'), fx.get('lawn_b')), pen: area(fx.get('pen_a'), fx.get('pen_b')) });
      for (const it of room.interactables) {
        if (it.action === 'bird' || it.action === 'chick') this.all.push(this.make(it, it.action));
      }
    }
    this.active = this.all.filter((c) => room.interactables.includes(c.it));
    // Birds fly in one after another every time you come into the room.
    this.active.forEach((c, i) => {
      if (c.kind === 'bird') {
        c.mode = 'away';
        c.timer = 0.6 + i * 1.1;
        c.it.pivot.visible = false;
      }
    });
  }

  private make(it: Interactable, kind: 'bird' | 'chick'): Critter {
    const beak = it.parts.find((p) => p.name.includes('_beak'));
    const p = it.pivot.position;
    const bw = beak ? beak.getWorldPosition(new THREE.Vector3()) : p.clone().add(new THREE.Vector3(0, 0, 1));
    const wings = it.parts.filter((m) => m.name.includes('_wing_'));
    const headParts = it.parts.filter((m) => /_(head|beak|eye_)/.test(m.name));
    return {
      it,
      kind,
      baseYaw: Math.atan2(bw.x - p.x, bw.z - p.z),
      mode: 'idle',
      timer: 1 + Math.random() * 2,
      from: p.clone(),
      to: p.clone(),
      t: 0,
      dur: 1,
      peck: 0,
      wings,
      wingBase: wings.map((w) => w.position.y),
      headParts,
      headBase: headParts.map((h) => h.position.y),
    };
  }

  private areaFor(c: Critter): Area | undefined {
    const a = this.room && this.areas.get(this.room);
    return c.kind === 'bird' ? a?.lawn : a?.pen;
  }

  private randomSpot(c: Critter) {
    const a = this.areaFor(c);
    if (!a) return c.it.pivot.position.clone();
    return new THREE.Vector3(
      THREE.MathUtils.lerp(a.min.x, a.max.x, Math.random()),
      0,
      THREE.MathUtils.lerp(a.min.y, a.max.y, Math.random()),
    );
  }

  private face(c: Critter, target: THREE.Vector3) {
    const p = c.it.pivot.position;
    const yaw = Math.atan2(target.x - p.x, target.z - p.z);
    c.it.pivot.rotation.y = yaw - c.baseYaw;
  }

  private go(c: Critter, mode: 'fly' | 'walk' | 'hop', to: THREE.Vector3, dur: number) {
    c.mode = mode;
    c.from = c.it.pivot.position.clone();
    c.to = to;
    c.t = 0;
    c.dur = dur;
    if (mode !== 'hop') this.face(c, to);
  }

  /** Bird takes off to somewhere off-screen (tap or startled). */
  private flyAway(c: Critter) {
    if (c.mode === 'fly' || c.mode === 'away') return;
    const p = c.it.pivot.position;
    const dir = new THREE.Vector2(p.x, p.z);
    if (dir.lengthSq() < 0.01) dir.set(1, -1);
    dir.normalize().multiplyScalar(6);
    this.go(c, 'fly', new THREE.Vector3(dir.x, 2.6, dir.y), 1.6);
    sfx('tweet');
  }

  tap(it: Interactable) {
    const c = this.active.find((x) => x.it === it);
    if (!c) return;
    if (c.kind === 'bird') this.flyAway(c);
    else {
      sfx('peep');
      const p = c.it.pivot.position;
      this.go(c, 'hop', p.clone(), 0.45);
    }
  }

  update(dt: number, t: number, chars: Character[]) {
    for (const c of this.active) {
      const pv = c.it.pivot;
      const p = pv.position;
      // birds take off if someone walks right up to them
      if (c.kind === 'bird' && (c.mode === 'idle' || c.mode === 'walk')) {
        if (chars.some((ch) => ch.walking && Math.hypot(ch.position.x - p.x, ch.position.z - p.z) < 0.6)) {
          this.flyAway(c);
        }
      }
      let flap = 0;
      let bob = 0;
      switch (c.mode) {
        case 'away':
          c.timer -= dt;
          if (c.timer <= 0) {
            // re-enter from high up outside the fence and glide down onto the lawn
            const land = this.randomSpot(c);
            const a = Math.random() * Math.PI * 2;
            p.set(Math.cos(a) * 6, 2.8, Math.sin(a) * 6);
            pv.visible = true;
            this.go(c, 'fly', land, 2.2);
          }
          break;
        case 'fly': {
          c.t += dt / c.dur;
          const k = Math.min(1, c.t);
          const e = k * k * (3 - 2 * k);
          p.lerpVectors(c.from, c.to, e);
          p.y += Math.sin(Math.PI * k) * 0.8;
          flap = Math.sin(t * 32);
          if (k >= 1) {
            if (c.to.y > 1) {
              c.mode = 'away';
              c.timer = 3 + Math.random() * 4;
              pv.visible = false;
            } else {
              p.y = 0;
              c.mode = 'idle';
              c.timer = 1 + Math.random() * 2;
            }
          }
          break;
        }
        case 'walk':
        case 'hop': {
          c.t += dt / c.dur;
          const k = Math.min(1, c.t);
          p.lerpVectors(c.from, c.to, k);
          const hops = c.mode === 'hop' ? 1 : Math.max(1, Math.round(c.from.distanceTo(c.to) / 0.12));
          p.y = Math.abs(Math.sin(k * Math.PI * hops)) * (c.mode === 'hop' ? 0.18 : 0.04);
          if (c.mode === 'hop') flap = Math.sin(t * 30) * 0.6;
          if (k >= 1) {
            p.y = 0;
            c.mode = 'idle';
            c.timer = 0.8 + Math.random() * 2;
          }
          break;
        }
        case 'idle':
          c.timer -= dt;
          c.peck += dt;
          bob = Math.max(0, Math.sin(c.peck * 9)) * (Math.sin(c.peck * 1.3) > 0.3 ? 1 : 0);
          if (c.timer <= 0) {
            const to = this.randomSpot(c);
            const d = to.distanceTo(p);
            this.go(c, 'walk', to, Math.max(0.6, d / (c.kind === 'bird' ? 0.35 : 0.25)));
          }
          break;
      }
      for (let i = 0; i < c.wings.length; i++) c.wings[i].position.y = c.wingBase[i] + flap * 0.035;
      for (let i = 0; i < c.headParts.length; i++) c.headParts[i].position.y = c.headBase[i] - bob * 0.05;
    }
  }
}
