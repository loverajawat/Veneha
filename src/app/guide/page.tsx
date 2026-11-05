'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Languages, 
  CheckCircle2, 
  AlertTriangle, 
  Lightbulb, 
  Clock, 
  ArrowRight,
  Shield,
  Award
} from 'lucide-react';
import { SSB_GUIDE_DATA } from '@/data/ssbGuideContent';
import { useLanguage } from '@/context/LanguageContext';

export default function GuidePage() {
  const { lang, setLang } = useLanguage();
  const [activeStageId, setActiveStageId] = useState<string>(SSB_GUIDE_DATA[0].id);

  const activeSection = SSB_GUIDE_DATA.find((s) => s.id === activeStageId) || SSB_GUIDE_DATA[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
      {/* Header with Title and Language Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-olive-800/60 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-olive-900/60 border border-olive-700/60 text-camo-gold text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>
              {lang === 'en' ? 'Comprehensive SSB Orientation Manual' : 'एसएसबी विस्तृत ओरिएंटेशन मार्गदर्शिका'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-extrabold text-white">
            {lang === 'en' ? 'The Five-Day SSB Procedure Guide' : 'पांच-दिवसीय एसएसबी चयन प्रक्रिया मार्गदर्शिका'}
          </h1>
          <p className="mt-1 text-sm sm:text-base text-[#a8baa3]">
            {lang === 'en'
              ? 'Stage-by-stage walkthrough authored with experienced Board Director & Assessor insights.'
              : 'स्क्रीनिंग से लेकर कॉन्फ्रेंस तक हर चरण की विस्तृत जानकारी एवं परीक्षकों के गुप्त सुझाव।'}
          </p>
        </div>

        {/* Big Language Toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-[#131b12] p-1.5 rounded-xl border border-olive-700 shadow-md">
          <button
            onClick={() => setLang('en')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              lang === 'en'
                ? 'bg-olive-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>English</span>
          </button>
          <button
            onClick={() => setLang('hi')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              lang === 'hi'
                ? 'bg-olive-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <span>हिंदी (Hindi)</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Stages Navigation + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Stages Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          <div className="text-xs font-bold text-olive-400 uppercase tracking-wider mb-2 px-1">
            {lang === 'en' ? 'SSB Stages' : 'एसएसबी के चरण'}
          </div>
          {SSB_GUIDE_DATA.map((section) => {
            const isActive = section.id === activeStageId;
            return (
              <button
                key={section.id}
                onClick={() => setActiveStageId(section.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex flex-col ${
                  isActive
                    ? 'bg-olive-800/90 border-olive-500 text-white shadow-lg shadow-olive-950/50'
                    : 'bg-[#111710] border-olive-900/80 text-gray-300 hover:border-olive-700 hover:bg-olive-950/60'
                }`}
              >
                <span className={`text-[11px] font-bold ${isActive ? 'text-camo-gold' : 'text-olive-400'}`}>
                  {section.day}
                </span>
                <span className="font-semibold text-sm mt-0.5 line-clamp-1">
                  {lang === 'en' ? section.titleEn : section.titleHi}
                </span>
              </button>
            );
          })}

          {/* Quick practice card */}
          <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-olive-950 to-[#0c130b] border border-olive-800 text-xs">
            <h4 className="font-bold text-white mb-1 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-camo-gold" />
              {lang === 'en' ? 'Ready to Practice PPDT?' : 'PPDT अभ्यास शुरू करें'}
            </h4>
            <p className="text-gray-300 text-[11px] mb-3">
              {lang === 'en'
                ? 'Test your story writing against exam-style 30s picture & 4m writing timers.'
                : '30 सेकंड चित्र और 4 मिनट टाइमर के साथ वास्तविक परीक्षा माहौल में अभ्यास करें।'}
            </p>
            <Link
              href="/practice"
              className="block text-center py-2 px-3 rounded-lg bg-olive-600 hover:bg-olive-500 text-white font-bold text-xs transition-colors shadow"
            >
              {lang === 'en' ? 'Launch Simulator' : 'सिम्युलेटर शुरू करें'}
            </Link>
          </div>
        </div>

        {/* Content Details */}
        <div className="lg:col-span-3 space-y-6">
          {/* Active Stage Header Card */}
          <div className="p-6 rounded-2xl bg-[#121911] border border-olive-800 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md bg-olive-900 text-camo-gold text-xs font-bold border border-olive-700">
                {activeSection.day}
              </span>
              <span className="text-xs text-olive-300 font-semibold px-2.5 py-0.5 rounded-md bg-olive-950/80 border border-olive-800">
                {lang === 'en' ? activeSection.tagEn : activeSection.tagHi}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-extrabold text-white mt-2">
              {lang === 'en' ? activeSection.titleEn : activeSection.titleHi}
            </h2>

            <p className="mt-3 text-base text-gray-200 leading-relaxed">
              {lang === 'en' ? activeSection.summaryEn : activeSection.summaryHi}
            </p>
          </div>

          {/* Tests in this stage */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-olive-300 uppercase tracking-wider px-1">
              {lang === 'en' ? 'Tests & Procedures' : 'परीक्षण एवं प्रक्रियाएं'}
            </h3>

            {activeSection.tests.map((test, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#111710] border border-olive-800/80 hover:border-olive-700 transition-colors shadow-md space-y-4"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-olive-800 flex items-center justify-center text-xs font-bold text-camo-gold">
                    {idx + 1}
                  </div>
                  <h4 className="text-lg font-bold text-white">
                    {lang === 'en' ? test.nameEn : test.nameHi}
                  </h4>
                </div>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed pl-9">
                  {lang === 'en' ? test.detailsEn : test.detailsHi}
                </p>

                {/* Assessor Tip Box */}
                <div className="ml-9 p-3.5 rounded-xl bg-olive-950/90 border border-olive-700/60 flex items-start gap-3 text-xs leading-relaxed">
                  <Lightbulb className="w-4 h-4 text-camo-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-camo-gold font-bold">
                      {lang === 'en' ? "Assessor's Secret Guidance: " : "परीक्षक का गुप्त सुझाव: "}
                    </strong>
                    <span className="text-olive-200">
                      {lang === 'en' ? test.assessorTipEn : test.assessorTipHi}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Callout */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-olive-900/60 via-[#152014] to-olive-900/60 border border-olive-700/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-heading font-bold text-lg text-white">
                {lang === 'en' ? 'PPDT is the Gateway to Stage 2' : 'PPDT ही स्टेज 2 का मुख्य द्वार है'}
              </h4>
              <p className="text-xs text-gray-300 mt-0.5">
                {lang === 'en'
                  ? 'More than 60% of candidates get screened out on Day 1. Start your practice now.'
                  : 'लगभग 60% अभ्यर्थी पहले दिन ही बाहर हो जाते हैं। आज ही समयबद्ध अभ्यास शुरू करें।'}
              </p>
            </div>
            <Link
              href="/practice"
              className="px-5 py-2.5 rounded-xl bg-olive-600 hover:bg-olive-500 text-white font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>{lang === 'en' ? 'Start Practice' : 'अभ्यास प्रारंभ करें'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

