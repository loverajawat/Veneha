'use client';

import React from 'react';
import { History, ArrowRight, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { siteConfig } from '@/config/siteConfig';
import { Button } from '@/components/ui';

export default function GuestClaimModal() {
  const { claimDialogOpen, claimAttemptsCount, handleClaimHistory, dismissClaimDialog } = useAuth();
  const { lang } = useLanguage();

  if (!claimDialogOpen || claimAttemptsCount <= 0) return null;

  const authStrings = siteConfig.auth;
  const title = lang === 'hi'
    ? authStrings.guestClaimDialog.title.hi(claimAttemptsCount)
    : authStrings.guestClaimDialog.title.en(claimAttemptsCount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="w-full max-w-md bg-canvas rounded-xl p-6 shadow-level4 border border-hairline space-y-4 animate-scale-in text-ink"
        role="dialog"
        aria-modal="true"
        aria-labelledby="claim-dialog-title"
      >
        <div className="flex items-start justify-between">
          <div className="w-10 h-10 rounded-lg bg-card-tint-lavender text-brand-purple-800 flex items-center justify-center shrink-0">
            <History className="w-5 h-5" />
          </div>
          <button
            type="button"
            onClick={dismissClaimDialog}
            className="p-1 rounded-md text-steel hover:text-ink transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-1.5">
          <h2 id="claim-dialog-title" className="text-lg font-semibold text-ink leading-snug">
            {title}
          </h2>
          <p className="text-xs text-slate leading-relaxed">
            {lang === 'hi'
              ? 'ये प्रयास आपके खाते में सुरक्षित रूप से स्थानांतरित हो जाएंगे ताकि आप किसी भी उपकरण पर इन्हें देख सकें।'
              : 'These attempts will be permanently linked to your account so you can view your evaluation history on any device.'}
          </p>
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          <Button
            variant="secondary"
            onClick={dismissClaimDialog}
            className="text-xs py-2 px-3.5"
          >
            {lang === 'hi' ? authStrings.guestClaimDialog.notNow.hi : authStrings.guestClaimDialog.notNow.en}
          </Button>
          <Button
            variant="primary"
            onClick={handleClaimHistory}
            className="text-xs py-2 px-4 flex items-center gap-1.5"
          >
            <span>{lang === 'hi' ? authStrings.guestClaimDialog.addThem.hi : authStrings.guestClaimDialog.addThem.en}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

