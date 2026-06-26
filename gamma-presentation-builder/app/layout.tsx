import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gamma Presentation Builder',
  description: 'Personal AI presentation generator with Gamma integration'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
