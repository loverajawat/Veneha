'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Clock, 
  BookOpen, 
  Sparkles, 
  Shield, 
  Camera, 
  ArrowRight, 
  CheckCircle, 
  Award, 
  Languages, 
  User, 
  FileCheck2,
  Lock,
  Eye,
  AlertCircle
} from 'lucide-react';
import { getGuest, GuestProfile } from '@/lib/guestStorage';
import GuestModal from '@/components/GuestModal';
import { OLQ_FACTORS } from '@/data/ssbGuideContent';
import { useLanguage } from '@/context/LanguageContext';
import { siteConfig } from '@/config/siteConfig';

export default function HomePage() {
  const { lang } = useLanguage();
  const [guest, setGuest] = useState<GuestProfile | null>(null);
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [selectedFactor, setSelectedFactor] = useState<string>('All');

  useEffect(() => {
    setGuest(getGuest());
  }, []);

  const factors = [
    'All',
    'Factor 1: Planning & Organizing',
    'Factor 2: Social Adjustment',
    'Factor 3: Social Effectiveness',
    'Factor 4: Dynamic',
  ];

  const filteredOLQs = selectedFactor === 'All' 
    ? OLQ_FACTORS 
    : OLQ_FACTORS.filter(o => o.factor === selectedFactor);

  return (
    <div className="flex-1 flex flex-col font-sans">
      {/* Hero Section (Item H: Spacing tightened to sit comfortably above fold at 1366x768) */}
      <section className="relative overflow-hidden pt-6 pb-8 md:pt-10 md:pb-10 border-b border-olive-900/60 bg-gradient-to-b from-[#111810] to-[#0d120c]">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 subtle-grid opacity-30 pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          {/* Top Badge with icon */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-olive-900/80 border border-olive-600/70 text-olive-200 text-xs sm:text-sm font-semibold mb-5 shadow-sm">
            <Shield className="w-3.5 h-3.5 text-camo-gold shrink-0" />
            <span>{lang === 'hi' ? siteConfig.heroBadge.hi : siteConfig.heroBadge.en}</span>
          </div>

          {/* Headline with balanced lines, solid gold accent, no gradient fade */}
          <h1 
            className="text-3xl sm:text-5xl lg:text-6xl font-serif font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto"
            style={{ textWrap: 'balance' } as any}
          >
            {lang === 'hi' ? siteConfig.heroHeadline.hiPrefix : siteConfig.heroHeadline.enPrefix}
            <span className="text-camo-gold">
              {lang === 'hi' ? siteConfig.heroHeadline.hiAccent : siteConfig.heroHeadline.enAccent}
            </span>
          </h1>

          {/* Subtitle / Paragraph */}
          <p className="mt-4 text-base sm:text-lg text-[#a8baa3] max-w-2xl mx-auto leading-relaxed">
            {lang === 'hi' ? siteConfig.heroParagraph.hi : siteConfig.heroParagraph.en}
          </p>

          {/* CTA Buttons (Tap targets >= 44px, full width on mobile) */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-lg mx-auto sm:max-w-none">
            {/* Primary Most Prominent Button */}
            <Link
              href="/practice"
              className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-xl bg-olive-600 hover:bg-olive-500 text-white font-bold text-base shadow-xl shadow-olive-950/60 transition-all flex items-center justify-center gap-2 group border border-olive-500/50"
            >
              <Clock className="w-5 h-5 text-camo-gold group-hover:scale-110 transition-transform" />
              <span>{lang === 'hi' ? 'समयबद्ध PPDT अभ्यास शुरू करें' : 'Start Timed PPDT Practice'}</span>
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Secondary Button */}
            <Link
              href="/guide"
              className="w-full sm:w-auto min-h-[48px] px-7 py-3.5 rounded-xl bg-[#141d13] hover:bg-olive-900/80 text-white font-semibold text-base border-2 border-olive-500/80 hover:border-olive-400 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <BookOpen className="w-5 h-5 text-olive-300" />
              <span>
                {lang === 'hi' ? (
                  '5-दिवसीय एसएसबी गाइड देखें (English)'
                ) : (
                  <>Explore 5-Day SSB Guide <span className="font-hindi text-base font-semibold text-olive-200">(हिंदी)</span></>
                )}
              </span>
            </Link>
          </div>

          {/* Disclaimer Line directly under the buttons */}
          <p className="mt-3 text-xs sm:text-[13px] text-[#a8baa3] max-w-xl mx-auto">
            {lang === 'hi' ? siteConfig.disclaimer.hi : siteConfig.disclaimer.en}
          </p>
        </div>
      </section>

      {/* Three-Step Strip (Item F: Seamless transition, no blank bordered row) */}
      <section className="py-8 sm:py-10 bg-[#0a0f09] border-b border-olive-900/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {siteConfig.threeSteps.map((stepItem, idx) => {
              const StepIcon = idx === 0 ? BookOpen : idx === 1 ? Clock : Sparkles;
              return (
                <Link
                  key={stepItem.step}
                  href={stepItem.route}
                  className="group p-5 rounded-2xl bg-[#131b12] border border-olive-800/80 hover:border-olive-600 transition-all shadow-md flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-olive-900/90 border border-olive-700/60 flex items-center justify-center text-camo-gold shrink-0 group-hover:scale-105 transition-transform">
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white group-hover:text-camo-gold transition-colors">
                      {lang === 'hi' ? stepItem.titleHi : stepItem.titleEn}
                    </h3>
                    <p className="text-[14px] text-[#a8baa3] mt-1 leading-snug">
                      {lang === 'hi' ? stepItem.descHi : stepItem.descEn}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Choose Your Practice Section (Section 5) */}
      <section className="py-10 bg-[#0d120c] border-b border-olive-900/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
              {lang === 'hi' ? 'अपना अभ्यास चुनें' : 'Choose Your Practice'}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-[#a8baa3] max-w-xl mx-auto">
              {lang === 'hi' 
                ? 'स्क्रीनिंग के लिए PPDT या साइकोलॉजी के लिए WAT अभ्यास प्रारंभ करें।' 
                : 'Select timed PPDT for Stage-1 Screening or WAT for Stage-2 Psychological testing.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Card 1: PPDT */}
            <div className="rounded-2xl bg-[#131b12] border border-olive-700/80 p-6 flex flex-col justify-between hover:border-olive-500 hover:bg-[#162015] transition-all shadow-xl group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-olive-800/80 border border-olive-600/50 flex items-center justify-center text-camo-gold group-hover:scale-105 transition-transform">
                    <Clock className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-olive-900 text-olive-300 border border-olive-700 font-mono">
                    STAGE 1 · SCREENING
                  </span>
                </div>
                <h3 className="text-xl font-serif font-bold text-white group-hover:text-camo-gold transition-colors">
                  {lang === 'hi' ? 'PPDT समयबद्ध अभ्यास' : 'PPDT Timed Practice'}
                </h3>
                <p className="text-sm text-[#cbd7c7] mt-2 leading-relaxed">
                  {lang === 'hi'
                    ? '30 सेकंड चित्र अवलोकन, वास्तविक कागज पर 4 मिनट कहानी लेखन, और तत्काल AI फीडबैक।'
                    : '30 seconds picture observation, 4 minutes story writing on paper, and instant AI feedback.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-olive-900/60">
                <Link
                  href="/practice"
                  className="w-full min-h-[44px] px-5 py-2.5 rounded-xl bg-olive-600 hover:bg-olive-500 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 group-hover:shadow-olive-950/50"
                >
                  <span>{lang === 'hi' ? 'PPDT शुरू करें' : 'Start PPDT Practice'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Card 2: WAT */}
            <div className="rounded-2xl bg-[#131b12] border border-olive-700/80 p-6 flex flex-col justify-between hover:border-olive-500 hover:bg-[#162015] transition-all shadow-xl group">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-olive-800/80 border border-olive-600/50 flex items-center justify-center text-camo-gold group-hover:scale-105 transition-transform">
                    <FileCheck2 className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-olive-900 text-camo-gold border border-olive-700 font-mono">
                    STAGE 2 · PSYCHOLOGY
                  </span>
                </div>
                <h3 className="text-xl font-serif font-bold text-white group-hover:text-camo-gold transition-colors">
                  {lang === 'hi' ? 'WAT शब्द संयोजन अभ्यास' : 'WAT Word Association'}
                </h3>
                <p className="text-sm text-[#cbd7c7] mt-2 leading-relaxed">
                  {lang === 'hi'
                    ? '60 शब्द, 15 सेकंड प्रत्येक। सहज रचनात्मक विचार लिखें, फोटो अपलोड करें और विस्तृत OLQ मूल्यांकन पाएं।'
                    : '60 words, 15 seconds each. Write spontaneous constructive thoughts, upload answer sheets, and get in-depth OLQ assessment.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-olive-900/60">
                <Link
                  href="/wat"
                  className="w-full min-h-[44px] px-5 py-2.5 rounded-xl bg-gradient-to-r from-olive-700 to-olive-600 hover:from-olive-600 hover:to-olive-500 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 group-hover:shadow-olive-950/50"
                >
                  <span>{lang === 'hi' ? 'WAT शुरू करें' : 'Start WAT Practice'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Pillars Section (Item G: Content visible by default, full EN and Hindi support) */}
      <section className="py-12 sm:py-14 bg-[#0d120c] max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
            {lang === 'hi' ? siteConfig.featuresHeading.hi : siteConfig.featuresHeading.en}
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#a8baa3] max-w-2xl mx-auto">
            {lang === 'hi' ? siteConfig.featuresSubtitle.hi : siteConfig.featuresSubtitle.en}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {siteConfig.pillars.map((pillar, pIdx) => {
            const PillarIcon = pIdx === 0 ? Languages : pIdx === 1 ? Clock : Sparkles;
            const bullets = lang === 'hi' ? pillar.bulletsHi : pillar.bulletsEn;
            return (
              <div
                key={pillar.partEn}
                className="rounded-2xl bg-[#131b12] border border-olive-800/80 p-6 flex flex-col justify-between hover:border-olive-600/70 transition-all shadow-lg"
              >
                <div>
                  <div className="w-11 h-11 rounded-xl bg-olive-800/70 border border-olive-600/50 flex items-center justify-center text-camo-gold mb-4">
                    <PillarIcon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-olive-300 uppercase tracking-wider">
                    {lang === 'hi' ? pillar.partHi : pillar.partEn}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1 mb-2">
                    {lang === 'hi' ? pillar.titleHi : pillar.titleEn}
                  </h3>
                  <p className="text-sm text-[#cbd7c7] leading-relaxed">
                    {lang === 'hi' ? pillar.descHi : pillar.descEn}
                  </p>
                  <ul className="mt-4 space-y-2 text-xs sm:text-[13px] text-[#a8baa3]">
                    {bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-center gap-2">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {pillar.privacyEn ? (
                  <div className="mt-6 pt-4 border-t border-olive-900/80 text-xs text-emerald-400 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>{lang === 'hi' ? pillar.privacyHi : pillar.privacyEn}</span>
                  </div>
                ) : (
                  <Link
                    href={pillar.route}
                    className="mt-6 pt-4 border-t border-olive-900/80 text-xs sm:text-sm font-semibold text-camo-gold hover:text-white flex items-center justify-between group"
                  >
                    <span>{lang === 'hi' ? pillar.actionHi : pillar.actionEn}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* The 15 OLQs Interactive Matrix */}
      <section className="py-14 bg-[#090e08] border-t border-olive-900/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-olive-950 border border-olive-700/60 text-camo-gold text-xs font-semibold mb-2">
              <Award className="w-3.5 h-3.5" />
              <span>Psychological Assessment Matrix</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              The 15 Officer Like Qualities (OLQs)
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#a8baa3] max-w-lg mx-auto">
              Every PPDT and TAT story is evaluated on the specific actions of your protagonist demonstrating these 15 qualities.
            </p>

            {/* Factor Filter Tabs */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {factors.map((factor) => (
                <button
                  key={factor}
                  onClick={() => setSelectedFactor(factor)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedFactor === factor
                      ? 'bg-olive-600 text-white shadow-md'
                      : 'bg-[#131b12] text-gray-300 border border-olive-800 hover:border-olive-600'
                  }`}
                >
                  {factor === 'All' ? 'All 15 OLQs' : factor.split(':')[1] || factor}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOLQs.map((olq) => (
              <div
                key={olq.number}
                className="p-4 rounded-xl bg-[#111710] border border-olive-800/70 hover:border-olive-600 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-olive-800 text-camo-gold font-bold text-xs flex items-center justify-center">
                      {olq.number}
                    </span>
                    <h4 className="font-bold text-sm text-white">{olq.nameEn}</h4>
                  </div>
                  <span className="text-xs text-olive-300 font-medium font-hindi">{olq.nameHi}</span>
                </div>
                <p className="text-xs sm:text-[13px] text-[#a8baa3] mb-2 leading-relaxed">{olq.descriptionEn}</p>
                <div className="p-2.5 rounded-lg bg-olive-950/80 border border-olive-900 text-xs text-olive-200">
                  <strong className="text-camo-gold font-semibold">In story: </strong>
                  {olq.inStoryEn}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
    </div>
  );
}
