'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import GuestModal from './GuestModal';
import { getGuest, GuestProfile } from '@/lib/guestStorage';

export default function Footer() {
  const { lang } = useLanguage();
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [guest, setGuest] = useState<GuestProfile | null>(null);

  // Mobile accordion state for footer columns
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    practice: false,
    learn: false,
    account: false,
    about: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <footer className="w-full bg-canvas border-t border-hairline py-16 px-6 lg:px-12 text-ink font-sans">
        <div className="max-w-7xl mx-auto">
          {/* Top Row: Brand & Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-hairline">
            {/* Brand column */}
            <div className="lg:col-span-1 space-y-3">
              <Link href="/" className="inline-flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center text-white">
                  <Shield className="w-3.5 h-3.5 fill-white" />
                </div>
                <span className="font-semibold text-[18px] text-ink tracking-tight">Veneha</span>
              </Link>
              <p className="text-[13px] text-slate leading-relaxed">
                Defence Services Selection Board preparation platform for NDA, CDS, AFCAT, TGC, and NCC aspirants.
              </p>
            </div>

            {/* Column 1: Practice */}
            <div className="border-t border-hairline pt-4 md:border-none md:pt-0">
              <button
                type="button"
                onClick={() => toggleSection('practice')}
                className="w-full md:pointer-events-none flex items-center justify-between text-left"
              >
                <h4 className="text-[14px] font-semibold text-ink uppercase tracking-wider mb-0 md:mb-3">
                  Practice
                </h4>
                <span className="md:hidden text-steel">
                  {openSections.practice ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>
              <ul
                className={`mt-2 md:mt-0 space-y-2.5 text-[14px] text-steel ${
                  openSections.practice ? 'block' : 'hidden md:block'
                }`}
              >
                <li>
                  <Link href="/practice" className="hover:text-ink transition-colors">
                    PPDT Timed Practice
                  </Link>
                </li>
                <li>
                  <Link href="/wat" className="hover:text-ink transition-colors">
                    WAT Word Association
                  </Link>
                </li>
                <li>
                  <Link href="/practice" className="hover:text-ink transition-colors">
                    65+ Stimulus Pictures
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Learn */}
            <div className="border-t border-hairline pt-4 md:border-none md:pt-0">
              <button
                type="button"
                onClick={() => toggleSection('learn')}
                className="w-full md:pointer-events-none flex items-center justify-between text-left"
              >
                <h4 className="text-[14px] font-semibold text-ink uppercase tracking-wider mb-0 md:mb-3">
                  Learn
                </h4>
                <span className="md:hidden text-steel">
                  {openSections.learn ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>
              <ul
                className={`mt-2 md:mt-0 space-y-2.5 text-[14px] text-steel ${
                  openSections.learn ? 'block' : 'hidden md:block'
                }`}
              >
                <li>
                  <Link href="/guide" className="hover:text-ink transition-colors">
                    5-Day SSB Orientation
                  </Link>
                </li>
                <li>
                  <Link href="/guide" className="hover:text-ink transition-colors">
                    15 Officer Like Qualities (OLQs)
                  </Link>
                </li>
                <li>
                  <Link href="/guide" className="hover:text-ink transition-colors">
                    Bilingual Guide (EN / हिंदी)
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Your Account */}
            <div className="border-t border-hairline pt-4 md:border-none md:pt-0">
              <button
                type="button"
                onClick={() => toggleSection('account')}
                className="w-full md:pointer-events-none flex items-center justify-between text-left"
              >
                <h4 className="text-[14px] font-semibold text-ink uppercase tracking-wider mb-0 md:mb-3">
                  Your Account
                </h4>
                <span className="md:hidden text-steel">
                  {openSections.account ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>
              <ul
                className={`mt-2 md:mt-0 space-y-2.5 text-[14px] text-steel ${
                  openSections.account ? 'block' : 'hidden md:block'
                }`}
              >
                <li>
                  <Link href="/history" className="hover:text-ink transition-colors">
                    Past Attempts
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setGuest(getGuest());
                      setShowGuestModal(true);
                    }}
                    className="hover:text-ink transition-colors text-left"
                  >
                    Change Callsign / Name
                  </button>
                </li>
                <li>
                  <span className="text-slate text-[13px]">Guest session (Saved locally)</span>
                </li>
              </ul>
            </div>

            {/* Column 4: About & Privacy */}
            <div className="border-t border-hairline pt-4 md:border-none md:pt-0">
              <button
                type="button"
                onClick={() => toggleSection('about')}
                className="w-full md:pointer-events-none flex items-center justify-between text-left"
              >
                <h4 className="text-[14px] font-semibold text-ink uppercase tracking-wider mb-0 md:mb-3">
                  About
                </h4>
                <span className="md:hidden text-steel">
                  {openSections.about ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>
              <ul
                className={`mt-2 md:mt-0 space-y-2.5 text-[14px] text-steel ${
                  openSections.about ? 'block' : 'hidden md:block'
                }`}
              >
                <li className="flex items-center gap-1.5 text-slate text-[13px]">
                  <Lock className="w-3.5 h-3.5 text-semantic-success shrink-0" />
                  <span>Handwriting photos are not saved by Veneha</span>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-ink transition-colors text-[13px] text-slate underline">
                    Privacy Note & Data Policy
                  </Link>
                </li>
                <li className="text-[13px] text-slate leading-relaxed">
                  Practice guidance only — not an official SSB recommendation.
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Disclaimer Row */}
          <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-slate text-center md:text-left">
            <p>
              Feedback is AI-generated practice guidance. It is not an official assessment or a prediction of selection.
            </p>
            <p className="text-steel">
              © {new Date().getFullYear()} Veneha. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

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

