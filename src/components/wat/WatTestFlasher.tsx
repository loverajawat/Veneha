'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, X, RotateCcw, ArrowLeft, CheckCircle2, Play, Pause } from 'lucide-react';
import { WatSet } from '@/data/watSets';
import { Button, TagChip, CardBase } from '@/components/ui';

interface WatTestFlasherProps {
  watSet: WatSet;
  onClose: () => void;
  onComplete: (setNumber: number) => void;
}

type FlasherStage = 'ready' | 'active' | 'completed';

function playBeep(muted: boolean, freq = 880, duration = 0.12) {
  if (muted || typeof window === 'undefined') return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
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
  } catch {
    // Autoplay restrictions or audio disabled
  }
}

export function WatTestFlasher({ watSet, onClose, onComplete }: WatTestFlasherProps) {
  const [stage, setStage] = useState<FlasherStage>('ready');
  const [readyCountdown, setReadyCountdown] = useState(3);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(15);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const wordStartTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Ready stage: 3-second countdown
  useEffect(() => {
    if (stage !== 'ready') return;

    setReadyCountdown(3);
    const interval = setInterval(() => {
      setReadyCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setStage('active');
          setCurrentWordIndex(0);
          setSecondsLeft(15);
          wordStartTimeRef.current = Date.now();
          playBeep(isMuted, 880, 0.18);
          return 0;
        }
        playBeep(isMuted, 520, 0.08);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stage, isMuted]);

  // 2. Advance to next word handler
  const advanceToNextWord = useCallback(() => {
    if (currentWordIndex + 1 < watSet.words.length) {
      setCurrentWordIndex((idx) => idx + 1);
      setSecondsLeft(15);
      wordStartTimeRef.current = Date.now();
      playBeep(isMuted, 880, 0.12);
    } else {
      // Completed all 60 words!
      setStage('completed');
      playBeep(isMuted, 1046, 0.25); // High celebration chime
      onComplete(watSet.setNumber);
    }
  }, [currentWordIndex, watSet.words.length, watSet.setNumber, isMuted, onComplete]);

  // 3. Active test timer loop
  useEffect(() => {
    if (stage !== 'active' || isPaused || showExitConfirm) return;

    wordStartTimeRef.current = Date.now() - (15 - secondsLeft) * 1000;

    timerRef.current = setInterval(() => {
      const elapsedMs = Date.now() - wordStartTimeRef.current;
      const remainingSeconds = Math.max(0, 15 - Math.floor(elapsedMs / 1000));
      setSecondsLeft(remainingSeconds);

      if (elapsedMs >= 15000) {
        advanceToNextWord();
      }
    }, 200);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage, isPaused, showExitConfirm, secondsLeft, advanceToNextWord]);

  // Restart the test
  const handleRestart = () => {
    setStage('ready');
    setReadyCountdown(3);
    setCurrentWordIndex(0);
    setSecondsLeft(15);
    setIsPaused(false);
  };

  const currentWord = watSet.words[currentWordIndex] || { word: '', position: 1 };
  const totalWords = watSet.words.length;
  const overallProgressPercent = ((currentWordIndex + 1) / totalWords) * 100;
  const wordTimeProgressPercent = ((15 - secondsLeft) / 15) * 100;

  // Ring circumference for countdown ring
  const circleRadius = 38;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference - (secondsLeft / 15) * circleCircumference;

  return (
    <div className="fixed inset-0 z-50 bg-canvas text-ink flex flex-col justify-between overflow-hidden select-none">
      {/* Top Header Bar */}
      <header className="w-full h-16 border-b border-hairline px-4 sm:px-6 lg:px-8 flex items-center justify-between bg-canvas/90 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <span className="font-semibold text-[16px] sm:text-[18px] text-ink">
            {watSet.title}
          </span>
          <span className="hidden sm:inline text-steel text-sm">
            · {watSet.wordCount} Words (15s each)
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setIsMuted((prev) => !prev)}
            className="p-2 rounded-full border border-hairline hover:bg-surface text-steel hover:text-ink transition-colors cursor-pointer"
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            aria-label={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate" /> : <Volume2 className="w-4 h-4 text-primary" />}
          </button>

          {/* Pause / Resume (Only during active test) */}
          {stage === 'active' && (
            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              className="px-3 py-1.5 rounded-full border border-hairline hover:bg-surface text-xs font-medium text-charcoal flex items-center gap-1.5 transition-colors cursor-pointer"
              title={isPaused ? 'Resume Test' : 'Pause Test'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-brand-green" /> : <Pause className="w-3.5 h-3.5 text-steel" />}
              <span>{isPaused ? 'Resume' : 'Pause'}</span>
            </button>
          )}

          {/* Exit Button */}
          <button
            type="button"
            onClick={() => {
              if (stage === 'active') {
                setShowExitConfirm(true);
              } else {
                onClose();
              }
            }}
            className="px-3 py-1.5 rounded-full border border-hairline hover:bg-surface text-xs font-medium text-slate hover:text-ink flex items-center gap-1 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Exit</span>
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-4xl mx-auto w-full">
        {/* STAGE 1: READY (3-second countdown) */}
        {stage === 'ready' && (
          <div className="text-center space-y-6 max-w-md mx-auto animate-fade-in">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-steel font-semibold">
                Word Association Test
              </span>
              <h2 className="text-[28px] sm:text-[36px] font-bold text-ink">
                Get Ready
              </h2>
              <p className="text-[14px] text-slate">
                Prepare your paper and pen. Each of the 60 words will appear for exactly 15 seconds.
              </p>
            </div>

            {/* Big Countdown Number */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 mx-auto rounded-full bg-surface border-2 border-hairline flex items-center justify-center shadow-level2">
              <span className="text-[48px] sm:text-[64px] font-bold text-primary animate-pulse">
                {readyCountdown}
              </span>
            </div>

            <div>
              <button
                type="button"
                onClick={() => {
                  setStage('active');
                  setCurrentWordIndex(0);
                  setSecondsLeft(15);
                  wordStartTimeRef.current = Date.now();
                }}
                className="text-xs text-link-blue hover:underline cursor-pointer"
              >
                Skip countdown & start now &rarr;
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: ACTIVE WORD FLASHER */}
        {stage === 'active' && (
          <div className="w-full flex flex-col items-center justify-center space-y-8 animate-fade-in">
            {/* Word Position Badge */}
            <div className="flex items-center gap-2">
              <TagChip color="purple">
                Word {currentWordIndex + 1} of {totalWords}
              </TagChip>
              {isPaused && (
                <TagChip color="orange">
                  PAUSED
                </TagChip>
              )}
            </div>

            {/* Word Card: Large, bold, centered display */}
            <div className="w-full max-w-2xl py-12 sm:py-16 px-6 sm:px-12 rounded-2xl bg-surface border border-hairline shadow-level2 text-center flex flex-col items-center justify-center min-h-[220px] sm:min-h-[260px] relative overflow-hidden">
              {/* Top subtle 15-second horizontal progress line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-hairline">
                <div
                  className={`h-full transition-all duration-200 ease-linear ${
                    secondsLeft <= 3 ? 'bg-semantic-warning' : 'bg-primary'
                  }`}
                  style={{ width: `${wordTimeProgressPercent}%` }}
                />
              </div>

              {/* The Word */}
              <div
                key={currentWord.position}
                className="text-[44px] sm:text-[64px] md:text-[76px] font-bold text-ink tracking-tight select-text animate-fade-in"
              >
                {currentWord.word}
              </div>
            </div>

            {/* Countdown Timer with Ring & Digits */}
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                  {/* Background Track */}
                  <circle
                    cx="48"
                    cy="48"
                    r={circleRadius}
                    className="stroke-hairline fill-none"
                    strokeWidth="6"
                  />
                  {/* Active Animated Countdown Stroke */}
                  <circle
                    cx="48"
                    cy="48"
                    r={circleRadius}
                    className={`fill-none transition-all duration-200 ease-linear ${
                      secondsLeft <= 3 ? 'stroke-semantic-warning' : 'stroke-primary'
                    }`}
                    strokeWidth="6"
                    strokeDasharray={circleCircumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                  />
                </svg>
                {/* Digits inside ring */}
                <div className="absolute flex flex-col items-center justify-center">
                  <span
                    className={`text-[20px] font-bold font-mono ${
                      secondsLeft <= 3 ? 'text-semantic-warning animate-pulse' : 'text-ink'
                    }`}
                  >
                    {secondsLeft}s
                  </span>
                </div>
              </div>

              <div className="text-left space-y-1">
                <div className="text-xs text-steel font-medium">Time Remaining</div>
                <div className="text-xs text-slate">Auto-advances in {secondsLeft} seconds</div>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 3: SET COMPLETED SUMMARY SCREEN */}
        {stage === 'completed' && (
          <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in py-4">
            <div className="text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-[28px] sm:text-[34px] font-bold text-ink">
                {watSet.title} Completed!
              </h2>
              <p className="text-[14px] text-slate max-w-lg mx-auto">
                Excellent effort. All 60 words were presented for 15 seconds each (15 minutes total).
                This set has been recorded as <strong>Attempted</strong> in your progress tracker.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <Button variant="dark" onClick={onClose}>
                  <ArrowLeft className="w-4 h-4 mr-1.5" />
                  <span>Return to WAT Dashboard</span>
                </Button>
                <Button variant="secondary" onClick={handleRestart}>
                  <RotateCcw className="w-4 h-4 mr-1.5" />
                  <span>Practice Set Again</span>
                </Button>
              </div>
            </div>

            {/* List of 60 Words for Review */}
            <CardBase className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-hairline pb-3">
                <span className="font-semibold text-[15px] text-ink">
                  Words in {watSet.title} (60 Total)
                </span>
                <span className="text-xs text-steel">
                  Review your written sentences
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 text-sm">
                {watSet.words.map((item) => (
                  <div
                    key={item.position}
                    className="flex items-center gap-2 p-2 rounded-md bg-canvas border border-hairline"
                  >
                    <span className="w-6 text-right text-xs font-mono text-steel">
                      {item.position}.
                    </span>
                    <span className="font-medium text-ink truncate">
                      {item.word}
                    </span>
                  </div>
                ))}
              </div>
            </CardBase>
          </div>
        )}
      </main>

      {/* Bottom Overall Progress Bar */}
      <footer className="w-full border-t border-hairline py-3 px-4 sm:px-6 bg-canvas/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto space-y-1.5">
          <div className="flex items-center justify-between text-xs text-steel">
            <span>Overall Session Progress</span>
            <span className="font-mono font-medium text-ink">
              {stage === 'completed'
                ? '60 / 60 (100%)'
                : `${currentWordIndex + 1} / ${totalWords} (${Math.round(overallProgressPercent)}%)`}
            </span>
          </div>
          <div className="w-full bg-hairline h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{
                width: stage === 'completed' ? '100%' : `${overallProgressPercent}%`,
              }}
            />
          </div>
        </div>
      </footer>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-surface rounded-xl border border-hairline shadow-level4 p-6 max-w-sm w-full space-y-4 text-ink">
            <h3 className="text-[18px] font-semibold text-ink">Exit Practice Test?</h3>
            <p className="text-sm text-slate">
              You are currently on word {currentWordIndex + 1} of 60. If you exit now, this session will not be marked as complete.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="secondary" onClick={() => setShowExitConfirm(false)}>
                Resume Test
              </Button>
              <Button
                variant="dark"
                onClick={() => {
                  setShowExitConfirm(false);
                  onClose();
                }}
              >
                Exit to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

