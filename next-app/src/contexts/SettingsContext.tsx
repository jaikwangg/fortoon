"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Language, Theme, FontSize, SettingsContextType} from '@/lib/types';
import { translations } from '@/lib/translations';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [theme, setTheme] = useState<Theme>('light');
  const [fontSize, setFontSize] = useState<FontSize>('medium');

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('mangaAppSettings');
    if (savedSettings) {
      const { language: savedLang, theme: savedTheme, fontSize: savedSize } = JSON.parse(savedSettings);
      setLanguage(savedLang);
      setTheme(savedTheme);
      setFontSize(savedSize);
    }
  }, []);

  useEffect(() => {
    // Save settings to localStorage
    localStorage.setItem('mangaAppSettings', JSON.stringify({ language, theme, fontSize }));
    
    // Apply theme
    const applyTheme = (themeToApply: 'light' | 'dark') => {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(themeToApply);
    };

    if (theme === 'light') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches ? 'dark' : 'light');
      };
      
      applyTheme(mediaQuery.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handleChange);
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      applyTheme(theme);
    }
  }, [language, theme, fontSize]);

  const t = (key: keyof typeof translations.en) => translations[language][key];

  return (
    <SettingsContext.Provider value={{ language, setLanguage, theme, setTheme, fontSize, setFontSize, t }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};