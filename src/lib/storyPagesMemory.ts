'use client';

import { MAX_STORY_PAGES } from '@/config/storyConfig';
export { MAX_STORY_PAGES };

export interface UploadedStoryPage {
  id: string;
  file: File;
  previewUrl: string;
  isBlurry: boolean;
  blurMessage: string;
  blurScore: number;
}

// In-memory array of pages preserved during client-side navigation
let inMemoryPages: UploadedStoryPage[] = [];

export function getStoryPages(): UploadedStoryPage[] {
  return inMemoryPages;
}

export function setStoryPages(pages: UploadedStoryPage[]): void {
  inMemoryPages = pages;
}

export function clearStoryPages(): void {
  for (const page of inMemoryPages) {
    if (page.previewUrl) {
      try {
        URL.revokeObjectURL(page.previewUrl);
      } catch {}
    }
  }
  inMemoryPages = [];
}
