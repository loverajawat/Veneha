'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, User, Flame, Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { getGuest, getDailyUsage, GuestProfile, DailyUsage } from '@/lib/guestStorage';
import { siteConfig } from '@/config/siteConfig';
import GuestModal from './GuestModal';

export default function TopBar() {
  const { lang, setLang } = useLanguage();
  const [guest, setGuest] = useState<GuestProfile | null>(null);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage>({ date: '', count: 0, limit: 5 });
  const [showGuestModal, setShowGuestModal] = useState(false);

  useEffect(() => {
    setGuest(getGuest());
    setDailyUsage(getDailyUsage());

    const interval = setInterval(() => {
      setDailyUsage(getDailyUsage());
      setGuest(getGuest());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 w-full border-b border-olive-800/80 bg-[#0d120c]/90 backdrop-blur-md px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Mobile: VENEHA Logo (Step 8) */}
        <div className="flex items-center space-x-2.5 md:hidden">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-olive-600 to-olive-800 border border-olive-500/50 flex items-center justify-center text-camo-gold shadow-md">
              <Shield className="w-4 h-4" />
            </div>
            <span className="font-logo font-bold text-lg tracking-wider text-white">
              VENEHA
            </span>
          </Link>
        </div>

        {/* Desktop: subtle location / status hint */}
        <div className="hidden md:flex items-center space-x-2 text-sm text-[#a8baa3]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{lang === 'hi' ? siteConfig.topBarStatus.hi : siteConfig.topBarStatus.en}</span>
        </div>

        {/* Right side controls: Profile dropdown/menu (Mobile) + Global Language Switch (EN | हिं) */}
        <div className="flex items-center space-x-3">
          {/* Mobile Profile Trigger (Step 9) */}
          <button
            onClick={() => setShowGuestModal(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131b12] border border-olive-700/80 text-xs font-medium text-gray-200 min-h-[44px]"
            aria-label="Cadet profile"
          >
            <User className="w-3.5 h-3.5 text-camo-gold" />
            <span className="max-w-[100px] truncate">{guest ? guest.name : 'Cadet'}</span>
          </button>

          {/* Global Language Switcher (Step 8: EN | हिं) */}
          <div className="flex items-center rounded-lg bg-[#111710] border border-olive-700/80 p-0.5 shadow-sm">
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-md transition-all min-h-[36px] ${
                lang === 'en'
                  ? 'bg-olive-600 text-white shadow-sm'
                  : 'text-[#a8baa3] hover:text-white'
              }`}
              aria-label="Switch language to English"
            >
              EN
            </button>
            <span className="text-gray-600 px-0.5 text-xs">|</span>
            <button
              onClick={() => setLang('hi')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-md transition-all min-h-[36px] ${
                lang === 'hi'
                  ? 'bg-olive-600 text-white shadow-sm'
                  : 'text-[#a8baa3] hover:text-white'
              }`}
              aria-label="भाषा हिंदी में बदलें"
            >
              हिं
            </button>
          </div>
        </div>
      </header>

      {/* Guest Modal */}
      {showGuestModal && (
        <GuestModal
          currentGuest={guest}
          onClose={() => setShowGuestModal(false)}
          onSaved={(newProfile) => {
            setGuest(newProfile);
            setShowGuestModal(false);
          }}
        />
      )}
    </>
  );
}

