import {setRequestLocale} from 'next-intl/server';
import {LoginForm} from '@/components/studio/LoginForm';

export default async function StudioLoginPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);

  return (
    <main className="bg-magic-wash grid min-h-dvh place-items-center p-6">
      <LoginForm />
    </main>
  );
}
