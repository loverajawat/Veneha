'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Shield, 
  Sun, 
  Moon, 
  Eye, 
  EyeOff, 
  X, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { siteConfig } from '@/config/siteConfig';

interface AuthPortalProps {
  initialOpen?: boolean;
}

export default function AuthPortal({ initialOpen = false }: AuthPortalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get('next') || '/';
  const initialMode = searchParams.get('mode') === 'create' ? 'create' : 'signin';

  const { signIn, signUp, continueAsGuest, allowGuestMode } = useAuth();
  const { lang, setLang } = useLanguage();

  const [isOpen, setIsOpen] = useState(initialOpen);
  const [tab, setTab] = useState<'signin' | 'create'>(initialMode);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [srAnnouncement, setSrAnnouncement] = useState('');

  // Form states (clean empty strings on load, no placeholders or fake dots)
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);

  // Validation & Error states
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Field refs for accessibility focus
  const emailInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const ageCheckboxRef = useRef<HTMLInputElement>(null);

  // Credit line from env (optional)
  const creditLine = process.env.NEXT_PUBLIC_AUTH_CREDIT_LINE || '';

  // Sync open state if route changes
  useEffect(() => {
    setIsOpen(initialOpen);
  }, [initialOpen]);

  // Sync mode from query
  useEffect(() => {
    if (searchParams.get('mode') === 'create') {
      setTab('create');
    } else if (searchParams.get('mode') === 'signin') {
      setTab('signin');
    }
  }, [searchParams]);

  // Restore theme preference from localStorage with key 'veneha-theme'
  useEffect(() => {
    try {
      const saved = localStorage.getItem('veneha-theme');
      const currentAttr = document.documentElement.getAttribute('data-theme');
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved);
        if (currentAttr !== saved) {
          document.documentElement.setAttribute('data-theme', saved);
        }
      } else if (currentAttr === 'light' || currentAttr === 'dark') {
        setTheme(currentAttr);
      } else {
        document.documentElement.setAttribute('data-theme', 'dark');
      }
    } catch {}
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem('veneha-theme', nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
    } catch {}
  };

  // Dynamic Document Title
  useEffect(() => {
    if (isOpen) {
      document.title = tab === 'signin' ? 'Sign in | Veneha' : 'Create account | Veneha';
    } else {
      document.title = 'Veneha | SSB Simulator and AI Assessor';
    }
  }, [isOpen, tab]);

  // Keyboard navigation: Escape key closes portal back to splash
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus management: when portal opens, move focus to Email (or Name)
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (tab === 'create') {
          nameInputRef.current?.focus();
        } else {
          emailInputRef.current?.focus();
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isOpen, tab]);

  const handleOpen = () => {
    setIsOpen(true);
    router.push('/sign-in' + (nextUrl !== '/' ? `?next=${encodeURIComponent(nextUrl)}` : ''));
  };

  const handleClose = () => {
    setIsOpen(false);
    setError('');
    setFieldErrors({});
    router.push('/');
  };

  const handleTabChange = (newTab: 'signin' | 'create') => {
    if (newTab === tab) return;
    setTab(newTab);
    setError('');
    setFieldErrors({});
    setSrAnnouncement(
      newTab === 'signin'
        ? (lang === 'hi' ? 'साइन इन फॉर्म' : 'Sign in form')
        : (lang === 'hi' ? 'खाता बनाएं फॉर्म' : 'Create account form')
    );
  };

  const handleKeyDownTablist = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      handleTabChange(tab === 'signin' ? 'create' : 'signin');
    }
  };

  // Sign In submit
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const cleanEmail = email.trim().toLowerCase();
    const newErrors: Record<string, string> = {};

    if (!cleanEmail) {
      newErrors.email = lang === 'hi' ? 'कृपया अपना ईमेल दर्ज करें।' : 'Please enter your email.';
    }
    if (!password) {
      newErrors.password = lang === 'hi' ? 'कृपया अपना पासवर्ड दर्ज करें।' : 'Please enter your password.';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      if (newErrors.email) {
        emailInputRef.current?.focus();
      } else if (newErrors.password) {
        passwordInputRef.current?.focus();
      }
      return;
    }

    setSubmitting(true);
    const result = await signIn(cleanEmail, password);
    setSubmitting(false);

    if (result.success) {
      router.push(nextUrl);
    } else {
      setError(
        result.error ||
          (lang === 'hi'
            ? 'ईमेल या पासवर्ड गलत है।'
            : 'Email or password is incorrect.')
      );
      passwordInputRef.current?.focus();
    }
  };

  // Create Account submit
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const newErrors: Record<string, string> = {};

    if (!cleanName) {
      newErrors.name = lang === 'hi' ? 'कृपया अपना पूरा नाम दर्ज करें।' : 'Please enter your full name.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      newErrors.email = lang === 'hi' ? 'कृपया एक मान्य ईमेल दर्ज करें।' : 'Please enter a valid email address.';
    }

    if (password.length < 8) {
      newErrors.password = lang === 'hi' ? 'पासवर्ड में कम से कम 8 अक्षर होने चाहिए।' : 'Password must be at least 8 characters.';
    }

    if (!ageConfirmed) {
      newErrors.age = lang === 'hi' ? 'कृपया पुष्टि करें कि आपकी आयु 18 या उससे अधिक है।' : 'Please confirm you are 18 or older.';
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors);
      if (newErrors.name) {
        nameInputRef.current?.focus();
      } else if (newErrors.email) {
        emailInputRef.current?.focus();
      } else if (newErrors.password) {
        passwordInputRef.current?.focus();
      } else if (newErrors.age) {
        ageCheckboxRef.current?.focus();
      }
      return;
    }

    setSubmitting(true);
    const result = await signUp(cleanName, cleanEmail, password, ageConfirmed);
    setSubmitting(false);

    if (result.success) {
      router.push(nextUrl);
    } else {
      setError(
        result.error ||
          (lang === 'hi'
            ? 'खाता बनाने में त्रुटि हुई। कृपया पुनः प्रयास करें।'
            : 'Failed to create account. Please try again.')
      );
    }
  };

  const handleGuestEntry = async () => {
    await continueAsGuest();
    router.push(nextUrl);
  };

  const s = siteConfig.auth;

  return (
    <main 
      className="w-full h-[100dvh] max-h-[100dvh] overflow-hidden select-none relative auth-theme-transition"
      style={{
        backgroundColor: isOpen ? 'var(--auth-bg-left)' : 'var(--auth-bg-splash)',
      }}
      role="main"
    >
      {/* Screen reader live region for tab change announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {srAnnouncement}
      </div>

      {/* ========================================================= */}
      {/* 1. SPLASH VIEW (when portal is closed: /)                */}
      {/* ========================================================= */}
      {!isOpen && (
        <div 
          className="relative w-full h-[100dvh] overflow-hidden flex flex-col justify-between p-5 sm:p-7 md:p-[clamp(24px,3.5vw,48px)] auth-theme-transition"
          style={{
            background: 'var(--auth-bg-splash-radial)',
          }}
        >
          {/* Faint dot grid at ~4% opacity */}
          <div 
            className="absolute inset-0 pointer-events-none select-none"
            style={{
              backgroundImage: 'var(--auth-dot-grid)',
              backgroundSize: '24px 24px',
            }}
            aria-hidden="true"
          />

          {/* Top-Right: Theme Toggle and Sign-in button */}
          <div className="relative z-10 flex items-center justify-end w-full gap-2">
            {/* Theme Toggle Button (44px) */}
            <button
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              className="w-[44px] h-[44px] rounded-lg border border-[var(--auth-control-border)] flex items-center justify-center bg-[var(--auth-control-bg)] hover:bg-[var(--auth-control-hover-bg)] text-[var(--auth-control-text)] transition-all cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-brand-yellow" /> : <Moon className="w-4 h-4 text-slate" />}
            </button>

            {/* Sign in button (44px high, padding 0 20px, 14-15px text, weight 500, hover lifts slightly) */}
            <button
              type="button"
              onClick={handleOpen}
              className="h-[44px] px-5 rounded-lg text-[14px] sm:text-[15px] font-medium transition-all duration-150 cursor-pointer shadow-sm hover:-translate-y-0.5 active:translate-y-0"
              style={{
                backgroundColor: 'var(--auth-splash-btn-bg)',
                color: 'var(--auth-splash-btn-text)',
              }}
              aria-label="Sign in to Veneha"
            >
              {lang === 'hi' ? s.signIn.hi : s.signIn.en}
            </button>
          </div>

          {/* Centre Splash Content (Staggered entry animation) */}
          <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 pointer-events-none select-none">
            {/* Logo Tile: 80 to 96px, 24px radius, soft purple glow, NO dark halo */}
            <div 
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-[24px] bg-primary flex items-center justify-center text-white mb-6 animate-auth-fade-rise-1"
              style={{
                boxShadow: 'var(--auth-logo-glow)',
              }}
            >
              <Shield className="w-10 h-10 sm:w-12 sm:h-12 fill-white" />
            </div>

            {/* Wordmark: clamp(64px, 11vw, 168px), weight 600, letter-spacing -0.035em, white in dark, ink in light */}
            <h1 
              className="font-semibold tracking-[-0.035em] leading-none text-[clamp(64px,11vw,168px)] animate-auth-fade-rise-2"
              style={{
                color: 'var(--auth-text-wordmark)',
              }}
            >
              Veneha
            </h1>

            {/* Tagline: 18 to 20px, secondary text, letter-spacing 0.01em, centred, ~20px below wordmark */}
            <p 
              className="mt-5 text-[18px] sm:text-[20px] font-normal tracking-[0.01em] max-w-xl text-center px-4 leading-relaxed animate-auth-fade-rise-3"
              style={{
                color: 'var(--auth-text-secondary)',
              }}
            >
              {lang === 'hi' ? siteConfig.tagline.hi : siteConfig.tagline.en}
            </p>
          </div>

          {/* Bottom spacer for clean balance */}
          <div className="min-h-[44px]" aria-hidden="true" />
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. SIGN-IN VIEW (when portal is open: /sign-in)           */}
      {/* ========================================================= */}
      {isOpen && (
        <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 relative">
          {/* ========================================================= */}
          {/* LEFT HALF (Brand): Hidden on mobile (<768px), visible md+ */}
          {/* ========================================================= */}
          <section 
            className="hidden md:flex relative h-full flex-col justify-between overflow-hidden p-[clamp(24px,3.5vw,48px)] border-r border-[var(--auth-border-divider)] auth-theme-transition"
            style={{
              backgroundColor: 'var(--auth-bg-left)',
            }}
            aria-label="Veneha Brand Overview"
          >
            {/* Soft radial glow behind the wordmark */}
            <div 
              className="absolute inset-0 pointer-events-none select-none"
              style={{
                background: 'var(--auth-brand-glow)',
              }}
              aria-hidden="true"
            />

            {/* Top-Left: Logo tile (40px) and "Veneha" (22-24px, weight 600) */}
            <div className="relative z-10 flex items-center gap-3 min-h-[44px]">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white shadow-sm shrink-0">
                <Shield className="w-5 h-5 fill-white" />
              </div>
              <span 
                className="text-[22px] sm:text-[24px] font-semibold tracking-tight leading-none"
                style={{ color: 'var(--auth-text-wordmark)' }}
              >
                Veneha
              </span>
            </div>

            {/* Lower-Middle: Wordmark & Tagline positioned with vertical center at ~43% of screen height */}
            <div className="absolute top-[43%] -translate-y-1/2 left-[clamp(24px,3.5vw,48px)] right-[clamp(24px,3.5vw,48px)] pointer-events-none select-none z-10">
              <h1 
                className="font-semibold tracking-[-0.035em] leading-[0.95] text-[clamp(56px,6.7vw,128px)]"
                style={{ color: 'var(--auth-text-wordmark)' }}
              >
                Veneha
              </h1>
              <p 
                className="mt-[14px] text-[clamp(18px,1.6vw,26px)] font-normal leading-[1.45] max-w-[24em] [text-wrap:balance]"
                style={{ color: 'var(--auth-text-secondary)' }}
              >
                {lang === 'hi' ? s.brandTagline.hi : s.brandTagline.en}
              </p>
            </div>

            {/* Bottom-Left: Privacy trust line and optional credit line */}
            <div 
              className="relative z-10 text-[14px] space-y-1"
              style={{ color: 'var(--auth-text-brand-bottom)' }}
            >
              <p>{lang === 'hi' ? s.privacyLine.hi : s.privacyLine.en}</p>
              {creditLine && (
                <p className="text-[12px] opacity-80">{creditLine}</p>
              )}
            </div>
          </section>

          {/* ========================================================= */}
          {/* RIGHT HALF (Form Panel): Full screen on mobile, 50% on md  */}
          {/* ========================================================= */}
          <section
            className="h-full overflow-y-auto overscroll-contain relative z-20 flex flex-col justify-between p-5 sm:p-7 md:p-[clamp(24px,3.5vw,48px)] animate-auth-panel-enter auth-theme-transition"
            style={{
              backgroundColor: 'var(--auth-bg-right)',
            }}
            aria-label="Account Authentication Form"
          >
            {/* Top Bar on Right Panel: Mobile brand logo (mobile only) + Controls */}
            <div className="flex items-center justify-between w-full min-h-[44px] shrink-0">
              {/* Mobile Header Brand (small screens only) */}
              <div className="md:hidden flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white shrink-0 shadow-sm">
                  <Shield className="w-4 h-4 fill-white" />
                </div>
                <span 
                  className="text-[18px] font-semibold tracking-tight"
                  style={{ color: 'var(--auth-text-wordmark)' }}
                >
                  Veneha
                </span>
              </div>

              {/* Top-Right Controls: One tidy row: language toggle (EN | हिं), theme toggle, close (X). Spacing 8px */}
              <div className="flex items-center gap-2 ml-auto">
                {/* Language Toggle: Small pill container, 40px tall, active filled primary with white text */}
                <div 
                  className="h-[40px] inline-flex items-center rounded-lg border p-0.5 text-xs font-semibold"
                  style={{
                    borderColor: 'var(--auth-control-border)',
                    backgroundColor: 'var(--auth-control-bg)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setLang('en')}
                    className={`h-full px-2.5 rounded-md transition-colors cursor-pointer flex items-center justify-center ${
                      lang === 'en'
                        ? 'bg-primary text-white shadow-xs'
                        : 'hover:text-primary'
                    }`}
                    style={{
                      color: lang === 'en' ? '#ffffff' : 'var(--auth-control-text)',
                    }}
                    aria-label="Switch language to English"
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang('hi')}
                    className={`h-full px-2.5 rounded-md transition-colors cursor-pointer flex items-center justify-center ${
                      lang === 'hi'
                        ? 'bg-primary text-white shadow-xs'
                        : 'hover:text-primary'
                    }`}
                    style={{
                      color: lang === 'hi' ? '#ffffff' : 'var(--auth-control-text)',
                    }}
                    aria-label="हिन्दी में बदलें"
                  >
                    हिं
                  </button>
                </div>

                {/* Theme Toggle Button (40px) */}
                <button
                  type="button"
                  onClick={toggleTheme}
                  title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                  aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                  className="w-[40px] h-[40px] rounded-lg flex items-center justify-center transition-colors cursor-pointer hover:bg-[var(--auth-control-hover-bg)]"
                  style={{
                    color: 'var(--auth-control-text)',
                  }}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-brand-yellow" /> : <Moon className="w-4 h-4 text-slate" />}
                </button>

                {/* Close Button: Quiet ghost icon button (no border), 40px, with tooltip "Back" and Escape shortcut */}
                <button
                  type="button"
                  onClick={handleClose}
                  title="Back (Esc)"
                  aria-label="Back to splash"
                  className="w-[40px] h-[40px] rounded-lg flex items-center justify-center transition-colors cursor-pointer hover:bg-[var(--auth-control-hover-bg)]"
                  style={{
                    color: 'var(--auth-control-text)',
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Form Block: width: min(100%, 520px), centred horizontally inside right half with at least 24px side padding, centred vertically under controls */}
            <div className="w-full flex-1 flex flex-col justify-center items-center py-4 sm:py-6">
              <div className="w-full max-w-[520px] px-1 sm:px-6">
                {/* Heading (36-40px, weight 600, full white in dark, ink in light) */}
                <h2 
                  className="text-[34px] sm:text-[38px] font-semibold tracking-tight leading-tight m-0"
                  style={{
                    color: 'var(--auth-text-primary)',
                  }}
                >
                  {tab === 'signin'
                    ? (lang === 'hi' ? s.signInHeading.hi : s.signInHeading.en)
                    : (lang === 'hi' ? s.createHeading.hi : s.createHeading.en)}
                </h2>

                {/* Subtitle (17-18px, on-dark-muted / slate) -> 8px below heading */}
                <p 
                  className="mt-2 text-[17px] sm:text-[18px] font-normal leading-snug"
                  style={{
                    color: 'var(--auth-text-secondary)',
                  }}
                >
                  {tab === 'signin'
                    ? (lang === 'hi' ? s.signInSubtitle.hi : s.signInSubtitle.en)
                    : (lang === 'hi' ? s.createSubtitle.hi : s.createSubtitle.en)}
                </p>

                {/* Segmented Tabs (Sign in | Create account) -> 32px below subtitle */}
                <div
                  role="tablist"
                  aria-label="Authentication Options"
                  onKeyDown={handleKeyDownTablist}
                  className="mt-8 relative w-full h-[48px] sm:h-[52px] rounded-xl p-1 flex items-center border"
                  style={{
                    backgroundColor: 'var(--auth-bg-tabs-track)',
                    borderColor: 'var(--auth-border-tabs-track)',
                  }}
                >
                  {/* Sliding highlight indicator (180ms ease-out) */}
                  <div
                    aria-hidden="true"
                    className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-[10px] pointer-events-none transition-transform duration-[180ms] motion-reduce:transition-none"
                    style={{
                      backgroundColor: 'var(--auth-bg-tab-active)',
                      border: '1px solid var(--auth-border-tab-active)',
                      boxShadow: 'var(--auth-shadow-tab-active)',
                      transform: tab === 'signin' ? 'translateX(0)' : 'translateX(100%)',
                      left: '4px',
                    }}
                  />

                  {/* Sign In Tab Button */}
                  <button
                    type="button"
                    role="tab"
                    id="tab-signin"
                    aria-controls="panel-signin"
                    aria-selected={tab === 'signin'}
                    tabIndex={tab === 'signin' ? 0 : -1}
                    onClick={() => handleTabChange('signin')}
                    className="relative z-10 flex-1 h-full flex items-center justify-center rounded-[10px] text-[14px] sm:text-[15px] font-medium transition-colors duration-150 select-none cursor-pointer px-2 truncate"
                    style={{
                      color: tab === 'signin' 
                        ? 'var(--auth-text-tab-active)' 
                        : 'var(--auth-text-tab-inactive)',
                    }}
                  >
                    {lang === 'hi' ? s.signIn.hi : s.signIn.en}
                  </button>

                  {/* Create Account Tab Button */}
                  <button
                    type="button"
                    role="tab"
                    id="tab-create"
                    aria-controls="panel-create"
                    aria-selected={tab === 'create'}
                    tabIndex={tab === 'create' ? 0 : -1}
                    onClick={() => handleTabChange('create')}
                    className="relative z-10 flex-1 h-full flex items-center justify-center rounded-[10px] text-[14px] sm:text-[15px] font-medium transition-colors duration-150 select-none cursor-pointer px-2 truncate"
                    style={{
                      color: tab === 'create' 
                        ? 'var(--auth-text-tab-active)' 
                        : 'var(--auth-text-tab-inactive)',
                    }}
                  >
                    {lang === 'hi' ? s.createAccount.hi : s.createAccount.en}
                  </button>
                </div>

                {/* Global Error Alert */}
                <div aria-live="polite" aria-atomic="true" className="mt-4">
                  {error && (
                    <div className="p-3.5 rounded-xl bg-semantic-error/15 border border-semantic-error/30 text-semantic-error flex items-start gap-2.5 text-xs animate-shake">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="leading-relaxed font-medium">{error}</span>
                    </div>
                  )}
                </div>

                {/* Form Panels with 150ms cross-fade */}
                <div className="mt-7 transition-opacity duration-150 motion-reduce:transition-none">
                  {tab === 'signin' ? (
                    <form
                      id="panel-signin"
                      role="tabpanel"
                      aria-labelledby="tab-signin"
                      onSubmit={handleSignInSubmit}
                      noValidate
                      className="space-y-5"
                    >
                      {/* Email Field */}
                      <div>
                        <label 
                          htmlFor="signin-email"
                          className="block text-[15px] font-medium mb-2 leading-none"
                          style={{ color: 'var(--auth-text-primary)' }}
                        >
                          {lang === 'hi' ? s.email.hi : s.email.en}
                        </label>
                        <input
                          ref={emailInputRef}
                          id="signin-email"
                          type="email"
                          name="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className={`auth-input w-full h-[48px] sm:h-[52px] px-4 text-[16px] ${
                            fieldErrors.email ? 'auth-input-error' : ''
                          }`}
                        />
                        {fieldErrors.email && (
                          <p className="flex items-center gap-1.5 text-[13px] text-semantic-error mt-1.5" role="alert">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            <span>{fieldErrors.email}</span>
                          </p>
                        )}
                      </div>

                      {/* Password Field with Show/Hide Eye Button */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label 
                            htmlFor="signin-password"
                            className="block text-[15px] font-medium leading-none"
                            style={{ color: 'var(--auth-text-primary)' }}
                          >
                            {lang === 'hi' ? s.password.hi : s.password.en}
                          </label>
                        </div>

                        <div className="relative">
                          <input
                            ref={passwordInputRef}
                            id="signin-password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={`auth-input w-full h-[48px] sm:h-[52px] pl-4 pr-12 text-[16px] ${
                              fieldErrors.password ? 'auth-input-error' : ''
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? (lang === 'hi' ? s.hidePassword.hi : s.hidePassword.en) : (lang === 'hi' ? s.showPassword.hi : s.showPassword.en)}
                            aria-pressed={showPassword}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-[40px] h-[40px] flex items-center justify-center transition-colors cursor-pointer rounded-lg hover:text-[var(--auth-text-primary)]"
                            style={{ color: 'var(--auth-text-secondary)' }}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        {fieldErrors.password && (
                          <p className="flex items-center gap-1.5 text-[13px] text-semantic-error mt-1.5" role="alert">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            <span>{fieldErrors.password}</span>
                          </p>
                        )}
                      </div>

                      {/* Submit Button (Full width, 52px high / 48px mobile, 12px radius, 16px text) */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full h-[48px] sm:h-[52px] rounded-xl text-[16px] font-medium transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: 'var(--auth-btn-primary-bg)',
                            color: 'var(--auth-btn-primary-text)',
                            boxShadow: 'var(--auth-btn-primary-shadow)',
                          }}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>{lang === 'hi' ? 'साइन इन हो रहा है...' : 'Signing in...'}</span>
                            </>
                          ) : (
                            <span>{lang === 'hi' ? s.signIn.hi : s.signIn.en}</span>
                          )}
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Create Account Form Panel */
                    <form
                      id="panel-create"
                      role="tabpanel"
                      aria-labelledby="tab-create"
                      onSubmit={handleSignUpSubmit}
                      noValidate
                      className="space-y-5"
                    >
                      {/* Full Name */}
                      <div>
                        <label 
                          htmlFor="create-name"
                          className="block text-[15px] font-medium mb-2 leading-none"
                          style={{ color: 'var(--auth-text-primary)' }}
                        >
                          {lang === 'hi' ? s.fullName.hi : s.fullName.en}
                        </label>
                        <input
                          ref={nameInputRef}
                          id="create-name"
                          type="text"
                          name="name"
                          autoComplete="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          className={`auth-input w-full h-[48px] sm:h-[52px] px-4 text-[16px] ${
                            fieldErrors.name ? 'auth-input-error' : ''
                          }`}
                        />
                        {fieldErrors.name && (
                          <p className="flex items-center gap-1.5 text-[13px] text-semantic-error mt-1.5" role="alert">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            <span>{fieldErrors.name}</span>
                          </p>
                        )}
                      </div>

                      {/* Email */}
                      <div>
                        <label 
                          htmlFor="create-email"
                          className="block text-[15px] font-medium mb-2 leading-none"
                          style={{ color: 'var(--auth-text-primary)' }}
                        >
                          {lang === 'hi' ? s.email.hi : s.email.en}
                        </label>
                        <input
                          id="create-email"
                          type="email"
                          name="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          className={`auth-input w-full h-[48px] sm:h-[52px] px-4 text-[16px] ${
                            fieldErrors.email ? 'auth-input-error' : ''
                          }`}
                        />
                        {fieldErrors.email && (
                          <p className="flex items-center gap-1.5 text-[13px] text-semantic-error mt-1.5" role="alert">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            <span>{fieldErrors.email}</span>
                          </p>
                        )}
                      </div>

                      {/* Password */}
                      <div>
                        <label 
                          htmlFor="create-password"
                          className="block text-[15px] font-medium mb-2 leading-none"
                          style={{ color: 'var(--auth-text-primary)' }}
                        >
                          {lang === 'hi' ? s.password.hi : s.password.en}
                        </label>
                        <div className="relative">
                          <input
                            ref={passwordInputRef}
                            id="create-password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className={`auth-input w-full h-[48px] sm:h-[52px] pl-4 pr-12 text-[16px] ${
                              fieldErrors.password ? 'auth-input-error' : ''
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={showPassword ? (lang === 'hi' ? s.hidePassword.hi : s.hidePassword.en) : (lang === 'hi' ? s.showPassword.hi : s.showPassword.en)}
                            aria-pressed={showPassword}
                            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-[40px] h-[40px] flex items-center justify-center transition-colors cursor-pointer rounded-lg hover:text-[var(--auth-text-primary)]"
                            style={{ color: 'var(--auth-text-secondary)' }}
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <div 
                          className="flex items-center justify-between text-[12px] px-1 mt-1.5"
                          style={{ color: 'var(--auth-text-secondary)' }}
                        >
                          <span>{lang === 'hi' ? s.passwordHint.hi : s.passwordHint.en}</span>
                          <span className={password.length >= 8 ? 'text-semantic-success font-medium' : ''}>
                            {password.length}/8
                          </span>
                        </div>
                        {fieldErrors.password && (
                          <p className="flex items-center gap-1.5 text-[13px] text-semantic-error mt-1" role="alert">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            <span>{fieldErrors.password}</span>
                          </p>
                        )}
                      </div>

                      {/* 18+ Age & Terms Checkbox */}
                      <div className="pt-0.5">
                        <label 
                          className="flex items-start gap-2.5 cursor-pointer text-[13px] leading-relaxed"
                          style={{ color: 'var(--auth-text-secondary)' }}
                        >
                          <input
                            ref={ageCheckboxRef}
                            type="checkbox"
                            checked={ageConfirmed}
                            onChange={(e) => setAgeConfirmed(e.target.checked)}
                            className="mt-0.5 w-4 h-4 rounded border-[var(--auth-border-input)] text-primary focus:ring-primary focus:ring-offset-0 bg-transparent cursor-pointer shrink-0"
                          />
                          <span>
                            {lang === 'hi' ? (
                              <>
                                मेरी आयु 18 वर्ष या उससे अधिक है और मैं{' '}
                                <Link href="/privacy" target="_blank" className="underline hover:text-[var(--auth-text-primary)]">
                                  गोपनीयता नोट
                                </Link>{' '}
                                से सहमत हूँ।
                              </>
                            ) : (
                              <>
                                I am 18 or older and I agree to the{' '}
                                <Link href="/privacy" target="_blank" className="underline hover:text-[var(--auth-text-primary)]">
                                  Privacy note
                                </Link>
                                .
                              </>
                            )}
                          </span>
                        </label>
                        {fieldErrors.age && (
                          <p className="flex items-center gap-1.5 text-[13px] text-semantic-error mt-1 pl-6" role="alert">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            <span>{fieldErrors.age}</span>
                          </p>
                        )}
                      </div>

                      {/* Submit Button */}
                      <div className="pt-2">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full h-[48px] sm:h-[52px] rounded-xl text-[16px] font-medium transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: 'var(--auth-btn-primary-bg)',
                            color: 'var(--auth-btn-primary-text)',
                            boxShadow: 'var(--auth-btn-primary-shadow)',
                          }}
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>{lang === 'hi' ? 'खाता बनाया जा रहा है...' : 'Creating account...'}</span>
                            </>
                          ) : (
                            <span>{lang === 'hi' ? s.createAccount.hi : s.createAccount.en}</span>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>

                {/* Links under button: 20px gap, 14px, 44px tap target height */}
                <div className="mt-5 flex items-center justify-center min-h-[44px]">
                  {allowGuestMode && (
                    <button
                      type="button"
                      onClick={handleGuestEntry}
                      className="text-[14px] hover:underline transition-colors cursor-pointer py-2 px-3 rounded text-center"
                      style={{
                        color: 'var(--auth-link-color)',
                      }}
                    >
                      {lang === 'hi' ? s.continueAsGuest.hi : s.continueAsGuest.en}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom spacer for balance */}
            <div className="min-h-[20px] shrink-0" aria-hidden="true" />
          </section>
        </div>
      )}
    </main>
  );
}
