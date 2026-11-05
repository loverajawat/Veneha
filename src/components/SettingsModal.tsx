'use client';

import React, { useState, useEffect } from 'react';
import { X, Key, Check, Info, ShieldCheck } from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem('ssb_gemini_custom_key');
    if (existing) setApiKey(existing);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('ssb_gemini_custom_key', apiKey.trim());
    } else {
      localStorage.removeItem('ssb_gemini_custom_key');
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
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
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-xl text-white">Gemini AI Configuration</h3>
            <p className="text-sm text-[#a8baa3]">Server & Client Key settings</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-200 uppercase tracking-wider mb-1.5">
              Custom Gemini API Key (Optional)
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-4 py-3 rounded-xl bg-[#0a0f09] border border-olive-800 focus:border-olive-500 focus:ring-1 focus:ring-olive-500 text-white placeholder-gray-500 text-base outline-none transition-all font-mono min-h-[44px]"
            />
            <p className="mt-1.5 text-xs text-[#a8baa3]">
              Leave blank to use the default server environment key or simulated offline evaluation.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-olive-950/70 border border-olive-900 text-[13px] text-[#a8baa3] space-y-2 leading-relaxed">
            <div className="font-semibold text-olive-200 flex items-center gap-1.5 text-sm">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero-Storage Privacy Architecture</span>
            </div>
            <p>
              Your handwriting images are sent to Gemini solely for real-time transcription and are instantly discarded. No student handwriting samples are stored on the server or retained in public databases.
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-300 hover:text-white hover:bg-olive-950 transition-colors min-h-[44px]"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-olive-600 hover:bg-olive-500 text-white shadow-lg shadow-olive-950/50 transition-all flex items-center gap-1.5 min-h-[44px]"
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Key</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

