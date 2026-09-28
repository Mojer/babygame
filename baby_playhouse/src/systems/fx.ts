import * as THREE from 'three';

type Kind = 'star' | 'heart' | 'puff' | 'note' | 'drop' | 'bubble';

function makeTexture(kind: Kind) {
  const s = 64;
  const cv = document.createElement('canvas');
  cv.width = cv.height = s;
  const g = cv.getContext('2d')!;
  g.translate(s / 2, s / 2);
  if (kind === 'bubble') {
    g.fillStyle = 'rgba(214,238,250,0.35)';
    g.strokeStyle = 'rgba(255,255,255,0.95)';
    g.lineWidth = 4;
    g.beginPath();
    g.arc(0, 0, 26, 0, Math.PI * 2);
    g.fill();
    g.stroke();
    g.fillStyle = '#fff';
    g.beginPath();
    g.ellipse(-9, -10, 7, 4, -0.7, 0, Math.PI * 2);
    g.fill();
  } else if (kind === 'drop') {
    g.fillStyle = '#7cc3f0';
    g.strokeStyle = '#fff';
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(0, -26);
    g.bezierCurveTo(18, 0, 16, 24, 0, 24);
    g.bezierCurveTo(-16, 24, -18, 0, 0, -26);
    g.fill();
    g.stroke();
  } else if (kind === 'puff') {
    const grd = g.createRadialGradient(0, 0, 4, 0, 0, 30);
    grd.addColorStop(0, 'rgba(255,255,255,0.95)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.beginPath();
    g.arc(0, 0, 30, 0, Math.PI * 2);
    g.fill();
  } else {
    g.fillStyle = kind === 'heart' ? '#ff7f9c' : kind === 'note' ? '#7a8fd6' : '#ffd23f';
    g.strokeStyle = '#fff';
    g.lineWidth = 5;
    g.font = 'bold 48px sans-serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    const ch = kind === 'heart' ? '♥' : kind === 'note' ? '♪' : '★';
    g.strokeText(ch, 0, 3);
    g.fillText(ch, 0, 3);
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

interface Particle {
  sprite: THREE.Sprite;
  vel: THREE.Vector3;
  life: number;
  max: number;
  size: number;
  grow: number;
  gravity: number;
}

interface Tween {
  t: number;
  dur: number;
  fn: (k: number) => void;
  done?: () => void;
}

/** Sprite bursts, floor ripples and a tiny tween runner. */
export class Fx {
  private readonly textures = new Map<Kind, THREE.Texture>();
  private particles: Particle[] = [];
  private tweens: Tween[] = [];
  private ripple: THREE.Mesh;

  constructor(private readonly scene: THREE.Scene) {
    this.ripple = new THREE.Mesh(
      new THREE.RingGeometry(0.1, 0.14, 32),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false }),
    );
    (this.ripple.material as THREE.Material).userData.outlineParameters = { visible: false };
    this.ripple.rotation.x = -Math.PI / 2;
    this.ripple.renderOrder = 2;
    scene.add(this.ripple);
  }

  private tex(kind: Kind) {
    let t = this.textures.get(kind);
    if (!t) this.textures.set(kind, (t = makeTexture(kind)));
    return t;
  }

  burst(
    kind: Kind,
    at: THREE.Vector3,
    count = 6,
    opts: { spread?: number; up?: number; size?: number; life?: number; gravity?: number; jitter?: number } = {},
  ) {
    for (let i = 0; i < count; i++) {
      const mat = new THREE.SpriteMaterial({ map: this.tex(kind), transparent: true, depthWrite: false });
      const sprite = new THREE.Sprite(mat);
      sprite.position.copy(at);
      if (opts.jitter) {
        sprite.position.x += (Math.random() - 0.5) * opts.jitter;
        sprite.position.z += (Math.random() - 0.5) * opts.jitter;
      }
      const size = (opts.size ?? 0.14) * (0.8 + Math.random() * 0.4);
      sprite.scale.setScalar(size);
      this.scene.add(sprite);
      const a = Math.random() * Math.PI * 2;
      const sp = (opts.spread ?? 0.5) * (0.5 + Math.random() * 0.5);
      this.particles.push({
        sprite,
        vel: new THREE.Vector3(Math.cos(a) * sp, (opts.up ?? 0.9) * (0.7 + Math.random() * 0.6), Math.sin(a) * sp),
        life: 0,
        max: (opts.life ?? 0.9) * (0.8 + Math.random() * 0.4),
        size,
        grow: kind === 'puff' ? 1.8 : kind === 'drop' ? 0 : 0.4,
        gravity: opts.gravity ?? (kind === 'bubble' ? -0.15 : kind === 'drop' ? 4 : 0.6),
      });
    }
  }

  tapRipple(at: THREE.Vector3) {
    this.ripple.position.set(at.x, at.y + 0.01, at.z);
    const mat = this.ripple.material as THREE.MeshBasicMaterial;
    this.tween(0.45, (k) => {
      this.ripple.scale.setScalar(1 + k * 2.2);
      mat.opacity = (1 - k) * 0.9;
    });
  }

  tween(dur: number, fn: (k: number) => void, done?: () => void) {
    this.tweens.push({ t: 0, dur, fn, done });
  }

  /** Jelly squash on a pivot (scale around its bottom centre). */
  jelly(obj: THREE.Object3D, amount = 0.18) {
    this.tween(0.6, (k) => {
      const s = Math.sin(k * Math.PI * 5) * (1 - k) * amount;
      obj.scale.set(1 - s * 0.5, 1 + s, 1 - s * 0.5);
    });
  }

  update(dt: number) {
    this.particles = this.particles.filter((p) => {
      p.life += dt;
      const k = p.life / p.max;
      if (k >= 1) {
        this.scene.remove(p.sprite);
        p.sprite.material.dispose();
        return false;
      }
      p.sprite.position.addScaledVector(p.vel, dt);
      p.vel.y -= dt * p.gravity;
      p.vel.x *= 0.96;
      p.vel.z *= 0.96;
      p.sprite.scale.setScalar(p.size * (1 + k * p.grow));
      p.sprite.material.opacity = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3;
      return true;
    });
    this.tweens = this.tweens.filter((tw) => {
      tw.t += dt;
      const k = Math.min(1, tw.t / tw.dur);
      tw.fn(k);
      if (k >= 1) {
        tw.done?.();
        return false;
      }
      return true;
    });
  }
}
