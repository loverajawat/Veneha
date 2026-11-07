'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Button, TextInput } from '@/components/ui';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem('ssb_prep_gemini_key') || '';
    setApiKey(existing);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('ssb_prep_gemini_key', apiKey.trim());
    } else {
      localStorage.removeItem('ssb_prep_gemini_key');
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-fade-in">
      <div className="relative w-full max-w-[480px] bg-canvas border border-hairline rounded-lg p-6 sm:p-8 shadow-level4 text-ink">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-sm text-steel hover:text-ink hover:bg-surface transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center text-white shadow-sm shrink-0">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-[22px] text-ink leading-tight">Gemini API Key</h3>
            <p className="text-[14px] text-slate mt-0.5">Configure your custom Gemini key</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <TextInput
            label="Google AI Studio API Key"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="AIzaSy..."
            helperText="Key is stored locally in your browser and used strictly for OCR & evaluation."
            autoFocus
          />

          <div className="p-3.5 rounded-md bg-card-tint-gray/70 border border-hairline text-[13px] text-charcoal space-y-1.5 leading-relaxed">
            <div className="font-semibold text-ink flex items-center gap-1.5 text-[14px]">
              <AlertCircle className="w-4 h-4 text-primary" />
              <span>Free API Access</span>
            </div>
            <p className="text-slate">
              You can get a free personal API key from{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-link-blue underline hover:text-link-blue-pressed inline-flex items-center gap-0.5"
              >
                Google AI Studio <ExternalLink className="w-3 h-3" />
              </a>
              . Leave blank to use server environment credentials.
            </p>
          </div>

          <div className="flex items-center justify-between pt-2">
            {saved ? (
              <span className="text-[14px] font-semibold text-semantic-success flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                Settings saved!
              </span>
            ) : (
              <span />
            )}

            <div className="flex space-x-2.5">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Key
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
