"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { useRouter } from "next/navigation";
import Breadcrumbs from "@/components/Breadcrumbs";

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
        t.newPatientSuccess ||
          "Patient created successfully. Credentials have been sent via SMS."
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
        t.newPatientServerError ||
          "There is an error occurred while creating the patient. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Breadcrumbs />

        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500 mb-1">
              {t.patientsManagement || "Patients management"}
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              {t.newPatient || "Add new patient"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t.newPatientSubtitle ||
                "Register the patient and send credentials to their phone via SMS."}
            </p>
          </div>

          <button
            onClick={() => router.back()}
            className="text-sm text-teal-700 hover:text-teal-800 hover:underline"
          >
            {t.back || "Back"}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr,1fr]">
            <form
              onSubmit={handleSubmit}
              className="p-6 md:p-7 space-y-4 border-b md:border-b-0 md:border-l border-slate-100"
            >
              <div>
                <label
                  className={`block text-sm font-medium text-slate-800 mb-1 ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {t.fullNameLabel || "Full name"} <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder={t.fullNamePlaceholder || "Enter full name"}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/70 focus:border-teal-500 transition"
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium text-slate-800 mb-1 ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {t.nationalIdLabel || "National ID"} <span className="text-red-500">*</span>
                </label>
                <input
                  name="nationalId"
                  value={form.nationalId}
                  onChange={handleChange}
                  required
                  placeholder={t.nationalIdPlaceholder || "e.g. 123456789"}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/70 focus:border-teal-500 transition"
                />
                <p
                  className={`mt-1 text-[11px] text-slate-500 ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {t.nationalIdHint || "Use the official national ID number of the patient."}
                </p>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium text-slate-800 mb-1 ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {t.phoneLabel || "Phone"} <span className="text-red-500">*</span>
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  pattern="05[0-9]{8}"
                  placeholder={t.phonePlaceholder || "e.g. 0599123456"}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/70 focus:border-teal-500 transition"
                />
                <p
                  className={`mt-1 text-[11px] text-slate-500 ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {t.phoneHint || "We will send login details via SMS to this number."}
                </p>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium text-slate-800 mb-1 ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {t.dateOfBirthLabel || "Date of birth"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={form.dateOfBirth}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/70 focus:border-teal-500 transition"
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium text-slate-800 mb-1 ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {t.genderLabel || "Gender"} <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/70 focus:border-teal-500 transition"
                >
                  <option value="Male">{t.male || "Male"}</option>
                  <option value="Female">{t.female || "Female"}</option>
                  <option value="Other">{t.other || "Other"}</option>
                </select>
              </div>

              <div>
                <label
                  className={`block text-sm font-medium text-slate-800 mb-1 ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {t.addressLabel || "Address"} <span className="text-red-500">*</span>
                </label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  placeholder={t.addressPlaceholder || "City, street, building"}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/70 focus:border-teal-500 transition"
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium text-slate-800 mb-1 ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {t.bloodTypeLabel || "Blood type"} ({t.optional || "Optional"})
                </label>
                <input
                  name="bloodType"
                  value={form.bloodType}
                  onChange={handleChange}
                  placeholder={t.bloodTypePlaceholder || "e.g. O+, A-, B+"}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/70 focus:border-teal-500 transition"
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium text-slate-800 mb-1 ${
                    language === "ar" ? "text-right" : "text-left"
                  }`}
                >
                  {t.allergiesLabel || "Allergies"} ({t.optional || "Optional"})
                </label>
                <textarea
                  name="allergies"
                  value={form.allergies}
                  onChange={handleChange}
                  rows={3}
                  placeholder={
                    t.allergiesPlaceholder ||
                    "Mention known allergies or reactions, if any."
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/70 focus:border-teal-500 transition"
                />
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

              <div className="pt-2 flex items-center justify-end gap-2">
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
                  className="px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  {t.clearForm || "Clear form"}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading
                    ? t.saving || "Saving..."
                    : t.saveAndSendPassword || "Save and send password"}
                </button>
              </div>
            </form>

            <div className="p-6 md:p-7 bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col justify-between">
              <div className={`space-y-3 ${language === "ar" ? "text-right" : "text-left"}`}>
                <h2 className="text-sm font-semibold text-slate-900">
                  {t.newPatientTipsTitle || "Tips for creating patients"}
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t.newPatientTipsBody ||
                    "Double-check national ID and phone number. Keep allergy and chronic conditions updated to help clinicians."}
                </p>
                <ul
                  className={`mt-2 space-y-1 text-xs text-slate-600 list-disc ${
                    language === "ar" ? "pr-4" : "pl-4"
                  }`}
                >
                  <li>
                    {t.newPatientTip1 ||
                      "Verify identity details match official documents."}
                  </li>
                  <li>
                    {t.newPatientTip2 ||
                      "Ensure phone number is reachable for notifications."}
                  </li>
                  <li>
                    {t.newPatientTip3 ||
                      "Include key medical notes like allergies or chronic conditions."}
                  </li>
                </ul>
              </div>

              <div
                className={`mt-6 text-[11px] text-slate-500 border-t border-slate-200 pt-3 ${
                  language === "ar" ? "text-right" : "text-left"
                }`}
              >
                {t.newPatientFooter ||
                  "Patient credentials will be sent via SMS after saving. Keep contact info current to avoid delivery issues."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
