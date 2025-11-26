"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import apiClient from "@/lib/api";

// Backend appointment structure
type BackendAppointment = {
  appointment_id: number;
  appointment_date: string;
  status: string;
  notes?: string;
  doctor: {
    doctor_id: number;
    user: {
      user_id: number;
      name: string;
      email: string;
    };
    specialization?: string;
  };
  clinic: {
    clinic_id: number;
    name: string;
  };
};

// Frontend appointment structure
type Appointment = {
  id: string;
  date: string;
  time: string;
  clinic: string;
  doctor: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  notes?: string;
};

export default function MyAppointmentsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();

  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch appointments from backend
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!isAuthenticated || !user) return;

      try {
        setIsLoadingAppointments(true);
        setError(null);
        
        const response = await apiClient.get<{ appointments: BackendAppointment[] }>(
          "/patient/appointments"
        );

        // Map backend appointments to frontend structure
        const mappedAppointments: Appointment[] = response.data.appointments.map(
          (apt) => {
            const appointmentDateTime = new Date(apt.appointment_date);
            const date = appointmentDateTime.toISOString().split("T")[0];
            const time = appointmentDateTime.toTimeString().slice(0, 5);

            // Map backend status to frontend status
            let status: Appointment["status"] = "pending";
            if (apt.status === "Approved") status = "confirmed";
            else if (apt.status === "Requested" || apt.status === "Pending Doctor Approval") status = "pending";
            else if (apt.status === "Cancelled") status = "cancelled";
            else if (apt.status === "Completed") status = "completed";

            return {
              id: apt.appointment_id.toString(),
              date,
              time,
              clinic: apt.clinic.name,
              doctor: apt.doctor.user.name,
              status,
              notes: apt.notes,
            };
          }
        );

        setAppointments(mappedAppointments);
      } catch (err: any) {
        console.error("Error fetching appointments:", err);
        setError(
          err.response?.data?.message || 
          "Failed to load appointments. Please try again."
        );
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, [isAuthenticated, user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const allAppointments = appointments;

  const now = new Date();

  const filteredAppointments = allAppointments.filter((app) => {
    const appDate = new Date(app.date + "T" + app.time);
    if (filter === "upcoming") return appDate >= now;
    if (filter === "past") return appDate < now;
    return true;
  });

  const getStatusLabel = (status: Appointment["status"]) => {
    if (status === "confirmed") return language === "ar" ? "مؤكد" : "Confirmed";
    if (status === "pending")
      return language === "ar" ? "بانتظار الموافقة" : "Pending";
    if (status === "cancelled") return language === "ar" ? "ملغي" : "Cancelled";
    if (status === "completed")
      return language === "ar" ? "مكتمل" : "Completed";
  };

  const getStatusClass = (status: Appointment["status"]) => {
    if (status === "confirmed")
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (status === "pending")
      return "bg-amber-50 text-amber-700 border-amber-200";
    if (status === "cancelled") return "bg-red-50 text-red-700 border-red-200";
    if (status === "completed")
      return "bg-slate-50 text-slate-700 border-slate-200";
    return "";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* الهيدر */}
      <header className=" border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {language === "ar" ? "مواعيدي" : "My appointments"}
            </h1>
            <p className="text-sm text-slate-600">
              {language === "ar"
                ? "عرض وإدارة مواعيدك الحالية والمستقبلية."
                : "View and manage your current and upcoming appointments."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={() => router.push("/patient/dashboard")}
              className="text-sm text-teal-700 hover:text-teal-800 hover:underline"
            >
              {language === "ar" ? "رجوع" : "Back "}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
       
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                filter === "all"
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-slate-700 border-slate-200"
              }`}
            >
              {language === "ar" ? "الكل" : "All"}
            </button>
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                filter === "upcoming"
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-slate-700 border-slate-200"
              }`}
            >
              {language === "ar" ? "المواعيد القادمة" : "Upcoming"}
            </button>
            <button
              onClick={() => setFilter("past")}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                filter === "past"
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-white text-slate-700 border-slate-200"
              }`}
            >
              {language === "ar" ? "المواعيد السابقة" : "Past"}
            </button>
          </div>

          <button
            onClick={() => router.push("/patient/appointments/new")}
            className="text-xs px-4 py-2 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700"
          >
            {language === "ar" ? "طلب موعد جديد" : "Request new appointment"}
          </button>
        </div>

        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {isLoadingAppointments ? (
            <div className="p-8 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : error ? (
            <div className="p-6">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 text-xs text-teal-700 hover:underline"
              >
                {language === "ar" ? "إعادة المحاولة" : "Retry"}
              </button>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-6">
              <p className="text-sm text-slate-500">
                {language === "ar"
                  ? "لا توجد مواعيد مطابقة للفلتر الحالي."
                  : "No appointments match the current filter."}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredAppointments.map((app) => (
                <div
                  key={app.id}
                  className="px-4 sm:px-5 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center justify-center rounded-xl bg-slate-900 text-white px-3 py-2 text-center">
                      <span className="text-xs font-semibold">{app.date}</span>
                      <span className="text-[11px] opacity-80">{app.time}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {app.clinic}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {language === "ar"
                          ? `مع ${app.doctor}`
                          : `With ${app.doctor}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${getStatusClass(
                        app.status
                      )}`}
                    >
                      {getStatusLabel(app.status)}
                    </span>
                    <button className="text-[11px] text-teal-700 hover:underline">
                      {language === "ar" ? "عرض تفاصيل الموعد" : "View details"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
