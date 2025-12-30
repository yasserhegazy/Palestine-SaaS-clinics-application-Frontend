"use client";

import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

export default function NotFound() {
  const router = useRouter();
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4 transition-colors duration-300">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-8 md:p-10 transition-colors duration-300">
          <div className="mb-6">
            <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-blue-500 to-emerald-500 leading-none">
              404
            </h1>
          </div>

          <div className="mb-8 space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
              {language === "ar"
                ? "عذراً، الصفحة غير موجودة"
                : "Page Not Found"}
            </h2>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              {language === "ar"
                ? "الصفحة التي تبحث عنها غير موجودة أو تم نقلها"
                : "The page you're looking for doesn't exist or has been moved"}
            </p>
          </div>

          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="group px-8 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-500 dark:to-emerald-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-teal-700 hover:to-emerald-700 dark:hover:from-teal-600 dark:hover:to-emerald-600 transition-all duration-300 flex items-center gap-3 mx-auto"
            >
              <svg
                className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              <span>
                {language === "ar" ? "العودة للصفحة السابقة" : "Go Back"}
              </span>
            </button>
          </div>

          <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {language === "ar"
                ? "تأكد من صحة الرابط أو استخدم القائمة للتنقل"
                : "Make sure the URL is correct or use the menu to navigate"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
