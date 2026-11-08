'use client';

import React, { useState, useEffect } from 'react';
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
  Eye
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

export default function TranscribePage() {
  const router = useRouter();
  const { lang } = useLanguage();

  const [transcript, setTranscript] = useState('');
  const [picture, setPicture] = useState<PPDTPicture | null>(null);
  const [pages, setPages] = useState<UploadedStoryPage[]>([]);
  const [assessing, setAssessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [assessmentStepText, setAssessmentStepText] = useState('Initiating psychological evaluation...');
  const [previewPageIndex, setPreviewPageIndex] = useState<number | null>(null);

  useEffect(() => {
    const rawPic = sessionStorage.getItem('current_ppdt_picture');
    if (rawPic) {
      try {
        setPicture(JSON.parse(rawPic));
      } catch {}
    }

    const savedTranscript = sessionStorage.getItem('current_story_transcript');
    if (savedTranscript) {
      setTranscript(savedTranscript);
    } else {
      setTranscript(
        `Perception Box:\nCharacters: 2 (M-22, F-45) | Mood: Positive | Title: Rural Solar Initiative\n\nStory:\nRohan, a 22-year-old agricultural engineering student, noticed while visiting his ancestral village in Rewari that marginal vegetable farmers suffered significant post-harvest spoilage due to frequent power outages. He met the village Sarpanch and proposed a community-run solar cold storage unit using an idle Panchayat shed. After calculating cost estimates, he organized an informal chaupal meeting with 15 farmers to explain the operational model. With collective consensus, he coordinated with a state renewable vendor for subsidized solar panels. Rohan formed a youth team to assist with mounting equipment and trained two local technicians for maintenance. Within three weeks, the unit was commissioned, saving perishable produce for 45 families and increasing their earnings by 25%.`
      );
    }

    setPages(getStoryPages());
  }, []);

  const wordCount = transcript.split(/\s+/).filter(Boolean).length;

  const handleAssess = async () => {
    if (!transcript.trim() || transcript.trim().length < 20) {
      setErrorMessage(
        lang === 'hi'
          ? 'कृपया मूल्यांकन से पहले सुनिश्चित करें कि आपकी कहानी में कम से कम 20 अक्षर हैं।'
          : 'Please ensure your story contains at least 20 characters before assessment.'
      );
      return;
    }

    setAssessing(true);
    setErrorMessage('');

    const stepMessages = [
      'Deconstructing 10-75-15 timeline architecture...',
      'Auditing the 4 D\'s (Direct Action, Decision, Delegation, Deployment)...',
      'Scanning for 15 Officer Like Qualities (OLQs)...',
      'Checking against stimulus perception & physical cues...',
      'Synthesizing elevated Model Story and Narration tips...',
    ];

    let msgIdx = 0;
    const msgInterval = setInterval(() => {
      msgIdx = (msgIdx + 1) % stepMessages.length;
      setAssessmentStepText(stepMessages[msgIdx]);
    }, 1800);

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
          storyTranscript: transcript,
          pictureId: picture?.id || 'sample',
          picturePath: picture?.path || '/pictures/ppdt_stimulus_01.jpg',
        }),
      });

      const data = await res.json();
      clearInterval(msgInterval);

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Assessment failed');
      }

      const guest = getGuest();
      const savedAttempt = saveAttempt({
        guestId: guest?.id || 'guest',
        pictureId: picture?.id || 'ppdt-01',
        picturePath: picture?.path || '/pictures/ppdt_stimulus_01.jpg',
        transcript: transcript,
        feedback: data.feedback,
        score: data.feedback?.summaryRating?.overallScore || 7.5,
      });

      sessionStorage.setItem('current_assessment_result', JSON.stringify(data.feedback));
      sessionStorage.setItem('last_attempt_id', savedAttempt.id);
      router.push('/result');
    } catch (err: any) {
      clearInterval(msgInterval);
      console.error(err);
      setErrorMessage(err.message || 'Error processing assessment. Please retry.');
      setAssessing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full font-sans space-y-6 text-ink">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-hairline">
        <div>
          <span className="text-[12px] font-semibold text-steel uppercase tracking-wider">
            {lang === 'hi' ? 'चरण 4 / 4: ट्रांसक्रिप्ट समीक्षा' : 'Step 4 of 4: Verify Transcript'}
          </span>
          <h1 className="text-[32px] font-semibold text-ink tracking-tight mt-0.5">
            {lang === 'hi' ? 'कहानी पाठ की पुष्टि करें' : 'Confirm Your Story Text'}
          </h1>
          <p className="text-[15px] text-slate mt-1 max-w-xl">
            {lang === 'hi'
              ? 'AI ने आपके हस्तलेखन को पाठ में बदल दिया है। मूल्यांकन से पहले नाम, वर्तनी या वाक्य ठीक कर लें।'
              : 'The AI has converted your handwriting into text. Verify names, numbers, or spelling before the assessment.'}
          </p>
        </div>

        {/* Stimulus Card Reference */}
        {picture && (
          <div className="flex items-center gap-3 p-2.5 rounded-md bg-surface border border-hairline shrink-0">
            <img
              src={picture.path}
              alt={picture.title}
              className="w-14 h-11 object-cover rounded-md border border-hairline"
            />
            <div className="text-left text-xs">
              <span className="text-steel text-[11px] block">
                {lang === 'hi' ? 'अभ्यास चित्र' : 'Stimulus Card'}
              </span>
              <strong className="text-ink text-[13px] block truncate max-w-[120px]">
                {picture.title}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Story Pages Reference Strip */}
      {pages.length > 0 && (
        <div className="p-4 rounded-lg bg-surface border border-hairline space-y-3">
          <div className="flex items-center justify-between text-xs text-slate">
            <span className="font-semibold text-charcoal">
              {lang === 'hi' ? 'मूल हस्तलिखित पृष्ठ संदर्भ:' : 'Original Handwritten Pages Reference:'}
            </span>
            <span>
              {pages.length} {lang === 'hi' ? 'पृष्ठ' : `page${pages.length > 1 ? 's' : ''}`}
            </span>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {pages.map((p, idx) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPreviewPageIndex(idx)}
                className="group relative w-16 h-20 rounded-md border border-hairline overflow-hidden bg-canvas hover:ring-2 hover:ring-primary shrink-0 transition-all cursor-pointer"
                title={`View Page ${idx + 1}`}
              >
                <img
                  src={p.previewUrl}
                  alt={`Handwritten page ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 inset-x-0 bg-ink/75 text-white text-[10px] text-center font-medium py-0.5">
                  Page {idx + 1}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Editor Box */}
      <CardBase className="space-y-4 p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-primary" />
            <span className="text-[13px] font-semibold text-ink uppercase tracking-wider">
              {lang === 'hi' ? 'संपादनीय कहानी ट्रांसक्रिप्ट' : 'Editable Story Transcript'}
            </span>
          </div>

          {/* Word count meter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate">{lang === 'hi' ? 'शब्द:' : 'Length:'}</span>
            <span
              className={`font-semibold px-2.5 py-0.5 rounded-full border text-[12px] ${
                wordCount >= 95 && wordCount <= 135
                  ? 'bg-card-tint-mint text-brand-green border-brand-green/30'
                  : wordCount < 70
                  ? 'bg-card-tint-peach text-brand-orange border-brand-orange/30'
                  : 'bg-surface text-charcoal border-hairline'
              }`}
            >
              {wordCount} {lang === 'hi' ? 'शब्द' : 'words'}
            </span>
            <span className="text-[11px] text-steel hidden sm:inline">
              {lang === 'hi' ? '(आदर्श: 100–130)' : '(ideal: 100–130)'}
            </span>
          </div>
        </div>

        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={12}
          className="w-full p-4 rounded-md bg-canvas border border-hairline-strong focus:border-primary outline-none focus:ring-0 text-ink placeholder:text-muted text-[15px] font-sans leading-relaxed transition-all resize-y"
          placeholder="Review your transcribed story here..."
        />

        {/* Verification Helper Note */}
        <div className="p-3.5 rounded-md bg-surface border border-hairline text-[13px] text-charcoal flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
          <div>
            <strong className="text-ink">
              {lang === 'hi' ? 'सुझाव: ' : 'Transcript Check Tips: '}
            </strong>
            <span>
              {lang === 'hi'
                ? 'सुनिश्चित करें कि मुख्य पात्र का नाम, आयु और मुख्य कार्य सही पढ़े गए हैं। यदि कोई शब्द [ब्रैकेट] में है, तो वह धुंधला था—उसे अपने इच्छित शब्द से बदलें।'
                : 'Make sure your protagonist\'s name, age, and key actions read accurately. If you notice any word marked with [brackets], that was ambiguous in handwriting—replace it with your intended word.'}
            </span>
          </div>
        </div>
      </CardBase>

      {/* Error display */}
      {errorMessage && (
        <Alert type="error" title={lang === 'hi' ? 'त्रुटि' : 'Error'}>
          {errorMessage}
        </Alert>
      )}

      {/* Assessment Action */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <Button
          variant="secondary"
          onClick={() => router.push('/upload')}
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>{lang === 'hi' ? 'फोटो अपलोड पर वापस जाएं' : 'Back to Photo Upload'}</span>
        </Button>

        <Button
          variant="primary"
          onClick={handleAssess}
          disabled={assessing}
          className="w-full sm:w-auto"
        >
          {assessing ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>{assessmentStepText}</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <span>
                {lang === 'hi' ? 'AI मूल्यांकन के लिए भेजें' : 'Submit for AI Assessor Evaluation'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>
      </div>

      {/* Lightbox Modal for Thumbnail Reference */}
      {previewPageIndex !== null && pages[previewPageIndex] && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-canvas max-w-xl w-full rounded-lg shadow-level4 border border-hairline overflow-hidden p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-[15px] text-ink">
                Page {previewPageIndex + 1} of {pages.length}
              </span>
              <button
                type="button"
                onClick={() => setPreviewPageIndex(null)}
                className="p-1 rounded-md text-steel hover:text-ink cursor-pointer"
              >
                ✕
              </button>
            </div>
            <img
              src={pages[previewPageIndex].previewUrl}
              alt={`Page ${previewPageIndex + 1}`}
              className="max-h-[65vh] w-auto mx-auto object-contain rounded-md border border-hairline"
            />
          </div>
        </div>
      )}
    </div>
  );
}
