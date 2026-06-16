'use client';

import {useRef, useState, type MouseEvent} from 'react';
import {motion, AnimatePresence, useReducedMotion} from 'framer-motion';
import {Sparkle, Heart, Butterfly} from '@phosphor-icons/react/dist/ssr';
import {useTranslations} from 'next-intl';
import {Link} from '@/i18n/navigation';
import {Bloom} from '@/components/ui/Bloom';
import {cn} from '@/lib/utils';
import type {Locale} from '@/i18n/routing';
import {getLetterContent} from './content';
import {LetterSections} from './sections';

const PETAL_PATH = 'M0 4 C 9 -8 9 -22 0 -28 C -9 -22 -9 -8 0 4 Z';

function PetalSVG({className}: {className?: string}) {
  return (
    <svg viewBox="-12 -28 24 32" className={className} fill="currentColor" aria-hidden>
      <path d={PETAL_PATH} />
    </svg>
  );
}

// ── Deterministic ambient decor (SSR-safe) ───────────────────
const FLOATERS = Array.from({length: 18}, (_, i) => ({
  id: i,
  left: (i * 53 + 7) % 100,
  size: 14 + ((i * 11) % 24),
  duration: 13 + ((i * 7) % 12),
  delay: (i * 0.9) % 12,
  opacity: 0.26 + ((i * 17) % 40) / 100,
  kind: i % 5 // 0 petal · 1 sparkle · 2 heart · 3 bloom · 4 butterfly
}));

const STARS = Array.from({length: 26}, (_, i) => ({
  left: (i * 37 + 5) % 100,
  top: (i * 53 + 11) % 100,
  size: 1 + (i % 3),
  delay: ((i * 0.4) % 4).toFixed(2)
}));

const ORBS = [
  {size: 360, color: 'rgba(255,184,213,0.42)', x: '8%', y: '12%', dur: 17, dx: 44, dy: 30},
  {size: 320, color: 'rgba(205,180,255,0.42)', x: '74%', y: '20%', dur: 21, dx: -52, dy: 40},
  {size: 400, color: 'rgba(201,24,74,0.34)', x: '46%', y: '78%', dur: 19, dx: 30, dy: -44},
  {size: 260, color: 'rgba(255,243,234,0.28)', x: '86%', y: '66%', dur: 23, dx: -34, dy: -28}
];

const CLOUDS = [
  {w: 300, h: 90, x: '-6%', y: '22%', dur: 42, dx: 60},
  {w: 240, h: 70, x: '70%', y: '60%', dur: 54, dx: -50}
];

function Floater({left, size, duration, delay, opacity, kind}: (typeof FLOATERS)[number]) {
  let node;
  if (kind === 1) node = <Sparkle weight="duotone" className="size-full text-magic-glow" />;
  else if (kind === 2) node = <Heart weight="fill" className="size-full text-rose-300" />;
  else if (kind === 3) node = <Bloom className="size-full" petals={6} />;
  else if (kind === 4) node = <Butterfly weight="duotone" className="size-full text-fairy-purple" />;
  else node = <PetalSVG className="size-full text-magic-glow" />;
  return (
    <motion.div
      className="absolute top-0"
      style={{left: `${left}%`, width: size, height: size, opacity}}
      initial={{y: '-15vh', rotate: 0}}
      animate={{y: '116vh', rotate: 360}}
      transition={{duration, delay, repeat: Infinity, ease: 'linear'}}
    >
      {node}
    </motion.div>
  );
}

function BloomCenter({reduce}: {reduce: boolean}) {
  const burst = Array.from({length: 12}, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    return {x: Math.cos(a) * 130, y: Math.sin(a) * 130, r: (a * 180) / Math.PI};
  });
  return (
    <div className="relative grid place-items-center">
      {!reduce ? (
        <motion.div
          className="absolute size-60 rounded-full blur-3xl"
          style={{background: 'radial-gradient(circle, rgba(205,180,255,0.55), transparent 70%)'}}
          animate={{scale: [1, 1.18, 1], opacity: [0.45, 0.8, 0.45]}}
          transition={{duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.6}}
        />
      ) : null}
      <motion.div
        className="absolute size-64 rounded-full blur-3xl"
        style={{background: 'radial-gradient(circle, rgba(255,184,213,0.75), transparent 70%)'}}
        initial={{scale: 0, opacity: 0}}
        animate={{scale: [0, 1.1, 1], opacity: [0, 0.9, 0.6]}}
        transition={{duration: 1.8, ease: 'easeOut'}}
      />
      {!reduce
        ? burst.map((b, i) => (
            <motion.div
              key={i}
              className="absolute"
              initial={{x: 0, y: 0, scale: 0, opacity: 0}}
              animate={{x: b.x, y: b.y, scale: [0, 1, 0], opacity: [0, 1, 0], rotate: b.r}}
              transition={{duration: 1.4, delay: 0.55, ease: 'easeOut'}}
            >
              <PetalSVG className="size-5 text-magic-glow" />
            </motion.div>
          ))
        : null}
      <motion.div
        initial={reduce ? {opacity: 0} : {scale: 0, rotate: -150, opacity: 0}}
        animate={reduce ? {opacity: 1} : {scale: 1, rotate: 0, opacity: 1}}
        transition={{duration: 1.5, ease: [0.2, 0.8, 0.2, 1], delay: 0.2}}
        className={cn('relative', !reduce && 'float-slow')}
      >
        <motion.div
          animate={!reduce ? {rotate: 360} : undefined}
          transition={{duration: 90, repeat: Infinity, ease: 'linear'}}
        >
          <Bloom className="size-40 drop-shadow-[0_0_34px_rgba(255,184,213,0.65)]" petals={7} />
        </motion.div>
      </motion.div>
    </div>
  );
}

function Particle({x, y, kind}: {x: number; y: number; kind: number}) {
  return (
    <motion.div
      className="pointer-events-none fixed z-40"
      style={{left: x, top: y}}
      initial={{opacity: 0.9, scale: 0.5, y: 0}}
      animate={{opacity: 0, scale: 1, y: -28}}
      exit={{opacity: 0}}
      transition={{duration: 0.95, ease: 'easeOut'}}
    >
      {kind ? <Sparkle weight="fill" className="size-3 text-magic-glow" /> : <PetalSVG className="size-3 text-rose-300" />}
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
          animate={{x: Math.cos(a) * 46, y: Math.sin(a) * 46 - 18, scale: [0, 1, 0], opacity: [1, 1, 0]}}
          transition={{duration: 1.2, ease: 'easeOut'}}
        >
          <Sparkle weight="fill" className="size-4 text-magic-glow" />
        </motion.div>
      ))}
    </div>
  );
}

const reveal = (delay: number) => ({
  initial: {opacity: 0, y: 22},
  animate: {opacity: 1, y: 0},
  transition: {duration: 0.9, ease: [0.2, 0.7, 0.2, 1] as const, delay}
});

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
  const t = useTranslations('forRemas');
  const reduce = useReducedMotion() ?? false;
  const content = getLetterContent(locale);
  const [bursts, setBursts] = useState<{id: number; x: number; y: number}[]>([]);
  const [trail, setTrail] = useState<{id: number; x: number; y: number; kind: number}[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [flowerSecret, setFlowerSecret] = useState(false);
  const lastTrail = useRef(0);

  function spawnSparkle(e: MouseEvent) {
    if (!showSparkle) return;
    const id = Date.now() + Math.random();
    setBursts((b) => [...b, {id, x: e.clientX, y: e.clientY}]);
    window.setTimeout(() => setBursts((b) => b.filter((p) => p.id !== id)), 1300);
  }
  function onMove(e: MouseEvent) {
    if (!showSparkle || reduce) return;
    const now = Date.now();
    if (now - lastTrail.current < 70) return;
    lastTrail.current = now;
    const id = now + Math.random();
    setTrail((tr) => [...tr, {id, x: e.clientX, y: e.clientY, kind: Math.floor(id) % 2}]);
    window.setTimeout(() => setTrail((tr) => tr.filter((p) => p.id !== id)), 950);
  }

  const words = title.split(' ');

  return (
    <div
      className="relative min-h-dvh overflow-hidden text-pearl"
      style={{background: 'linear-gradient(180deg, #5e1f3c 0%, #3b2230 45%, #4a1a30 100%)'}}
    >
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
                className="absolute rounded-full blur-3xl"
                style={{width: o.size, height: o.size, left: o.x, top: o.y, background: `radial-gradient(circle, ${o.color}, transparent 70%)`}}
                animate={{x: [0, o.dx, 0], y: [0, o.dy, 0], scale: [1, 1.15, 1]}}
                transition={{duration: o.dur, repeat: Infinity, ease: 'easeInOut'}}
              />
            ))
          : null}
        {!reduce
          ? CLOUDS.map((c, i) => (
              <motion.div
                key={`cloud${i}`}
                className="absolute rounded-full bg-pearl/10 blur-2xl"
                style={{width: c.w, height: c.h, left: c.x, top: c.y}}
                animate={{x: [0, c.dx, 0]}}
                transition={{duration: c.dur, repeat: Infinity, ease: 'easeInOut'}}
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
        <div
          className="absolute inset-0"
          style={{background: 'radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(59,34,48,0.6) 100%)'}}
        />
      </div>

      {/* ── HERO (unchanged spirit; interactions scoped here) ── */}
      <section
        onClick={spawnSparkle}
        onMouseMove={onMove}
        className="relative z-10 mx-auto flex min-h-dvh max-w-2xl flex-col items-center justify-center container-px py-16 text-center"
      >
        <motion.span {...reveal(0.1)} className="mb-10 font-display text-2xl text-pearl/90">
          Remasia
        </motion.span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setFlowerSecret(true);
          }}
          aria-label={content.secrets.flower}
          className="cursor-pointer"
        >
          <BloomCenter reduce={reduce} />
        </button>
        <div className="mt-3 flex min-h-5 items-center justify-center">
          <AnimatePresence>
            {flowerSecret ? (
              <motion.p
                initial={{opacity: 0, y: 6}}
                animate={{opacity: 1, y: 0}}
                className="text-xs italic text-pearl/70"
              >
                {content.secrets.flower}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </div>

        <motion.p {...reveal(0.9)} className="mt-6 text-sm tracking-[0.15em] text-magic-glow">
          {t('kicker')}
        </motion.p>

        {reduce ? (
          <h1 className="mt-3 max-w-xl font-display text-4xl leading-tight text-pearl md:text-6xl">{title}</h1>
        ) : (
          <motion.h1
            initial="hidden"
            animate="show"
            variants={{hidden: {}, show: {transition: {staggerChildren: 0.09, delayChildren: 1.1}}}}
            className="glow-pulse mt-3 max-w-xl font-display text-4xl leading-tight text-pearl md:text-6xl"
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
          <motion.p {...reveal(1.7)} className="mt-7 max-w-xl text-lg leading-relaxed text-pearl/85">
            {message}
          </motion.p>
        ) : null}

        <motion.div {...reveal(2.0)} className="mt-11 flex flex-wrap items-center justify-center gap-4">
          <Link href="/" className="btn-magic px-8 py-3.5 font-display text-lg">
            {t('openBoutique')}
          </Link>
          <Link
            href="/studio/login"
            className="rounded-pill border border-white/40 bg-white/10 px-8 py-3.5 font-display text-lg text-pearl backdrop-blur transition-colors hover:bg-white/20"
          >
            {t('enterStudio')}
          </Link>
        </motion.div>

        {showSparkle ? (
          <motion.div {...reveal(2.3)} className="mt-12 flex flex-col items-center gap-2">
            <button
              type="button"
              aria-label={t('secretHint')}
              onClick={(e) => {
                e.stopPropagation();
                setRevealed(true);
              }}
              className="grid size-12 place-items-center rounded-full transition-transform hover:scale-110"
            >
              <Heart weight="fill" className={cn('size-7 text-romantic-red', !reduce && 'twinkle')} />
            </button>
            <AnimatePresence mode="wait" initial={false}>
              {revealed ? (
                <motion.p
                  key="secret"
                  initial={{opacity: 0, y: 8, scale: 0.96}}
                  animate={{opacity: 1, y: 0, scale: 1}}
                  exit={{opacity: 0}}
                  transition={{duration: 0.7, ease: 'easeOut'}}
                  className="max-w-md text-pearl/90 italic"
                >
                  {t('secret')}
                </motion.p>
              ) : (
                <motion.span key="hint" initial={{opacity: 0}} animate={{opacity: 0.7}} exit={{opacity: 0}} className="text-xs text-pearl/60">
                  {t('secretHint')}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        ) : null}

        <motion.span {...reveal(2.7)} className="mt-12 text-xs text-pearl/45">
          ↓
        </motion.span>
      </section>

      {/* ── The love letter ── */}
      <LetterSections content={content} />

      {/* interaction layers */}
      <AnimatePresence>{trail.map((p) => <Particle key={p.id} x={p.x} y={p.y} kind={p.kind} />)}</AnimatePresence>
      <AnimatePresence>{bursts.map((b) => <SparkleBurst key={b.id} x={b.x} y={b.y} />)}</AnimatePresence>
    </div>
  );
}
