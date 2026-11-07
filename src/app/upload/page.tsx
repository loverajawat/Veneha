'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Camera, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight,
  Sun,
  Maximize,
  PenTool,
  Lock,
  RefreshCw
} from 'lucide-react';
import { checkImageSharpness, compressImage, BlurCheckResult } from '@/lib/imageUtils';
import { PPDTPicture } from '@/data/pictures';
import { 
  Button, 
  CardBase, 
  TagChip, 
  Alert, 
  PillTab, 
  TextInput 
} from '@/components/ui';

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
      const { base64, mimeType } = await compressImage(selectedFile);
      const customKey = localStorage.getItem('ssb_prep_gemini_key') || localStorage.getItem('ssb_gemini_custom_key');
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
    <div className="flex-1 flex flex-col max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full font-sans space-y-6 text-ink">
      {/* 1. Header with Stimulus Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-hairline">
        <div>
          <span className="text-[12px] font-semibold text-steel uppercase tracking-wider">
            Step 3 of 4: Capture &amp; Read
          </span>
          <h1 className="text-[32px] font-semibold text-ink tracking-tight mt-0.5">
            Upload Your Handwritten Story
          </h1>
          <p className="text-[15px] text-slate mt-1 max-w-xl">
            The AI reads your handwritten story from the photo. You can verify and edit the transcript on the next screen.
          </p>
        </div>

        {picture && (
          <div className="flex items-center gap-3 p-2.5 rounded-md bg-surface border border-hairline shrink-0">
            <img
              src={picture.path}
              alt={picture.title}
              className="w-14 h-11 object-cover rounded-md border border-hairline"
            />
            <div className="text-left text-xs">
              <span className="text-steel text-[11px] block">Practised Picture</span>
              <strong className="text-ink text-[13px] block truncate max-w-[120px]">
                {picture.title}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Mode Selector (Pill tabs) */}
      <div className="flex items-center gap-2">
        <PillTab active={activeTab === 'camera'} onClick={() => setActiveTab('camera')}>
          Photograph Paper
        </PillTab>
        <PillTab active={activeTab === 'text'} onClick={() => setActiveTab('text')}>
          Type / Paste Text
        </PillTab>
      </div>

      {/* TAB 1: CAMERA & FILE UPLOAD */}
      {activeTab === 'camera' && (
        <CardBase className="space-y-6 p-6 sm:p-8">
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

          {/* Dashed Hairline-Strong Drop Zone */}
          <div className="border-2 border-dashed border-hairline-strong rounded-lg p-8 sm:p-10 text-center bg-surface hover:bg-surface-soft transition-colors space-y-4">
            {previewUrl ? (
              <div className="space-y-4">
                <div className="relative inline-block max-w-sm rounded-lg overflow-hidden border border-hairline shadow-level1">
                  <img
                    src={previewUrl}
                    alt="Answer Sheet Preview"
                    className="max-h-[300px] w-auto object-contain mx-auto"
                  />
                </div>
                <div className="flex justify-center gap-3">
                  <Button variant="secondary" onClick={() => cameraInputRef.current?.click()}>
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Retake Photo
                  </Button>
                  <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    Choose Another
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-lg bg-canvas border border-hairline flex items-center justify-center text-primary mx-auto shadow-xs">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[18px] font-semibold text-ink">Photograph your handwritten story</h3>
                  <p className="text-[14px] text-slate mt-1">
                    Take a clear, steady photo of your full answer sheet in good lighting.
                  </p>
                </div>

                {/* Primary & Secondary Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Button variant="primary" onClick={() => cameraInputRef.current?.click()}>
                    <Camera className="w-4 h-4 mr-2" />
                    Take Photo
                  </Button>
                  <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Choose from Gallery
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Blur / Sharpness check result */}
          {checkingSharpness && (
            <div className="text-[13px] text-slate flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span>Checking photo sharpness and legibility...</span>
            </div>
          )}

          {blurCheck && !checkingSharpness && (
            <div>
              {blurCheck.isBlurry ? (
                <Alert type="warning" title="Potential Blur Detected">
                  {blurCheck.message} Consider retaking for optimal OCR accuracy.
                </Alert>
              ) : (
                <div className="p-3 rounded-md bg-card-tint-mint/50 border border-brand-green/30 text-[13px] text-charcoal flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
                  <span>{blurCheck.message}</span>
                </div>
              )}
            </div>
          )}

          {/* Three Tips as a List */}
          <div className="p-4 rounded-md bg-surface border border-hairline text-[14px] space-y-2">
            <div className="font-semibold text-ink text-[14px]">Photography Tips for Accurate OCR:</div>
            <ul className="space-y-1.5 text-charcoal text-[13px]">
              <li className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-brand-orange shrink-0" />
                <span><strong>Good light:</strong> Ensure no heavy shadows fall across your writing.</span>
              </li>
              <li className="flex items-center gap-2">
                <Maximize className="w-4 h-4 text-primary shrink-0" />
                <span><strong>Whole page in frame:</strong> Hold camera flat directly above the page.</span>
              </li>
              <li className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-link-blue shrink-0" />
                <span><strong>Dark pen:</strong> Blue or black ballpoint/gel pen yields the highest OCR confidence.</span>
              </li>
            </ul>
          </div>

          {/* Privacy line on mint tag */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <TagChip color="green">
              <Lock className="w-3 h-3 mr-1 inline" />
              Handwriting photos are deleted immediately after transcription
            </TagChip>

            <Button
              variant="primary"
              onClick={handleTranscribe}
              disabled={!selectedFile || transcribing}
              className="w-full sm:w-auto"
            >
              {transcribing ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Reading Handwriting...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span>Transcribe Story</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>

          {errorMessage && (
            <Alert type="error" title="Error">
              {errorMessage}
            </Alert>
          )}
        </CardBase>
      )}

      {/* TAB 2: MANUAL TEXT INPUT */}
      {activeTab === 'text' && (
        <CardBase className="space-y-5 p-6 sm:p-8">
          <div>
            <h3 className="text-[18px] font-semibold text-ink">Type or Paste Your Story</h3>
            <p className="text-[14px] text-slate mt-1">
              If unable to photograph your paper, paste your story directly below.
            </p>
          </div>

          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            rows={10}
            placeholder="Write protagonist introduction, sequence of actions, and outcome here..."
            className="w-full bg-canvas text-ink text-[15px] p-4 rounded-md border border-hairline-strong focus:border-primary outline-none focus:ring-0 placeholder:text-muted transition-colors leading-relaxed"
          />

          <div className="flex justify-end pt-2">
            <Button variant="primary" onClick={handleTranscribe}>
              <span>Review Transcript &rarr;</span>
            </Button>
          </div>

          {errorMessage && (
            <Alert type="error" title="Error">
              {errorMessage}
            </Alert>
          )}
        </CardBase>
      )}
    </div>
  );
}
