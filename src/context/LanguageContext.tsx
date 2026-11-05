'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type SiteLanguage = 'en' | 'hi';

interface LanguageContextType {
  lang: SiteLanguage;
  setLang: (lang: SiteLanguage) => void;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  toggleLang: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<SiteLanguage>('en');

  useEffect(() => {
    const saved = localStorage.getItem('veneha_lang') as SiteLanguage | null;
    if (saved === 'en' || saved === 'hi') {
      setLangState(saved);
      document.documentElement.lang = saved;
    } else {
      document.documentElement.lang = 'en';
    }
  }, []);

  const setLang = (newLang: SiteLanguage) => {
    setLangState(newLang);
    localStorage.setItem('veneha_lang', newLang);
    document.documentElement.lang = newLang;
  };

  const toggleLang = () => {
    const next = lang === 'en' ? 'hi' : 'en';
    setLang(next);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

