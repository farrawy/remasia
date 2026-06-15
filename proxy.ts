import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

// Next 16 renamed the `middleware` convention to `proxy`. This handles locale
// negotiation/redirect ONLY. Studio access is enforced by requireAdmin() in the
// (studio) layout and in every Studio Server Action — not here.
export default createMiddleware(routing);

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
