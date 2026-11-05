'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Dices, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { getPictureGridData, PictureGridItem, canAttemptToday } from '@/lib/guestStorage';
import { getActivePictures } from '@/data/pictures';
import { useLanguage } from '@/context/LanguageContext';
import { siteConfig } from '@/config/siteConfig';

const initialItems: PictureGridItem[] = getActivePictures().map((p, idx) => ({
  pictureNumber: idx + 1,
  pictureId: p.id,
  attempted: false,
  lastScore: null,
  lastAttemptedAt: null,
  lastAttemptId: null,
  attemptCount: 0,
}));

export default function PracticeGridPage() {
  const router = useRouter();
  const { lang } = useLanguage();

  const [items, setItems] = useState<PictureGridItem[]>(initialItems);
  const [activeFilter, setActiveFilter] = useState<'all' | 'not-attempted' | 'attempted'>('all');
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [canAttempt, setCanAttempt] = useState(true);

  // Load grid items from client storage
  const loadData = () => {
    try {
      const data = getPictureGridData();
      setItems(data);
      setCanAttempt(canAttemptToday());
    } catch (err) {
      console.error('Failed to load picture grid:', err);
    }
  };

  useEffect(() => {
    loadData();
    // Read filter from URL if present
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const f = sp.get('filter');
      if (f === 'not-attempted' || f === 'attempted' || f === 'all') {
        setActiveFilter(f);
      }
    }
    // Refresh when window gains focus (e.g. returning from practice session)
    window.addEventListener('focus', loadData);
    return () => window.removeEventListener('focus', loadData);
  }, []);

  const handleFilterChange = (newFilter: 'all' | 'not-attempted' | 'attempted') => {
    setActiveFilter(newFilter);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (newFilter === 'all') {
        url.searchParams.delete('filter');
      } else {
        url.searchParams.set('filter', newFilter);
      }
      window.history.replaceState({}, '', url.toString());
    }
  };

  // Filtered pictures
  const filteredItems = useMemo(() => {
    if (activeFilter === 'not-attempted') {
      return items.filter((item) => !item.attempted);
    }
    if (activeFilter === 'attempted') {
      return items.filter((item) => item.attempted);
    }
    return items;
  }, [items, activeFilter]);

  // Statistics for progress line
  const totalCount = items.length;
  const attemptedCount = items.filter((i) => i.attempted).length;
  const progressPercent = totalCount > 0 ? (attemptedCount / totalCount) * 100 : 0;

  // Random picture handler: prefers unattempted pictures
  const handleRandomPicture = () => {
    if (!canAttempt) {
      alert(lang === 'hi' ? siteConfig.practiceGrid.dailyLimitMessage.hi : siteConfig.practiceGrid.dailyLimitMessage.en);
      return;
    }
    const unattempted = items.filter((i) => !i.attempted);
    const pool = unattempted.length > 0 ? unattempted : items;
    if (pool.length === 0) return;
    const randomChoice = pool[Math.floor(Math.random() * pool.length)];
    router.push(`/practice/${randomChoice.pictureNumber}`);
  };

  const t = siteConfig.practiceGrid;

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full font-sans animate-fade-in space-y-6">
      {/* 1. Page Heading */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-olive-900/80 pb-5">
        <div>
          <h1 className="text-2xl sm:text-4xl font-serif font-extrabold text-white tracking-tight">
            {lang === 'hi' ? t.title.hi : t.title.en}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#a8baa3] max-w-2xl">
            {lang === 'hi' ? t.subtitle.hi : t.subtitle.en}
          </p>
        </div>

        {/* Random Picture Action Button */}
        <button
          onClick={handleRandomPicture}
          disabled={!canAttempt && attemptedCount === totalCount}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-olive-700/80 hover:bg-olive-600/90 text-white border border-olive-500/60 font-semibold text-xs sm:text-sm shadow-md transition-all hover:scale-[1.02] shrink-0"
          title="Pick a random picture (prefers unattempted)"
        >
          <Dices className="w-4 h-4 text-camo-gold" />
          <span>{lang === 'hi' ? t.randomPicture.hi : t.randomPicture.en}</span>
        </button>
      </div>

      {/* 2. Progress Line + How It Works Accordion */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#111710] border border-olive-800/80 space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">
              {lang === 'hi' 
                ? `${totalCount} में से ${attemptedCount} चित्र पूरे किए`
                : `${attemptedCount} of ${totalCount} pictures attempted`}
            </span>
            <span className="text-xs text-olive-300 font-mono">
              ({Math.round(progressPercent)}%)
            </span>
          </div>

          {/* Toggle 'How it works' Button */}
          <button
            onClick={() => setShowHowItWorks(!showHowItWorks)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-camo-gold hover:text-white transition-colors self-start sm:self-auto"
            aria-expanded={showHowItWorks}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? t.howItWorks.hi : t.howItWorks.en}</span>
            {showHowItWorks ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Thin Progress Bar Track */}
        <div className="w-full bg-[#182317] h-2 rounded-full overflow-hidden border border-olive-800/80">
          <div
            className="h-full bg-gradient-to-r from-olive-500 to-camo-gold transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Collapsible How It Works Panel (Step 6) */}
        {showHowItWorks && (
          <div className="pt-3 mt-2 border-t border-olive-900/80 text-xs sm:text-[13px] text-[#cbd7c7] space-y-1.5 animate-fade-in bg-olive-950/40 p-3 rounded-xl">
            {(lang === 'hi' ? t.howItWorksSteps.hi : t.howItWorksSteps.en).map((stepText, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-camo-gold mt-1.5 shrink-0" />
                <span>{stepText}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Daily limit reached banner if quota exhausted */}
      {!canAttempt && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-700/60 flex items-center gap-3 text-xs sm:text-sm text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
          <span>{lang === 'hi' ? t.dailyLimitMessage.hi : t.dailyLimitMessage.en}</span>
        </div>
      )}

      {/* 3. Filter Tabs (All | Not attempted | Attempted) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1" role="tablist">
        <button
          onClick={() => handleFilterChange('all')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[40px] shrink-0 ${
            activeFilter === 'all'
              ? 'bg-olive-600 text-white shadow-md border border-olive-500'
              : 'bg-[#131b12] text-[#a8baa3] hover:text-white border border-olive-800/80'
          }`}
          role="tab"
          aria-selected={activeFilter === 'all'}
        >
          {lang === 'hi' ? t.all.hi : t.all.en} ({items.length})
        </button>

        <button
          onClick={() => handleFilterChange('not-attempted')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[40px] shrink-0 ${
            activeFilter === 'not-attempted'
              ? 'bg-olive-600 text-white shadow-md border border-olive-500'
              : 'bg-[#131b12] text-[#a8baa3] hover:text-white border border-olive-800/80'
          }`}
          role="tab"
          aria-selected={activeFilter === 'not-attempted'}
        >
          {lang === 'hi' ? t.notAttempted.hi : t.notAttempted.en} ({items.filter((i) => !i.attempted).length})
        </button>

        <button
          onClick={() => handleFilterChange('attempted')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[40px] shrink-0 ${
            activeFilter === 'attempted'
              ? 'bg-olive-600 text-white shadow-md border border-olive-500'
              : 'bg-[#131b12] text-[#a8baa3] hover:text-white border border-olive-800/80'
          }`}
          role="tab"
          aria-selected={activeFilter === 'attempted'}
        >
          {lang === 'hi' ? t.attempted.hi : t.attempted.en} ({attemptedCount})
        </button>
      </div>

      {/* 4. The Grid of Picture Blocks */}
      {filteredItems.length === 0 ? (
        // Empty State
        <div className="py-16 text-center text-[#a8baa3] space-y-3">
          <p className="text-sm">
            {lang === 'hi' ? 'इस फ़िल्टर में कोई चित्र उपलब्ध नहीं है।' : 'No pictures match the selected filter.'}
          </p>
          <button
            onClick={() => handleFilterChange('all')}
            className="text-xs text-camo-gold hover:underline"
          >
            {lang === 'hi' ? 'सभी चित्र देखें' : 'View all pictures'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
          {filteredItems.map((item) => {
            const prefix = lang === 'hi' ? t.picturePrefix.hi : t.picturePrefix.en;
            const pictureLabel = `${prefix} ${item.pictureNumber}`;

            const accessibleName = item.attempted
              ? `${pictureLabel}, score ${item.lastScore || 'attempted'}, last attempted ${item.lastAttemptedAt || ''}`
              : `${pictureLabel}, not attempted`;

            const blockHref = `/practice/${item.pictureNumber}`;

            return (
              <div
                key={item.pictureId}
                className="group relative flex flex-col justify-between rounded-2xl bg-[#131b12] border border-olive-700/80 hover:border-olive-500 hover:bg-[#182317] hover:-translate-y-0.5 transition-all duration-200 shadow-md overflow-hidden min-h-[135px] sm:min-h-[145px]"
              >
                {/* Main clickable area for the picture */}
                <Link
                  href={blockHref}
                  className="flex-1 flex flex-col items-center justify-center p-4 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-camo-gold rounded-t-2xl min-h-[85px]"
                  aria-label={accessibleName}
                >
                  <span className="font-serif font-bold text-lg sm:text-xl text-white group-hover:text-camo-gold transition-colors">
                    {pictureLabel}
                  </span>
                </Link>

                {/* Bottom Bar: ONLY for Attempted pictures */}
                {item.attempted && (
                  <div className="shrink-0 bg-[#0a1008] border-t border-olive-800/80 px-2.5 py-2 text-[11px] sm:text-xs text-[#cbd7c7]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      {/* Score */}
                      <div className="flex items-center gap-1 font-semibold text-white">
                        <span className="text-[#a8baa3] font-normal">{lang === 'hi' ? t.scoreLabel.hi : t.scoreLabel.en}:</span>
                        <span className="text-camo-gold">{item.lastScore}</span>
                      </div>

                      {/* Date */}
                      {item.lastAttemptedAt && (
                        <div className="text-[10px] sm:text-[11px] text-[#a8baa3] truncate" title={item.lastAttemptedAt}>
                          {item.lastAttemptedAt}
                        </div>
                      )}
                    </div>

                    {/* View Feedback direct link (Step 7) */}
                    {item.lastAttemptId && (
                      <div className="pt-1.5 mt-1 border-t border-olive-900/60 flex justify-end">
                        <Link
                          href={`/result?id=${item.lastAttemptId}`}
                          className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-olive-300 hover:text-white hover:underline"
                          title="View your most recent feedback"
                        >
                          <span>{lang === 'hi' ? t.viewFeedback.hi : t.viewFeedback.en}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
