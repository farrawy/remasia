import {Tajawal, Dancing_Script, Lalezar} from 'next/font/google';

// Body / UI — covers Arabic + Latin. Used everywhere (storefront + Studio).
export const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-body'
});

// Latin display — headings, the "Remasia" wordmark, for-remas title (EN).
export const dancingDisplay = Dancing_Script({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-display-latin'
});

// Arabic display — AR headings & the for-remas title (AR).
export const lalezarDisplay = Lalezar({
  subsets: ['arabic'],
  weight: ['400'],
  variable: '--font-display-arabic'
});
