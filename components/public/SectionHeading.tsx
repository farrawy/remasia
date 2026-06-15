import {cn} from '@/lib/utils';

export function SectionHeading({
  kicker,
  title,
  className
}: {
  kicker?: string;
  title: string;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {kicker ? (
        <span className="inline-flex items-center gap-2 text-sm font-medium text-accent-strong">
          <span className="h-px w-6 bg-accent-strong/60" aria-hidden />
          {kicker}
        </span>
      ) : null}
      <h2 className="font-display text-3xl text-deep-berry md:text-4xl">{title}</h2>
    </div>
  );
}
