import type { Metadata } from 'next';
import { VT323, Press_Start_2P, Comic_Neue } from 'next/font/google';
import './globals.css';

const vt = VT323({ weight: '400', subsets: ['latin'], variable: '--font-terminal' });
const ps = Press_Start_2P({ weight: '400', subsets: ['latin'], variable: '--font-pixel' });
const cn = Comic_Neue({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-comic' });

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://aws-vols.vercel.app';

/**
 * This is what shows when a vol pastes their link into WhatsApp, so it must
 * give nothing away — no name, no result, no hint of the prank. Identical for
 * every page on purpose.
 */
export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: 'HELLO',
  description: 'you have 1 (one) unread message.',
  openGraph: {
    title: 'HELLO',
    description: 'you have 1 (one) unread message.',
    images: [{ url: '/og.png', width: 1200, height: 630, alt: 'HELLO' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HELLO',
    description: 'you have 1 (one) unread message.',
    images: ['/og.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${vt.variable} ${ps.variable} ${cn.variable}`}>
      <body>{children}</body>
    </html>
  );
}
