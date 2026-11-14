'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, Move } from 'lucide-react';
import { Button } from '@/components/ui';

interface PhotoCropModalProps {
  isOpen: boolean;
  file: File | null;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
}

const PREVIEW_SIZE = 280; // Size of square/circle crop viewport in px
const OUTPUT_SIZE = 512;  // High-res output size

export default function PhotoCropModal({
  isOpen,
  file,
  onClose,
  onCropComplete,
}: PhotoCropModalProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [minZoom, setMinZoom] = useState<number>(1);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load image when file provided
  useEffect(() => {
    if (!file) {
      setImage(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      // Calculate min zoom so image always covers the circular crop window
      const scaleX = PREVIEW_SIZE / img.naturalWidth;
      const scaleY = PREVIEW_SIZE / img.naturalHeight;
      const baseScale = Math.max(scaleX, scaleY);

      setMinZoom(baseScale);
      setZoom(baseScale);
      setOffset({ x: 0, y: 0 });
      setImage(img);
    };
    img.src = objectUrl;

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  // Keep offset within bounds when zooming or dragging
  const clampOffset = useCallback(
    (newX: number, newY: number, currentZoom: number) => {
      if (!image) return { x: 0, y: 0 };
      const currentWidth = image.naturalWidth * currentZoom;
      const currentHeight = image.naturalHeight * currentZoom;

      const maxOffsetX = Math.max(0, (currentWidth - PREVIEW_SIZE) / 2);
      const maxOffsetY = Math.max(0, (currentHeight - PREVIEW_SIZE) / 2);

      return {
        x: Math.min(maxOffsetX, Math.max(-maxOffsetX, newX)),
        y: Math.min(maxOffsetY, Math.max(-maxOffsetY, newY)),
      };
    },
    [image]
  );

  // Render crop preview on canvas
  useEffect(() => {
    if (!image || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, PREVIEW_SIZE, PREVIEW_SIZE);

    // Save context
    ctx.save();

    // Center origin
    ctx.translate(PREVIEW_SIZE / 2, PREVIEW_SIZE / 2);

    const drawW = image.naturalWidth * zoom;
    const drawH = image.naturalHeight * zoom;
    const drawX = -drawW / 2 + offset.x;
    const drawY = -drawH / 2 + offset.y;

    ctx.drawImage(image, drawX, drawY, drawW, drawH);
    ctx.restore();
  }, [image, zoom, offset]);

  // Mouse / Touch Dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setOffset(clampOffset(newX, newY, zoom));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const newX = e.touches[0].clientX - dragStart.x;
    const newY = e.touches[0].clientY - dragStart.y;
    setOffset(clampOffset(newX, newY, zoom));
  };

  // Keyboard navigation (+/- and arrow keys)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!image) return;
    const step = 6;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setOffset((prev) => clampOffset(prev.x + step, prev.y, zoom));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setOffset((prev) => clampOffset(prev.x - step, prev.y, zoom));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOffset((prev) => clampOffset(prev.x, prev.y + step, zoom));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOffset((prev) => clampOffset(prev.x, prev.y - step, zoom));
    } else if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      const nextZoom = Math.min(minZoom * 3, zoom + minZoom * 0.1);
      setZoom(nextZoom);
      setOffset((prev) => clampOffset(prev.x, prev.y, nextZoom));
    } else if (e.key === '-' || e.key === '_') {
      e.preventDefault();
      const nextZoom = Math.max(minZoom, zoom - minZoom * 0.1);
      setZoom(nextZoom);
      setOffset((prev) => clampOffset(prev.x, prev.y, nextZoom));
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setZoom(val);
    setOffset((prev) => clampOffset(prev.x, prev.y, val));
  };

  // Generate 512x512 cropped blob
  const handleUsePhoto = () => {
    if (!image) return;

    const outCanvas = document.createElement('canvas');
    outCanvas.width = OUTPUT_SIZE;
    outCanvas.height = OUTPUT_SIZE;
    const ctx = outCanvas.getContext('2d');
    if (!ctx) return;

    // Ratio from preview to 512px output
    const scaleFactor = OUTPUT_SIZE / PREVIEW_SIZE;

    ctx.save();
    ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2);

    const drawW = image.naturalWidth * zoom * scaleFactor;
    const drawH = image.naturalHeight * zoom * scaleFactor;
    const drawX = -drawW / 2 + offset.x * scaleFactor;
    const drawY = -drawH / 2 + offset.y * scaleFactor;

    ctx.drawImage(image, drawX, drawY, drawW, drawH);
    ctx.restore();

    // Export as WebP or JPEG fallback
    outCanvas.toBlob(
      (blob) => {
        if (blob) {
          onCropComplete(blob);
        }
      },
      'image/webp',
      0.85
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-modal-title"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        ref={containerRef}
        className="w-full max-w-md bg-canvas rounded-xl shadow-level3 border border-hairline p-5 space-y-4 text-ink focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-hairline">
          <h3 id="crop-modal-title" className="text-[17px] font-semibold text-ink">
            Crop profile photo
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-steel hover:text-ink hover:bg-surface transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport & Circular Mask Preview */}
        <div className="flex flex-col items-center justify-center py-2">
          <div
            className="relative rounded-lg overflow-hidden border border-hairline shadow-inner select-none cursor-grab active:cursor-grabbing bg-surface-soft"
            style={{ width: PREVIEW_SIZE, height: PREVIEW_SIZE }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
          >
            <canvas
              ref={canvasRef}
              width={PREVIEW_SIZE}
              height={PREVIEW_SIZE}
              className="block pointer-events-none"
            />

            {/* Circular Vignette Overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                borderRadius: '50%',
              }}
            />

            {/* Subtle border around circular crop area */}
            <div className="absolute inset-0 rounded-full border border-white/60 pointer-events-none" />
          </div>

          <p className="text-[12px] text-steel mt-2 flex items-center gap-1.5">
            <Move className="w-3.5 h-3.5 text-slate" />
            <span>Drag to reposition • Use arrow keys &amp; +/- to adjust</span>
          </p>
        </div>

        {/* Zoom Slider */}
        <div className="space-y-1.5 px-2">
          <div className="flex items-center justify-between text-[12px] text-slate font-medium">
            <span className="flex items-center gap-1">
              <ZoomOut className="w-3.5 h-3.5" />
              <span>Zoom</span>
            </span>
            <span className="font-mono">
              {Math.round((zoom / minZoom) * 100)}%
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-steel shrink-0" />
            <input
              type="range"
              min={minZoom}
              max={minZoom * 3}
              step={minZoom * 0.05}
              value={zoom}
              onChange={handleZoomChange}
              className="w-full accent-primary h-1.5 bg-hairline rounded-lg cursor-pointer"
              aria-label="Zoom level"
            />
            <ZoomIn className="w-4 h-4 text-steel shrink-0" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-hairline">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" variant="primary" onClick={handleUsePhoto}>
            Use photo
          </Button>
        </div>
      </div>
    </div>
  );
}
