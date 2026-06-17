'use client';

import {useId} from 'react';
import {cn} from '@/lib/utils';

// ─────────────────────────────────────────────────────────────────────────────
// The floral language of /for-remas — illustrated PEONY + LILY (with rose &
// tulip for the pressed-flower diary). Hand-drawn, deterministic SVG with soft
// gradients, highlights & lily speckles so they read as designed botanical art,
// not flat clip-shapes. All within brand tokens (no gold/black/green, no images).
// Same component API as before — a clean swap-point for real sourced art later.
// ─────────────────────────────────────────────────────────────────────────────

// drifting-petal & lily-tepal silhouettes (also exported for ambient floaters)
export const PETAL_D = 'M0 2 C 13 -10 16 -32 7 -44 C 3 -49 -3 -49 -7 -44 C -16 -32 -13 -10 0 2 Z';
export const LILY_PETAL_D = 'M0 0 C 7 -14 8 -40 3 -56 C 2 -61 1 -63 0 -64 C -1 -63 -2 -61 -3 -56 C -8 -40 -7 -14 0 0 Z';

// a soft, ruffled, faintly-notched peony petal (base at origin, tip up)
const PEONY_PETAL = 'M0 0 C -14 -6 -19 -26 -12 -40 C -9 -47 -4 -45 0 -49 C 4 -45 9 -47 12 -40 C 19 -26 14 -6 0 0 Z';

function useUid(prefix: string) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, '');
  return (key: string) => `${prefix}-${key}-${raw}`;
}

function petalRing(count: number, baseAngle: number, scale: number, fill: string, key: string) {
  return Array.from({length: count}).map((_, i) => {
    const jitterA = Math.sin(i * 2.3 + baseAngle) * 4;
    const jitterS = 0.94 + ((Math.sin(i * 1.7 + baseAngle) + 1) / 2) * 0.12;
    return (
      <path
        key={`${key}${i}`}
        d={PEONY_PETAL}
        fill={fill}
        transform={`rotate(${baseAngle + (360 / count) * i + jitterA}) scale(${(scale * jitterS).toFixed(3)})`}
      />
    );
  });
}

// ── PEONY — lush, ruffled, abundant. The emotional centerpiece. ──────────────
export function Peony({className, soft = false}: {className?: string; soft?: boolean}) {
  const id = useUid('peony');
  return (
    <svg viewBox="-64 -64 128 128" className={className} aria-hidden role="presentation">
      <defs>
        <linearGradient id={id('o')} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#fff4f9" />
          <stop offset="1" stopColor="#ffbdda" />
        </linearGradient>
        <linearGradient id={id('m')} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#ffd2e6" />
          <stop offset="1" stopColor="#ff93bb" />
        </linearGradient>
        <linearGradient id={id('i')} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#ffa9cc" />
          <stop offset="1" stopColor="#f06a9e" />
        </linearGradient>
        <linearGradient id={id('c')} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#ec5f93" />
          <stop offset="1" stopColor="#c21c4c" />
        </linearGradient>
      </defs>

      <g opacity={soft ? 0.96 : 1}>
        {petalRing(9, 0, 1.18, `url(#${id('o')})`, 'o')}
        {petalRing(9, 20, 0.92, `url(#${id('m')})`, 'm')}
        {petalRing(8, 8, 0.66, `url(#${id('i')})`, 'i')}
        {/* soft sheen on the upper-left petals */}
        {!soft ? (
          <g>
            <ellipse cx="-13" cy="-34" rx="4.5" ry="12" fill="#ffffff" opacity="0.40" transform="rotate(-20)" />
            <ellipse cx="9" cy="-30" rx="3" ry="9" fill="#ffffff" opacity="0.28" transform="rotate(16)" />
          </g>
        ) : null}
        {petalRing(7, 26, 0.42, `url(#${id('c')})`, 'c')}
        <circle r="6" fill="#c21c4c" opacity="0.9" />
        <circle r="3" fill="#ffd9e8" />
      </g>
    </svg>
  );
}

// a broad, soft lily tepal — pale so the bloom reads as angelic, not a spiky star
const LILY_TEPAL = 'M0 0 C 11 -14 13 -38 6 -56 C 4 -62 1 -64 0 -64 C -1 -64 -4 -62 -6 -56 C -13 -38 -11 -14 0 0 Z';

// ── LILY — elegant, angelic. Broad pale tepals, soft stamens & a few speckles. ─
export function Lily({className, line = false}: {className?: string; line?: boolean}) {
  const id = useUid('lily');
  const stroke = 'var(--magic-glow)';
  const stamens = Array.from({length: 3}, (_, i) => 60 + 120 * i); // tucked between front tepals
  const speckles = [
    {x: 2.5, y: -22}, {x: -3, y: -30}, {x: 3.5, y: -38}
  ];
  return (
    <svg viewBox="-74 -74 148 148" className={className} aria-hidden role="presentation">
      {!line ? (
        <defs>
          <linearGradient id={id('t')} x1="0.5" y1="1" x2="0.5" y2="0">
            <stop offset="0" stopColor="#ffd0e3" />
            <stop offset="0.5" stopColor="#ffeef5" />
            <stop offset="1" stopColor="#fffcfd" />
          </linearGradient>
          <linearGradient id={id('b')} x1="0.5" y1="1" x2="0.5" y2="0">
            <stop offset="0" stopColor="#ffdcea" />
            <stop offset="1" stopColor="#fff7fb" />
          </linearGradient>
        </defs>
      ) : null}

      {/* back tepals */}
      {[60, 180, 300].map((r) => (
        <path
          key={`bk${r}`}
          d={LILY_TEPAL}
          fill={line ? 'none' : `url(#${id('b')})`}
          stroke={line ? stroke : '#ffd0e3'}
          strokeWidth={line ? 1.5 : 0.8}
          opacity={line ? 0.65 : 0.92}
          transform={`rotate(${r}) scale(0.9)`}
        />
      ))}
      {/* front tepals + soft center vein + a few speckles */}
      {[0, 120, 240].map((r) => (
        <g key={`ft${r}`} transform={`rotate(${r})`}>
          <path d={LILY_TEPAL} fill={line ? 'none' : `url(#${id('t')})`} stroke={line ? stroke : '#ffc2da'} strokeWidth={line ? 1.7 : 0.8} opacity={line ? 0.95 : 1} />
          {!line ? (
            <>
              <path d="M0 -4 C 1.5 -20 1.5 -44 0 -58" fill="none" stroke="#f79ec0" strokeWidth="0.9" opacity="0.45" />
              {speckles.map((s, k) => (
                <ellipse key={k} cx={s.x} cy={s.y} rx="0.8" ry="1.3" fill="#d23a6b" opacity="0.4" />
              ))}
            </>
          ) : null}
        </g>
      ))}
      {/* soft stamens, tucked & light */}
      {stamens.map((r, i) => (
        <g key={`st${i}`} transform={`rotate(${r})`}>
          <line x1="0" y1="0" x2="0" y2="-22" stroke={line ? stroke : '#f6b9d0'} strokeWidth="0.9" opacity="0.8" />
          <ellipse cx="0" cy="-23" rx="1.8" ry="2.6" fill={line ? 'none' : '#ef88af'} stroke={line ? stroke : 'none'} strokeWidth="1" />
        </g>
      ))}
      <circle r="3.4" fill={line ? 'none' : '#ffe7f0'} stroke={line ? stroke : '#f6b9d0'} strokeWidth="1" />
    </svg>
  );
}

// ── LILY DIVIDER — graceful line-art ornament between moments. ──
export function LilyDivider({className}: {className?: string}) {
  const stem = (
    <svg viewBox="0 0 120 12" className="h-3 w-24 sm:w-32" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M0 6 H44" />
      <path d="M44 6 C 52 2 56 2 60 6 C 64 10 68 10 76 6" />
      <path d="M76 6 H120" />
      <circle cx="6" cy="6" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="114" cy="6" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
  return (
    <div className={cn('flex items-center justify-center gap-3 text-magic-glow/60', className)} aria-hidden>
      {stem}
      <Lily className="size-5 shrink-0" line />
      <span className="-scale-x-100">{stem}</span>
    </div>
  );
}

// ── WAX SEAL — a peony pressed into wax. Closes envelopes & sealed letters. ──
export function WaxSeal({className, size = 64}: {className?: string; size?: number}) {
  return (
    <span
      className={cn('relative grid place-items-center rounded-full', className)}
      style={{
        width: size,
        height: size,
        background: 'radial-gradient(circle at 38% 30%, var(--rose-500), var(--deep-berry) 78%)',
        boxShadow: '0 6px 18px -6px rgba(122,36,77,0.7), inset 0 2px 6px rgba(255,255,255,0.28), inset 0 -3px 8px rgba(0,0,0,0.28)'
      }}
      aria-hidden
    >
      <span className="absolute inset-[3px] rounded-full border border-lily-white/25" />
      <Peony className="size-1/2 opacity-90 mix-blend-soft-light" soft />
    </span>
  );
}

// ── ROSE — a soft spiralled garden rose (says love when words get nervous). ──
export function Rose({className}: {className?: string}) {
  const id = useUid('rose');
  const ROSE_PETAL = 'M0 0 C -16 -4 -20 -24 -10 -36 C -2 -45 12 -44 18 -33 C 22 -25 18 -8 0 0 Z';
  const layers = [
    {n: 6, base: 0, s: 1.12, g: 'a'},
    {n: 6, base: 26, s: 0.84, g: 'b'},
    {n: 5, base: 52, s: 0.6, g: 'c'},
    {n: 5, base: 78, s: 0.4, g: 'c'}
  ];
  return (
    <svg viewBox="-58 -58 116 116" className={className} aria-hidden role="presentation">
      <defs>
        <linearGradient id={id('a')} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#ffc6dd" />
          <stop offset="1" stopColor="#ff8db5" />
        </linearGradient>
        <linearGradient id={id('b')} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#ff9cc0" />
          <stop offset="1" stopColor="#ef639a" />
        </linearGradient>
        <linearGradient id={id('c')} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#ee5f96" />
          <stop offset="1" stopColor="#c21c4c" />
        </linearGradient>
      </defs>
      {layers.map((l, li) =>
        Array.from({length: l.n}).map((_, i) => (
          <path
            key={`${li}-${i}`}
            d={ROSE_PETAL}
            fill={`url(#${id(l.g)})`}
            transform={`rotate(${l.base + (360 / l.n) * i}) scale(${l.s})`}
          />
        ))
      )}
      <path d="M0 -8 C 4 -4 4 4 0 8 C -4 4 -4 -4 0 -8 Z" fill="#c21c4c" opacity="0.7" transform="rotate(30)" />
      <circle r="2" fill="#ffd9e8" />
    </svg>
  );
}

// ── TULIP — simple, sweet, smiles to the heart. A clear 3-petal cup. ─────────
export function Tulip({className}: {className?: string}) {
  const id = useUid('tulip');
  return (
    <svg viewBox="-50 -58 100 116" className={className} aria-hidden role="presentation">
      <defs>
        <linearGradient id={id('a')} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#ffd6e6" />
          <stop offset="1" stopColor="#ff86b1" />
        </linearGradient>
        <linearGradient id={id('b')} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#ff9ec2" />
          <stop offset="1" stopColor="#e2548f" />
        </linearGradient>
      </defs>
      {/* the cup body */}
      <path d="M-30 -10 C -30 -44 -16 -56 0 -56 C 16 -56 30 -44 30 -10 C 30 6 16 12 0 12 C -16 12 -30 6 -30 -10 Z" fill={`url(#${id('b')})`} />
      {/* side petals folding in */}
      <path d="M-30 -10 C -30 -40 -18 -54 -8 -42 C -14 -24 -12 -2 0 12 C -14 10 -26 2 -30 -10 Z" fill={`url(#${id('a')})`} opacity="0.92" />
      <path d="M30 -10 C 30 -40 18 -54 8 -42 C 14 -24 12 -2 0 12 C 14 10 26 2 30 -10 Z" fill={`url(#${id('a')})`} opacity="0.92" />
      {/* front center petal */}
      <path d="M0 12 C -14 0 -16 -36 -7 -52 C -3 -57 3 -57 7 -52 C 16 -36 14 0 0 12 Z" fill={`url(#${id('a')})`} />
      <path d="M0 -50 C 3 -32 3 -10 0 8 C -3 -10 -3 -32 0 -50 Z" fill="#fffafc" opacity="0.4" />
    </svg>
  );
}

// ── glyph chooser used by the pressed-flower diary. ──
export function PressedGlyph({flower, className}: {flower: 'lily' | 'peony' | 'rose' | 'tulip'; className?: string}) {
  if (flower === 'lily') return <Lily className={className} />;
  if (flower === 'peony') return <Peony className={className} />;
  if (flower === 'tulip') return <Tulip className={className} />;
  return <Rose className={className} />;
}
