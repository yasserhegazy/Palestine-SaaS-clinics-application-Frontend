// components/patient/PatientQuickActions.tsx
import { useRouter } from "next/navigation";

interface PatientQuickActionsProps {
  t: Record<string, string>;
  language: string;
}

export function PatientQuickActions({ t, language }: PatientQuickActionsProps) {
  const router = useRouter();

  return (
    <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">
          {language === "ar" ? "إجراءات سريعة" : "Quick actions"}
        </h3>
        <p className="text-[11px] text-slate-500">
          {language === "ar"
            ? "وصول سريع لأهم المهام"
            : "Quick access to main actions"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => router.push("/patient/medical-record")}
          className="flex flex-col items-start gap-1 rounded-xl border border-slate-100 bg-slate-50/80 hover:bg-teal-50 hover:border-teal-200 transition px-3 py-3 text-left"
        >
          <span className="text-xs font-semibold text-teal-700">
            {language === "ar" ? "السجل الطبي" : "Medical record"}
          </span>
          <span className="text-sm font-medium text-slate-900">
            {language === "ar"
              ? "عرض نتائج الفحوصات والزيارات السابقة"
              : "View reports and previous visits"}
          </span>
        </button>

        <button
          onClick={() => router.push("/patient/appointments")}
          className="flex flex-col items-start gap-1 rounded-xl border border-slate-100 bg-slate-50/80 hover:bg-cyan-50 hover:border-cyan-200 transition px-3 py-3 text-left"
        >
          <span className="text-xs font-semibold text-cyan-700">
            {language === "ar" ? "مواعيدي" : "My appointments"}
          </span>
          <span className="text-sm font-medium text-slate-900">
            {language === "ar"
              ? "عرض المواعيد الحالية والمستقبلية"
              : "See current & upcoming visits"}
          </span>
        </button>

        <button
          onClick={() => router.push("/patient/appointments/new")}
          className="flex flex-col items-start gap-1 rounded-xl border border-slate-100 bg-slate-50/80 hover:bg-emerald-50 hover:border-emerald-200 transition px-3 py-3 text-left"
        >
          <span className="text-xs font-semibold text-emerald-700">
            {language === "ar" ? "طلب موعد جديد" : "Request new appointment"}
          </span>
          <span className="text-sm font-medium text-slate-900">
            {language === "ar"
              ? "اختيار التاريخ والوقت والطبيب المناسب"
              : "Choose date, time and doctor"}
          </span>
        </button>
      </div>
    </section>
  );
}
