'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldAlert, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { PPDTPicture } from '@/data/pictures';
import { Button } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { EvaluationDoc } from '@/lib/assessor/types';
import { readAnyEvaluation } from '@/lib/assessor/validator';
import { 
  ScoreBand, 
  StoryPanel, 
  EvaluationIndex, 
  CopyEvaluationActions, 
  EvaluationDocument 
} from '@/components/evaluation';

export default function ResultPage() {
  const { lang } = useLanguage();

  const [evaluationDoc, setEvaluationDoc] = useState<EvaluationDoc | null>(null);
  const [picture, setPicture] = useState<PPDTPicture | null>(null);
  const [confirmedStory, setConfirmedStory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const rawPic = sessionStorage.getItem('current_ppdt_picture');
      if (rawPic) {
        try {
          setPicture(JSON.parse(rawPic));
        } catch {}
      }

      const rawTranscript = sessionStorage.getItem('current_story_transcript');
      if (rawTranscript) {
        setConfirmedStory(rawTranscript);
      }

      const rawFeedback = sessionStorage.getItem('current_assessment_result');
      if (rawFeedback) {
        const parsed = JSON.parse(rawFeedback);
        const adapted = readAnyEvaluation(parsed, rawTranscript || '');
        setEvaluationDoc(adapted);
      } else {
        setError('No evaluation record found. Please practice a picture to generate an assessment.');
      }
    } catch (err: any) {
      console.error('Error loading evaluation result:', err);
      setError(err.message || 'Failed to load evaluation record.');
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto my-16">
        <div className="w-12 h-12 rounded-xl bg-surface border border-hairline flex items-center justify-center text-primary mb-4 animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-ink">Loading Assessor Evaluation...</h2>
        <p className="text-xs text-slate mt-1 mb-6">
          Formatting your unified PPDT report and verifying quotes...
        </p>
      </div>
    );
  }

  if (error || !evaluationDoc) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto my-16 space-y-4">
        <div className="w-12 h-12 rounded-xl bg-card-tint-peach/50 border border-hairline flex items-center justify-center text-rose-600">
          <RefreshCw className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-ink">No Evaluation Found</h2>
        <p className="text-xs text-slate">
          {error || 'If you refreshed the page without completing an assessment, please return to practice.'}
        </p>
        <div className="flex items-center gap-2 pt-2">
          <Link href="/practice">
            <Button variant="primary" className="text-xs py-2 px-4 flex items-center gap-1.5">
              <span>Return to Practice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full space-y-8 text-ink font-sans">
      
      {/* 1. Header & Actions */}
      <header className="space-y-4 print:space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/practice"
              className="text-xs text-steel hover:text-ink flex items-center gap-1 font-medium transition-colors print:hidden"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Pictures</span>
            </Link>
            <span className="text-hairline-strong hidden sm:inline print:hidden">/</span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
              PPDT evaluation
            </h1>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <CopyEvaluationActions doc={evaluationDoc} pictureTitle={picture?.title} />
            <Link href="/practice" className="print:hidden">
              <Button variant="primary" className="text-xs py-1.5 px-3 flex items-center gap-1 cursor-pointer">
                <span>Try Another Picture</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Collapsible My Story Panel */}
        <StoryPanel confirmedStory={confirmedStory} picture={picture} />

        {/* Strict Assessor Disclaimer */}
        <div className="p-3.5 rounded-xl bg-surface border border-hairline text-xs text-slate flex items-start gap-2.5 print:hidden">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-charcoal font-semibold">Strict Assessor Disclaimer: </strong>
            AI practice feedback, strict by design. It is not an official assessment, and a single story cannot prove any quality. Gemini can make mistakes.
          </p>
        </div>
      </header>

      {/* 2. At-a-Glance Band (Compact) */}
      <ScoreBand
        scores={evaluationDoc.scores}
        verdict={evaluationDoc.suitability.verdict}
      />

      {/* 3. Main Reading Area (Desktop: 2 columns; Mobile: 1 column with jump bar) */}
      <div className="flex flex-col lg:flex-row gap-8 items-start relative">
        {/* Sticky Sidebar Index & Mobile Jump Menu */}
        <EvaluationIndex />

        {/* Continuous 8-Part Evaluation Document (~760px wide) */}
        <main className="flex-1 w-full min-w-0">
          <EvaluationDocument doc={evaluationDoc} />
        </main>
      </div>

      {/* 4. Bottom Footer Navigation */}
      <footer className="flex items-center justify-between pt-6 border-t border-hairline print:hidden">
        <Link href="/practice">
          <Button variant="secondary" className="text-xs py-2 px-4 flex items-center gap-1.5">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Pictures</span>
          </Button>
        </Link>

        <Link href="/practice">
          <Button variant="primary" className="text-xs py-2 px-4 flex items-center gap-1.5">
            <span>Try Another Picture</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </footer>

    </div>
  );
}
