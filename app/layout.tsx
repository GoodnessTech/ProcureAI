import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://procureai.io'),
  title: 'ProcureAI — Your autonomous procurement agent',
  description:
    'ProcureAI analyzes approved suppliers across price, delivery, reputation, warranty, and commercial terms — then recommends the best option for your business.',
  openGraph: {
    title: 'ProcureAI — Your autonomous procurement agent',
    description:
      'Tell ProcureAI what your company needs. Your AI agent evaluates suppliers, compares terms, and recommends the best purchasing decision.',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: [
      {
        url: 'https://bolt.new/static/og_default.png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  );
}
