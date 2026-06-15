import {createNavigation} from 'next-intl/navigation';
import {routing} from './routing';

// Always import Link/redirect/usePathname/useRouter from here (never from
// next/link or next/navigation) so the locale prefix is preserved automatically.
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
