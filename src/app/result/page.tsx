'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Award, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  RotateCcw, 
  BookOpen, 
  Mic, 
  Users, 
  FileText,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Quote,
  Target,
  AlertCircle
} from 'lucide-react';
import { PPDTPicture } from '@/data/pictures';
import { Button, CardBase, TagChip, PillTab } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { PpdtAssessment } from '@/lib/assessor/types';

export default function ResultPage() {
  const router = useRouter();
  const { lang } = useLanguage();

  const [assessment, setAssessment] = useState<PpdtAssessment | null>(null);
  const [picture, setPicture] = useState<PPDTPicture | null>(null);
  const [confirmedStory, setConfirmedStory] = useState('');
  const [isStoryExpanded, setIsStoryExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed' | 'improve' | 'discussion'>('overview');
  const [copiedText, setCopiedText] = useState(false);

  // Accordion open states for Detailed tab
  const [openAccordions, setOpenAccordions] = useState<{ [key: string]: boolean }>({
    picture: true,
    storyQuality: true,
    olq: true,
    realism: true,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
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
      try {
        setAssessment(JSON.parse(rawFeedback));
      } catch {}
    }
  }, []);

  const handleCopyFeedback = () => {
    if (!assessment) return;
    const text = `VENEHA PPDT ASSESSMENT REPORT
Overall Score: ${assessment.final_assessment?.overall_score || 0}/10
Verdict: ${assessment.ppdt_suitability?.verdict || 'Average'}

ASSESSOR VERDICT:
${assessment.final_assessment?.verdict || ''}

SUB-SCORES:
- Picture Perception: ${assessment.final_assessment?.picture_perception || 0}/10
- Story: ${assessment.final_assessment?.story || 0}/10
- Realism: ${assessment.final_assessment?.realism || 0}/10
- Protagonist & Action: ${assessment.final_assessment?.protagonist_action || 0}/10
- Narration Suitability: ${assessment.final_assessment?.narration_suitability || 0}/10
`;
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  if (!assessment) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto my-12">
        <div className="w-12 h-12 rounded-xl bg-surface border border-hairline flex items-center justify-center text-primary mb-4 animate-pulse">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-ink">Loading Assessor Evaluation...</h2>
        <p className="text-xs text-slate mt-1 mb-6">
          If you refreshed the page without completing an assessment, please return to practice.
        </p>
        <Link
          href="/practice"
          className="px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-pressed transition-colors"
        >
          Return to Practice Grid
        </Link>
      </div>
    );
  }

  const {
    picture_perception,
    story_quality,
    olq_perspective = [],
    realism_check = [],
    ppdt_suitability,
    what_to_change,
    final_assessment,
    improved_story,
    discussion,
    assessment_meta
  } = assessment;

  const verdict = ppdt_suitability?.verdict || 'Average';
  let verdictColor: 'green' | 'yellow' | 'red' = 'yellow';
  if (verdict === 'Strong') verdictColor = 'green';
  if (verdict === 'Weak') verdictColor = 'red';

  const subScores = [
    { label: 'Picture Perception', score: final_assessment?.picture_perception ?? 5 },
    { label: 'Story Quality', score: final_assessment?.story ?? 5 },
    { label: 'Realism', score: final_assessment?.realism ?? 5 },
    { label: 'Protagonist & Action', score: final_assessment?.protagonist_action ?? 5 },
    { label: 'Narration Suitability', score: final_assessment?.narration_suitability ?? 5 },
  ];

  return (
    <div className="flex-1 flex flex-col max-w-5xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6 text-ink font-sans">
      
      {/* 1. Header & Strict Disclaimer */}
      <div className="space-y-3">
        <div className="p-3.5 rounded-lg bg-surface border border-hairline text-xs text-slate flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-charcoal font-semibold">Strict Assessor Disclaimer: </strong>
            AI practice feedback, strict by design. It is not an official assessment, and a single story cannot prove any quality. Gemini can make mistakes.
          </p>
        </div>

        {/* Collapsible Story Panel */}
        {confirmedStory && (
          <div className="rounded-xl border border-hairline bg-surface overflow-hidden">
            <button
              type="button"
              onClick={() => setIsStoryExpanded(!isStoryExpanded)}
              className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-canvas transition-colors"
            >
              <div className="flex items-center gap-3">
                {picture && (
                  <img
                    src={picture.path}
                    alt={picture.title}
                    className="w-10 h-8 object-cover rounded border border-hairline shrink-0"
                  />
                )}
                <div className="text-xs">
                  <span className="font-semibold text-charcoal block">
                    {picture?.title || 'Your Submitted Story'}
                  </span>
                  <span className="text-steel text-[11px]">
                    {confirmedStory.split(/\s+/).filter(Boolean).length} words · Click to {isStoryExpanded ? 'collapse' : 'view original'}
                  </span>
                </div>
              </div>
              <span className="text-slate p-1">
                {isStoryExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>

            {isStoryExpanded && (
              <div className="px-4 py-3 border-t border-hairline bg-canvas/60 text-xs text-charcoal font-sans leading-relaxed whitespace-pre-wrap">
                {confirmedStory}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Top Banner: Score & Assessor Verdict */}
      <div className="p-6 rounded-2xl bg-surface border border-hairline shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold text-steel uppercase tracking-wider">
                SSB PPDT Evaluation
              </span>
              <TagChip color={verdictColor}>
                {verdict} PPDT Suitability
              </TagChip>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink flex items-baseline gap-2">
              <span>{final_assessment?.overall_score?.toFixed(1) ?? '5.0'}</span>
              <span className="text-base text-slate font-normal">/ 10</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="secondary"
              onClick={handleCopyFeedback}
              className="text-xs py-1.5 px-3 flex items-center gap-1.5"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'Copied' : 'Copy Feedback'}</span>
            </Button>
            <Link href="/practice">
              <Button variant="primary" className="text-xs py-1.5 px-3 flex items-center gap-1">
                <span>Try Another Picture</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Five Sub-scores in a Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          {subScores.map((sub) => {
            const pct = Math.min(100, (sub.score / 10) * 100);
            return (
              <div key={sub.label} className="p-3 rounded-lg bg-canvas border border-hairline space-y-1.5">
                <span className="text-[11px] text-slate font-medium block truncate" title={sub.label}>
                  {sub.label}
                </span>
                <div className="flex items-baseline justify-between text-xs">
                  <strong className="text-ink font-semibold">{sub.score.toFixed(1)}</strong>
                  <span className="text-steel text-[10px]">/ 10</span>
                </div>
                <div className="w-full h-1.5 bg-hairline rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Blunt Assessor Verdict Card */}
        {final_assessment?.verdict && (
          <div className="p-4 rounded-xl bg-card-tint-yellow/40 border border-amber-200/80 space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
              <Award className="w-4 h-4 text-amber-700" />
              <span>Assessor Verdict</span>
            </div>
            <p className="text-xs text-charcoal leading-relaxed">
              {final_assessment.verdict}
            </p>
          </div>
        )}
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-hairline">
        <PillTab active={activeTab === 'overview'} onClick={() => setActiveTab('overview')}>
          Overview & Verdict
        </PillTab>
        <PillTab active={activeTab === 'detailed'} onClick={() => setActiveTab('detailed')}>
          Detailed Assessment
        </PillTab>
        <PillTab active={activeTab === 'improve'} onClick={() => setActiveTab('improve')}>
          What to Improve
        </PillTab>
        <PillTab active={activeTab === 'discussion'} onClick={() => setActiveTab('discussion')}>
          Group Discussion Coach
        </PillTab>
      </div>

      {/* 4. Tab Contents */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* PPDT Suitability Explanation */}
          {ppdt_suitability && (
            <CardBase className="p-5 space-y-2">
              <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                PPDT Suitability Assessment ({verdict})
              </h3>
              <p className="text-xs text-charcoal leading-relaxed">
                {ppdt_suitability.explanation}
              </p>
              {ppdt_suitability.narration_assessment && (
                <div className="pt-2 text-xs text-slate border-t border-hairline mt-2">
                  <strong className="text-charcoal block mb-0.5">Narration Feasibility:</strong>
                  {ppdt_suitability.narration_assessment}
                </div>
              )}
            </CardBase>
          )}

          {/* Aim & Improved Story (When Included) */}
          {improved_story?.included && improved_story.story && (
            <CardBase className="p-5 space-y-3 bg-purple-50/40 border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-ink">Elevated Model Story</h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const text = `${improved_story.aim ? `AIM: ${improved_story.aim}\n\n` : ''}${improved_story.story}`;
                    navigator.clipboard.writeText(text);
                  }}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> Copy Story
                </button>
              </div>

              {improved_story.aim && (
                <div className="p-2.5 rounded-lg bg-surface border border-hairline text-xs font-medium text-charcoal">
                  <span className="text-steel font-bold uppercase text-[10px] mr-1.5">Aim:</span>
                  {improved_story.aim}
                </div>
              )}

              <p className="text-xs text-charcoal leading-relaxed whitespace-pre-wrap font-sans">
                {improved_story.story}
              </p>
            </CardBase>
          )}

          {/* Quick Summary of Key Fixes */}
          {what_to_change && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {what_to_change.remove && (
                <CardBase className="p-4 space-y-1.5 border-rose-200 bg-rose-50/30">
                  <strong className="text-xs font-semibold text-rose-900 block">What to Remove:</strong>
                  <p className="text-xs text-charcoal leading-relaxed">{what_to_change.remove}</p>
                </CardBase>
              )}
              {what_to_change.add && (
                <CardBase className="p-4 space-y-1.5 border-emerald-200 bg-emerald-50/30">
                  <strong className="text-xs font-semibold text-emerald-900 block">What to Add:</strong>
                  <p className="text-xs text-charcoal leading-relaxed">{what_to_change.add}</p>
                </CardBase>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DETAILED ASSESSMENT (4 Accordions) */}
      {activeTab === 'detailed' && (
        <div className="space-y-4">
          
          {/* Accordion 1: Picture Perception */}
          <div className="rounded-xl border border-hairline bg-surface overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion('picture')}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-canvas transition-colors"
            >
              <h3 className="text-sm font-semibold text-charcoal">
                1. Picture Perception & Environmental Grounding
              </h3>
              <span className="text-slate">
                {openAccordions.picture ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>
            {openAccordions.picture && (
              <div className="p-4 border-t border-hairline bg-canvas/30 space-y-3 text-xs">
                <div>
                  <strong className="text-charcoal block mb-0.5">Details Identified Correctly:</strong>
                  <p className="text-slate leading-relaxed">{picture_perception?.identified_correctly || 'None noted'}</p>
                </div>
                <div>
                  <strong className="text-charcoal block mb-0.5">Important Elements Ignored:</strong>
                  <p className="text-slate leading-relaxed">{picture_perception?.ignored_elements || 'None'}</p>
                </div>
                <div>
                  <strong className="text-charcoal block mb-0.5">Logical Interpretation:</strong>
                  <p className="text-slate leading-relaxed">{picture_perception?.logical_interpretation || 'Reasonable'}</p>
                </div>
                <div>
                  <strong className="text-charcoal block mb-0.5">Unnecessarily Imagined Details:</strong>
                  <p className="text-slate leading-relaxed">{picture_perception?.unnecessarily_imagined || 'None'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Accordion 2: Story Quality */}
          <div className="rounded-xl border border-hairline bg-surface overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion('storyQuality')}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-canvas transition-colors"
            >
              <h3 className="text-sm font-semibold text-charcoal">
                2. Story Quality & Execution Analysis
              </h3>
              <span className="text-slate">
                {openAccordions.storyQuality ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>
            {openAccordions.storyQuality && (
              <div className="p-4 border-t border-hairline bg-canvas/30 space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <strong className="text-charcoal block mb-0.5">Protagonist & Demographics:</strong>
                    <p className="text-slate leading-relaxed">{story_quality?.protagonist} ({story_quality?.age_gender_emotional_state})</p>
                  </div>
                  <div>
                    <strong className="text-charcoal block mb-0.5">Premise & Context:</strong>
                    <p className="text-slate leading-relaxed">{story_quality?.premise_situation}</p>
                  </div>
                </div>
                <div>
                  <strong className="text-charcoal block mb-0.5">Actions Taken:</strong>
                  <p className="text-slate leading-relaxed">{story_quality?.actions_taken}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <strong className="text-charcoal block mb-0.5">Initiative & Responsibility:</strong>
                    <p className="text-slate leading-relaxed">{story_quality?.initiative_responsibility}</p>
                  </div>
                  <div>
                    <strong className="text-charcoal block mb-0.5">Action vs Passive Description:</strong>
                    <p className="text-slate leading-relaxed">{story_quality?.action_vs_description}</p>
                  </div>
                </div>
                <div>
                  <strong className="text-charcoal block mb-0.5">Ending / Resolution:</strong>
                  <p className="text-slate leading-relaxed">{story_quality?.ending_resolution}</p>
                </div>
                {story_quality?.quotes && story_quality.quotes.length > 0 && (
                  <div className="pt-2 border-t border-hairline">
                    <strong className="text-charcoal block mb-1">Verified Quotes from Your Story:</strong>
                    <div className="space-y-1">
                      {story_quality.quotes.map((q, idx) => (
                        <div key={idx} className="p-2 rounded bg-surface border border-hairline text-slate italic flex items-start gap-1.5">
                          <Quote className="w-3.5 h-3.5 text-steel shrink-0 mt-0.5" />
                          <span>"{q}"</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Accordion 3: SSB/OLQ Perspective */}
          <div className="rounded-xl border border-hairline bg-surface overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion('olq')}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-canvas transition-colors"
            >
              <h3 className="text-sm font-semibold text-charcoal">
                3. SSB Officer Like Qualities (OLQ) Perspective ({olq_perspective.length} Qualities)
              </h3>
              <span className="text-slate">
                {openAccordions.olq ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>
            {openAccordions.olq && (
              <div className="divide-y divide-hairline border-t border-hairline bg-canvas/30 text-xs">
                {olq_perspective.map((olqItem, idx) => {
                  let basisTagColor: 'green' | 'yellow' | 'gray' = 'gray';
                  let basisLabel = 'Not demonstrated';
                  if (olqItem.basis === 'present_in_story') {
                    basisTagColor = 'green';
                    basisLabel = 'Present in story';
                  } else if (olqItem.basis === 'inferred') {
                    basisTagColor = 'yellow';
                    basisLabel = 'Inferred';
                  }

                  return (
                    <div key={idx} className="p-3.5 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <strong className="text-charcoal font-semibold">{olqItem.olq}</strong>
                        <TagChip color={basisTagColor}>{basisLabel}</TagChip>
                      </div>
                      <p className="text-slate leading-relaxed">{olqItem.tendency}</p>
                      {olqItem.quote && (
                        <div className="text-[11px] text-steel italic pl-3 border-l-2 border-primary/40 pt-0.5">
                          Quote: "{olqItem.quote}"
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Accordion 4: Realism Check */}
          <div className="rounded-xl border border-hairline bg-surface overflow-hidden">
            <button
              type="button"
              onClick={() => toggleAccordion('realism')}
              className="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-canvas transition-colors"
            >
              <h3 className="text-sm font-semibold text-charcoal">
                4. Realism & Risk Area Audit ({realism_check.length} Risk Areas)
              </h3>
              <span className="text-slate">
                {openAccordions.realism ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>
            {openAccordions.realism && (
              <div className="divide-y divide-hairline border-t border-hairline bg-canvas/30 text-xs">
                {realism_check.map((item, idx) => (
                  <div key={idx} className="p-3.5 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <strong className="text-charcoal font-semibold">{item.area}</strong>
                      <TagChip color={item.problem_found ? 'red' : 'green'}>
                        {item.problem_found ? 'Problem found' : 'No problem found'}
                      </TagChip>
                    </div>
                    <p className="text-slate leading-relaxed">{item.finding}</p>
                    {item.quote && (
                      <div className="text-[11px] text-steel italic pl-3 border-l-2 border-rose-300 pt-0.5">
                        Excerpt: "{item.quote}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: WHAT TO IMPROVE */}
      {activeTab === 'improve' && (
        <div className="space-y-4">
          <CardBase className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-ink">Actionable Writing Fixes</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-surface border border-hairline space-y-1">
                <strong className="text-charcoal block">What to Remove:</strong>
                <p className="text-slate leading-relaxed">{what_to_change?.remove || 'None'}</p>
              </div>
              <div className="p-3.5 rounded-lg bg-surface border border-hairline space-y-1">
                <strong className="text-charcoal block">What to Add:</strong>
                <p className="text-slate leading-relaxed">{what_to_change?.add || 'None'}</p>
              </div>
              <div className="p-3.5 rounded-lg bg-surface border border-hairline space-y-1">
                <strong className="text-charcoal block">Protagonist Adjustments:</strong>
                <p className="text-slate leading-relaxed">{what_to_change?.protagonist_changes || 'None'}</p>
              </div>
              <div className="p-3.5 rounded-lg bg-surface border border-hairline space-y-1">
                <strong className="text-charcoal block">Make Solution More Practical:</strong>
                <p className="text-slate leading-relaxed">{what_to_change?.make_solution_practical || 'None'}</p>
              </div>
              <div className="p-3.5 rounded-lg bg-surface border border-hairline space-y-1">
                <strong className="text-charcoal block">How to Make It Concise:</strong>
                <p className="text-slate leading-relaxed">{what_to_change?.make_concise || 'None'}</p>
              </div>
              <div className="p-3.5 rounded-lg bg-surface border border-hairline space-y-1">
                <strong className="text-charcoal block">Mistakes to Avoid Next Time:</strong>
                <p className="text-slate leading-relaxed">{what_to_change?.mistakes_to_avoid || 'None'}</p>
              </div>
            </div>
          </CardBase>

          {/* Model Story when available */}
          {improved_story?.included && improved_story.story && (
            <CardBase className="p-5 space-y-3 bg-purple-50/40 border-purple-200">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold text-ink">Elevated Model Story</h3>
              </div>
              {improved_story.aim && (
                <div className="p-2.5 rounded-lg bg-surface border border-hairline text-xs font-medium text-charcoal">
                  <span className="text-steel font-bold uppercase text-[10px] mr-1.5">Aim:</span>
                  {improved_story.aim}
                </div>
              )}
              <p className="text-xs text-charcoal leading-relaxed whitespace-pre-wrap font-sans">
                {improved_story.story}
              </p>
            </CardBase>
          )}
        </div>
      )}

      {/* TAB 4: GROUP DISCUSSION COACH */}
      {activeTab === 'discussion' && (
        <div className="space-y-4">
          <CardBase className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              PPDT Group Discussion Strategy
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-lg bg-surface border border-hairline space-y-1">
                <strong className="text-charcoal block">Entry Strategy:</strong>
                <p className="text-slate leading-relaxed">{discussion?.entry_strategy || 'Speak calmly and early without cutting off others.'}</p>
              </div>
              <div className="p-3.5 rounded-lg bg-surface border border-hairline space-y-1">
                <strong className="text-charcoal block">Entry Timing:</strong>
                <p className="text-slate leading-relaxed">{discussion?.entry_timing || 'After the first 1-2 candidates pause.'}</p>
              </div>
            </div>

            {/* Entry Phrases */}
            {discussion?.entry_phrases && discussion.entry_phrases.length > 0 && (
              <div className="p-3.5 rounded-lg bg-canvas border border-hairline space-y-2 text-xs">
                <strong className="text-charcoal block">Natural Discussion Entry Phrases:</strong>
                <div className="space-y-1.5">
                  {discussion.entry_phrases.map((phrase, idx) => (
                    <div key={idx} className="p-2 rounded bg-surface border border-hairline text-charcoal font-medium">
                      "{phrase}"
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stance & Explanation */}
            <div className="p-3.5 rounded-lg bg-surface border border-hairline space-y-1 text-xs">
              <div className="flex items-center gap-2">
                <strong className="text-charcoal">Recommended Stance:</strong>
                <TagChip color="purple">{discussion?.stance || 'modify'}</TagChip>
              </div>
              <p className="text-slate leading-relaxed">{discussion?.stance_explanation}</p>
            </div>

            {/* Ordered Speaking Points */}
            {discussion?.key_points && discussion.key_points.length > 0 && (
              <div className="space-y-2 text-xs">
                <strong className="text-charcoal block">Key Speaking Points (In Speaking Order):</strong>
                <div className="space-y-1.5">
                  {discussion.key_points.map((pt, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-surface border border-hairline flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <span className="font-bold text-steel">{pt.order}.</span>
                        <span className="text-charcoal leading-relaxed">{pt.point}</span>
                      </div>
                      <TagChip color={pt.priority === 'most_important' ? 'green' : pt.priority === 'important' ? 'yellow' : 'gray'}>
                        {pt.priority}
                      </TagChip>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
              <div className="p-3.5 rounded-lg bg-surface border border-hairline space-y-1">
                <strong className="text-charcoal block">Details to Avoid:</strong>
                <p className="text-slate leading-relaxed">{discussion?.details_to_avoid || 'None'}</p>
              </div>
              <div className="p-3.5 rounded-lg bg-surface border border-hairline space-y-1">
                <strong className="text-charcoal block">Connecting with Others' Stories:</strong>
                <p className="text-slate leading-relaxed">{discussion?.connecting_with_other_stories || 'Find common ground in the central theme.'}</p>
              </div>
            </div>

            {discussion?.weaknesses_and_handling && (
              <div className="p-3.5 rounded-lg bg-rose-50/40 border border-rose-200 text-xs space-y-1">
                <strong className="text-rose-900 block">Handling Story Weaknesses in GD:</strong>
                <p className="text-charcoal leading-relaxed">{discussion.weaknesses_and_handling}</p>
              </div>
            )}
          </CardBase>
        </div>
      )}

      {/* 5. Bottom Navigation Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-hairline">
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
      </div>
    </div>
  );
}
