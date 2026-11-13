'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Play } from 'lucide-react';
import { getWatGridData, canAttemptWatToday, recordWatSetCompletion, WatGridItem } from '@/lib/watStorage';
import { getWatSetByNumber } from '@/data/watSets';
import { useLanguage } from '@/context/LanguageContext';
import { siteConfig } from '@/config/siteConfig';
import { PillTab, TagChip, Alert } from '@/components/ui';
import { WatTestFlasher } from '@/components/wat/WatTestFlasher';

const cardTints = [
  'bg-card-tint-peach',
  'bg-card-tint-rose',
  'bg-card-tint-mint',
  'bg-card-tint-lavender',
  'bg-card-tint-sky',
  'bg-card-tint-yellow',
];

function WatGridContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useLanguage();

  const [items, setItems] = useState<WatGridItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'not-attempted' | 'attempted'>('all');
  const [canAttempt, setCanAttempt] = useState(true);
  const [selectedSetNumber, setSelectedSetNumber] = useState<number | null>(null);

  const loadData = () => {
    try {
      const data = getWatGridData();
      setItems(data);
      setCanAttempt(canAttemptWatToday());
    } catch (err) {
      console.error('Failed to load WAT grid:', err);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('focus', loadData);
    window.addEventListener('storage', loadData);
    return () => {
      window.removeEventListener('focus', loadData);
      window.removeEventListener('storage', loadData);
    };
  }, []);

  // Check URL query param e.g. /wat?set=1
  useEffect(() => {
    const setParam = searchParams.get('set');
    if (setParam) {
      const num = parseInt(setParam, 10);
      if (num >= 1 && num <= 6) {
        setSelectedSetNumber(num);
      }
    }
  }, [searchParams]);

  const handleOpenSet = (setNumber: number) => {
    setSelectedSetNumber(setNumber);
    router.push(`/wat?set=${setNumber}`, { scroll: false });
  };

  const handleCloseFlasher = () => {
    setSelectedSetNumber(null);
    router.push('/wat', { scroll: false });
    loadData();
  };

  const handleCompleteSet = (setNumber: number) => {
    recordWatSetCompletion(setNumber);
    loadData();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('usage-updated'));
    }
  };

  const filteredItems = useMemo(() => {
    if (activeFilter === 'not-attempted') {
      return items.filter((item) => !item.attempted);
    }
    if (activeFilter === 'attempted') {
      return items.filter((item) => item.attempted);
    }
    return items;
  }, [items, activeFilter]);

  const totalCount = items.length || 6;
  const attemptedCount = items.filter((i) => i.attempted).length;
  const progressPercent = totalCount > 0 ? (attemptedCount / totalCount) * 100 : 0;
  const t = siteConfig.watGrid;

  const activeWatSet = selectedSetNumber ? getWatSetByNumber(selectedSetNumber) : null;

  return (
    <>
      {/* Active 15-Second Auto-Advancing Word Flasher Screen */}
      {activeWatSet && (
        <WatTestFlasher
          watSet={activeWatSet}
          onClose={handleCloseFlasher}
          onComplete={handleCompleteSet}
        />
      )}

      {/* Main Dashboard View */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full font-sans space-y-6 text-ink">
        {/* Breadcrumb + Header */}
        <div className="space-y-2 border-b border-hairline pb-5">
          <nav className="text-[13px] text-steel" aria-label="Breadcrumb">
            <Link href="/" className="text-link-blue hover:underline">
              Home
            </Link>
            <span className="mx-2 text-hairline-strong">/</span>
            <span className="text-charcoal font-medium">WAT Practice</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
            <div>
              <h1 className="text-[32px] md:text-[36px] font-semibold text-ink tracking-tight">
                {lang === 'hi' ? t.title.hi : t.title.en}
              </h1>
              <p className="mt-1 text-[15px] text-slate max-w-2xl">
                {lang === 'hi' ? t.subtitle.hi : t.subtitle.en}
              </p>
            </div>
          </div>

          {/* Progress Bar ("X of 6 attempted" and percentage) */}
          <div className="pt-4 space-y-1.5">
            <div className="flex items-center justify-between text-[13px]">
              <span className="font-semibold text-ink">
                {lang === 'hi'
                  ? `${totalCount} में से ${attemptedCount} सेट पूरे किए`
                  : `${attemptedCount} of ${totalCount} attempted`}
              </span>
              <span className="text-steel font-medium">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full bg-hairline h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {!canAttempt && (
          <Alert type="warning" title="Daily Quota Exhausted">
            {lang === 'hi' ? t.dailyLimitMessage.hi : t.dailyLimitMessage.en}
          </Alert>
        )}

        {/* Filter Tabs using PillTab */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1" role="tablist">
          <PillTab active={activeFilter === 'all'} onClick={() => setActiveFilter('all')}>
            {lang === 'hi' ? t.all.hi : t.all.en} ({items.length || 6})
          </PillTab>
          <PillTab
            active={activeFilter === 'not-attempted'}
            onClick={() => setActiveFilter('not-attempted')}
          >
            {lang === 'hi' ? t.notAttempted.hi : t.notAttempted.en} ({items.filter((i) => !i.attempted).length})
          </PillTab>
          <PillTab active={activeFilter === 'attempted'} onClick={() => setActiveFilter('attempted')}>
            {lang === 'hi' ? t.attempted.hi : t.attempted.en} ({attemptedCount})
          </PillTab>
        </div>

        {/* Sets Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredItems.map((item) => {
            const prefix = lang === 'hi' ? t.setPrefix.hi : t.setPrefix.en;
            const setLabel = `${prefix} ${item.setNumber}`;
            const tintClass = cardTints[(item.setNumber - 1) % cardTints.length];

            return (
              <div
                key={item.setNumber}
                role="button"
                tabIndex={0}
                onClick={() => handleOpenSet(item.setNumber)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpenSet(item.setNumber);
                  }
                }}
                className={`group flex flex-col justify-between rounded-lg border border-hairline hover:border-hairline-strong hover:shadow-level2 transition-all overflow-hidden min-h-[140px] cursor-pointer text-left select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${tintClass}`}
              >
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[20px] text-charcoal group-hover:text-ink transition-colors">
                        {setLabel}
                      </span>
                      <span className="text-xs text-steel font-mono">
                        60 words
                      </span>
                    </div>
                    <p className="text-xs text-slate mt-1">15 seconds per word</p>
                  </div>

                  <div className="pt-3 flex items-center justify-between gap-2 min-h-[26px]">
                    <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current shrink-0" />
                      <span>Start Practice &rarr;</span>
                    </span>
                    {item.attempted && (
                      <TagChip color="green" className="shrink-0 whitespace-nowrap">
                        Attempted
                      </TagChip>
                    )}
                  </div>
                </div>

                {item.attempted && (
                  <div className="bg-canvas border-t border-hairline px-3.5 py-2 text-[12px] flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <span className="text-slate font-normal">Status:</span>
                      <TagChip color="purple">{item.lastScore || 'Completed'}</TagChip>
                    </div>
                    {item.lastAttemptedAt && (
                      <span className="text-[11px] text-steel">{item.lastAttemptedAt}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default function WatGridPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center p-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>}>
      <WatGridContent />
    </Suspense>
  );
}
