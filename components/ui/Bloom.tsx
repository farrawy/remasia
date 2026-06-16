import {cn} from '@/lib/utils';

// ── The house motif ──────────────────────────────────────────
// A simple layered-petal bloom (logo glyph) + a rich, *seeded* floral scene used
// as image placeholders. Each scene is unique per seed (palette, bloom counts,
// scattered petals, sparkles) so the site never looks repetitive — yet stays
// fully deterministic (no Math.random) for SSR-safe rendering.

export function Bloom({className, petals = 6}: {className?: string; petals?: number}) {
  const items = Array.from({length: petals});
  return (
    <svg viewBox="-50 -50 100 100" className={className} aria-hidden="true" role="presentation">
      {items.map((_, i) => (
        <ellipse key={`o${i}`} cx="0" cy="-26" rx="13" ry="24" fill="var(--rose-300)" opacity="0.85" transform={`rotate(${(360 / petals) * i})`} />
      ))}
      {items.map((_, i) => (
        <ellipse key={`i${i}`} cx="0" cy="-15" rx="7" ry="14" fill="var(--rose-400)" opacity="0.9" transform={`rotate(${(360 / petals) * i + 180 / petals})`} />
      ))}
      <circle cx="0" cy="0" r="9" fill="var(--rose-500)" />
      <circle cx="0" cy="0" r="4" fill="var(--magic-glow)" />
    </svg>
  );
}

// ── seeded helpers (deterministic) ───────────────────────────
function hashSeed(seed: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}
function makeRng(seed: number) {
  let s = (seed || 123456789) >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

type Palette = {bg: [string, string, string]; light: string; mid: string; deep: string; core: string; accent: string};

// All within brand tokens — no gold / black / green.
const PALETTES: Palette[] = [
  {bg: ['#ffd3e5', '#f8dce8', '#fff7fb'], light: '#ffeaf3', mid: '#ff7fb0', deep: '#f85b99', core: '#c9184a', accent: '#cdb4ff'},
  {bg: ['#eadfff', '#cdb4ff', '#ffeaf3'], light: '#f3ecff', mid: '#cdb4ff', deep: '#a98bff', core: '#7a5fd0', accent: '#ffb8d5'},
  {bg: ['#ffb8d5', '#ffd3e5', '#fffafc'], light: '#ffe1ee', mid: '#ff7fb0', deep: '#f85b99', core: '#c9184a', accent: '#fff3ea'},
  {bg: ['#fff3ea', '#ffd3e5', '#f8dce8'], light: '#fff7f0', mid: '#ffabc9', deep: '#ff7fb0', core: '#b03a64', accent: '#eadfff'},
  {bg: ['#f8dce8', '#eadfff', '#ffeaf3'], light: '#fbeaf3', mid: '#ffabc9', deep: '#cdb4ff', core: '#7a244d', accent: '#ffb8d5'},
  {bg: ['#ffabc9', '#ff7fb0', '#ffd3e5'], light: '#ffd3e5', mid: '#f85b99', deep: '#c9184a', core: '#7a244d', accent: '#cdb4ff'}
];

const PETAL = 'M0 0 C 9 -16 9 -40 0 -54 C -9 -40 -9 -16 0 0 Z';
const SPARKLE = 'M0 -6 C 1 -2 2 -1 6 0 C 2 1 1 2 0 6 C -1 2 -2 1 -6 0 C -2 -1 -1 -2 0 -6 Z';

function petalRing(count: number, rot: number, fill: string, key: string) {
  return Array.from({length: count}).map((_, i) => (
    <path key={`${key}${i}`} d={PETAL} fill={fill} transform={`rotate(${rot + (360 / count) * i})`} />
  ));
}

function bloomGlyph(cx: number, cy: number, scale: number, rot: number, count: number, h: number, opacity = 1) {
  const fill = `url(#pl${h})`;
  return (
    <g opacity={opacity} transform={`translate(${cx} ${cy}) scale(${scale}) rotate(${rot})`}>
      {petalRing(count, 0, fill, 'o')}
      <g transform="scale(0.6)" opacity={0.92}>
        {petalRing(count, 360 / (2 * count), fill, 'i')}
      </g>
      <circle r="9" fill={`url(#co${h})`} />
      <circle r="3.5" fill={fill} opacity={0.7} />
    </g>
  );
}

export function BloomThumb({
  seed = '',
  featured = false,
  className
}: {
  seed?: string;
  featured?: boolean;
  className?: string;
}) {
  const h = hashSeed(seed);
  const rng = makeRng(h);
  const p = PALETTES[h % PALETTES.length];

  const mainCount = 5 + (h % 3); // 5–7
  const mainRot = (h % 12) * 6;

  const secondaries = [
    {cx: 12 + rng() * 10, cy: 104 + rng() * 14, scale: 0.46 + rng() * 0.12, rot: rng() * 72, count: 5 + Math.floor(rng() * 3), o: 0.85},
    {cx: 86 + rng() * 10, cy: 20 + rng() * 16, scale: 0.34 + rng() * 0.12, rot: rng() * 72, count: 5 + Math.floor(rng() * 3), o: 0.7}
  ];
  const scatter = Array.from({length: 7}, () => ({
    x: rng() * 100, y: rng() * 125, r: rng() * 360, s: 0.22 + rng() * 0.34, o: 0.18 + rng() * 0.28
  }));
  const sparkles = Array.from({length: 4}, () => ({
    x: 8 + rng() * 84, y: 8 + rng() * 108, s: 0.4 + rng() * 0.9, o: 0.5 + rng() * 0.4
  }));

  return (
    <div className={cn('relative overflow-hidden', featured && 'glow-fairy', className)}>
      <div
        className="absolute inset-0"
        style={{background: `linear-gradient(150deg, ${p.bg[0]} 0%, ${p.bg[1]} 52%, ${p.bg[2]} 100%)`}}
      />
      <svg viewBox="0 0 100 125" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full">
        <defs>
          <linearGradient id={`pl${h}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={p.light} />
            <stop offset="55%" stopColor={p.mid} />
            <stop offset="100%" stopColor={p.deep} />
          </linearGradient>
          <radialGradient id={`co${h}`}>
            <stop offset="0%" stopColor={p.accent} />
            <stop offset="100%" stopColor={p.core} />
          </radialGradient>
        </defs>

        {/* top highlight */}
        <ellipse cx="50" cy="-8" rx="80" ry="46" fill="#ffffff" opacity="0.45" />

        {/* drifting petals behind */}
        {scatter.map((s, i) => (
          <path key={`s${i}`} d={PETAL} fill={p.mid} opacity={s.o} transform={`translate(${s.x} ${s.y}) rotate(${s.r}) scale(${s.s})`} />
        ))}

        {/* secondary blooms (depth) */}
        {secondaries.map((b, i) => (
          <g key={`b${i}`}>{bloomGlyph(b.cx, b.cy, b.scale, b.rot, b.count, h, b.o)}</g>
        ))}

        {/* hero bloom */}
        {bloomGlyph(50, 68, 0.92, mainRot, mainCount, h)}

        {/* sparkles */}
        {sparkles.map((s, i) => (
          <path key={`k${i}`} d={SPARKLE} fill={p.accent} opacity={s.o} transform={`translate(${s.x} ${s.y}) scale(${s.s})`} />
        ))}
      </svg>

      {/* soft vignette for depth */}
      <div
        className="absolute inset-0"
        style={{background: 'radial-gradient(135% 90% at 50% 118%, rgba(122,36,77,0.26), transparent 56%)'}}
      />
    </div>
  );
}
