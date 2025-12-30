// components/patient/PatientPrescriptions.tsx
import type { PatientDashboardData } from "@/types/patientDashboard";

interface PatientPrescriptionsProps {
  t: Record<string, string>;
  language: string;
  loading: boolean;
  dashboardData: PatientDashboardData | null;
}

export function PatientPrescriptions({
  t,
  language,
  loading,
  dashboardData,
}: PatientPrescriptionsProps) {
  const prescriptions = dashboardData?.recent_prescriptions ?? [];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-300">
      <div className="px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          {t.prescriptions}
        </h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {language === "ar"
            ? "أحدث الوصفات الطبية الخاصة بك"
            : "Your recent prescriptions"}
        </p>
      </div>

      <div className="p-4 sm:p-5 space-y-3">
        {loading ? (
          <div className="text-center text-sm text-slate-500 dark:text-slate-400">Loading...</div>
        ) : prescriptions.length > 0 ? (
          prescriptions.map((p, idx) => (
            <div
              key={idx}
              className="border border-slate-100 dark:border-slate-600 rounded-xl px-3 py-2.5 bg-slate-50/60 dark:bg-slate-700/50 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{p.name}</p>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full ${
                    p.active
                      ? "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
                      : "bg-slate-100 dark:bg-slate-600 text-slate-500 dark:text-slate-400"
                  }`}
                >
                  {p.active
                    ? language === "ar"
                      ? "سارية"
                      : "Active"
                    : language === "ar"
                    ? "منتهية"
                    : "Expired"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === "ar" ? "الطبيب: " : "Doctor: "}
                {p.doctor}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                {language === "ar" ? "تاريخ الإصدار: " : "Issued at: "}
                {p.issuedAt}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            {language === "ar"
              ? "لا توجد وصفات طبية حديثة"
              : "No recent prescriptions"}
          </div>
        )}
      </div>
    </div>
  );
}
