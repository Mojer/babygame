import type { Input } from '../sim/world';

const JOY_RADIUS = 52;

/** 鍵盤＋雙拇指觸控。衝刺／星艦掃蕩是「按下瞬間」，被一個 sim tick 消耗後清除。 */
export class InputController implements Input {
  mx = 0;
  my = 0;
  dash = false;
  ult = false;
  private readonly keys = new Set<string>();
  private joyId: number | null = null;
  private joyX = 0;
  private joyY = 0;
  private jx = 0;
  private jy = 0;

  constructor(
    zone: HTMLElement,
    base: HTMLElement,
    private readonly knob: HTMLElement,
    dashBtn: HTMLElement,
    ultBtn: HTMLElement,
    hotkeys: Record<string, () => void>,
  ) {
    window.addEventListener('keydown', e => {
      if (e.repeat) return;
      if (hotkeys[e.code]) {
        hotkeys[e.code]();
        e.preventDefault();
        return;
      }
      this.keys.add(e.code);
      if (e.code === 'Space') {
        this.dash = true;
        e.preventDefault();
      }
      if (e.code === 'KeyE' || e.code === 'KeyK' || e.code === 'Enter') this.ult = true;
    });
    window.addEventListener('keyup', e => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());

    zone.addEventListener('pointerdown', e => {
      if (this.joyId !== null) return;
      this.joyId = e.pointerId;
      try {
        zone.setPointerCapture(e.pointerId);
      } catch {
        // 部分瀏覽器對非作用中的 pointer 會丟例外，沒有 capture 也能用
      }
      this.joyX = e.clientX;
      this.joyY = e.clientY;
      this.jx = this.jy = 0;
      base.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      base.classList.add('on');
      this.moveKnob();
      e.preventDefault();
    });
    zone.addEventListener('pointermove', e => {
      if (e.pointerId !== this.joyId) return;
      let dx = e.clientX - this.joyX;
      let dy = e.clientY - this.joyY;
      const d = Math.hypot(dx, dy);
      if (d > JOY_RADIUS) {
        // 手指拉太遠時底座跟著走（浮動搖桿）
        const over = d - JOY_RADIUS;
        this.joyX += (dx / d) * over;
        this.joyY += (dy / d) * over;
        base.style.transform = `translate(${this.joyX}px, ${this.joyY}px)`;
        dx = e.clientX - this.joyX;
        dy = e.clientY - this.joyY;
      }
      this.jx = dx / JOY_RADIUS;
      this.jy = dy / JOY_RADIUS;
      this.moveKnob();
    });
    const end = (e: PointerEvent) => {
      if (e.pointerId !== this.joyId) return;
      this.joyId = null;
      this.jx = this.jy = 0;
      base.classList.remove('on');
    };
    zone.addEventListener('pointerup', end);
    zone.addEventListener('pointercancel', end);

    const press = (el: HTMLElement, fn: () => void) =>
      el.addEventListener('pointerdown', e => {
        fn();
        e.preventDefault();
        e.stopPropagation();
      });
    press(dashBtn, () => (this.dash = true));
    press(ultBtn, () => (this.ult = true));
  }

  private moveKnob() {
    this.knob.style.transform = `translate(${this.jx * JOY_RADIUS}px, ${this.jy * JOY_RADIUS}px)`;
  }

  /** 每個 sim tick 前更新移動向量 */
  sample() {
    const k = this.keys;
    let x = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
    let y = (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0) - (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0);
    if (x !== 0 || y !== 0) {
      const l = Math.hypot(x, y);
      x /= l;
      y /= l;
    } else {
      const l = Math.hypot(this.jx, this.jy);
      if (l > 0.12) {
        const m = Math.min(1, l);
        x = (this.jx / l) * m;
        y = (this.jy / l) * m;
      }
    }
    this.mx = x;
    this.my = y;
  }

  consumeEdges() {
    this.dash = false;
    this.ult = false;
  }
}
