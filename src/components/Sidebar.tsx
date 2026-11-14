'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Shield, 
  BookOpen, 
  Clock, 
  History, 
  User, 
  Lock,
  Flame,
  Pencil,
  Settings
} from 'lucide-react';
import { getGuest, getDailyUsage, getStoredAttempts, GuestProfile, DailyUsage } from '@/lib/guestStorage';
import { getWatDailyUsage, WatDailyUsage, WAT_DAILY_LIMIT, getWatAttempts } from '@/lib/watStorage';
import { useLanguage } from '@/context/LanguageContext';
import { siteConfig } from '@/config/siteConfig';
import GuestModal from './GuestModal';
import SettingsModal from './SettingsModal';

const iconMap = {
  Shield,
  BookOpen,
  Clock,
  History,
};

interface NavItemProps {
  href: string;
  isActive: boolean;
  isPrimary?: boolean;
  label: string;
  subLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
}

function NavItem({ href, isActive, isPrimary, label, subLabel, icon: Icon, count }: NavItemProps) {
  return (
    <Link
      href={href}
      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        isActive
          ? 'bg-olive-800 text-white border border-olive-500 shadow-lg shadow-olive-950/40'
          : isPrimary
          ? 'bg-gradient-to-r from-olive-800/90 to-olive-700/90 hover:from-olive-700 hover:to-olive-600 text-white border border-olive-600/80 hover:border-olive-500 shadow-md'
          : 'text-gray-300 hover:text-white hover:bg-olive-900/40 border border-transparent'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Fixed 24px icon column (Item B) */}
        <div
          className={`w-6 h-6 flex items-center justify-center shrink-0 transition-colors ${
            isActive || isPrimary
              ? 'text-camo-gold'
              : 'text-olive-400 group-hover:text-camo-gold'
          }`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div className="text-left font-sans min-w-0">
          <div className={`font-semibold text-sm leading-snug truncate ${isActive || isPrimary ? 'text-white' : 'text-gray-200'}`}>
            {label}
          </div>
          <div className="text-[12px] sm:text-[13px] text-[#a8baa3] leading-tight truncate">
            {subLabel}
          </div>
        </div>
      </div>

      {count !== undefined && count > 0 && (
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#131b12] text-olive-300 border border-olive-800 font-sans shrink-0 ml-2">
          {count}
        </span>
      )}
    </Link>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { lang } = useLanguage();
  const [guest, setGuest] = useState<GuestProfile | null>(null);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage>({ date: '', count: 0, limit: 5 });
  const [watUsage, setWatUsage] = useState<WatDailyUsage>({ date: '', count: 0, limit: WAT_DAILY_LIMIT });
  const [attemptCount, setAttemptCount] = useState(0);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    const refresh = () => {
      setGuest(getGuest());
      setDailyUsage(getDailyUsage());
      setWatUsage(getWatDailyUsage());
      setAttemptCount(getStoredAttempts().length + getWatAttempts().length);
    };

    refresh();

    window.addEventListener('attempts-updated', refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener('usage-updated', refresh);

    const interval = setInterval(refresh, 3000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('attempts-updated', refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('usage-updated', refresh);
    };
  }, []);

  return (
    <>
      {/* Desktop Fixed Left Navigation Bar (Item A: Fixed-height flex column, pinned header & footer) */}
      <aside
        className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-64 z-40 bg-[#0a0f09] border-r border-olive-800/80 text-gray-200 shadow-2xl overflow-hidden justify-between"
        aria-label="Sidebar navigation"
      >
        {/* Brand Header: Pinned at top */}
        <div className="shrink-0 p-4 sm:p-5 border-b border-olive-800/70 bg-[#0a0f09]">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-olive-600 to-olive-800 border border-olive-500/50 flex items-center justify-center shadow-lg shadow-olive-950/40 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-camo-gold" />
            </div>
            <div className="min-w-0">
              <div className="font-serif font-bold text-xl tracking-wider text-white">
                {siteConfig.name}
              </div>
              <p className="text-[12px] sm:text-[13px] text-[#a8baa3] font-sans -mt-0.5 tracking-tight truncate">
                {lang === 'hi' ? siteConfig.tagline.hi : siteConfig.tagline.en}
              </p>
            </div>
          </Link>
        </div>

        {/* Scrollable Middle Navigation Section (scrolls only if viewport height requires) */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-3 min-h-0">
          {/* Main Navigation Heading: Centered & clean */}
          <div className="flex items-center justify-center gap-2 pb-1 pt-1 px-2">
            <div className="h-px bg-olive-800/80 flex-1" />
            <span className="text-xs font-bold text-olive-300 uppercase tracking-wider font-sans">
              {lang === 'hi' ? 'मुख्य नेविगेशन' : 'Main Navigation'}
            </span>
            <div className="h-px bg-olive-800/80 flex-1" />
          </div>

          {/* Dynamic Nav Items from siteConfig (Section 5 & Item B & Item C) */}
          <nav className="space-y-1.5" aria-label="Main menu">
            {siteConfig.navItems.map((item) => {
              const Icon = iconMap[item.iconName];
              const isActive = item.route === '/practice'
                ? pathname.startsWith('/practice')
                : item.route === '/wat'
                ? pathname.startsWith('/wat')
                : pathname === item.route;
              const count = item.id === 'history' ? attemptCount : undefined;
              const label = lang === 'hi' ? item.labelHi : item.labelEn;
              const subLabel = lang === 'hi' ? item.subLabelHi : item.subLabelEn;

              return (
                <NavItem
                  key={item.id}
                  href={item.route}
                  isActive={isActive}
                  isPrimary={item.isPrimary}
                  label={label}
                  subLabel={subLabel}
                  icon={Icon}
                  count={count}
                />
              );
            })}
          </nav>

          {/* Daily Usage Quota Box: Two lines for PPDT and WAT (Section 5) */}
          <div className="p-3 rounded-2xl bg-[#0f160e] border border-olive-800/80 text-xs space-y-2.5 font-sans mt-3">
            <div className="flex items-center justify-between text-xs font-medium pb-1 border-b border-olive-900/60">
              <span className="text-[#a8baa3] flex items-center gap-1.5 font-semibold">
                <Flame className="w-4 h-4 text-amber-500" />
                {lang === 'hi' ? 'आज का अभ्यास' : "Today's Practice"}
              </span>
              <span className="text-[11px] text-[#81967c]">
                {lang === 'hi' ? 'दैनिक कोटा' : 'Daily Quotas'}
              </span>
            </div>

            {/* PPDT Line */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-gray-300 font-medium">PPDT</span>
                <span className="font-bold text-white font-mono">
                  {dailyUsage.count} / {dailyUsage.limit}
                </span>
              </div>
              <div className="w-full bg-[#182317] h-2 rounded-full overflow-hidden border border-olive-700/70 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-olive-500 to-camo-gold transition-all duration-300"
                  style={{ width: `${Math.min(100, (dailyUsage.count / dailyUsage.limit) * 100)}%` }}
                />
              </div>
            </div>

            {/* WAT Line */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[12px]">
                <span className="text-gray-300 font-medium">WAT</span>
                <span className="font-bold text-white font-mono">
                  {watUsage.count} / {watUsage.limit}
                </span>
              </div>
              <div className="w-full bg-[#182317] h-2 rounded-full overflow-hidden border border-olive-700/70 p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-camo-gold to-amber-500 transition-all duration-300"
                  style={{ width: `${Math.min(100, (watUsage.count / watUsage.limit) * 100)}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-[#81967c] pt-0.5">
              {lang === 'hi' ? 'प्रतिदिन आधी रात को रीसेट होता है।' : 'Resets daily at midnight.'}
            </p>
          </div>
        </div>

        {/* Pinned Bottom Area (Item D & E: User block with pencil icon, uncramped footer) */}
        <div className="shrink-0 p-3 border-t border-olive-800/70 bg-[#070c06] space-y-2 font-sans">
          {/* User Block (Item D: Pencil icon button prevents truncation) */}
          <div className="flex items-center justify-between gap-2 p-1">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-olive-900/80 border border-olive-700/60 flex items-center justify-center text-camo-gold shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate" title={guest ? guest.name : 'Guest Cadet'}>
                  {guest ? guest.name : (lang === 'hi' ? 'अतिथि कैडेट' : 'Guest Cadet')}
                </div>
                <div className="text-[12px] text-[#a8baa3] truncate">
                  {lang === 'hi' ? 'अभ्यास मोड सक्रिय' : 'Practice mode active'}
                </div>
              </div>
            </div>

            {/* Pencil Icon Button with Tooltip (Item D) */}
            <button
              onClick={() => setShowGuestModal(true)}
              className="p-1.5 rounded-lg border border-olive-700/80 bg-olive-900/70 hover:bg-olive-800 text-olive-300 hover:text-white transition-colors shrink-0"
              title={lang === 'hi' ? 'उम्मीदवार का नाम बदलें' : 'Change candidate name'}
              aria-label={lang === 'hi' ? 'नाम बदलें' : 'Change Name'}
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Footer: Privacy Note on its own line (Item E) */}
          <div className="flex items-center gap-1.5 px-1 pt-1 text-[12px] text-[#a8baa3]">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate" title={lang === 'hi' ? 'आपकी हस्तलिखित तस्वीरें वेनेहा द्वारा सहेजी नहीं जाती हैं' : 'Handwriting photos are not saved by Veneha'}>
              {lang === 'hi' ? 'हस्तलिखित फ़ोटो सहेजे नहीं जाते' : 'Handwriting photos are not saved by Veneha'}
            </span>
          </div>

          {/* Footer: API Key Configuration on its own row (Item E) */}
          <div className="flex items-center justify-between px-1 text-[11px] text-olive-400 pt-0.5">
            <span className="text-[#81967c] text-[11px]">
              {lang === 'hi' ? 'गोपनीयता सुरक्षित' : 'Privacy secured'}
            </span>
            <button
              onClick={() => setShowSettingsModal(true)}
              className="text-olive-300 hover:text-white underline transition-colors"
              title="API Key Configuration"
            >
              {lang === 'hi' ? 'API कुंजी' : 'API Key'}
            </button>
          </div>
        </div>
      </aside>

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

      {/* Settings Modal */}
      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}
    </>
  );
}
