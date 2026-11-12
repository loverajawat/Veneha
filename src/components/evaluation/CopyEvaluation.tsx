'use client';

import React, { useState } from 'react';
import { Copy, Check, Printer } from 'lucide-react';
import { EvaluationDoc } from '@/lib/assessor/types';
import { Button } from '@/components/ui';

interface CopyEvaluationProps {
  doc: EvaluationDoc;
  pictureTitle?: string;
}

/**
 * Formats the entire unified evaluation as clean Markdown matching Gemini's reference output.
 */
export function formatEvaluationToMarkdown(doc: EvaluationDoc, pictureTitle?: string): string {
  const s = doc.scores;
  let md = `# PPDT Evaluation | Overall ${s.overall}/10 | ${doc.suitability.verdict}\n`;
  if (pictureTitle) md += `Picture: ${pictureTitle}\n`;
  md += `Picture perception ${s.picture_perception} · Story ${s.story} · Realism ${s.realism} · Protagonist and action ${s.protagonist_action} · Narration suitability ${s.narration_suitability}\n\n`;

  // 1. Picture Perception
  md += `## 1. Picture Perception\n`;
  for (const item of doc.picture_perception) {
    md += `- **${item.label}**: ${item.text}\n`;
    if (item.quote) md += `  > Quote: "${item.quote}"\n`;
  }
  md += `\n`;

  // 2. Story Quality
  md += `## 2. Story Quality\n`;
  for (const item of doc.story_quality) {
    md += `- **${item.label}**: ${item.text}\n`;
    if (item.quote) md += `  > Quote: "${item.quote}"\n`;
  }
  md += `\n`;

  // 3. SSB/OLQ Perspective
  md += `## 3. SSB/OLQ Perspective\n`;
  for (const item of doc.olq) {
    const basisLabel = item.basis === 'present_in_story' ? 'present in story' : item.basis === 'inferred' ? 'inferred' : 'not demonstrated';
    md += `- **${item.label}**: ${item.text} *(Basis: ${basisLabel})*\n`;
    if (item.quote) md += `  > Quote: "${item.quote}"\n`;
  }
  md += `\n`;

  // 4. Realism Check
  md += `## 4. Realism Check\n`;
  for (const item of doc.realism) {
    md += `- **${item.label}**: ${item.text}\n`;
    if (item.quote) md += `  > Quote: "${item.quote}"\n`;
  }
  md += `\n`;

  // 5. PPDT Suitability
  md += `## 5. PPDT Suitability\n`;
  md += `- **Verdict**: ${doc.suitability.verdict}\n`;
  md += `- **Explanation**: ${doc.suitability.explanation}\n`;
  md += `- **Narration Feasibility**: ${doc.suitability.narration}\n\n`;

  // 6. What I Should Change
  md += `## 6. What I Should Change\n`;
  for (const item of doc.changes) {
    md += `- **${item.label}**: ${item.text}\n`;
  }
  md += `\n`;

  // 7. Final Assessment
  md += `## 7. Final Assessment\n`;
  md += `Overall ${s.overall} / 10 · Picture perception ${s.picture_perception} · Story ${s.story} · Realism ${s.realism} · Protagonist/action ${s.protagonist_action} · Narration suitability ${s.narration_suitability}\n\n`;
  md += `**Assessor Verdict**:\n${doc.verdict}\n\n`;

  if (doc.improved_story.included && doc.improved_story.story) {
    if (doc.improved_story.aim) md += `**Aim**: ${doc.improved_story.aim}\n\n`;
    md += `**Improved Story**:\n${doc.improved_story.story}\n\n`;
  }

  // 8. PPDT Discussion
  md += `## 8. PPDT Discussion Entry and Speaking Points\n`;
  md += `- **Entry Strategy**: ${doc.discussion.entry_strategy}\n`;
  md += `- **Entry Timing**: ${doc.discussion.entry_timing}\n`;
  if (doc.discussion.entry_phrases.length > 0) {
    md += `- **Phrases to enter**:\n`;
    doc.discussion.entry_phrases.forEach((p, idx) => {
      md += `  (${idx + 1}) "${p}"\n`;
    });
  }
  md += `- **Stance in GD**: ${doc.discussion.stance.toUpperCase()} — ${doc.discussion.stance_explanation}\n`;
  if (doc.discussion.key_points.length > 0) {
    md += `- **Key speaking points**:\n`;
    doc.discussion.key_points.forEach((kp) => {
      md += `  ${kp.order}. *(${kp.purpose})* ${kp.text}\n`;
    });
  }
  md += `- **Details to Avoid**: ${doc.discussion.details_to_avoid}\n`;
  md += `- **Connecting with Others**: ${doc.discussion.connecting_with_others}\n`;
  md += `- **Handling Weaknesses**: ${doc.discussion.weaknesses_handling}\n`;

  return md;
}

export default function CopyEvaluationActions({ doc, pictureTitle }: CopyEvaluationProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const md = formatEvaluationToMarkdown(doc, pictureTitle);
    await navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex items-center gap-2 print:hidden">
      <Button
        variant="secondary"
        onClick={handleCopy}
        className="text-xs py-1.5 px-3 flex items-center gap-1.5 cursor-pointer"
        aria-label="Copy full evaluation as Markdown"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        <span>{copied ? 'Copied Markdown' : 'Copy Full Evaluation'}</span>
      </Button>

      <Button
        variant="secondary"
        onClick={handlePrint}
        className="text-xs py-1.5 px-2.5 hidden sm:flex items-center gap-1 cursor-pointer"
        aria-label="Print or save as PDF"
        title="Print / Save PDF"
      >
        <Printer className="w-3.5 h-3.5 text-steel" />
      </Button>
    </div>
  );
}

