"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { useRouter } from "next/navigation";
import PatientSearch, { LookupPatient } from "@/components/PatientSearch";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function UpdatePatientPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();

  const [selectedPatient, setSelectedPatient] = useState<LookupPatient | null>(
    null
  );
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleSearchStart = () => {
    // Clear patient data when starting a new search
    setSelectedPatient(null);
    setEditMode(false);
    setMessage(null);
    setError(null);
  };

  const handlePatientSelect = (patient: LookupPatient) => {
    setLoading(true);
    // Extract the actual patient_id from raw data
    const actualPatientId =
      patient.raw?.patient_id || patient.patientId || patient.raw?.id;

    // Create a new patient object with the correct ID
    const patientWithId = {
      ...patient,
      patientId: String(actualPatientId),
    };

    setSelectedPatient(patientWithId);
    setEditMode(true);
    setMessage(null);
    setError(null);

    // Fetch latest patient details to populate the form
    const fetchPatientDetails = async () => {
      try {
        const res = await fetch(`/api/patients/${actualPatientId}`);
        const data = await res.json();

        const patientData = (data as any)?.patient ?? data;
        const userData = patientData?.user ?? patient.raw?.user ?? patient.raw;

        const rawDateOfBirth =
          patientData?.date_of_birth ||
          patientData?.dateOfBirth ||
          userData?.date_of_birth ||
          userData?.dateOfBirth ||
          "";

        const dateOfBirth = rawDateOfBirth
          ? String(rawDateOfBirth).split("T")[0]
          : "";

        const address =
          patientData?.address ||
          userData?.address ||
          patient.raw?.address ||
          patient.raw?.user?.address ||
          "";

        setForm({
          name: patientData?.name || userData?.name || patient.name || "",
          nationalId:
            patientData?.national_id ||
            patientData?.nationalId ||
            patient.nationalId ||
            "",
          phone: patientData?.phone || userData?.phone || patient.phone || "",
          dateOfBirth,
          gender: patientData?.gender || userData?.gender || "Male",
          address,
          bloodType:
            patientData?.blood_type ||
            patientData?.bloodType ||
            patient.raw?.blood_type ||
            patient.raw?.bloodType ||
            "",
          allergies: patientData?.allergies || patient.raw?.allergies || "",
        });
      } catch (err) {
        console.error("Failed to fetch patient details", err);
        setError(
          language === "ar"
            ? "O-O_O® OrOúOœ OœO®U+OO­ OU,U.OñUSO."
            : "Failed to fetch patient details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    if (
      !selectedPatient.patientId ||
      selectedPatient.patientId === "undefined"
    ) {
      setError(
        language === "ar"
          ? "خطأ: معرف المريض غير صحيح. يرجى اختيار المريض مرة أخرى."
          : "Error: Invalid patient ID. Please select the patient again."
      );
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Validate required fields
      if (!form.nationalId || form.nationalId.trim() === "") {
        setError(
          language === "ar"
            ? "رقم الهوية الوطنية مطلوب"
            : "National ID is required"
        );
        return;
      }

      if (!form.dateOfBirth || form.dateOfBirth.trim() === "") {
        setError(
          language === "ar"
            ? "تاريخ الميلاد مطلوب"
            : "Date of birth is required"
        );
        return;
      }

      const backendData = {
        patient_id: selectedPatient.patientId,
        patientId: selectedPatient.patientId,
        name: form.name,
        nationalId: form.nationalId,
        phone: form.phone,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
        address: form.address,
        bloodType: form.bloodType || "",
        allergies: form.allergies || "",
      };

      const res = await fetch(`/api/patients/${selectedPatient.patientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backendData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const errorMessages = Object.values(data.errors).flat().join(", ");
          setError(errorMessages as string);
        } else {
          setError(data.message || "Failed to update patient");
        }
        return;
      }

      setMessage(
        language === "ar"
          ? "تم تحديث بيانات المريض بنجاح"
          : "Patient data updated successfully"
      );

      setSelectedPatient({
        ...selectedPatient,
        name: form.name,
        nationalId: form.nationalId,
        phone: form.phone,
        raw: {
          ...selectedPatient.raw,
          ...backendData,
        },
      });
    } catch (err) {
      console.error("Error:", err);
      setError(
        language === "ar"
          ? "حدث خطأ أثناء تحديث بيانات المريض. يرجى المحاولة مرة أخرى."
          : "An error occurred while updating patient data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    setSelectedPatient(null);
    setMessage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <Breadcrumbs />

        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              {t.patientsManagement || "Patients management"}
            </p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t.searchPatient || "Search for a patient"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t.searchPatientSubtitle ||
                "Find and review patient records quickly and securely."}
            </p>
          </div>

          <button
            onClick={() => router.back()}
            className="text-sm text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 hover:underline"
          >
            {t.back || "Back"}
          </button>
        </div>

        <PatientSearch
          showSelectedCard={false}
          onPatientSelect={handlePatientSelect}
          onSearchStart={handleSearchStart}
        />

        {editMode && selectedPatient && (
          <div className="mt-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors duration-300">
            <div className="bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/30 dark:to-emerald-900/30 px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {language === "ar"
                      ? "بيانات المريض"
                      : "Patient Information"}
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    {language === "ar"
                      ? "يمكنك تعديل البيانات وحفظ التغييرات"
                      : "You can edit the data and save changes"}
                  </p>
                </div>
                <button
                  onClick={handleCancel}
                  className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:underline"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-7">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                    >
                      {t.fullNameLabel || "Full name"}{" "}
                      <span className="text-red-500">*</span>
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
                    <label
                      className={`block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                    >
                      {t.nationalIdLabel || "National ID"}{" "}
                      <span className="text-red-500">*</span>
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
                    <label
                      className={`block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                    >
                      {t.phoneLabel || "Phone"}{" "}
                      <span className="text-red-500">*</span>
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
                  </div>

                  <div>
                    <label
                      className={`block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                    >
                      {t.addressLabel || "Address"}{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      required
                      placeholder={
                        t.addressPlaceholder || "City, street, building"
                      }
                      className="w-full border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500/70 focus:border-teal-500 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      className={`block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                    >
                      {t.dateOfBirthLabel || "Date of birth"}{" "}
                      <span className="text-red-500">*</span>
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
                    <label
                      className={`block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                    >
                      {t.genderLabel || "Gender"}{" "}
                      <span className="text-red-500">*</span>
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
                    <label
                      className={`block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 ${
                        language === "ar" ? "text-right" : "text-left"
                      }`}
                    >
                      {t.bloodTypeLabel || "Blood type"} (
                      {t.optional || "Optional"})
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

                {/* Row 4: Allergies */}
                <div>
                  <label
                    className={`block text-sm font-medium text-slate-800 dark:text-slate-200 mb-1 ${
                      language === "ar" ? "text-right" : "text-left"
                    }`}
                  >
                    {t.allergiesLabel || "Allergies"} (
                    {t.optional || "Optional"})
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
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  {language === "ar" ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-teal-600 dark:bg-teal-500 text-white text-sm font-medium rounded-xl hover:bg-teal-700 dark:hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition"
                >
                  {loading
                    ? language === "ar"
                      ? "جاري الحفظ..."
                      : "Saving..."
                    : language === "ar"
                    ? "حفظ التغييرات"
                    : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
