'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  FileText, 
  HelpCircle,
  Eye,
  Camera,
  Star
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { siteConfig } from '@/config/siteConfig';
import { 
  Button, 
  FeatureCard, 
  YellowBoldBanner, 
  TagChip, 
  AccordionItem,
  CardBase 
} from '@/components/ui';

export default function HomePage() {
  const { lang } = useLanguage();

  return (
    <div className="flex-1 flex flex-col font-sans bg-canvas text-ink">
      {/* 1. HERO BAND (Brand Navy #0a1530 with decorative dots/wires, mockup card) */}
      <section className="relative overflow-hidden bg-brand-navy text-on-dark py-16 md:py-24 lg:py-[120px] px-4 sm:px-6 lg:px-8 border-b border-brand-navy-deep">
        {/* Decorative Wire and Dot SVG (Single lightweight inline SVG, aria-hidden, pointer-events-none) */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none hidden md:block select-none opacity-85"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle 1px wire lines connecting dots */}
          <line x1="8%" y1="18%" x2="16%" y2="28%" stroke="var(--color-on-dark-muted)" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
          <line x1="16%" y1="28%" x2="11%" y2="42%" stroke="var(--color-on-dark-muted)" strokeWidth="1" strokeDasharray="3 3" opacity="0.25" />
          <line x1="88%" y1="16%" x2="82%" y2="26%" stroke="var(--color-on-dark-muted)" strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
          <line x1="82%" y1="26%" x2="90%" y2="38%" stroke="var(--color-on-dark-muted)" strokeWidth="1" strokeDasharray="3 3" opacity="0.25" />

          {/* Left scattered sticky-note dots with slight rotation */}
          <rect x="7%" y="16%" width="20" height="20" rx="4" fill="var(--color-brand-pink)" transform="rotate(-8 30 150)" opacity="0.9" />
          <rect x="15%" y="27%" width="16" height="16" rx="4" fill="var(--color-brand-yellow)" transform="rotate(12 70 240)" opacity="0.9" />
          <rect x="10%" y="41%" width="18" height="18" rx="4" fill="var(--color-brand-teal)" transform="rotate(-6 50 360)" opacity="0.85" />
          <rect x="19%" y="15%" width="14" height="14" rx="3" fill="var(--color-brand-purple-300)" transform="rotate(15 90 130)" opacity="0.8" />
          <rect x="5%" y="54%" width="16" height="16" rx="4" fill="var(--color-brand-orange)" transform="rotate(10 30 450)" opacity="0.85" />
          <rect x="14%" y="65%" width="18" height="18" rx="4" fill="var(--color-brand-green)" transform="rotate(-12 80 540)" opacity="0.8" />

          {/* Right scattered sticky-note dots with slight rotation */}
          <rect x="87%" y="15%" width="22" height="22" rx="4" fill="var(--color-brand-yellow)" transform="rotate(9 900 130)" opacity="0.9" />
          <rect x="81%" y="25%" width="16" height="16" rx="3" fill="var(--color-brand-pink)" transform="rotate(-14 830 220)" opacity="0.85" />
          <rect x="89%" y="37%" width="18" height="18" rx="4" fill="var(--color-brand-purple-300)" transform="rotate(6 890 320)" opacity="0.9" />
          <rect x="80%" y="50%" width="14" height="14" rx="3" fill="var(--color-brand-teal)" transform="rotate(-10 810 440)" opacity="0.8" />
          <rect x="88%" y="62%" width="20" height="20" rx="4" fill="var(--color-brand-orange)" transform="rotate(14 880 530)" opacity="0.85" />
          <rect x="92%" y="22%" width="12" height="12" rx="3" fill="var(--color-brand-green)" transform="rotate(-4 920 190)" opacity="0.75" />
        </svg>

        <div className="relative max-w-4xl mx-auto text-center z-10">
          {/* Centered Headline */}
          <h1 className="hero-display text-on-dark tracking-tight max-w-3xl mx-auto">
            {lang === 'hi' ? 'PPDT एवं WAT अभ्यास करें। AI फीडबैक पाएं।' : 'Practise PPDT and WAT. Get AI feedback.'}
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-[18px] md:text-[20px] text-on-dark-muted leading-relaxed max-w-2xl mx-auto font-normal">
            {lang === 'hi'
              ? 'अंग्रेजी या हिंदी में 5-दिवसीय एसएसबी प्रक्रिया समझें, वास्तविक कागज पर समयबद्ध PPDT और शब्द संयोजन (WAT) अभ्यास करें, और अपनी हस्तलिखित प्रतिक्रियाओं पर त्वरित AI फीडबैक प्राप्त करें।'
              : 'Learn the 5-day SSB procedure in English or Hindi, practise timed PPDT and word association (WAT) on real paper, and get instant AI feedback on your handwritten responses.'}
          </p>

          {/* Button Row */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto sm:max-w-none">
            <Link href="/practice" className="w-full sm:w-auto">
              <Button variant="primary" fullWidth className="text-[15px] px-6 py-3">
                <Clock className="w-4 h-4 mr-2" />
                <span>Start Timed PPDT Practice</span>
              </Button>
            </Link>

            <Link href="/guide" className="w-full sm:w-auto">
              <Button variant="secondary-on-dark" fullWidth className="text-[15px] px-6 py-3">
                <BookOpen className="w-4 h-4 mr-2" />
                <span>Explore 5-Day SSB Guide</span>
              </Button>
            </Link>
          </div>

          {/* Disclaimer under buttons */}
          <p className="mt-4 text-[13px] text-on-dark-muted">
            Feedback is AI-generated practice guidance. It is not an official assessment or a prediction of selection.
          </p>

          {/* Product Mockup Card (White card, 12px radius, shadow level 3, illustrative view) */}
          <div
            aria-hidden="true"
            className="mt-12 md:mt-16 bg-canvas text-ink rounded-lg p-5 sm:p-7 shadow-level3 border border-hairline text-left select-none pointer-events-none"
          >
            {/* Header row in mockup card */}
            <div className="flex items-center justify-between pb-4 border-b border-hairline mb-5">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-semantic-error/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-brand-yellow/90 inline-block" />
                <span className="w-3 h-3 rounded-full bg-semantic-success/80 inline-block" />
                <span className="text-[12px] font-semibold text-slate ml-2">Veneha Workspace Simulator</span>
              </div>
              <span className="text-[11px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-sm bg-card-tint-gray text-steel">
                Example
              </span>
            </div>

            {/* Illustrative mini grid + sample feedback panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Mini cards column (2 cols on md) */}
              <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {/* Mini Picture 1 (Attempted) */}
                <div className="rounded-md border border-hairline bg-surface p-3 flex flex-col justify-between h-[100px]">
                  <span className="text-[13px] font-semibold text-ink">Picture 1</span>
                  <div className="pt-1.5 border-t border-hairline flex items-center justify-between text-[11px]">
                    <span className="text-charcoal font-semibold">Score: 8/10</span>
                    <span className="text-steel">3 Nov</span>
                  </div>
                </div>

                {/* Mini Picture 2 (Attempted) */}
                <div className="rounded-md border border-hairline bg-surface p-3 flex flex-col justify-between h-[100px]">
                  <span className="text-[13px] font-semibold text-ink">Picture 2</span>
                  <div className="pt-1.5 border-t border-hairline flex items-center justify-between text-[11px]">
                    <span className="text-charcoal font-semibold">Score: 7/10</span>
                    <span className="text-steel">4 Nov</span>
                  </div>
                </div>

                {/* Mini Picture 3 */}
                <div className="rounded-md border border-hairline bg-canvas p-3 flex flex-col justify-between h-[100px]">
                  <span className="text-[13px] font-medium text-slate">Picture 3</span>
                  <span className="text-[11px] text-muted">Not attempted</span>
                </div>

                {/* Mini Picture 4 */}
                <div className="rounded-md border border-hairline bg-canvas p-3 flex flex-col justify-between h-[100px]">
                  <span className="text-[13px] font-medium text-slate">Picture 4</span>
                  <span className="text-[11px] text-muted">Not attempted</span>
                </div>

                {/* Mini Picture 5 */}
                <div className="rounded-md border border-hairline bg-canvas p-3 flex flex-col justify-between h-[100px]">
                  <span className="text-[13px] font-medium text-slate">Picture 5</span>
                  <span className="text-[11px] text-muted">Not attempted</span>
                </div>

                {/* Mini Picture 6 */}
                <div className="rounded-md border border-hairline bg-canvas p-3 flex flex-col justify-between h-[100px]">
                  <span className="text-[13px] font-medium text-slate">Picture 6</span>
                  <span className="text-[11px] text-muted">Not attempted</span>
                </div>
              </div>

              {/* Sample AI Feedback panel preview */}
              <div className="rounded-md bg-card-tint-mint/50 border border-brand-green/30 p-4 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-brand-green uppercase tracking-wide">
                      AI Feedback
                    </span>
                    <TagChip color="green">Strong</TagChip>
                  </div>
                  <h4 className="text-[14px] font-semibold text-ink mt-1">Realistic Action &amp; Clear Lead</h4>
                  <p className="text-[12px] text-charcoal mt-1 line-clamp-3">
                    Hero took initiative without exaggerated heroism. Timelines closely follow the 10-75-15 format.
                  </p>
                </div>
                <div className="text-[11px] text-slate pt-2 border-t border-brand-green/20">
                  OLQs Highlighted: Social Adaptability, Initiative
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (Three Tinted Feature Cards: Sky, Peach, Lavender) */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-[32px] md:text-[36px] font-semibold tracking-tight text-ink">
            {lang === 'hi' ? 'यह कैसे काम करता है' : 'How It Works'}
          </h2>
          <p className="text-[16px] text-slate mt-2 max-w-xl mx-auto">
            {lang === 'hi'
              ? 'तीन सरल चरणों में एसएसबी परीक्षा प्रक्रिया को समझें और वास्तविक अभ्यास करें।'
              : 'Master the SSB procedure and hone your psychological instincts in three simple steps.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Learn (Sky Tint) */}
          <Link href="/guide" className="block group">
            <FeatureCard tint="sky" className="h-full flex flex-col justify-between hover:shadow-level1 transition-shadow">
              <div>
                <div className="w-10 h-10 rounded-md bg-canvas border border-hairline flex items-center justify-center text-primary mb-5 shadow-xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-[22px] font-semibold text-ink group-hover:text-primary transition-colors">
                  {lang === 'hi' ? '1. सीखें' : '1. Learn'}
                </h3>
                <p className="text-[15px] text-charcoal mt-2 leading-relaxed">
                  {lang === 'hi'
                    ? 'अंग्रेजी या हिंदी में 5-दिवसीय एसएसबी प्रक्रिया, OIR और 15 OLQs को गहराई से समझें।'
                    : 'Understand the complete 5-day SSB procedure and 15 Officer Like Qualities in English or Hindi.'}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1 text-[13px] font-semibold text-link-blue">
                <span>Explore guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </FeatureCard>
          </Link>

          {/* Card 2: Practise (Peach Tint) */}
          <Link href="/practice" className="block group">
            <FeatureCard tint="peach" className="h-full flex flex-col justify-between hover:shadow-level1 transition-shadow">
              <div>
                <div className="w-10 h-10 rounded-md bg-canvas border border-hairline flex items-center justify-center text-brand-orange mb-5 shadow-xs">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="text-[22px] font-semibold text-ink group-hover:text-brand-orange transition-colors">
                  {lang === 'hi' ? '2. अभ्यास करें' : '2. Practise'}
                </h3>
                <p className="text-[15px] text-charcoal mt-2 leading-relaxed">
                  {lang === 'hi'
                    ? 'चित्र देखने के लिए 30 सेकंड, वास्तविक कागज पर कहानी लिखने के लिए 4 मिनट।'
                    : '30 seconds to view the stimulus picture, 4 minutes to write your story on real paper.'}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1 text-[13px] font-semibold text-link-blue">
                <span>Start practice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </FeatureCard>
          </Link>

          {/* Card 3: Get Feedback (Lavender Tint) */}
          <Link href="/practice" className="block group">
            <FeatureCard tint="lavender" className="h-full flex flex-col justify-between hover:shadow-level1 transition-shadow">
              <div>
                <div className="w-10 h-10 rounded-md bg-canvas border border-hairline flex items-center justify-center text-brand-purple mb-5 shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-[22px] font-semibold text-ink group-hover:text-brand-purple transition-colors">
                  {lang === 'hi' ? '3. फीडबैक पाएं' : '3. Get Feedback'}
                </h3>
                <p className="text-[15px] text-charcoal mt-2 leading-relaxed">
                  {lang === 'hi'
                    ? 'अपनी हस्तलिखित शीट का फोटो लें और तत्काल वस्तुनिष्ठ AI मूल्यांकन और OLQ रिपोर्ट प्राप्त करें।'
                    : 'Photograph your handwritten sheet and receive instant AI feedback on structure and OLQs.'}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1 text-[13px] font-semibold text-link-blue">
                <span>See sample feedback</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </FeatureCard>
          </Link>
        </div>
      </section>

      {/* 3. CHOOSE YOUR PRACTICE (Two larger cards: Mint PPDT, Rose WAT) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-[32px] md:text-[36px] font-semibold tracking-tight text-ink">
            {lang === 'hi' ? 'अपना अभ्यास चुनें' : 'Choose Your Practice'}
          </h2>
          <p className="text-[16px] text-slate mt-2 max-w-xl mx-auto">
            {lang === 'hi'
              ? 'स्टेज 1 स्क्रीनिंग के लिए PPDT अथवा स्टेज 2 साइकोलॉजी के लिए WAT अभ्यास प्रारंभ करें।'
              : 'Select timed PPDT for Stage-1 Screening or WAT for Stage-2 Psychological testing.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card 1: PPDT (Mint Tint) */}
          <FeatureCard tint="mint" className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <TagChip color="green">STAGE 1 · SCREENING</TagChip>
                <span className="text-[13px] font-semibold text-charcoal">30 s picture, 4 min write</span>
              </div>
              <h3 className="text-[26px] font-semibold text-ink">
                {lang === 'hi' ? 'PPDT समयबद्ध अभ्यास' : 'PPDT Timed Practice'}
              </h3>
              <p className="text-[15px] text-charcoal mt-2 leading-relaxed">
                {lang === 'hi'
                  ? '65+ परीक्षा-स्तरीय अस्पष्ट चित्रों का अवलोकन करें। 4 मिनट में कागज पर कहानी लिखें, OCR द्वारा जांचें और 4D एवं 10-75-15 संरचना रिपोर्ट पाएं।'
                  : 'Observe 65+ exam-style stimulus cards. Write your story on paper, review your OCR transcript, and get immediate 4D & timeline analysis.'}
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-brand-green/20">
              <Link href="/practice">
                <Button variant="primary">
                  <span>Start PPDT Practice</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </FeatureCard>

          {/* Card 2: WAT (Rose Tint) */}
          <FeatureCard tint="rose" className="flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <TagChip color="orange">STAGE 2 · PSYCHOLOGY</TagChip>
                <span className="text-[13px] font-semibold text-charcoal">60 words, 15 s each</span>
              </div>
              <h3 className="text-[26px] font-semibold text-ink">
                {lang === 'hi' ? 'WAT शब्द संयोजन' : 'WAT Word Association'}
              </h3>
              <p className="text-[15px] text-charcoal mt-2 leading-relaxed">
                {lang === 'hi'
                  ? '60 शब्दों की निरंतर श्रृंखला, प्रत्येक शब्द 15 सेकंड के लिए। अपने स्वाभाविक और रचनात्मक विचार कागज पर लिखें और 8 मनोवैज्ञानिक मानदंडों पर मूल्यांकन पाएं।'
                  : '60 words flashed one after another for 15 seconds each. Write spontaneous, constructive thoughts on paper and receive evaluation across 8 assessor rubrics.'}
              </p>
            </div>

            <div className="mt-8 pt-4 border-t border-brand-pink/20">
              <Link href="/wat">
                <Button variant="dark">
                  <span>Start WAT Practice</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </FeatureCard>
        </div>
      </section>

      {/* 4. STAT ROW ON SURFACE (12px radius, 48px padding, four true facts) */}
      <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="bg-surface rounded-lg p-8 sm:p-12 border border-hairline">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-hairline">
            <div className="pt-4 md:pt-0">
              <div className="text-[36px] md:text-[44px] font-semibold text-ink tracking-tight">30 s</div>
              <div className="text-[14px] text-slate mt-1 font-medium">picture observation</div>
            </div>
            <div className="pt-4 md:pt-0 md:pl-8">
              <div className="text-[36px] md:text-[44px] font-semibold text-ink tracking-tight">4 min</div>
              <div className="text-[14px] text-slate mt-1 font-medium">to write on paper</div>
            </div>
            <div className="pt-4 md:pt-0 md:pl-8">
              <div className="text-[36px] md:text-[44px] font-semibold text-ink tracking-tight">60</div>
              <div className="text-[14px] text-slate mt-1 font-medium">words in a WAT set</div>
            </div>
            <div className="pt-4 md:pt-0 md:pl-8">
              <div className="text-[36px] md:text-[44px] font-semibold text-ink tracking-tight">15 s</div>
              <div className="text-[14px] text-slate mt-1 font-medium">per word timer</div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. YELLOW-BOLD BANNER (Privacy Promise) */}
      <section className="py-6 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <YellowBoldBanner className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-md bg-canvas/80 flex items-center justify-center text-charcoal shrink-0">
              <Lock className="w-5 h-5 text-ink" />
            </div>
            <div>
              <h4 className="text-[18px] font-semibold text-ink">Strict Privacy Promise</h4>
              <p className="text-[15px] text-charcoal mt-0.5">
                Your handwriting photos are deleted as soon as your answers are read. No photos are permanently stored.
              </p>
            </div>
          </div>
          <span className="text-[12px] font-semibold uppercase tracking-wider text-charcoal/80 bg-canvas/50 px-3 py-1.5 rounded-sm shrink-0">
            Secure OCR
          </span>
        </YellowBoldBanner>
      </section>

      {/* 6. FAQ ACCORDION (Answers matching product operation) */}
      <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-[32px] md:text-[36px] font-semibold tracking-tight text-ink">
            Frequently Asked Questions
          </h2>
          <p className="text-[16px] text-slate mt-2">
            Clear answers on how the simulator, timers, and AI guidance operate.
          </p>
        </div>

        <div className="space-y-3">
          <AccordionItem question="Is the score official?" defaultOpen>
            No. It is AI practice guidance based on standard SSB psychological rubrics and Officer Like Qualities (OLQs). It is designed for self-improvement and is not an official assessment or a prediction of selection.
          </AccordionItem>

          <AccordionItem question="Do I need an account to practise?">
            No, just a callsign or name. Veneha runs in guest mode by default, storing your attempt history and practice feedback directly in your browser.
          </AccordionItem>

          <AccordionItem question="Are my handwriting photos stored?">
            No. Your photos are read in memory for OCR transcription and deleted immediately. We never persist or share your handwriting images.
          </AccordionItem>

          <AccordionItem question="What language do I write my responses in?">
            English. While the 5-Day SSB Guide and platform instructions can be toggled to Hindi at any time, all candidate stories and word associations in the actual SSB examination must be written in English.
          </AccordionItem>

          <AccordionItem question="Why is there a daily practice limit?">
            To keep the AI vision and assessment service high quality, fast, and completely free for all defence candidates, guests are allocated 5 PPDT and 2 WAT attempts per day. Limits reset automatically at midnight.
          </AccordionItem>
        </div>
      </section>

      {/* 7. CTA BANNER (Light surface with purple primary button) */}
      <section className="py-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="bg-surface rounded-lg p-10 sm:p-16 border border-hairline text-center space-y-5">
          <h2 className="text-[32px] md:text-[40px] font-semibold text-ink tracking-tight max-w-xl mx-auto">
            Ready to test your perception and reaction?
          </h2>
          <p className="text-[16px] text-slate max-w-md mx-auto leading-relaxed">
            Begin with a timed 30-second picture perception test on paper and get instant structured feedback.
          </p>
          <div className="pt-2">
            <Link href="/practice">
              <Button variant="primary" className="text-[15px] px-8 py-3.5">
                <span>Start Timed PPDT Practice</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
