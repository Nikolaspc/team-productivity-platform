// src/app/layout.tsx
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

// English: Loading the Inter font for the entire application
const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* English: This is the main injection point for all pages and nested layouts */}
        {children}

        {/* English: Global toast notifications for the login and server responses */}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
