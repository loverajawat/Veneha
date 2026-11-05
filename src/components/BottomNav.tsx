'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Clock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { lang } = useLanguage();

  const navItems = [
    {
      href: '/',
      labelEn: 'Home',
      labelHi: 'होम',
      icon: Home,
    },
    {
      href: '/guide',
      labelEn: 'Guide',
      labelHi: 'गाइड',
      icon: BookOpen,
    },
    {
      href: '/practice',
      labelEn: 'PPDT',
      labelHi: 'PPDT',
      icon: Clock,
    },
    {
      href: '/wat',
      labelEn: 'WAT',
      labelHi: 'WAT',
      icon: Clock,
    },
  ];

  return (
    <nav
      className="bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0f09]/95 backdrop-blur-md border-t border-olive-800/80 px-2 py-1 flex items-center justify-around shadow-2xl"
      aria-label="Mobile Navigation"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.href === '/practice'
          ? pathname.startsWith('/practice')
          : item.href === '/wat'
          ? pathname.startsWith('/wat')
          : pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-2 px-1 min-h-[48px] rounded-xl transition-all ${
              isActive
                ? 'text-camo-gold font-bold bg-olive-900/40'
                : 'text-[#a8baa3] hover:text-white'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-camo-gold' : 'text-[#a8baa3]'}`} />
            <span className="text-[13px] leading-tight">
              {lang === 'hi' ? item.labelHi : item.labelEn}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

