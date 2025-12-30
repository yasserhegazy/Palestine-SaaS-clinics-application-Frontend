"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

function ForbiddenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, role, isPlatformAdmin } = useAuth();
  const { language } = useLanguage();
  const [attemptedPath, setAttemptedPath] = useState<string>("");

  useEffect(() => {
    const attempted = searchParams.get("attempted");
    if (attempted) {
      setAttemptedPath(attempted);
    }
  }, [searchParams]);

  const getDashboardPath = () => {
    if (isPlatformAdmin) {
      return "/platform/dashboard";
    }

    switch (role) {
      case "Manager":
        return "/clinic/dashboard";
      case "Doctor":
        return "/doctor/dashboard";
      case "Secretary":
        return "/reception/dashboard";
      case "Patient":
        return "/patient/dashboard";
      default:
        return "/login";
    }
  };

  const handleGoToDashboard = () => {
    router.push(getDashboardPath());
  };

  const handleGoBack = () => {
    router.back();
  };

  const translations = {
    en: {
      title: "Access Forbidden",
      subtitle: "403 - You do not have permission to access this page",
      currentRole: "Your current role",
      attemptedAccess: "You attempted to access",
      explanation:
        "This page is restricted to specific user roles. Your current role does not have the necessary permissions to view this content.",
      goToDashboard: "Go to My Dashboard",
      goBack: "Go Back",
    },
    ar: {
      title: "الوصول محظور",
      subtitle: "403 - ليس لديك صلاحية للوصول إلى هذه الصفحة",
      currentRole: "دورك الحالي",
      attemptedAccess: "حاولت الوصول إلى",
      explanation:
        "هذه الصفحة مقيدة لأدوار مستخدمين محددة. دورك الحالي لا يملك الصلاحيات اللازمة لعرض هذا المحتوى.",
      goToDashboard: "الذهاب إلى لوحة التحكم",
      goBack: "العودة",
    },
  };

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center px-4 transition-colors duration-300">
      <div className="max-w-2xl w-full">
        {/* Main Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-red-500 via-red-600 to-rose-600 dark:from-red-600 dark:via-red-700 dark:to-rose-700 px-8 py-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full mb-4">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">{t.title}</h1>
            <p className="text-red-100 dark:text-red-200 text-lg">
              {t.subtitle}
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-8 space-y-6">
            {/* User Info */}
            {user && role && (
              <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-5 border border-slate-200 dark:border-slate-600">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 dark:from-teal-600 dark:to-cyan-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-600">
                  <span className="text-sm text-slate-600 dark:text-slate-300">
                    {t.currentRole}:
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300">
                    {role}
                  </span>
                </div>
              </div>
            )}

            {/* Attempted Path */}
            {attemptedPath && (
              <div className="bg-red-50 dark:bg-red-900/30 rounded-xl p-5 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-700 dark:text-red-400 font-medium mb-2">
                  {t.attemptedAccess}:
                </p>
                <code className="block bg-white dark:bg-slate-900 px-3 py-2 rounded-lg text-sm text-red-900 dark:text-red-300 font-mono border border-red-200 dark:border-red-800">
                  {attemptedPath}
                </code>
              </div>
            )}

            {/* Explanation */}
            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
              <div className="flex gap-3">
                <svg
                  className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-blue-900 dark:text-blue-200 leading-relaxed">
                  {t.explanation}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={handleGoToDashboard}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-500 dark:to-cyan-500 text-white rounded-xl font-semibold hover:from-teal-700 hover:to-cyan-700 dark:hover:from-teal-600 dark:hover:to-cyan-600 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                {t.goToDashboard}
              </button>
              <button
                onClick={handleGoBack}
                className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-semibold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all border border-slate-300 dark:border-slate-600"
              >
                {t.goBack}
              </button>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          {language === "ar"
            ? "إذا كنت تعتقد أن هذا خطأ، يرجى الاتصال بمسؤول النظام."
            : "If you believe this is an error, please contact your system administrator."}
        </p>
      </div>
    </div>
  );
}

export default function ForbiddenPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ForbiddenContent />
    </Suspense>
  );
}
