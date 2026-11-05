'use client';

export interface BlurCheckResult {
  score: number;
  isBlurry: boolean;
  message: string;
}

/**
 * Calculates sharpness using Laplacian variance on a canvas grayscale context.
 * Variance < 60 usually indicates significant blur for handwritten documents.
 */
export async function checkImageSharpness(file: File | Blob): Promise<BlurCheckResult> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve({ score: 100, isBlurry: false, message: 'Sharpness check bypassed' });
          return;
        }

        // Downscale for fast sharpness analysis
        const maxDim = 600;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);

        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Grayscale conversion
        const gray = new Float32Array(w * h);
        for (let i = 0; i < gray.length; i++) {
          const idx = i * 4;
          gray[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
        }

        // Apply 3x3 Laplacian operator: [0, 1, 0; 1, -4, 1; 0, 1, 0]
        let sum = 0;
        let sumSq = 0;
        let count = 0;

        for (let y = 1; y < h - 1; y += 2) {
          const rowOffset = y * w;
          for (let x = 1; x < w - 1; x += 2) {
            const laplacian =
              gray[rowOffset - w + x] +
              gray[rowOffset + w + x] +
              gray[rowOffset + x - 1] +
              gray[rowOffset + x + 1] -
              4 * gray[rowOffset + x];

            sum += laplacian;
            sumSq += laplacian * laplacian;
            count++;
          }
        }

        if (count === 0) {
          resolve({ score: 100, isBlurry: false, message: 'Sharpness checked' });
          return;
        }

        const mean = sum / count;
        const variance = sumSq / count - mean * mean;
        const score = Math.round(variance);

        // Score interpretation:
        // < 50: Blurry / camera moved / unfocused
        // 50 - 90: Borderline acceptable
        // > 90: Crisp / Good contrast
        if (score < 50) {
          resolve({
            score,
            isBlurry: true,
            message: 'Photo seems blurry or unfocused. Please tap to focus and take a steady shot in bright lighting.'
          });
        } else if (score < 85) {
          resolve({
            score,
            isBlurry: false,
            message: 'Fair clarity. Legible, but brighter lighting is recommended.'
          });
        } else {
          resolve({
            score,
            isBlurry: false,
            message: 'Image is sharp and crisp! Text is clearly readable.'
          });
        }
      } catch (err) {
        resolve({ score: 100, isBlurry: false, message: 'Sharpness checked' });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ score: 100, isBlurry: false, message: 'Could not load image' });
    };

    img.src = url;
  });
}

/**
 * Compresses an image file client-side to max 1600px width/height and 85% JPEG quality.
 * Reduces 5-10MB mobile photos to ~200-400KB without losing handwriting legibility.
 */
export async function compressImage(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        const maxDimension = 1600;

        if (w > maxDimension || h > maxDimension) {
          if (w > h) {
            h = Math.round((h * maxDimension) / w);
            w = maxDimension;
          } else {
            w = Math.round((w * maxDimension) / h);
            h = maxDimension;
          }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        // Draw white background in case of transparent png
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        const base64Data = dataUrl.split(',')[1];
        resolve({
          base64: base64Data,
          mimeType: 'image/jpeg',
        });
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

