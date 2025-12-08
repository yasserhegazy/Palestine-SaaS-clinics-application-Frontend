"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import apiClient from "@/lib/api";
import PageHeader from "@/components/common/PageHeader";
import Breadcrumbs from "@/components/Breadcrumbs";

interface Doctor {
  doctor_id: number;
  name: string;
  specialization: string;
  available_days: string;
  clinic_room: string;
}

export default function NewAppointmentPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();

  const [form, setForm] = useState({
    date: "",
    time: "",
    doctor_id: "",
  });

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch available doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch("/api/doctors");
        const data = await response.json();

        if (response.ok) {
          setDoctors(data.doctors || []);
        } else {
          setError(data.message || "Failed to load doctors");
        }
      } catch {
        setError("Failed to load doctors");
      } finally {
        setLoadingDoctors(false);
      }
    };

    if (user && user.role === "Patient") {
      fetchDoctors();
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!form.date || !form.time || !form.doctor_id) {
      setError(language === "ar" ? "يرجى تعبئة جميع الحقول المطلوبة." : "Please fill all required fields.");
      return;
    }

    try {
      setLoading(true);

      // Combine date + time ISO format
      const appointmentDateTime = new Date(`${form.date}T${form.time}`).toISOString();

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id: parseInt(form.doctor_id),
          appointment_date: appointmentDateTime,
          notes: "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(", ");
          setError(errorMessages);
        } else {
          setError(data.message || "Failed to create appointment");
        }
        return;
      }

      setMessage(
        language === "ar"
          ? "تم إرسال طلب الموعد، وسيتم إشعارك عند الموافقة عبر SMS."
          : "Your appointment request has been submitted. You will be notified by SMS upon approval."
      );

      setForm({ date: "", time: "", doctor_id: "" });

      setTimeout(() => {
        router.push("/patient/appointments");
      }, 2000);
    } catch (err: unknown) {
      console.error("Error creating appointment:", err);

      const axiosError = err as { response?: { data?: { message?: string } } };

      setError(
        axiosError.response?.data?.message ||
          (language === "ar"
            ? "حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى."
            : "An error occurred while submitting the request. Please try again.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Breadcrumbs />

        <PageHeader
          label={language === "ar" ? "طلب جديد" : "New Appointment"}
          title={language === "ar" ? "طلب موعد جديد" : "New Appointment"}
          description={
            language === "ar"
              ? "طلب موعد جديد وإعطاؤك التفاصيل اللازمة"
              : "View and manage your current and upcoming appointments."
          }
          backAction={() => router.push("/patient/dashboard")}
          wrapperClass="border-b"
        />

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 md:p-7 space-y-4 border-slate-100">

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">
                {language === "ar" ? "تاريخ الموعد" : "Appointment date"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 text-sm"
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">
                {language === "ar" ? "وقت الموعد" : "Appointment time"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 text-sm"
              />
            </div>

            {/* Doctor */}
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">
                {language === "ar" ? "الطبيب" : "Doctor"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                name="doctor_id"
                value={form.doctor_id}
                onChange={handleChange}
                disabled={loadingDoctors}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 bg-slate-50 text-sm disabled:opacity-50"
              >
                <option value="">
                  {loadingDoctors
                    ? language === "ar"
                      ? "جاري تحميل الأطباء..."
                      : "Loading doctors..."
                    : language === "ar"
                    ? "اختر الطبيب"
                    : "Select a doctor"}
                </option>

                {doctors.map((doctor) => (
                  <option key={doctor.doctor_id} value={doctor.doctor_id}>
                    {doctor.name}
                    {doctor.specialization ? ` - ${doctor.specialization}` : ""}
                  </option>
                ))}
              </select>

              {!loadingDoctors && doctors.length === 0 && (
                <p className="mt-1 text-xs text-amber-600">
                  {language === "ar" ? "لا يوجد أطباء متاحون حالياً" : "No doctors available"}
                </p>
              )}
            </div>

            {message && (
              <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                {message}
              </p>
            )}

            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            {/* Buttons */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setForm({ date: "", time: "", doctor_id: "" })}
                className="px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                {language === "ar" ? "مسح الحقول" : "Clear"}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 bg-teal-600 text-white text-sm rounded-xl hover:bg-teal-700 disabled:opacity-50"
              >
                {loading
                  ? language === "ar"
                    ? "جاري الإرسال..."
                    : "Submitting..."
                  : language === "ar"
                  ? "إرسال طلب الموعد"
                  : "Submit request"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
