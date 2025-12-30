"use client";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useRoleGuard } from "@/lib/roleGuard";
import DashboardHero from "@/components/DashboardHero";
import StatCard from "@/components/StatCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import { UserPlus, CalendarCheck, Clock, AlertCircle } from "lucide-react";
import apiClient from "@/lib/api";

interface DashboardStats {
  checkins_today: number;
  scheduled_appointments: number;
  waiting_patients: number;
  pending_requests: number;
}

interface TodayAppointment {
  id: number;
  time: string;
  patient: string;
  doctor: string;
  type: string;
  status: string;
  notes?: string;
}

interface WaitingPatient {
  id: number;
  patient: string;
  ticket: string;
  waiting_minutes: number;
  appointment_time?: string;
}

export default function ReceptionDashboard() {
  const { user, clinic, isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<TodayAppointment[]>([]);
  const [waitingList, setWaitingList] = useState<WaitingPatient[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [loadingWaiting, setLoadingWaiting] = useState(true);

  // Protect route - only secretaries can access
  useRoleGuard(['Secretary']);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const response = await apiClient.get("/secretary/dashboard/stats");
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (isAuthenticated && user?.role === "Secretary") {
      fetchStats();
    }
  }, [isAuthenticated, user]);

  // Fetch today's appointments
  useEffect(() => {
    const fetchTodayAppointments = async () => {
      try {
        setLoadingAppointments(true);
        const response = await apiClient.get("/secretary/dashboard/today-appointments");
        setTodayAppointments(response.data);
      } catch (error) {
        console.error("Error fetching today's appointments:", error);
      } finally {
        setLoadingAppointments(false);
      }
    };

    if (isAuthenticated && user?.role === "Secretary") {
      fetchTodayAppointments();
    }
  }, [isAuthenticated, user]);

  // Fetch waiting room
  useEffect(() => {
    const fetchWaitingRoom = async () => {
      try {
        setLoadingWaiting(true);
        const response = await apiClient.get("/secretary/dashboard/waiting-room");
        setWaitingList(response.data);
      } catch (error) {
        console.error("Error fetching waiting room:", error);
      } finally {
        setLoadingWaiting(false);
      }
    };

    if (isAuthenticated && user?.role === "Secretary") {
      fetchWaitingRoom();
    }
  }, [isAuthenticated, user]);

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

  // Map stats to StatCard format
  const statsCards = stats ? [
    {
      label: t.checkinsToday || "حالات الاستقبال اليوم",
      value: stats.checkins_today,
      sub: language === "ar" ? "منذ بداية اليوم" : "Since the start of the day",
      icon: UserPlus,
      color: "teal" as const,
    },
    {
      label: t.scheduledAppointments || "المواعيد المجدولة اليوم",
      value: stats.scheduled_appointments,
      sub:
        language === "ar"
          ? "بين الساعة 8:00 و 20:00"
          : "Between 08:00 and 20:00",
      icon: CalendarCheck,
      color: "blue" as const,
    },
    {
      label: t.waitingPatients || "المرضى في غرفة الانتظار",
      value: stats.waiting_patients,
      sub:
        language === "ar"
          ? "بمعدل انتظار 12 دقيقة"
          : "Average waiting time 12 min",
      icon: Clock,
      color: "purple" as const,
    },
    {
      label: t.appointmentRequests || "طلبات مواعيد معلّقة",
      value: stats.pending_requests,
      sub:
        language === "ar"
          ? "بانتظار مراجعة السكرتير"
          : "Pending receptionist review",
      icon: AlertCircle,
      color: "amber" as const,
    },
  ] : [];

  // Map today's appointments
  const upcomingAppointments = todayAppointments.map(apt => ({
    time: apt.time,
    patient: apt.patient,
    doctor: apt.doctor,
    type: apt.type,
    status: apt.status.toLowerCase(),
  }));

  // Waiting list is already in the correct format from API

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-900/40 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            {t.statusConfirmed || "مؤكد"}
          </span>
        );
      case "waiting":
        return (
          <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-900/40 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
            {t.statusWaiting || "بانتظار الحضور"}
          </span>
        );
      case "checked-in":
        return (
          <span className="inline-flex items-center rounded-full bg-sky-50 dark:bg-sky-900/40 px-2.5 py-0.5 text-xs font-medium text-sky-700 dark:text-sky-400">
            {t.statusCheckedIn || "تم الاستقبال"}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
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
          {loadingStats ? (
            <div className="col-span-full flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : (
            statsCards.map((item) => (
              <StatCard
                key={item.label}
                label={item.label}
                value={item.value}
                sub={item.sub}
                icon={item.icon}
                color={item.color}
              />
            ))
          )}
        </section>

        {/* Appointments + waiting room */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's appointments */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-300">
            <div className="px-4 sm:px-5 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {t.todaysAppointmentsTitle || "مواعيد اليوم"}
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-slate-400">
                  {t.todaysAppointmentsSubtitle ||
                    (language === "ar"
                      ? "أقرب المواعيد خلال الساعات القادمة"
                      : "Nearest appointments in the next hours")}
                </p>
              </div>
              <button
                onClick={() => router.push("/reception/appointments/requests")}
                className="text-xs text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 hover:underline"
              >
                {t.manageAllAppointments || "إدارة جميع المواعيد"}
              </button>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {loadingAppointments ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                </div>
              ) : upcomingAppointments.length === 0 ? (
                <div className="px-4 sm:px-5 py-6 text-center text-sm text-gray-500 dark:text-slate-400">
                  {language === "ar" ? "لا توجد مواعيد اليوم" : "No appointments today"}
                </div>
              ) : (
                upcomingAppointments.map((app, idx) => (
                  <div
                    key={idx}
                    className="px-4 sm:px-5 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-xs font-semibold text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-lg px-3 py-1">
                        {app.time}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {app.patient}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400">
                          {language === "ar"
                            ? `مع ${app.doctor} • ${app.type}`
                            : `with ${app.doctor} • ${app.type}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(app.status)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Waiting room */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-300">
            <div className="px-4 sm:px-5 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {t.waitingRoomTitle || "غرفة الانتظار الآن"}
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-slate-400">
                  {t.waitingRoomSubtitle || "ترتيب المرضى حسب رقم الدور"}
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-gray-50 dark:bg-slate-700 px-2.5 py-0.5 text-[11px] text-gray-600 dark:text-slate-300 border border-gray-100 dark:border-slate-600">
                {waitingList.length} {language === "ar" ? "مرضى" : "patients"}
              </span>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-slate-700">
              {loadingWaiting ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
                </div>
              ) : waitingList.length === 0 ? (
                <div className="px-4 sm:px-5 py-6 text-center text-sm text-gray-500 dark:text-slate-400">
                  {language === "ar" ? "لا يوجد مرضى في الانتظار" : "No patients waiting"}
                </div>
              ) : (
                waitingList.map((w, idx) => (
                  <div
                    key={idx}
                    className="px-4 sm:px-5 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {w.patient}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {language === "ar"
                          ? `وقت انتظار: ${w.waiting_minutes} دقيقة`
                          : `Waiting time: ${w.waiting_minutes} min`}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="inline-flex items-center rounded-xl bg-gray-900 dark:bg-slate-600 text-white text-xs font-semibold px-3 py-1">
                        {w.ticket}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm transition-colors duration-300">
          <div className="px-4 sm:px-5 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
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
              className="flex flex-col items-start gap-1 rounded-2xl border border-gray-100 dark:border-slate-600 bg-gray-50/80 dark:bg-slate-700/50 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:border-teal-200 dark:hover:border-teal-700 transition px-4 py-3 text-left"
            >
              <span className="text-xs font-semibold text-teal-700 dark:text-teal-400">
                {t.qaNewPatientLabel || "مريض جديد"}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {t.qaNewPatientTitle || "تسجيل مريض جديد وإنشاء حساب تلقائي"}
              </span>
              <span className="text-[11px] text-gray-500 dark:text-slate-400">
                {t.qaNewPatientDesc ||
                  "إدخال الاسم، رقم الهوية، رقم الهاتف – مع إرسال كلمة المرور عبر SMS"}
              </span>
            </button>

            {/* Search patient */}
            <button
              onClick={() => router.push("/reception/patients/search")}
              className="flex flex-col items-start gap-1 rounded-2xl border border-gray-100 dark:border-slate-600 bg-gray-50/80 dark:bg-slate-700/50 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 hover:border-cyan-200 dark:hover:border-cyan-700 transition px-4 py-3 text-left"
            >
              <span className="text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                {t.qaSearchPatientLabel || "البحث عن مريض"}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {t.qaSearchPatientTitle || "الوصول لملف مريض سابق"}
              </span>
              <span className="text-[11px] text-gray-500 dark:text-slate-400">
                {t.qaSearchPatientDesc ||
                  "البحث باستخدام رقم الهوية أو رقم الهاتف لفتح الملف الطبي"}
              </span>
            </button>

            {/* Update patient */}
            <button
              onClick={() => router.push("/reception/patients/update")}
              className="flex flex-col items-start gap-1 rounded-2xl border border-gray-100 dark:border-slate-600 bg-gray-50/80 dark:bg-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-200 dark:hover:border-blue-700 transition px-4 py-3 text-left"
            >
              <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                {t.qaUpdatePatientLabel || (language === "ar" ? "تحديث بيانات مريض" : "Update Patient")}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {t.qaUpdatePatientTitle || (language === "ar" ? "تعديل معلومات مريض موجود" : "Edit existing patient information")}
              </span>
              <span className="text-[11px] text-gray-500 dark:text-slate-400">
                {t.qaUpdatePatientDesc || (language === "ar" ? "تحديث الاسم، رقم الهاتف، العنوان وغيرها من المعلومات" : "Update name, phone, address and other details")}
              </span>
            </button>

            <button
              onClick={() => router.push("/reception/appointments/create")}
              className="flex flex-col items-start gap-1 rounded-2xl border border-gray-100 dark:border-slate-600 bg-gray-50/80 dark:bg-slate-700/50 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700 transition px-4 py-3 text-left"
            >
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">
                {t.qaNewAppointmentLabel || (language === "ar" ? "حجز موعد جديد" : "New Appointment")}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {t.qaNewAppointmentTitle || (language === "ar" ? "إنشاء موعد جديد للمريض" : "Create a new appointment")}
              </span>
              <span className="text-[11px] text-gray-500 dark:text-slate-400">
                {t.qaNewAppointmentDesc || (language === "ar" ? "تحديد وقت، طبيب، ونوع الاستشارة بسهولة وسرعة" : "Select time, doctor, and type of consultation quickly")}
              </span>
            </button>

            {/* Daily financial report */}
            <button
              onClick={() => router.push("/reception/reports/daily")}
              className="flex flex-col items-start gap-1 rounded-2xl border border-gray-100 dark:border-slate-600 bg-gray-50/80 dark:bg-slate-700/50 hover:bg-amber-50 dark:hover:bg-amber-900/30 hover:border-amber-200 dark:hover:border-amber-700 transition px-4 py-3 text-left"
            >
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                {t.qaDailyReportLabel || "التقرير المالي اليومي"}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {t.qaDailyReportTitle || "إحصاء المبالغ المالية الداخلة اليوم"}
              </span>
              <span className="text-[11px] text-gray-500 dark:text-slate-400">
                {t.qaDailyReportDesc ||
                  "إجمالي المبالغ المستلمة، عدد الفواتير المدفوعة وغير المدفوعة، وإجمالي النقدي والإلكتروني"}
              </span>
            </button>

             {/* Appointment requests */}
            <button
              onClick={() => router.push("/reception/appointments/requests")}
              className="flex flex-col items-start gap-1 rounded-2xl border border-gray-100 dark:border-slate-600 bg-gray-50/80 dark:bg-slate-700/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-200 dark:hover:border-emerald-700 transition px-4 py-3 text-left"
            >
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                {t.qaRequestsLabel || "طلبات المواعيد"}
              </span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {t.qaRequestsTitle ||
                  "مراجعة الطلبات القادمة من البوابة الإلكترونية"}
              </span>
              <span className="text-[11px] text-gray-500 dark:text-slate-400">
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
