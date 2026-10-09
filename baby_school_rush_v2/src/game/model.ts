import { BASELINE, CROSSING, LEVEL_LENGTH, obstacles, pickups, platforms, sectionAt, type ObstacleSpec, type PlatformSpec, type Route } from './content';

/** Runner's distance from the left edge of the view; further left leaves more room to read what is coming. */
export const PLAYER_SCREEN_X = 160;
export const DEADLINE = 108;
export const RUSH_SECONDS = 5;
export const RUSH_MULTIPLIER = 1.34;
export const FIXED_STEP = 1 / 120;
/** A dodge input this close before the runner reaches an obstacle counts as a last-moment Perfect. */
export const PERFECT_WINDOW = .26;
/** Launch speed when a lower route ends and the runner ramps back up to the street. */
const RAMP_VELOCITY = 560;
/** Score and RUSH for crossing the tracks on the footbridge or underpass while the gate is down. */
const CROSSING_BONUS = { score: 2_000, rush: 20 };
export type CharacterPose = 'idle' | 'run' | 'fast-run' | 'rush' | 'jump' | 'apex' | 'fall' | 'slide';

export type GameEvent =
  | { type: 'jump' | 'double-jump' | 'ramp' | 'land' | 'slide-start' | 'slide-end' | 'perfect' | 'hit' | 'rush-start' | 'rush-end' | 'pickup' | 'finish'
      | 'crossing-warning' | 'train-in' | 'train-out' | 'blocked' | 'crossing-clear' }
  | { type: 'smash'; x: number; y: number }
  | { type: 'section'; label: string };

export type RuntimeObstacle = ObstacleSpec & {
  hit: boolean;
  cleared: boolean;
  /** The runner has reached the obstacle horizontally; the fields below are judged at that moment. */
  reached: boolean;
  /** The obstacle sat on the runner's current route, so clearing it counts as a dodge. */
  onRoute: boolean;
  lateDodge: boolean;
  destroyed: boolean;
};

const spans = (platform: PlatformSpec, worldX: number) => worldX >= platform.x && worldX <= platform.x + platform.width;

export class GameModel {
  distance = 0;
  realTime = 0;
  timeLeft = DEADLINE;
  y = BASELINE;
  vy = 0;
  grounded = true;
  jumps = 0;
  slideHeld = false;
  slideTime = 0;
  route: Route = 'middle';
  lastActionAt = -Infinity;
  /** The one-way platform being dropped through; ignored until the runner lands elsewhere. */
  droppingThrough: PlatformSpec | null = null;
  invincible = 0;
  /** Seconds since the crossing bell started; negative until the runner gets close. */
  crossingTime = -1;
  /** Held behind the closed street gate this step. */
  blocked = false;
  crossingOutcome: 'pending' | 'blocked' | 'cleared' = 'pending';
  combo = 0;
  bestCombo = 0;
  perfects = 0;
  rush = 0;
  rushTimer = 0;
  rushCount = 0;
  hits = 0;
  score = 0;
  collected = 0;
  state: 'ready' | 'running' | 'won' | 'lost' = 'ready';
  section = sectionAt(0);
  obstacles: RuntimeObstacle[] = obstacles.map(obstacle => ({ ...obstacle, hit: false, cleared: false, reached: false, onRoute: false, lateDodge: false, destroyed: false }));
  pickups = pickups.map(pickup => ({ ...pickup, collected: false }));
  private events: GameEvent[] = [];

  start() { this.state = 'running'; }

  triggerRush() {
    if (this.state !== 'running' || this.rushTimer > 0) return false;
    this.rush = 0;
    this.rushTimer = RUSH_SECONDS;
    this.rushCount++;
    this.events.push({ type: 'rush-start' });
    return true;
  }

  jump() {
    if (this.state !== 'running') return;
    if (this.grounded) {
      this.vy = -535;
      this.grounded = false;
      this.jumps = 1;
      this.slideTime = 0;
      this.lastActionAt = this.realTime;
      this.events.push({ type: 'jump' });
    } else if (this.jumps < 2) {
      this.vy = -465;
      this.jumps = 2;
      this.lastActionAt = this.realTime;
      this.events.push({ type: 'double-jump' });
    }
  }

  setSlide(held: boolean) {
    if (held !== this.slideHeld) this.events.push({ type: held ? 'slide-start' : 'slide-end' });
    const pressed = held && !this.slideHeld;
    this.slideHeld = held;
    if (!pressed || this.state !== 'running') return;
    this.lastActionAt = this.realTime;
    if (!this.grounded) {
      this.vy = Math.max(this.vy, 620);
      return;
    }
    const worldX = this.distance + PLAYER_SCREEN_X;
    const current = this.supportAt(worldX);
    const hasLowerRoute = platforms.some(platform => platform.y > this.y + 20 && spans(platform, worldX));
    if (current?.oneWay && hasLowerRoute) {
      this.droppingThrough = current;
      this.grounded = false;
      this.y += 3;
      this.vy = 150;
    }
  }

  private supportAt(worldX: number) {
    return platforms.find(platform => spans(platform, worldX) && Math.abs(platform.y - this.y) < 1);
  }

  playerRect() {
    const sliding = this.slideHeld && this.grounded;
    const width = sliding ? 62 : 38;
    const height = sliding ? 34 : 76;
    const worldX = this.distance + PLAYER_SCREEN_X;
    return { left: worldX - width / 2, right: worldX + width / 2, top: this.y - height, bottom: this.y, width, height };
  }

  private platformStep(previousY: number) {
    if (this.grounded || this.vy < 0) return;
    const worldX = this.distance + PLAYER_SCREEN_X;
    const candidates = platforms
      .filter(platform => spans(platform, worldX) && platform !== this.droppingThrough)
      .filter(platform => previousY <= platform.y + 2 && this.y >= platform.y)
      .sort((a, b) => a.y - b.y);
    const platform = candidates[0];
    if (!platform) return;
    this.y = platform.y;
    this.vy = 0;
    this.grounded = true;
    this.jumps = 0;
    this.route = platform.route;
    this.droppingThrough = null;
    this.events.push({ type: 'land' });
  }

  /** Running past a platform's end: fall to the route below, or ramp back up when a lower route runs out. */
  private leaveSupport(worldX: number) {
    this.grounded = false;
    this.vy = 0;
    if (!platforms.some(platform => platform.y > this.y && spans(platform, worldX))) {
      this.vy = -RAMP_VELOCITY;
      this.jumps = 1;
      this.events.push({ type: 'ramp' });
    }
  }

  private rewardClear(obstacle: RuntimeObstacle) {
    if (!obstacle.onRoute) return;
    this.combo++;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    if (obstacle.lateDodge && !obstacle.destroyed) {
      this.perfects++;
      this.rush = Math.min(100, this.rush + 25);
      this.score += 500 * Math.max(1, this.combo);
      this.events.push({ type: 'perfect' });
    } else {
      this.rush = Math.min(100, this.rush + (obstacle.destroyed ? 0 : 7));
      this.score += 100 * Math.max(1, this.combo);
    }
    this.checkRushReady();
  }

  private checkRushReady() {
    if (this.rush >= 100 && this.rushTimer <= 0) this.triggerRush();
  }

  /** 0 = raised, 1 = fully down. */
  get armLowered() {
    const t = this.crossingTime;
    if (t < 0) return 0;
    if (t < CROSSING.armDown) return t / CROSSING.armDown;
    if (t < CROSSING.trainOut) return 1;
    if (t < CROSSING.armUp) return 1 - (t - CROSSING.trainOut) / (CROSSING.armUp - CROSSING.trainOut);
    return 0;
  }

  get gateClosed() { return this.armLowered > .35; }

  /** 0→1 while the train is crossing, otherwise null. */
  get trainProgress() {
    const t = this.crossingTime;
    if (t < CROSSING.trainIn || t > CROSSING.trainOut) return null;
    return (t - CROSSING.trainIn) / (CROSSING.trainOut - CROSSING.trainIn);
  }

  private crossingStep(dt: number) {
    const worldX = this.distance + PLAYER_SCREEN_X;
    if (this.crossingTime < 0) {
      if (worldX < CROSSING.trackX - CROSSING.warnDistance) return;
      this.crossingTime = 0;
      this.events.push({ type: 'crossing-warning' });
      return;
    }
    const before = this.crossingTime;
    this.crossingTime += dt;
    if (before < CROSSING.trainIn && this.crossingTime >= CROSSING.trainIn) this.events.push({ type: 'train-in' });
    if (before < CROSSING.trainOut && this.crossingTime >= CROSSING.trainOut) this.events.push({ type: 'train-out' });
    if (this.crossingOutcome === 'pending' && worldX > CROSSING.trackX + CROSSING.trackWidth && this.gateClosed) {
      this.crossingOutcome = 'cleared';
      this.score += CROSSING_BONUS.score;
      this.rush = Math.min(100, this.rush + CROSSING_BONUS.rush);
      this.events.push({ type: 'crossing-clear' });
      this.checkRushReady();
    }
  }

  /** The closed gate holds anyone at street height; the footbridge and underpass pass above and below it. */
  private holdAtGate(nextDistance: number) {
    const atStreetHeight = this.y > CROSSING.bridgeY + 8 && this.y <= BASELINE + 1;
    const halfWidth = this.slideHeld && this.grounded ? 31 : 19;
    const limit = CROSSING.gateX - 6 - halfWidth - PLAYER_SCREEN_X;
    const wasBlocked = this.blocked;
    const beforeGate = this.distance + PLAYER_SCREEN_X < CROSSING.gateX;
    this.blocked = this.gateClosed && atStreetHeight && beforeGate && nextDistance > limit;
    if (!this.blocked) return nextDistance;
    if (!wasBlocked && this.crossingOutcome === 'pending') {
      this.crossingOutcome = 'blocked';
      this.combo = 0;
      this.events.push({ type: 'blocked' });
    }
    return limit;
  }

  step(dt: number) {
    if (this.state !== 'running') return;
    this.realTime += dt;
    this.timeLeft = Math.max(0, this.timeLeft - dt);
    this.invincible = Math.max(0, this.invincible - dt);
    this.slideTime = this.slideHeld && this.grounded ? this.slideTime + dt : 0;

    const hadRush = this.rushTimer > 0;
    this.rushTimer = Math.max(0, this.rushTimer - dt);
    if (hadRush && this.rushTimer === 0) this.events.push({ type: 'rush-end' });

    const progress = this.distance / LEVEL_LENGTH;
    const nextSection = sectionAt(progress);
    if (nextSection.id !== this.section.id) {
      this.section = nextSection;
      this.events.push({ type: 'section', label: nextSection.label });
    }
    this.crossingStep(dt);
    const speed = nextSection.pace * (this.rushTimer > 0 ? RUSH_MULTIPLIER : 1);
    this.distance = this.holdAtGate(Math.min(LEVEL_LENGTH, this.distance + speed * dt));

    const previousY = this.y;
    if (this.grounded && !this.supportAt(this.distance + PLAYER_SCREEN_X)) this.leaveSupport(this.distance + PLAYER_SCREEN_X);
    if (!this.grounded) {
      this.vy += 1_420 * dt;
      this.y += this.vy * dt;
    }
    this.platformStep(previousY);
    if (this.y > 545) {
      this.y = BASELINE;
      this.vy = 0;
      this.grounded = true;
      this.route = 'middle';
      this.droppingThrough = null;
      this.hits++;
      this.combo = 0;
      this.timeLeft = Math.max(0, this.timeLeft - 4);
      this.events.push({ type: 'hit' });
    }

    const player = this.playerRect();
    for (const obstacle of this.obstacles) {
      if (obstacle.cleared) continue;
      const left = obstacle.x - obstacle.width / 2;
      const right = obstacle.x + obstacle.width / 2;
      const top = obstacle.y - obstacle.height;
      const bottom = obstacle.y;
      const overlapX = player.right > left && player.left < right;
      const overlap = overlapX && player.bottom > top && player.top < bottom;
      if (overlapX && !obstacle.reached) {
        obstacle.reached = true;
        obstacle.onRoute = obstacle.route === this.route;
        obstacle.lateDodge = this.realTime - this.lastActionAt <= PERFECT_WINDOW;
      }
      if (overlap && !obstacle.hit) {
        if (this.rushTimer > 0) {
          obstacle.destroyed = true;
          this.events.push({ type: 'smash', x: obstacle.x, y: obstacle.y - obstacle.height / 2 });
        } else if (this.invincible <= 0) {
          obstacle.hit = true;
          this.hits++;
          this.combo = 0;
          this.rush = Math.max(0, this.rush - 18);
          this.timeLeft = Math.max(0, this.timeLeft - 3.5);
          this.invincible = 1;
          this.events.push({ type: 'hit' });
        } else obstacle.hit = true;
      }
      if (right < player.left) {
        obstacle.cleared = true;
        if (!obstacle.hit) this.rewardClear(obstacle);
      }
    }

    for (const pickup of this.pickups) {
      if (pickup.collected) continue;
      const dx = pickup.x - (this.distance + PLAYER_SCREEN_X);
      const dy = pickup.y - (this.y - 35);
      if (Math.hypot(dx, dy) < 42 || this.rushTimer > 0 && Math.hypot(dx, dy) < 150) {
        pickup.collected = true;
        this.collected++;
        this.score += 75;
        this.rush = Math.min(100, this.rush + 3);
        this.events.push({ type: 'pickup' });
      }
    }

    if (this.timeLeft <= 0) this.state = 'lost';
    if (this.distance >= LEVEL_LENGTH) {
      this.state = 'won';
      this.events.push({ type: 'finish' });
    }
  }

  consumeEvents() {
    const events = this.events;
    this.events = [];
    return events;
  }

  get progress() { return Math.min(1, this.distance / LEVEL_LENGTH); }
  get speed() { return this.section.pace * (this.rushTimer > 0 ? RUSH_MULTIPLIER : 1); }
  get pose(): CharacterPose {
    if (!this.grounded) return this.vy < -80 ? 'jump' : this.vy > 160 ? 'fall' : 'apex';
    if (this.slideHeld) return 'slide';
    if (this.blocked) return 'idle';
    if (this.rushTimer > 0) return 'rush';
    return this.section.id === 'fast' || this.section.id === 'event' || this.section.id === 'final' ? 'fast-run' : 'run';
  }
}
