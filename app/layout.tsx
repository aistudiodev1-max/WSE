import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../src/index.css';
import { AuthProvider } from '../src/context/AuthContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Wisdom Study Engine',
  description: 'AI-Powered Spiritual Learning Interface',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
