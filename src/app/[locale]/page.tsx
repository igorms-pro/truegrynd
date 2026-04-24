import { redirect } from 'next/navigation';

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<never> {
  // Next 16: dynamic route params are async.
  const { locale } = await params;
  return redirect(`/${locale}/auth`);
}
