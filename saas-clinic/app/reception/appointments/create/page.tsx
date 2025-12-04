"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { useRouter } from "next/navigation";
import AppointmentForm, { type AppointmentFormData } from "@/components/AppointmentsForm";
import PatientSearch, { LookupPatient } from "@/components/PatientSearch";
import PreviousVisits from "@/components/PreviousVisits";
import Breadcrumbs from "@/components/Breadcrumbs";
import { toast } from "react-hot-toast";

export default function CreateAppointmentPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();

  const [selectedPatient, setSelectedPatient] = useState<LookupPatient | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePatientSelect = (patient: LookupPatient) => {
    setSelectedPatient(patient);
  };

  const handleFormSubmit = async (data: AppointmentFormData) => {
    if (!selectedPatient) {
      toast.error(language === "ar" ? "يرجى اختيار المريض أولاً" : "Please select a patient first");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/clinic/appointments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          patientId: selectedPatient.patientId,
          doctorId: data.doctorId,
          date: data.appointmentDate,
          time: data.appointmentTime,
          notes: data.notes,
        }),
      });

      if (response.ok) {
        toast.success(
          language === "ar"
            ? "تم إنشاء الموعد بنجاح"
            : "Appointment created successfully"
        );
        router.push("/reception/dashboard");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create appointment");
      }
    } catch (error: any) {
      console.error("Error creating appointment:", error);
      toast.error(
        error.message ||
          (language === "ar"
            ? "حدث خطأ أثناء إنشاء الموعد"
            : "An error occurred while creating the appointment")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearForm = () => {
    setSelectedPatient(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs />

        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500 mb-1">
              {t.patientsManagement || "Patients management"}
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              {t.newAppointment || "New appointment"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {language === "ar"
                ? "ابحث عن المريض ثم أنشئ موعداً جديداً"
                : "Search for a patient and create a new appointment"}
            </p>
          </div>

          <button
            onClick={() => router.back()}
            className="text-sm text-teal-700 hover:text-teal-800 hover:underline"
          >
            {t.back || "Back"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Search Section */}
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">
                {language === "ar" ? "1. اختر المريض" : "1. Select Patient"}
              </h2>
              <p className="text-sm text-slate-500">
                {language === "ar"
                  ? "ابحث عن المريض باستخدام الرقم الوطني أو الهاتف"
                  : "Search for the patient using national ID or phone"}
              </p>
            </div>

            <PatientSearch onPatientSelect={handlePatientSelect} showSelectedCard={false} />

            {selectedPatient && (
              <div className="mt-4 p-4 bg-teal-50 border border-teal-200 rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-teal-700 font-medium mb-1">
                      {language === "ar" ? "المريض المحدد" : "Selected Patient"}
                    </p>
                    <p className="text-base font-semibold text-slate-900">
                      {selectedPatient.name || (language === "ar" ? "مريض بدون اسم" : "Unnamed patient")}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {language === "ar" ? "الرقم الوطني: " : "National ID: "}
                      {selectedPatient.nationalId || (language === "ar" ? "غير متوفر" : "N/A")}
                    </p>
                    <p className="text-xs text-slate-600">
                      {language === "ar" ? "الهاتف: " : "Phone: "}
                      {selectedPatient.phone || (language === "ar" ? "غير متوفر" : "N/A")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPatient(null)}
                    className="text-xs text-teal-700 hover:text-teal-800 hover:underline"
                  >
                    {language === "ar" ? "تغيير" : "Change"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Previous Visits Section */}
          {selectedPatient && (
            <div>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900 mb-1">
                  {language === "ar" ? "2. التاريخ الطبي" : "2. Medical History"}
                </h2>
                <p className="text-sm text-slate-500">
                  {language === "ar"
                    ? "زيارات المريض السابقة والتشخيصات"
                    : "Patient's previous visits and diagnoses"}
                </p>
              </div>

              <PreviousVisits patientId={selectedPatient.patientId} showSummary />
            </div>
          )}
        </div>

        {/* Step 3: Appointment Details */}
        {selectedPatient && (
          <div className="mt-8 max-w-4xl mx-auto">
            <div className="mb-4 text-center">
              <h2 className="text-lg font-semibold text-slate-900 mb-1">
                {language === "ar" ? "3. تفاصيل الموعد" : "3. Appointment Details"}
              </h2>
              <p className="text-sm text-slate-500">
                {language === "ar"
                  ? "اختر الطبيب والتخصص والتاريخ والوقت وأي ملاحظات إضافية"
                  : "Select doctor, specialty, date, time, and any additional notes"}
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <AppointmentForm onSubmit={handleFormSubmit} onClear={handleClearForm} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
