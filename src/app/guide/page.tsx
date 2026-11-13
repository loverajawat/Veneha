'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Lightbulb, 
  ArrowRight,
  Shield, 
  CheckCircle2, 
  UserCheck, 
  Target, 
  Users
} from 'lucide-react';
import { SSB_GUIDE_DATA, OLQ_SECTION_DATA } from '@/data/ssbGuideContent';
import { useLanguage } from '@/context/LanguageContext';
import { 
  CardBase, 
  FeatureCard, 
  PillTab, 
  TagChip, 
  Button 
} from '@/components/ui';

export default function GuidePage() {
  const { lang } = useLanguage();
  const [activeStageId, setActiveStageId] = useState<string>(SSB_GUIDE_DATA[0].id);

  const activeSection = SSB_GUIDE_DATA.find((s) => s.id === activeStageId) || SSB_GUIDE_DATA[0];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 space-y-10 text-ink">
      {/* 1. Page Header */}
      <div className="border-b border-hairline pb-6">
        <h1 className="text-[32px] md:text-[36px] font-semibold text-ink tracking-tight">
          {lang === 'en' ? 'The Five-Day SSB Procedure Guide' : 'पांच-दिवसीय एसएसबी चयन प्रक्रिया मार्गदर्शिका'}
        </h1>
        <p className="mt-2 text-[18px] text-slate leading-relaxed max-w-3xl font-normal">
          {lang === 'en'
            ? 'Complete stage-by-stage orientation manual covering Screening, Psychological Testing, GTO tasks, and Personal Interviews.'
            : 'स्क्रीनिंग, मनोवैज्ञानिक परीक्षण, जीटीओ कार्य एवं व्यक्तिगत साक्षात्कार की सम्पूर्ण चरणबद्ध जानकारी।'}
        </p>
      </div>

      {/* 2. Stage Cards (Two tinted cards: Stage I sky, Stage II lavender) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stage I Card (Sky) */}
        <FeatureCard tint="sky" className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <TagChip color="purple">DAY 1</TagChip>
              <span className="text-[13px] font-semibold text-charcoal">Filter Rate: ~60% Screened Out</span>
            </div>
            <h3 className="text-[24px] font-semibold text-ink">
              {lang === 'en' ? 'Stage I: Screening' : 'स्टेज I: स्क्रीनिंग'}
            </h3>
            <p className="text-[15px] text-charcoal mt-2 leading-relaxed">
              {lang === 'en'
                ? 'Officers Intelligence Rating (OIR) test followed by Picture Perception & Description Test (PPDT). Gateway to the remaining 4 days.'
                : 'ऑफिसर्स इंटेलिजेंस रेटिंग (OIR) एवं पिक्चर परसेप्शन एंड डिस्क्रिप्शन टेस्ट (PPDT)। बाकी 4 दिनों के लिए मुख्य द्वार।'}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-hairline flex items-center justify-between">
            <span className="text-[13px] text-slate">Key tests: OIR, PPDT Story, Group Discussion</span>
            <Link href="/practice">
              <Button variant="link">Practise PPDT &rarr;</Button>
            </Link>
          </div>
        </FeatureCard>

        {/* Stage II Card (Lavender) */}
        <FeatureCard tint="lavender" className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <TagChip color="orange">DAYS 2 TO 5</TagChip>
              <span className="text-[13px] font-semibold text-charcoal">Comprehensive Assessment</span>
            </div>
            <h3 className="text-[24px] font-semibold text-ink">
              {lang === 'en' ? 'Stage II: Detailed Testing' : 'स्टेज II: विस्तृत मूल्यांकन'}
            </h3>
            <p className="text-[15px] text-charcoal mt-2 leading-relaxed">
              {lang === 'en'
                ? 'Psychological Tests (TAT, WAT, SRT, SDT), 9 Group Testing Officer (GTO) tasks, Personal Interview, and the Final Board Conference.'
                : 'मनोवैज्ञानिक परीक्षण (TAT, WAT, SRT, SDT), 9 जीटीओ ग्राउंड टास्क, व्यक्तिगत साक्षात्कार और अंतिम बोर्ड कॉन्फ्रेंस।'}
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-hairline flex items-center justify-between">
            <span className="text-[13px] text-slate">Key tests: Psychology, GTO, Interview, Conference</span>
            <Link href="/wat">
              <Button variant="link">Practise WAT &rarr;</Button>
            </Link>
          </div>
        </FeatureCard>
      </div>

      {/* 3. Day Navigation: Pill Tabs */}
      <div className="space-y-4">
        <div className="text-[13px] font-semibold text-steel uppercase tracking-wider">
          {lang === 'en' ? 'Select a day to inspect' : 'दिन चुनें'}
        </div>
        <div className="flex flex-wrap items-center gap-2.5 pb-2 border-b border-hairline">
          {SSB_GUIDE_DATA.map((section) => {
            const isActive = section.id === activeStageId;
            return (
              <PillTab
                key={section.id}
                active={isActive}
                onClick={() => setActiveStageId(section.id)}
              >
                <span>{section.day}</span>
                <span className="text-steel dark:text-slate font-normal ml-1 hidden sm:inline">
                  · {lang === 'en' ? section.titleEn.split(':')[0] : section.titleHi.split(':')[0]}
                </span>
              </PillTab>
            );
          })}
        </div>
      </div>

      {/* 4. Active Day Card-Base */}
      <CardBase className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-hairline">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-semibold text-[13px] text-steel">{activeSection.day}</span>
              <TagChip color={activeSection.id === 'stage-1' ? 'purple' : 'orange'}>
                {lang === 'en' ? activeSection.tagEn : activeSection.tagHi}
              </TagChip>
            </div>
            <h2 className="text-[26px] font-semibold text-ink">
              {lang === 'en' ? activeSection.titleEn : activeSection.titleHi}
            </h2>
          </div>

          <Link href="/practice">
            <Button variant="secondary">
              <span>Start Simulator</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>

        <p className="text-[16px] text-charcoal leading-relaxed">
          {lang === 'en' ? activeSection.summaryEn : activeSection.summaryHi}
        </p>

        {/* Tests List in this Day */}
        <div className="space-y-4 pt-4 border-t border-hairline">
          <h3 className="text-[16px] font-semibold text-ink uppercase tracking-wider">
            {lang === 'en' ? 'Scheduled Procedures & Tests' : 'निर्धारित परीक्षण एवं प्रक्रियाएं'}
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {activeSection.tests.map((test, idx) => (
              <div
                key={idx}
                className="p-5 rounded-md border border-hairline bg-surface/50 hover:bg-surface transition-colors space-y-3"
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-md bg-canvas border border-hairline flex items-center justify-center text-[12px] font-bold text-ink shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-[17px] font-semibold text-ink">
                      {lang === 'en' ? test.nameEn : test.nameHi}
                    </h4>
                    <p className="text-[14px] text-charcoal mt-1 leading-relaxed">
                      {lang === 'en' ? test.detailsEn : test.detailsHi}
                    </p>
                  </div>
                </div>

                {/* Assessor Tip in clean card-tint-cream */}
                <div className="ml-9 p-3 rounded-md bg-card-tint-cream border border-hairline flex items-start gap-2.5 text-[13px] leading-relaxed">
                  <Lightbulb className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-charcoal font-semibold">
                      {lang === 'en' ? 'Assessor Guidance: ' : 'परीक्षक का सुझाव: '}
                    </strong>
                    <span className="text-charcoal">
                      {lang === 'en' ? test.assessorTipEn : test.assessorTipHi}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardBase>

      {/* 5. "Who Assesses You" as Three Small Cards */}
      <section className="space-y-4 pt-4">
        <div>
          <h3 className="text-[22px] font-semibold text-ink">
            {lang === 'en' ? 'The Three Independent Assessors' : 'तीन स्वतंत्र परीक्षक'}
          </h3>
          <p className="text-[14px] text-slate mt-1">
            Every candidate is assessed independently through three distinct lenses without consulting until the conference.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardBase>
            <div className="w-9 h-9 rounded-md bg-card-tint-lavender text-brand-purple-800 flex items-center justify-center mb-3">
              <UserCheck className="w-5 h-5" />
            </div>
            <h4 className="text-[17px] font-semibold text-ink">1. The Psychologist</h4>
            <p className="text-[14px] text-charcoal mt-1.5 leading-relaxed">
              Evaluates the subconscious mind through written projections: TAT stories, 60 WAT sentences, 60 SRTs, and Self-Description.
            </p>
          </CardBase>

          <CardBase>
            <div className="w-9 h-9 rounded-md bg-card-tint-peach text-brand-orange-deep flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-[17px] font-semibold text-ink">2. The GTO</h4>
            <p className="text-[14px] text-charcoal mt-1.5 leading-relaxed">
              Observes physical dynamism, team behavior, leadership, and spontaneous cooperation across 9 ground and obstacle tasks.
            </p>
          </CardBase>

          <CardBase>
            <div className="w-9 h-9 rounded-md bg-card-tint-sky text-link-blue flex items-center justify-center mb-3">
              <Target className="w-5 h-5" />
            </div>
            <h4 className="text-[17px] font-semibold text-ink">3. Interviewing Officer</h4>
            <p className="text-[14px] text-charcoal mt-1.5 leading-relaxed">
              Senior officer (President/Deputy President) conducting a 35 to 60 minute one-on-one interview exploring life decisions, family, and GK.
            </p>
          </CardBase>
        </div>
      </section>

      {/* 6. "What is Assessed" as Yellow Card */}
      <FeatureCard tint="yellow" className="space-y-4">
        <h3 className="text-[20px] font-semibold text-ink">
          {lang === 'en' ? OLQ_SECTION_DATA.headingEn : OLQ_SECTION_DATA.headingHi}
        </h3>

        <p className="text-[15px] sm:text-[16px] text-charcoal">
          {lang === 'en' ? OLQ_SECTION_DATA.introEn : OLQ_SECTION_DATA.introHi}
        </p>

        {/* Top-to-bottom ordered list of 4 factors */}
        <ol className="space-y-5 list-none pl-0" role="list">
          {OLQ_SECTION_DATA.factors.map((factor, factorIdx) => {
            const factorTitle = lang === 'en' ? factor.titleEn : factor.titleHi;
            const factorQualities = lang === 'en' ? factor.qualitiesEn : factor.qualitiesHi;

            return (
              <li 
                key={factor.id} 
                role="listitem"
                className={`space-y-2.5 ${factorIdx > 0 ? 'pt-4 border-t border-hairline/60' : ''}`}
              >
                <div className="text-[17px] sm:text-[18px] font-bold text-ink">
                  {factorTitle}
                </div>
                <ul 
                  className="space-y-1.5 pl-5 list-disc text-[16px] text-charcoal leading-[1.6] marker:text-charcoal" 
                  role="list"
                >
                  {factorQualities.map((quality, qIdx) => (
                    <li key={qIdx} role="listitem" className="pl-1">
                      {quality}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ol>

        <div className="pt-2 mt-6">
          <Link href="/practice">
            <Button variant="dark">
              {lang === 'en' ? OLQ_SECTION_DATA.ctaEn : OLQ_SECTION_DATA.ctaHi}
            </Button>
          </Link>
        </div>
      </FeatureCard>

      {/* 7. Disclaimer as a Quiet Note in Slate */}
      <div className="text-[13px] text-slate pt-2 border-t border-hairline">
        Disclaimer: This guide is intended for orientation and practice guidance. SSB selection criteria and ground arrangements are governed strictly by the respective Service Selection Boards (Army, Navy, Air Force, Coast Guard).
      </div>
    </div>
  );
}
