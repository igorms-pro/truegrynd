import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Truegrynd',
    template: '%s · Truegrynd',
  },
  description:
    'Async fitness competition. Standardized challenges, global leaderboard, free. Prove your effort.',
  applicationName: 'Truegrynd',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL
      ? process.env.NEXT_PUBLIC_SITE_URL
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'http://localhost:3000',
  ),
  openGraph: {
    type: 'website',
    title: 'Truegrynd',
    description:
      'Async fitness competition. Standardized challenges, global leaderboard, free. Prove your effort.',
    siteName: 'Truegrynd',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Truegrynd',
    description:
      'Async fitness competition. Standardized challenges, global leaderboard, free. Prove your effort.',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
