"use client";
console.log("🔥 DoctorDashboard FILE loaded");

import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import type { Appointment } from "@/types/appointment";
import { AppointmentFilters } from "@/components/doctor/AppointmentFilters";
import { AppointmentTable } from "@/components/doctor/AppointmentTable";
import { useLanguage } from "@/context/LanguageContext";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/common/PageHeader";
import Breadcrumbs from "@/components/Breadcrumbs";

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

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

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

  const hasLoaded = useRef(false);

  const fetchAppointments = useCallback(async () => {
    if (!user || !token) return;

    try {
      if (!hasLoaded.current) {
        setIsLoadingAppointments(true);
      }

      setAppointmentsError(null);

      const res = await fetch("/api/doctor/appointments/requests", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();

      if (!res.ok) {
        const errorData = json as ApiError;
        throw new Error(
          errorData.message ||
            errorData.error ||
            (isArabic ? "فشل في جلب المواعيد" : "Failed to fetch appointments")
        );
      }

      const data = json as AppointmentsResponse;
      setAppointments(data.appointments);
      hasLoaded.current = true;
    } catch (err: unknown) {
      let message = isArabic
        ? "فشل في جلب المواعيد"
        : "Failed to fetch appointments";
      if (err instanceof Error) message = err.message;
      setAppointmentsError(message);
      toast.error(message);
    } finally {
      setIsLoadingAppointments(false);
    }
  }, [user, token, isArabic]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleApprove = async (appointmentId: number) => {
    if (!token) {
      alert(isArabic ? "الرمز مفقود" : "Missing token");
      return;
    }

    try {
      const res = await fetch(
        `/api/doctor/appointments/approve/${appointmentId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            (isArabic ? "فشل في قبول الموعد" : "Failed to approve appointment")
        );
      }

      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appointmentId ? { ...a, status: "approved" } : a
        )
      );

      toast.success(
        isArabic ? "تم قبول الموعد بنجاح" : "Appointment approved successfully"
      );
      fetchAppointments();
    } catch (err: unknown) {
      let message = isArabic
        ? "فشل في قبول الموعد"
        : "Failed to approve appointment";
      if (err instanceof Error) message = err.message;
      toast.error(message);
    }
  };

  const handleReject = async (
    appointmentId: number,
    rejectionReason: string
  ) => {
    if (!token) return alert(isArabic ? "الرمز مفقود" : "Missing token");
    if (!rejectionReason.trim())
      return alert(
        isArabic ? "سبب الرفض مطلوب" : "Rejection reason is required"
      );

    try {
      const res = await fetch(
        `/api/doctor/appointments/reject/${appointmentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rejection_reason: rejectionReason }),
        }
      );

      const data = await res.json();

      if (!res.ok)
        throw new Error(
          data.message ||
            (isArabic ? "فشل في رفض الموعد" : "Failed to reject appointment")
        );

      setAppointments((prev) => prev.filter((a) => a.id !== appointmentId));
      toast.success(
        isArabic ? "تم رفض الموعد بنجاح" : "Appointment rejected successfully"
      );
      fetchAppointments();
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : isArabic
          ? "فشل في رفض الموعد"
          : "Failed to reject appointment"
      );
    }
  };

  const handleReschedule = async (
    id: number,
    appointment_date: string,
    appointment_time: string
  ) => {
    if (!token) {
      alert(isArabic ? "غير مصرح: الرمز مفقود" : "Unauthorized: missing token");
      return;
    }

    try {
      const res = await fetch(`/api/doctor/appointments/reschedule/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointment_date,
          appointment_time,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        const errorData = json as ApiError;
        throw new Error(
          errorData.message ||
            errorData.error ||
            (isArabic
              ? "خطأ في إعادة جدولة الموعد"
              : "Error rescheduling appointment")
        );
      }

      setAppointments((prev) =>
        prev.map((a) =>
          a.id === id
            ? {
                ...a,
                status: "approved",
                appointment_date,
                appointment_time,
              }
            : a
        )
      );

      toast.success(
        isArabic
          ? "تم إعادة جدولة الموعد بنجاح"
          : "Appointment rescheduled successfully"
      );
      fetchAppointments();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : isArabic
          ? "خطأ في إعادة جدولة الموعد"
          : "Error rescheduling appointment";
      toast.error(message);
    }
  };

  const filteredAppointments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return appointments.filter((appt) => {
      const matchesStatus =
        statusFilter === "all" ||
        appt.status?.toLowerCase() === statusFilter.toLowerCase();

      let apptDate = "";
      if (appt.dateTime) {
        apptDate = new Date(appt.dateTime).toISOString().slice(0, 10);
      }
      const matchesDate = !dateFilter || apptDate === dateFilter;

     const matchesSearch =
       !term ||
       (appt.patientName ?? "").toLowerCase().includes(term) ||
       (appt.patientPhone ?? "").toLowerCase().includes(term) ||
       (appt.clinicName ?? "").toLowerCase().includes(term) ||
       (appt.notes ?? "").toLowerCase().includes(term);


      return matchesStatus && matchesDate && matchesSearch;
    });
  }, [appointments, statusFilter, dateFilter, searchTerm]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900" dir={isArabic ? "rtl" : "ltr"}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumbs />

        <PageHeader
          label={isArabic ? "إدارة مواعيدك" : "Manage your appointments"}
          title={
            isArabic
              ? "طلبات المواعيد من المرضى"
              : "Patients' appointment requests"
          }
          description={
            isArabic
              ? "راجع المواعيد المعلقة، وافق أو ارفض أو أعد جدولة مباشرة من هذه الصفحة."
              : "Review pending appointments, approve, reject, or reschedule directly from this page."
          }
          backAction={() => router.push("/doctor/dashboard")}
        />

        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {isArabic ? "طلبات المواعيد" : "Appointment requests"}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isArabic
                  ? "جميع الطلبات المعلقة والمقبولة من المرضى."
                  : "Pending and approved appointment requests from your patients."}
              </p>
              {appointmentsError && (
                <p className="mt-1 text-[11px] text-red-600">
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
