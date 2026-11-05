'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, BookOpen, Clock, History, User, Key, Sparkles, Award } from 'lucide-react';
import { getGuest, getDailyUsage, GuestProfile, DailyUsage } from '@/lib/guestStorage';
import GuestModal from './GuestModal';
import SettingsModal from './SettingsModal';

interface NavbarProps {
  currentLang?: 'en' | 'hi';
  onToggleLang?: () => void;
}

export default function Navbar({ currentLang = 'en', onToggleLang }: NavbarProps) {
  const pathname = usePathname();
  const [guest, setGuest] = useState<GuestProfile | null>(null);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage>({ date: '', count: 0, limit: 5 });
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  useEffect(() => {
    setGuest(getGuest());
    setDailyUsage(getDailyUsage());
    const interval = setInterval(() => {
      setDailyUsage(getDailyUsage());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { href: '/', label: 'Home', labelHi: 'होम', icon: Shield },
    { href: '/guide', label: '5-Day SSB Guide', labelHi: '5-दिवसीय गाइड', icon: BookOpen },
    { href: '/practice', label: 'Start PPDT', labelHi: 'PPDT अभ्यास', icon: Clock },
    { href: '/history', label: 'Past Attempts', labelHi: 'इतिहास', icon: History },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-olive-800/60 bg-[#0d120c]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-olive-600 to-olive-800 border border-olive-500/50 flex items-center justify-center shadow-lg shadow-olive-950/40 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-camo-gold" />
            </div>
            <div>
              <div className="font-heading font-bold text-lg tracking-wider text-white">
                VENEHA
              </div>
              <p className="text-[10px] text-olive-300/80 -mt-0.5 tracking-tight hidden sm:block">
                SSB Simulator and AI Assessor
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center space-x-1.5 ${
                    isActive
                      ? 'bg-olive-800/80 text-white border border-olive-600/50 shadow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-olive-900/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-camo-gold' : 'text-olive-400'}`} />
                  <span>{currentLang === 'hi' ? item.labelHi : item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Lang Switch + Guest + Settings */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Language Switch Button if on a bilingual page */}
            {onToggleLang && (
              <button
                onClick={onToggleLang}
                className="px-2.5 py-1 text-xs font-semibold rounded-md border border-olive-700 bg-olive-950/80 hover:bg-olive-900 text-olive-200 transition-colors shadow-sm flex items-center gap-1"
                title="Switch Language / भाषा बदलें"
              >
                <span className={currentLang === 'en' ? 'text-camo-gold font-bold' : 'text-gray-400'}>EN</span>
                <span className="text-gray-500">|</span>
                <span className={currentLang === 'hi' ? 'text-camo-gold font-bold' : 'text-gray-400'}>हिंदी</span>
              </button>
            )}

            {/* Daily attempts badge */}
            <div className="hidden sm:flex items-center px-2.5 py-1 rounded-full text-xs border border-olive-700/60 bg-olive-950/70 text-olive-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              <span>
                Today: <strong className="text-white">{dailyUsage.count}</strong>/{dailyUsage.limit}
              </span>
            </div>

            {/* Guest Profile button */}
            <button
              onClick={() => setShowGuestModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-olive-700/60 bg-olive-900/60 hover:bg-olive-800 text-xs sm:text-sm text-gray-200 hover:text-white transition-colors"
            >
              <User className="w-3.5 h-3.5 text-camo-gold" />
              <span className="max-w-[90px] sm:max-w-[120px] truncate">
                {guest ? guest.name : 'Enter Name'}
              </span>
            </button>

            {/* API Key / Settings */}
            <button
              onClick={() => setShowSettingsModal(true)}
              className="p-1.5 rounded-lg border border-olive-800/80 bg-olive-950/50 hover:bg-olive-900 text-gray-400 hover:text-white transition-colors"
              title="API Key Configuration"
            >
              <Key className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile secondary tab bar */}
        <div className="flex md:hidden border-t border-olive-900/60 bg-[#0a0f09] px-2 py-1 justify-around text-xs">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`py-1 px-2.5 rounded flex items-center gap-1 ${
                  isActive ? 'text-camo-gold font-semibold bg-olive-900/50' : 'text-gray-400'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{currentLang === 'hi' ? item.labelHi : item.label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* Guest Identification Modal */}
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

