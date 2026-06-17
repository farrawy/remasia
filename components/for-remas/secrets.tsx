'use client';

import {createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode} from 'react';
import {motion, AnimatePresence, useReducedMotion} from 'framer-motion';
import {Heart, Sparkle, X} from '@phosphor-icons/react/dist/ssr';
import {cn} from '@/lib/utils';
import {Peony, PETAL_D, WaxSeal} from './florals';
import type {ForRemasContent} from './content';

type Eggs = ForRemasContent['eggs'];

// ── Romantic toast system — soft, brief, never loud ──────────────────────────
const ToastCtx = createContext<(msg: string) => void>(() => {});
export const useRomanticToast = () => useContext(ToastCtx);

export function ToastProvider({children}: {children: ReactNode}) {
  const [toasts, setToasts] = useState<{id: number; msg: string}[]>([]);
  const push = useCallback((msg: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), {id, msg}]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex flex-col items-center gap-2 px-4">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{opacity: 0, y: 16, scale: 0.94}}
              animate={{opacity: 1, y: 0, scale: 1}}
              exit={{opacity: 0, y: 8, scale: 0.96}}
              transition={{duration: 0.5, ease: [0.2, 0.7, 0.2, 1]}}
              className="flex max-w-sm items-center gap-2.5 rounded-pill border border-white/20 bg-deep-berry/55 px-4 py-2.5 text-sm text-pearl shadow-[0_18px_50px_-20px_rgba(0,0,0,0.7)] backdrop-blur-md"
            >
              <Peony className="size-5 shrink-0" />
              <span>{t.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

// pick a random entry without repeating the previous one
function useRandomPick<T>(items: T[]) {
  const last = useRef(-1);
  return useCallback(() => {
    if (items.length <= 1) return items[0];
    let i = Math.floor(Math.random() * items.length);
    if (i === last.current) i = (i + 1) % items.length;
    last.current = i;
    return items[i];
  }, [items]);
}

// ── B · floating heart / petal toasts, scattered down the page ───────────────
const SPOTS = [
  {top: '16%', side: '7%', s: 20, k: 0},
  {top: '31%', side: '86%', s: 15, k: 1},
  {top: '47%', side: '9%', s: 17, k: 1},
  {top: '60%', side: '85%', s: 20, k: 0},
  {top: '74%', side: '11%', s: 15, k: 1},
  {top: '88%', side: '83%', s: 18, k: 0}
];

export function FloatingHearts({messages}: {messages: string[]}) {
  const toast = useRomanticToast();
  const reduce = useReducedMotion();
  const pick = useRandomPick(messages);
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden>
      {SPOTS.map((p, i) => (
        <motion.button
          key={i}
          type="button"
          onClick={() => toast(pick())}
          className="pointer-events-auto absolute grid place-items-center text-rose-300/70 transition-transform hover:scale-125 hover:text-rose-300"
          style={{top: p.top, insetInlineStart: p.side, width: p.s, height: p.s}}
          aria-label="🤍"
          animate={reduce ? undefined : {y: [0, -9, 0], opacity: [0.55, 0.9, 0.55]}}
          transition={{duration: 5 + i, repeat: Infinity, ease: 'easeInOut'}}
        >
          {p.k === 0 ? (
            <Heart weight="fill" className="size-full" />
          ) : (
            <svg viewBox="-18 -50 36 56" className="size-full text-magic-glow/80" fill="currentColor">
              <path d={PETAL_D} />
            </svg>
          )}
        </motion.button>
      ))}
    </div>
  );
}

// ── C · "don't click here" sparkle ───────────────────────────────────────────
export function DoNotClick({egg, className}: {egg: Eggs['doNotClick']; className?: string}) {
  const [step, setStep] = useState(0); // 0 idle · 1 first line · 2 both
  const reduce = useReducedMotion();
  return (
    <div className={cn('flex flex-col items-center gap-2 text-center', className)}>
      <button
        type="button"
        onClick={() => {
          setStep(1);
          window.setTimeout(() => setStep(2), 1600);
        }}
        className="group inline-flex items-center gap-1.5 text-xs text-pearl/45 transition-colors hover:text-magic-glow"
      >
        <Sparkle weight="fill" className={cn('size-3.5 text-magic-glow', !reduce && 'twinkle')} />
        {egg.label}
      </button>
      <AnimatePresence>
        {step >= 1 ? (
          <motion.div initial={{opacity: 0, y: 6}} animate={{opacity: 1, y: 0}} className="max-w-xs space-y-1 text-sm italic text-pearl/80">
            <p>{egg.reveals[0]}</p>
            {step >= 2 ? (
              <motion.p initial={{opacity: 0}} animate={{opacity: 1}} className="text-magic-glow/90">
                {egg.reveals[1]}
              </motion.p>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

// ── D · hidden birthday passcode (2802) ──────────────────────────────────────
export function Passcode({egg}: {egg: Eggs['passcode']}) {
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [after, setAfter] = useState(false);
  const [wrong, setWrong] = useState(false);

  function submit() {
    if (value.replace(/\D/g, '') === egg.code) {
      setOpen(true);
      setWrong(false);
    } else {
      setWrong(true);
    }
  }

  return (
    <div className="mx-auto w-full max-w-sm rounded-[1.6rem] border border-white/12 bg-deep-berry/25 p-7 text-center shadow-[0_16px_44px_-26px_rgba(0,0,0,0.6)]">
      <div className="mx-auto mb-4 grid place-items-center">
        <WaxSeal size={52} />
      </div>
      {!open ? (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}}>
          <p className="font-script text-xl text-pearl/90">{egg.title}</p>
          <div className="mt-5 flex items-center justify-center gap-2">
            <input
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setWrong(false);
              }}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              inputMode="numeric"
              maxLength={6}
              placeholder={egg.placeholder}
              dir="ltr"
              className="w-32 rounded-pill border border-white/25 bg-deep-berry/30 px-4 py-2.5 text-center tracking-[0.4em] text-pearl placeholder:tracking-normal placeholder:text-pearl/40 focus:border-magic-glow focus:outline-none"
            />
          </div>
          <button type="button" onClick={submit} className="btn-magic mt-4 inline-flex px-6 py-2.5 text-sm">
            {egg.button}
          </button>
          <AnimatePresence>
            {wrong ? (
              <motion.p initial={{opacity: 0, y: -4}} animate={{opacity: 1, y: 0}} exit={{opacity: 0}} className="mt-3 text-xs text-rose-300">
                {egg.wrong}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div initial={{opacity: 0, scale: 0.96}} animate={{opacity: 1, scale: 1}} transition={{duration: 0.7}} className="space-y-2">
          {egg.reveals.map((l, i) => (
            <p key={i} className={cn('leading-relaxed text-pearl/90', i === 0 && 'font-script text-lg text-magic-glow')}>
              {l}
            </p>
          ))}
          {!after ? (
            <button type="button" onClick={() => setAfter(true)} className="mt-3 text-sm text-magic-glow underline-offset-4 hover:underline">
              {egg.button}
            </button>
          ) : (
            <motion.p initial={{opacity: 0, y: 6}} animate={{opacity: 1, y: 0}} className="mt-3 font-script text-xl text-pearl">
              {egg.after}
            </motion.p>
          )}
        </motion.div>
      )}
    </div>
  );
}

// ── E · hidden timestamp (02:28) ─────────────────────────────────────────────
export function HiddenTimestamp({egg}: {egg: Eggs['timestamp']}) {
  const [step, setStep] = useState(0);
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => setStep((s) => Math.min(s + 1, 2))}
        className="font-mono text-xs tracking-[0.3em] text-pearl/35 transition-colors hover:text-magic-glow"
      >
        {egg.value}
      </button>
      <AnimatePresence>
        {step >= 1 ? (
          <motion.div initial={{opacity: 0, y: 6}} animate={{opacity: 1, y: 0}} className="max-w-xs space-y-1 text-center text-sm italic text-pearl/75">
            <p>{egg.reveals[0]}</p>
            {step >= 2 ? <p className="text-magic-glow/90">{egg.reveals[1]}</p> : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

// ── F · compliment flower ────────────────────────────────────────────────────
export function ComplimentFlower({egg}: {egg: Eggs['compliment']}) {
  const pick = useRandomPick(egg.items);
  const [msg, setMsg] = useState<string | null>(null);
  const [n, setN] = useState(0);
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <button
        type="button"
        onClick={() => {
          setMsg(pick() ?? null);
          setN((x) => x + 1);
        }}
        className="group grid place-items-center"
        aria-label={egg.label}
      >
        <motion.span
          key={n}
          initial={reduce ? false : {scale: 0.8, rotate: -12}}
          animate={{scale: 1, rotate: 0}}
          transition={{type: 'spring', stiffness: 220, damping: 14}}
          className="relative grid size-20 place-items-center"
        >
          <span className="absolute inset-0 rounded-full blur-xl" style={{background: 'radial-gradient(circle, rgba(255,184,213,0.5), transparent 70%)'}} />
          <Peony className="relative size-20 drop-shadow-[0_0_18px_rgba(255,184,213,0.6)] transition-transform group-hover:scale-110" />
        </motion.span>
        <span className="mt-2 text-xs text-pearl/55 group-hover:text-magic-glow">{egg.label}</span>
      </button>
      <div className="min-h-[1.5rem]">
        <AnimatePresence mode="wait">
          {msg ? (
            <motion.p
              key={msg + n}
              initial={{opacity: 0, y: 8}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -8}}
              transition={{duration: 0.4}}
              className="font-script text-lg text-magic-glow"
            >
              {msg}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── G · secret typed-name reveal (ريماس / remas) ─────────────────────────────
export function TypedNameReveal({egg}: {egg: Eggs['typedName']}) {
  const [open, setOpen] = useState(false);
  const [after, setAfter] = useState(false);
  const buffer = useRef('');

  useEffect(() => {
    const targets = egg.names.map((n) => n.toLowerCase());
    function onKey(e: KeyboardEvent) {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length !== 1) return;
      buffer.current = (buffer.current + e.key).toLowerCase().slice(-16);
      if (targets.some((t) => buffer.current.endsWith(t))) {
        buffer.current = '';
        setOpen(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [egg.names]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] grid place-items-center bg-deep-berry/55 p-5 backdrop-blur-md"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          onClick={() => setOpen(false)}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{opacity: 0, scale: 0.9, y: 16}}
            animate={{opacity: 1, scale: 1, y: 0}}
            exit={{opacity: 0, scale: 0.95}}
            transition={{duration: 0.6, ease: [0.2, 0.7, 0.2, 1]}}
            className="relative w-full max-w-md rounded-[1.8rem] border border-white/15 bg-white/[0.07] p-8 text-center shadow-[0_30px_90px_-30px_rgba(0,0,0,0.7)] backdrop-blur-xl"
          >
            <button type="button" onClick={() => setOpen(false)} aria-label="✕" className="absolute end-4 top-4 text-pearl/50 hover:text-pearl">
              <X className="size-5" />
            </button>
            <Peony className="mx-auto size-24 drop-shadow-[0_0_26px_rgba(255,184,213,0.6)]" />
            <h3 className="mt-4 font-script text-3xl text-pearl">{egg.title}</h3>
            <p className="mt-3 leading-relaxed text-pearl/85">{egg.copy}</p>
            {!after ? (
              <button type="button" onClick={() => setAfter(true)} className="btn-magic mt-6 inline-flex px-7 py-3 text-base">
                {egg.button}
              </button>
            ) : (
              <motion.p initial={{opacity: 0, y: 8}} animate={{opacity: 1, y: 0}} className="mt-6 font-script text-2xl text-magic-glow">
                {egg.after}
              </motion.p>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

// ── H · footer secret ────────────────────────────────────────────────────────
export function FooterSecret({egg}: {egg: Eggs['footerSecret']}) {
  const [step, setStep] = useState(0);
  return (
    <button type="button" onClick={() => setStep((s) => Math.min(s + 1, 2))} className="text-center text-sm text-pearl/55 transition-colors hover:text-pearl/80">
      <span>{egg.base}</span>
      <AnimatePresence>
        {step >= 1 ? (
          <motion.span initial={{opacity: 0}} animate={{opacity: 1}} className="block text-magic-glow/80">
            {egg.reveals[0]}
          </motion.span>
        ) : null}
        {step >= 2 ? (
          <motion.span initial={{opacity: 0}} animate={{opacity: 1}} className="block text-magic-glow">
            {egg.reveals[1]}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </button>
  );
}
