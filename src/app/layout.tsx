import type { Metadata } from 'next';
import { Inter, Noto_Sans_Devanagari } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import Sidebar from '@/components/Sidebar';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { Shield, Lock, CheckCircle2 } from 'lucide-react';

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
  description: 'Bilingual SSB five-day orientation guide, timed PPDT practice simulator, and instant AI feedback on handwritten stories.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${notoDevanagari.variable}`}>
      <body className="bg-[#0d120c] text-gray-100 min-h-screen flex flex-col font-sans selection:bg-olive-600 selection:text-white antialiased">
        <LanguageProvider>
          {/* Left Sidebar Navigation (Desktop only, hidden on mobile & practice focus mode) */}
          <Sidebar />

          {/* Main Content Area (Offset by sidebar width on desktop: md:pl-64) */}
          <div className="md:pl-64 flex-1 flex flex-col min-w-0">
            {/* Top Bar with Global Language Switch (Step 8) */}
            <TopBar />

            {/* Page content (pb-20 on mobile to leave room for bottom nav bar) */}
            <main className="flex-1 flex flex-col pb-20 md:pb-0">
              {children}
            </main>

            {/* Mobile Bottom Navigation (Step 9: Home, Guide, Practice) */}
            <BottomNav />

            {/* Global Footer */}
            <footer className="border-t border-olive-900/60 bg-[#080d07] py-8 text-xs text-[#a8baa3]">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-camo-gold" />
                  <span className="font-semibold text-gray-300">VENEHA SSB PREPARATION PLATFORM</span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-6 text-[13px] text-[#a8baa3]">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    Handwriting photos deleted immediately after transcription
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-camo-gold" />
                    Practice guidance only — not an official selection verdict
                  </span>
                </div>

                <p className="text-gray-400 text-[13px]">
                  Built for Defence Aspirants (NDA, CDS, AFCAT, TGC, NCC).
                </p>
              </div>
            </footer>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
