// 無頭壓測：不開瀏覽器量模擬層成本。
//   npm run bench -- --n 3000 --ticks 1800
//   npm run bench -- --scenario compress
import { botInput } from '../src/sim/bot';
import { World } from '../src/sim/world';

const args = process.argv.slice(2);
const arg = (name: string, def: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};

const ns = arg('n', '700,1400,2600,5000').split(',').map(Number);
const ticks = Number(arg('ticks', '1200'));
const seed = Number(arg('seed', '42'));
const scenarios = arg('scenario', 'cruise,combat,compress').split(',');

interface Row {
  scenario: string;
  n: number;
  avg: number;
  p95: number;
  max: number;
  alive: number;
  kills: number;
  maxChain: number;
  prof: string;
}

function run(scenario: string, n: number): Row {
  const w = new World({ seed, cap: n, stress: true, god: true, autoLevel: true, startTime: 200, noSkills: scenario !== 'combat' });
  w.setView(600, 400);
  const times: number[] = [];
  const input = { mx: 0, my: 0, dash: false, ult: false };
  for (let t = 0; t < ticks; t++) {
    botInput(w, input);
    if (scenario !== 'combat') input.ult = false;
    if (scenario === 'compress' && t % 150 === 0) {
      w.cap = n;
      // 每 2.5 秒在玩家前方硬放一個大黑洞，量「屍群被壓縮」時的尖峰
      const h = w.holes.find(h => !h.active);
      if (h) Object.assign(h, { active: true, x: w.player.x + 60, y: w.player.y, r: 200, t: 0, dur: 2.2 });
    }
    const t0 = performance.now();
    w.step(input);
    times.push(performance.now() - t0);
    w.events.length = 0;
    w.deaths.clear();
    w.fx.clear();
    w.player.hp = w.player.maxHp;
  }
  const warm = times.slice(60).sort((a, b) => a - b);
  const avg = warm.reduce((s, v) => s + v, 0) / warm.length;
  return {
    scenario,
    n,
    avg,
    p95: warm[Math.floor(warm.length * 0.95)],
    max: warm[warm.length - 1],
    alive: w.zombies.count,
    kills: w.stats.kills,
    maxChain: w.stats.maxChain,
    prof: `grid ${w.prof.grid.toFixed(2)} move ${w.prof.move.toFixed(2)} skills ${w.prof.skills.toFixed(2)} chain ${w.prof.chain.toFixed(2)} other ${w.prof.other.toFixed(2)}`,
  };
}

console.log(`sim bench · ${ticks} ticks · seed ${seed} · node ${process.version}`);
console.log('scenario   cap    avg ms  p95 ms  max ms  alive   kills  maxChain   分項（EMA ms）');
for (const s of scenarios) {
  for (const n of ns) {
    const r = run(s, n);
    console.log(
      `${r.scenario.padEnd(9)} ${String(r.n).padStart(5)}  ${r.avg.toFixed(2).padStart(6)}  ${r.p95.toFixed(2).padStart(6)}  ${r.max.toFixed(2).padStart(6)}  ${String(r.alive).padStart(5)}  ${String(r.kills).padStart(6)}  ${String(r.maxChain).padStart(8)}   ${r.prof}`,
    );
  }
}
console.log('\n預算參考：60 FPS 一幀 16.7ms，模擬層目標 ≤ 6ms（手機 CPU 約為桌機的 1/3～1/5）');
