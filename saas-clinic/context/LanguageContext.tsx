'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Initialize with 'en' for SSR consistency
  const [language, setLanguageState] = useState<Language>('en');
  const [isClient, setIsClient] = useState(false);

  // Detect client-side and load saved language
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- safe to set client flag once after hydration
    setIsClient(true);
    const savedLanguage = localStorage.getItem('preferred_language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ar')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  // Save language to localStorage whenever it changes
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred_language', newLanguage);
    }
  };

  const isRTL = language === 'ar';

  // Only apply RTL after hydration to prevent mismatch
  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL }}>
      <div dir={isClient && isRTL ? 'rtl' : 'ltr'} suppressHydrationWarning>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
