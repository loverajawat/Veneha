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
import { 
  Button, 
  CardBase, 
  FeatureCard, 
  TagChip 
} from '@/components/ui';

export default function SinglePicturePracticePage() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useLanguage();

  const rawNum = params?.pictureNumber;
  const pictureNumber =
    typeof rawNum === 'string'
      ? parseInt(rawNum, 10)
      : Array.isArray(rawNum)
      ? parseInt(rawNum[0], 10)
      : NaN;
  const initialPicture = !isNaN(pictureNumber) ? getPictureByNumber(pictureNumber) : null;

  const [picture, setPicture] = useState<PPDTPicture | null>(initialPicture);
  const [notFound, setNotFound] = useState(!initialPicture);

  const [step, setStep] = useState<'ready' | 'picture' | 'writing'>('ready');
  const [paperReadyConfirmed, setPaperReadyConfirmed] = useState(false);

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
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-ink max-w-md mx-auto">
        <div className="w-12 h-12 rounded-lg bg-card-tint-rose text-semantic-error flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h1 className="text-[26px] font-semibold text-ink mb-2">
          {lang === 'hi' ? siteConfig.practiceGrid.pictureNotFound.hi : siteConfig.practiceGrid.pictureNotFound.en}
        </h1>
        <p className="text-[14px] text-slate mb-6">
          {lang === 'hi' ? 'अनुरोधित चित्र संख्या उपलब्ध नहीं है।' : 'The requested picture number does not exist in the collection.'}
        </p>
        <Link href="/practice">
          <Button variant="secondary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span>{lang === 'hi' ? siteConfig.practiceGrid.backToPictures.hi : siteConfig.practiceGrid.backToPictures.en}</span>
          </Button>
        </Link>
      </div>
    );
  }

  const prefix = lang === 'hi' ? siteConfig.practiceGrid.picturePrefix.hi : siteConfig.practiceGrid.picturePrefix.en;
  const pictureTitle = `${prefix} ${pictureNumber}`;

  return (
    <div className="flex-1 flex flex-col items-center justify-center font-sans text-ink">
      {/* =========================================
          PHASE 0: READY SCREEN (White canvas)
         ========================================= */}
      {step === 'ready' && (
        <div className="w-full max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Back Navigation + Sound Toggle */}
          <div className="flex items-center justify-between border-b border-hairline pb-4">
            <Link
              href="/practice"
              className="inline-flex items-center gap-2 text-[14px] font-medium text-link-blue hover:underline"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'hi' ? siteConfig.practiceGrid.backToPictures.hi : siteConfig.practiceGrid.backToPictures.en}</span>
            </Link>

            <Button
              variant="ghost"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-[13px] text-charcoal flex items-center gap-1.5"
              title="Toggle Timer Chimes"
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-primary" />
                  <span>{lang === 'hi' ? 'ध्वनि चालू' : 'Sound On'}</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-steel" />
                  <span>{lang === 'hi' ? 'म्यूट' : 'Muted'}</span>
                </>
              )}
            </Button>
          </div>

          {/* Heading */}
          <div>
            <h1 className="text-[32px] md:text-[36px] font-semibold text-ink tracking-tight">
              {pictureTitle}
            </h1>
            <p className="text-[15px] text-slate mt-1">
              {lang === 'hi'
                ? '30 सेकंड चित्र अवलोकन · 4 मिनट हस्तलिखित कहानी लेखन'
                : '30s Picture Observation · 4-Minute Handwritten Story Writing'}
            </p>
          </div>

          {/* Two Phase Cards (30s in Sky, 4m in Peach) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FeatureCard tint="sky" className="p-6 space-y-2">
              <h2 className="text-[16px] font-semibold text-ink flex items-center gap-1.5 uppercase tracking-wide">
                <Eye className="w-4 h-4 text-link-blue" />
                <span>{lang === 'hi' ? 'चरण 1: 30 सेकंड अवलोकन' : 'Phase 1: 30-Second View'}</span>
              </h2>
              <p className="text-[14px] text-charcoal leading-relaxed">
                {lang === 'hi' ? 'स्क्रीन पर धुंधला चित्र आएगा। मुख्य संकेत देखें:' : 'An exam-style picture will appear. Observe the key cues:'}
              </p>
              <ul className="space-y-1 text-[13px] text-charcoal pl-2">
                <li>• <strong>Characters:</strong> Number of figures, age &amp; gender.</li>
                <li>• <strong>Mood:</strong> Positive (+), Neutral (0), Negative (-).</li>
                <li>• <strong>Setting:</strong> Rural, urban, indoor, or outdoor field.</li>
              </ul>
            </FeatureCard>

            <FeatureCard tint="peach" className="p-6 space-y-2">
              <h2 className="text-[16px] font-semibold text-ink flex items-center gap-1.5 uppercase tracking-wide">
                <FileText className="w-4 h-4 text-brand-orange" />
                <span>{lang === 'hi' ? 'चरण 2: 4 मिनट कहानी लेखन' : 'Phase 2: 4-Minute Writing'}</span>
              </h2>
              <p className="text-[14px] text-charcoal leading-relaxed">
                {lang === 'hi' ? '10-75-15 संरचना के अनुसार कागज पर पेन से लिखें:' : 'Write on paper with pen following the 10-75-15 rule:'}
              </p>
              <ul className="space-y-1 text-[13px] text-charcoal pl-2">
                <li>• <strong>10% Setup:</strong> Protagonist name, age, situation (1 sentence).</li>
                <li>• <strong>75% Action:</strong> Methodical hands-on actions and team effort.</li>
                <li>• <strong>15% Resolution:</strong> Logical, earned positive outcome.</li>
              </ul>
            </FeatureCard>
          </div>

          {/* Paper and Pen Ready Reminder on card-tint-yellow */}
          <FeatureCard tint="yellow" className="p-5 flex items-start gap-3.5">
            <input
              type="checkbox"
              id="paper-ready-ppdt"
              checked={paperReadyConfirmed}
              onChange={(e) => setPaperReadyConfirmed(e.target.checked)}
              className="w-5 h-5 mt-0.5 rounded-sm border-hairline-strong text-primary focus:ring-primary cursor-pointer"
            />
            <label htmlFor="paper-ready-ppdt" className="text-[14px] text-charcoal cursor-pointer select-none">
              <strong className="text-ink font-semibold">I have paper and pen ready: </strong>
              When time starts, write your story on paper. At the end of 4 minutes, you will take a photo to receive instant AI feedback.
            </label>
          </FeatureCard>

          {/* Begin Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-hairline">
            <span className="text-[13px] text-slate">
              Once you click Begin, the 30-second picture observation will start immediately.
            </span>
            <Button
              variant="primary"
              onClick={handleStartPicture}
              disabled={!paperReadyConfirmed}
              className="text-[15px] px-8 py-3 w-full sm:w-auto"
            >
              <Play className="w-4 h-4 fill-white mr-2" />
              <span>{lang === 'hi' ? siteConfig.practiceGrid.begin.hi : siteConfig.practiceGrid.begin.en}</span>
            </Button>
          </div>
        </div>
      )}

      {/* ========================================================
          PHASE 1: 30-SECOND PICTURE VIEW (Focus Mode, Brand Navy)
         ======================================================== */}
      {step === 'picture' && picture && (
        <div className="fixed inset-0 z-50 bg-brand-navy text-on-dark flex flex-col justify-between p-6 sm:p-10 select-none">
          {/* Top Bar inside focus screen */}
          <div className="flex items-center justify-between max-w-4xl mx-auto w-full">
            <Button variant="secondary-on-dark" onClick={handleExit} className="text-[13px] py-1.5 px-3">
              <X className="w-3.5 h-3.5 mr-1.5" />
              <span>Exit Practice</span>
            </Button>

            <span className="text-[12px] font-semibold text-on-dark-muted uppercase tracking-widest">
              Phase 1 · 30-Second Picture Observation
            </span>

            <Button
              variant="ghost"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-on-dark hover:bg-white/10"
              title="Toggle Sound"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-brand-purple-300" /> : <VolumeX className="w-4 h-4 text-on-dark-muted" />}
            </Button>
          </div>

          {/* Picture Container (Centred, 12px radius, shadow level 3) */}
          <div className="flex-1 flex flex-col items-center justify-center my-4 max-w-3xl mx-auto w-full">
            <div className="relative rounded-lg overflow-hidden shadow-level3 border border-brand-navy-mid bg-black max-h-[65vh] flex items-center justify-center">
              <img
                src={picture.path}
                alt={picture.title}
                className="max-h-[62vh] w-auto object-contain select-none pointer-events-none"
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          </div>

          {/* Bottom Countdown & Progress on Navy */}
          <div className="max-w-md mx-auto w-full text-center space-y-2">
            <div
              className={`font-sans text-[44px] font-semibold tracking-tight transition-colors ${
                timeLeft <= 5 ? 'text-brand-orange animate-pulse' : 'text-on-dark'
              }`}
            >
              {timeLeft}s
            </div>

            {/* Progress bar: brand-navy-mid track with brand-purple-300 fill; last seconds orange */}
            <div className="w-full bg-brand-navy-mid h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-250 rounded-full ${
                  timeLeft <= 5 ? 'bg-brand-orange' : 'bg-brand-purple-300'
                }`}
                style={{ width: `${(timeLeft / PICTURE_DURATION_SEC) * 100}%` }}
              />
            </div>

            <p className="text-[12px] text-on-dark-muted uppercase tracking-wider pt-1">
              Writing timer will begin automatically
            </p>
          </div>
        </div>
      )}

      {/* ========================================================
          PHASE 2: 4-MINUTE WRITING TIMER (Focus Mode, Brand Navy)
         ======================================================== */}
      {step === 'writing' && (
        <div className="fixed inset-0 z-50 bg-brand-navy text-on-dark flex flex-col justify-between p-6 sm:p-10 select-none">
          {/* Top Bar inside focus screen */}
          <div className="flex items-center justify-between max-w-2xl mx-auto w-full">
            <Button variant="secondary-on-dark" onClick={handleExit} className="text-[13px] py-1.5 px-3">
              <X className="w-3.5 h-3.5 mr-1.5" />
              <span>Exit Practice</span>
            </Button>

            <span className="text-[12px] font-semibold text-on-dark-muted uppercase tracking-widest">
              Phase 2 · 4-Minute Story Writing
            </span>

            <Button
              variant="ghost"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-on-dark hover:bg-white/10"
              title="Toggle Sound"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-brand-purple-300" /> : <VolumeX className="w-4 h-4 text-on-dark-muted" />}
            </Button>
          </div>

          {/* Central Large Timer Numerals on Navy */}
          <div className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full text-center space-y-6">
            <div className="space-y-3">
              <div className="text-[13px] font-semibold uppercase tracking-widest text-on-dark-muted">
                Time Remaining on Paper
              </div>

              {/* Very large white numerals in sans-serif; switches to brand-orange in last 30s */}
              <div
                className={`font-sans text-[72px] sm:text-[88px] font-semibold tracking-tight transition-colors ${
                  timeLeft <= 30
                    ? 'text-brand-orange animate-pulse'
                    : 'text-on-dark'
                }`}
              >
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* Progress bar: brand-navy-mid track with brand-purple-300 fill */}
            <div className="w-full bg-brand-navy-mid h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  timeLeft <= 30 ? 'bg-brand-orange' : 'bg-brand-purple-300'
                }`}
                style={{ width: `${(timeLeft / WRITING_DURATION_SEC) * 100}%` }}
              />
            </div>

            {/* Structure reminder card */}
            <div className="w-full p-4 rounded-lg bg-brand-navy-deep border border-brand-navy-mid text-[13px] text-on-dark-muted grid grid-cols-3 gap-2 text-center">
              <div>
                <strong className="text-on-dark block font-semibold">10% Setup</strong>
                <span>Who &amp; Context</span>
              </div>
              <div className="border-x border-brand-navy-mid px-2">
                <strong className="text-on-dark block font-semibold">75% Action</strong>
                <span>Direct 4Ds &amp; Effort</span>
              </div>
              <div>
                <strong className="text-on-dark block font-semibold">15% Resolution</strong>
                <span>Earned Outcome</span>
              </div>
            </div>
          </div>

          {/* Bottom Action: Proceed to Upload Button */}
          <div className="max-w-md mx-auto w-full text-center pt-2">
            <Button
              variant="on-dark"
              onClick={handleProceedToUpload}
              fullWidth
              className="text-[15px] py-3.5"
            >
              <span>{timeLeft <= 0 ? 'Time is up! Upload Photo' : 'Finished Writing? Proceed to Upload'}</span>
              <span className="ml-2">&rarr;</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
