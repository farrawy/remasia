'use client';

import {useState} from 'react';
import {BloomThumb} from '@/components/ui/Bloom';
import {cn} from '@/lib/utils';

// Shows the cover image when it exists; if it's missing (e.g. a seeded
// placeholder path with no file yet) it falls back to the seeded bloom art.
export function CoverImage({
  src,
  seed,
  featured,
  className
}: {
  src: string | null;
  seed: string;
  featured?: boolean;
  className?: string;
}) {
  const [ok, setOk] = useState(true);
  if (src && ok) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" onError={() => setOk(false)} className={cn('object-cover', className)} />;
  }
  return <BloomThumb seed={seed} featured={featured} className={className} />;
}
