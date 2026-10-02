import * as THREE from 'three';
import { CHAR_RADIUS } from '../config';
import { sfx } from '../core/audio';
import type { Character } from '../entities/character';
import type { Interactable, Room } from '../scene/room';
import type { Fx } from './fx';

interface Roller {
  it: Interactable;
  spinner: THREE.Group;
  r: number;
  vel: THREE.Vector3;
}

interface Swing {
  it: Interactable;
  spinner: THREE.Group;
  axis: THREE.Vector3;
  seatRest: THREE.Vector3;
  amp: number;
}

interface Trampoline {
  it: Interactable;
  mat: THREE.Object3D;
  matY: number;
  phase: number;
  boost: number;
}

const UP = new THREE.Vector3(0, 1, 0);

/**
 * Moving play equipment: rollable giant balls (pushed by taps and by
 * characters walking into them, bouncing off walls/furniture and each
 * other), a pendulum swing that carries its rider, and a trampoline that
 * keeps its rider bouncing.
 */
export class Playground {
  private readonly ready = new WeakSet<Room>();
  private readonly allRollers: Roller[] = [];
  private readonly allSwings: Swing[] = [];
  private readonly allTramps: Trampoline[] = [];
  /** Rigs belonging to the room that is currently on screen. */
  private active = { rollers: [] as Roller[], swings: [] as Swing[], tramps: [] as Trampoline[] };
  private readonly byIt = new Map<Interactable, Roller | Swing | Trampoline>();

  constructor(private readonly fx: Fx) {}

  /** Called whenever a room becomes active; builds the moving rigs the first time. */
  enter(room: Room) {
    if (!this.ready.has(room)) {
      this.ready.add(room);
      for (const it of room.interactables) {
        if (it.action === 'roll') this.addRoller(it);
        else if (it.action === 'swingseat') this.addSwing(it, room.fxPoints.get('swing_axis'));
        else if (it.action === 'trampoline') this.addTrampoline(it);
      }
    }
    const mine = (x: { it: Interactable }) => room.interactables.includes(x.it);
    this.active = {
      rollers: this.allRollers.filter(mine),
      swings: this.allSwings.filter(mine),
      tramps: this.allTramps.filter(mine),
    };
  }

  /** Re-parent an interactable's parts under a new group at `localPos` inside its pivot. */
  private spinnerAt(it: Interactable, localPos: THREE.Vector3) {
    const g = new THREE.Group();
    g.position.copy(localPos);
    it.pivot.add(g);
    it.pivot.updateMatrixWorld(true);
    for (const p of it.parts) g.attach(p);
    return g;
  }

  private addRoller(it: Interactable) {
    const box = new THREE.Box3().setFromObject(it.pivot);
    const r = (box.max.y - box.min.y) / 2;
    const rl: Roller = { it, r, vel: new THREE.Vector3(), spinner: this.spinnerAt(it, new THREE.Vector3(0, r, 0)) };
    this.allRollers.push(rl);
    this.byIt.set(it, rl);
  }

  private addSwing(it: Interactable, axisWorld?: THREE.Vector3) {
    if (!axisWorld || !it.snap) return;
    const local = it.pivot.worldToLocal(axisWorld.clone());
    const sw: Swing = {
      it,
      axis: axisWorld.clone(),
      seatRest: it.snap.getWorldPosition(new THREE.Vector3()),
      amp: 0,
      spinner: this.spinnerAt(it, local),
    };
    this.allSwings.push(sw);
    this.byIt.set(it, sw);
  }

  private addTrampoline(it: Interactable) {
    const mat = it.parts.find((p) => p.name.startsWith('INT_')) ?? it.parts[0];
    const tr: Trampoline = { it, mat, matY: mat.position.y, phase: 0, boost: 0 };
    this.allTramps.push(tr);
    this.byIt.set(it, tr);
  }

  // ------------------------------------------------------------------ actions
  /** Tap on a giant ball: it rolls away from whoever kicked it. */
  kick(it: Interactable, from: THREE.Vector3) {
    const rl = this.byIt.get(it) as Roller | undefined;
    if (!rl) return;
    const dir = new THREE.Vector3(it.pivot.position.x - from.x, 0, it.pivot.position.z - from.z);
    if (dir.lengthSq() < 1e-4) dir.set(Math.random() - 0.5, 0, Math.random() - 0.5);
    rl.vel.addScaledVector(dir.normalize(), 2.4);
  }

  /** Rider (or tap) pushes the swing higher. */
  push(it: Interactable) {
    const sw = this.byIt.get(it) as Swing | undefined;
    if (sw) sw.amp = Math.min(0.62, Math.max(sw.amp, 0.3) + 0.14);
  }

  /** Extra-high bounces on the trampoline. */
  boost(it: Interactable) {
    const tr = this.byIt.get(it) as Trampoline | undefined;
    if (tr) tr.boost = 2;
  }

  // ------------------------------------------------------------------ simulation
  update(dt: number, t: number, room: Room, chars: Character[]) {
    this.updateRollers(dt, room, chars);
    this.updateSwings(dt, t);
    this.updateTrampolines(dt);
  }

  private ballFree(nav: Room['nav'], x: number, z: number, r: number) {
    // The grid is dilated by the character radius; probe the ball's rim for the rest.
    const e = Math.max(0, r - CHAR_RADIUS);
    return (
      nav.isFree(x, z) && nav.isFree(x + e, z) && nav.isFree(x - e, z) && nav.isFree(x, z + e) && nav.isFree(x, z - e)
    );
  }

  private updateRollers(dt: number, room: Room, chars: Character[]) {
    const nav = room.nav;
    const rs = this.active.rollers;
    for (const rl of rs) {
      const p = rl.it.pivot.position;
      // characters bump the ball (and get nudged back a little)
      for (const c of chars) {
        if (!c.onFloor) continue;
        const dx = p.x - c.position.x;
        const dz = p.z - c.position.z;
        const d = Math.hypot(dx, dz) || 1e-4;
        const min = rl.r + CHAR_RADIUS;
        if (d >= min) continue;
        const over = min - d;
        rl.vel.x += (dx / d) * over * (c.walking ? 14 : 6);
        rl.vel.z += (dz / d) * over * (c.walking ? 14 : 6);
        const bx = c.position.x - (dx / d) * over * 0.3;
        const bz = c.position.z - (dz / d) * over * 0.3;
        if (nav.isFree(bx, bz)) c.position.set(bx, c.position.y, bz);
      }
    }
    // ball vs ball
    for (let i = 0; i < rs.length; i++) {
      for (let j = i + 1; j < rs.length; j++) {
        const a = rs[i];
        const b = rs[j];
        const pa = a.it.pivot.position;
        const pb = b.it.pivot.position;
        const dx = pa.x - pb.x;
        const dz = pa.z - pb.z;
        const d = Math.hypot(dx, dz) || 1e-4;
        const min = a.r + b.r;
        if (d >= min) continue;
        const nx = dx / d;
        const nz = dz / d;
        const rel = (a.vel.x - b.vel.x) * nx + (a.vel.z - b.vel.z) * nz;
        if (rel < 0) {
          a.vel.x -= rel * nx;
          a.vel.z -= rel * nz;
          b.vel.x += rel * nx;
          b.vel.z += rel * nz;
          if (rel < -0.6) sfx('pop');
        }
      }
    }
    for (const rl of rs) {
      const p = rl.it.pivot.position;
      const speed = Math.hypot(rl.vel.x, rl.vel.z);
      if (speed < 0.01) {
        rl.vel.set(0, 0, 0);
        continue;
      }
      const nx = p.x + rl.vel.x * dt;
      const nz = p.z + rl.vel.z * dt;
      if (this.ballFree(nav, nx, nz, rl.r)) {
        p.x = nx;
        p.z = nz;
      } else {
        // bounce: keep whichever axis is still free, flip the other
        const okX = this.ballFree(nav, nx, p.z, rl.r);
        const okZ = this.ballFree(nav, p.x, nz, rl.r);
        if (okX) p.x = nx;
        else rl.vel.x *= -0.55;
        if (okZ) p.z = nz;
        else rl.vel.z *= -0.55;
        if (speed > 0.8) {
          sfx('boing');
          this.fx.jelly(rl.it.pivot, 0.12);
        }
      }
      // roll: angular velocity = (up x v) / r
      const axis = new THREE.Vector3().crossVectors(UP, rl.vel);
      const len = axis.length();
      if (len > 1e-5) {
        rl.spinner.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(axis.divideScalar(len), (speed * dt) / rl.r));
      }
      rl.vel.multiplyScalar(Math.exp(-1.4 * dt));
    }
  }

  private updateSwings(dt: number, t: number) {
    for (const sw of this.active.swings) {
      const rider = sw.it.occupant as Character | undefined;
      const seated = !!rider && rider.isSitting && !rider.busy;
      const target = seated ? 0.3 : 0;
      sw.amp += (target - sw.amp) * Math.min(1, dt * (sw.amp > target ? 0.35 : 1.5));
      const angle = Math.sin(t * 3.1) * sw.amp;
      sw.spinner.rotation.x = angle;
      if (rider && seated) {
        const off = sw.seatRest.clone().sub(sw.axis).applyAxisAngle(new THREE.Vector3(1, 0, 0), angle);
        rider.position.copy(sw.axis).add(off);
        rider.rock = angle * 0.7;
      }
    }
  }

  private updateTrampolines(dt: number) {
    for (const tr of this.active.tramps) {
      const rider = tr.it.occupant as Character | undefined;
      if (!rider || !rider.isSitting || rider.busy) {
        tr.mat.position.y = tr.matY;
        tr.phase = 0;
        continue;
      }
      const h = tr.boost > 0 ? 0.6 : 0.32;
      const period = tr.boost > 0 ? 0.9 : 0.62;
      tr.phase += dt / period;
      if (tr.phase >= 1) {
        tr.phase -= 1;
        if (tr.boost > 0) tr.boost--;
        sfx(tr.boost > 0 ? 'boing' : 'hop');
      }
      const k = tr.phase;
      rider.lift = 4 * h * k * (1 - k);
      // the mat dips while the rider is down on it
      const dip = Math.max(0, 0.06 - rider.lift) / 0.06;
      tr.mat.position.y = tr.matY - dip * 0.05;
    }
  }
}
