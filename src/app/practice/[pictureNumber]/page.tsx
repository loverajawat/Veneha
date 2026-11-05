'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Clock, 
  Play, 
  ArrowLeft, 
  CheckCircle2, 
  FileText, 
  Eye, 
  Volume2, 
  VolumeX, 
  X,
  AlertCircle
} from 'lucide-react';
import { PPDTPicture, getPictureByNumber } from '@/data/pictures';
import { canAttemptToday } from '@/lib/guestStorage';
import { useLanguage } from '@/context/LanguageContext';
import { siteConfig } from '@/config/siteConfig';

export default function SinglePicturePracticePage() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useLanguage();

  const rawNum = params?.pictureNumber;
  const pictureNumber = typeof rawNum === 'string' ? parseInt(rawNum, 10) : Array.isArray(rawNum) ? parseInt(rawNum[0], 10) : NaN;
  const initialPicture = !isNaN(pictureNumber) ? getPictureByNumber(pictureNumber) : null;
  
  const [picture, setPicture] = useState<PPDTPicture | null>(initialPicture);
  const [notFound, setNotFound] = useState(!initialPicture);

  const [step, setStep] = useState<'ready' | 'picture' | 'writing'>('ready');

  // Timers (Clock-time based delta - Unchanged)
  const PICTURE_DURATION_SEC = 30;
  const WRITING_DURATION_SEC = 240; // 4 minutes

  const [timeLeft, setTimeLeft] = useState<number>(PICTURE_DURATION_SEC);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const startTimeRef = useRef<number | null>(null);
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);

  // Sync picture in sessionStorage
  useEffect(() => {
    if (initialPicture) {
      sessionStorage.setItem('current_ppdt_picture', JSON.stringify(initialPicture));
      sessionStorage.setItem('last_practiced_pic_id', initialPicture.id);
    }
  }, [initialPicture]);

  // Focus mode during picture or writing
  useEffect(() => {
    if (step === 'picture' || step === 'writing') {
      document.body.classList.add('focus-mode');
    } else {
      document.body.classList.remove('focus-mode');
    }
    return () => {
      document.body.classList.remove('focus-mode');
    };
  }, [step]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerIdRef.current) clearInterval(timerIdRef.current);
      document.body.classList.remove('focus-mode');
    };
  }, []);

  // Web Audio chime
  const playBeep = (freq = 600, duration = 0.15) => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  };

  // Exit with confirmation
  const handleExit = () => {
    if (window.confirm('Exit practice session? Your current timer will be reset.')) {
      if (timerIdRef.current) clearInterval(timerIdRef.current);
      document.body.classList.remove('focus-mode');
      setStep('ready');
      setTimeLeft(PICTURE_DURATION_SEC);
      router.push('/practice');
    }
  };

  // Step 1: Start 30s Picture Phase
  const handleStartPicture = () => {
    if (!canAttemptToday()) {
      alert(lang === 'hi' ? siteConfig.practiceGrid.dailyLimitMessage.hi : siteConfig.practiceGrid.dailyLimitMessage.en);
      return;
    }

    setStep('picture');
    setTimeLeft(PICTURE_DURATION_SEC);
    startTimeRef.current = Date.now();
    playBeep(440, 0.2);

    if (timerIdRef.current) clearInterval(timerIdRef.current);

    timerIdRef.current = setInterval(() => {
      if (!startTimeRef.current) return;
      const elapsedSec = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, PICTURE_DURATION_SEC - elapsedSec);
      setTimeLeft(remaining);

      // Warning beeps in last 3 seconds
      if (remaining <= 3 && remaining > 0) {
        playBeep(520, 0.1);
      }

      if (remaining <= 0) {
        if (timerIdRef.current) clearInterval(timerIdRef.current);
        playBeep(880, 0.4);
        handleStartWriting();
      }
    }, 250);
  };

  // Step 2: Start 4-Minute Writing Phase
  const handleStartWriting = () => {
    setStep('writing');
    setTimeLeft(WRITING_DURATION_SEC);
    startTimeRef.current = Date.now();

    if (timerIdRef.current) clearInterval(timerIdRef.current);

    timerIdRef.current = setInterval(() => {
      if (!startTimeRef.current) return;
      const elapsedSec = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = Math.max(0, WRITING_DURATION_SEC - elapsedSec);
      setTimeLeft(remaining);

      if (remaining === 60) {
        playBeep(700, 0.3);
      }
      if (remaining === 30) {
        playBeep(750, 0.35);
      }
      if (remaining <= 0) {
        if (timerIdRef.current) clearInterval(timerIdRef.current);
        playBeep(900, 0.5);
      }
    }, 250);
  };

  // Move to Photo Upload
  const handleProceedToUpload = () => {
    if (timerIdRef.current) clearInterval(timerIdRef.current);
    document.body.classList.remove('focus-mode');
    if (picture) {
      sessionStorage.setItem('last_practiced_pic_id', picture.id);
      sessionStorage.setItem('current_ppdt_picture', JSON.stringify(picture));
    }
    router.push('/upload');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Not Found view
  if (notFound || (!picture && isNaN(pictureNumber))) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-olive-900/60 border border-olive-700/60 flex items-center justify-center text-camo-gold mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-white mb-2">
          {lang === 'hi' ? siteConfig.practiceGrid.pictureNotFound.hi : siteConfig.practiceGrid.pictureNotFound.en}
        </h1>
        <p className="text-sm text-[#a8baa3] mb-6 max-w-md">
          {lang === 'hi' ? 'अनुरोधित चित्र संख्या उपलब्ध नहीं है।' : 'The requested picture number does not exist in the collection.'}
        </p>
        <Link
          href="/practice"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-olive-600 hover:bg-olive-500 text-white font-semibold text-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'hi' ? siteConfig.practiceGrid.backToPictures.hi : siteConfig.practiceGrid.backToPictures.en}</span>
        </Link>
      </div>
    );
  }

  const prefix = lang === 'hi' ? siteConfig.practiceGrid.picturePrefix.hi : siteConfig.practiceGrid.picturePrefix.en;
  const pictureTitle = `${prefix} ${pictureNumber}`;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 max-w-4xl mx-auto w-full font-sans">
      {/* PHASE 0: READY SCREEN */}
      {step === 'ready' && (
        <div className="w-full bg-[#121911] border border-olive-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fade-in">
          {/* Back Navigation + Sound Toggle */}
          <div className="flex items-center justify-between border-b border-olive-800/80 pb-4">
            <Link
              href="/practice"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-olive-300 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>{lang === 'hi' ? siteConfig.practiceGrid.backToPictures.hi : siteConfig.practiceGrid.backToPictures.en}</span>
            </Link>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-olive-950/80 border border-olive-800 text-gray-300 hover:text-white transition-colors"
              title="Toggle Timer Chimes"
              aria-label={soundEnabled ? "Timer chimes on" : "Timer chimes muted"}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-camo-gold" />
                  <span>{lang === 'hi' ? 'ध्वनि चालू' : 'Sound On'}</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-[#a8baa3]" />
                  <span>{lang === 'hi' ? 'म्यूट' : 'Muted'}</span>
                </>
              )}
            </button>
          </div>

          {/* Heading */}
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-white">
              {pictureTitle}
            </h1>
            <p className="text-xs sm:text-sm text-[#a8baa3] mt-1">
              {lang === 'hi' 
                ? '30 सेकंड चित्र अवलोकन · 4 मिनट हस्तलिखित कहानी लेखन'
                : '30s Picture Observation · 4-Minute Handwritten Story Writing'}
            </p>
          </div>

          {/* Two Phase Explanation Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 sm:p-5 rounded-2xl bg-[#0e140d] border border-olive-900/80 space-y-2">
              <h2 className="font-bold text-white flex items-center gap-1.5 text-xs sm:text-sm uppercase tracking-wider text-olive-300">
                <Eye className="w-4 h-4 text-camo-gold" />
                {lang === 'hi' ? 'चरण 1: 30 सेकंड चित्र अवलोकन' : 'Phase 1: 30-Second Picture View'}
              </h2>
              <p className="text-[#a8baa3] leading-relaxed text-xs sm:text-sm">
                {lang === 'hi' 
                  ? 'स्क्रीन पर परीक्षा-शैली का चित्र आएगा। मुख्य संकेत देखें:'
                  : 'An exam-style picture will appear. Observe the key cues:'}
              </p>
              <ul className="space-y-1 text-[#a8baa3] text-xs sm:text-sm pl-2">
                <li>• <strong>{lang === 'hi' ? 'पात्र:' : 'Characters:'}</strong> {lang === 'hi' ? 'संख्या, आयु और लिंग।' : 'Number of figures, age & gender.'}</li>
                <li>• <strong>{lang === 'hi' ? 'मनोदशा:' : 'Mood:'}</strong> Positive (+), Neutral (0), Negative (-).</li>
                <li>• <strong>{lang === 'hi' ? 'परिवेश:' : 'Setting:'}</strong> {lang === 'hi' ? 'ग्रामीण, शहरी, इनडोर या खुला क्षेत्र।' : 'Rural, urban, indoor, or field.'}</li>
              </ul>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-[#0e140d] border border-olive-900/80 space-y-2">
              <h2 className="font-bold text-white flex items-center gap-1.5 text-xs sm:text-sm uppercase tracking-wider text-olive-300">
                <FileText className="w-4 h-4 text-camo-gold" />
                {lang === 'hi' ? 'चरण 2: 4 मिनट कहानी लेखन' : 'Phase 2: 4-Minute Story Writing'}
              </h2>
              <p className="text-[#a8baa3] leading-relaxed text-xs sm:text-sm">
                {lang === 'hi' ? '10-75-15 नियम के अनुसार कागज पर पेन से लिखें:' : 'Write on paper with pen following the 10-75-15 rule:'}
              </p>
              <ul className="space-y-1 text-[#a8baa3] text-xs sm:text-sm pl-2">
                <li>• <strong>10% Setup:</strong> {lang === 'hi' ? 'मुख्य पात्र का नाम, आयु, संदर्भ।' : 'Protagonist name, age, context (1 sentence).'}</li>
                <li>• <strong>75% Action:</strong> {lang === 'hi' ? 'व्यवस्थित प्रत्यक्ष कार्य एवं टीमवर्क।' : 'Methodical, hands-on action and teamwork.'}</li>
                <li>• <strong>15% Resolution:</strong> {lang === 'hi' ? 'सकारात्मक तार्किक परिणाम।' : 'Earned positive outcome.'}</li>
              </ul>
            </div>
          </div>

          {/* Paper and Pen Ready Reminder */}
          <div className="p-4 rounded-2xl bg-olive-950/70 border border-olive-700/60 flex items-start gap-3 text-xs sm:text-sm text-[#a8baa3]">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white font-semibold">
                {lang === 'hi' ? 'कागज और पेन तैयार रखें: ' : 'Have paper and pen ready: '}
              </strong>
              {lang === 'hi'
                ? 'समय शुरू होते ही अपनी कहानी कागज पर लिखें। 4 मिनट पूरे होने पर तुरंत AI फीडबैक के लिए फोटो लें।'
                : 'When time starts, write your story on paper. At the end of 4 minutes, you will take a photo of your paper to receive instant AI feedback.'}
            </div>
          </div>

          {/* Prominent Begin Button (Timer only starts after clicking this) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs sm:text-sm text-[#a8baa3]">
              {lang === 'hi' ? 'तैयार होने पर बटन दबाएं' : 'Press begin when ready to observe the picture'}
            </div>

            <button
              onClick={handleStartPicture}
              className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-xl bg-olive-600 hover:bg-olive-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-olive-950/60 transition-all flex items-center justify-center gap-2 group"
            >
              <Play className="w-4 h-4 text-camo-gold fill-camo-gold group-hover:scale-110 transition-transform" />
              <span>{lang === 'hi' ? siteConfig.practiceGrid.begin.hi : siteConfig.practiceGrid.begin.en}</span>
            </button>
          </div>
        </div>
      )}

      {/* PHASE 1: 30-SECOND PICTURE VIEW (Focus Mode) */}
      {step === 'picture' && picture && (
        <div className="w-full min-h-[85vh] flex flex-col items-center justify-center space-y-4 animate-fade-in py-4">
          <div className="w-full max-w-2xl flex items-center justify-between px-2">
            <button
              onClick={handleExit}
              className="px-3 py-1.5 rounded-lg border border-red-900/60 bg-red-950/40 text-red-300 hover:text-white hover:bg-red-900/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Exit Practice</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-olive-300 px-2 py-1 rounded bg-olive-950 border border-olive-800">
                {pictureTitle}
              </span>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-lg bg-olive-950 border border-olive-800 text-gray-300 hover:text-white"
                title="Toggle Sound"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-camo-gold" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
              </button>
            </div>
          </div>

          {/* Picture Box */}
          <div className="relative w-full max-w-2xl bg-black rounded-3xl overflow-hidden border-2 border-olive-600/80 shadow-2xl shadow-olive-950 flex items-center justify-center min-h-[380px] max-h-[65vh]">
            <img
              src={picture.path}
              alt={picture.title}
              className="max-h-[62vh] w-auto object-contain select-none"
              onContextMenu={(e) => e.preventDefault()}
            />

            {/* Timer Badge Floating */}
            <div className="absolute top-4 right-4 px-4 py-2 rounded-2xl bg-black/80 backdrop-blur-md border border-olive-500/80 flex items-center gap-2 shadow-xl">
              <Clock className="w-4 h-4 text-camo-gold animate-spin" style={{ animationDuration: '4s' }} />
              <span className="font-mono font-black text-xl text-white tracking-widest">
                {String(timeLeft).padStart(2, '0')}s
              </span>
            </div>
          </div>

          <div className="w-full max-w-2xl text-center space-y-1">
            <div className="text-xs sm:text-sm font-semibold text-olive-200">
              {lang === 'hi' ? 'पात्र, उनकी आयु, मनोदशा और परिवेश का अवलोकन करें' : 'Observe characters, mood, setting, and potential action'}
            </div>
            <p className="text-xs text-[#a8baa3]">
              {lang === 'hi' 
                ? 'समय समाप्त होने पर स्वतः 4 मिनट का लेखन टाइमर शुरू होगा' 
                : 'Writing timer starts automatically when 30s expires'}
            </p>
          </div>
        </div>
      )}

      {/* PHASE 2: 4-MINUTE WRITING TIMER (Focus Mode) */}
      {step === 'writing' && (
        <div className="w-full min-h-[85vh] flex flex-col items-center justify-center space-y-6 animate-fade-in py-4 max-w-2xl">
          <div className="w-full flex items-center justify-between px-2">
            <button
              onClick={handleExit}
              className="px-3 py-1.5 rounded-lg border border-red-900/60 bg-red-950/40 text-red-300 hover:text-white hover:bg-red-900/60 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Exit Practice</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-olive-300 px-2 py-1 rounded bg-olive-950 border border-olive-800">
                {pictureTitle}
              </span>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-1.5 rounded-lg bg-olive-950 border border-olive-800 text-gray-300 hover:text-white"
                title="Toggle Sound"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-camo-gold" /> : <VolumeX className="w-4 h-4 text-gray-500" />}
              </button>
            </div>
          </div>

          {/* Huge Timer Display */}
          <div className="w-full p-8 rounded-3xl bg-[#111710] border-2 border-olive-700/80 shadow-2xl text-center space-y-4">
            <div className="text-xs font-bold text-olive-300 uppercase tracking-widest">
              {lang === 'hi' ? 'कहानी लेखन समय' : 'Story Writing Time Remaining'}
            </div>

            <div
              className={`font-mono text-6xl sm:text-7xl font-black tracking-tight transition-colors duration-300 ${
                timeLeft <= 30
                  ? 'text-red-400 animate-pulse'
                  : timeLeft <= 60
                  ? 'text-amber-400'
                  : 'text-white'
              }`}
            >
              {formatTime(timeLeft)}
            </div>

            {/* Time progress bar */}
            <div className="w-full bg-[#182317] h-3 rounded-full overflow-hidden border border-olive-800/80">
              <div
                className={`h-full transition-all duration-300 ${
                  timeLeft <= 30
                    ? 'bg-red-500'
                    : timeLeft <= 60
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-olive-500 to-camo-gold'
                }`}
                style={{ width: `${(timeLeft / WRITING_DURATION_SEC) * 100}%` }}
              />
            </div>

            <p className="text-xs text-[#a8baa3] pt-1">
              {timeLeft > 0
                ? (lang === 'hi' ? 'कागज पर पेन से लिखें। 10-75-15 संरचना का पालन करें।' : 'Writing on real paper. Follow the 10-75-15 rule.')
                : (lang === 'hi' ? 'समय समाप्त! नीचे बटन दबाकर फोटो अपलोड करें।' : 'Time complete! Proceed to upload your handwritten sheet.')}
            </p>
          </div>

          {/* 10-75-15 Structure Checklist */}
          <div className="w-full p-5 rounded-2xl bg-[#0e140d] border border-olive-800/70 text-xs sm:text-sm space-y-2 text-[#a8baa3]">
            <div className="font-bold text-white text-xs uppercase tracking-wider text-camo-gold">
              {lang === 'hi' ? 'कथा संरचना रिमाइंडर:' : 'Story Structure Reminder:'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <div className="p-2.5 rounded-lg bg-olive-950 border border-olive-900">
                <strong className="text-white block">10% Setup</strong>
                {lang === 'hi' ? 'पात्र, आयु, क्या स्थिति बनी' : 'Who, age, background context'}
              </div>
              <div className="p-2.5 rounded-lg bg-olive-950 border border-olive-900">
                <strong className="text-white block">75% Action</strong>
                {lang === 'hi' ? 'तार्किक कदम, कार्य, टीमवर्क' : 'Concrete execution steps & 4Ds'}
              </div>
              <div className="p-2.5 rounded-lg bg-olive-950 border border-olive-900">
                <strong className="text-white block">15% Resolution</strong>
                {lang === 'hi' ? 'सकारात्मक तार्किक समाधान' : 'Practical positive conclusion'}
              </div>
            </div>
          </div>

          {/* Next CTA: Upload Photo */}
          <button
            onClick={handleProceedToUpload}
            className="w-full min-h-[50px] px-8 py-4 rounded-xl bg-gradient-to-r from-olive-600 to-olive-500 hover:from-olive-500 hover:to-olive-400 text-white font-bold text-base shadow-2xl shadow-olive-950/80 transition-all flex items-center justify-center gap-2 group border border-olive-400/50"
          >
            <span>{lang === 'hi' ? 'हस्तलिखित कहानी का फोटो अपलोड करें' : 'Proceed to Photo Upload'}</span>
            <span className="text-camo-gold group-hover:translate-x-1 transition-transform">&rarr;</span>
          </button>
        </div>
      )}
    </div>
  );
}
