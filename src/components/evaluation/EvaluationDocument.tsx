'use client';

import React, { useState } from 'react';
import { 
  Award, 
  Sparkles, 
  Copy, 
  Check, 
  Info,
  Users,
  Target,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { EvaluationDoc } from '@/lib/assessor/types';
import LabelledItem from './LabelledItem';
import { TagChip, CardBase } from '@/components/ui';

interface EvaluationDocumentProps {
  doc: EvaluationDoc;
}

export default function EvaluationDocument({ doc }: EvaluationDocumentProps) {
  const [storyCopied, setStoryCopied] = useState(false);

  const handleCopyStory = async () => {
    if (!doc.improved_story.story) return;
    const text = `${doc.improved_story.aim ? `AIM: ${doc.improved_story.aim}\n\n` : ''}${doc.improved_story.story}`;
    await navigator.clipboard.writeText(text);
    setStoryCopied(true);
    setTimeout(() => setStoryCopied(false), 2000);
  };

  const s = doc.scores;
  const subScoreList = [
    { label: 'Picture Perception', score: s.picture_perception },
    { label: 'Story Quality', score: s.story },
    { label: 'Realism', score: s.realism },
    { label: 'Protagonist and Action', score: s.protagonist_action },
    { label: 'Narration Suitability', score: s.narration_suitability },
  ];

  return (
    <article className="space-y-10 text-charcoal font-sans leading-[1.65] max-w-[760px] w-full">
      
      {/* Legacy notice banner if adapted from an older schema version */}
      {doc.isLegacy && (
        <div className="p-3.5 rounded-xl bg-card-tint-peach/40 border border-hairline text-xs text-slate flex items-start gap-2.5 print:hidden">
          <Info className="w-4 h-4 text-brand-orange shrink-0 mt-0.5" />
          <p>
            <strong className="text-charcoal font-semibold">Older Record Notice: </strong>
            This assessment was completed under an earlier evaluation schema. Sections where details were not recorded originally indicate fewer details.
          </p>
        </div>
      )}

      {/* ===================================================================
          PART 1: PICTURE PERCEPTION
         =================================================================== */}
      <section id="part-1" className="scroll-mt-24 space-y-4">
        <div className="border-b border-hairline pb-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
            1. Picture Perception
          </h2>
        </div>

        <div className="space-y-4 pl-0.5">
          {doc.picture_perception.map((item, idx) => (
            <LabelledItem
              key={idx}
              label={item.label}
              text={item.text}
              quote={item.quote}
            />
          ))}
        </div>
      </section>

      {/* ===================================================================
          PART 2: STORY QUALITY
         =================================================================== */}
      <section id="part-2" className="scroll-mt-24 space-y-4">
        <div className="border-b border-hairline pb-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
            2. Story Quality
          </h2>
        </div>

        <div className="space-y-4 pl-0.5">
          {doc.story_quality.map((item, idx) => (
            <LabelledItem
              key={idx}
              label={item.label}
              text={item.text}
              quote={item.quote}
            />
          ))}
        </div>
      </section>

      {/* ===================================================================
          PART 3: SSB/OLQ PERSPECTIVE
         =================================================================== */}
      <section id="part-3" className="scroll-mt-24 space-y-4">
        <div className="border-b border-hairline pb-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
            3. SSB/OLQ Perspective
          </h2>
        </div>

        <div className="space-y-4 pl-0.5">
          {doc.olq.map((item, idx) => (
            <LabelledItem
              key={idx}
              label={item.label}
              text={item.text}
              quote={item.quote}
              basis={item.basis}
            />
          ))}
        </div>
      </section>

      {/* ===================================================================
          PART 4: REALISM CHECK
         =================================================================== */}
      <section id="part-4" className="scroll-mt-24 space-y-4">
        <div className="border-b border-hairline pb-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
            4. Realism Check
          </h2>
        </div>

        <div className="space-y-4 pl-0.5">
          {doc.realism.map((item, idx) => (
            <LabelledItem
              key={idx}
              label={item.label}
              text={item.text}
              quote={item.quote}
            />
          ))}
        </div>
      </section>

      {/* ===================================================================
          PART 5: PPDT SUITABILITY
         =================================================================== */}
      <section id="part-5" className="scroll-mt-24 space-y-4">
        <div className="border-b border-hairline pb-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
            5. PPDT Suitability
          </h2>
        </div>

        <div className="space-y-3.5 pl-0.5">
          <div className="flex items-center gap-2 text-[15px] sm:text-[16px]">
            <strong className="font-semibold text-ink">Verdict:</strong>
            <TagChip
              color={
                doc.suitability.verdict === 'Strong'
                  ? 'green'
                  : doc.suitability.verdict === 'Weak'
                  ? 'red'
                  : 'yellow'
              }
              className="text-xs px-2.5 py-0.5 font-bold"
            >
              {doc.suitability.verdict}
            </TagChip>
          </div>

          <div className="space-y-1 text-[15px] sm:text-[16px]">
            <strong className="font-semibold text-ink block">Explanation:</strong>
            <p className="text-charcoal leading-relaxed">{doc.suitability.explanation}</p>
          </div>

          <div className="space-y-1 text-[15px] sm:text-[16px]">
            <strong className="font-semibold text-ink block">Narration Feasibility:</strong>
            <p className="text-charcoal leading-relaxed">{doc.suitability.narration}</p>
          </div>
        </div>
      </section>

      {/* ===================================================================
          PART 6: WHAT I SHOULD CHANGE
         =================================================================== */}
      <section id="part-6" className="scroll-mt-24 space-y-4">
        <div className="border-b border-hairline pb-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
            6. What I Should Change
          </h2>
        </div>

        <div className="space-y-4 pl-0.5">
          {doc.changes.map((item, idx) => (
            <LabelledItem
              key={idx}
              label={item.label}
              text={item.text}
            />
          ))}
        </div>
      </section>

      {/* ===================================================================
          PART 7: FINAL ASSESSMENT
         =================================================================== */}
      <section id="part-7" className="scroll-mt-24 space-y-6">
        <div className="border-b border-hairline pb-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
            7. Final Assessment
          </h2>
        </div>

        {/* Clean Score List */}
        <div className="p-4 rounded-xl bg-surface border border-hairline space-y-2 text-sm">
          <div className="flex items-center justify-between font-bold text-ink pb-2 border-b border-hairline text-base">
            <span>Overall Score</span>
            <span className="text-primary font-extrabold">{s.overall.toFixed(1)} / 10</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {subScoreList.map((item) => (
              <div key={item.label} className="flex items-center justify-between text-xs sm:text-[13px] py-1">
                <span className="text-slate">{item.label}:</span>
                <strong className="text-ink font-semibold">{item.score.toFixed(1)} / 10</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Highlighted Assessor Verdict Card */}
        {doc.verdict && (
          <div className="p-5 rounded-2xl bg-card-tint-yellow/40 border border-amber-300/80 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
              <Award className="w-4 h-4 text-amber-700" />
              <span>Assessor Verdict</span>
            </div>
            <p className="text-xs sm:text-[14px] text-charcoal leading-relaxed">
              {doc.verdict}
            </p>
          </div>
        )}

        {/* Aim and Improved Story Card */}
        {doc.improved_story.included && doc.improved_story.story && (
          <div className="p-5 rounded-2xl bg-purple-50/50 border border-purple-200/90 shadow-sm space-y-3.5 print:border-hairline">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary font-bold text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Elevated Model Story</span>
              </div>
              <button
                type="button"
                onClick={handleCopyStory}
                className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer print:hidden"
              >
                {storyCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{storyCopied ? 'Copied' : 'Copy Story'}</span>
              </button>
            </div>

            {doc.improved_story.aim && (
              <div className="p-3 rounded-lg bg-surface border border-hairline text-xs sm:text-[13px]">
                <strong className="text-steel font-bold uppercase text-[10px] mr-1.5 block sm:inline">
                  Aim:
                </strong>
                <span className="text-charcoal font-medium">{doc.improved_story.aim}</span>
              </div>
            )}

            <div className="text-xs sm:text-[14px] text-charcoal leading-relaxed whitespace-pre-wrap font-sans">
              {doc.improved_story.story}
            </div>
          </div>
        )}
      </section>

      {/* ===================================================================
          PART 8: PPDT DISCUSSION ENTRY AND SPEAKING POINTS
         =================================================================== */}
      <section id="part-8" className="scroll-mt-24 space-y-6">
        <div className="border-b border-hairline pb-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-ink">
            8. PPDT Discussion Entry and Speaking Points
          </h2>
        </div>

        <div className="space-y-4 pl-0.5">
          {/* Entry Strategy & Timing */}
          <div className="space-y-3 text-[15px] sm:text-[16px]">
            <div>
              <strong className="font-semibold text-ink block mb-0.5">Entry Strategy:</strong>
              <p className="text-charcoal leading-relaxed">{doc.discussion.entry_strategy}</p>
            </div>

            <div>
              <strong className="font-semibold text-ink block mb-0.5">Entry Timing:</strong>
              <p className="text-charcoal leading-relaxed">{doc.discussion.entry_timing}</p>
            </div>
          </div>

          {/* Phrases to Enter (Quote blocks) */}
          {doc.discussion.entry_phrases.length > 0 && (
            <div className="space-y-2 pt-1">
              <strong className="font-semibold text-ink text-[15px] sm:text-[16px] block">
                Phrases to Enter:
              </strong>
              <div className="space-y-2">
                {doc.discussion.entry_phrases.map((phrase, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-surface border border-hairline text-xs sm:text-[14px] font-medium text-charcoal italic border-l-4 border-l-primary flex items-start gap-2"
                  >
                    <span className="font-bold text-steel not-italic">({idx + 1})</span>
                    <span>&ldquo;{phrase}&rdquo;</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Stance in GD */}
          <div className="p-3.5 rounded-xl bg-surface border border-hairline space-y-1.5 text-[15px] sm:text-[16px]">
            <div className="flex items-center gap-2">
              <strong className="font-semibold text-ink">Stance in GD:</strong>
              <TagChip color="purple" className="text-xs uppercase font-bold px-2 py-0.5">
                {doc.discussion.stance}
              </TagChip>
            </div>
            <p className="text-charcoal leading-relaxed text-xs sm:text-[14px]">
              {doc.discussion.stance_explanation}
            </p>
          </div>

          {/* Key Speaking Points (Ordered list with purpose tags) */}
          {doc.discussion.key_points.length > 0 && (
            <div className="space-y-2 pt-1">
              <strong className="font-semibold text-ink text-[15px] sm:text-[16px] block">
                Key Speaking Points:
              </strong>
              <div className="space-y-2">
                {doc.discussion.key_points.map((kp) => (
                  <div
                    key={kp.order}
                    className="p-3 rounded-xl bg-canvas border border-hairline space-y-1 text-xs sm:text-[14px]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                        {kp.order}
                      </span>
                      <em className="text-steel text-xs not-italic font-medium text-[12px]">
                        ({kp.purpose})
                      </em>
                    </div>
                    <p className="text-charcoal leading-relaxed pl-7">{kp.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Details to Avoid & Connecting with Others */}
          <div className="space-y-3 pt-2 text-[15px] sm:text-[16px]">
            <div>
              <strong className="font-semibold text-ink block mb-0.5">Details to Avoid:</strong>
              <p className="text-charcoal leading-relaxed">{doc.discussion.details_to_avoid}</p>
            </div>

            <div>
              <strong className="font-semibold text-ink block mb-0.5">Connecting with Other Candidates&apos; Stories:</strong>
              <p className="text-charcoal leading-relaxed">{doc.discussion.connecting_with_others}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200/80 space-y-1 text-xs sm:text-[14px]">
              <strong className="text-rose-950 font-bold block">
                Handling Your Story&apos;s Weaknesses in GD:
              </strong>
              <p className="text-charcoal leading-relaxed">{doc.discussion.weaknesses_handling}</p>
            </div>
          </div>
        </div>
      </section>

    </article>
  );
}

