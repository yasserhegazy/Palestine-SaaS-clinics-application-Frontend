'use client';

import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
      className={`px-4 py-2 bg-white dark:bg-slate-700 shadow-md rounded-lg text-sm font-medium mr-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-600 transition-colors ${className}`}
    >
      {language === 'en' ? 'العربية' : 'English'}
    </button>
  );
}
