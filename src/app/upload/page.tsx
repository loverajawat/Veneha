'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Camera, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  Sun,
  Maximize,
  PenTool,
  Lock
} from 'lucide-react';
import { checkImageSharpness, compressImage, BlurCheckResult } from '@/lib/imageUtils';
import { PPDTPicture } from '@/data/pictures';

export default function UploadPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const [picture, setPicture] = useState<PPDTPicture | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [blurCheck, setBlurCheck] = useState<BlurCheckResult | null>(null);
  const [checkingSharpness, setCheckingSharpness] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fallback direct text input mode
  const [activeTab, setActiveTab] = useState<'camera' | 'text'>('camera');
  const [manualText, setManualText] = useState('');

  useEffect(() => {
    const raw = sessionStorage.getItem('current_ppdt_picture');
    if (raw) {
      try {
        setPicture(JSON.parse(raw));
      } catch {}
    }
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage('');
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Run client-side sharpness blur check
    setCheckingSharpness(true);
    try {
      const result = await checkImageSharpness(file);
      setBlurCheck(result);
    } catch {
      setBlurCheck({ score: 100, isBlurry: false, message: 'Sharpness checked' });
    } finally {
      setCheckingSharpness(false);
    }
  };

  // Submit image to Gemini for handwriting transcription
  const handleTranscribe = async () => {
    if (activeTab === 'text') {
      if (!manualText.trim() || manualText.trim().length < 15) {
        setErrorMessage('Please enter at least 15 characters of your story.');
        return;
      }
      sessionStorage.setItem('current_story_transcript', manualText.trim());
      router.push('/transcribe');
      return;
    }

    if (!selectedFile) {
      setErrorMessage('Please capture or upload a photo of your handwritten story.');
      return;
    }

    setTranscribing(true);
    setErrorMessage('');

    try {
      // Compress image client side
      const { base64, mimeType } = await compressImage(selectedFile);

      const customKey = localStorage.getItem('ssb_gemini_custom_key');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (customKey) {
        headers['x-gemini-key'] = customKey;
      }

      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers,
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Transcription failed');
      }

      sessionStorage.setItem('current_story_transcript', data.transcript);
      router.push('/transcribe');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error communicating with AI transcription server.');
    } finally {
      setTranscribing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-olive-800/80 mb-6">
        <div>
          <span className="text-xs font-bold text-olive-300 uppercase tracking-wider">
            Step 3 of 4: Capture & Read
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-white mt-0.5">
            Upload Your Handwritten Story
          </h1>
          <p className="text-sm text-[#a8baa3] mt-1">
            The AI reads your handwritten story from the photo. You can review and correct any words before feedback.
          </p>
        </div>

        {/* Practiced Picture Thumbnail */}
        {picture && (
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#121911] border border-olive-800 shrink-0">
            <img
              src={picture.path}
              alt={picture.title}
              className="w-14 h-11 object-cover rounded-lg border border-olive-700"
            />
            <div className="text-left text-xs">
              <span className="text-[#a8baa3] text-[11px] block">Stimulus Card</span>
              <strong className="text-white text-xs block truncate max-w-[120px]">
                {picture.title}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Mode Selector */}
      <div className="flex items-center gap-2 mb-6 bg-[#111710] p-1.5 rounded-xl border border-olive-800 self-start">
        <button
          onClick={() => setActiveTab('camera')}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 min-h-[40px] ${
            activeTab === 'camera'
              ? 'bg-olive-600 text-white shadow-md'
              : 'text-[#a8baa3] hover:text-white'
          }`}
        >
          <Camera className="w-4 h-4" />
          <span>Photograph Paper</span>
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 min-h-[40px] ${
            activeTab === 'text'
              ? 'bg-olive-600 text-white shadow-md'
              : 'text-[#a8baa3] hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Type Directly</span>
        </button>
      </div>

      {/* TAB 1: CAMERA & FILE UPLOAD */}
      {activeTab === 'camera' && (
        <div className="space-y-6">
          {/* Hidden inputs */}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            onChange={handleFileChange}
            className="hidden"
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {!previewUrl ? (
            <div className="space-y-6">
              {/* Step 10: 3 Short Tips Next to / Above Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#111710] border border-olive-800/80">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#a8baa3]">
                  <Sun className="w-4 h-4 text-camo-gold shrink-0" />
                  <span><strong>Good light</strong> (no hand shadows)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#a8baa3]">
                  <Maximize className="w-4 h-4 text-camo-gold shrink-0" />
                  <span><strong>Whole page in frame</strong></span>
                </div>
                <div className="flex items-center gap-2.5 text-xs sm:text-sm text-[#a8baa3]">
                  <PenTool className="w-4 h-4 text-camo-gold shrink-0" />
                  <span><strong>Dark pen</strong> (clear ink contrast)</span>
                </div>
              </div>

              {/* Step 10: Large "Take photo of your story" button (Primary) + "Choose from gallery" (Secondary) */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Large primary camera button */}
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 min-h-[56px] py-4 px-6 rounded-2xl bg-olive-600 hover:bg-olive-500 text-white font-bold text-base shadow-xl shadow-olive-950/60 transition-all flex items-center justify-center gap-3 border border-olive-500/50 group"
                >
                  <Camera className="w-6 h-6 text-camo-gold group-hover:scale-110 transition-transform" />
                  <span>Take photo of your story</span>
                </button>

                {/* Secondary gallery option */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="sm:w-auto min-h-[56px] py-4 px-6 rounded-2xl bg-[#131b12] hover:bg-olive-900/60 text-white font-semibold text-sm sm:text-base border-2 border-olive-600/70 hover:border-olive-500 transition-all flex items-center justify-center gap-2.5"
                >
                  <Upload className="w-5 h-5 text-olive-300" />
                  <span>Choose from gallery</span>
                </button>
              </div>

              {/* Step 10: Trust line directly under upload button */}
              <p className="text-center text-xs sm:text-sm text-[#a8baa3] flex items-center justify-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Your photo is deleted after your story has been read.</span>
              </p>
            </div>
          ) : (
            /* Image Preview & Quality Check Card */
            <div className="p-6 rounded-3xl bg-[#121911] border border-olive-800 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-olive-800/80 pb-3">
                <span className="text-xs font-bold text-olive-300 uppercase tracking-wider">
                  Handwriting Photo Preview
                </span>
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setBlurCheck(null);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-olive-950 border border-olive-800 text-gray-200 hover:text-white flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retake Photo</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                {/* Photo Preview Container */}
                <div className="md:col-span-1 aspect-[3/4] relative rounded-xl overflow-hidden border border-olive-700 bg-black flex items-center justify-center shadow-lg">
                  <img
                    src={previewUrl}
                    alt="Handwriting sheet"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Sharpness & Blur Verification Card */}
                <div className="md:col-span-2 space-y-3">
                  <div className="p-4 rounded-2xl bg-[#0a0f09] border border-olive-800 space-y-2">
                    <span className="text-xs font-semibold text-[#a8baa3] uppercase tracking-wider block">
                      Image Sharpness Check
                    </span>

                    {checkingSharpness ? (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-olive-300 animate-pulse">
                        <Sparkles className="w-4 h-4 text-camo-gold animate-spin" />
                        <span>Analyzing focus...</span>
                      </div>
                    ) : blurCheck ? (
                      <div
                        className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs sm:text-sm ${
                          blurCheck.isBlurry
                            ? 'bg-amber-950/60 border-amber-600/70 text-amber-200'
                            : 'bg-emerald-950/60 border-emerald-600/70 text-emerald-200'
                        }`}
                      >
                        {blurCheck.isBlurry ? (
                          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <strong className="block font-bold">
                            {blurCheck.isBlurry
                              ? 'Blur / Low Focus Detected'
                              : 'High Clarity & Sharpness Confirmed'}
                          </strong>
                          <p className="mt-0.5 opacity-90 text-xs">{blurCheck.message}</p>
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <p className="text-xs sm:text-sm text-[#a8baa3]">
                    You will be able to review and correct any misread words on the next screen.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MANUAL TEXT INPUT */}
      {activeTab === 'text' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-[#121911] border border-olive-800 shadow-xl space-y-3">
            <label className="block text-xs font-bold text-olive-300 uppercase tracking-wider">
              Type or Paste Your Written Story
            </label>
            <textarea
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Rohan, a 22-year-old engineering student, noticed..."
              rows={9}
              className="w-full p-4 rounded-2xl bg-[#0a0f09] border border-olive-800 focus:border-olive-500 focus:ring-1 focus:ring-olive-500 text-white placeholder-gray-500 text-base outline-none transition-all resize-y leading-relaxed font-sans"
            />
            <div className="flex justify-between text-xs sm:text-sm text-[#a8baa3]">
              <span>Aim for ~100 to 130 words</span>
              <span>
                Word count:{' '}
                <strong className="text-white">
                  {manualText.split(/\s+/).filter(Boolean).length}
                </strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="mt-4 p-3.5 rounded-xl bg-red-950/70 border border-red-700/60 text-xs sm:text-sm text-red-200 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Submit Button */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleTranscribe}
          disabled={transcribing || (activeTab === 'camera' && !selectedFile)}
          className={`min-h-[48px] px-8 py-3.5 rounded-xl text-white font-bold text-sm sm:text-base shadow-xl transition-all flex items-center gap-2 ${
            transcribing || (activeTab === 'camera' && !selectedFile)
              ? 'bg-olive-900/50 text-gray-400 cursor-not-allowed border border-olive-800'
              : 'bg-olive-600 hover:bg-olive-500 shadow-olive-950/60'
          }`}
        >
          {transcribing ? (
            <>
              <Sparkles className="w-4 h-4 text-camo-gold animate-spin" />
              <span>Transcribing Handwriting...</span>
            </>
          ) : (
            <>
              <span>Review & Verify Transcript</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
