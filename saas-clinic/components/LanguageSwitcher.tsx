'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      className={`px-4 py-2 bg-white shadow-md rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors ${className}`}
    >
      {language === 'en' ? 'العربية' : 'English'}
    </button>
  );
}