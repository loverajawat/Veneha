'use client';

import React, { useState, useEffect } from 'react';
import { ArrowUp, ListFilter } from 'lucide-react';

export const EVALUATION_SECTIONS = [
  { id: 'part-1', title: '1. Picture Perception', short: '1. Perception' },
  { id: 'part-2', title: '2. Story Quality', short: '2. Story Quality' },
  { id: 'part-3', title: '3. SSB/OLQ Perspective', short: '3. OLQs' },
  { id: 'part-4', title: '4. Realism Check', short: '4. Realism' },
  { id: 'part-5', title: '5. PPDT Suitability', short: '5. Suitability' },
  { id: 'part-6', title: '6. What I Should Change', short: '6. Changes' },
  { id: 'part-7', title: '7. Final Assessment', short: '7. Scores & Verdict' },
  { id: 'part-8', title: '8. PPDT Discussion', short: '8. Discussion GD' },
] as const;

export default function EvaluationIndex() {
  const [activeId, setActiveId] = useState<string>('part-1');
  const [showMobileJump, setShowMobileJump] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Scroll spy to highlight active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 120;
      let current: string = EVALUATION_SECTIONS[0].id;

      for (const sec of EVALUATION_SECTIONS) {
        const el = document.getElementById(sec.id);
        if (el && el.offsetTop <= scrollPos) {
          current = sec.id;
        }
      }
      setActiveId(current);
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setShowMobileJump(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Desktop Sticky Sidebar Index (240px wide) */}
      <aside
        className="hidden lg:block w-[240px] shrink-0 sticky top-[84px] self-start space-y-2 py-1 print:hidden"
        aria-label="Table of contents"
      >
        <div className="p-3.5 rounded-xl bg-surface border border-hairline space-y-2.5">
          <span className="text-[11px] font-bold text-steel uppercase tracking-wider block">
            On this page
          </span>
          <nav className="flex flex-col space-y-1">
            {EVALUATION_SECTIONS.map((sec) => {
              const isActive = activeId === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollToSection(sec.id)}
                  className={`text-left px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors select-none cursor-pointer ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold border-l-2 border-primary -ml-[1px]'
                      : 'text-slate hover:bg-canvas hover:text-ink'
                  }`}
                >
                  {sec.title}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Jump Menu Bar (< 1024px) */}
      <div className="lg:hidden sticky top-[64px] z-30 bg-canvas/95 backdrop-blur-sm border-b border-hairline py-2 px-1 print:hidden">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMobileJump(!showMobileJump)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-hairline bg-surface text-xs font-semibold text-ink"
            aria-expanded={showMobileJump}
          >
            <span className="flex items-center gap-1.5">
              <ListFilter className="w-3.5 h-3.5 text-primary" />
              <span>Jump to Section:</span>
              <strong className="text-primary font-bold">
                {EVALUATION_SECTIONS.find((s) => s.id === activeId)?.short}
              </strong>
            </span>
            <span className="text-steel text-[11px]">Select ▾</span>
          </button>

          {showMobileJump && (
            <div className="absolute left-0 right-0 mt-1.5 p-2 rounded-xl bg-canvas border border-hairline shadow-level4 z-50 divide-y divide-hairline">
              {EVALUATION_SECTIONS.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollToSection(sec.id)}
                  className="w-full text-left py-2 px-3 text-xs font-medium text-charcoal hover:bg-surface rounded-md flex items-center justify-between"
                >
                  <span>{sec.title}</span>
                  {activeId === sec.id && <span className="text-primary font-bold text-xs">●</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 p-2.5 rounded-full bg-primary text-white shadow-level3 hover:bg-primary-pressed transition-all print:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary"
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </>
  );
}
