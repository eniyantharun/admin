import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || 'Admin Dashboard',
  description: 'A modern admin dashboard built with Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="app-root-html">
      <body className={`app-root-body ${inter.className}`}>
        <div className="app-root-container">
          <Providers>
            <div className="app-content-wrapper">
              {children}
            </div>
          </Providers>
        </div>
      </body>
    </html>
  );
}