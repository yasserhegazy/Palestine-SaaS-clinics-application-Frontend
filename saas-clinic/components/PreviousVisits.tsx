"use client";

import { useLanguage } from "@/context/LanguageContext";

export type Visit = {
  date: string;
  clinic: string;
  diagnosis: string;
  doctor: string;
};

interface PreviousVisitsProps {
  visits?: Visit[];
  showSummary?: boolean;
  className?: string;
}

export default function PreviousVisits({
  visits = [],
  showSummary = true,
  className = "",
}: PreviousVisitsProps) {
  const { language } = useLanguage();

  return (
    <div className={className}>
      {/* Summary Cards */}
      {showSummary && visits.length > 0 && (
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
      )}

      {/* Visits List */}
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
            <p className="text-sm text-slate-500 text-center">
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
                <div className="flex items-start gap-2">
                  <span className="inline-block px-2 py-1 bg-teal-50 text-teal-700 text-xs rounded-lg font-medium">
                    {language === "ar" ? "تشخيص" : "Diagnosis"}
                  </span>
                  <p className="text-xs text-slate-600 max-w-md">
                    {v.diagnosis}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
