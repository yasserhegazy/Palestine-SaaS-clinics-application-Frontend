"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useCallback } from "react";
import type { Appointment } from "@/types/appointment";
import { DoctorStats } from "@/components/doctor/DoctorStats";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/DashboardHeader";
import DashboardHero from "@/components/DashboardHero";


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
  const { user, token, logout, clinic, isLoading } = useAuth();
  const { language } = useLanguage();
  const t = [language];
  const isArabic = language === "ar";
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(
    null
  );

  const fetchAppointments = useCallback(async () => {
    console.log("🚀 [Dashboard] fetchAppointments running");

    if (!user || !token) {
      console.log("⛔ [Dashboard] no user or token", { user, token });
      return;
    }

    try {
      setIsLoadingAppointments(true);
      setAppointmentsError(null);

      console.log(
        "➡️ [Dashboard] FETCH /api/doctor/appointments with token:",
        token
      );

      const res = await fetch("/api/doctor/appointments", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("[Dashboard] Response status:", res.status);
      const json: AppointmentsResponse = await res.json().catch((e) => {
        console.error("[Dashboard] Error parsing JSON:", e);
        return {};
      });
      console.log("⬅️ [Dashboard] RAW API RESPONSE:", json);

      if (!res.ok) {
        const errorData = json as ApiError;
        throw new Error(
          errorData.message ||
            errorData.error ||
            (isArabic ? "فشل في جلب المواعيد" : "Failed to fetch appointments")
        );
      }

      const normalized = normalizeAppointments(json);
      console.log(
        "✅ [Dashboard] normalized appointments length:",
        normalized.length
      );
      console.log("🧪 [Dashboard] first appointment:", normalized[0]);

      setAppointments(normalized);
    } catch (err: unknown) {
      console.error("❌ [Dashboard] Error fetching appointments:", err);
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
    console.log("🔁 [Dashboard] useEffect dependency change", {
      user,
      token,
      isArabic,
    });
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
      <DashboardHeader user={user} logout={logout} t={t} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
              : "Here you can review today’s appointments, patient requests, and urgent tasks at a glance."
          }
          primaryAction={
            <button
              onClick={() => router.push("/doctor/today-appointments/")}
              className="mt-3 inline-flex items-center px-4 py-2.5 rounded-xl bg-white text-teal-700 text-xs font-semibold shadow-sm hover:bg-teal-50"
            >
              {isArabic ? "عرض جدول اليوم" : "View today’s schedule"}
            </button>
          }
          secondaryAction={
            <div className="self-start md:self-center bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm max-w-xs">
              <p className="text-xs text-teal-100 mb-1">
                {isArabic ? "ملخص سريع لليوم" : "Quick overview for today"}
              </p>

              <p className="font-semibold">
                {isArabic
                  ? "ابدأ بالنتائج الحرجة والطلبات المعلقة"
                  : "Start with critical results and pending requests"}
              </p>

              <p className="text-[11px] text-teal-100 mt-1 leading-relaxed">
                {isArabic
                  ? "مراجعة النتائج الحرجة ورسائل المرضى أولاً تساعد في تحسين رعاية المرضى."
                  : "Reviewing critical lab results and patient messages first helps improve patient care."}
              </p>
            </div>
          }
        />

        <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              {isArabic ? "نظرة عامة على اليوم" : "Today’s overview"}
            </h3>
            <p className="text-[11px] text-slate-500">
              {isArabic
                ? "ملخص سريع لحركة المواعيد والنشاط لديك."
                : "High-level insight into your appointments and activity."}
            </p>
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

        <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">
              {isArabic ? "إجراءات سريعة" : "Quick actions"}
            </h3>
            <p className="text-[11px] text-slate-500">
              {isArabic
                ? "وصول سريع لأهم أدوات عملك اليومية."
                : "Frequently used tools for your daily workflow."}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => router.push("/doctor/appointments")}
              type="button"
              className="flex flex-col items-start gap-1 rounded-xl border border-slate-100 bg-slate-50/80 hover:bg-teal-50 hover:border-teal-200 transition px-3 py-3 text-left"
            >
              <span className="text-xs font-semibold text-teal-700">
                {isArabic ? "طلبات المواعيد" : "Appointment requests"}
              </span>
              <span className="text-sm font-medium text-slate-900">
                {isArabic
                  ? "مراجعة المواعيد المعلقة والمقبولة"
                  : "Review pending & approved requests"}
              </span>
              <span className="text-[11px] text-slate-500">
                {isArabic
                  ? "قبول، رفض أو إعادة جدولة من نفس المكان."
                  : "Approve, reject, or reschedule in one view."}
              </span>
            </button>
            <button
              onClick={() => router.push("/doctor/upcoming-appointments")}
              type="button"
              className="flex flex-col items-start gap-1 rounded-xl border border-slate-100 bg-slate-50/80 hover:bg-teal-50 hover:border-teal-200 transition px-3 py-3 text-left"
            >
              <span className="text-xs font-semibold text-teal-700">
                {isArabic ? "المواعيد القادمة" : "Upcoming Appointments"}
              </span>

              <span className="text-sm font-medium text-slate-900">
                {isArabic
                  ? "عرض ومتابعة المواعيد القادمة"
                  : "View and track upcoming appointments"}
              </span>

              <span className="text-[11px] text-slate-500">
                {isArabic
                  ? "متابعة جميع المواعيد المجدولة بسهولة."
                  : "Easily track all scheduled appointments."}
              </span>
            </button>

            <button
              type="button"
              className="flex flex-col items-start gap-1 rounded-xl border border-slate-100 bg-slate-50/80 hover:bg-cyan-50 hover:border-cyan-200 transition px-3 py-3 text-left"
            >
              <span className="text-xs font-semibold text-cyan-700">
                {isArabic ? "متابعة المرضى" : "Patient follow-ups"}
              </span>
              <span className="text-sm font-medium text-slate-900">
                {isArabic
                  ? "المرضى الذين يحتاجون مراجعة قريبة"
                  : "Track patients needing follow-up"}
              </span>
              <span className="text-[11px] text-slate-500">
                {isArabic
                  ? "حافظ على متابعة الحالات المزمنة والحساسة."
                  : "Keep chronic cases and recent discharges in check."}
              </span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
