import * as THREE from 'three';
import { CHAR_RADIUS, NAV_CELL } from '../config';
import { loadGLB, toonify } from '../core/assets';
import { NavGrid } from '../systems/navgrid';

export interface Interactable {
  name: string;
  action: string;
  sfx?: string;
  /** Pivot group (bottom centre of all parts) — animate this for squash/bounce. */
  pivot: THREE.Group;
  parts: THREE.Mesh[];
  snap?: THREE.Object3D;
  occupant?: unknown;
  /** Floor point a character walks to before using it. */
  approach: THREE.Vector3;
}

export interface Door {
  name: string;
  /** Room key this door leads to. */
  to: string;
  /** Name of the door in the target room where characters arrive. */
  spawn: string;
  position: THREE.Vector3;
}

/** Extra parts that belong to an interactable but don't share its name prefix. */
const ALIASES: Record<string, string[]> = {
  sign_CAFES: ['sign_board'],
  candle: ['side_table'],
  string_bulb_01: ['string_bulb_', 'string_lights_cord'],
};

const FLOOR_LIKE = /^(floor|rug|doormat|NAV_|COL_)/;

export class Room {
  readonly root = new THREE.Group();
  readonly interactables: Interactable[] = [];
  readonly partOwner = new Map<THREE.Object3D, Interactable>();
  readonly doors: Door[] = [];
  readonly doorParts = new Map<THREE.Object3D, Door>();
  readonly pickables: THREE.Object3D[] = [];
  /** Effect emit points from FX_* empties, keyed by their `fx` property. */
  readonly fxPoints = new Map<string, THREE.Vector3>();
  nav!: NavGrid;
  spawn = new THREE.Vector3();
  /** Start spots for the cast (SPAWN_cast_* sorted by name), used when the game starts here. */
  readonly castSpawns: THREE.Vector3[] = [];

  static async load(url: string): Promise<Room> {
    const gltf = await loadGLB(url);
    const room = new Room();
    room.root.add(gltf.scene);
    room.parse(gltf.scene);
    return room;
  }

  private parse(scene: THREE.Object3D) {
    scene.updateMatrixWorld(true);

    let navMesh: THREE.Object3D | undefined;
    const snaps: THREE.Object3D[] = [];
    const spawns: THREE.Object3D[] = [];
    const meshes: THREE.Mesh[] = [];
    scene.traverse((o) => {
      if (o.name.startsWith('NAV_')) navMesh = o;
      else if (o.name.startsWith('SNAP_')) snaps.push(o);
      else if (o.name.startsWith('SPAWN_cast')) spawns.push(o);
      else if (o.name.startsWith('SPAWN_')) o.getWorldPosition(this.spawn);
      else if (o.name.startsWith('DOOR_')) {
        this.doors.push({
          name: o.name,
          to: String(o.userData.to ?? ''),
          spawn: String(o.userData.spawn ?? ''),
          position: o.getWorldPosition(new THREE.Vector3()),
        });
      } else if (o.name.startsWith('FX_')) {
        this.fxPoints.set(String(o.userData.fx ?? o.name.slice(3)), o.getWorldPosition(new THREE.Vector3()));
      }
      if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh);
    });
    spawns.sort((a, b) => a.name.localeCompare(b.name));
    for (const o of spawns) this.castSpawns.push(o.getWorldPosition(new THREE.Vector3()));
    if (navMesh) navMesh.visible = false;
    scene.traverse((o) => {
      if (o.name.startsWith('COL_')) o.visible = false;
    });

    toonify(scene, { castShadow: true, receiveShadow: true });
    // Floors and walls should not cast onto themselves weirdly; tiny things don't need to cast.
    for (const m of meshes) {
      if (FLOOR_LIKE.test(m.name)) m.castShadow = false;
    }

    // Group interactables with their parts under a pivot at their bottom centre.
    const claimed = new Set<THREE.Object3D>();
    const ints = meshes.filter((m) => m.name.startsWith('INT_'));
    for (const head of ints) {
      const key = head.name.slice(4);
      const prefixes = [key, ...(ALIASES[key] ?? [])];
      const parts = meshes.filter((m) => !claimed.has(m) && (m === head || prefixes.some((p) => m.name.startsWith(p))));
      parts.forEach((p) => claimed.add(p));
      const box = new THREE.Box3();
      parts.forEach((p) => box.expandByObject(p));
      const pivot = new THREE.Group();
      pivot.name = `PIVOT_${key}`;
      box.getCenter(pivot.position);
      pivot.position.y = box.min.y;
      scene.add(pivot);
      pivot.updateMatrixWorld();
      parts.forEach((p) => pivot.attach(p));

      // Give animated interactables their own material so glow/tint doesn't leak.
      for (const p of parts) p.material = (p.material as THREE.Material).clone();

      const it: Interactable = {
        name: key,
        action: String(head.userData.action ?? 'bounce'),
        sfx: head.userData.sfx as string | undefined,
        pivot,
        parts,
        approach: new THREE.Vector3(),
      };
      this.interactables.push(it);
      parts.forEach((p) => this.partOwner.set(p, it));
    }
    for (const s of snaps) {
      const owner = String(s.userData.owner ?? '').replace(/^INT_/, '');
      const it = this.interactables.find((i) => i.name === owner);
      if (it) it.snap = s;
    }

    for (const m of meshes) {
      if (/^door(mat|way)/.test(m.name) && this.doors.length) this.doorParts.set(m, this.nearestDoor(m.getWorldPosition(new THREE.Vector3())));
      if (m.visible) this.pickables.push(m);
    }

    // Bake the walk grid.
    const bounds = new THREE.Box3().setFromObject(navMesh ?? scene);
    // Things that move at runtime (e.g. rollable balls, `dynamic` on the INT head) stay out of the baked grid.
    const dynamicParts = new Set(
      this.interactables.filter((i) => i.parts.some((p) => p.userData.dynamic)).flatMap((i) => i.parts),
    );
    const obstacles = meshes.filter((m) => !FLOOR_LIKE.test(m.name) && !dynamicParts.has(m));
    this.nav = NavGrid.bake(bounds, obstacles, NAV_CELL, CHAR_RADIUS);

    for (const it of this.interactables) {
      const target = it.snap ? it.snap.getWorldPosition(new THREE.Vector3()) : it.pivot.position.clone();
      it.approach.copy(this.nav.nearestFree(target.x, target.z) ?? target).setY(0);
    }
    for (const d of this.doors) {
      const p = this.nav.nearestFree(d.position.x, d.position.z);
      if (p) d.position.copy(p);
    }
  }

  private nearestDoor(p: THREE.Vector3): Door {
    return this.doors.reduce((a, b) => (a.position.distanceTo(p) <= b.position.distanceTo(p) ? a : b));
  }

  door(name: string): Door | undefined {
    return this.doors.find((d) => d.name === name);
  }
}
