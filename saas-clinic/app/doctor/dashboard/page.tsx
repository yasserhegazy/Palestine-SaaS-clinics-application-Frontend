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
  appointments?: ApiAppointment[];
  data?: ApiAppointment[];
}

type ApiError = {
  message?: string;
  error?: string;
};

function normalizeAppointments(
  json: AppointmentsResponse | Appointment[]
): Appointment[] {
  const base: (ApiAppointment | Appointment)[] = Array.isArray(json)
    ? json
    : json.appointments ?? json.data ?? [];

  return base.map((raw) => {
    const a = raw as ApiAppointment & Partial<Appointment>;

    const appointment_date =
      a.appointment_date ??
      (a.dateTime
        ? new Date(a.dateTime).toISOString().slice(0, 10)
        : undefined);

    const appointment_time =
      a.appointment_time ??
      (a.dateTime
        ? new Date(a.dateTime).toTimeString().slice(0, 5)
        : undefined);

    const dateTime =
      a.dateTime ??
      (appointment_date && appointment_time
        ? `${appointment_date}T${appointment_time}`
        : appointment_date
        ? `${appointment_date}T00:00`
        : undefined);

    const normalized: Appointment = {
      id: a.id ?? a.appointment_id ?? 0,
      dateTime,
      status: a.status ?? a.appointment_status ?? "requested",
      notes: a.notes ?? a.reason ?? "",
      patientName: a.patientName ?? a.patient_name ?? "",
      patientPhone: a.patientPhone ?? a.patient_phone ?? "",
      clinicName: a.clinicName ?? a.clinic_name ?? "",
    };

    return normalized;
  });
}

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

      const normalized = normalizeAppointments(json);
      setAppointments(normalized);
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  const firstName = user.name?.split(" ")[1] || user.name;

  return (
    <div className="min-h-screen bg-slate-50" dir={isArabic ? "rtl" : "ltr"}>
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
              onClick={() => router.push("/doctor/today-appointments/")}
              className="mt-3 inline-flex items-center px-4 py-2.5 rounded-xl bg-white text-teal-700 text-xs font-semibold shadow-sm hover:bg-teal-50"
            >
              {isArabic ? "عرض جدول اليوم" : "View today's schedule"}
            </button>
          }
        />

        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              {isArabic ? "نظرة عامة على اليوم" : "Today's overview"}
            </h3>
          </div>
          <DoctorStats appointments={appointments} />

          {isLoadingAppointments && (
            <p className="mt-2 text-xs text-slate-500">
              {isArabic ? "جاري تحميل المواعيد..." : "Loading appointments..."}
            </p>
          )}
          {appointmentsError && (
            <p className="mt-2 text-xs text-red-600">{appointmentsError}</p>
          )}
        </section>

        {/* Quick Actions */}
        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="px-4 sm:px-5 py-3 border-b flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {isArabic ? "الإجراءات السريعة" : "Quick Actions"}
              </h3>
            </div>
          </div>

          <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionCard
              label={isArabic ? "المواعيد القادمة" : "Appointments uncoming"}
              title={isArabic ? "مواعيد القادمة" : " uncoming Schedule"}
              description={
                isArabic
                  ? "عرض جميع مواعيد اليوم"
                  : "View all appointments uncoming"
              }
              href="/doctor/upcoming-appointments"
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
              href="/doctor/appointments"
              color="blue"
            />

            <QuickActionCard
              label={isArabic ? "السجلات الطبية" : "Medical Records"}
              title={isArabic ? "السجلات الطبية" : "Patient Records"}
              description={
                isArabic
                  ? "الوصول إلى السجلات الطبية"
                  : "Access medical records"
              }
              href="/doctor/medical-records"
              color="purple"
            />

            <QuickActionCard
              label={isArabic ? "البحث عن مريض" : "Search Patient"}
              title={isArabic ? "البحث عن مريض" : "Find Patient"}
              description={
                isArabic ? "البحث في قاعدة البيانات" : "Search patient database"
              }
              href="/doctor/patients"
              color="orange"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
