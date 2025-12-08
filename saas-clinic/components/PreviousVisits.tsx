"use client";

import { useState, useEffect } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { 
  getPatientMedicalHistory, 
  getMyMedicalHistory,
  type Visit 
} from "@/app/api/medicalHistory";

// Re-export Visit type for backward compatibility
export type { Visit };

interface PreviousVisitsProps {
  visits?: Visit[];
  showSummary?: boolean;
  className?: string;
  patientId?: number | string;
}

export default function PreviousVisits({
  visits: initialVisits,
  showSummary = true,
  className = "",
  patientId,
}: PreviousVisitsProps) {
  const { language } = useLanguage();
  const { token, user } = useAuth();
  const [visits, setVisits] = useState<Visit[]>(initialVisits || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If visits are passed via props, use them and don't fetch
    if (initialVisits) {
      setVisits(initialVisits);
      return;
    }

    const fetchHistory = async () => {
      if (!token) return;

      setLoading(true);
      setError(null);
      try {
        let data: Visit[] = [];
        if (patientId) {
          data = await getPatientMedicalHistory(Number(patientId), token);
        } else if (user?.role === 'Patient') {
          data = await getMyMedicalHistory(token);
        }
        setVisits(data);
      } catch (err) {
        console.error("Failed to fetch medical history", err);
        setError("Failed to load medical history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [initialVisits, patientId, token, user?.role]);

  if (loading && !initialVisits) {
    return (
      <div className={`p-8 text-center ${className}`}>
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        <p className="mt-2 text-sm text-slate-500">
          {language === "ar" ? "جاري التحميل..." : "Loading..."}
        </p>
      </div>
    );
  }

  if (error && !initialVisits) {
    return (
      <div className={`p-4 bg-red-50 text-red-600 rounded-lg text-sm text-center ${className}`}>
        {language === "ar" ? "حدث خطأ أثناء تحميل السجل الطبي" : "Error loading medical history"}
      </div>
    );
  }

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
