"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import apiClient from "@/lib/api";
import PageHeader from "@/components/common/PageHeader";
import Breadcrumbs from "@/components/Breadcrumbs";

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
  doctorId?: number;
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
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Array<{ doctor_id: number; name: string; specialization: string }>>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null);
  const [flashMessage, setFlashMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
              doctorId: apt.doctor.doctor_id,
              status,
              notes: apt.notes,
            };
          }
        );

        setAppointments(mappedAppointments);
      } catch (err: unknown) {
  console.error("Error fetching appointments:", err);

  const message =
    err instanceof Error
      ? err.message
      : "Failed to load appointments. Please try again.";

  setError(message);
}
finally {
        setIsLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, [isAuthenticated, user]);

  useEffect(() => {
    const fetchDoctors = async () => {
      if (!isAuthenticated || !user) return;
      try {
        const response = await apiClient.get<{ doctors: Array<{ doctor_id: number; name: string; specialization: string }> }>('/patient/doctors');
        setDoctors(response.data.doctors);
      } catch (err) {
        console.error('Error fetching doctors:', err);
      }
    };
    fetchDoctors();
  }, [isAuthenticated, user]);

  const handleDelete = async () => {
    if (!appointmentToDelete) return;
    
    try {
      setDeletingId(appointmentToDelete);
      await apiClient.post(`/patient/appointments/${appointmentToDelete}/cancel`);
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentToDelete));
      setFlashMessage({ type: 'success', message: language === "ar" ? "تم إلغاء الموعد بنجاح" : "Appointment cancelled successfully" });
      setTimeout(() => setFlashMessage(null), 3000);
    } catch (err) {
      setFlashMessage({ type: 'error', message: language === "ar" ? "فشل إلغاء الموعد" : "Failed to cancel appointment" });
      setTimeout(() => setFlashMessage(null), 3000);
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setAppointmentToDelete(null);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingAppointment) return;

    const formData = new FormData(e.currentTarget);
    const appointmentDate = `${formData.get('date')}T${formData.get('time')}:00`;

    try {
      await apiClient.put(`/patient/appointments/${editingAppointment.id}`, {
        doctor_id: parseInt(formData.get('doctor_id') as string),
        appointment_date: appointmentDate,
        notes: formData.get('notes'),
      });
      
      setEditingAppointment(null);
      
      const response = await apiClient.get<{ appointments: BackendAppointment[] }>('/patient/appointments');
      const mappedAppointments: Appointment[] = response.data.appointments.map((apt) => {
        const appointmentDateTime = new Date(apt.appointment_date);
        const date = appointmentDateTime.toISOString().split("T")[0];
        const time = appointmentDateTime.toTimeString().slice(0, 5);
        let status: Appointment["status"] = "pending";
        if (apt.status === "Approved") status = "confirmed";
        else if (apt.status === "Requested" || apt.status === "Pending Doctor Approval") status = "pending";
        else if (apt.status === "Cancelled") status = "cancelled";
        else if (apt.status === "Completed") status = "completed";
        return { id: apt.appointment_id.toString(), date, time, clinic: apt.clinic.name, doctor: apt.doctor.user.name, doctorId: apt.doctor.doctor_id, status, notes: apt.notes };
      });
      setAppointments(mappedAppointments);
      setFlashMessage({ type: 'success', message: language === "ar" ? "تم تحديث الموعد بنجاح" : "Appointment updated successfully" });
      setTimeout(() => setFlashMessage(null), 3000);
    } catch (err) {
      setFlashMessage({ type: 'error', message: language === "ar" ? "فشل تحديث الموعد" : "Failed to update appointment" });
      setTimeout(() => setFlashMessage(null), 3000);
    }
  };

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
      return "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400";
    if (status === "pending")
      return "bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400";
    if (status === "cancelled") return "bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-400";
    if (status === "completed")
      return "bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300";
    return "";
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <Breadcrumbs />

        <PageHeader
          label={language === "ar" ? "مواعيدي الحالية  " : "My appointments"}
          title={language === "ar" ? "مواعيدي" : "My appointments"}
          description={
            language === "ar"
              ? "عرض وإدارة مواعيدك الحالية والمستقبلية."
              : "View and manage your current and upcoming appointments."
          }
        />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors duration-300">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filter === "all"
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                {language === "ar" ? "الكل" : "All"}
              </button>
              <button
                onClick={() => setFilter("upcoming")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filter === "upcoming"
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                {language === "ar" ? "المواعيد القادمة" : "Upcoming"}
              </button>
              <button
                onClick={() => setFilter("past")}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filter === "past"
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
                }`}
              >
                {language === "ar" ? "المواعيد السابقة" : "Past"}
              </button>
            </div>

            <button
              onClick={() => router.push("/patient/appointments/new")}
              className="text-xs px-4 py-2 rounded-xl bg-teal-600 dark:bg-teal-500 text-white font-medium hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors"
            >
              {language === "ar" ? "طلب موعد جديد" : "Request new appointment"}
            </button>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors duration-300">
            {isLoadingAppointments ? (
              <div className="p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              </div>
            ) : error ? (
              <div className="p-6">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-xs text-teal-700 dark:text-teal-400 hover:underline"
                >
                  {language === "ar" ? "إعادة المحاولة" : "Retry"}
                </button>
              </div>
            ) : filteredAppointments.length === 0 ? (
              <div className="p-6">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {language === "ar"
                    ? "لا توجد مواعيد مطابقة للفلتر الحالي."
                    : "No appointments match the current filter."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredAppointments.map((app) => (
                  <div
                    key={app.id}
                    className="px-4 sm:px-5 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col items-center justify-center rounded-xl bg-slate-900 dark:bg-slate-600 text-white px-3 py-2 text-center">
                        <span className="text-xs font-semibold">
                          {app.date}
                        </span>
                        <span className="text-[11px] opacity-80">
                          {app.time}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {app.clinic}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {language === "ar"
                            ? `مع ${app.doctor}`
                            : `With ${app.doctor}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${getStatusClass(
                          app.status
                        )}`}
                      >
                        {getStatusLabel(app.status)}
                      </span>
                      {app.status === "pending" && (
                        <div className="flex gap-2">
                          <button onClick={() => handleEdit(app)} className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline">
                            {language === "ar" ? "تعديل" : "Edit"}
                          </button>
                          <button onClick={() => { setAppointmentToDelete(app.id); setShowDeleteModal(true); }} disabled={deletingId === app.id} className="text-[11px] text-red-600 dark:text-red-400 hover:underline disabled:opacity-50">
                            {deletingId === app.id ? (language === "ar" ? "جاري الإلغاء..." : "Canceling...") : (language === "ar" ? "إلغاء" : "Cancel")}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {flashMessage && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${flashMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}>
            {flashMessage.message}
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowDeleteModal(false)}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                {language === "ar" ? "تأكيد الإلغاء" : "Confirm Cancellation"}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                {language === "ar" ? "هل أنت متأكد من إلغاء هذا الموعد؟" : "Are you sure you want to cancel this appointment?"}
              </p>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-sm rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">
                  {language === "ar" ? "لا" : "No"}
                </button>
                <button onClick={handleDelete} disabled={!!deletingId} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                  {deletingId ? (language === "ar" ? "جاري الإلغاء..." : "Canceling...") : (language === "ar" ? "نعم، إلغاء" : "Yes, Cancel")}
                </button>
              </div>
            </div>
          </div>
        )}

        {editingAppointment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setEditingAppointment(null)}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
                {language === "ar" ? "تعديل الموعد" : "Edit Appointment"}
              </h3>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                    {language === "ar" ? "الطبيب" : "Doctor"}
                  </label>
                  <select name="doctor_id" defaultValue={editingAppointment.doctorId} required className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                    {doctors.map(doc => (
                      <option key={doc.doctor_id} value={doc.doctor_id}>{doc.name} - {doc.specialization}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                    {language === "ar" ? "التاريخ" : "Date"}
                  </label>
                  <input type="date" name="date" defaultValue={editingAppointment.date} required min={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                    {language === "ar" ? "الوقت" : "Time"}
                  </label>
                  <input type="time" name="time" defaultValue={editingAppointment.time} required className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700 dark:text-slate-300">
                    {language === "ar" ? "ملاحظات" : "Notes"}
                  </label>
                  <textarea name="notes" defaultValue={editingAppointment.notes} rows={3} className="w-full px-3 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setEditingAppointment(null)} className="px-4 py-2 text-sm rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600">
                    {language === "ar" ? "إلغاء" : "Cancel"}
                  </button>
                  <button type="submit" className="px-4 py-2 text-sm rounded-lg bg-teal-600 text-white hover:bg-teal-700">
                    {language === "ar" ? "حفظ" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
