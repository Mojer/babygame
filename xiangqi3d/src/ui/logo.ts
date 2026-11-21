import { STR } from './strings'

/**
 * Hand-built title lettering: each glyph is stacked SVG text — a dark extrusion, a thick
 * outline under a gradient fill, and a gloss band clipped to the glyph.
 */
const GLYPHS: { ch: string; x: number; y: number; r: number; fill: string }[] = [
  { ch: '版', x: 168, y: 150, r: -6, fill: 'cream' },
  { ch: '象', x: 276, y: 140, r: 4, fill: 'red' },
  { ch: '棋', x: 384, y: 152, r: -3, fill: 'red' },
  { ch: '王', x: 494, y: 141, r: 5, fill: 'gold' },
  { ch: '國', x: 604, y: 152, r: -4, fill: 'gold' },
]

const INK = '#4a3426'
const FONT = `'Chiron GoRound TC', 'PingFang TC', 'Noto Sans TC', sans-serif`

function glyph(g: (typeof GLYPHS)[number], i: number): string {
  const text = (attrs: string) =>
    `<text x="0" y="0" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="108" ${attrs}>${g.ch}</text>`
  return `
    <g transform="translate(${g.x} ${g.y}) rotate(${g.r})">
      <g class="logo-bob" style="--i:${i + 1}">
        ${text(`y="10" fill="${INK}" stroke="${INK}" stroke-width="22" stroke-linejoin="round"`)}
        ${text(`fill="url(#lg-${g.fill})" stroke="${INK}" stroke-width="15" stroke-linejoin="round" paint-order="stroke"`)}
        <g clip-path="url(#lg-clip-${i})"><rect x="-70" y="-100" width="140" height="44" fill="#fff" opacity=".38"/></g>
        <clipPath id="lg-clip-${i}">${text('')}</clipPath>
      </g>
    </g>`
}

/** Q as a red xiangqi piece disc with a cream rim. */
const Q_DISC = `
  <g transform="translate(64 108) rotate(-8)">
    <g class="logo-bob" style="--i:0">
      <circle cy="10" r="56" fill="${INK}"/>
      <circle r="56" fill="url(#lg-red)" stroke="${INK}" stroke-width="7"/>
      <circle r="42" fill="none" stroke="#fff6e2" stroke-width="7"/>
      <text y="30" text-anchor="middle" font-family="${FONT}" font-weight="900" font-size="78" fill="#fff6e2"
        stroke="${INK}" stroke-width="9" paint-order="stroke" stroke-linejoin="round">Q</text>
      <ellipse cx="-14" cy="-30" rx="26" ry="10" fill="#fff" opacity=".35" transform="rotate(-20)"/>
    </g>
  </g>`

const CROWN = `
  <g transform="translate(497 42) rotate(5)">
    <g class="logo-bob" style="--i:4">
      <path d="M-38 14 L-44 -22 L-18 -2 L0 -30 L18 -2 L44 -22 L38 14 Z" fill="url(#lg-gold)" stroke="${INK}"
        stroke-width="6" stroke-linejoin="round"/>
      <rect x="-40" y="12" width="80" height="12" rx="5" fill="url(#lg-gold)" stroke="${INK}" stroke-width="6"/>
      <circle cx="-44" cy="-24" r="6" fill="#ffe680" stroke="${INK}" stroke-width="4"/>
      <circle cx="0" cy="-33" r="7" fill="#ff5a4a" stroke="${INK}" stroke-width="4"/>
      <circle cx="44" cy="-24" r="6" fill="#ffe680" stroke="${INK}" stroke-width="4"/>
    </g>
  </g>`

const sparkle = (x: number, y: number, s: number, i: number) =>
  `<path class="logo-spark" style="--i:${i}" transform="translate(${x} ${y}) scale(${s})"
    d="M0 -12 C2 -3 3 -2 12 0 C3 2 2 3 0 12 C-2 3 -3 2 -12 0 C-3 -2 -2 -3 0 -12 Z" fill="#ffd23a" stroke="${INK}" stroke-width="2.5"/>`

export function svgLogo(): string {
  return `
  <svg class="logo-svg" viewBox="0 0 680 200" role="img" aria-label="${STR.title}">
    <defs>
      <linearGradient id="lg-red" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ff8a6e"/><stop offset=".45" stop-color="#e8493d"/><stop offset="1" stop-color="#c2302a"/>
      </linearGradient>
      <linearGradient id="lg-gold" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff4a8"/><stop offset=".5" stop-color="#ffd23a"/><stop offset="1" stop-color="#f0a21c"/>
      </linearGradient>
      <linearGradient id="lg-cream" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#f6dfb0"/>
      </linearGradient>
    </defs>
    ${Q_DISC}
    ${GLYPHS.map(glyph).join('')}
    ${CROWN}
    ${sparkle(150, 40, 1, 0)}${sparkle(650, 50, 1.2, 2)}${sparkle(662, 178, 0.8, 4)}
  </svg>`
}

/** The menu title: Codex-drawn logo art, falling back to the SVG lettering (or forced with ?title=svg). */
export function titleLogo(): HTMLElement {
  const wrap = document.createElement('div')
  wrap.className = 'logo'
  const useSvg = new URLSearchParams(location.search).get('title') === 'svg'
  if (useSvg) {
    wrap.innerHTML = svgLogo()
  } else {
    const img = new Image()
    img.className = 'logo-art'
    img.alt = STR.title
    img.src = `${import.meta.env.BASE_URL}ui/title.webp`
    img.decoding = 'async'
    img.addEventListener('error', () => (wrap.innerHTML = svgLogo()), { once: true })
    wrap.append(img)
  }
  const sub = document.createElement('div')
  sub.className = 'logo-sub'
  sub.textContent = STR.tagline
  wrap.append(sub)
  return wrap
}
