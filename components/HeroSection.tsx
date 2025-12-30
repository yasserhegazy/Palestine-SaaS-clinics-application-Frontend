"use client";
import { useRouter } from "next/router";

type Role = "patient" | "doctor" | "secretary" | "manager";

interface HeroSectionProps {
  firstName: string;
  language: "en" | "ar";
  role: Role;
  onNewAction?: () => void;
  summaryTitle?: string;
  summaryMessage?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  firstName,
  language,
  role,
  onNewAction,
  summaryTitle,
  summaryMessage,
}) => {
  const router = useRouter();

  const defaultSummary = {
    patient: {
      title: language === "ar" ? "ملخص صحي سريع" : "Quick health summary",
      message:
        language === "ar"
          ? "تذكير: الالتزام بالعلاج والمراجعة الدورية يساعد في تحسين حالتك الصحية."
          : "Reminder: Staying consistent with treatment and regular checkups improves your health.",
    },
    doctor: {
      title: language === "ar" ? "ملخص مهامك السريعة" : "Quick tasks summary",
      message:
        language === "ar"
          ? "تذكير: راجع المواعيد والملفات المرضية الخاصة بمرضاك."
          : "Reminder: Check your patients' appointments and medical records.",
    },
    secretary: {
      title: language === "ar" ? "ملخص العمل" : "Quick work summary",
      message:
        language === "ar"
          ? "تذكير: إدارة المواعيد والمراسلات اليومية."
          : "Reminder: Manage appointments and daily communications.",
    },
    manager: {
      title: language === "ar" ? "ملخص الإدارة" : "Quick management summary",
      message:
        language === "ar"
          ? "تذكير: متابعة الأداء العام للعيادة وإحصائيات الموظفين."
          : "Reminder: Monitor overall clinic performance and staff statistics.",
    },
  };

  const summary = {
    title: summaryTitle || defaultSummary[role].title,
    message: summaryMessage || defaultSummary[role].message,
  };

  const greeting =
    language === "ar" ? `أهلاً، ${firstName} 👋` : `Hello, ${firstName} 👋`;

  const description =
    role === "patient"
      ? language === "ar"
        ? "من هنا يمكنك متابعة مواعيدك، الاطلاع على سجلاتك الطبية والوصفات، والبقاء على اتصال مع عيادتك."
        : "From here you can track your appointments, view your medical records and prescriptions, and stay connected with your clinic."
      : language === "ar"
      ? "مرحباً بعودتك إلى لوحة التحكم الخاصة بك."
      : "Welcome back to your dashboard.";

  // زر افتراضي للمريض
  const buttonText =
    role === "patient"
      ? language === "ar"
        ? "طلب موعد جديد"
        : "Request new appointment"
      : undefined;

  const handleButtonClick = () => {
    if (onNewAction) onNewAction();
    else if (role === "patient") router.push("/patient/appointments/new");
  };

  return (
    <section className="bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 rounded-2xl p-6 sm:p-7 text-white shadow-md relative overflow-hidden">
      <div className="absolute inset-y-0 right-0 w-40 opacity-20 bg-[radial-gradient(circle_at_top,_#ffffff_0,_transparent_60%)]" />
      <div className="relative flex flex-col md:flex-row justify-between gap-4">
        <div>
          <p className="text-xs text-teal-100 mb-1">
            {language === "ar"
              ? "مرحباً بعودتك"
              : "Welcome back to your portal"}
          </p>
          <h2 className="text-2xl font-bold mb-1">{greeting}</h2>
          <p className="text-sm text-teal-100 max-w-xl">{description}</p>

          {buttonText && (
            <button
              onClick={handleButtonClick}
              className="mt-3 inline-flex items-center px-4 py-2.5 rounded-xl bg-white text-teal-700 text-xs font-semibold shadow-sm hover:bg-teal-50"
            >
              {buttonText}
            </button>
          )}
        </div>

        <div className="self-start md:self-center bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm">
          <p className="text-xs text-teal-100 mb-1">{summary.title}</p>
          <p className="font-semibold">{summary.message.split(".")[0]}</p>
          <p className="text-[11px] text-teal-100 mt-1">
            {summary.message.split(".").slice(1).join(".")}
          </p>
        </div>
      </div>
    </section>
  );
};
