"use client";

import { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { useRoleGuard } from "@/lib/roleGuard";
import DashboardHero from "@/components/DashboardHero";
import Breadcrumbs from "@/components/Breadcrumbs";

import type {
  PatientDashboardData,
  UpcomingAppointment,
} from "@/types/patientDashboard";
import { PatientStatsSection } from "@/components/patient/PatientStatsSection";
import { PatientQuickActions } from "@/components/patient/PatientQuickActions";
import { PatientUpcomingAppointments } from "@/components/patient/PatientUpcomingAppointments";
import { PatientPrescriptions } from "@/components/patient/PatientPrescriptions";

export default function PatientDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();

  useRoleGuard(["Patient"]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const [dashboardData, setDashboardData] =
    useState<PatientDashboardData | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<
    UpcomingAppointment[]
  >([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;

      try {
        setLoadingData(true);
        const [statsRes, appointmentsRes] = await Promise.all([
          apiClient.get("/patient/dashboard/stats"),
          apiClient.get("/patient/appointments/upcoming"),
        ]);

        setDashboardData(statsRes.data as PatientDashboardData);
        setUpcomingAppointments(
          (appointmentsRes.data.appointments as UpcomingAppointment[]) ?? []
        );
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

  const firstName = user.name.split(" ")[0] || user.name;

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumbs />
        <DashboardHero
          title={
            language === "ar"
              ? `أهلاً، ${firstName} 👋`
              : `Hello, ${firstName} 👋`
          }
          subtitle={
            language === "ar" ? "مرحباً بعودتك" : "Welcome back to your portal"
          }
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
        />

        <PatientStatsSection
          t={t}
          language={language}
          dashboardData={dashboardData}
          loading={loadingData}
        />

        <PatientQuickActions t={t} language={language} />

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <PatientUpcomingAppointments
            t={t}
            language={language}
            loading={loadingData}
            appointments={upcomingAppointments}
          />

          <PatientPrescriptions
            t={t}
            language={language}
            loading={loadingData}
            dashboardData={dashboardData}
          />
        </section>
      </main>
    </div>
  );
}
