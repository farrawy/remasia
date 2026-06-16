import {getTranslations} from 'next-intl/server';
import {Butterfly, Sparkle, Heart} from '@phosphor-icons/react/dist/ssr';
import {Button} from '@/components/ui/Button';
import {Bloom} from '@/components/ui/Bloom';

export async function Hero() {
  const t = await getTranslations();

  return (
    <section className="relative overflow-hidden">
      {/* layered background washes for depth */}
      <div className="absolute inset-0 bg-magic-wash" />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(55% 50% at 84% 18%, rgba(205,180,255,0.55), transparent 60%),' +
            'radial-gradient(50% 45% at 12% 82%, rgba(255,184,213,0.55), transparent 60%)'
        }}
      />

      {/* giant soft bloom behind the wordmark */}
      <Bloom className="pointer-events-none absolute start-1/2 top-20 size-[440px] -translate-x-1/2 opacity-20 blur-2xl" />

      {/* floating blooms */}
      <Bloom className="drift pointer-events-none absolute start-[6%] top-[16%] size-28 opacity-50 blur-[1px]" />
      <Bloom className="drift pointer-events-none absolute end-[9%] top-[30%] size-20 opacity-40 blur-[1px] [animation-delay:2s]" />
      <Bloom className="float-slow pointer-events-none absolute start-[15%] bottom-[20%] size-16 opacity-40 [animation-delay:1s]" />

      {/* cute + magical accents (duotone, storefront) */}
      <Butterfly weight="duotone" className="drift pointer-events-none absolute end-[17%] top-[20%] size-9 text-fairy-purple [animation-delay:1.2s]" />
      <Sparkle weight="duotone" className="twinkle pointer-events-none absolute start-[27%] top-[13%] size-7 text-rose-400" />
      <Sparkle weight="duotone" className="twinkle pointer-events-none absolute end-[29%] bottom-[26%] size-6 text-fairy-purple [animation-delay:1.5s]" />
      <Heart weight="duotone" className="float-slow pointer-events-none absolute start-[11%] top-[46%] size-7 text-rose-300 [animation-delay:0.6s]" />

      {/* pearls */}
      <span className="pearl twinkle pointer-events-none absolute end-[34%] top-[40%] size-3 [animation-delay:0.4s]" />
      <span className="pearl twinkle pointer-events-none absolute start-[33%] bottom-[30%] size-2.5 [animation-delay:1.8s]" />
      <span className="pearl pointer-events-none absolute end-[14%] bottom-[34%] size-3.5" />

      <div className="relative mx-auto max-w-3xl container-px pt-24 pb-36 text-center md:pt-32 md:pb-44">
        <p className="bloom inline-flex items-center gap-2 rounded-pill border border-line bg-pearl/70 px-4 py-1.5 text-sm text-deep-berry shadow-[var(--shadow-petal)] backdrop-blur">
          <span className="pearl size-2" />
          <Sparkle weight="fill" size={14} className="text-accent-strong" />
          {t('home.heroKicker')}
          <span className="pearl size-2" />
        </p>

        <h1 className="bloom mt-7 font-display text-7xl leading-[0.95] text-deep-berry text-glow md:text-9xl [animation-delay:80ms]">
          {t('common.brand')}
        </h1>

        <p className="bloom mx-auto mt-6 max-w-xl text-lg text-muted md:text-xl [animation-delay:160ms]">
          {t('common.tagline')}
        </p>

        <div className="bloom mt-9 flex flex-wrap items-center justify-center gap-3 [animation-delay:240ms]">
          <Button href="/shop" variant="magic" size="lg">
            {t('nav.shop')}
          </Button>
          <Button href="/garden" variant="soft" size="lg">
            {t('nav.garden')}
          </Button>
        </div>

        <p className="bloom mt-8 inline-flex items-center gap-2 text-xs tracking-wide text-text-muted [animation-delay:320ms]">
          <span className="h-px w-5 bg-text-muted/50" />
          {t('home.location')}
          <span className="h-px w-5 bg-text-muted/50" />
        </p>
      </div>

      {/* scalloped transition into the page */}
      <svg
        className="absolute inset-x-0 bottom-0 h-[40px] w-full text-bg md:h-[60px]"
        viewBox="0 0 1200 60"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M0,60 L0,28 C150,52 300,52 450,34 C600,16 750,16 900,34 C1050,52 1150,52 1200,30 L1200,60 Z"
        />
      </svg>
    </section>
  );
}
