"use client";
console.log("🔥 DoctorDashboard FILE loaded");

import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo, useState, useCallback } from "react";
import toast from "react-hot-toast";
import type { Appointment } from "@/types/appointment";
import { AppointmentFilters } from "@/components/doctor/AppointmentFilters";
import { AppointmentTable } from "@/components/doctor/AppointmentTable";
import { useLanguage } from "@/context/LanguageContext";
import { useSearchParams, useRouter } from "next/navigation";
import PageHeader from "@/components/common/PageHeader";

interface AppointmentsResponse {
  appointments: Appointment[];
}

type ApiError = {
  message?: string;
  error?: string;
};

export default function DoctorAppointmentsPage() {
  const { user, token, isLoading } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === "ar";

  const searchParams = useSearchParams();
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(
    null
  );

  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // =============================
  // 1) Fetch Initial Appointments
  // =============================
  const fetchAppointments = useCallback(async () => {
    if (!user || !token) return;

    try {
      setIsLoadingAppointments(true);
      setAppointmentsError(null);

      const res = await fetch("/api/doctor/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();

      if (!res.ok) {
        const err = json as ApiError;
        throw new Error(
          err.message ||
            err.error ||
            (isArabic ? "فشل في جلب المواعيد" : "Failed to fetch appointments")
        );
      }

      const data = json as AppointmentsResponse;
      setAppointments(data.appointments);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      const msg =
        err instanceof Error
          ? err.message
          : isArabic
          ? "فشل في جلب المواعيد"
          : "Failed to fetch appointments";

      setAppointmentsError(msg);
      toast.error(msg);
    } finally {
      setIsLoadingAppointments(false);
    }
  }, [user, token, isArabic]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // تعيين فلتر "اليوم"
  useEffect(() => {
    const view = searchParams.get("view");
    if (view === "today") {
      const today = new Date();
      const y = today.getFullYear();
      const m = String(today.getMonth() + 1).padStart(2, "0");
      const d = String(today.getDate()).padStart(2, "0");
      setDateFilter(`${y}-${m}-${d}`);
    }
  }, [searchParams]);

  // =============================
  // 2) Approve Appointment
  // =============================
  const handleApprove = async (appointmentId: number) => {
    try {
      const res = await fetch(
        `/api/doctor/appointments/approve/${appointmentId}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // تحديث فوري بدون انتظار API
      setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));

      toast.success(isArabic ? "تم قبول الموعد" : "Appointment approved");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : isArabic
          ? "خطأ في قبول الموعد"
          : "Failed to approve"
      );
    }
  };

  // =============================
  // 3) Reject Appointment
  // =============================
  const handleReject = async (appointmentId: number, reason: string) => {
    if (!reason.trim()) {
      return alert(isArabic ? "سبب الرفض مطلوب" : "Rejection reason required");
    }

    try {
      const res = await fetch(
        `/api/doctor/appointments/reject/${appointmentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rejection_reason: reason }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // حذف فوري من الجدول
      setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));

      toast.success(isArabic ? "تم رفض الموعد" : "Appointment rejected");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : isArabic
          ? "خطأ في رفض الموعد"
          : "Failed to reject"
      );
    }
  };

  // =============================
  // 4) Reschedule Appointment
  // =============================
  const handleReschedule = async (id: number, date: string, time: string) => {
    try {
      const res = await fetch(`/api/doctor/appointments/reschedule/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointment_date: date,
          appointment_time: time,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // تحديث فوري بدون API fetch
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id
            ? { ...a, status: "approved", dateTime: `${date}T${time}` }
            : a
        )
      );

      toast.success(isArabic ? "تم إعادة الجدولة" : "Rescheduled");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : isArabic
          ? "خطأ في إعادة الجدولة"
          : "Failed to reschedule"
      );
    }
  };

  // =============================
  // 5) Filtering Logic (Safe)
  // =============================
  const filteredAppointments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return appointments.filter((appt) => {
      const matchesStatus =
        statusFilter === "all" ||
        appt.status.toLowerCase() === statusFilter.toLowerCase();

      const dateString = appt.dateTime
        ? new Date(appt.dateTime).toISOString().slice(0, 10)
        : "";

      const matchesDate = !dateFilter || dateString === dateFilter;

      const matchesSearch =
        !term ||
        (appt.patientName ?? "").toLowerCase().includes(term) ||
        (appt.patientPhone ?? "").toLowerCase().includes(term) ||
        (appt.clinicName ?? "").toLowerCase().includes(term) ||
        (appt.notes ?? "").toLowerCase().includes(term);

      return matchesStatus && matchesDate && matchesSearch;
    });
  }, [appointments, statusFilter, dateFilter, searchTerm]);

  // =============================
  // LOADING
  // =============================
  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  // =============================
  // UI
  // =============================
  return (
    <div className="min-h-screen bg-slate-50" dir={isArabic ? "rtl" : "ltr"}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          label={isArabic ? "إدارة مواعيدك" : "Manage your appointments"}
          title={
            isArabic
              ? "طلبات المواعيد من المرضى"
              : "Patients' appointment requests"
          }
          description={
            isArabic
              ? "راجع ووافق أو ارفض أو أعد جدولة المواعيد."
              : "Review, approve, reject or reschedule appointments."
          }
          backAction={() => router.push("/doctor/dashboard")}
        />

        <section className="bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex flex-col md:flex-row justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                {isArabic ? "طلبات المواعيد" : "Appointment requests"}
              </h3>
              <p className="text-[11px] text-slate-500">
                {isArabic
                  ? "جميع الطلبات المعلقة والمقبولة."
                  : "All pending and approved requests."}
              </p>

              {appointmentsError && (
                <p className="text-[11px] text-red-600 mt-1">
                  {appointmentsError}
                </p>
              )}
            </div>

            <AppointmentFilters
              statusFilter={statusFilter}
              dateFilter={dateFilter}
              searchTerm={searchTerm}
              onStatusChange={setStatusFilter}
              onDateChange={setDateFilter}
              onSearchChange={setSearchTerm}
            />
          </div>

          <div className="p-4 sm:p-6">
            <AppointmentTable
              appointments={filteredAppointments}
              isLoading={isLoadingAppointments}
              error={appointmentsError}
              onApprove={handleApprove}
              onReject={handleReject}
              onReschedule={handleReschedule}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
