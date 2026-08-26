import type { Metadata } from 'next';
import { VT323, Press_Start_2P, Comic_Neue } from 'next/font/google';
import './globals.css';

const vt = VT323({ weight: '400', subsets: ['latin'], variable: '--font-terminal' });
const ps = Press_Start_2P({ weight: '400', subsets: ['latin'], variable: '--font-pixel' });
const cn = Comic_Neue({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-comic' });

export const metadata: Metadata = {
  title: 'under construction',
  description: 'this page is under construction',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${vt.variable} ${ps.variable} ${cn.variable}`}>
      <body>{children}</body>
    </html>
  );
}
