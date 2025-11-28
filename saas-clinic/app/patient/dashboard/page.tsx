"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useRoleGuard } from "@/lib/roleGuard";
import DashboardHero from "@/components/DashboardHero";
import StatCard from "@/components/StatCard";

export default function PatientDashboard() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();
  
  // Protect route - only patients can access
  useRoleGuard(['Patient']);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // State for dashboard data
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoadingData(true);
        const [statsRes, appointmentsRes] = await Promise.all([
          apiClient.get('/patient/dashboard/stats'),
          apiClient.get('/patient/appointments/upcoming')
        ]);

        setDashboardData(statsRes.data);
        setUpcomingAppointments(appointmentsRes.data.appointments);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const firstName = user?.name?.split(" ")[0] || user?.name;

  const getStatusBadge = (status: string) => {
    if (status === "Approved" || status === "confirmed") {
      return (
        <div className="flex flex-col items-end gap-0.5">
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
            {language === "ar" ? "مؤكد" : "Confirmed"}
          </span>
        </div>
      );
    }
    if (status === "Requested" || status === "Pending Doctor Approval" || status === "pending") {
      return (
        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
          {language === "ar" ? "بانتظار الموافقة" : "Pending approval"}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-slate-50">
     
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {t.patientPortal}
            </h1>
            <p className="text-sm text-slate-600">{t.yourHealthRecords}</p>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="text-right">
              <p className="text-sm font-medium text-slate-900">{user.name}</p>
              <p className="text-xs text-slate-500">{user.role}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              {t.logout}
            </button>
          </div>
        </div>
      </header>

      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Hero */}
        <DashboardHero
          title={language === "ar" ? `أهلاً، ${firstName} 👋` : `Hello, ${firstName} 👋`}
          subtitle={language === "ar" ? "مرحباً بعودتك" : "Welcome back to your portal"}
          description={
            language === "ar"
              ? "من هنا يمكنك متابعة مواعيدك، الاطلاع على سجلاتك الطبية والوصفات، والبقاء على اتصال مع عيادتك."
              : "From here you can track your appointments, view your medical records and prescriptions, and stay connected with your clinic."
          }
          primaryAction={
            <button
              onClick={() => router.push("/patient/appointments/new")}
              className="mt-3 inline-flex items-center px-4 py-2.5 rounded-xl bg-white text-teal-700 text-xs font-semibold shadow-sm hover:bg-teal-50"
            >
              {language === "ar" ? "طلب موعد جديد" : "Request new appointment"}
            </button>
          }
          secondaryAction={
            <>
              <p className="text-xs text-teal-100 mb-1">
                {language === "ar" ? "ملخص صحي سريع" : "Quick health summary"}
              </p>
              <p className="font-semibold">
                {language === "ar"
                  ? "حافظ على مواعيد المتابعة بانتظام"
                  : "Keep up with your follow-up visits"}
              </p>
              <p className="text-[11px] text-teal-100 mt-1">
                {language === "ar"
                  ? "تذكير: الالتزام بالعلاج والمراجعة الدورية يساعد في تحسين حالتك الصحية."
                  : "Reminder: Staying consistent with treatment and regular checkups improves your health."}
              </p>
            </>
          }
        />

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label={t.upcomingAppointments}
            value={dashboardData?.stats?.upcoming_appointments || 0}
            sub={
              language === "ar"
                ? "مواعيد قادمة خلال الأيام المقبلة"
                : "Upcoming visits in the next days"
            }
            loading={loadingData}
          />
          <StatCard
            label={t.medicalRecords}
            value={dashboardData?.stats?.medical_records || 0}
            sub={
              language === "ar"
                ? "تقارير وفحوصات محفوظة في ملفك"
                : "Reports and tests stored in your file"
            }
            loading={loadingData}
          />
          <StatCard
            label={t.prescriptions}
            value={dashboardData?.stats?.prescriptions || 0}
            sub={
              language === "ar"
                ? "وصفات فعّالة يمكنك متابعتها الآن"
                : "Active prescriptions to follow now"
            }
            loading={loadingData}
          />
        </section>

        {/* إجراءات سريعة للمريض */}
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
            {/* السجل الطبي */}
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

            {/* مواعيدي */}
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

            {/* طلب موعد جديد */}
            <button
              onClick={() => router.push("/patient/appointments/new")}
              className="flex flex-col items-start gap-1 rounded-xl border border-slate-100 bg-slate-50/80 hover:bg-emerald-50 hover:border-emerald-200 transition px-3 py-3 text-left"
            >
              <span className="text-xs font-semibold text-emerald-700">
                {language === "ar"
                  ? "طلب موعد جديد"
                  : "Request new appointment"}
              </span>
              <span className="text-sm font-medium text-slate-900">
                {language === "ar"
                  ? "اختيار التاريخ والوقت والطبيب المناسب"
                  : "Choose date, time and doctor"}
              </span>
            </button>
          </div>
        </section>

        {/* مواعيد ووصفات */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* مواعيد قادمة */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-4 sm:px-5 py-3 border-b flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {t.upcomingAppointments}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {language === "ar"
                    ? "تفاصيل المواعيد القادمة مع الأطباء"
                    : "Details of your upcoming visits"}
                </p>
              </div>
              <button
                className="text-xs text-teal-700 hover:text-teal-800 hover:underline"
                onClick={() => router.push("/patient/appointments")}
              >
                {language === "ar" ? "عرض كل المواعيد" : "View all"}
              </button>
            </div>

            {loadingData ? (
              <div className="p-6 text-center text-sm text-slate-500">Loading...</div>
            ) : upcomingAppointments.length === 0 ? (
              <div className="p-6">
                <p className="text-sm text-slate-500">
                  {t.noUpcomingAppointments}
                </p>
                <button
                  onClick={() => router.push("/patient/appointments/new")}
                  className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
                >
                  {t.bookAppointment}
                </button>
              </div>
            ) : (
              <div className="divide-y">
                {upcomingAppointments.map((app: any, idx: number) => (
                  <div
                    key={idx}
                    className="px-4 sm:px-5 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center rounded-xl bg-slate-900 text-white px-3 py-2 text-center">
                        <span className="text-xs font-semibold">
                          {new Date(app.appointment_date).toLocaleDateString()}
                        </span>
                        <span className="text-[11px] opacity-80">
                          {new Date(app.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {app.clinic?.name || "Clinic"}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {language === "ar"
                            ? `مع ${app.doctor?.user?.name}`
                            : `With ${app.doctor?.user?.name}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(app.status)}
                      <button className="text-[11px] text-teal-700 hover:underline">
                        {language === "ar"
                          ? "عرض تفاصيل الموعد"
                          : "View appointment details"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* الوصفات الطبية */}
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
              {loadingData ? (
                 <div className="text-center text-sm text-slate-500">Loading...</div>
              ) : dashboardData?.recent_prescriptions?.length > 0 ? (
                dashboardData.recent_prescriptions.map((p: any, idx: number) => (
                <div
                  key={idx}
                  className="border border-slate-100 rounded-xl px-3 py-2.5 bg-slate-50/60 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {p.name}
                    </p>
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
              ))) : (
                <div className="text-center text-sm text-slate-500">
                  {language === "ar" ? "لا توجد وصفات طبية حديثة" : "No recent prescriptions"}
                </div>
              )}
            </div>
          </div>
        </section>

       
      </main>
    </div>
  );
}
