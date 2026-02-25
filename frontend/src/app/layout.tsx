import type { Metadata } from 'next';
import { Playfair_Display, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';

const grotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-grotesk',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: 'Elegant Steel Hardware - ERP System',
  description: 'Complete ERP system for Elegant Steel Hardware',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${grotesk.variable} ${playfair.variable} font-sans`}>
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
