import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import '../src/index.css';
import { ReactQueryProvider } from '../src/lib/react-query';
import { AuthInitializer } from '../src/features/auth/AuthInitializer';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const poppins = Poppins({ subsets: ['latin'], weight: ['400', '500', '600', '700'], variable: '--font-poppins' });

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
    <html lang="en" className={`${inter.variable} ${poppins.variable} h-full`}>
      <body className="antialiased h-full">
        <ReactQueryProvider>
          <AuthInitializer>
            {children}
          </AuthInitializer>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
