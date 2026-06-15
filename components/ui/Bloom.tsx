import {cn} from '@/lib/utils';

// An abstract layered-petal bloom (rose tones) — the house motif. Elegant, not
// cartoonish. Reused as the logo glyph and as image placeholders until real
// boutique photos exist.
export function Bloom({className, petals = 6}: {className?: string; petals?: number}) {
  const items = Array.from({length: petals});
  return (
    <svg viewBox="-50 -50 100 100" className={className} aria-hidden="true" role="presentation">
      <g>
        {items.map((_, i) => (
          <ellipse
            key={i}
            cx="0"
            cy="-26"
            rx="13"
            ry="24"
            fill="var(--rose-300)"
            opacity="0.85"
            transform={`rotate(${(360 / petals) * i})`}
          />
        ))}
      </g>
      <g>
        {items.map((_, i) => (
          <ellipse
            key={i}
            cx="0"
            cy="-15"
            rx="7"
            ry="14"
            fill="var(--rose-400)"
            opacity="0.9"
            transform={`rotate(${(360 / petals) * i + 180 / petals})`}
          />
        ))}
      </g>
      <circle cx="0" cy="0" r="9" fill="var(--rose-500)" />
      <circle cx="0" cy="0" r="4" fill="var(--magic-glow)" />
    </svg>
  );
}

// A decorative thumbnail block (dream-panel wash + bloom + soft glow) used wherever
// a real photo will later go. TODO(images): swap for <Image> once photos are uploaded.
export function BloomThumb({
  className,
  featured = false
}: {
  className?: string;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        'relative grid place-items-center overflow-hidden bg-dream-panel',
        featured && 'glow-fairy',
        className
      )}
    >
      <div className="absolute inset-0 bg-petal-field opacity-40" />
      <Bloom className="relative size-2/5 max-w-[120px] drop-shadow-[0_6px_18px_rgba(248,91,153,0.35)] float-slow" />
    </div>
  );
}
