import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'SaaS Platform',
  description: 'Enterprise Team Productivity',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        {/* English: RichColors enabled for success/error distinction */}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
