import {setRequestLocale, getTranslations} from 'next-intl/server';
import {getSettings} from '@/lib/queries';
import {SettingsForm} from '@/components/studio/SettingsForm';

export default async function StudioSettings({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('studio.settingsForm');
  const s = await getSettings();

  const initial = {
    whatsappNumber: s.whatsappNumber ?? '',
    boutiqueName: s.boutiqueName ?? 'Remasia',
    instagramUrl: s['instagram.url'] ?? '',
    tiktokUrl: s['tiktok.url'] ?? '',
    bankTextEn: s['bankTransfer.text.en'] ?? '',
    bankTextAr: s['bankTransfer.text.ar'] ?? '',
    currency: s.currency ?? 'SAR'
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-3xl text-deep-berry">{t('title')}</h1>
      <p className="mt-1 text-text-muted">{t('subtitle')}</p>
      <div className="mt-6">
        <SettingsForm initial={initial} />
      </div>
    </div>
  );
}
