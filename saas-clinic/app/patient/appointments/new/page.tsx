"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import apiClient from "@/lib/api";
import PageHeader from "@/components/common/PageHeader";

type Doctor = {
  doctor_id: number;
  user_id: number;
  name: string;
  specialization: string;
  available_days: string[];
  clinic_room: string;
};

export default function NewAppointmentPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();

  const [form, setForm] = useState({
    date: "",
    time: "",
    doctor: "",
  });
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Fetch available doctors
  useEffect(() => {
    const fetchDoctors = async () => {
      if (!isAuthenticated || !user) return;

      try {
        setLoadingDoctors(true);
        const response = await apiClient.get<{ doctors: Doctor[] }>("/patient/doctors");
        setDoctors(response.data.doctors);
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError(
          language === "ar"
            ? "فشل تحميل قائمة الأطباء. يرجى تحديث الصفحة."
            : "Failed to load doctors list. Please refresh the page."
        );
      } finally {
        setLoadingDoctors(false);
      }
    };

    fetchDoctors();
  }, [isAuthenticated, user, language]);

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

    if (!form.date || !form.time || !form.doctor) {
      setError(
        language === "ar"
          ? "يرجى تعبئة جميع الحقول المطلوبة."
          : "Please fill all required fields."
      );
      return;
    }

    try {
      setLoading(true);

      // Combine date and time to create appointment_date
      const appointmentDate = `${form.date} ${form.time}:00`;

      await apiClient.post("/patient/appointments", {
        doctor_id: parseInt(form.doctor),
        appointment_date: appointmentDate,
        notes: "Requested via web portal",
      });

      setMessage(
        language === "ar"
          ? "تم إرسال طلب الموعد، وسيتم إشعارك عند الموافقة عبر SMS."
          : "Your appointment request has been submitted. You will be notified by SMS upon approval."
      );

      setForm({ date: "", time: "", doctor: "" });

      // Redirect to appointments page after short delay
      setTimeout(() => {
        router.push("/patient/appointments");
      }, 2000);
    } catch (err: unknown) {
      console.error("Error creating appointment:", err);

      setError(
        language === "ar"
          ? "حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى."
          : "An error occurred while submitting the request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <PageHeader
          label={language === "ar" ? "حجز المواعيد" : "Appointment booking"}
          title={
            language === "ar" ? "طلب موعد جديد" : "Request new appointment"
          }
          description={
            language === "ar"
              ? "اختر التاريخ، الوقت، الطبيب والعيادة لطلب موعد جديد."
              : "Select the date, time, doctor and clinic to request a new appointment."
          }
          extraActions={<LanguageSwitcher />}
          backAction={() => router.back()}
        />

        
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <form
            onSubmit={handleSubmit}
            className="p-6 md:p-7 space-y-4 border-slate-100"
          >
            {/* التاريخ */}
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
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/70 focus:border-teal-500 transition"
              />
            </div>

            {/* الوقت */}
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
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/70 focus:border-teal-500 transition"
              />
            </div>

            {/* الطبيب */}
            <div>
              <label className="block text-sm font-medium text-slate-800 mb-1">
                {language === "ar" ? "الطبيب" : "Doctor"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                name="doctor"
                value={form.doctor}
                onChange={handleChange}
                disabled={loadingDoctors}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/70 focus:border-teal-500 transition disabled:opacity-50"
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
                    {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
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

            {/* أزرار */}
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setForm({ date: "", time: "", doctor: "" })}
                className="px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                {language === "ar" ? "مسح الحقول" : "Clear"}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
