import {getTranslations} from 'next-intl/server';
import {Button} from '@/components/ui/Button';
import {Bloom} from '@/components/ui/Bloom';

export async function Hero() {
  const t = await getTranslations();

  return (
    <section className="relative overflow-hidden bg-magic-wash">
      {/* floating blooms */}
      <Bloom className="float-slow pointer-events-none absolute -start-10 top-16 size-40 opacity-40" />
      <Bloom className="float-slow pointer-events-none absolute end-[8%] top-24 size-24 opacity-30 [animation-delay:1.5s]" />
      <Bloom className="float-slow pointer-events-none absolute end-[18%] bottom-10 size-16 opacity-25 [animation-delay:3s]" />
      {/* sparkle dots */}
      <span className="twinkle pointer-events-none absolute start-[30%] top-12 size-2 rounded-full bg-fairy-purple" />
      <span className="twinkle pointer-events-none absolute end-[35%] top-28 size-1.5 rounded-full bg-rose-400 [animation-delay:1s]" />
      <span className="twinkle pointer-events-none absolute start-[22%] bottom-16 size-2.5 rounded-full bg-magic-glow [animation-delay:2s]" />

      <div className="relative mx-auto max-w-3xl container-px py-24 text-center md:py-32">
        <p className="bloom inline-flex items-center gap-2 rounded-pill border border-line bg-pearl/70 px-4 py-1.5 text-sm text-deep-berry backdrop-blur">
          {t('home.heroKicker')}
        </p>
        <h1 className="bloom mt-6 font-display text-6xl text-deep-berry md:text-8xl [animation-delay:80ms]">
          {t('common.brand')}
        </h1>
        <p className="bloom mx-auto mt-5 max-w-xl text-lg text-muted [animation-delay:160ms]">
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
      </div>
    </section>
  );
}
