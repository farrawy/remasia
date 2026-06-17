'use client';

import {useEffect, useRef, useState} from 'react';
import {motion, AnimatePresence, useReducedMotion} from 'framer-motion';
import {Sparkle} from '@phosphor-icons/react/dist/ssr';
import {Link} from '@/i18n/navigation';
import {cn} from '@/lib/utils';
import type {Locale} from '@/i18n/routing';
import {getForRemasContent} from './content';
import {Peony, PETAL_D} from './florals';
import {
  ToastProvider,
  FloatingHearts,
  DoNotClick,
  Passcode,
  HiddenTimestamp,
  ComplimentFlower,
  TypedNameReveal,
  FooterSecret
} from './secrets';
import {
  FoldedLetter,
  KeepsakeNotes,
  PressedFlowers,
  WrappedGift,
  OrderReceipt,
  TwentyWishes,
  Overwhelm,
  MoodLetters,
  FinalDoor
} from './moments';

// ── Ambient decor — deliberately LIGHT (smoothness > density). ───────────────
// Drifting peony petals + a few sparkles, plus rare full peonies. Keeping the
// heavy multi-path Peony/Lily SVGs out of the infinite-animation pool is what
// keeps the page buttery; the lush blooms live in the hero & the keepsakes.
const FLOATERS = Array.from({length: 14}, (_, i) => ({
  id: i,
  left: (i * 37 + 7) % 100,
  size: 12 + ((i * 11) % 22),
  duration: 18 + ((i * 7) % 12),
  delay: (i * 1.3) % 16,
  opacity: 0.18 + ((i * 17) % 30) / 100,
  kind: i % 7 === 0 ? 2 : i % 2 === 0 ? 0 : 1 // 0 petal · 1 sparkle · 2 peony (rare)
}));

const STARS = Array.from({length: 16}, (_, i) => ({
  left: (i * 53 + 5) % 100,
  top: (i * 37 + 11) % 100,
  size: 1 + (i % 3),
  delay: ((i * 0.4) % 4).toFixed(2)
}));

// Only translate (cheap composite) — never scale a 64px blur each frame.
const ORBS = [
  {size: 340, color: 'rgba(255,184,213,0.40)', x: '8%', y: '12%', dur: 22, dx: 40, dy: 28},
  {size: 300, color: 'rgba(205,180,255,0.40)', x: '74%', y: '20%', dur: 26, dx: -46, dy: 36},
  {size: 360, color: 'rgba(201,24,74,0.28)', x: '46%', y: '80%', dur: 24, dx: 28, dy: -38}
];

function Floater({left, size, duration, delay, opacity, kind}: (typeof FLOATERS)[number]) {
  let node;
  if (kind === 1) node = <Sparkle weight="duotone" className="size-full text-magic-glow" />;
  else if (kind === 2) node = <Peony className="size-full" soft />;
  else
    node = (
      <svg viewBox="-18 -50 36 56" className="size-full text-rose-300" fill="currentColor" aria-hidden>
        <path d={PETAL_D} />
      </svg>
    );
  return (
    <motion.div
      className="absolute top-0 will-change-transform"
      style={{left: `${left}%`, width: size, height: size, opacity}}
      initial={{y: '-15vh', rotate: 0}}
      animate={{y: '116vh', rotate: 360}}
      transition={{duration, delay, repeat: Infinity, ease: 'linear'}}
    >
      {node}
    </motion.div>
  );
}

// ── The hero peony — clickable, cycles a little secret each press (egg A) ─────
function PeonyCenter({reduce, onPress, label}: {reduce: boolean; onPress: () => void; label: string}) {
  const burst = Array.from({length: 12}, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return {x: Math.cos(a) * 130, y: Math.sin(a) * 130, r: (a * 180) / Math.PI};
  });
  return (
    <button type="button" onClick={onPress} aria-label={label} className="relative grid cursor-pointer place-items-center">
      {/* one-time entrance halo */}
      <motion.div
        className="absolute size-64 rounded-full blur-3xl"
        style={{background: 'radial-gradient(circle, rgba(255,184,213,0.7), transparent 70%)'}}
        initial={{opacity: 0}}
        animate={{opacity: 0.6}}
        transition={{duration: 1.8, ease: 'easeOut'}}
      />
      {/* gentle pulse — opacity only (no blur re-raster) */}
      {!reduce ? (
        <motion.div
          className="absolute size-56 rounded-full blur-3xl"
          style={{background: 'radial-gradient(circle, rgba(205,180,255,0.5), transparent 70%)'}}
          animate={{opacity: [0.35, 0.7, 0.35]}}
          transition={{duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.4}}
        />
      ) : null}
      {!reduce
        ? burst.map((b, i) => (
            <motion.svg
              key={i}
              viewBox="-18 -50 36 56"
              className="absolute size-5 text-magic-glow"
              fill="currentColor"
              initial={{x: 0, y: 0, scale: 0, opacity: 0}}
              animate={{x: b.x, y: b.y, scale: [0, 1, 0], opacity: [0, 1, 0], rotate: b.r}}
              transition={{duration: 1.4, delay: 0.55, ease: 'easeOut'}}
            >
              <path d={PETAL_D} />
            </motion.svg>
          ))
        : null}
      <motion.div
        initial={reduce ? {opacity: 0} : {scale: 0, rotate: -150, opacity: 0}}
        animate={reduce ? {opacity: 1} : {scale: 1, rotate: 0, opacity: 1}}
        transition={{duration: 1.5, ease: [0.2, 0.8, 0.2, 1], delay: 0.2}}
        className={cn('relative', !reduce && 'float-slow')}
      >
        <Peony className="size-44 drop-shadow-[0_0_30px_rgba(255,184,213,0.6)]" />
      </motion.div>
    </button>
  );
}

function Particle({x, y, kind}: {x: number; y: number; kind: number}) {
  return (
    <motion.div
      className="pointer-events-none fixed z-40"
      style={{left: x, top: y}}
      initial={{opacity: 0.85, scale: 0.5, y: 0}}
      animate={{opacity: 0, scale: 1, y: -26}}
      exit={{opacity: 0}}
      transition={{duration: 0.85, ease: 'easeOut'}}
    >
      {kind ? (
        <Sparkle weight="fill" className="size-3 text-magic-glow" />
      ) : (
        <svg viewBox="-18 -50 36 56" className="size-3 text-rose-300" fill="currentColor">
          <path d={PETAL_D} />
        </svg>
      )}
    </motion.div>
  );
}

function SparkleBurst({x, y}: {x: number; y: number}) {
  const parts = Array.from({length: 7}, (_, i) => (i / 7) * Math.PI * 2);
  return (
    <div className="pointer-events-none fixed z-50" style={{left: x, top: y}}>
      {parts.map((a, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{x: 0, y: 0, scale: 0, opacity: 1}}
          animate={{x: Math.cos(a) * 44, y: Math.sin(a) * 44 - 16, scale: [0, 1, 0], opacity: [1, 1, 0]}}
          transition={{duration: 1.1, ease: 'easeOut'}}
        >
          <Sparkle weight="fill" className="size-4 text-magic-glow" />
        </motion.div>
      ))}
    </div>
  );
}

// ── Cursor sparkle — fully ISOLATED so pointer moves never re-render the page.
// (Mouse only; touch devices skip it. This was the main source of jank.) ──────
type Pt = {id: number; x: number; y: number; kind: number};
function CursorFx({enabled}: {enabled: boolean}) {
  const reduce = useReducedMotion() ?? false;
  const [trail, setTrail] = useState<Pt[]>([]);
  const [bursts, setBursts] = useState<Pt[]>([]);
  const last = useRef(0);
  const idRef = useRef(0);

  useEffect(() => {
    if (!enabled || reduce) return;
    const onMove = (e: PointerEvent) => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      if (e.timeStamp - last.current < 110) return;
      last.current = e.timeStamp;
      const id = ++idRef.current;
      setTrail((t) => [...t, {id, x: e.clientX, y: e.clientY, kind: id % 2}].slice(-8));
      window.setTimeout(() => setTrail((t) => t.filter((p) => p.id !== id)), 800);
    };
    const onDown = (e: PointerEvent) => {
      const id = ++idRef.current + 1_000_000;
      setBursts((b) => [...b.slice(-3), {id, x: e.clientX, y: e.clientY, kind: 0}]);
      window.setTimeout(() => setBursts((b) => b.filter((p) => p.id !== id)), 1200);
    };
    window.addEventListener('pointermove', onMove, {passive: true});
    window.addEventListener('pointerdown', onDown, {passive: true});
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
    };
  }, [enabled, reduce]);

  if (!enabled || reduce) return null;
  return (
    <>
      <AnimatePresence>{trail.map((p) => <Particle key={p.id} x={p.x} y={p.y} kind={p.kind} />)}</AnimatePresence>
      <AnimatePresence>{bursts.map((b) => <SparkleBurst key={b.id} x={b.x} y={b.y} />)}</AnimatePresence>
    </>
  );
}

const reveal = (delay: number) => ({
  initial: {opacity: 0, y: 22},
  animate: {opacity: 1, y: 0},
  transition: {duration: 0.9, ease: [0.2, 0.7, 0.2, 1] as const, delay}
});

function Section({children, className}: {children: React.ReactNode; className?: string}) {
  return <section className={cn('relative mx-auto w-full container-px', className)}>{children}</section>;
}

export function ForRemasExperience({
  title,
  message,
  showSparkle,
  locale
}: {
  title: string;
  message: string;
  showSparkle: boolean;
  locale: Locale;
}) {
  const reduce = useReducedMotion() ?? false;
  const c = getForRemasContent(locale);
  const [flowerStep, setFlowerStep] = useState(-1);

  const words = title.split(' ');
  const cycle = c.eggs.flowerCycle;

  return (
    <ToastProvider>
      <div className="relative min-h-dvh overflow-hidden text-pearl" style={{background: 'linear-gradient(180deg, #5e1f3c 0%, #3b2230 45%, #4a1a30 100%)'}}>
        {/* fixed ambient — persists across the whole scroll */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(70% 50% at 28% 14%, rgba(205,180,255,0.40), transparent 60%),' +
                'radial-gradient(60% 50% at 82% 22%, rgba(255,184,213,0.34), transparent 58%),' +
                'radial-gradient(80% 55% at 50% 92%, rgba(201,24,74,0.34), transparent 62%)'
            }}
          />
          {!reduce
            ? ORBS.map((o, i) => (
                <motion.div
                  key={`orb${i}`}
                  className="absolute rounded-full blur-3xl will-change-transform"
                  style={{width: o.size, height: o.size, left: o.x, top: o.y, background: `radial-gradient(circle, ${o.color}, transparent 70%)`}}
                  animate={{x: [0, o.dx, 0], y: [0, o.dy, 0]}}
                  transition={{duration: o.dur, repeat: Infinity, ease: 'easeInOut'}}
                />
              ))
            : null}
          {STARS.map((s, i) => (
            <span
              key={`star${i}`}
              className={cn('absolute rounded-full bg-pearl', !reduce && 'twinkle')}
              style={{left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, animationDelay: `${s.delay}s`}}
            />
          ))}
          {!reduce ? FLOATERS.map((f) => <Floater key={f.id} {...f} />) : null}
          <div className="absolute inset-0" style={{background: 'radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(59,34,48,0.6) 100%)'}} />
        </div>

        {/* ── HERO ── */}
        <section className="relative z-10 mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center container-px py-16 text-center">
          {showSparkle ? <DoNotClick egg={c.eggs.doNotClick} className="absolute end-4 top-6" /> : null}

          <motion.span {...reveal(0.1)} className="mb-9 font-script text-2xl text-pearl/90">Remasia</motion.span>
          <motion.p {...reveal(0.3)} className="mb-6 text-sm tracking-[0.18em] text-magic-glow">{c.hero.label}</motion.p>

          <PeonyCenter reduce={reduce} label={cycle[0]} onPress={() => setFlowerStep((s) => (s + 1) % cycle.length)} />
          <div className="mt-4 flex min-h-6 items-center justify-center">
            <AnimatePresence mode="wait">
              {flowerStep >= 0 ? (
                <motion.p key={flowerStep} initial={{opacity: 0, y: 6}} animate={{opacity: 1, y: 0}} exit={{opacity: 0, y: -6}} className="text-sm italic text-pearl/75">
                  {cycle[flowerStep]}
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>

          {reduce ? (
            <h1 className="mt-6 max-w-xl font-script text-4xl leading-tight text-pearl md:text-6xl">{title}</h1>
          ) : (
            <motion.h1
              initial="hidden"
              animate="show"
              variants={{hidden: {}, show: {transition: {staggerChildren: 0.09, delayChildren: 0.6}}}}
              className="glow-pulse mt-6 max-w-xl font-script text-4xl leading-tight text-pearl md:text-6xl"
            >
              {words.map((w, i) => (
                <motion.span
                  key={i}
                  variants={{
                    hidden: {opacity: 0, y: 20, filter: 'blur(10px)'},
                    show: {opacity: 1, y: 0, filter: 'blur(0px)', transition: {duration: 0.7, ease: [0.2, 0.7, 0.2, 1]}}
                  }}
                  className="inline-block"
                >
                  {w}&nbsp;
                </motion.span>
              ))}
            </motion.h1>
          )}

          {message ? (
            <motion.p {...reveal(1.2)} className="mt-7 max-w-xl text-lg leading-relaxed text-pearl/85">{message}</motion.p>
          ) : null}

          <motion.div {...reveal(1.5)} className="mt-11 flex flex-wrap items-center justify-center gap-4">
            <Link href="/" className="btn-magic px-8 py-3.5 font-script text-lg">{c.hero.primary}</Link>
            <Link href="/studio/login" className="rounded-pill border border-white/40 bg-white/10 px-8 py-3.5 font-script text-lg text-pearl backdrop-blur transition-colors hover:bg-white/20">
              {c.hero.secondary}
            </Link>
          </motion.div>

          <motion.p {...reveal(1.8)} className="mt-9 text-sm text-pearl/65">{c.hero.note}</motion.p>
          <motion.span {...reveal(2.1)} className="mt-10 text-xs text-pearl/45">↓</motion.span>
        </section>

        {/* ── The keepsake sequence ── */}
        <div className="relative z-10 pb-24">
          {showSparkle ? <FloatingHearts messages={c.eggs.heartToasts} /> : null}

          <Section className="max-w-lg py-20 md:py-24"><FoldedLetter c={c.letter} /></Section>
          <Section className="max-w-3xl py-16 md:py-20"><KeepsakeNotes c={c.keepsakes} /></Section>
          <Section className="max-w-md py-10 text-center"><ComplimentFlower egg={c.eggs.compliment} /></Section>
          <Section className="max-w-3xl py-16 md:py-20"><PressedFlowers c={c.pressed} /></Section>
          <Section className="max-w-2xl py-16 md:py-20"><WrappedGift c={c.gift} /></Section>
          <Section className="max-w-md py-16 md:py-20"><Passcode egg={c.eggs.passcode} /></Section>
          <Section className="max-w-sm py-16 md:py-20"><OrderReceipt c={c.order} /></Section>
          <Section className="max-w-3xl py-16 md:py-20"><TwentyWishes c={c.wishes} locale={locale} /></Section>
          <Section className="max-w-md py-24 md:py-32"><Overwhelm c={c.overwhelm} /></Section>
          <Section className="max-w-2xl py-16 md:py-20"><MoodLetters c={c.moods} /></Section>
          <Section className="max-w-md py-10 text-center"><HiddenTimestamp egg={c.eggs.timestamp} /></Section>
          <Section className="max-w-xl py-24 md:py-32"><FinalDoor c={c.ending} /></Section>

          <footer className="relative z-10 flex flex-col items-center gap-5 px-5 pb-16 text-center">
            <p className="font-script text-2xl text-pearl">{c.signature}</p>
            <p className="text-xs text-pearl/40">{c.eggs.typedName.hint}</p>
            <FooterSecret egg={c.eggs.footerSecret} />
          </footer>
        </div>

        {/* G · typed-name reveal (global listener + overlay) */}
        <TypedNameReveal egg={c.eggs.typedName} />

        {/* isolated cursor sparkle */}
        <CursorFx enabled={showSparkle} />
      </div>
    </ToastProvider>
  );
}
