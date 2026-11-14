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
  History,
  LogIn,
  LogOut,
  FileText,
  Sun,
  Moon
} from 'lucide-react';
import { getGuest, getDailyUsage, GuestProfile, DailyUsage } from '@/lib/guestStorage';
import { getWatDailyUsage, WatDailyUsage, WAT_DAILY_LIMIT } from '@/lib/watStorage';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { siteConfig } from '@/config/siteConfig';
import Avatar from '@/components/ui/Avatar';
import { formatTargetExamDisplay } from '@/data/targetExams';
import GuestModal from './GuestModal';
import SettingsModal from './SettingsModal';

export default function TopNavigation() {
  const pathname = usePathname();
  const { lang, setLang } = useLanguage();
  const { user, guest: authGuest, isUser, isGuest, signOut, updateDisplayName } = useAuth();

  const [guest, setGuest] = useState<GuestProfile | null>(null);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage>({ date: '', count: 0, limit: 5 });
  const [watUsage, setWatUsage] = useState<WatDailyUsage>({ date: '', count: 0, limit: WAT_DAILY_LIMIT });
  const [isLoading, setIsLoading] = useState(true);

  const [showUsageDropdown, setShowUsageDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileProgressOpen, setMobileProgressOpen] = useState(true);

  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  // Sync theme with document & localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('veneha-theme');
      const current = document.documentElement.getAttribute('data-theme');
      if (saved === 'dark' || saved === 'light') {
        setTheme(saved);
      } else if (current === 'dark' || current === 'light') {
        setTheme(current);
      }
    } catch {}

    const handleThemeChange = () => {
      try {
        const saved = localStorage.getItem('veneha-theme');
        const current = document.documentElement.getAttribute('data-theme');
        if (saved === 'dark' || saved === 'light') {
          setTheme(saved);
        } else if (current === 'dark' || current === 'light') {
          setTheme(current);
        }
      } catch {}
    };

    window.addEventListener('storage', handleThemeChange);
    window.addEventListener('theme-change', handleThemeChange);
    return () => {
      window.removeEventListener('storage', handleThemeChange);
      window.removeEventListener('theme-change', handleThemeChange);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem('veneha-theme', nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
      window.dispatchEvent(new Event('theme-change'));
    } catch {}
  };

  const usageRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Sync state from storage
  const refreshData = () => {
    try {
      setGuest(getGuest());
      const pUsage = getDailyUsage();
      const wUsage = getWatDailyUsage();
      if (pUsage) setDailyUsage(pUsage);
      if (wUsage) setWatUsage(wUsage);
    } catch (e) {
      console.error('Failed to load usage data:', e);
    }
  };

  useEffect(() => {
    refreshData();
    setIsLoading(false);

    // Refresh on custom usage-updated event, storage, or focus (with a relaxed 30s background fallback)
    const interval = setInterval(refreshData, 30000);
    const handleFocus = () => refreshData();
    const handleStorage = () => refreshData();
    const handleUsageUpdated = () => refreshData();

    window.addEventListener('focus', handleFocus);
    window.addEventListener('storage', handleStorage);
    window.addEventListener('usage-updated', handleUsageUpdated);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('usage-updated', handleUsageUpdated);
    };
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

  // Keyboard accessibility: Escape closes dropdown and returns focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showUsageDropdown) {
          setShowUsageDropdown(false);
          triggerRef.current?.focus();
        }
        if (showProfileDropdown) {
          setShowProfileDropdown(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showUsageDropdown, showProfileDropdown]);

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

  // Dynamic rows for every field that has a daily limit
  const usageRows = [
    {
      id: 'ppdt',
      label: lang === 'hi' ? 'PPDT अभ्यास' : 'PPDT practice',
      count: dailyUsage?.count ?? 0,
      limit: dailyUsage?.limit ?? 5,
      isValid: typeof dailyUsage?.count === 'number' && typeof dailyUsage?.limit === 'number',
      ariaLabel: lang === 'hi' ? 'PPDT प्रयास उपयोग' : 'PPDT attempts used',
    },
    {
      id: 'wat',
      label: lang === 'hi' ? 'WAT अभ्यास' : 'WAT practice',
      count: watUsage?.count ?? 0,
      limit: watUsage?.limit ?? WAT_DAILY_LIMIT,
      isValid: typeof watUsage?.count === 'number' && typeof watUsage?.limit === 'number',
      ariaLabel: lang === 'hi' ? 'WAT प्रयास उपयोग' : 'WAT attempts used',
    },
  ];

  const chipAccessibleLabel = lang === 'hi'
    ? `आज की प्रगति, PPDT ${dailyUsage.count} में से ${dailyUsage.limit}, WAT ${watUsage.count} में से ${watUsage.limit}`
    : `Today Progress, PPDT ${dailyUsage.count} of ${dailyUsage.limit}, WAT ${watUsage.count} of ${watUsage.limit}`;

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
      <header className="sticky top-0 z-40 w-full h-[64px] bg-canvas border-b border-hairline px-4 sm:px-6 lg:px-6 xl:px-8 flex items-center justify-between">
        {/* Left: Veneha Logo + Navigation Links */}
        <div className="flex items-center space-x-3 xl:space-x-6 min-w-0">
          <Link href="/" className="flex items-center space-x-2.5 group shrink-0">
            {/* Purple rounded square (8px radius) with white shield icon */}
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-white shadow-sm group-hover:bg-primary-pressed transition-colors">
              <Shield className="w-4 h-4 fill-white" />
            </div>
            <span className="font-sans font-semibold text-[20px] text-ink tracking-tight">
              Veneha
            </span>
          </Link>

          {/* Center / Left-aligned Desktop Links (>= 1024px) */}
          <nav className="hidden lg:flex items-center space-x-0.5 xl:space-x-1 pl-1 xl:pl-4" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`h-[64px] inline-flex items-center px-2.5 xl:px-3.5 text-[14px] font-medium transition-colors border-b-2 -mb-[1px] select-none whitespace-nowrap ${
                  link.isActive
                    ? 'text-ink border-ink font-semibold dark:text-white dark:border-primary'
                    : 'text-steel border-transparent hover:text-ink hover:border-hairline-strong dark:text-slate dark:hover:text-white'
                }`}
              >
                {lang === 'hi' ? link.labelHi : link.labelEn}
              </Link>
            ))}
          </nav>
        </div>

        {/* Right Controls: Desktop (>= 1024px) */}
        <div className="hidden lg:flex items-center space-x-2 xl:space-x-3 shrink-0">
          {/* Usage Chip & Dropdown */}
          <div className="relative" ref={usageRef}>
            <button
              ref={triggerRef}
              id="today-progress-trigger"
              type="button"
              onClick={() => {
                setShowUsageDropdown((prev) => !prev);
                setShowProfileDropdown(false);
              }}
              aria-expanded={showUsageDropdown}
              aria-controls="today-progress-dropdown"
              aria-haspopup="true"
              aria-label={chipAccessibleLabel}
              className="inline-flex items-center gap-2 h-10 px-3 py-2 rounded-md border border-hairline bg-surface hover:bg-surface-soft text-[14px] font-medium text-ink transition-colors cursor-pointer select-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
            >
              <Flame className="w-4 h-4 text-brand-orange shrink-0" />
              <span className="whitespace-nowrap">
                {lang === 'hi' ? siteConfig.nav.todayProgress.hi : siteConfig.nav.todayProgress.en}
              </span>
              <ChevronDown 
                className={`w-3.5 h-3.5 text-steel transition-transform duration-150 motion-reduce:transition-none shrink-0 ${
                  showUsageDropdown ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {/* Dropdown Panel (White, 12px radius, 1px hairline border, shadow level 4, ~280px wide) */}
            {showUsageDropdown && (
              <div 
                id="today-progress-dropdown"
                role="region"
                aria-labelledby="today-progress-trigger"
                className="absolute right-0 mt-2 w-[280px] max-w-[calc(100vw-32px)] bg-canvas rounded-lg p-4 shadow-level4 border border-hairline space-y-3.5 z-50 text-ink animate-fade-in"
              >
                <div className="flex items-center justify-between pb-2 border-b border-hairline">
                  <span className="font-semibold text-[14px] text-ink flex items-center gap-1.5">
                    <Flame className="w-4 h-4 text-brand-orange shrink-0" />
                    {lang === 'hi' ? siteConfig.nav.todayProgress.hi : siteConfig.nav.todayProgress.en}
                  </span>
                  <span className="text-[12px] text-steel">
                    {lang === 'hi' ? 'दैनिक कोटा' : 'Daily Quotas'}
                  </span>
                </div>

                {/* One row for every field that has a daily limit */}
                <div className="space-y-3">
                  {usageRows.map((row) => {
                    const used = row.count;
                    const limit = row.limit;
                    const left = Math.max(0, limit - used);
                    const isLimitReached = used >= limit;
                    const progressPercent = limit > 0 ? Math.min(100, Math.max(0, (used / limit) * 100)) : 0;

                    return (
                      <div key={row.id} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[14px] font-medium text-ink truncate">
                            {row.label}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0 text-right">
                            {isLimitReached ? (
                              <span className="text-[12px] font-semibold text-semantic-warning">
                                {lang === 'hi' ? siteConfig.nav.limitReached.hi : siteConfig.nav.limitReached.en}
                              </span>
                            ) : (
                              <span className="text-[12px] text-slate">
                                {isLoading ? '' : `${left} ${lang === 'hi' ? siteConfig.nav.left.hi : siteConfig.nav.left.en}`}
                              </span>
                            )}
                            <span className="text-[13px] font-semibold text-ink">
                              {isLoading || !row.isValid ? '-- / --' : `${used} / ${limit}`}
                            </span>
                          </div>
                        </div>

                        {/* Thin progress bar: 6px high, hairline track, primary purple fill or orange warning on limit */}
                        <div
                          className="w-full bg-hairline h-[6px] rounded-full overflow-hidden"
                          role="progressbar"
                          aria-valuenow={isLoading || !row.isValid ? 0 : used}
                          aria-valuemin={0}
                          aria-valuemax={isLoading || !row.isValid ? 100 : limit}
                          aria-label={row.ariaLabel}
                        >
                          {isLoading ? (
                            <div className="h-full bg-hairline-strong animate-pulse rounded-full w-1/3" />
                          ) : (
                            <div
                              className={`h-full rounded-full transition-all duration-300 motion-reduce:transition-none ${
                                isLimitReached ? 'bg-semantic-warning' : 'bg-primary'
                              }`}
                              style={{ width: `${progressPercent}%` }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reset note at the bottom */}
                <p className="text-[13px] text-slate pt-2 border-t border-hairline">
                  {lang === 'hi' ? siteConfig.nav.resetsMidnight.hi : siteConfig.nav.resetsMidnight.en}
                </p>
              </div>
            )}
          </div>

          {/* Language Toggle (Two pill tabs, active one high-contrast) */}
          <div className="inline-flex items-center rounded-full border border-hairline bg-surface p-0.5">
            <button
              type="button"
              onClick={() => setLang('en')}
              className={`px-3 py-1 text-[13px] font-semibold rounded-full transition-all cursor-pointer ${
                lang === 'en'
                  ? 'bg-[#18181b] text-white shadow-sm dark:bg-primary dark:text-white'
                  : 'text-steel hover:text-ink bg-transparent dark:text-slate dark:hover:text-white'
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
                  ? 'bg-[#18181b] text-white shadow-sm dark:bg-primary dark:text-white'
                  : 'text-steel hover:text-ink bg-transparent dark:text-slate dark:hover:text-white'
              }`}
              aria-label="हिंदी"
            >
              हिं
            </button>
          </div>

          {/* Profile Menu Dropdown */}
          <div className="relative" ref={profileRef}>
            {(() => {
              const displayName = isUser && user ? user.displayName : guest ? guest.name : 'Cadet';
              const targetExamLabel = isUser && user?.targetExam ? formatTargetExamDisplay(user.targetExam, user.targetExamOther) : null;

              return (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setShowProfileDropdown((prev) => !prev);
                      setShowUsageDropdown(false);
                    }}
                    className="inline-flex items-center gap-2 h-10 px-2.5 py-1.5 rounded-md border border-hairline hover:bg-surface text-[14px] font-medium text-ink transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                    aria-expanded={showProfileDropdown}
                    aria-label="Cadet profile options"
                  >
                    <Avatar
                      size={32}
                      name={displayName}
                      userId={isUser && user ? user.id : guest?.id}
                      avatarVersion={user?.avatarVersion}
                      hasPhoto={user?.hasPhoto}
                    />
                    <span className="max-w-[120px] truncate">
                      {displayName}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-steel transition-transform shrink-0 ${showProfileDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-72 bg-canvas rounded-lg p-4 shadow-level4 border border-hairline space-y-3 z-50 text-ink animate-fade-in">
                      {/* Dropdown Header: Avatar 44px + Name + Target Exam / Practice mode active */}
                      <div className="pb-3 border-b border-hairline">
                        <Link
                          href="/profile"
                          onClick={() => setShowProfileDropdown(false)}
                          className="flex items-center gap-3 p-1.5 -m-1.5 rounded-md hover:bg-surface transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          aria-label={`Open your profile, ${displayName}`}
                        >
                          <Avatar
                            size={44}
                            name={displayName}
                            userId={isUser && user ? user.id : guest?.id}
                            avatarVersion={user?.avatarVersion}
                            hasPhoto={user?.hasPhoto}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-[16px] text-ink truncate group-hover:underline">
                              {displayName}
                            </div>
                            {isUser ? (
                              targetExamLabel ? (
                                <div className="text-[13px] text-steel truncate mt-0.5">
                                  {targetExamLabel}
                                </div>
                              ) : (
                                <span className="text-[13px] text-link-blue hover:underline block truncate mt-0.5">
                                  Add your target exam
                                </span>
                              )
                            ) : (
                              <div className="inline-flex items-center gap-1.5 mt-0.5 px-2 py-0.5 rounded-sm bg-card-tint-mint text-brand-green text-[12px] font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                                Practice mode active
                              </div>
                            )}
                          </div>
                        </Link>
                      </div>

                      {/* Dark Mode Toggle Option */}
                      <div className="pb-1 border-b border-hairline">
                        <button
                          type="button"
                          onClick={toggleTheme}
                          className="w-full flex items-center justify-between px-2.5 py-2 text-[14px] text-charcoal hover:bg-surface hover:text-ink rounded-md transition-colors cursor-pointer text-left group"
                          role="switch"
                          aria-checked={theme === 'dark'}
                          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                          <div className="flex items-center gap-2">
                            {theme === 'dark' ? (
                              <Moon className="w-4 h-4 text-brand-purple-300" />
                            ) : (
                              <Sun className="w-4 h-4 text-brand-yellow" />
                            )}
                            <span className="font-medium text-ink">
                              {lang === 'hi' ? siteConfig.auth.profileMenu.darkMode.hi : siteConfig.auth.profileMenu.darkMode.en}
                            </span>
                          </div>

                          {/* Smooth Pill Switch */}
                          <div
                            className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out flex items-center ${
                              theme === 'dark' ? 'bg-primary justify-end' : 'bg-hairline-strong justify-start'
                            }`}
                          >
                            <div className="w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200" />
                          </div>
                        </button>
                      </div>

                      <div className="space-y-1">
                        {isUser ? (
                          <Link
                            href="/profile"
                            onClick={() => setShowProfileDropdown(false)}
                            className="w-full flex items-center gap-2 px-2.5 py-2 text-[14px] text-charcoal hover:bg-surface hover:text-ink rounded-md transition-colors cursor-pointer text-left group"
                          >
                            <User className="w-4 h-4 text-steel group-hover:text-ink transition-colors" />
                            <span>Edit profile</span>
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setShowProfileDropdown(false);
                              setShowGuestModal(true);
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-2 text-[14px] text-charcoal hover:bg-surface hover:text-ink rounded-md transition-colors cursor-pointer text-left group"
                          >
                            <Pencil className="w-4 h-4 text-steel group-hover:text-ink transition-colors" />
                            <span>Change callsign / name</span>
                          </button>
                        )}

                        {!isUser && (
                          <Link
                            href="/sign-in"
                            onClick={() => setShowProfileDropdown(false)}
                            className="w-full flex items-center gap-2 px-2.5 py-2 text-[14px] text-primary hover:bg-surface rounded-md transition-colors cursor-pointer text-left font-medium group"
                          >
                            <LogIn className="w-4 h-4 text-primary group-hover:text-primary-pressed transition-colors" />
                            <span>
                              {lang === 'hi' ? siteConfig.auth.profileMenu.signInOrCreate.hi : siteConfig.auth.profileMenu.signInOrCreate.en}
                            </span>
                          </Link>
                        )}

                        <Link
                          href="/history"
                          onClick={() => setShowProfileDropdown(false)}
                          className="w-full flex items-center gap-2 px-2.5 py-2 text-[14px] text-charcoal hover:bg-surface hover:text-ink rounded-md transition-colors cursor-pointer text-left group"
                        >
                          <History className="w-4 h-4 text-steel group-hover:text-ink transition-colors" />
                          <span>Past Attempts</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setShowProfileDropdown(false);
                            setShowSettingsModal(true);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-2 text-[14px] text-charcoal hover:bg-surface hover:text-ink rounded-md transition-colors cursor-pointer text-left group"
                        >
                          <Settings className="w-4 h-4 text-steel group-hover:text-ink transition-colors" />
                          <span>API Key Settings</span>
                        </button>

                        <Link
                          href="/privacy"
                          onClick={() => setShowProfileDropdown(false)}
                          className="w-full flex items-center gap-2 px-2.5 py-2 text-[14px] text-charcoal hover:bg-surface hover:text-ink rounded-md transition-colors cursor-pointer text-left group"
                        >
                          <FileText className="w-4 h-4 text-steel group-hover:text-ink transition-colors" />
                          <span>Privacy Note</span>
                        </Link>

                        {isUser && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowProfileDropdown(false);
                              signOut();
                            }}
                            className="w-full flex items-center gap-2 px-2.5 py-2 text-[14px] text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-md transition-colors cursor-pointer text-left pt-2 border-t border-hairline mt-1"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>
                              {lang === 'hi' ? siteConfig.auth.profileMenu.signOut.hi : siteConfig.auth.profileMenu.signOut.en}
                            </span>
                          </button>
                        )}
                      </div>

                      {/* Privacy Line */}
                      <div className="pt-2 border-t border-hairline flex items-center gap-1.5 text-[12px] text-slate">
                        <Lock className="w-3.5 h-3.5 text-semantic-success shrink-0" />
                        <span>Handwriting photos are not saved by Veneha</span>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
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
                  className={`py-3 px-4 rounded-md text-[16px] font-medium transition-colors whitespace-nowrap ${
                    link.isActive
                      ? 'bg-surface text-ink font-semibold border-l-4 border-primary'
                      : 'text-charcoal hover:bg-surface-soft hover:text-ink'
                  }`}
                >
                  {lang === 'hi' ? link.labelHi : link.labelEn}
                </Link>
              ))}
            </nav>

            {/* Mobile Expandable Progress Row in Drawer */}
            <div className="rounded-lg bg-surface border border-hairline overflow-hidden">
              <button
                type="button"
                onClick={() => setMobileProgressOpen((prev) => !prev)}
                className="w-full flex items-center justify-between p-4 text-[14px] font-semibold text-ink cursor-pointer hover:bg-surface-soft transition-colors select-none"
                aria-expanded={mobileProgressOpen}
                aria-label={lang === 'hi' ? siteConfig.nav.todayProgress.hi : siteConfig.nav.todayProgress.en}
              >
                <span className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-brand-orange shrink-0" />
                  <span className="whitespace-nowrap">
                    {lang === 'hi' ? siteConfig.nav.todayProgress.hi : siteConfig.nav.todayProgress.en}
                  </span>
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-steel transition-transform duration-150 motion-reduce:transition-none ${
                    mobileProgressOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {mobileProgressOpen && (
                <div className="px-4 pb-4 pt-1 space-y-3 border-t border-hairline">
                  {usageRows.map((row) => {
                    const used = row.count;
                    const limit = row.limit;
                    const left = Math.max(0, limit - used);
                    const isLimitReached = used >= limit;
                    const progressPercent = limit > 0 ? Math.min(100, Math.max(0, (used / limit) * 100)) : 0;

                    return (
                      <div key={row.id} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[14px] font-medium text-charcoal">{row.label}</span>
                          <div className="flex items-center gap-1.5 shrink-0 text-right">
                            {isLimitReached ? (
                              <span className="text-[12px] font-semibold text-semantic-warning">
                                {lang === 'hi' ? siteConfig.nav.limitReached.hi : siteConfig.nav.limitReached.en}
                              </span>
                            ) : (
                              <span className="text-[12px] text-slate">
                                {isLoading ? '' : `${left} ${lang === 'hi' ? siteConfig.nav.left.hi : siteConfig.nav.left.en}`}
                              </span>
                            )}
                            <span className="text-[13px] font-semibold text-ink">
                              {isLoading || !row.isValid ? '-- / --' : `${used} / ${limit}`}
                            </span>
                          </div>
                        </div>

                        {/* Thin 6px progress bar */}
                        <div
                          className="w-full bg-hairline h-[6px] rounded-full overflow-hidden"
                          role="progressbar"
                          aria-valuenow={isLoading || !row.isValid ? 0 : used}
                          aria-valuemin={0}
                          aria-valuemax={isLoading || !row.isValid ? 100 : limit}
                          aria-label={row.ariaLabel}
                        >
                          {isLoading ? (
                            <div className="h-full bg-hairline-strong animate-pulse rounded-full w-1/3" />
                          ) : (
                            <div
                              className={`h-full rounded-full transition-all duration-300 motion-reduce:transition-none ${
                                isLimitReached ? 'bg-semantic-warning' : 'bg-primary'
                              }`}
                              style={{ width: `${progressPercent}%` }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}

                  <p className="text-[12px] text-steel pt-2 border-t border-hairline">
                    {lang === 'hi' ? siteConfig.nav.resetsMidnight.hi : siteConfig.nav.resetsMidnight.en}
                  </p>
                </div>
              )}
            </div>

            {/* Profile & Settings section in Drawer */}
            <div className="pt-2 border-t border-hairline space-y-3">
              <div className="flex items-center justify-between gap-3">
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity"
                >
                  <Avatar
                    size={32}
                    name={isUser && user ? user.displayName : guest ? guest.name : 'Cadet'}
                    userId={isUser && user ? user.id : guest?.id}
                    avatarVersion={user?.avatarVersion}
                    hasPhoto={user?.hasPhoto}
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-[14px] text-ink truncate">
                      {isUser && user ? user.displayName : guest ? guest.name : 'Cadet'}
                    </div>
                    <div className="text-[11px] text-slate truncate">
                      {isUser
                        ? (user?.targetExam ? formatTargetExamDisplay(user.targetExam, user.targetExamOther) : 'Add target exam')
                        : 'Practice mode active'}
                    </div>
                  </div>
                </Link>

                <div className="flex items-center gap-2 shrink-0">
                  {isUser ? (
                    <>
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-2.5 py-1.5 rounded-md border border-hairline bg-canvas text-[12px] font-medium text-charcoal hover:bg-surface"
                      >
                        Edit Profile
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          signOut();
                        }}
                        className="px-2.5 py-1.5 rounded-md border border-rose-200 bg-rose-50 text-[12px] font-medium text-rose-600 hover:bg-rose-100"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setShowGuestModal(true);
                        }}
                        className="px-2.5 py-1.5 rounded-md border border-hairline bg-canvas text-[12px] font-medium text-charcoal hover:bg-surface"
                      >
                        Change Name
                      </button>
                      <Link
                        href="/sign-in"
                        onClick={() => setMobileMenuOpen(false)}
                        className="px-2.5 py-1.5 rounded-md bg-primary text-[12px] font-medium text-white hover:bg-primary-pressed"
                      >
                        Sign In
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* Dark Mode in Drawer */}
              <div className="flex items-center justify-between py-1 px-1 border-t border-hairline">
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? (
                    <Moon className="w-4 h-4 text-brand-purple-300" />
                  ) : (
                    <Sun className="w-4 h-4 text-brand-yellow" />
                  )}
                  <span className="text-[14px] font-medium text-ink">
                    {lang === 'hi' ? siteConfig.auth.profileMenu.darkMode.hi : siteConfig.auth.profileMenu.darkMode.en}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  role="switch"
                  aria-checked={theme === 'dark'}
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 ease-in-out flex items-center cursor-pointer ${
                    theme === 'dark' ? 'bg-primary justify-end' : 'bg-hairline-strong justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200" />
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

                <Link
                  href="/privacy"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-1.5 text-[12px] text-slate hover:text-ink"
                >
                  <Lock className="w-3.5 h-3.5 text-semantic-success" />
                  <span>Privacy Note</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guest Name Modal */}
      {showGuestModal && (
        <GuestModal
          currentGuest={isUser && user ? { id: user.id, name: user.displayName, createdAt: user.createdAt } : guest}
          onClose={() => setShowGuestModal(false)}
          onSaved={(newProfile) => {
            if (isUser) {
              updateDisplayName(newProfile.name);
            } else {
              setGuest(newProfile);
            }
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
