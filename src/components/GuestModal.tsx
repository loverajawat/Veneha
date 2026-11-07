'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { X, Shield, AlertCircle, History, Check } from 'lucide-react';
import { saveGuest, GuestProfile } from '@/lib/guestStorage';
import { Button, TextInput } from '@/components/ui';

interface GuestModalProps {
  currentGuest: GuestProfile | null;
  onClose: () => void;
  onSaved: (profile: GuestProfile) => void;
}

export default function GuestModal({ currentGuest, onClose, onSaved }: GuestModalProps) {
  const [name, setName] = useState(currentGuest?.name || '');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your name or callsign to continue.');
      return;
    }
    const profile = saveGuest(name);
    onSaved(profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-fade-in">
      <div className="relative w-full max-w-[440px] bg-canvas border border-hairline rounded-lg p-6 sm:p-8 shadow-level4 text-ink">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-sm text-steel hover:text-ink hover:bg-surface transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo & Heading */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center text-white shadow-sm shrink-0">
            <Shield className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[22px] text-ink leading-tight">Welcome to Veneha</h3>
            <p className="text-[14px] text-slate mt-0.5">Guest entry for SSB preparation</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextInput
            label="Your Name / Callsign"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            placeholder="e.g. Cadet Rahul, Priya Singh"
            error={error}
            autoFocus
          />

          {/* Quick link to past attempts */}
          <Link
            href="/history"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-md bg-surface hover:bg-surface-soft border border-hairline text-[14px] text-charcoal transition-colors group"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-steel group-hover:text-primary transition-colors" />
              <span>View Past Attempts</span>
            </div>
            <span className="text-[12px] text-link-blue font-semibold">Open &rarr;</span>
          </Link>

          {/* How guest mode works */}
          <div className="p-3.5 rounded-md bg-card-tint-gray/70 border border-hairline text-[13px] text-charcoal space-y-1.5 leading-relaxed">
            <div className="font-semibold text-ink flex items-center gap-1.5 text-[14px]">
              <Check className="w-4 h-4 text-semantic-success" />
              <span>How Guest Mode Works</span>
            </div>
            <p className="text-slate">• No password or email registration required.</p>
            <p className="text-slate">• A guest profile is saved securely in your browser.</p>
            <p className="text-slate">• Test attempts and AI feedback remain saved on this device.</p>
          </div>

          <div className="flex justify-end space-x-2.5 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
