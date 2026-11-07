'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dices, AlertTriangle, ExternalLink, HelpCircle } from 'lucide-react';
import { getPictureGridData, PictureGridItem, canAttemptToday } from '@/lib/guestStorage';
import { getActivePictures } from '@/data/pictures';
import { useLanguage } from '@/context/LanguageContext';
import { siteConfig } from '@/config/siteConfig';
import { 
  Button, 
  PillTab, 
  TagChip, 
  AccordionItem, 
  Alert 
} from '@/components/ui';

// Cycle pastel card tints purely decoratively: peach, rose, mint, lavender, sky, yellow
const cardTints = [
  'bg-card-tint-peach',
  'bg-card-tint-rose',
  'bg-card-tint-mint',
  'bg-card-tint-lavender',
  'bg-card-tint-sky',
  'bg-card-tint-yellow',
];

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
  const [canAttempt, setCanAttempt] = useState(true);

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
    if (typeof window !== 'undefined') {
      const sp = new URLSearchParams(window.location.search);
      const f = sp.get('filter');
      if (f === 'not-attempted' || f === 'attempted' || f === 'all') {
        setActiveFilter(f);
      }
    }
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

  const filteredItems = useMemo(() => {
    if (activeFilter === 'not-attempted') {
      return items.filter((item) => !item.attempted);
    }
    if (activeFilter === 'attempted') {
      return items.filter((item) => item.attempted);
    }
    return items;
  }, [items, activeFilter]);

  const totalCount = items.length;
  const attemptedCount = items.filter((i) => i.attempted).length;
  const progressPercent = totalCount > 0 ? (attemptedCount / totalCount) * 100 : 0;

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
    <div className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full font-sans space-y-6 text-ink">
      {/* 1. Breadcrumb + Page Header */}
      <div className="space-y-2 border-b border-hairline pb-5">
        <nav className="text-[13px] text-steel" aria-label="Breadcrumb">
          <Link href="/" className="text-link-blue hover:underline">
            Home
          </Link>
          <span className="mx-2 text-hairline-strong">/</span>
          <span className="text-charcoal font-medium">PPDT Practice</span>
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

          {/* Random Picture Action Button */}
          <Button
            type="button"
            variant="secondary"
            onClick={handleRandomPicture}
            disabled={!canAttempt && attemptedCount === totalCount}
            className="shrink-0"
          >
            <Dices className="w-4 h-4 mr-2 text-primary" />
            <span>{lang === 'hi' ? t.randomPicture.hi : t.randomPicture.en}</span>
          </Button>
        </div>

        {/* Progress Line with Thin Bar (Primary fill on hairline track) */}
        <div className="pt-4 space-y-1.5">
          <div className="flex items-center justify-between text-[13px]">
            <span className="font-semibold text-ink">
              {lang === 'hi'
                ? `${totalCount} में से ${attemptedCount} चित्र पूरे किए`
                : `${attemptedCount} of ${totalCount} attempted`}
            </span>
            <span className="text-steel font-medium">
              {Math.round(progressPercent)}%
            </span>
          </div>
          <div className="w-full bg-hairline h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Daily limit reached banner if quota exhausted */}
      {!canAttempt && (
        <Alert type="warning" title="Daily Quota Exhausted">
          {lang === 'hi' ? t.dailyLimitMessage.hi : t.dailyLimitMessage.en}
        </Alert>
      )}

      {/* 2. Filter Pills + How It Works Accordion */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1" role="tablist">
          <PillTab active={activeFilter === 'all'} onClick={() => handleFilterChange('all')}>
            {lang === 'hi' ? t.all.hi : t.all.en} ({items.length})
          </PillTab>
          <PillTab
            active={activeFilter === 'not-attempted'}
            onClick={() => handleFilterChange('not-attempted')}
          >
            {lang === 'hi' ? t.notAttempted.hi : t.notAttempted.en} ({items.filter((i) => !i.attempted).length})
          </PillTab>
          <PillTab active={activeFilter === 'attempted'} onClick={() => handleFilterChange('attempted')}>
            {lang === 'hi' ? t.attempted.hi : t.attempted.en} ({attemptedCount})
          </PillTab>
        </div>
      </div>

      {/* How it works Accordion Item */}
      <AccordionItem question="How PPDT timed practice works">
        <div className="space-y-2 text-[14px] text-charcoal">
          {(lang === 'hi' ? t.howItWorksSteps.hi : t.howItWorksSteps.en).map((stepText, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
              <span>{stepText}</span>
            </div>
          ))}
        </div>
      </AccordionItem>

      {/* 3. The Grid of Picture Blocks */}
      {filteredItems.length === 0 ? (
        <div className="py-16 text-center text-slate space-y-3 bg-surface rounded-lg border border-hairline">
          <p className="text-[15px]">
            {lang === 'hi' ? 'इस फ़िल्टर में कोई चित्र उपलब्ध नहीं है।' : 'No pictures match the selected filter.'}
          </p>
          <Button variant="link" onClick={() => handleFilterChange('all')}>
            {lang === 'hi' ? 'सभी चित्र देखें' : 'View all pictures'}
          </Button>
        </div>
      ) : (
        <div
          className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 ${
            !canAttempt ? 'opacity-70' : ''
          }`}
        >
          {filteredItems.map((item, idx) => {
            const prefix = lang === 'hi' ? t.picturePrefix.hi : t.picturePrefix.en;
            const pictureLabel = `${prefix} ${item.pictureNumber}`;

            const accessibleName = item.attempted
              ? `${pictureLabel}, score ${item.lastScore || 'attempted'}, last attempted ${item.lastAttemptedAt || ''}`
              : `${pictureLabel}, not attempted`;

            const blockHref = `/practice/${item.pictureNumber}`;
            const tintClass = cardTints[(item.pictureNumber - 1) % cardTints.length];

            return (
              <div
                key={item.pictureId}
                className={`group relative flex flex-col justify-between rounded-lg border border-hairline hover:shadow-level1 transition-all duration-150 overflow-hidden min-h-[140px] ${tintClass}`}
              >
                {/* Main clickable area for the picture */}
                <Link
                  href={blockHref}
                  className="flex-1 flex flex-col items-center justify-center p-5 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-t-lg min-h-[90px]"
                  aria-label={accessibleName}
                >
                  <span className="font-semibold text-[20px] text-charcoal group-hover:text-ink transition-colors">
                    {pictureLabel}
                  </span>
                </Link>

                {/* Bottom Bar: ONLY for Attempted pictures (attached with hairline top border) */}
                {item.attempted && (
                  <div className="shrink-0 bg-canvas border-t border-hairline px-3 py-2 text-[12px] text-charcoal">
                    <div className="flex items-center justify-between gap-1">
                      {/* Left: Score as tag chip */}
                      <div className="flex items-center gap-1 font-semibold">
                        <span className="text-slate font-normal">Score:</span>
                        <TagChip color="purple">{item.lastScore}</TagChip>
                      </div>

                      {/* Right: Last attempted date */}
                      {item.lastAttemptedAt && (
                        <div className="text-[11px] text-steel truncate" title={item.lastAttemptedAt}>
                          {item.lastAttemptedAt}
                        </div>
                      )}
                    </div>

                    {/* Feedback Link */}
                    {item.lastAttemptId && (
                      <div className="pt-1.5 mt-1 border-t border-hairline-soft flex justify-end">
                        <Link
                          href={`/result?id=${item.lastAttemptId}`}
                          className="inline-flex items-center gap-1 text-[11px] text-link-blue hover:underline font-semibold"
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
