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
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-5 py-3 border-b">
        <h3 className="text-sm font-semibold text-slate-900">
          {t.prescriptions}
        </h3>
        <p className="text-[11px] text-slate-500">
          {language === "ar"
            ? "أحدث الوصفات الطبية الخاصة بك"
            : "Your recent prescriptions"}
        </p>
      </div>

      <div className="p-4 sm:p-5 space-y-3">
        {loading ? (
          <div className="text-center text-sm text-slate-500">Loading...</div>
        ) : prescriptions.length > 0 ? (
          prescriptions.map((p, idx) => (
            <div
              key={idx}
              className="border border-slate-100 rounded-xl px-3 py-2.5 bg-slate-50/60 flex flex-col gap-1"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full ${
                    p.active
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
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
              <p className="text-[11px] text-slate-500">
                {language === "ar" ? "الطبيب: " : "Doctor: "}
                {p.doctor}
              </p>
              <p className="text-[11px] text-slate-400">
                {language === "ar" ? "تاريخ الإصدار: " : "Issued at: "}
                {p.issuedAt}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center text-sm text-slate-500">
            {language === "ar"
              ? "لا توجد وصفات طبية حديثة"
              : "No recent prescriptions"}
          </div>
        )}
      </div>
    </div>
  );
}
