'use client';

import Link from 'next/link';

import React, { useState } from 'react';
import { X, UserCheck, Shield, AlertCircle, History } from 'lucide-react';
import { saveGuest, GuestProfile } from '@/lib/guestStorage';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#131b12] border border-olive-700/80 rounded-2xl p-6 shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-olive-900/60"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-olive-800/80 border border-olive-600/50 flex items-center justify-center text-camo-gold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl text-white">Cadet Identification</h3>
            <p className="text-sm text-[#a8baa3]">Guest entry for SSB preparation</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-200 uppercase tracking-wider mb-1.5">
              Your Name / Callsign
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g. Cadet Rahul, Priya Singh"
              className="w-full px-4 py-3 rounded-xl bg-[#0a0f09] border border-olive-800 focus:border-olive-500 focus:ring-1 focus:ring-olive-500 text-white placeholder-gray-500 text-base outline-none transition-all min-h-[44px]"
              autoFocus
            />
            {error && (
              <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </div>

          {/* Quick link to past attempts (Section 5) */}
          <Link
            href="/history"
            onClick={onClose}
            className="flex items-center justify-between p-3 rounded-xl bg-olive-900/60 hover:bg-olive-800/80 border border-olive-700/70 text-sm text-white font-medium transition-colors"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-camo-gold" />
              <span>View Past Attempts (PPDT & WAT)</span>
            </div>
            <span className="text-xs text-olive-300 font-semibold">Open &rarr;</span>
          </Link>

          <div className="p-3.5 rounded-xl bg-olive-950/70 border border-olive-900 text-[13px] text-[#a8baa3] space-y-1.5 leading-relaxed">
            <div className="font-semibold text-olive-200 flex items-center gap-1.5 text-sm">
              <UserCheck className="w-4 h-4 text-camo-gold" />
              <span>How Guest Mode Works</span>
            </div>
            <p>• No password, email, or registration is required.</p>
            <p>• A unique guest ID is assigned and stored in your browser.</p>
            <p>• Your test attempts and AI feedback remain saved on this device.</p>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-olive-950 transition-colors min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-olive-600 hover:bg-olive-500 text-white shadow-lg shadow-olive-950/50 transition-all flex items-center gap-1.5 min-h-[44px]"
            >
              <UserCheck className="w-4 h-4" />
              <span>Save & Continue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

