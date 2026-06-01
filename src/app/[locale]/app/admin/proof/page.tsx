import { getTranslations } from 'next-intl/server';

import { AdminProofPageShell } from '@/features/admin/components/AdminProofPageShell';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminProofRoute({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('admin.proof');

  return (
    <div>
      <h1 className="text-xl font-black uppercase tracking-tight">{t('title')}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
      <div className="mt-6">
        <AdminProofPageShell locale={locale} />
      </div>
    </div>
  );
}
