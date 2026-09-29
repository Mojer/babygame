import * as THREE from 'three';

interface Bubble {
  el: HTMLDivElement;
  anchor: () => THREE.Vector3;
  until: number;
}

/**
 * Speech bubbles as HTML above characters' heads: crisp text in the game
 * font, repositioned every frame by projecting the head into screen space.
 */
export class Bubbles {
  private readonly layer = document.createElement('div');
  private readonly items = new Map<object, Bubble>();
  private readonly v = new THREE.Vector3();

  constructor(parent: HTMLElement) {
    this.layer.className = 'bubbles';
    parent.appendChild(this.layer);
  }

  /** Show `text` above `owner`; replaces that owner's current bubble. */
  say(owner: object, anchor: () => THREE.Vector3, text: string, seconds = Math.max(2.8, text.length * 0.22)) {
    this.hide(owner);
    const el = document.createElement('div');
    el.className = 'bubble';
    const inner = document.createElement('span');
    inner.textContent = text;
    el.appendChild(inner);
    this.layer.appendChild(el);
    this.items.set(owner, { el, anchor, until: performance.now() + seconds * 1000 });
  }

  hide(owner: object) {
    const b = this.items.get(owner);
    if (!b) return;
    this.items.delete(owner);
    b.el.classList.add('out');
    setTimeout(() => b.el.remove(), 250);
  }

  clear() {
    for (const owner of [...this.items.keys()]) this.hide(owner);
  }

  update(camera: THREE.Camera, canvas: HTMLCanvasElement) {
    const now = performance.now();
    const rect = canvas.getBoundingClientRect();
    for (const [owner, b] of this.items) {
      if (now > b.until) {
        this.hide(owner);
        continue;
      }
      const p = this.v.copy(b.anchor()).project(camera);
      const visible = p.z < 1 && Math.abs(p.x) < 1.2 && Math.abs(p.y) < 1.2;
      b.el.style.visibility = visible ? 'visible' : 'hidden';
      const half = b.el.offsetWidth / 2 + 8;
      const x = THREE.MathUtils.clamp(rect.left + ((p.x + 1) / 2) * rect.width, rect.left + half, rect.right - half);
      const y = Math.max(rect.top + b.el.offsetHeight + 8, rect.top + ((1 - p.y) / 2) * rect.height);
      b.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%)`;
    }
  }
}
