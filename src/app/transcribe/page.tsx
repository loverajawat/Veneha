'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Edit3, 
  RefreshCw,
  Scale
} from 'lucide-react';
import { PPDTPicture } from '@/data/pictures';
import { getGuest, saveAttempt } from '@/lib/guestStorage';

export default function TranscribePage() {
  const router = useRouter();

  const [transcript, setTranscript] = useState('');
  const [picture, setPicture] = useState<PPDTPicture | null>(null);
  const [assessing, setAssessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [assessmentStepText, setAssessmentStepText] = useState('Initiating psychological evaluation...');

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
      // Default sample if accessed directly
      setTranscript(
        `Perception Box:\nCharacters: 2 (M-22, F-45) | Mood: Positive | Title: Rural Solar Initiative\n\nStory:\nRohan, a 22-year-old agricultural engineering student, noticed while visiting his ancestral village in Rewari that marginal vegetable farmers suffered significant post-harvest spoilage due to frequent power outages. He met the village Sarpanch and proposed a community-run solar cold storage unit using an idle Panchayat shed. After calculating cost estimates, he organized an informal chaupal meeting with 15 farmers to explain the operational model. With collective consensus, he coordinated with a state renewable vendor for subsidized solar panels. Rohan formed a youth team to assist with mounting equipment and trained two local technicians for maintenance. Within three weeks, the unit was commissioned, saving perishable produce for 45 families and increasing their earnings by 25%.`
      );
    }
  }, []);

  const wordCount = transcript.split(/\s+/).filter(Boolean).length;

  const handleAssess = async () => {
    if (!transcript.trim() || transcript.trim().length < 20) {
      setErrorMessage('Please ensure your story contains at least 20 characters before assessment.');
      return;
    }

    setAssessing(true);
    setErrorMessage('');

    // Cycling psychological analysis messages
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
      const customKey = localStorage.getItem('ssb_gemini_custom_key');
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

      // Save to localStorage history
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
    <div className="flex-1 flex flex-col max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-olive-800/80 mb-6">
        <div>
          <span className="text-xs font-bold text-olive-300 uppercase tracking-wider">
            Step 4 of 4: Verify Transcript
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-white mt-1">
            Confirm Your Story Text
          </h1>
          <p className="text-sm text-[#a8baa3] mt-1">
            The AI has converted your handwriting into text. Verify names, numbers, or spelling before the assessment.
          </p>
        </div>

        {/* Stimulus Card Reference */}
        {picture && (
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[#121911] border border-olive-800 shrink-0">
            <img
              src={picture.path}
              alt={picture.title}
              className="w-14 h-11 object-cover rounded-lg border border-olive-700"
            />
            <div className="text-left text-xs">
              <span className="text-gray-400 text-[10px] block">Stimulus Card</span>
              <strong className="text-white text-xs block truncate max-w-[120px]">
                {picture.title}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Editor Box */}
      <div className="p-6 rounded-3xl bg-[#121911] border border-olive-800 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-olive-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-camo-gold" />
            <span className="text-xs font-bold text-olive-300 uppercase tracking-wider">
              Editable Story Transcript
            </span>
          </div>

          {/* Word count meter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">Length:</span>
            <span
              className={`font-bold px-2.5 py-0.5 rounded-full border ${
                wordCount >= 95 && wordCount <= 135
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                  : wordCount < 70
                  ? 'bg-amber-950/80 text-amber-300 border-amber-700'
                  : 'bg-olive-950 text-olive-300 border-olive-700'
              }`}
            >
              {wordCount} words
            </span>
            <span className="text-[11px] text-gray-500 hidden sm:inline">(ideal: 100–130)</span>
          </div>
        </div>

        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          rows={12}
          className="w-full p-4 rounded-2xl bg-[#090f08] border border-olive-800 focus:border-olive-500 focus:ring-1 focus:ring-olive-500 text-white placeholder-gray-500 text-base font-sans leading-relaxed outline-none transition-all resize-y"
          placeholder="Review your transcribed story here..."
        />

        {/* Verification Helper Note */}
        <div className="p-3.5 rounded-2xl bg-olive-950/80 border border-olive-900 text-xs text-olive-200 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Transcript Check Tips: </strong>
            Make sure your protagonist's name, age, and key actions read accurately. If you notice any word marked with [brackets], that was ambiguous in handwriting—replace it with your intended word.
          </div>
        </div>
      </div>

      {/* Error display */}
      {errorMessage && (
        <div className="mt-4 p-3.5 rounded-xl bg-red-950/70 border border-red-700/60 text-xs text-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Assessment Action */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={() => router.push('/upload')}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          &larr; Back to Photo Upload
        </button>

        <button
          onClick={handleAssess}
          disabled={assessing}
          className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-white font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 ${
            assessing
              ? 'bg-olive-900/60 text-gray-400 cursor-not-allowed border border-olive-800'
              : 'bg-gradient-to-r from-olive-600 to-olive-500 hover:from-olive-500 hover:to-olive-400 shadow-olive-950/60'
          }`}
        >
          {assessing ? (
            <>
              <Sparkles className="w-4 h-4 text-camo-gold animate-spin" />
              <span>{assessmentStepText}</span>
            </>
          ) : (
            <>
              <Scale className="w-4 h-4 text-camo-gold" />
              <span>Submit for AI Assessor Evaluation</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

