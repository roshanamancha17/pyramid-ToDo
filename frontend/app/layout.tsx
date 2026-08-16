import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/lib/app-context';

export const metadata: Metadata = {
  title: 'Pyramid',
  description: 'Task management, done right.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" data-color="blue">
      <body className="antialiased font-sans">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
