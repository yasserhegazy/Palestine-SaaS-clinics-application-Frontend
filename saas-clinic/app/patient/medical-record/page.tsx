"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import PreviousVisits, { Visit } from "@/components/PreviousVisits";

export default function MedicalRecordPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500 mb-1">
              {language === "ar" ? "السجل الطبي" : "Medical record"}
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              {language === "ar"
                ? "سجلك الطبي وزياراتك السابقة"
                : "Your medical record and previous visits"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {language === "ar"
                ? "يمكنك هنا الاطلاع على ملخص زياراتك وتشخيصاتك السابقة."
                : "Here you can view a summary of your previous visits and diagnoses."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={() => router.push("/patient/dashboard")}
              className="text-sm text-teal-700 hover:text-teal-800 hover:underline"
            >
              {language === "ar" ? "رجوع" : "Back"}
            </button>
          </div>
        </div>

        {/* PreviousVisits will automatically fetch data for authenticated patient */}
        <PreviousVisits showSummary={true} />
      </div>
    </div>
  );
}
