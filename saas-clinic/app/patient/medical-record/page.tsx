"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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

  // بيانات وهمية
  const visits = [
    {
      date: "2025-02-28",
      clinic: language === "ar" ? "عيادة الجلدية" : "Dermatology Clinic",
      diagnosis:
        language === "ar" ? "حساسية جلدية مزمنة" : "Chronic skin allergy",
      doctor: language === "ar" ? "د. حازم ربيع" : "Dr. Hazem Rabee",
    },
    {
      date: "2025-01-15",
      clinic: language === "ar" ? "عيادة العيون" : "Ophthalmology",
      diagnosis: language === "ar" ? "قصر نظر بسيط" : "Mild myopia",
      doctor: language === "ar" ? "د. سناء شحادة" : "Dr. Sanaa Shahada",
    },
  ];

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
              {language === "ar" ? "رجوع" : "Back "}
            </button>
          </div>
        </div>

        {/* ملخص بسيط */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <p className="text-xs text-slate-500 mb-1">
              {language === "ar" ? "إجمالي الزيارات" : "Total visits"}
            </p>
            <p className="text-2xl font-bold text-slate-900">{visits.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <p className="text-xs text-slate-500 mb-1">
              {language === "ar" ? "آخر تشخيص" : "Last diagnosis"}
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {visits[0]?.diagnosis || "-"}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
            <p className="text-xs text-slate-500 mb-1">
              {language === "ar" ? "آخر عيادة" : "Last clinic"}
            </p>
            <p className="text-sm font-semibold text-slate-900">
              {visits[0]?.clinic || "-"}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-4 sm:px-5 py-3 border-b">
            <h2 className="text-sm font-semibold text-slate-900">
              {language === "ar"
                ? "الزيارات والتشخيصات السابقة"
                : "Previous visits and diagnoses"}
            </h2>
          </div>

          {visits.length === 0 ? (
            <div className="p-6">
              <p className="text-sm text-slate-500">
                {language === "ar"
                  ? "لا توجد زيارات سابقة مسجلة حتى الآن."
                  : "No previous visits recorded yet."}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {visits.map((v, idx) => (
                <div
                  key={idx}
                  className="px-4 sm:px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 transition"
                >
                  <div>
                    <p className="text-xs text-slate-500 mb-0.5">{v.date}</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {v.clinic}
                    </p>
                    <p className="text-xs text-slate-500">
                      {language === "ar"
                        ? `الطبيب: ${v.doctor}`
                        : `Doctor: ${v.doctor}`}
                    </p>
                  </div>
                  <p className="text-xs text-slate-600 max-w-md">
                    {v.diagnosis}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
