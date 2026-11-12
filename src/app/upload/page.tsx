'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Camera, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  Sun,
  Maximize,
  PenTool,
  Lock,
  RefreshCw,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  X,
  FileText
} from 'lucide-react';
import { checkImageSharpness, compressImage, BlurCheckResult } from '@/lib/imageUtils';
import { PPDTPicture } from '@/data/pictures';
import { 
  Button, 
  CardBase, 
  TagChip, 
  Alert, 
  PillTab,
  Modal
} from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { 
  MAX_STORY_PAGES, 
  UploadedStoryPage, 
  getStoryPages, 
  setStoryPages, 
  clearStoryPages 
} from '@/lib/storyPagesMemory';

export default function UploadPage() {
  const router = useRouter();
  const { lang } = useLanguage();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const retakeInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pageTriggerRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [picture, setPicture] = useState<PPDTPicture | null>(null);
  const [pages, setPages] = useState<UploadedStoryPage[]>([]);
  const [retakeTargetIndex, setRetakeTargetIndex] = useState<number | null>(null);

  const [checkingSharpness, setCheckingSharpness] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [liveAnnouncement, setLiveAnnouncement] = useState('');

  // Sizing & viewer states
  const [isThumbnailMode, setIsThumbnailMode] = useState(false);
  const [viewerPageIndex, setViewerPageIndex] = useState<number | null>(null);

  // Tab mode
  const [activeTab, setActiveTab] = useState<'camera' | 'text'>('camera');
  const [manualText, setManualText] = useState('');

  // Load picture and restore in-memory pages on mount
  useEffect(() => {
    const raw = sessionStorage.getItem('current_ppdt_picture');
    if (raw) {
      try {
        setPicture(JSON.parse(raw));
      } catch {}
    }

    // Restore existing in-memory pages (e.g. if returning with Back button from /transcribe)
    const existing = getStoryPages();
    if (existing && existing.length > 0) {
      setPages([...existing]);
    }
  }, []);

  // Sync pages with in-memory store
  useEffect(() => {
    setStoryPages(pages);
  }, [pages]);

  // Measure upload row container to detect thumbnail mode (< 160px per card)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const checkSize = () => {
      const containerWidth = el.clientWidth;
      const count = pages.length;
      if (count === 0) {
        setIsThumbnailMode(false);
        return;
      }
      const gap = 16;
      const cardWidth = (containerWidth - (count - 1) * gap) / count;
      setIsThumbnailMode(cardWidth < 160);
    };

    checkSize();
    const observer = new ResizeObserver(checkSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, [pages.length]);

  // Handle adding new files (one or multiple up to MAX_STORY_PAGES)
  const processNewFiles = async (files: File[]) => {
    setErrorMessage('');
    setInfoMessage('');

    if (files.length === 0) return;

    const remainingSlots = MAX_STORY_PAGES - pages.length;
    if (remainingSlots <= 0) {
      setErrorMessage(
        lang === 'hi' 
          ? `अधिकतम ${MAX_STORY_PAGES} पृष्ठ जोड़े जा सकते हैं।` 
          : `Maximum ${MAX_STORY_PAGES} pages reached.`
      );
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      setInfoMessage(
        lang === 'hi'
          ? `${remainingSlots} पृष्ठ जोड़े गए। अतिरिक्त फ़ाइलें छोड़ दी गईं (अधिकतम ${MAX_STORY_PAGES} पृष्ठ)।`
          : `Added ${remainingSlots} page(s). Ignored ${files.length - remainingSlots} extra file(s) (maximum ${MAX_STORY_PAGES} allowed).`
      );
    }

    setCheckingSharpness(true);

    const newPages: UploadedStoryPage[] = [];
    for (let i = 0; i < filesToAdd.length; i++) {
      const file = filesToAdd[i];
      const previewUrl = URL.createObjectURL(file);
      let isBlurry = false;
      let blurScore = 100;
      let blurMessage = '';

      try {
        const result: BlurCheckResult = await checkImageSharpness(file);
        isBlurry = result.isBlurry;
        blurScore = result.score;
        blurMessage = result.message;
      } catch {
        blurMessage = 'Sharpness verified.';
      }

      newPages.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        previewUrl,
        isBlurry,
        blurScore,
        blurMessage,
      });
    }

    setCheckingSharpness(false);

    setPages((prev) => {
      const updated = [...prev, ...newPages];
      setLiveAnnouncement(
        lang === 'hi'
          ? `${newPages.length} नए पृष्ठ जोड़े गए। कुल ${updated.length} पृष्ठ।`
          : `Added ${newPages.length} new page(s). Total ${updated.length} pages.`
      );
      return updated;
    });
  };

  // Handle file picker selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const filesArray = Array.from(fileList);
    await processNewFiles(filesArray);
    // Reset input so same file can be picked again if desired
    e.target.value = '';
  };

  // Handle single page retake replacement
  const handleRetakeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || retakeTargetIndex === null) return;

    setErrorMessage('');
    const targetIdx = retakeTargetIndex;
    setRetakeTargetIndex(null);

    setCheckingSharpness(true);
    let isBlurry = false;
    let blurScore = 100;
    let blurMessage = '';

    try {
      const result = await checkImageSharpness(file);
      isBlurry = result.isBlurry;
      blurScore = result.score;
      blurMessage = result.message;
    } catch {
      blurMessage = 'Sharpness verified.';
    }

    setCheckingSharpness(false);

    setPages((prev) => {
      const updated = [...prev];
      if (updated[targetIdx]) {
        // Revoke previous object URL
        try {
          URL.revokeObjectURL(updated[targetIdx].previewUrl);
        } catch {}

        updated[targetIdx] = {
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          file,
          previewUrl: URL.createObjectURL(file),
          isBlurry,
          blurScore,
          blurMessage,
        };
      }
      setLiveAnnouncement(
        lang === 'hi'
          ? `पृष्ठ ${targetIdx + 1} को बदला गया।`
          : `Retook and replaced page ${targetIdx + 1}.`
      );
      return updated;
    });

    e.target.value = '';
  };

  // Initiate retake for a specific page
  const initiateRetake = (index: number) => {
    setRetakeTargetIndex(index);
    retakeInputRef.current?.click();
  };

  // Remove a page
  const removePage = (index: number) => {
    setPages((prev) => {
      const updated = [...prev];
      const removed = updated.splice(index, 1);
      if (removed[0]?.previewUrl) {
        try {
          URL.revokeObjectURL(removed[0].previewUrl);
        } catch {}
      }
      setLiveAnnouncement(
        lang === 'hi'
          ? `पृष्ठ ${index + 1} हटाया गया। कुल ${updated.length} पृष्ठ शेष।`
          : `Page ${index + 1} removed. ${updated.length} pages remaining.`
      );
      return updated;
    });

    if (viewerPageIndex !== null) {
      if (pages.length <= 1) {
        setViewerPageIndex(null);
      } else if (viewerPageIndex >= pages.length - 1) {
        setViewerPageIndex(pages.length - 2);
      }
    }
  };

  // Move page left
  const movePageLeft = (index: number) => {
    if (index <= 0) return;
    setPages((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index - 1];
      updated[index - 1] = temp;
      setLiveAnnouncement(
        lang === 'hi'
          ? `पृष्ठ ${index + 1} को पृष्ठ ${index} पर स्थानांतरित किया गया।`
          : `Moved page ${index + 1} left to position ${index}.`
      );
      return updated;
    });
    if (viewerPageIndex === index) {
      setViewerPageIndex(index - 1);
    }
  };

  // Move page right
  const movePageRight = (index: number) => {
    if (index >= pages.length - 1) return;
    setPages((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[index + 1];
      updated[index + 1] = temp;
      setLiveAnnouncement(
        lang === 'hi'
          ? `पृष्ठ ${index + 1} को पृष्ठ ${index + 2} पर स्थानांतरित किया गया।`
          : `Moved page ${index + 1} right to position ${index + 2}.`
      );
      return updated;
    });
    if (viewerPageIndex === index) {
      setViewerPageIndex(index + 1);
    }
  };

  // Open modal viewer
  const openViewer = (index: number) => {
    setViewerPageIndex(index);
  };

  // Close modal viewer and return focus
  const closeViewer = () => {
    const idx = viewerPageIndex;
    setViewerPageIndex(null);
    if (idx !== null && pageTriggerRefs.current[idx]) {
      pageTriggerRefs.current[idx]?.focus();
    }
  };

  // Keyboard navigation for viewer modal (Escape and arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewerPageIndex === null) return;
      if (e.key === 'Escape') {
        closeViewer();
      } else if (e.key === 'ArrowLeft') {
        if (viewerPageIndex > 0) {
          setViewerPageIndex(viewerPageIndex - 1);
        }
      } else if (e.key === 'ArrowRight') {
        if (viewerPageIndex < pages.length - 1) {
          setViewerPageIndex(viewerPageIndex + 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewerPageIndex, pages.length]);

  // Transcribe all pages in order
  const handleTranscribe = async () => {
    if (activeTab === 'text') {
      if (!manualText.trim() || manualText.trim().length < 15) {
        setErrorMessage(
          lang === 'hi'
            ? 'कृपया कहानी के कम से कम 15 अक्षर दर्ज करें।'
            : 'Please enter at least 15 characters of your story.'
        );
        return;
      }
      sessionStorage.setItem('current_story_transcript', manualText.trim());
      router.push('/transcribe');
      return;
    }

    if (pages.length === 0) {
      setErrorMessage(
        lang === 'hi'
          ? 'कृपया अपनी हस्तलिखित कहानी की तस्वीर लें या अपलोड करें।'
          : 'Please capture or upload at least one photo of your story.'
      );
      return;
    }

    // Check if any page is marked blurry
    const blurryIndex = pages.findIndex((p) => p.isBlurry);
    if (blurryIndex !== -1) {
      setErrorMessage(
        lang === 'hi'
          ? `पृष्ठ ${blurryIndex + 1} धुंधला लग रहा है। कृपया इसे पुनः खींचें या हटाएं।`
          : `Page ${blurryIndex + 1} looks blurry. Please retake or remove it before transcribing.`
      );
      return;
    }

    setTranscribing(true);
    setErrorMessage('');
    setInfoMessage('');

    try {
      // Compress each page client-side (max 1600px long edge, 0.8 JPEG quality)
      const compressedPages = await Promise.all(
        pages.map(async (page) => {
          return await compressImage(page.file);
        })
      );

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
        body: JSON.stringify({
          pages: compressedPages,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Transcription failed');
      }

      sessionStorage.setItem('current_story_transcript', data.transcript || '');
      sessionStorage.setItem('current_story_box', data.box_and_heading || '');
      sessionStorage.setItem('current_story_text', data.story_text || '');
      router.push('/transcribe');
    } catch (err: any) {
      console.error('Transcription error:', err);
      setErrorMessage(
        err.message || 
        (lang === 'hi'
          ? 'AI ट्रांसक्रिप्शन सर्वर से संपर्क करने में त्रुटि हुई। कृपया पुनः प्रयास करें।'
          : 'Error communicating with AI transcription server. Please retry.')
      );
    } finally {
      setTranscribing(false);
    }
  };

  const hasBlurryPage = pages.some((p) => p.isBlurry);

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto px-4 sm:px-6 py-8 w-full font-sans space-y-6 text-ink">
      {/* Polite live region for accessibility announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {liveAnnouncement}
      </div>

      {/* 1. Header with Stimulus Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-hairline">
        <div>
          <span className="text-[12px] font-semibold text-steel uppercase tracking-wider">
            {lang === 'hi' ? 'चरण 3 / 4: फोटो खींचें एवं पढ़ें' : 'Step 3 of 4: Capture & Read'}
          </span>
          <h1 className="text-[32px] font-semibold text-ink tracking-tight mt-0.5">
            {lang === 'hi' ? 'अपनी हस्तलिखित कहानी अपलोड करें' : 'Upload Your Handwritten Story'}
          </h1>
          <p className="text-[15px] text-slate mt-1 max-w-xl">
            {lang === 'hi'
              ? 'AI आपकी हस्तलिखित कहानी को फोटो से पढ़ता है। अगली स्क्रीन पर आप ट्रांसक्रिप्ट की समीक्षा व सुधार कर सकते हैं।'
              : 'The AI reads your handwritten story from the photo. You can verify and edit the transcript on the next screen.'}
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
              <span className="text-steel text-[11px] block">
                {lang === 'hi' ? 'अभ्यास चित्र' : 'Practised Picture'}
              </span>
              <strong className="text-ink text-[13px] block truncate max-w-[120px]">
                {picture.title}
              </strong>
            </div>
          </div>
        )}
      </div>

      {/* Mode Selector (Pill tabs) */}
      <div className="flex items-center gap-2" role="tablist">
        <PillTab active={activeTab === 'camera'} onClick={() => setActiveTab('camera')}>
          {lang === 'hi' ? 'कागज की फोटो लें' : 'Photograph Paper'}
        </PillTab>
        <PillTab active={activeTab === 'text'} onClick={() => setActiveTab('text')}>
          {lang === 'hi' ? 'कहानी टाइप / पेस्ट करें' : 'Type / Paste Text'}
        </PillTab>
      </div>

      {/* TAB 1: CAMERA & MULTI-PAGE UPLOAD */}
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
            aria-label="Capture page using camera"
          />
          <input
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            aria-label="Upload pages from gallery"
          />
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={retakeInputRef}
            onChange={handleRetakeChange}
            className="hidden"
            aria-label="Retake specific page"
          />

          {/* Main Upload Area (Stable minimum height to prevent layout shifts) */}
          <div 
            ref={containerRef}
            className="border-2 border-dashed border-hairline-strong rounded-lg p-6 sm:p-8 text-center bg-surface hover:bg-surface-soft transition-colors min-h-[380px] flex flex-col justify-center relative overflow-hidden"
          >
            {/* Dimmed Loading State during Transcription */}
            {transcribing && (
              <div className="absolute inset-0 z-30 bg-canvas/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 animate-fade-in">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                <h3 className="text-[17px] font-semibold text-ink">
                  {lang === 'hi' ? 'आपकी कहानी पढ़ी जा रही है...' : 'Reading your story...'}
                </h3>
                <p className="text-[13px] text-slate mt-1 max-w-sm text-center">
                  {lang === 'hi'
                    ? 'हस्तलेखन का विश्लेषण किया जा रहा है। कृपया प्रतीक्षा करें।'
                    : 'Transcribing your handwritten pages in order. Please hold on.'}
                </p>
              </div>
            )}

            {pages.length > 0 ? (
              <div className="space-y-6 w-full">
                {/* Header inside box: Page counter & instructions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-hairline-soft text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[14px] text-ink">
                      {lang === 'hi'
                        ? `${MAX_STORY_PAGES} में से ${pages.length} पृष्ठ जोड़े गए`
                        : `${pages.length} of ${MAX_STORY_PAGES} pages added`}
                    </span>
                    <span className="text-slate text-[13px]">·</span>
                    <span className="text-[13px] text-slate">
                      {lang === 'hi'
                        ? 'अपनी कहानी का प्रत्येक पृष्ठ क्रम से जोड़ें।'
                        : 'Add every page of your story, in order.'}
                    </span>
                  </div>

                  {pages.length >= MAX_STORY_PAGES && (
                    <TagChip color="orange">
                      {lang === 'hi' ? 'अधिकतम 4 पृष्ठ' : 'Maximum 4 pages'}
                    </TagChip>
                  )}
                </div>

                {/* Ordered Row of Pages: flex row, left to right, centered, scaling smoothly */}
                <ol 
                  className="flex flex-row items-stretch justify-center gap-3 sm:gap-4 w-full list-none p-0 m-0"
                  aria-label="Story pages"
                  role="list"
                >
                  {pages.map((page, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === pages.length - 1;
                    const pageNumber = idx + 1;
                    const pageTitle = lang === 'hi' ? `पृष्ठ ${pageNumber}` : `Page ${pageNumber}`;

                    return (
                      <li
                        key={page.id}
                        role="listitem"
                        className="flex-1 min-w-[88px] max-w-[340px] flex flex-col items-center justify-between space-y-2 group"
                      >
                        {/* Page Card: 3:4 aspect ratio */}
                        <div
                          ref={(el) => {
                            pageTriggerRefs.current[idx] = el;
                          }}
                          tabIndex={0}
                          role="button"
                          onClick={() => openViewer(idx)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              openViewer(idx);
                            }
                          }}
                          aria-label={`${pageTitle}, ${lang === 'hi' ? 'बड़ा देखने के लिए क्लिक करें' : 'click to enlarge'}`}
                          className={`w-full aspect-[3/4] relative rounded-md border border-hairline overflow-hidden bg-canvas shadow-xs cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 transition-all hover:shadow-level1 ${
                            page.isBlurry ? 'border-semantic-warning ring-1 ring-semantic-warning/50' : ''
                          }`}
                        >
                          <img
                            src={page.previewUrl}
                            alt={`${pageTitle} of your handwritten story`}
                            className="w-full h-full object-contain p-1 select-none"
                          />

                          {/* Top-left Page Badge */}
                          <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-sm bg-ink/80 text-white text-[11px] font-semibold backdrop-blur-xs select-none">
                            {pageTitle}
                          </span>

                          {/* Top-right Warning indicator if blurry */}
                          {page.isBlurry && (
                            <span 
                              className="absolute top-2 right-2 z-10 w-5 h-5 rounded-full bg-semantic-warning text-white flex items-center justify-center font-bold text-[11px] shadow-xs" 
                              title="Blurry"
                            >
                              !
                            </span>
                          )}

                          {/* Hover Zoom Prompt in Normal Mode */}
                          {!isThumbnailMode && (
                            <div className="absolute inset-0 bg-ink/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <span className="px-2.5 py-1 rounded-md bg-canvas/90 text-ink text-[12px] font-medium shadow-level1 flex items-center gap-1">
                                <ZoomIn className="w-3.5 h-3.5" />
                                <span>{lang === 'hi' ? 'बड़ा देखें' : 'Enlarge'}</span>
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Per-page Inline Actions (Hidden in Thumbnail Mode < 160px; accessible in viewer) */}
                        {!isThumbnailMode ? (
                          <div className="w-full space-y-1.5 pt-1">
                            <div className="flex items-center justify-center gap-1 w-full">
                              {/* Move Left */}
                              {!isFirst && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    movePageLeft(idx);
                                  }}
                                  aria-label={`Move ${pageTitle} left`}
                                  className="p-1.5 rounded-md hover:bg-surface text-steel hover:text-ink transition-colors cursor-pointer"
                                  title="Move left"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                </button>
                              )}

                              {/* Retake */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  initiateRetake(idx);
                                }}
                                aria-label={`Retake ${pageTitle}`}
                                className="px-2 py-1 rounded-md border border-hairline hover:bg-surface text-[12px] font-medium text-charcoal hover:text-ink transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>{lang === 'hi' ? 'बदलें' : 'Retake'}</span>
                              </button>

                              {/* Remove */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removePage(idx);
                                }}
                                aria-label={`Remove ${pageTitle}`}
                                className="p-1.5 rounded-md hover:bg-card-tint-peach/50 text-steel hover:text-semantic-error transition-colors cursor-pointer"
                                title="Remove page"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                              {/* Move Right */}
                              {!isLast && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    movePageRight(idx);
                                  }}
                                  aria-label={`Move ${pageTitle} right`}
                                  className="p-1.5 rounded-md hover:bg-surface text-steel hover:text-ink transition-colors cursor-pointer"
                                  title="Move right"
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              )}
                            </div>

                            {/* Blur error on this page */}
                            {page.isBlurry && (
                              <div className="text-[11px] text-semantic-warning font-medium text-center">
                                {lang === 'hi' 
                                  ? `${pageTitle} धुंधला है।` 
                                  : `${pageTitle} looks blurry.`}
                              </div>
                            )}
                          </div>
                        ) : (
                          // In thumbnail mode: tiny caption below card
                          <span className="text-[11px] text-slate font-medium truncate max-w-full">
                            {pageTitle}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ol>

                {/* Bottom Row Controls inside dashed box */}
                <div className="pt-3 border-t border-hairline-soft flex flex-wrap items-center justify-center gap-3">
                  <Button
                    variant="secondary"
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={pages.length >= MAX_STORY_PAGES || transcribing}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    <span>{lang === 'hi' ? 'अगला पृष्ठ जोड़ें' : 'Add another page'}</span>
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={pages.length >= MAX_STORY_PAGES || transcribing}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    <span>{lang === 'hi' ? 'गैलरी से जोड़ें' : 'Add from gallery'}</span>
                  </Button>
                </div>
              </div>
            ) : (
              // Empty State
              <div className="space-y-4 max-w-md mx-auto">
                <div className="w-12 h-12 rounded-lg bg-canvas border border-hairline flex items-center justify-center text-primary mx-auto shadow-xs">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[18px] font-semibold text-ink">
                    {lang === 'hi' ? 'अपनी हस्तलिखित कहानी की तस्वीर लें' : 'Photograph your handwritten story'}
                  </h3>
                  <p className="text-[14px] text-slate mt-1">
                    {lang === 'hi'
                      ? 'अच्छी रोशनी में अपनी पूरी उत्तर पुस्तिका की स्पष्ट और स्थिर तस्वीर लें (1 से 4 पृष्ठ)।'
                      : 'Take a clear, steady photo of your full answer sheet in good lighting (1 to 4 pages).'}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Button variant="primary" onClick={() => cameraInputRef.current?.click()}>
                    <Camera className="w-4 h-4 mr-2" />
                    <span>{lang === 'hi' ? 'फोटो लें' : 'Take Photo'}</span>
                  </Button>
                  <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    <span>{lang === 'hi' ? 'गैलरी से चुनें' : 'Choose from Gallery'}</span>
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sharpness check spinner */}
          {checkingSharpness && (
            <div className="text-[13px] text-slate flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span>
                {lang === 'hi' ? 'फोटो की स्पष्टता जांची जा रही है...' : 'Checking photo sharpness and legibility...'}
              </span>
            </div>
          )}

          {/* Blurry alert banner if any page failed */}
          {hasBlurryPage && !checkingSharpness && (
            <Alert type="warning" title={lang === 'hi' ? 'धुंधला पृष्ठ पहचाना गया' : 'Potential Blur Detected'}>
              {lang === 'hi'
                ? 'एक या अधिक पृष्ठ धुंधले लग रहे हैं। सटीक AI ट्रांसक्रिप्शन के लिए कृपया उन्हें पुनः खींचें।'
                : 'One or more pages look blurry or unfocused. Please retake them for optimal OCR accuracy.'}
            </Alert>
          )}

          {/* Informational message (e.g. extra files ignored) */}
          {infoMessage && (
            <Alert type="info" title="Info">
              {infoMessage}
            </Alert>
          )}

          {/* Photography Tips */}
          <div className="p-4 rounded-md bg-surface border border-hairline text-[14px] space-y-2">
            <div className="font-semibold text-ink text-[14px]">
              {lang === 'hi' ? 'सटीक OCR के लिए आवश्यक सुझाव:' : 'Photography Tips for Accurate OCR:'}
            </div>
            <ul className="space-y-1.5 text-charcoal text-[13px]">
              <li className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-brand-orange shrink-0" />
                <span>
                  <strong>{lang === 'hi' ? 'अच्छी रोशनी:' : 'Good light:'}</strong>{' '}
                  {lang === 'hi' ? 'सुनिश्चित करें कि पृष्ठ पर परछाई न पड़े।' : 'Ensure no heavy shadows fall across your writing.'}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Maximize className="w-4 h-4 text-primary shrink-0" />
                <span>
                  <strong>{lang === 'hi' ? 'पूरा पृष्ठ फ्रेम में:' : 'Whole page in frame:'}</strong>{' '}
                  {lang === 'hi' ? 'कैमरे को पृष्ठ के ठीक ऊपर सीधा रखें।' : 'Hold camera flat directly above the page.'}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <PenTool className="w-4 h-4 text-link-blue shrink-0" />
                <span>
                  <strong>{lang === 'hi' ? 'गहरे पेन का प्रयोग:' : 'Dark pen:'}</strong>{' '}
                  {lang === 'hi' ? 'नीले या काले बॉलपॉइंट/जेल पेन से सबसे सटीक परिणाम मिलते हैं।' : 'Blue or black ballpoint/gel pen yields the highest OCR confidence.'}
                </span>
              </li>
            </ul>
          </div>

          {/* Bottom Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-[12px] text-slate flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                {lang === 'hi'
                  ? 'आपकी तस्वीरें वेनेहा द्वारा सहेजी नहीं जाती हैं। आपकी तस्वीरें, आपकी कहानी और अभ्यास चित्र केवल पढ़ने और मूल्यांकन के लिए Google Gemini को भेजे जाते हैं।'
                  : "Your photos are not saved by Veneha. Your photos, your story and the practice picture are sent to Google's Gemini service to read and evaluate them."}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="secondary"
                onClick={() => setActiveTab('text')}
                className="w-full sm:w-auto text-xs whitespace-nowrap"
              >
                {lang === 'hi' ? 'स्वयं टाइप करें' : 'Type my story instead'}
              </Button>

              <Button
                variant="primary"
                onClick={handleTranscribe}
                disabled={pages.length === 0 || hasBlurryPage || transcribing}
                className="w-full sm:w-auto"
              >
                {transcribing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{lang === 'hi' ? 'कहानी पढ़ी जा रही है...' : 'Reading Handwriting...'}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <span>
                      {lang === 'hi'
                        ? `कहानी ट्रांसक्राइब करें (${pages.length} पृष्ठ)`
                        : `Transcribe Story (${pages.length} page${pages.length !== 1 ? 's' : ''})`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </div>
          </div>

          {errorMessage && (
            <Alert type="error" title={lang === 'hi' ? 'त्रुटि' : 'Error'}>
              {errorMessage}
            </Alert>
          )}
        </CardBase>
      )}

      {/* TAB 2: MANUAL TEXT INPUT */}
      {activeTab === 'text' && (
        <CardBase className="space-y-5 p-6 sm:p-8">
          <div>
            <h3 className="text-[18px] font-semibold text-ink">
              {lang === 'hi' ? 'अपनी कहानी टाइप या पेस्ट करें' : 'Type or Paste Your Story'}
            </h3>
            <p className="text-[14px] text-slate mt-1">
              {lang === 'hi'
                ? 'यदि फोटो खींचने में असमर्थ हैं, तो अपनी कहानी सीधे नीचे लिखें।'
                : 'If unable to photograph your paper, paste your story directly below.'}
            </p>
          </div>

          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            rows={10}
            placeholder={
              lang === 'hi'
                ? 'पात्र परिचय, कार्यों का क्रम और परिणाम यहां लिखें...'
                : 'Write protagonist introduction, sequence of actions, and outcome here...'
            }
            className="w-full bg-canvas text-ink text-[15px] p-4 rounded-md border border-hairline-strong focus:border-primary outline-none focus:ring-0 placeholder:text-muted transition-colors leading-relaxed"
          />

          <div className="flex justify-end pt-2">
            <Button variant="primary" onClick={handleTranscribe}>
              <span>{lang === 'hi' ? 'ट्रांसक्रिप्ट समीक्षा करें →' : 'Review Transcript →'}</span>
            </Button>
          </div>

          {errorMessage && (
            <Alert type="error" title={lang === 'hi' ? 'त्रुटि' : 'Error'}>
              {errorMessage}
            </Alert>
          )}
        </CardBase>
      )}

      {/* 4. ENLARGE VIEWER MODAL */}
      {viewerPageIndex !== null && pages[viewerPageIndex] && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="viewer-page-title"
        >
          <div className="bg-canvas w-full max-w-2xl rounded-lg shadow-level4 border border-hairline flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-hairline bg-surface/50">
              <div className="flex items-center gap-2">
                <span id="viewer-page-title" className="font-semibold text-[15px] text-ink">
                  {lang === 'hi'
                    ? `पृष्ठ ${viewerPageIndex + 1} / ${pages.length}`
                    : `Page ${viewerPageIndex + 1} of ${pages.length}`}
                </span>
                {pages[viewerPageIndex].isBlurry && (
                  <TagChip color="orange">
                    {lang === 'hi' ? 'धुंधला' : 'Blurry'}
                  </TagChip>
                )}
              </div>

              <button
                type="button"
                onClick={closeViewer}
                aria-label="Close viewer"
                className="p-1.5 rounded-md hover:bg-surface text-steel hover:text-ink transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Large Image with Previous/Next Arrows */}
            <div className="flex-1 relative flex items-center justify-center p-4 bg-surface-soft overflow-hidden min-h-[300px]">
              {/* Previous page arrow */}
              {viewerPageIndex > 0 && (
                <button
                  type="button"
                  onClick={() => setViewerPageIndex(viewerPageIndex - 1)}
                  aria-label="Previous page"
                  className="absolute left-4 z-20 w-10 h-10 rounded-full bg-canvas/90 shadow-level2 border border-hairline flex items-center justify-center text-ink hover:bg-canvas transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}

              {/* Large Image View */}
              <img
                src={pages[viewerPageIndex].previewUrl}
                alt={`Page ${viewerPageIndex + 1} large view`}
                className="max-h-[60vh] max-w-full object-contain rounded-md shadow-level1 select-none"
              />

              {/* Next page arrow */}
              {viewerPageIndex < pages.length - 1 && (
                <button
                  type="button"
                  onClick={() => setViewerPageIndex(viewerPageIndex + 1)}
                  aria-label="Next page"
                  className="absolute right-4 z-20 w-10 h-10 rounded-full bg-canvas/90 shadow-level2 border border-hairline flex items-center justify-center text-ink hover:bg-canvas transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-hairline bg-surface/50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {/* Move Left */}
                <Button
                  variant="secondary"
                  disabled={viewerPageIndex === 0}
                  onClick={() => movePageLeft(viewerPageIndex)}
                  className="text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  <span>{lang === 'hi' ? 'बाएं' : 'Move left'}</span>
                </Button>

                {/* Move Right */}
                <Button
                  variant="secondary"
                  disabled={viewerPageIndex === pages.length - 1}
                  onClick={() => movePageRight(viewerPageIndex)}
                  className="text-xs"
                >
                  <span>{lang === 'hi' ? 'दाएं' : 'Move right'}</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                {/* Retake */}
                <Button
                  variant="secondary"
                  onClick={() => initiateRetake(viewerPageIndex)}
                  className="text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  <span>{lang === 'hi' ? 'पुनः फोटो लें' : 'Retake page'}</span>
                </Button>

                {/* Remove */}
                <Button
                  variant="ghost"
                  onClick={() => removePage(viewerPageIndex)}
                  className="text-xs text-semantic-error hover:bg-card-tint-peach/40"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  <span>{lang === 'hi' ? 'हटाएं' : 'Remove page'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
