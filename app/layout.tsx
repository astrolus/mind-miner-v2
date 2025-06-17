import './globals.css';
import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({ 
  subsets: ['latin'], 
  variable: '--font-poppins',
  weight: ['300', '400', '500', '600', '700', '800', '900']
});

export const metadata: Metadata = {
  title: 'Mind-Miner: The Reddit Knowledge Hunt',
  description: 'Uncover hidden facts on Reddit, win testnet crypto, and earn unique Algorand NFT trophies. Powered by AI.',
  keywords: ['reddit', 'knowledge hunt', 'blockchain', 'algorand', 'ai', 'crypto', 'nft'],
  authors: [{ name: 'Mind-Miner Team' }],
  viewport: 'width=device-width, initial-scale=1',
  openGraph: {
    title: 'Mind-Miner: The Reddit Knowledge Hunt',
    description: 'Uncover hidden facts on Reddit, win testnet crypto, and earn unique Algorand NFT trophies. Powered by AI.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}