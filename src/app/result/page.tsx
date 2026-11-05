'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  RotateCcw, 
  History, 
  BookOpen, 
  Mic, 
  Users, 
  FileText,
  Lightbulb,
  ShieldAlert
} from 'lucide-react';
import OLQBadge from '@/components/OLQBadge';
import { PPDTPicture } from '@/data/pictures';
import { getPictureGridData } from '@/lib/guestStorage';

export default function ResultPage() {
  const router = useRouter();

  const [feedback, setFeedback] = useState<any>(null);
  const [picture, setPicture] = useState<PPDTPicture | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'modelStory' | 'gdCoach'>('overview');

  useEffect(() => {
    const rawPic = sessionStorage.getItem('current_ppdt_picture');
    if (rawPic) {
      try {
        setPicture(JSON.parse(rawPic));
      } catch {}
    }

    const rawFeedback = sessionStorage.getItem('current_assessment_result');
    if (rawFeedback) {
      try {
        setFeedback(JSON.parse(rawFeedback));
      } catch {}
    }
  }, []);

  if (!feedback) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 rounded-2xl bg-olive-800 flex items-center justify-center text-camo-gold mb-4 animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-white">Loading Psychological Assessment...</h2>
        <p className="text-xs text-gray-400 mt-1 mb-4">
          Please wait while the assessor feedback renders.
        </p>
        <Link
          href="/practice"
          className="px-4 py-2 rounded-xl bg-olive-600 text-white text-xs font-semibold"
        >
          Return to Practice
        </Link>
      </div>
    );
  }

  const {
    summaryRating,
    timelineCheck,
    fourDs,
    olqsDemonstrated,
    olqsMissingOrWeak,
    languageAndCraft,
    pictureRelevance,
    modelStory,
    narrationAndGdCoach,
    threeActionableFixes,
  } = feedback;

  return (
    <div className="flex-1 flex flex-col max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full space-y-6 animate-fade-in">
      {/* Top Disclaimer Banner */}
      <div className="p-3.5 rounded-2xl bg-olive-950/90 border border-olive-700/80 text-xs sm:text-sm text-gray-300 flex items-center gap-2.5 shadow-sm">
        <ShieldAlert className="w-4 h-4 text-camo-gold shrink-0" />
        <span>
          <strong>Notice: </strong>Feedback is AI-generated practice guidance. It is not an official assessment or a prediction of selection.
        </span>
      </div>

      {/* Top Banner: Score & Verdict */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#152014] via-[#111910] to-[#0a1009] border border-olive-700/80 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-olive-950/90 border border-olive-700 text-camo-gold text-xs font-semibold mb-3">
              <Award className="w-3.5 h-3.5" />
              <span>AI PPDT Assessment Analysis</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-extrabold text-white">
              {summaryRating?.verdictBadge || 'Assessment Evaluation Complete'}
            </h1>
            <p className="mt-2 text-base text-gray-200 max-w-2xl leading-relaxed">
              {summaryRating?.headline || 'Your story has been evaluated against practice criteria.'}
            </p>
          </div>

          {/* Big Score Dial */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-[#090f08]/90 border border-olive-700/80 shadow-inner shrink-0 self-start md:self-auto min-w-[130px]">
            <span className="text-[10px] uppercase font-bold text-olive-400 tracking-wider">
              Assessor Score
            </span>
            <div className="text-4xl font-mono font-black text-camo-gold mt-0.5">
              {summaryRating?.overallScore || '7.5'}
              <span className="text-sm font-normal text-gray-500">/10</span>
            </div>
            <span className="text-[10px] text-gray-400 mt-1 font-semibold">
              {summaryRating?.overallScore >= 7.0 ? 'Recommended Tier' : 'Needs Practice'}
            </span>
          </div>
        </div>

        {/* Disclaimer Bar */}
        <div className="mt-6 pt-4 border-t border-olive-800/80 flex items-center gap-2 text-[11px] text-gray-400">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>Practice Guidance Only: </strong>
            This evaluation is a structured training aid to build Officer-Like Qualities and is never an official Services Selection Board selection prediction.
          </span>
        </div>
      </div>

      {/* Secondary Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-olive-800/80 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'overview'
              ? 'bg-olive-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-olive-950'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Detailed Assessment</span>
        </button>
        <button
          onClick={() => setActiveTab('modelStory')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'modelStory'
              ? 'bg-olive-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-olive-950'
          }`}
        >
          <Sparkles className="w-4 h-4 text-camo-gold" />
          <span>Elevated Model Story</span>
        </button>
        <button
          onClick={() => setActiveTab('gdCoach')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 shrink-0 ${
            activeTab === 'gdCoach'
              ? 'bg-olive-600 text-white shadow-md'
              : 'text-gray-400 hover:text-white hover:bg-olive-950'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>1-Min Narration & GD Coaching</span>
        </button>
      </div>

      {/* TAB 1: DETAILED ASSESSMENT OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Section 1: The 10-75-15 Rule Analysis */}
          <div className="p-6 rounded-3xl bg-[#121911] border border-olive-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-camo-gold" />
                <span>The 10-75-15 Timeline Architecture</span>
              </h3>
              <span className="text-xs text-olive-300 font-semibold">Ratio Check</span>
            </div>

            {/* Ratio Visualizer */}
            <div className="space-y-1.5">
              <div className="w-full h-4 rounded-full overflow-hidden bg-[#090f08] border border-olive-800 flex text-[10px] font-bold text-white text-center leading-4">
                <div
                  style={{ width: `${timelineCheck?.setupPercent || 15}%` }}
                  className="bg-amber-600/90"
                  title="Setup"
                >
                  Setup {timelineCheck?.setupPercent || 15}%
                </div>
                <div
                  style={{ width: `${timelineCheck?.actionPercent || 70}%` }}
                  className="bg-emerald-600/90"
                  title="Action"
                >
                  Action {timelineCheck?.actionPercent || 70}%
                </div>
                <div
                  style={{ width: `${timelineCheck?.resolutionPercent || 15}%` }}
                  className="bg-blue-600/90"
                  title="Resolution"
                >
                  End {timelineCheck?.resolutionPercent || 15}%
                </div>
              </div>

              <div className="flex justify-between text-[11px] text-gray-400 px-1">
                <span>Setup: ~10% (1 sentence)</span>
                <span>Action: ~75% (5-7 sentences)</span>
                <span>Resolution: ~15% (1-2 sentences)</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed bg-[#0a0f09] p-3.5 rounded-2xl border border-olive-900">
              {timelineCheck?.assessment || 'Timeline architecture analyzed.'}
            </p>
          </div>

          {/* Section 2: The 4 D's of Positive Action */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="font-heading font-bold text-lg text-white">
                The 4 D's of Officer-Like Action
              </h3>
              <span className="text-xs text-gray-400">Aim for at least 2 demonstrated</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Direct Action */}
              <div className="p-4 rounded-2xl bg-[#111710] border border-olive-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white flex items-center gap-1.5">
                    {fourDs?.directAction?.present ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-500" />
                    )}
                    Direct Action
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      fourDs?.directAction?.present
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-gray-900 text-gray-400'
                    }`}
                  >
                    {fourDs?.directAction?.present ? 'Demonstrated' : 'Missing'}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {fourDs?.directAction?.feedback}
                </p>
                {fourDs?.directAction?.evidence && (
                  <div className="text-[11px] text-olive-300 italic bg-[#0a0f09] p-2 rounded-lg border border-olive-900">
                    "{fourDs?.directAction?.evidence}"
                  </div>
                )}
              </div>

              {/* Decision */}
              <div className="p-4 rounded-2xl bg-[#111710] border border-olive-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white flex items-center gap-1.5">
                    {fourDs?.decision?.present ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-500" />
                    )}
                    Decision
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      fourDs?.decision?.present
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-gray-900 text-gray-400'
                    }`}
                  >
                    {fourDs?.decision?.present ? 'Demonstrated' : 'Missing'}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {fourDs?.decision?.feedback}
                </p>
                {fourDs?.decision?.evidence && (
                  <div className="text-[11px] text-olive-300 italic bg-[#0a0f09] p-2 rounded-lg border border-olive-900">
                    "{fourDs?.decision?.evidence}"
                  </div>
                )}
              </div>

              {/* Delegation */}
              <div className="p-4 rounded-2xl bg-[#111710] border border-olive-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white flex items-center gap-1.5">
                    {fourDs?.delegation?.present ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-500" />
                    )}
                    Delegation
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      fourDs?.delegation?.present
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-gray-900 text-gray-400'
                    }`}
                  >
                    {fourDs?.delegation?.present ? 'Demonstrated' : 'Missing'}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {fourDs?.delegation?.feedback}
                </p>
                {fourDs?.delegation?.evidence && (
                  <div className="text-[11px] text-olive-300 italic bg-[#0a0f09] p-2 rounded-lg border border-olive-900">
                    "{fourDs?.delegation?.evidence}"
                  </div>
                )}
              </div>

              {/* Deployment */}
              <div className="p-4 rounded-2xl bg-[#111710] border border-olive-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white flex items-center gap-1.5">
                    {fourDs?.deployment?.present ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-500" />
                    )}
                    Deployment
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      fourDs?.deployment?.present
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-gray-900 text-gray-400'
                    }`}
                  >
                    {fourDs?.deployment?.present ? 'Demonstrated' : 'Missing'}
                  </span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {fourDs?.deployment?.feedback}
                </p>
                {fourDs?.deployment?.evidence && (
                  <div className="text-[11px] text-olive-300 italic bg-[#0a0f09] p-2 rounded-lg border border-olive-900">
                    "{fourDs?.deployment?.evidence}"
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Demonstrated Officer Like Qualities */}
          <div className="p-6 rounded-3xl bg-[#121911] border border-olive-800 shadow-xl space-y-4">
            <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-camo-gold" />
              <span>Demonstrated Officer Like Qualities (OLQs)</span>
            </h3>

            <div className="space-y-3">
              {olqsDemonstrated && olqsDemonstrated.length > 0 ? (
                olqsDemonstrated.map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#0b1009] border border-olive-900 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <OLQBadge name={item.olqName} factor={item.factor} showFactor={true} />
                    </div>
                    {item.verbatimQuote && (
                      <p className="text-xs text-olive-200 italic pl-3 border-l-2 border-camo-gold">
                        "{item.verbatimQuote}"
                      </p>
                    )}
                    <p className="text-xs text-gray-300 leading-relaxed">{item.assessorRemark}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400">No explicit OLQs detected in this draft.</p>
              )}
            </div>
          </div>

          {/* Section 4: Three High-Impact Fixes */}
          {threeActionableFixes && threeActionableFixes.length > 0 && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-olive-950 via-[#121911] to-[#0a1009] border border-olive-700/80 shadow-xl space-y-3">
              <h3 className="font-heading font-bold text-lg text-white flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-camo-gold" />
                <span>3 Tactical Fixes for Your Next Story</span>
              </h3>
              <div className="space-y-2">
                {threeActionableFixes.map((fix: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-[#090f08] border border-olive-800 text-xs text-gray-200"
                  >
                    <span className="w-5 h-5 rounded-full bg-olive-700 text-camo-gold font-bold flex items-center justify-center shrink-0 text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{fix}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ELEVATED MODEL STORY */}
      {activeTab === 'modelStory' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#121911] border border-olive-800 shadow-xl space-y-6">
          <div className="border-b border-olive-800/80 pb-4">
            <span className="text-xs font-bold text-camo-gold uppercase tracking-wider block">
              Practice Recommendation Benchmark
            </span>
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white mt-1">
              {modelStory?.title || 'Elevated Model Story'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Preserves your original characters and theme, elevated with active verbs, realistic authority, and 4 D's.
            </p>
          </div>

          {/* Story text */}
          <div className="p-5 rounded-2xl bg-[#090f08] border border-olive-700/80 text-sm sm:text-base text-gray-100 leading-relaxed font-sans shadow-inner">
            {modelStory?.story}
          </div>

          {/* Why this works */}
          <div className="p-4 rounded-2xl bg-olive-950/80 border border-olive-900 text-xs text-olive-200 space-y-1">
            <strong className="text-camo-gold block font-semibold">Assessor's Analysis:</strong>
            <p className="leading-relaxed">{modelStory?.whyThisWorks}</p>
          </div>
        </div>
      )}

      {/* TAB 3: NARRATION & GD COACH */}
      {activeTab === 'gdCoach' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[#121911] border border-olive-800 shadow-xl space-y-6">
          <div className="border-b border-olive-800/80 pb-4">
            <span className="text-xs font-bold text-camo-gold uppercase tracking-wider block">
              PPDT Defense Coaching
            </span>
            <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-white mt-1">
              Individual Narration & Group Discussion Strategy
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1-Minute Narration */}
            <div className="p-5 rounded-2xl bg-[#0d130c] border border-olive-800/90 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-olive-800/80 flex items-center justify-center text-camo-gold">
                  <Mic className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-white">1-Minute Narration Drill</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {narrationAndGdCoach?.oneMinuteNarrationTip ||
                  'Speak firmly at a measured tempo for 50-55 seconds. Look across the group, not at the assessors.'}
              </p>
              <div className="p-3 rounded-xl bg-olive-950 border border-olive-900 text-[11px] text-olive-300">
                <strong>Assessor Rule: </strong> Never restart your story if you stumble. Pause for 1 second, smile, and continue calmly.
              </div>
            </div>

            {/* GD Consensus */}
            <div className="p-5 rounded-2xl bg-[#0d130c] border border-olive-800/90 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-olive-800/80 flex items-center justify-center text-camo-gold">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-base text-white">Group Discussion Strategy</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                {narrationAndGdCoach?.gdConsensusStrategy ||
                  'In the GD, support others by Chest Number and steer towards one unified story rather than arguing.'}
              </p>
              <div className="p-3 rounded-xl bg-olive-950 border border-olive-900 text-[11px] text-olive-300">
                <strong>Assessor Rule: </strong> Don't participate in fish-market screaming. Speak 2-3 logical points that unite the group.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Actions (Step 7: Back to pictures + Try another picture) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-olive-800/80">
        <Link
          href="/history"
          className="text-xs font-semibold text-gray-400 hover:text-white flex items-center gap-1.5 transition-colors"
        >
          <History className="w-4 h-4 text-olive-400" />
          <span>View Past Attempts & Scores</span>
        </Link>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Link
            href="/practice"
            className="px-5 py-2.5 rounded-xl bg-[#111710] border border-olive-700 text-xs font-semibold text-gray-200 hover:text-white hover:bg-olive-950 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to pictures</span>
          </Link>

          <button
            onClick={() => {
              try {
                const grid = getPictureGridData();
                const unattempted = grid.filter((g) => !g.attempted);
                const pool = unattempted.length > 0 ? unattempted : grid;
                if (pool.length > 0) {
                  const choice = pool[Math.floor(Math.random() * pool.length)];
                  router.push(`/practice/${choice.pictureNumber}`);
                  return;
                }
              } catch {}
              router.push('/practice');
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-olive-600 to-olive-500 hover:from-olive-500 hover:to-olive-400 text-white font-bold text-xs sm:text-sm shadow-xl shadow-olive-950/60 transition-all flex items-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4 text-camo-gold" />
            <span>Try another picture</span>
          </button>
        </div>
      </div>
    </div>
  );
}

