import type { Metadata } from 'next';
import { Inter, Noto_Sans_Devanagari } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import TopNavigation from '@/components/TopNavigation';
import Footer from '@/components/Footer';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-hindi',
});

export const metadata: Metadata = {
  title: 'Veneha | SSB Simulator and AI Assessor',
  description:
    'Bilingual SSB five-day orientation guide, timed PPDT practice simulator, and instant AI feedback on handwritten stories.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${notoDevanagari.variable}`}>
      <body className="bg-canvas text-ink min-h-screen flex flex-col font-sans selection:bg-primary selection:text-white antialiased">
        <LanguageProvider>
          {/* Sticky Top Navigation (White, 64px, 1px hairline border) */}
          <TopNavigation />

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col min-w-0 bg-canvas">
            {children}
          </main>

          {/* Global Light Footer */}
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
