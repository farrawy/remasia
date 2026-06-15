import {Link} from '@/i18n/navigation';
import {Bloom} from '@/components/ui/Bloom';

export function Logo({label}: {label: string}) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label={label}>
      <span className="grid size-9 place-items-center rounded-full bg-rose-100 transition-transform duration-500 group-hover:rotate-[18deg]">
        <Bloom className="size-6" />
      </span>
      <span className="font-display text-2xl leading-none text-deep-berry">{label}</span>
    </Link>
  );
}
