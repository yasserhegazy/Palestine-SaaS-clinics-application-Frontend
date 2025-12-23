"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useCallback } from "react";
import type { Appointment } from "@/types/appointment";
import { DoctorStats } from "@/components/doctor/DoctorStats";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import DashboardHero from "@/components/DashboardHero";
import Breadcrumbs from "@/components/Breadcrumbs";
import QuickActionCard from "@/components/QuickActionCard";


interface ApiAppointment {
  id?: number;
  appointment_id?: number;
  appointment_date?: string;
  appointment_time?: string | null;
  patient_name?: string;
  patient_phone?: string;
  clinic_name?: string;
  reason?: string;
  appointment_status?: string;
  dateTime?: string;
  patientName?: string;
  patientPhone?: string;
  clinicName?: string;
  notes?: string;
  status?: string;
}

interface AppointmentsResponse {
  appointments?: Appointment[];
  data?: Appointment[];
}

type ApiError = {
  message?: string;
  error?: string;
};

export default function DoctorDashboard() {
  const { user, token, isLoading } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(null);


  const fetchAppointments = useCallback(async () => {
    if (!user || !token) return;

    try {
      setIsLoadingAppointments(true);
      setAppointmentsError(null);

      const res = await fetch("/api/doctor/appointments", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json: AppointmentsResponse = await res.json().catch(() => {
        return {};
      });

      if (!res.ok) {
        const errorData = json as ApiError;
        throw new Error(
          errorData.message ||
            errorData.error ||
            (isArabic ? "فشل في جلب المواعيد" : "Failed to fetch appointments")
        );
      }

      const list =
        (json.appointments && Array.isArray(json.appointments)
          ? json.appointments
          : Array.isArray(json.data)
          ? json.data
          : []) as Appointment[];

      setAppointments(list);
    } catch (err: unknown) {
      let message = isArabic
        ? "فشل في جلب المواعيد"
        : "Failed to fetch appointments";
      if (err instanceof Error) message = err.message;
      setAppointmentsError(message);
    } finally {
      setIsLoadingAppointments(false);
    }
  }, [user, token, isArabic]);

  useEffect(() => {
    if (!user || !token) return;
    fetchAppointments();
  }, [fetchAppointments]);


  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 dark:border-teal-400" />
      </div>
    );
  }

  const firstName = user.name?.split(" ")[1] || user.name;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300" dir={isArabic ? "rtl" : "ltr"}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumbs />

        <DashboardHero
          title={
            isArabic ? `أهلاً د. ${firstName} 👋` : `Hello Dr. ${firstName} 👋`
          }
          subtitle={
            isArabic
              ? "مرحباً بعودتك إلى العيادة"
              : "Welcome back to your clinic"
          }
          description={
            isArabic
              ? "هنا يمكنك مراجعة مواعيد اليوم، طلبات المرضى، والمهام العاجلة بسرعة."
              : "Here you can review today's appointments, patient requests, and urgent tasks at a glance."
          }
          primaryAction={
            <button
              onClick={() => router.push("/doctor/appointments/today")}
              className="mt-3 inline-flex items-center px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 text-xs font-semibold shadow-sm hover:bg-teal-50 dark:hover:bg-slate-700 transition-colors"
            >
              {isArabic ? "عرض جدول اليوم" : "View today's schedule"}
            </button>
          }
        />

        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 sm:p-5 transition-colors duration-300">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {isArabic ? "نظرة عامة على اليوم" : "Today's overview"}
            </h3>
          </div>
          <DoctorStats appointments={appointments} />

          {isLoadingAppointments && (
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {isArabic ? "جاري تحميل المواعيد..." : "Loading appointments..."}
            </p>
          )}
          {appointmentsError && (
            <p className="mt-2 text-xs text-red-600 dark:text-red-400">{appointmentsError}</p>
          )}
        </section>

        {/* Quick Actions */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm transition-colors duration-300">
          <div className="px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {isArabic ? "الإجراءات السريعة" : "Quick Actions"}
              </h3>
            </div>
          </div>

          <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionCard
              label={isArabic ? "المواعيد القادمة" : "Upcoming Appointments"}
              title={isArabic ? "المواعيد القادمة" : "Upcoming Schedule"}
              description={
                isArabic
                  ? "عرض جميع المواعيد القادمة"
                  : "View all upcoming appointments"
              }
              href="/doctor/appointments/upcoming"
              color="teal"
            />

            <QuickActionCard
              label={isArabic ? "طلبات المواعيد" : "Appointment Requests"}
              title={isArabic ? "طلبات المواعيد" : "Pending Requests"}
              description={
                isArabic
                  ? "مراجعة وإدارة الطلبات"
                  : "Review and manage requests"
              }
              href="/doctor/appointments/requests"
              color="blue"
            />

            <QuickActionCard
              label={isArabic ? "مواعيد اليوم" : "Today's Appointments"}
              title={isArabic ? "مواعيد اليوم" : "Today's Schedule"}
              description={
                isArabic
                  ? "عرض مواعيد اليوم والسجلات"
                  : "View today's appointments and records"
              }
              href="/doctor/appointments/today"
              color="purple"
            />

            <QuickActionCard
              label={isArabic ? "البحث عن مريض" : "Search Patient"}
              title={isArabic ? "البحث عن مريض" : "Find Patient"}
              description={
                isArabic ? "البحث في قاعدة البيانات" : "Search patient database"
              }
              href="/reception/patients/search"
              color="orange"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
