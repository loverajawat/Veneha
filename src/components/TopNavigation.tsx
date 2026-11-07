'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Shield, 
  Menu, 
  X, 
  User, 
  Pencil, 
  Lock, 
  Flame, 
  ChevronDown, 
  Settings,
  History
} from 'lucide-react';
import { getGuest, getDailyUsage, GuestProfile, DailyUsage } from '@/lib/guestStorage';
import { getWatDailyUsage, WatDailyUsage, WAT_DAILY_LIMIT } from '@/lib/watStorage';
import { useLanguage } from '@/context/LanguageContext';
import { siteConfig } from '@/config/siteConfig';
import GuestModal from './GuestModal';
import SettingsModal from './SettingsModal';

export default function TopNavigation() {
  const pathname = usePathname();
  const { lang, setLang } = useLanguage();

  const [guest, setGuest] = useState<GuestProfile | null>(null);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage>({ date: '', count: 0, limit: 5 });
  const [watUsage, setWatUsage] = useState<WatDailyUsage>({ date: '', count: 0, limit: WAT_DAILY_LIMIT });

  const [showUsageDropdown, setShowUsageDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const usageRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Sync state
  const refreshData = () => {
    setGuest(getGuest());
    setDailyUsage(getDailyUsage());
    setWatUsage(getWatDailyUsage());
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 3000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (usageRef.current && !usageRef.current.contains(e.target as Node)) {
        setShowUsageDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowUsageDropdown(false);
    setShowProfileDropdown(false);
  }, [pathname]);

  const navLinks = [
    {
      href: '/',
      labelEn: 'Home',
      labelHi: 'होम',
      isActive: pathname === '/',
    },
    {
      href: '/guide',
      labelEn: '5-Day SSB Guide',
      labelHi: '5-दिवसीय गाइड',
      isActive: pathname === '/guide',
    },
    {
      href: '/practice',
      labelEn: 'PPDT Practice',
      labelHi: 'PPDT अभ्यास',
      isActive: pathname.startsWith('/practice'),
    },
    {
      href: '/wat',
      labelEn: 'WAT Practice',
      labelHi: 'WAT अभ्यास',
      isActive: pathname.startsWith('/wat'),
    },
    {
      href: '/history',
      labelEn: 'Past Attempts',
      labelHi: 'पिछले प्रयास',
      isActive: pathname === '/history',
    },
  ];

  return (
    <>
      {/* 1. Optional Promo Banner (off by default) */}
      {siteConfig.promoBanner?.enabled && (
        <div className="bg-surface text-ink text-[14px] font-medium py-2.5 px-4 text-center border-b border-hairline flex items-center justify-center gap-2">
          <span>{lang === 'hi' ? siteConfig.promoBanner.textHi : siteConfig.promoBanner.textEn}</span>
          {siteConfig.promoBanner.link && (
            <Link href={siteConfig.promoBanner.link} className="text-link-blue hover:underline font-semibold">
              {lang === 'hi' ? 'अधिक जानें →' : 'Learn more →'}
            </Link>
          )}
        </div>
      )}

      {/* 2. Sticky Top Navigation Bar (White, ~64px, 1px hairline bottom border) */}
      <header className="sticky top-0 z-40 w-full h-[64px] bg-canvas border-b border-hairline px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left: Veneha Logo */}
        <div className="flex items-center space-x-6">
          <Link href="/" className="flex items-center space-x-2.5 group">
            {/* Purple rounded square (8px radius) with white shield icon */}
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white shadow-sm group-hover:bg-primary-pressed transition-colors">
              <Shield className="w-4 h-4 fill-white" />
            </div>
            <span className="font-sans font-semibold text-[20px] text-ink tracking-tight">
              Veneha
            </span>
          </Link>

          {/* Center / Left-aligned Desktop Links (>= 1024px) */}
          <nav className="hidden lg:flex items-center space-x-1 pl-4" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`h-[64px] inline-flex items-center px-3.5 text-[14px] font-medium transition-colors border-b-2 -mb-[1px] select-none ${
                  link.isActive
                    ? 'text-ink border-ink font-semibold'
                    : 'text-steel border-transparent hover:text-ink hover:border-hairline-strong'
                }`}
              >
                {lang === 'hi' ? link.labelHi : link.labelEn}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Controls: Desktop (>= 1024px) */}
        <div className="hidden lg:flex items-center space-x-3">
          {/* Usage Chip & Dropdown */}
          <div className="relative" ref={usageRef}>
            <button
              type="button"
              onClick={() => {
                setShowUsageDropdown(!showUsageDropdown);
                setShowProfileDropdown(false);
              }}
              className="inline-flex items-center gap-1.5 h-[36px] px-3 rounded-full border border-hairline bg-surface hover:bg-surface-soft text-[13px] font-medium text-charcoal transition-colors cursor-pointer"
              aria-expanded={showUsageDropdown}
              aria-label="Today's Practice Quota"
            >
              <Flame className="w-3.5 h-3.5 text-brand-orange" />
              <span>
                Today: PPDT {dailyUsage.count}/{dailyUsage.limit}
              </span>
              <span className="text-muted">·</span>
              <span>
                WAT {watUsage.count}/{watUsage.limit}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-steel transition-transform ${showUsageDropdown ? 'rotate-180' : ''}`} />
            </button>

            {/* Usage Dropdown */}
            {showUsageDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-canvas rounded-lg p-4 shadow-level4 border border-hairline space-y-3 z-50 text-ink animate-fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-hairline">
                  <span className="font-semibold text-[14px] text-ink flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-brand-orange" />
                    {lang === 'hi' ? 'आज का अभ्यास' : "Today's Practice"}
                  </span>
                  <span className="text-[12px] text-steel">Daily Quotas</span>
                </div>

                {/* PPDT Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-charcoal font-medium">PPDT Practice</span>
                    <span className="font-semibold text-ink">
                      {dailyUsage.count} / {dailyUsage.limit}
                    </span>
                  </div>
                  <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-hairline">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (dailyUsage.count / dailyUsage.limit) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* WAT Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-charcoal font-medium">WAT Practice</span>
                    <span className="font-semibold text-ink">
                      {watUsage.count} / {watUsage.limit}
                    </span>
                  </div>
                  <div className="w-full bg-surface h-2 rounded-full overflow-hidden border border-hairline">
                    <div
                      className="h-full bg-brand-orange rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(100, (watUsage.count / watUsage.limit) * 100)}%` }}
                    />
                  </div>
                </div>

                <p className="text-[12px] text-steel pt-1 border-t border-hairline">
                  {lang === 'hi' ? 'प्रतिदिन आधी रात को रीसेट होता है।' : 'Resets daily at midnight.'}
                </p>
              </div>
            )}
          </div>

          {/* Language Toggle (Two pill tabs, active one black) */}
          <div className="inline-flex items-center rounded-full border border-hairline bg-surface p-0.5">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-3 py-1 text-[13px] font-semibold rounded-full transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-ink-deep text-on-dark shadow-sm'
                  : 'text-steel hover:text-ink bg-transparent'
              }`}
              aria-label="English"
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang('hi')}
              className={`px-3 py-1 text-[13px] font-semibold rounded-full transition-all cursor-pointer ${
                lang === 'hi'
                  ? 'bg-ink-deep text-on-dark shadow-sm'
                  : 'text-steel hover:text-ink bg-transparent'
              }`}
              aria-label="हिंदी"
            >
              हिं
            </button>
          </div>

          {/* Profile Menu Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => {
                setShowProfileDropdown(!showProfileDropdown);
                setShowUsageDropdown(false);
              }}
              className="inline-flex items-center gap-2 h-[36px] px-3 rounded-md border border-hairline hover:bg-surface text-[14px] font-medium text-ink transition-colors cursor-pointer"
              aria-expanded={showProfileDropdown}
              aria-label="Cadet profile options"
            >
              <div className="w-5 h-5 rounded-full bg-card-tint-lavender text-brand-purple-800 flex items-center justify-center text-xs font-bold">
                {guest ? guest.name.charAt(0).toUpperCase() : 'C'}
              </div>
              <span className="max-w-[120px] truncate">{guest ? guest.name : 'Cadet'}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-steel transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showProfileDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-canvas rounded-lg p-4 shadow-level4 border border-hairline space-y-3 z-50 text-ink animate-fade-in">
                <div className="pb-2 border-b border-hairline">
                  <div className="font-semibold text-[15px] text-ink truncate">
                    {guest ? guest.name : 'Guest Cadet'}
                  </div>
                  <div className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-sm bg-card-tint-mint text-brand-green text-[12px] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                    Practice mode active
                  </div>
                </div>

                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileDropdown(false);
                      setShowGuestModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-[14px] text-charcoal hover:bg-surface hover:text-ink rounded-md transition-colors cursor-pointer text-left"
                  >
                    <Pencil className="w-4 h-4 text-steel" />
                    <span>Change callsign / name</span>
                  </button>

                  <Link
                    href="/history"
                    onClick={() => setShowProfileDropdown(false)}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-[14px] text-charcoal hover:bg-surface hover:text-ink rounded-md transition-colors cursor-pointer text-left"
                  >
                    <History className="w-4 h-4 text-steel" />
                    <span>Past Attempts</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileDropdown(false);
                      setShowSettingsModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-[14px] text-charcoal hover:bg-surface hover:text-ink rounded-md transition-colors cursor-pointer text-left"
                  >
                    <Settings className="w-4 h-4 text-steel" />
                    <span>API Key Settings</span>
                  </button>
                </div>

                {/* Privacy Line */}
                <div className="pt-2 border-t border-hairline flex items-center gap-1.5 text-[12px] text-slate">
                  <Lock className="w-3.5 h-3.5 text-semantic-success shrink-0" />
                  <span>Handwriting deleted after OCR</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile / Tablet Hamburger Button (< 1024px) */}
        <div className="flex lg:hidden items-center space-x-2">
          {/* Quick Language Toggle */}
          <button
            type="button"
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="px-2.5 py-1 text-[13px] font-semibold rounded-full border border-hairline bg-surface text-ink"
            aria-label="Toggle Language"
          >
            {lang === 'en' ? 'हिं' : 'EN'}
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md text-ink hover:bg-surface transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer (Below 1024px) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[64px] bottom-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in flex flex-col justify-start">
          <div className="bg-canvas border-b border-hairline p-6 space-y-6 shadow-level4 max-h-[85vh] overflow-y-auto">
            {/* Navigation Links */}
            <nav className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`py-3 px-4 rounded-md text-[16px] font-medium transition-colors ${
                    link.isActive
                      ? 'bg-surface text-ink font-semibold border-l-4 border-primary'
                      : 'text-charcoal hover:bg-surface-soft hover:text-ink'
                  }`}
                >
                  {lang === 'hi' ? link.labelHi : link.labelEn}
                </Link>
              ))}
            </nav>

            {/* Mobile Usage Box */}
            <div className="p-4 rounded-lg bg-surface border border-hairline space-y-3">
              <div className="flex items-center justify-between text-[14px] font-semibold text-ink">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-brand-orange" />
                  {lang === 'hi' ? 'आज का अभ्यास' : "Today's Practice"}
                </span>
                <span className="text-[12px] text-steel">Midnight Reset</span>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[13px] text-charcoal">
                  <span>PPDT:</span>
                  <span className="font-semibold text-ink">{dailyUsage.count} / {dailyUsage.limit}</span>
                </div>
                <div className="w-full bg-canvas h-2 rounded-full overflow-hidden border border-hairline">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.min(100, (dailyUsage.count / dailyUsage.limit) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[13px] text-charcoal">
                  <span>WAT:</span>
                  <span className="font-semibold text-ink">{watUsage.count} / {watUsage.limit}</span>
                </div>
                <div className="w-full bg-canvas h-2 rounded-full overflow-hidden border border-hairline">
                  <div
                    className="h-full bg-brand-orange rounded-full"
                    style={{ width: `${Math.min(100, (watUsage.count / watUsage.limit) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Profile & Settings section in Drawer */}
            <div className="pt-2 border-t border-hairline space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-[15px] text-ink">{guest ? guest.name : 'Cadet'}</div>
                  <div className="text-[12px] text-slate">Practice mode active</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowGuestModal(true);
                  }}
                  className="px-3 py-1.5 rounded-md border border-hairline bg-canvas text-[13px] font-medium text-charcoal hover:bg-surface"
                >
                  Change Name
                </button>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowSettingsModal(true);
                  }}
                  className="text-[13px] text-link-blue hover:underline"
                >
                  API Key Settings
                </button>

                <div className="flex items-center gap-1.5 text-[12px] text-slate">
                  <Lock className="w-3.5 h-3.5 text-semantic-success" />
                  <span>Photos deleted after OCR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guest Name Modal */}
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
