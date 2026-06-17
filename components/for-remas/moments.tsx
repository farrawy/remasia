'use client';

import {useState, type ReactNode} from 'react';
import {motion, AnimatePresence, useReducedMotion} from 'framer-motion';
import {CheckCircle, EnvelopeSimple} from '@phosphor-icons/react/dist/ssr';
import {Link} from '@/i18n/navigation';
import {BloomThumb} from '@/components/ui/Bloom';
import {cn} from '@/lib/utils';
import type {Locale} from '@/i18n/routing';
import type {ForRemasContent} from './content';
import {Peony, Lily, LilyDivider, WaxSeal, PressedGlyph, PETAL_D} from './florals';

// Warm pale "paper" for letters, notes & receipts — reads as a real keepsake
// against the twilight background. Ink text, never pure black.
// Lighter shadow (smaller blur radius) keeps scrolling cheap to paint even with
// ~36 paper keepsakes on the page.
const PAPER =
  'relative rounded-[1.5rem] border border-white/45 text-ink shadow-[0_12px_30px_-18px_rgba(60,18,40,0.6)] ' +
  '[background:linear-gradient(152deg,#fffafc_0%,#fff3ea_56%,#f8dce8_100%)]';

const AR_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const toArabic = (n: number) => String(n).split('').map((d) => AR_DIGITS[+d] ?? d).join('');

function Reveal({children, delay = 0, className}: {children: ReactNode; delay?: number; className?: string}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : {opacity: 0, y: 26}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true, amount: 0.3}}
      transition={{duration: 0.9, ease: [0.2, 0.7, 0.2, 1], delay}}
    >
      {children}
    </motion.div>
  );
}

function MomentHeading({children, sub}: {children: ReactNode; sub?: string}) {
  return (
    <div className="flex flex-col items-center text-center">
      <LilyDivider className="mb-5" />
      <h2 className="font-script text-3xl leading-tight text-pearl md:text-4xl">{children}</h2>
      {sub ? <p className="mt-2.5 text-sm text-pearl/60">{sub}</p> : null}
    </div>
  );
}

// soft, slow petals — the gentle (never confetti) reveal accent
function SoftPetals() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  const pieces = Array.from({length: 9}, (_, i) => ({
    id: i,
    x: (i * 47) % 100,
    dx: ((i % 3) - 1) * 26,
    delay: (i % 5) * 0.12,
    dur: 2.6 + (i % 4) * 0.5,
    s: 0.5 + ((i * 7) % 5) / 10
  }));
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <motion.svg
          key={p.id}
          viewBox="-18 -50 36 56"
          className="absolute text-rose-300"
          style={{left: `${p.x}%`, top: '46%', width: 16 * p.s, height: 16 * p.s}}
          fill="currentColor"
          initial={{opacity: 0, y: 0, rotate: 0}}
          animate={{opacity: [0, 0.9, 0], y: [-10, -70], x: [0, p.dx], rotate: [0, 160]}}
          transition={{duration: p.dur, delay: p.delay, ease: 'easeOut'}}
        >
          <path d={PETAL_D} />
        </motion.svg>
      ))}
    </div>
  );
}

// ── 2 · folded love letter ───────────────────────────────────────────────────
export function FoldedLetter({c}: {c: ForRemasContent['letter']}) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal className="mx-auto w-full max-w-lg">
      <div className={cn(PAPER, 'overflow-hidden p-7 md:p-9 -rotate-[1.2deg]')}>
        <div className="pointer-events-none absolute -end-6 -top-6 opacity-[0.08]">
          <Lily className="size-40" />
        </div>
        <p className="font-script text-3xl text-deep-berry md:text-4xl">{c.salutation}</p>
        <AnimatePresence initial={false} mode="wait">
          {open ? (
            <motion.div
              key="unfolded"
              initial={{opacity: 0, height: 0}}
              animate={{opacity: 1, height: 'auto'}}
              transition={{duration: 0.7, ease: [0.2, 0.7, 0.2, 1]}}
              className="space-y-2.5 overflow-hidden text-ink/85"
            >
              <div className="mt-4 space-y-2.5 leading-relaxed">
                {c.lines.map((l, i) => (
                  <p key={i}>{l}</p>
                ))}
              </div>
              <div className="mt-5 flex justify-end">
                <WaxSeal size={44} />
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="sealed"
              type="button"
              onClick={() => setOpen(true)}
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              className="group mt-5 flex w-full items-center gap-3 rounded-2xl border border-deep-berry/15 bg-white/40 px-4 py-3 text-start transition-colors hover:bg-white/60"
            >
              <WaxSeal size={40} />
              <span className="text-sm text-deep-berry/70 group-hover:text-deep-berry">{c.openHint} ↗</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  );
}

// ── 3 · keepsake notes (built from pieces of you) ────────────────────────────
function KeepsakeNote({label, copy, i}: {label: string; copy: string; i: number}) {
  const [open, setOpen] = useState(false);
  const tilt = (i % 2 ? 1 : -1) * (1 + (i % 3));
  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      style={{rotate: `${tilt}deg`}}
      className={cn(
        PAPER,
        'group flex min-h-[7rem] w-full flex-col justify-center p-4 text-center transition-all duration-500',
        'hover:z-10 hover:-translate-y-1.5 hover:rotate-0 hover:shadow-[0_30px_70px_-26px_rgba(60,18,40,0.8)]',
        open && 'z-10 -translate-y-1.5 rotate-0'
      )}
    >
      <span className="pointer-events-none absolute inset-x-0 -top-2 mx-auto h-4 w-12 rounded-b-md bg-rose-200/50" />
      <span className={cn('font-script text-2xl text-deep-berry transition-all duration-300', open && 'text-rose-500')}>{label}</span>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.span
            initial={{opacity: 0, height: 0, marginTop: 0}}
            animate={{opacity: 1, height: 'auto', marginTop: 8}}
            exit={{opacity: 0, height: 0, marginTop: 0}}
            className="block overflow-hidden text-xs leading-relaxed text-ink/80"
          >
            {copy}
          </motion.span>
        ) : (
          <span className="mt-1 text-[11px] text-ink/45">↑</span>
        )}
      </AnimatePresence>
    </button>
  );
}

export function KeepsakeNotes({c}: {c: ForRemasContent['keepsakes']}) {
  return (
    <>
      <MomentHeading sub={c.hint}>{c.title}</MomentHeading>
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3 md:grid-cols-4">
        {c.items.map((it, i) => (
          <Reveal key={i} delay={(i % 4) * 0.06} className={i % 2 ? 'sm:translate-y-4' : ''}>
            <KeepsakeNote label={it.label} copy={it.copy} i={i} />
          </Reveal>
        ))}
      </div>
    </>
  );
}

// ── 4 · pressed-flower diary ─────────────────────────────────────────────────
export function PressedFlowers({c}: {c: ForRemasContent['pressed']}) {
  return (
    <>
      <MomentHeading sub={c.hint}>{c.title}</MomentHeading>
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-5">
        {c.items.map((f, i) => (
          <Reveal key={f.flower} delay={i * 0.08}>
            <figure className={cn(PAPER, 'flex h-full flex-col items-center p-4 pt-7')}>
              {/* a single soft tape strip, like a real pressed-flower diary */}
              <span className="pointer-events-none absolute -top-2 start-1/2 h-4 w-12 -translate-x-1/2 -rotate-2 rounded-sm bg-magic-glow/35" />
              <div className="grid size-28 place-items-center rounded-full bg-white/50">
                <PressedGlyph flower={f.flower} className="size-24" />
              </div>
              <figcaption className="mt-3 text-center">
                <h3 className="font-script text-2xl text-deep-berry">{f.name}</h3>
                <p className="mt-1 text-xs leading-relaxed text-ink/75">{f.copy}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </>
  );
}

// ── 5 · wrapped gift → the first bouquet ─────────────────────────────────────
export function WrappedGift({c}: {c: ForRemasContent['gift']}) {
  const [open, setOpen] = useState(false);
  return (
    <Reveal className="mx-auto flex w-full max-w-md flex-col items-center">
      <div className="relative w-full">
        {open ? <SoftPetals /> : null}
        <div className={cn(PAPER, 'overflow-hidden')}>
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.div
                key="open"
                initial={{opacity: 0, scale: 0.96}}
                animate={{opacity: 1, scale: 1}}
                transition={{duration: 0.8, ease: [0.2, 0.7, 0.2, 1]}}
                className="p-5 text-center"
              >
                <BloomThumb seed="the-remas-bouquet" featured className="mx-auto aspect-[4/5] w-44 rounded-2xl" />
                <h3 className="mt-4 font-script text-3xl text-deep-berry">{c.title}</h3>
                <div className="mt-2 space-y-1 text-sm text-ink/85">
                  {c.lines.map((l, i) => (
                    <p key={i}>{l}</p>
                  ))}
                </div>
                <p className="mt-3 text-xs italic leading-relaxed text-rose-500">{c.detail}</p>
                <Link href="/product/the-remas-bouquet" className="btn-magic mt-5 inline-flex px-7 py-3 text-base">
                  {c.cta}
                </Link>
              </motion.div>
            ) : (
              <motion.button
                key="closed"
                type="button"
                onClick={() => setOpen(true)}
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                className="group relative grid w-full place-items-center p-10"
              >
                {/* ribbon cross */}
                <span className="pointer-events-none absolute inset-y-0 start-1/2 w-7 -translate-x-1/2 bg-rose-300/45" />
                <span className="pointer-events-none absolute inset-x-0 top-1/2 h-7 -translate-y-1/2 bg-rose-300/45" />
                <div className="relative grid size-28 place-items-center rounded-full bg-white/60 shadow-[0_10px_30px_-12px_rgba(248,91,153,0.6)] transition-transform duration-500 group-hover:scale-105">
                  <WaxSeal size={72} />
                </div>
                <p className="relative mt-5 font-script text-2xl text-deep-berry">{c.before}</p>
                <span className="relative mt-3 inline-flex rounded-pill bg-deep-berry px-5 py-2 text-sm text-lily-white transition-transform group-hover:scale-105">
                  {c.button}
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Reveal>
  );
}

// ── 6 · the first order receipt ──────────────────────────────────────────────
export function OrderReceipt({c}: {c: ForRemasContent['order']}) {
  const rows: [string, string][] = [
    [c.labels.number, c.number],
    [c.labels.customer, c.customer],
    [c.labels.bouquet, c.bouquet]
  ];
  return (
    <Reveal className="mx-auto w-full max-w-sm">
      <MomentHeading>{c.title}</MomentHeading>
      <div className={cn(PAPER, 'mt-9 rotate-[1.4deg] overflow-hidden')}>
        {/* perforated top */}
        <div className="flex h-3 w-full" style={{background: 'radial-gradient(circle at 6px -2px, transparent 5px, #fffafc 5px) 0 0 / 16px 8px repeat-x'}} />
        <div className="p-6 pt-3">
          <div className="flex items-center justify-between border-b border-dashed border-deep-berry/20 pb-3">
            <span className="font-script text-xl text-deep-berry">Remasia</span>
            <Peony className="size-7" />
          </div>
          <dl className="mt-3 space-y-2 text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between gap-3">
                <dt className="text-ink/55">{k}</dt>
                <dd className={cn('text-ink', k === c.labels.number && 'font-mono tracking-wide')}>{v}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between gap-3">
              <dt className="text-ink/55">{c.labels.status}</dt>
              <dd className="inline-flex items-center gap-1.5 rounded-pill bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-500">
                <CheckCircle weight="fill" className="size-4" />
                {c.status}
              </dd>
            </div>
          </dl>
          <div className="mt-4 border-t border-dashed border-deep-berry/20 pt-3">
            <p className="text-[11px] uppercase tracking-wide text-ink/45">{c.labels.gift}</p>
            <p className="mt-1 font-script text-xl leading-snug text-deep-berry">“{c.giftMessage}”</p>
          </div>
          <p className="mt-4 text-[11px] italic leading-relaxed text-ink/55">{c.footnote}</p>
        </div>
      </div>
    </Reveal>
  );
}

// ── 7 · twenty wishes ────────────────────────────────────────────────────────
function WishNote({n, text, ar}: {n: number; text: string; ar: boolean}) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      style={{rotate: `${(n % 2 ? 1 : -1) * 1.4}deg`}}
      className={cn(
        PAPER,
        'group flex aspect-square w-full flex-col items-center justify-center p-2 text-center transition-all duration-500',
        'hover:z-10 hover:-translate-y-1 hover:rotate-0',
        open && 'z-10 col-span-2 row-auto aspect-auto min-h-[7rem] -translate-y-1 rotate-0'
      )}
    >
      {open ? (
        <motion.span initial={{opacity: 0}} animate={{opacity: 1}} className="px-2 text-xs leading-relaxed text-ink/85">
          {text}
        </motion.span>
      ) : (
        <>
          <Peony className="size-7 transition-transform group-hover:scale-110" soft />
          <span className="mt-1 text-[11px] text-deep-berry/70">{ar ? toArabic(n) : n}</span>
        </>
      )}
    </button>
  );
}

export function TwentyWishes({c, locale}: {c: ForRemasContent['wishes']; locale: Locale}) {
  const ar = locale === 'ar';
  return (
    <>
      <MomentHeading sub={c.subtitle}>{c.title}</MomentHeading>
      <div className="mt-10 grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-5">
        {c.items.map((w, i) => (
          <Reveal key={i} delay={(i % 5) * 0.04}>
            <WishNote n={i + 1} text={w} ar={ar} />
          </Reveal>
        ))}
      </div>
    </>
  );
}

// ── 8 · when everything is too much (calm, spacious) ─────────────────────────
export function Overwhelm({c}: {c: ForRemasContent['overwhelm']}) {
  return (
    <div className="relative mx-auto max-w-md text-center">
      <div className="pointer-events-none absolute inset-0 -z-0 grid place-items-center opacity-[0.06]">
        <Lily className="size-72" />
      </div>
      <Reveal className="relative">
        <LilyDivider className="mb-7" />
        <h2 className="font-script text-3xl text-pearl md:text-4xl">{c.title}</h2>
      </Reveal>
      <div className="relative mt-9 space-y-5">
        {c.lines.map((l, i) => (
          <Reveal key={i} delay={i * 0.12}>
            <p className={cn('leading-loose text-pearl/85', i === c.lines.length - 1 && 'text-pearl/70')}>{l}</p>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

// ── 9 · sealed mood letters ──────────────────────────────────────────────────
function MoodLetter({title, lines, openHint}: {title: string; lines: string[]; openHint: string}) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      className={cn(PAPER, 'group flex h-full min-h-[9rem] w-full flex-col p-5 text-start transition-all duration-500 hover:-translate-y-1')}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-script text-xl text-deep-berry">{title}</h3>
        <EnvelopeSimple weight={open ? 'fill' : 'duotone'} className="size-6 shrink-0 text-rose-400" />
      </div>
      <AnimatePresence initial={false} mode="wait">
        {open ? (
          <motion.div
            key="in"
            initial={{opacity: 0, y: 8}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0}}
            className="mt-3 space-y-1.5 text-sm leading-relaxed text-ink/85"
          >
            {lines.map((l, i) => (
              <p key={i}>{l}</p>
            ))}
          </motion.div>
        ) : (
          <span key="hint" className="mt-auto flex items-center gap-2 pt-4 text-xs text-deep-berry/55">
            <WaxSeal size={26} />
            {openHint} ↗
          </span>
        )}
      </AnimatePresence>
    </button>
  );
}

export function MoodLetters({c}: {c: ForRemasContent['moods']}) {
  return (
    <>
      <MomentHeading>{c.title}</MomentHeading>
      <div className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
        {c.letters.map((m, i) => (
          <Reveal key={i} delay={(i % 2) * 0.1} className={i % 2 ? 'sm:translate-y-5' : ''}>
            <MoodLetter title={m.title} lines={m.lines} openHint={c.openHint} />
          </Reveal>
        ))}
      </div>
    </>
  );
}

// ── 10 · the final key ───────────────────────────────────────────────────────
export function FinalDoor({c}: {c: ForRemasContent['ending']}) {
  const reduce = useReducedMotion();
  return (
    <Reveal className="mx-auto flex max-w-xl flex-col items-center text-center">
      <motion.div
        animate={reduce ? undefined : {y: [0, -10, 0]}}
        transition={{duration: 6, repeat: Infinity, ease: 'easeInOut'}}
        className="relative grid place-items-center"
      >
        <span className="absolute size-44 rounded-full blur-3xl" style={{background: 'radial-gradient(circle, rgba(255,184,213,0.55), transparent 70%)'}} />
        <Peony className="relative size-32 drop-shadow-[0_0_34px_rgba(255,184,213,0.65)]" />
      </motion.div>
      <LilyDivider className="mt-8" />
      <h2 className="mt-6 font-script text-4xl text-pearl md:text-5xl">{c.title}</h2>
      <div className="mt-5 space-y-1.5 text-lg text-pearl/85">
        {c.lines.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
      </div>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link href="/" className="btn-magic px-8 py-3.5 font-script text-lg">
          {c.primary}
        </Link>
        <Link
          href="/studio/login"
          className="rounded-pill border border-white/40 bg-white/10 px-8 py-3.5 font-script text-lg text-pearl backdrop-blur transition-colors hover:bg-white/20"
        >
          {c.secondary}
        </Link>
      </div>
      <p className="mt-9 max-w-md font-script text-xl leading-relaxed text-magic-glow/90">{c.note}</p>
    </Reveal>
  );
}
