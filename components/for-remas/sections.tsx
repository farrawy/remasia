'use client';

import {useState, type ReactNode} from 'react';
import {motion, AnimatePresence, useReducedMotion} from 'framer-motion';
import {Sparkle, Heart, Flower, Images} from '@phosphor-icons/react/dist/ssr';
import {Link} from '@/i18n/navigation';
import {BloomThumb} from '@/components/ui/Bloom';
import {cn} from '@/lib/utils';
import type {LetterContent} from './content';

const GLASS = 'rounded-3xl border border-white/15 bg-white/[0.06] backdrop-blur-md shadow-[0_18px_60px_-24px_rgba(0,0,0,0.55)]';

function Reveal({children, delay = 0, className}: {children: ReactNode; delay?: number; className?: string}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : {opacity: 0, y: 28}}
      whileInView={{opacity: 1, y: 0}}
      viewport={{once: true, amount: 0.35}}
      transition={{duration: 0.95, ease: [0.2, 0.7, 0.2, 1], delay}}
    >
      {children}
    </motion.div>
  );
}

function Kicker() {
  return (
    <span className="mx-auto mb-4 flex w-fit items-center gap-2 text-magic-glow/80">
      <span className="h-px w-6 bg-magic-glow/40" />
      <Sparkle weight="fill" className="size-3.5" />
      <span className="h-px w-6 bg-magic-glow/40" />
    </span>
  );
}

function SectionTitle({children}: {children: ReactNode}) {
  return <h2 className="font-display text-3xl leading-tight text-pearl md:text-4xl">{children}</h2>;
}

// ── A trait chip + a shared copy line below the grid ─────────
function World({c}: {c: LetterContent['world']}) {
  const [active, setActive] = useState<number | null>(null);
  const activeCopy = active !== null ? c.traits[active]?.copy : undefined;

  return (
    <Reveal className="flex flex-col items-center">
      <Kicker />
      <SectionTitle>{c.title}</SectionTitle>
      <div className="mt-7 flex max-w-xl flex-wrap items-center justify-center gap-2.5">
        {c.traits.map((tr, i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive((a) => (a === i ? null : a))}
            onFocus={() => setActive(i)}
            onClick={() => setActive((a) => (a === i ? null : i))}
            className={cn(
              'rounded-full border px-4 py-2 text-sm transition-all duration-300',
              active === i
                ? 'border-magic-glow/60 bg-white/15 text-pearl shadow-[0_0_22px_-6px_var(--magic-glow)]'
                : 'border-white/15 bg-white/[0.06] text-pearl/85 hover:bg-white/10'
            )}
          >
            {tr.label}
          </button>
        ))}
      </div>
      <div className="mt-4 flex min-h-6 items-center justify-center">
        <AnimatePresence mode="wait">
          {activeCopy ? (
            <motion.p
              key={active}
              initial={{opacity: 0, y: 6}}
              animate={{opacity: 1, y: 0}}
              exit={{opacity: 0, y: -6}}
              transition={{duration: 0.4}}
              className="text-sm text-pearl/75"
            >
              {activeCopy}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </Reveal>
  );
}

// ── The "open the first bouquet" gift reveal ─────────────────
function BouquetReveal({c}: {c: LetterContent['bouquet']}) {
  const [open, setOpen] = useState(false);

  return (
    <Reveal className="flex flex-col items-center">
      <div className={cn(GLASS, 'w-full max-w-md overflow-hidden p-2')}>
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.div
              key="open"
              initial={{opacity: 0, scale: 0.96}}
              animate={{opacity: 1, scale: 1}}
              transition={{duration: 0.8, ease: [0.2, 0.7, 0.2, 1]}}
              className="p-4 text-center"
            >
              <BloomThumb seed="the-remas-bouquet" featured className="mx-auto aspect-[4/5] w-44 rounded-2xl" />
              <h3 className="mt-4 font-display text-2xl text-pearl">{c.title}</h3>
              <div className="mt-2 space-y-1 text-sm text-pearl/80">
                {c.lines.map((l, i) => (
                  <p key={i}>{l}</p>
                ))}
              </div>
              <Link
                href="/product/the-remas-bouquet"
                className="btn-magic mt-5 inline-flex px-7 py-3 font-display text-base"
              >
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
              transition={{duration: 0.5}}
              className="group relative grid w-full place-items-center p-10"
            >
              <div className="relative grid size-32 place-items-center rounded-full bg-white/[0.06] transition-transform duration-500 group-hover:scale-105">
                <div
                  className="absolute inset-0 rounded-full blur-xl"
                  style={{background: 'radial-gradient(circle, rgba(255,184,213,0.45), transparent 70%)'}}
                />
                <Flower weight="duotone" className="relative size-14 text-magic-glow" />
              </div>
              <p className="mt-5 font-display text-2xl text-pearl">{c.before}</p>
              <p className="mt-1 text-xs text-pearl/55">{c.hint}</p>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  );
}

function StudioCard({label, copy, icon}: {label: string; copy: string; icon: ReactNode}) {
  return (
    <div className={cn(GLASS, 'flex flex-col items-center gap-2 p-6 text-center transition-colors hover:bg-white/10')}>
      <span className="grid size-12 place-items-center rounded-2xl bg-white/10 text-magic-glow">{icon}</span>
      <h3 className="font-display text-xl text-pearl">{label}</h3>
      <p className="text-sm text-pearl/70">{copy}</p>
    </div>
  );
}

// ── A tiny hidden reveal (heart / sparkle) ───────────────────
function SecretSpot({reveal, icon}: {reveal: string; icon: ReactNode}) {
  const [shown, setShown] = useState(false);
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        aria-label={reveal}
        onClick={() => setShown(true)}
        className="grid size-10 place-items-center rounded-full transition-transform hover:scale-110"
      >
        {icon}
      </button>
      <AnimatePresence>
        {shown ? (
          <motion.p
            initial={{opacity: 0, y: 6, scale: 0.96}}
            animate={{opacity: 1, y: 0, scale: 1}}
            transition={{duration: 0.6, ease: 'easeOut'}}
            className="max-w-xs text-center text-sm italic text-pearl/80"
          >
            {reveal}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function LetterSections({content}: {content: LetterContent}) {
  const studioIcons: Record<string, ReactNode> = {
    magic: <Sparkle weight="duotone" className="size-6" />,
    bouquets: <Flower weight="duotone" className="size-6" />,
    garden: <Images weight="duotone" className="size-6" />
  };

  return (
    <div className="relative z-10">
      {/* 1 — The moment I remembered */}
      <section className="mx-auto max-w-xl container-px py-20 text-center md:py-28">
        <Reveal>
          <div className={cn(GLASS, 'p-8 md:p-10')}>
            <Kicker />
            <SectionTitle>{content.moment.title}</SectionTitle>
            <div className="mt-5 space-y-3 text-pearl/85 leading-relaxed">
              {content.moment.lines.map((l, i) => (
                <p key={i}>{l}</p>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* 2 — This world was made from you */}
      <section className="mx-auto max-w-2xl container-px py-16 text-center md:py-20">
        <World c={content.world} />
      </section>

      {/* 3 — Your favorite flowers */}
      <section className="mx-auto max-w-3xl container-px py-16 text-center md:py-20">
        <Reveal className="flex flex-col items-center">
          <Kicker />
          <SectionTitle>{content.flowers.title}</SectionTitle>
        </Reveal>
        <div className="mt-9 grid grid-cols-2 gap-4 md:grid-cols-4">
          {content.flowers.items.map((f, i) => (
            <Reveal key={f.seed} delay={i * 0.08}>
              <div className={cn(GLASS, 'h-full overflow-hidden p-3 text-center')}>
                <BloomThumb seed={f.seed} className="aspect-square w-full rounded-2xl" />
                <h3 className="mt-3 font-display text-lg text-pearl">{f.name}</h3>
                <p className="mt-1 text-xs text-pearl/70 leading-relaxed">{f.copy}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 4 — Open the first bouquet */}
      <section className="mx-auto max-w-2xl container-px py-16 text-center md:py-20">
        <BouquetReveal c={content.bouquet} />
      </section>

      {/* 5 — A tiny promise */}
      <section className="mx-auto max-w-xl container-px py-20 text-center md:py-28">
        <Reveal className="flex flex-col items-center">
          <Kicker />
          <SectionTitle>{content.promise.title}</SectionTitle>
        </Reveal>
        <div className="mt-7 space-y-3">
          {content.promise.lines.map((l, i) => (
            <Reveal key={i} delay={i * 0.18}>
              <p className="text-lg text-pearl/85 leading-relaxed">{l}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* 6 — Your studio is waiting */}
      <section className="mx-auto max-w-4xl container-px py-16 text-center md:py-20">
        <Reveal className="flex flex-col items-center">
          <Kicker />
          <SectionTitle>{content.studio.title}</SectionTitle>
        </Reveal>
        <div className="mt-9 grid gap-4 sm:grid-cols-3">
          {content.studio.cards.map((card, i) => (
            <Reveal key={card.key} delay={i * 0.1}>
              <StudioCard label={card.label} copy={card.copy} icon={studioIcons[card.key]} />
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}>
          <Link href="/studio/login" className="btn-magic mt-9 inline-flex px-8 py-3.5 font-display text-lg">
            {content.studio.cta}
          </Link>
        </Reveal>
      </section>

      {/* 7 — Secret sparkles */}
      <section className="mx-auto max-w-xl container-px py-10 text-center">
        <Reveal>
          <SecretSpot reveal={content.secrets.heart} icon={<Heart weight="fill" className="size-6 text-romantic-red twinkle" />} />
        </Reveal>
      </section>

      {/* 8 — Final door */}
      <section className="mx-auto max-w-2xl container-px py-24 text-center md:py-32">
        <Reveal className="flex flex-col items-center">
          <Kicker />
          <SectionTitle>{content.finalDoor.title}</SectionTitle>
          <div className="mt-5 space-y-2 text-lg text-pearl/85">
            {content.finalDoor.lines.map((l, i) => (
              <p key={i}>{l}</p>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/" className="btn-magic px-8 py-3.5 font-display text-lg">
              {content.finalDoor.primary}
            </Link>
            <Link
              href="/studio/login"
              className="rounded-pill border border-white/40 bg-white/10 px-8 py-3.5 font-display text-lg text-pearl backdrop-blur transition-colors hover:bg-white/20"
            >
              {content.finalDoor.secondary}
            </Link>
          </div>
        </Reveal>
      </section>

      {/* footer secret + signature */}
      <footer className="flex flex-col items-center gap-6 pb-16 text-center">
        <SecretSpot reveal={content.secrets.footer} icon={<Sparkle weight="fill" className="size-5 text-magic-glow twinkle" />} />
        <p className="text-sm text-pearl/55">{content.signature}</p>
      </footer>
    </div>
  );
}
