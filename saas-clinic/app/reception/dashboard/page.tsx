"use client";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useRoleGuard } from "@/lib/roleGuard";
import DashboardHero from "@/components/DashboardHero";
import StatCard from "@/components/StatCard";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function ReceptionDashboard() {
  const { user, clinic, isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();
  
  // Protect route - only secretaries can access
  useRoleGuard(['Secretary']);

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

  const today = new Date().toLocaleDateString(
    language === "ar" ? "ar-EG" : "en-US",
    {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  // fake data  ..
  const stats = [
    {
      label: t.checkinsToday || "حالات الاستقبال اليوم",
      value: 24,
      sub: language === "ar" ? "منذ بداية اليوم" : "Since the start of the day",
    },
    {
      label: t.scheduledAppointments || "المواعيد المجدولة اليوم",
      value: 32,
      sub:
        language === "ar"
          ? "بين الساعة 8:00 و 20:00"
          : "Between 08:00 and 20:00",
    },
    {
      label: t.waitingPatients || "المرضى في غرفة الانتظار",
      value: 5,
      sub:
        language === "ar"
          ? "بمعدل انتظار 12 دقيقة"
          : "Average waiting time 12 min",
    },
    {
      label: t.appointmentRequests || "طلبات مواعيد معلّقة",
      value: 7,
      sub:
        language === "ar"
          ? "بانتظار مراجعة السكرتير"
          : "Pending receptionist review",
    },
  ];

  const upcomingAppointments = [
    {
      time: "09:30",
      patient: language === "ar" ? "أحمد علي" : "Ahmad Ali",
      doctor: language === "ar" ? "د. محمد سالم" : "Dr. Mohammed Salem",
      type: language === "ar" ? "عيادة قلب" : "Cardiology clinic",
      status: "confirmed",
    },
    {
      time: "10:00",
      patient: language === "ar" ? "سارة خليل" : "Sara Khalil",
      doctor: language === "ar" ? "د. ليلى خالد" : "Dr. Layla Khaled",
      type: language === "ar" ? "متابعة تحليل" : "Lab follow-up",
      status: "waiting",
    },
    {
      time: "10:15",
      patient: language === "ar" ? "يوسف عمر" : "Yousef Omar",
      doctor: language === "ar" ? "د. حازم ربيع" : "Dr. Hazem Rabee",
      type: language === "ar" ? "استشارة أولية" : "First consultation",
      status: "checked-in",
    },
  ];

  const waitingList = [
    {
      patient: language === "ar" ? "محمد إبراهيم" : "Mohammed Ibrahim",
      ticket: "A12",
      waitingMinutes: 7,
    },
    {
      patient: language === "ar" ? "أسيل حسن" : "Aseel Hasan",
      ticket: "A13",
      waitingMinutes: 3,
    },
    {
      patient: language === "ar" ? "نادر خليل" : "Nader Khalil",
      ticket: "B01",
      waitingMinutes: 15,
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            {t.statusConfirmed || "مؤكد"}
          </span>
        );
      case "waiting":
        return (
          <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
            {t.statusWaiting || "بانتظار الحضور"}
          </span>
        );
      case "checked-in":
        return (
          <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium text-sky-700">
            {t.statusCheckedIn || "تم الاستقبال"}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumbs />
        {/* Hero */}
        <DashboardHero
          title={
            t.welcomeReception ||
            (language === "ar"
              ? `أهلاً ${user.name.split(" ")[0]} 👋`
              : `Welcome, ${user.name.split(" ")[0]} 👋`)
          }
          subtitle={today}
          description={
            t.receptionSubTitle ||
            (language === "ar"
              ? "من هنا يمكنك إدارة تسجيل المرضى، مراجعة طلبات المواعيد، تأكيد المواعيد الموافق عليها، ومتابعة التقرير المالي اليومي للعيادة."
              : "From here you can manage patient registration, review appointment requests, confirm approved appointments and follow the daily financial report.")
          }
          secondaryAction={
            <>
              <p className="text-xs text-teal-100 mb-1">
                {t.quickSummaryTitle || "ملخص سريع"}
              </p>
              <p className="font-semibold">
                {waitingList.length}{" "}
                {t.quickSummaryPatientsWaiting ||
                  (language === "ar"
                    ? "مرضى بانتظار الاستقبال الآن"
                    : "patients waiting at reception now")}
              </p>
              <p className="text-[11px] text-teal-100 mt-1">
                {t.quickSummaryReminder ||
                  (language === "ar"
                    ? "تذكير: تأكدي من مراجعة طلبات المواعيد الجديدة وتأكيد المعتمَد منها"
                    : "Reminder: review new appointment requests and confirm approved ones.")}
              </p>
            </>
          }
        />

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((item) => (
            <StatCard
              key={item.label}
              label={item.label}
              value={item.value}
              sub={item.sub}
            />
          ))}
        </section>

        {/* Appointments + waiting room */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's appointments */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {t.todaysAppointmentsTitle || "مواعيد اليوم"}
                </h3>
                <p className="text-[11px] text-gray-500">
                  {t.todaysAppointmentsSubtitle ||
                    (language === "ar"
                      ? "أقرب المواعيد خلال الساعات القادمة"
                      : "Nearest appointments in the next hours")}
                </p>
              </div>
              <button
                onClick={() => router.push("/reception/appointments/manage")}
                className="text-xs text-teal-700 hover:text-teal-800 hover:underline"
              >
                {t.manageAllAppointments || "إدارة جميع المواعيد"}
              </button>
            </div>

            <div className="divide-y">
              {upcomingAppointments.map((app, idx) => (
                <div
                  key={idx}
                  className="px-4 sm:px-5 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-100 rounded-lg px-3 py-1">
                      {app.time}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {app.patient}
                      </p>
                      <p className="text-xs text-gray-500">
                        {language === "ar"
                          ? `مع ${app.doctor} • ${app.type}`
                          : `with ${app.doctor} • ${app.type}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getStatusBadge(app.status)}
                    <button className="text-[11px] text-teal-700 hover:underline">
                      {t.appointmentDetailsEdit || "تفاصيل / تعديل"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Waiting room */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {t.waitingRoomTitle || "غرفة الانتظار الآن"}
                </h3>
                <p className="text-[11px] text-gray-500">
                  {t.waitingRoomSubtitle || "ترتيب المرضى حسب رقم الدور"}
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-0.5 text-[11px] text-gray-600 border border-gray-100">
                {waitingList.length} {language === "ar" ? "مرضى" : "patients"}
              </span>
            </div>

            <div className="divide-y">
              {waitingList.map((w, idx) => (
                <div
                  key={idx}
                  className="px-4 sm:px-5 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 transition"
                >
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {w.patient}
                    </p>
                    <p className="text-xs text-gray-500">
                      {language === "ar"
                        ? `وقت انتظار: ${w.waitingMinutes} دقيقة`
                        : `Waiting time: ${w.waitingMinutes} min`}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="inline-flex items-center rounded-xl bg-gray-900 text-white text-xs font-semibold px-3 py-1">
                      {w.ticket}
                    </span>
                    <button className="text-[11px] text-teal-700 hover:underline">
                      {t.waitingRoomCheckin || "استقبال / تسجيل دخول"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-4 sm:px-5 py-3 border-b flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t.quickActionsReception ||
                  t.quickActions ||
                  "الإجراءات السريعة للسكرتير"}
              </h3>
            </div>
          </div>

          <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* New patient */}
            <button
              onClick={() => router.push("/reception/patients/register")}
              className="flex flex-col items-start gap-1 rounded-2xl border border-gray-100 bg-gray-50/80 hover:bg-teal-50 hover:border-teal-200 transition px-4 py-3 text-left"
            >
              <span className="text-xs font-semibold text-teal-700">
                {t.qaNewPatientLabel || "مريض جديد"}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {t.qaNewPatientTitle || "تسجيل مريض جديد وإنشاء حساب تلقائي"}
              </span>
              <span className="text-[11px] text-gray-500">
                {t.qaNewPatientDesc ||
                  "إدخال الاسم، رقم الهوية، رقم الهاتف – مع إرسال كلمة المرور عبر SMS"}
              </span>
            </button>

            {/* Search patient */}
            <button
              onClick={() => router.push("/reception/patients/search")}
              className="flex flex-col items-start gap-1 rounded-2xl border border-gray-100 bg-gray-50/80 hover:bg-cyan-50 hover:border-cyan-200 transition px-4 py-3 text-left"
            >
              <span className="text-xs font-semibold text-cyan-700">
                {t.qaSearchPatientLabel || "البحث عن مريض"}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {t.qaSearchPatientTitle || "الوصول لملف مريض سابق"}
              </span>
              <span className="text-[11px] text-gray-500">
                {t.qaSearchPatientDesc ||
                  "البحث باستخدام رقم الهوية أو رقم الهاتف لفتح الملف الطبي"}
              </span>
            </button>

            {/* Update patient */}
            <button
              onClick={() => router.push("/reception/patients/update")}
              className="flex flex-col items-start gap-1 rounded-2xl border border-gray-100 bg-gray-50/80 hover:bg-blue-50 hover:border-blue-200 transition px-4 py-3 text-left"
            >
              <span className="text-xs font-semibold text-blue-700">
                {t.qaUpdatePatientLabel || (language === "ar" ? "تحديث بيانات مريض" : "Update Patient")}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {t.qaUpdatePatientTitle || (language === "ar" ? "تعديل معلومات مريض موجود" : "Edit existing patient information")}
              </span>
              <span className="text-[11px] text-gray-500">
                {t.qaUpdatePatientDesc || (language === "ar" ? "تحديث الاسم، رقم الهاتف، العنوان وغيرها من المعلومات" : "Update name, phone, address and other details")}
              </span>
            </button>

            <button
  onClick={() => router.push("/reception/appointments/create")}
  className="flex flex-col items-start gap-1 rounded-2xl border border-gray-100 hover:bg-purple-100 hover:border-purple-300 transition px-4 py-3 text-left"
>
  <span className="text-xs font-semibold text-purple-700">
    {t.qaNewAppointmentLabel || (language === "ar" ? "حجز موعد جديد" : "New Appointment")}
  </span>
  <span className="text-sm font-medium text-gray-900">
    {t.qaNewAppointmentTitle || (language === "ar" ? "إنشاء موعد جديد للمريض" : "Create a new appointment")}
  </span>
  <span className="text-[11px] text-gray-500">
    {t.qaNewAppointmentDesc || (language === "ar" ? "تحديد وقت، طبيب، ونوع الاستشارة بسهولة وسرعة" : "Select time, doctor, and type of consultation quickly")}
  </span>
</button>

            

            {/* Daily financial report */}
            <button
              onClick={() => router.push("/reception/reports/daily")}
              className="flex flex-col items-start gap-1 rounded-2xl border border-gray-100 bg-gray-50/80 hover:bg-amber-50 hover:border-amber-200 transition px-4 py-3 text-left"
            >
              <span className="text-xs font-semibold text-amber-700">
                {t.qaDailyReportLabel || "التقرير المالي اليومي"}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {t.qaDailyReportTitle || "إحصاء المبالغ المالية الداخلة اليوم"}
              </span>
              <span className="text-[11px] text-gray-500">
                {t.qaDailyReportDesc ||
                  "إجمالي المبالغ المستلمة، عدد الفواتير المدفوعة وغير المدفوعة، وإجمالي النقدي والإلكتروني"}
              </span>
            </button>

             {/* Appointment requests */}
            <button
              onClick={() => router.push("/reception/appointments/requests")}
              className="flex flex-col items-start gap-1 rounded-2xl border border-gray-100 bg-gray-50/80 hover:bg-emerald-50 hover:border-emerald-200 transition px-4 py-3 text-left"
            >
              <span className="text-xs font-semibold text-emerald-700">
                {t.qaRequestsLabel || "طلبات المواعيد"}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {t.qaRequestsTitle ||
                  "مراجعة الطلبات القادمة من البوابة الإلكترونية"}
              </span>
              <span className="text-[11px] text-gray-500">
                {t.qaRequestsDesc ||
                  "تدقيق التفاصيل وإرسال الطلب للطبيب المناسب للموافقة"}
              </span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
