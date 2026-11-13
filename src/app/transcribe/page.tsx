'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Edit3, 
  ArrowLeft,
  Eye,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Type,
  Maximize2,
  X
} from 'lucide-react';
import { PPDTPicture } from '@/data/pictures';
import { getGuest, saveAttempt } from '@/lib/guestStorage';
import { 
  Button, 
  CardBase, 
  TagChip, 
  Alert 
} from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { getStoryPages, UploadedStoryPage } from '@/lib/storyPagesMemory';
import { computeWER, countUnclearMarkers } from '@/lib/transcriber/metrics';

export default function TranscribePage() {
  const router = useRouter();
  const { lang } = useLanguage();

  const [boxAndHeading, setBoxAndHeading] = useState('');
  const [storyText, setStoryText] = useState('');
  const [aiRawTranscript, setAiRawTranscript] = useState('');
  const [picture, setPicture] = useState<PPDTPicture | null>(null);
  const [pages, setPages] = useState<UploadedStoryPage[]>([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);
  const [showMobilePhotos, setShowMobilePhotos] = useState(true);
  const [enlargeModalOpen, setEnlargeModalOpen] = useState(false);

  const [hasConfirmedMatch, setHasConfirmedMatch] = useState(false);
  const [studentConcern, setStudentConcern] = useState('');
  const [assessing, setAssessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [assessmentStepText, setAssessmentStepText] = useState('Initiating psychological evaluation...');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // 1. Load stimulus picture
    const rawPic = sessionStorage.getItem('current_ppdt_picture');
    if (rawPic) {
      try {
        setPicture(JSON.parse(rawPic));
      } catch {}
    }

    // 2. Load stored uploaded pages
    const storedPages = getStoryPages();
    setPages(storedPages);

    // 3. Load transcription
    const savedBox = sessionStorage.getItem('current_story_box');
    const savedStory = sessionStorage.getItem('current_story_text');
    const rawSaved = sessionStorage.getItem('current_story_transcript');

    if (savedBox || savedStory) {
      setBoxAndHeading(savedBox || '');
      setStoryText(savedStory || '');
      setAiRawTranscript(rawSaved || `${savedBox ? savedBox + '\n\n' : ''}${savedStory || ''}`);
    } else if (rawSaved) {
      setAiRawTranscript(rawSaved);
      // Attempt to parse box_and_heading if structured
      const perceptionMatch = rawSaved.match(/(?:Perception Box|Action|Title)[\s\S]*?(?=\n\n(?:Story:|\w))/i);
      if (perceptionMatch && perceptionMatch[0]) {
        const box = perceptionMatch[0].trim();
        const story = rawSaved.replace(perceptionMatch[0], '').replace(/^Story:\s*/i, '').trim();
        setBoxAndHeading(box);
        setStoryText(story);
      } else {
        setStoryText(rawSaved.trim());
      }
    } else {
      // No fake text fallback. Prompt student to write or type.
      setStoryText('');
      setBoxAndHeading('');
      setAiRawTranscript('');
    }
  }, []);

  // Update combined transcript in session storage whenever inputs change
  useEffect(() => {
    const full = boxAndHeading.trim() 
      ? `${boxAndHeading.trim()}\n\n${storyText.trim()}`
      : storyText.trim();
    if (full) {
      sessionStorage.setItem('current_story_transcript', full);
      sessionStorage.setItem('current_story_text', storyText);
      sessionStorage.setItem('current_story_box', boxAndHeading);
    }
  }, [boxAndHeading, storyText]);

  // Marker statistics
  const fullText = boxAndHeading ? `${boxAndHeading}\n${storyText}` : storyText;
  const { unclearCount, illegibleCount, totalMarkers } = countUnclearMarkers(fullText);
  const wordCount = storyText.split(/\s+/).filter(Boolean).length;

  // Jump to next uncertain/illegible marker
  const handleJumpToNextMarker = () => {
    if (!textareaRef.current) return;
    const el = textareaRef.current;
    const text = el.value;
    const start = el.selectionEnd || 0;

    const regex = /\[\?[^\?]+\?\]|\[illegible\]/gi;
    regex.lastIndex = start;
    let match = regex.exec(text);

    // If reached end, wrap around to start
    if (!match) {
      regex.lastIndex = 0;
      match = regex.exec(text);
    }

    if (match) {
      el.focus();
      el.setSelectionRange(match.index, match.index + match[0].length);
    }
  };

  const handleTypeInstead = () => {
    setStoryText('');
    setBoxAndHeading('');
    setHasConfirmedMatch(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleAssess = async () => {
    if (!storyText.trim() || storyText.trim().length < 20) {
      setErrorMessage(
        lang === 'hi'
          ? 'कृपया मूल्यांकन से पहले सुनिश्चित करें कि आपकी कहानी में कम से कम 20 अक्षर हैं।'
          : 'Please ensure your story contains at least 20 characters before assessment.'
      );
      return;
    }

    if (illegibleCount > 0) {
      setErrorMessage(
        lang === 'hi'
          ? 'कृपया मूल्यांकन से पहले सभी [illegible] शब्दों को ठीक करें या हटाएं।'
          : 'Please replace or delete all [illegible] words before proceeding to assessment.'
      );
      return;
    }

    if (!hasConfirmedMatch) {
      setErrorMessage(
        lang === 'hi'
          ? 'कृपया पुष्टि करें कि पाठ आपके हस्तलिखित उत्तर से मेल खाता है।'
          : 'Please confirm that the transcript matches what you wrote.'
      );
      return;
    }

    setAssessing(true);
    setErrorMessage('');

    const stepMessages = [
      'Deconstructing 10-75-15 timeline architecture...',
      'Auditing the 4 D\'s (Direct Action, Decision, Delegation, Deployment)...',
      'Scanning for 15 Officer Like Qualities (OLQs)...',
      'Verifying quotes against confirmed story...',
      'Synthesizing elevated Model Story and Narration tips...',
    ];

    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % stepMessages.length;
      setAssessmentStepText(stepMessages[msgIdx]);
    }, 1800);

    const confirmedFullTranscript = boxAndHeading.trim()
      ? `${boxAndHeading.trim()}\n\n${storyText.trim()}`
      : storyText.trim();

    try {
      const customKey = localStorage.getItem('ssb_prep_gemini_key') || localStorage.getItem('ssb_gemini_custom_key');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (customKey) {
        headers['x-gemini-key'] = customKey;
      }

      const res = await fetch('/api/assess', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          storyTranscript: confirmedFullTranscript,
          storyText: storyText.trim(),
          boxAndHeading: boxAndHeading.trim(),
          pictureId: picture?.id || 'sample',
          picturePath: picture?.path || '/pictures/ppdt_stimulus_01.jpg',
          studentConcern: studentConcern.trim() || undefined,
        }),
      });

      const data = await res.json();
      clearInterval(msgInterval);

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Assessment failed');
      }

      // Compute edit rate between AI original transcript and confirmed student transcript
      const editRate = aiRawTranscript 
        ? computeWER(aiRawTranscript, confirmedFullTranscript)
        : 0;

      const overallScore = data.feedback?.scores?.overall ?? data.feedback?.final_assessment?.overall_score ?? 5.0;
      const verdict = data.feedback?.suitability?.verdict || data.feedback?.ppdt_suitability?.verdict || 'Average';

      const guest = getGuest();
      const savedAttempt = saveAttempt({
        guestId: guest?.id || 'guest',
        pictureId: picture?.id || 'ppdt-01',
        picturePath: picture?.path || '/pictures/ppdt_stimulus_01.jpg',
        transcript: confirmedFullTranscript,
        ai_transcript: aiRawTranscript || confirmedFullTranscript,
        confirmed_transcript: confirmedFullTranscript,
        box_and_heading: boxAndHeading.trim(),
        word_edit_rate: editRate,
        unclear_count: totalMarkers,
        feedback: data.feedback,
        score: overallScore,
        overall_score: overallScore,
        ppdt_verdict: verdict,
        assessment_prompt_version: data.feedback?.assessment_meta?.prompt_version,
        assessment_prompt_hash: data.feedback?.assessment_meta?.prompt_hash,
        assessment_model: data.feedback?.assessment_meta?.model,
        story_word_count: data.feedback?.assessment_meta?.story_word_count || wordCount,
        student_concern: studentConcern.trim() || null,
        assessment_json: data.feedback,
      });

      sessionStorage.setItem('current_assessment_result', JSON.stringify(data.feedback));
      sessionStorage.setItem('last_attempt_id', savedAttempt.id);
      router.push('/result');
    } catch (err: any) {
      clearInterval(msgInterval);
      console.error('Assessment error:', err);
      setErrorMessage(err.message || 'Error processing assessment. Please retry.');
      setAssessing(false);
    }
  };

  const isAssessDisabled = !hasConfirmedMatch || illegibleCount > 0 || storyText.trim().length < 20 || assessing;

  return (
    <div className="flex-1 flex flex-col max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full font-sans space-y-6 text-ink">
      {/* 1. Header & Step Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-hairline">
        <div>
          <span className="text-[12px] font-semibold text-steel uppercase tracking-wider">
            {lang === 'hi' ? 'चरण 4 / 4: ट्रांसक्रिप्ट समीक्षा' : 'Step 4 of 4: Verify Transcript'}
          </span>
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-ink tracking-tight mt-0.5">
            {lang === 'hi' ? 'कहानी पाठ की पुष्टि करें' : 'Confirm Your Story Text'}
          </h1>
          <p className="text-[14px] text-slate mt-1 max-w-2xl">
            {lang === 'hi'
              ? 'AI ने आपके हस्तलेखन को पढ़ा है। कृपया सुनिश्चित करें कि यह आपके लिखे हुए से ठीक मेल खाता है।'
              : 'The AI transcribed your handwriting. Compare the text with your original paper and correct any words before assessment.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Stimulus Card Reference */}
          {picture && (
            <div className="flex items-center gap-2.5 p-2 rounded-md bg-surface border border-hairline shrink-0">
              <img
                src={picture.path}
                alt={picture.title}
                className="w-12 h-10 object-cover rounded border border-hairline"
              />
              <div className="text-left text-xs">
                <span className="text-steel text-[10px] block">
                  {lang === 'hi' ? 'अभ्यास चित्र' : 'Stimulus'}
                </span>
                <strong className="text-ink text-[12px] block truncate max-w-[110px]">
                  {picture.title}
                </strong>
              </div>
            </div>
          )}

          <Button
            variant="secondary"
            onClick={handleTypeInstead}
            className="flex items-center gap-1.5 text-xs py-1.5 px-3 whitespace-nowrap"
          >
            <Type className="w-3.5 h-3.5 text-steel" />
            {lang === 'hi' ? 'स्वयं टाइप करें' : 'Type my story instead'}
          </Button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <Alert
          type="error"
          title={lang === 'hi' ? 'त्रुटि' : 'Notice'}
        >
          {errorMessage}
        </Alert>
      )}

      {/* Mobile Photos Toggle (< 1024px) */}
      {pages.length > 0 && (
        <div className="lg:hidden flex items-center justify-between p-3 rounded-lg bg-surface border border-hairline">
          <span className="text-xs font-medium text-charcoal">
            {pages.length} {lang === 'hi' ? 'हस्तलिखित पृष्ठ उपलब्ध' : 'handwritten page(s) attached'}
          </span>
          <Button
            variant="secondary"
            onClick={() => setShowMobilePhotos(!showMobilePhotos)}
            className="text-xs py-1.5 px-3"
          >
            {showMobilePhotos ? (lang === 'hi' ? 'फ़ोटो छिपाएं' : 'Hide Photos') : (lang === 'hi' ? 'फ़ोटो देखें' : 'Show My Photos')}
          </Button>
        </div>
      )}

      {/* 2. Main Split Grid (Photos Left, Transcript Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Original Paper Photos (5 cols on lg) */}
        {pages.length > 0 && (
          <div className={`lg:col-span-5 flex-col space-y-3 lg:sticky lg:top-4 ${showMobilePhotos ? 'flex' : 'hidden lg:flex'}`}>
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-semibold text-charcoal flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-primary" />
                {lang === 'hi' ? 'मूल हस्तलिखित पृष्ठ:' : 'Original Handwritten Pages:'}
              </span>
              {pages.length > 1 && (
                <div className="flex items-center gap-1 text-xs text-slate">
                  <button
                    type="button"
                    disabled={activePhotoIndex === 0}
                    onClick={() => setActivePhotoIndex((i) => Math.max(0, i - 1))}
                    className="p-1 rounded hover:bg-canvas disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-[11px] px-1">
                    {activePhotoIndex + 1} / {pages.length}
                  </span>
                  <button
                    type="button"
                    disabled={activePhotoIndex === pages.length - 1}
                    onClick={() => setActivePhotoIndex((i) => Math.min(pages.length - 1, i + 1))}
                    className="p-1 rounded hover:bg-canvas disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Photo Card View */}
            <div className="relative group rounded-xl border border-hairline overflow-hidden bg-canvas aspect-[3/4] flex items-center justify-center shadow-sm">
              <img
                src={pages[activePhotoIndex]?.previewUrl}
                alt={`Handwritten page ${activePhotoIndex + 1}`}
                className={`w-full h-full object-contain transition-transform duration-200 ${
                  isPhotoZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'
                }`}
                onClick={() => setIsPhotoZoomed(!isPhotoZoomed)}
              />

              {/* Top Controls Overlay */}
              <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-ink/75 backdrop-blur-sm p-1 rounded-md text-white opacity-90 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => setIsPhotoZoomed(!isPhotoZoomed)}
                  className="p-1 hover:text-primary transition-colors"
                  title={isPhotoZoomed ? 'Zoom Out' : 'Zoom In'}
                >
                  {isPhotoZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setEnlargeModalOpen(true)}
                  className="p-1 hover:text-primary transition-colors"
                  title="Enlarge Full Screen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              {/* Bottom Page Badge */}
              <div className="absolute bottom-2 left-2 bg-ink/80 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded shadow">
                Page {activePhotoIndex + 1} of {pages.length}
              </div>
            </div>

            {/* Thumbnails strip if multiple pages */}
            {pages.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto py-1">
                {pages.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setActivePhotoIndex(idx);
                      setIsPhotoZoomed(false);
                    }}
                    className={`relative w-14 h-18 rounded border overflow-hidden shrink-0 transition-all ${
                      activePhotoIndex === idx
                        ? 'ring-2 ring-primary border-primary'
                        : 'border-hairline opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={p.previewUrl}
                      alt={`Thumbnail page ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-ink/80 text-white text-[9px] text-center font-medium py-0.5">
                      P{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <p className="text-[11px] text-slate italic">
              {lang === 'hi' 
                ? 'ज़ूम करने के लिए फ़ोटो पर क्लिक करें। ऊपर दिए गए तीरों से पृष्ठ बदलें।'
                : 'Click image to toggle 1.5x zoom. Use arrow buttons to switch pages.'}
            </p>
          </div>
        )}

        {/* Right Column: Editable Transcript & Controls (7 cols on lg, full on mobile) */}
        <div className={`${pages.length > 0 ? 'lg:col-span-7' : 'lg:col-span-12'} flex flex-col space-y-4`}>
          
          {/* Marker Alert & Jump Button */}
          {totalMarkers > 0 ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="font-semibold block">
                    {totalMarkers} {totalMarkers === 1 ? 'word needs' : 'words need'} verification
                  </strong>
                  <span className="text-amber-800">
                    {unclearCount > 0 && <span className="mr-2">Uncertain: <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono">[?word?]</code> ({unclearCount})</span>}
                    {illegibleCount > 0 && <span>Unreadable: <code className="bg-rose-100 px-1 py-0.5 rounded text-rose-900 font-mono">[illegible]</code> ({illegibleCount})</span>}
                  </span>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={handleJumpToNextMarker}
                className="text-xs bg-white text-amber-900 border-amber-300 hover:bg-amber-50 shrink-0 py-1 px-2.5"
              >
                Jump to next
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>All words readable. No uncertain or illegible tokens detected.</span>
            </div>
          )}

          {/* 1. Box and Heading Field (Separated) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="box-heading" className="font-semibold text-charcoal">
                {lang === 'hi' ? 'परसेप्शन बॉक्स और शीर्षक (Perception Box & Title):' : 'Perception Box & Action / Title:'}
              </label>
              <span className="text-[11px] text-slate">
                {lang === 'hi' ? 'वैकल्पिक (Optional)' : 'Character Box (e.g. M/22/+)'}
              </span>
            </div>
            <textarea
              id="box-heading"
              rows={2}
              value={boxAndHeading}
              onChange={(e) => setBoxAndHeading(e.target.value)}
              placeholder="e.g. [box: M / 0 / 22]  Action: Saving Village Crops from Storm"
              className="w-full text-xs font-mono p-2.5 rounded-lg border border-hairline bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
            />
          </div>

          {/* 2. Main Story Text Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="story-text" className="font-semibold text-charcoal flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-steel" />
                {lang === 'hi' ? 'कहानी पाठ (Story Text):' : 'Story Text (Verbatim):'}
              </label>
              <span className="text-xs text-slate font-medium">
                {wordCount} {wordCount === 1 ? 'word' : 'words'}
              </span>
            </div>

            <textarea
              ref={textareaRef}
              id="story-text"
              rows={14}
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              placeholder="Type or review your transcribed story here..."
              className="w-full text-sm font-sans leading-relaxed p-3.5 rounded-lg border border-hairline bg-surface text-ink focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-y shadow-inner"
            />
          </div>

          {/* Optional Specific Concern Field (Step 5) */}
          <div className="p-3.5 rounded-lg border border-hairline bg-surface space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="student-concern" className="text-xs font-semibold text-charcoal">
                {lang === 'hi'
                  ? 'क्या कोई विशेष पहलू है जिस पर आप परीक्षक का ध्यान चाहते हैं? (वैकल्पिक)'
                  : 'Anything specific you want the assessor to look at? (optional)'}
              </label>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pb-0.5">
              {['Realism', 'Protagonist', 'Action', 'Narration'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => {
                    if (!studentConcern.includes(chip)) {
                      setStudentConcern((prev) => (prev ? `${prev}, ${chip}` : chip));
                    }
                  }}
                  className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border border-hairline bg-canvas hover:bg-surface text-slate hover:text-ink transition-colors cursor-pointer select-none"
                >
                  + {chip}
                </button>
              ))}
            </div>
            <input
              id="student-concern"
              type="text"
              value={studentConcern}
              onChange={(e) => setStudentConcern(e.target.value)}
              placeholder="e.g. Is my action realistic? Can it be narrated smoothly in 1 minute?"
              className="w-full text-xs p-2.5 rounded-md border border-hairline bg-canvas text-ink focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted"
            />
            <div className="flex items-center justify-between text-[11px] text-steel pt-0.5">
              <span>Observation: 30 seconds · Writing: 4 minutes</span>
              <span>Word count: {wordCount} words</span>
            </div>
          </div>

          {/* 3. Mandatory Confirmation Checkbox */}
          <div className="p-3.5 rounded-lg border border-hairline bg-canvas space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasConfirmedMatch}
                onChange={(e) => setHasConfirmedMatch(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-hairline text-primary focus:ring-primary cursor-pointer"
              />
              <div className="text-xs text-ink leading-relaxed">
                <strong className="font-semibold block text-charcoal">
                  {lang === 'hi' ? 'सत्यापन की पुष्टि:' : 'Mandatory Verification:'}
                </strong>
                <span>
                  {lang === 'hi'
                    ? 'मैंने पुष्टि कर ली है कि ऊपर दिया गया पाठ मेरे लिखे हुए से मेल खाता है।'
                    : 'I have checked this matches what I wrote on paper.'}
                </span>
                {illegibleCount > 0 && (
                  <span className="text-rose-600 block mt-1 font-medium">
                    * You still have {illegibleCount} [illegible] marker(s). Replace or delete them before checking this box.
                  </span>
                )}
              </div>
            </label>
          </div>

          {/* 4. Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <Link
              href="/upload"
              className="w-full sm:w-auto text-center px-4 py-2 text-xs font-medium text-slate hover:text-ink transition-colors"
            >
              ← {lang === 'hi' ? 'वापस फ़ोटो पर जाएं' : 'Back to Upload'}
            </Link>

            <Button
              variant="primary"
              disabled={isAssessDisabled}
              onClick={handleAssess}
              className="w-full sm:w-auto flex items-center justify-center gap-2 shadow-sm font-medium"
            >
              <Sparkles className="w-4 h-4 text-accent-lavender" />
              {assessing
                ? (lang === 'hi' ? 'मूल्यांकन जारी है...' : 'Evaluating Story...')
                : (lang === 'hi' ? 'कहानी का मूल्यांकन करें' : 'Evaluate with AI Assessor')}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Assessing Progress Overlay / Status */}
          {assessing && (
            <div className="p-4 rounded-lg bg-surface border border-hairline flex items-center gap-3 animate-pulse">
              <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin shrink-0" />
              <p className="text-xs text-slate font-medium">{assessmentStepText}</p>
            </div>
          )}

          {/* Privacy Note (Section 13) */}
          <p className="text-[11px] text-steel pt-2 text-center sm:text-left">
            <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
            Your photos are not saved by Veneha. Your photos, your story and the practice picture are sent to Google's Gemini service to read and evaluate them.
          </p>
        </div>
      </div>

      {/* Full Screen Lightbox Modal for Photo Inspection */}
      {enlargeModalOpen && pages[activePhotoIndex] && (
        <div className="fixed inset-0 z-50 bg-ink/90 flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-4xl flex items-center justify-between text-white pb-3">
            <span className="text-sm font-medium">
              Page {activePhotoIndex + 1} of {pages.length}
            </span>
            <button
              type="button"
              onClick={() => setEnlargeModalOpen(false)}
              className="p-1 rounded-md hover:bg-white/20 transition-colors"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="relative max-w-4xl max-h-[80vh] w-full flex items-center justify-center overflow-auto rounded-lg bg-black/40 p-2">
            <img
              src={pages[activePhotoIndex].previewUrl}
              alt={`Full view page ${activePhotoIndex + 1}`}
              className="max-h-[75vh] w-auto object-contain rounded"
            />
          </div>
          {pages.length > 1 && (
            <div className="flex items-center gap-4 mt-4 text-white text-xs">
              <button
                type="button"
                disabled={activePhotoIndex === 0}
                onClick={() => setActivePhotoIndex((i) => Math.max(0, i - 1))}
                className="px-3 py-1.5 rounded bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Previous Page
              </button>
              <span>{activePhotoIndex + 1} / {pages.length}</span>
              <button
                type="button"
                disabled={activePhotoIndex === pages.length - 1}
                onClick={() => setActivePhotoIndex((i) => Math.min(pages.length - 1, i + 1))}
                className="px-3 py-1.5 rounded bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next Page
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
