import * as THREE from 'three';

/**
 * Walkable grid baked at load time by raycasting straight down onto the room.
 * Any hit between 3 cm and 1.7 m is furniture/wall; the result is then
 * dilated by the character radius.
 */
export class NavGrid {
  readonly blocked: Uint8Array;

  private constructor(
    readonly minX: number,
    readonly minZ: number,
    readonly cols: number,
    readonly rows: number,
    readonly cell: number,
  ) {
    this.blocked = new Uint8Array(cols * rows);
  }

  static bake(bounds: THREE.Box3, obstacles: THREE.Object3D[], cell: number, radius: number): NavGrid {
    const cols = Math.round((bounds.max.x - bounds.min.x) / cell);
    const rows = Math.round((bounds.max.z - bounds.min.z) / cell);
    const g = new NavGrid(bounds.min.x, bounds.min.z, cols, rows, cell);
    const ray = new THREE.Raycaster();
    const down = new THREE.Vector3(0, -1, 0);
    const origin = new THREE.Vector3();
    const solid = new Uint8Array(cols * rows);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        origin.set(g.minX + (c + 0.5) * cell, 3, g.minZ + (r + 0.5) * cell);
        ray.set(origin, down);
        const hit = ray.intersectObjects(obstacles, true)[0];
        if (hit && hit.point.y > 0.03 && hit.point.y < 1.7) solid[r * cols + c] = 1;
      }
    }
    const k = Math.ceil(radius / cell);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!solid[r * cols + c]) continue;
        for (let dr = -k; dr <= k; dr++) {
          for (let dc = -k; dc <= k; dc++) {
            if (dr * dr + dc * dc > k * k + 0.5) continue;
            const rr = r + dr;
            const cc = c + dc;
            if (rr >= 0 && rr < rows && cc >= 0 && cc < cols) g.blocked[rr * cols + cc] = 1;
          }
        }
      }
    }
    g.keepLargestRegion();
    return g;
  }

  /** Block every walkable pocket that is not connected to the main floor area. */
  private keepLargestRegion() {
    const n = this.cols * this.rows;
    const region = new Int32Array(n).fill(-1);
    const sizes: number[] = [];
    const stack: number[] = [];
    for (let start = 0; start < n; start++) {
      if (this.blocked[start] || region[start] >= 0) continue;
      const id = sizes.length;
      let size = 0;
      stack.push(start);
      region[start] = id;
      while (stack.length) {
        const i = stack.pop()!;
        size++;
        const c = i % this.cols;
        const r = (i / this.cols) | 0;
        for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nc = c + dc;
          const nr = r + dr;
          if (!this.freeCell(nc, nr)) continue;
          const ni = this.idx(nc, nr);
          if (region[ni] < 0) {
            region[ni] = id;
            stack.push(ni);
          }
        }
      }
      sizes.push(size);
    }
    const main = sizes.indexOf(Math.max(...sizes));
    for (let i = 0; i < n; i++) if (region[i] >= 0 && region[i] !== main) this.blocked[i] = 1;
  }

  private idx(c: number, r: number) {
    return r * this.cols + c;
  }

  toCell(x: number, z: number): [number, number] {
    return [Math.floor((x - this.minX) / this.cell), Math.floor((z - this.minZ) / this.cell)];
  }

  toWorld(c: number, r: number, out = new THREE.Vector3()) {
    return out.set(this.minX + (c + 0.5) * this.cell, 0, this.minZ + (r + 0.5) * this.cell);
  }

  freeCell(c: number, r: number) {
    return c >= 0 && r >= 0 && c < this.cols && r < this.rows && !this.blocked[this.idx(c, r)];
  }

  isFree(x: number, z: number) {
    const [c, r] = this.toCell(x, z);
    return this.freeCell(c, r);
  }

  /** Nearest walkable point to (x, z), searching outward in rings. */
  nearestFree(x: number, z: number, maxRing = 30): THREE.Vector3 | null {
    const [c0, r0] = this.toCell(x, z);
    if (this.freeCell(c0, r0)) return this.toWorld(c0, r0);
    let best: THREE.Vector3 | null = null;
    let bestD = Infinity;
    for (let ring = 1; ring <= maxRing && !best; ring++) {
      for (let dr = -ring; dr <= ring; dr++) {
        for (let dc = -ring; dc <= ring; dc++) {
          if (Math.max(Math.abs(dr), Math.abs(dc)) !== ring) continue;
          if (!this.freeCell(c0 + dc, r0 + dr)) continue;
          const d = dr * dr + dc * dc;
          if (d < bestD) {
            bestD = d;
            best = this.toWorld(c0 + dc, r0 + dr);
          }
        }
      }
    }
    return best;
  }

  /** A* over 8-connected cells (no corner cutting), then string-pulled. */
  findPath(from: THREE.Vector3, to: THREE.Vector3): THREE.Vector3[] | null {
    const start = this.nearestFree(from.x, from.z);
    const goal = this.nearestFree(to.x, to.z);
    if (!start || !goal) return null;
    const [sc, sr] = this.toCell(start.x, start.z);
    const [gc, gr] = this.toCell(goal.x, goal.z);
    const n = this.cols * this.rows;
    const gScore = new Float32Array(n).fill(Infinity);
    const came = new Int32Array(n).fill(-1);
    const closed = new Uint8Array(n);
    const heap = new MinHeap();
    const s = this.idx(sc, sr);
    const goalIdx = this.idx(gc, gr);
    gScore[s] = 0;
    const h = (c: number, r: number) => {
      const dx = Math.abs(c - gc);
      const dy = Math.abs(r - gr);
      return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy);
    };
    heap.push(s, h(sc, sr));
    while (heap.size) {
      const cur = heap.pop();
      if (cur === goalIdx) break;
      if (closed[cur]) continue;
      closed[cur] = 1;
      const c = cur % this.cols;
      const r = (cur / this.cols) | 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (!dr && !dc) continue;
          const nc = c + dc;
          const nr = r + dr;
          if (!this.freeCell(nc, nr)) continue;
          if (dr && dc && (!this.freeCell(c + dc, r) || !this.freeCell(c, r + dr))) continue;
          const ni = this.idx(nc, nr);
          const ng = gScore[cur] + (dr && dc ? Math.SQRT2 : 1);
          if (ng < gScore[ni]) {
            gScore[ni] = ng;
            came[ni] = cur;
            heap.push(ni, ng + h(nc, nr));
          }
        }
      }
    }
    if (goalIdx !== s && came[goalIdx] < 0) return null;
    const cells: THREE.Vector3[] = [];
    for (let i = goalIdx; i !== -1; i = i === s ? -1 : came[i]) {
      cells.push(this.toWorld(i % this.cols, (i / this.cols) | 0));
    }
    cells.reverse();
    cells[0] = start;
    return this.smooth([from.clone().setY(0), ...cells]);
  }

  private lineFree(a: THREE.Vector3, b: THREE.Vector3) {
    const d = a.distanceTo(b);
    const steps = Math.ceil(d / (this.cell * 0.4));
    for (let i = 1; i < steps; i++) {
      const t = i / steps;
      if (!this.isFree(a.x + (b.x - a.x) * t, a.z + (b.z - a.z) * t)) return false;
    }
    return true;
  }

  private smooth(pts: THREE.Vector3[]) {
    const out = [pts[0]];
    let i = 0;
    while (i < pts.length - 1) {
      let j = pts.length - 1;
      while (j > i + 1 && !this.lineFree(pts[i], pts[j])) j--;
      out.push(pts[j]);
      i = j;
    }
    return out.slice(1);
  }
}

class MinHeap {
  private ids: number[] = [];
  private keys: number[] = [];

  get size() {
    return this.ids.length;
  }

  push(id: number, key: number) {
    const { ids, keys } = this;
    ids.push(id);
    keys.push(key);
    let i = ids.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (keys[p] <= keys[i]) break;
      [ids[p], ids[i]] = [ids[i], ids[p]];
      [keys[p], keys[i]] = [keys[i], keys[p]];
      i = p;
    }
  }

  pop(): number {
    const { ids, keys } = this;
    const top = ids[0];
    const lastId = ids.pop()!;
    const lastKey = keys.pop()!;
    if (ids.length) {
      ids[0] = lastId;
      keys[0] = lastKey;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1;
        const r = l + 1;
        let m = i;
        if (l < ids.length && keys[l] < keys[m]) m = l;
        if (r < ids.length && keys[r] < keys[m]) m = r;
        if (m === i) break;
        [ids[m], ids[i]] = [ids[i], ids[m]];
        [keys[m], keys[i]] = [keys[i], keys[m]];
        i = m;
      }
    }
    return top;
  }
}
