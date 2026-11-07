import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PRO SHOP | Cloud Mobile Shop Management System',
  description: 'Automated POS, IMEI Inventory, Mobile Repairs, and Double-Entry Accounting for Mobile & Electronics Shops',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className="antialiased selection:bg-blue-600 selection:text-white bg-slate-50 text-slate-900 min-h-full flex flex-col overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
