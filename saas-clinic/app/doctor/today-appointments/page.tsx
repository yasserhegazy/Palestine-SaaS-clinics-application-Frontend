"use client";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import PageHeader from "@/components/common/PageHeader";
import Breadcrumbs from "@/components/Breadcrumbs";
import type { Appointment } from "@/types/appointment";
import AppointmentDetailsModal from "@/components/doctor/AppointmentDetailsModal";
import CreateMedicalRecordForm from "@/components/doctor/CreateMedicalRecordForm";

// ======== API TYPES التي نحتاجها فقط ======== //
interface ApiPatient {
  patient_id: number;
  name: string;
  phone: string;
}

interface ApiAppointment {
  appointment_id: number;
  appointment_date: string; // "2025-12-05T00:00:00.000000Z"
  appointment_time: string | null; // "15:48:00"
  status: string;
  notes: string | null;
  patient: ApiPatient;
}

interface TodayAppointmentsResponse {
  appointments: ApiAppointment[];
  total: number;
  date: string;
}

interface ApiError {
  message?: string;
  error?: string;
}

export default function TodayAppointmentsPage() {
  const { user, token, isLoading } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loadingAppointments, setLoadingAppointments] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [recordAppointment, setRecordAppointment] =
    useState<Appointment | null>(null);

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      setSearchQuery(searchInput.trim().toLowerCase());
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);

  // ---------- Fetch Appointments ---------- //
const fetchTodayAppointments = async () => {
  try {
    setLoadingAppointments(true);
    setError(null);

    const res = await fetch(`/api/doctor/appointments/today`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();

    if (!res.ok) {
      const errData = json as ApiError;
      throw new Error(
        errData.message ||
          errData.error ||
          (isArabic
            ? "فشل في جلب مواعيد اليوم"
            : "Failed to fetch today's appointments")
      );
    }

    const data = json as TodayAppointmentsResponse;

    const mapped: Appointment[] = (data.appointments || []).map((a) => {
      const dateOnly = a.appointment_date.slice(0, 10);
      const dateTime = a.appointment_time
        ? `${dateOnly}T${a.appointment_time}`
        : a.appointment_date;

      return {
        id: a.appointment_id,
        dateTime,
        status: a.status,
        notes: a.notes || undefined,
        patientName: a.patient?.name || undefined,
        patientPhone: a.patient?.phone || undefined,
        patientId: a.patient?.patient_id,
      };
    });

    setAppointments(mapped);
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : isArabic
        ? "حدث خطأ أثناء جلب المواعيد"
        : "Something went wrong while fetching appointments";

    setError(message);
    toast.error(message);
  } finally {
    setLoadingAppointments(false);
  }
};

useEffect(() => {
  if (!user || !token) return;
  fetchTodayAppointments();
}, [user, token, isArabic]);


  const filteredAppointments = useMemo(() => {
    if (!searchQuery) return appointments;

    return appointments.filter((appt) =>
      (appt.patientName || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [appointments, searchQuery]);

  const nextAppointmentId = useMemo(() => {
    const now = new Date().getTime();

    const times = filteredAppointments
      .map((appt) => {
        if (!appt.dateTime) return null;
        const t = new Date(appt.dateTime).getTime();
        if (Number.isNaN(t) || t <= now) return null;
        return { id: appt.id, time: t };
      })
      .filter(
        (v): v is { id: number; time: number } =>
          v !== null && typeof v.id === "number"
      );

    if (times.length === 0) return null;

    times.sort((a, b) => a.time - b.time);
    return times[0].id;
  }, [filteredAppointments]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  const countLabel = `${filteredAppointments.length} ${
    isArabic ? "موعد" : "appointments"
  }`;

  return (
    <div
      className="min-h-screen bg-slate-50 text-black"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* ====== BREADCRUMBS ====== */}
        <Breadcrumbs />
        
        {/* ====== HEADER ====== */}
        <PageHeader
          label={isArabic ? "جدول اليوم" : "Today's Schedule"}
          title={isArabic ? "مواعيد اليوم" : "Today's Appointments"}
          description={
            isArabic
              ? "استعرض مواعيد اليوم، وابحث بالاسم، وافتح تفاصيل كل زيارة."
              : "Review today’s appointments, search by name, and open visit details."
          }
          backAction={() => router.push("/doctor/dashboard")}
        />

        <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                {isArabic ? "مواعيد اليوم" : "Today's Appointments"}
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-700">
                  {countLabel}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                {isArabic
                  ? "ابحث باسم المريض (يتم التصفية مباشرة أثناء الكتابة)."
                  : "Search by patient name (filters in real time)."}
              </p>
              {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
            </div>

            <div className="w-full md:w-72">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={
                  isArabic ? "ابحث عن مريض بالاسم..." : "Search for a patient…"
                }
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto border rounded-2xl border-slate-100">
            {loadingAppointments ? (
              <p className="p-5 text-sm text-slate-500">
                {isArabic
                  ? "جاري تحميل المواعيد..."
                  : "Loading appointments..."}
              </p>
            ) : filteredAppointments.length === 0 ? (
              <p className="p-5 text-sm text-slate-500">
                {isArabic
                  ? "لا يوجد مواعيد لليوم."
                  : "No appointments for today."}
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50/80">
                  <tr className="text-xs text-slate-500 font-semibold">
                    <th className="px-4 py-3 text-start">
                      {isArabic ? "الوقت" : "Time"}
                    </th>
                    <th className="px-4 py-3 text-start">
                      {isArabic ? "المريض" : "Patient"}
                    </th>
                    <th className="px-4 py-3 text-start">
                      {isArabic ? "الحالة" : "Status"}
                    </th>
                    <th className="px-4 py-3 text-start">
                      {isArabic ? "الإجراءات" : "Actions"}
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredAppointments.map((appt) => {
                    const dateObj = appt.dateTime
                      ? new Date(appt.dateTime)
                      : null;

                    const timeLabel = dateObj
                      ? `${String(dateObj.getHours()).padStart(
                          2,
                          "0"
                        )}:${String(dateObj.getMinutes()).padStart(2, "0")}`
                      : "-";

                    const isNext = nextAppointmentId === appt.id;

                    const patientName =
                      appt.patientName ||
                      (isArabic ? "مريض بدون اسم" : "Unnamed patient");

                    return (
                      <tr
                        key={appt.id}
                        className={
                          isNext
                            ? "bg-teal-50/40"
                            : "hover:bg-slate-50 transition-colors"
                        }
                      >
                        <td className="px-4 py-3 align-middle text-slate-800">
                          <div className="font-medium">{timeLabel}</div>
                        </td>

                        <td className="px-4 py-3 align-middle">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-slate-900">
                              {patientName}
                            </span>
                            {(appt.patientPhone || appt.clinicName) && (
                              <span className="text-[11px] text-slate-500">
                                {appt.patientPhone && (
                                  <>
                                    {isArabic ? "جوال: " : "Phone: "}
                                    {appt.patientPhone}
                                  </>
                                )}
                                {appt.patientPhone && appt.clinicName && " · "}
                                {appt.clinicName && (
                                  <>
                                    {isArabic ? "عيادة: " : "Clinic: "}
                                    {appt.clinicName}
                                  </>
                                )}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-4 py-3 align-middle">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                            {appt.status}
                          </span>
                        </td>

                        <td className="px-4 py-3 align-middle">
                          <button
                            onClick={() => setSelectedAppointment(appt)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 text-slate-700 shadow-sm hover:shadow transition-all"
                          >
                            {isArabic ? "عرض التفاصيل" : "View details"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>

      {selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onCreateMedicalRecord={(appt) => {
            setSelectedAppointment(null);
            setRecordAppointment(appt);
          }}
        />
      )}
      {recordAppointment && (
        <CreateMedicalRecordForm
          appointment={recordAppointment}
          onClose={() => setRecordAppointment(null)}
          onSuccess={() => {
      fetchTodayAppointments();
      setRecordAppointment(null);
    }}
        />
      )}
    </div>
  );
}
