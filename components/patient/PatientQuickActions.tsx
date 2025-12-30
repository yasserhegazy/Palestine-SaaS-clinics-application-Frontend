// components/patient/PatientQuickActions.tsx
import { useRouter } from "next/navigation";

interface PatientQuickActionsProps {
  t: Record<string, string>;
  language: string;
}

export function PatientQuickActions({ t, language }: PatientQuickActionsProps) {
  const router = useRouter();

  return (
    <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm p-4 sm:p-5 transition-colors duration-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          {language === "ar" ? "إجراءات سريعة" : "Quick actions"}
        </h3>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          {language === "ar"
            ? "وصول سريع لأهم المهام"
            : "Quick access to main actions"}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => router.push("/patient/medical-record")}
          className="flex flex-col items-start gap-1 rounded-xl border border-slate-100 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-700/50 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:border-teal-200 dark:hover:border-teal-700 transition px-3 py-3 text-left"
        >
          <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">
            {language === "ar" ? "السجل الطبي" : "Medical record"}
          </span>
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            {language === "ar"
              ? "عرض نتائج الفحوصات والزيارات السابقة"
              : "View reports and previous visits"}
          </span>
        </button>

        <button
          onClick={() => router.push("/patient/appointments")}
          className="flex flex-col items-start gap-1 rounded-xl border border-slate-100 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-700/50 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 hover:border-cyan-200 dark:hover:border-cyan-700 transition px-3 py-3 text-left"
        >
          <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-400">
            {language === "ar" ? "مواعيدي" : "My appointments"}
          </span>
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            {language === "ar"
              ? "عرض المواعيد الحالية والمستقبلية"
              : "See current & upcoming visits"}
          </span>
        </button>

        <button
          onClick={() => router.push("/patient/appointments/new")}
          className="flex flex-col items-start gap-1 rounded-xl border border-slate-100 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-200 dark:hover:border-emerald-700 transition px-3 py-3 text-left"
        >
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            {language === "ar" ? "طلب موعد جديد" : "Request new appointment"}
          </span>
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            {language === "ar"
              ? "اختيار التاريخ والوقت والطبيب المناسب"
              : "Choose date, time and doctor"}
          </span>
        </button>
      </div>
    </section>
  );
}
