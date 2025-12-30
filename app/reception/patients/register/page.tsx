"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { useRouter } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";
import ThemeToggle from "@/components/ThemeToggle";

export default function NewPatientPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    nationalId: "",
    phone: "",
    dateOfBirth: "",
    gender: "Male",
    address: "",
    bloodType: "",
    allergies: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(", ");
          setError(errorMessages as string);
        } else {
          setError(data.message || "Failed to create patient");
        }
        return;
      }

      setMessage(
        language === "ar"
          ? "تم إنشاء المريض بنجاح. تم إرسال بيانات الدخول عبر الرسائل القصيرة."
          : "Patient created successfully. Credentials have been sent via SMS."
      );
      setForm({
        name: "",
        nationalId: "",
        phone: "",
        dateOfBirth: "",
        gender: "Male",
        address: "",
        bloodType: "",
        allergies: "",
      });
    } catch (err) {
      console.error("Error:", err);
      setError(
        language === "ar"
          ? "حدث خطأ أثناء إنشاء المريض. يرجى المحاولة مرة أخرى."
          : "An error occurred while creating the patient. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-8 px-4 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
    
        
        <Breadcrumbs />

        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              {t.patientsManagement || "Patients management"}
            </p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t.newPatient || "Add new patient"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t.newPatientSubtitle ||
                "Register the patient and send credentials to their phone via SMS."}
            </p>
          </div>

      
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors duration-300">
          <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/30 dark:to-emerald-900/30 px-6 py-4 border-b border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {language === "ar" ? "بيانات المريض الجديد" : "New Patient Information"}
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                  {language === "ar"
                    ? "أدخل بيانات المريض لإنشاء حساب جديد"
                    : "Enter patient data to create a new account"}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-7">
            <div className="space-y-4">
            
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 ${language === "ar" ? "text-right" : "text-left"}`}>
                    {t.fullNameLabel || "Full name"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder={t.fullNamePlaceholder || "Enter full name"}
                    className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/70 focus:border-teal-500 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 ${language === "ar" ? "text-right" : "text-left"}`}>
                    {t.nationalIdLabel || "National ID"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="nationalId"
                    value={form.nationalId}
                    onChange={handleChange}
                    required
                    placeholder={t.nationalIdPlaceholder || "e.g. 123456789"}
                    className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/70 focus:border-teal-500 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 ${language === "ar" ? "text-right" : "text-left"}`}>
                    {t.phoneLabel || "Phone"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder={t.phonePlaceholder || "e.g. 0599123456"}
                    className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/70 focus:border-teal-500 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                  <p className={`mt-1 text-[11px] text-slate-500 dark:text-slate-400 ${language === "ar" ? "text-right" : "text-left"}`}>
                    {t.phoneHint || "We will send login details via SMS to this number."}
                  </p>
                </div>

                <div>
                  <label className={`block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 ${language === "ar" ? "text-right" : "text-left"}`}>
                    {t.addressLabel || "Address"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    placeholder={t.addressPlaceholder || "City, street, building"}
                    className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/70 focus:border-teal-500 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 ${language === "ar" ? "text-right" : "text-left"}`}>
                    {t.dateOfBirthLabel || "Date of birth"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/70 focus:border-teal-500 transition"
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 ${language === "ar" ? "text-right" : "text-left"}`}>
                    {t.genderLabel || "Gender"} <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    required
                    className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/70 focus:border-teal-500 transition"
                  >
                    <option value="Male">{t.male || "Male"}</option>
                    <option value="Female">{t.female || "Female"}</option>
                    <option value="Other">{t.other || "Other"}</option>
                  </select>
                </div>

                <div>
                  <label className={`block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 ${language === "ar" ? "text-right" : "text-left"}`}>
                    {t.bloodTypeLabel || "Blood type"} ({t.optional || "Optional"})
                  </label>
                  <input
                    name="bloodType"
                    value={form.bloodType}
                    onChange={handleChange}
                    placeholder={t.bloodTypePlaceholder || "e.g. O+, A-, B+"}
                    className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/70 focus:border-teal-500 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </div>

    
              <div>
                <label className={`block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 ${language === "ar" ? "text-right" : "text-left"}`}>
                  {t.allergiesLabel || "Allergies"} ({t.optional || "Optional"})
                </label>
                <textarea
                  name="allergies"
                  value={form.allergies}
                  onChange={handleChange}
                  rows={3}
                  placeholder={t.allergiesPlaceholder || "Mention known allergies or reactions, if any."}
                  className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/70 focus:border-teal-500 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            {message && (
              <div className="mt-4">
                <p className="text-sm text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl px-3 py-2">
                  {message}
                </p>
              </div>
            )}
            {error && (
              <div className="mt-4">
                <p className="text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2">
                  {error}
                </p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() =>
                  setForm({
                    name: "",
                    nationalId: "",
                    phone: "",
                    dateOfBirth: "",
                    gender: "Male",
                    address: "",
                    bloodType: "",
                    allergies: "",
                  })
                }
                className="px-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                {t.clearForm || "Clear form"}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-teal-600 dark:bg-teal-500 text-white text-sm font-medium rounded-xl hover:bg-teal-700 dark:hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
              >
                {loading
                  ? (language === "ar" ? "جاري الحفظ..." : "Saving...")
                  : (language === "ar" ? "حفظ وإرسال كلمة المرور" : "Save and send password")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
