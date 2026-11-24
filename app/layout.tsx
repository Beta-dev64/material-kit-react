import './globals.css';

import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Kredia | Receivables workspace prototype',
    template: '%s | Kredia',
  },
  description:
    'Explore Kredia’s JSON-backed frontend prototype for receivables administration, tenant organizations, collections, and payments.',
  applicationName: 'Kredia',
  keywords: [
    'accounts receivable management',
    'receivables dashboard',
    'collections management',
    'invoice reconciliation',
    'payment allocation',
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    siteName: 'Kredia',
    title: 'Kredia | Accounts receivable, in rhythm',
    description:
      'Manage accounts receivable, collections, and payments in one clear, accountable workspace.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kredia | Accounts receivable, in rhythm',
    description:
      'Manage accounts receivable, collections, and payments in one clear, accountable workspace.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0b221f',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
