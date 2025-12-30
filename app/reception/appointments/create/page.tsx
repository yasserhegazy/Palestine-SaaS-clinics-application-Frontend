"use client";

import { useState, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { useRouter } from "next/navigation";
import AppointmentForm, {
  type AppointmentFormData,
} from "@/components/AppointmentsForm";
import PatientSearch, { LookupPatient } from "@/components/PatientSearch";
import PreviousVisits from "@/components/PreviousVisits";
import Breadcrumbs from "@/components/Breadcrumbs";
import PaymentForm from "@/components/PaymentForm";
import { PaymentFormData } from "@/types/payment";
import { toast } from "react-hot-toast";

export default function CreateAppointmentPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();

  const [selectedPatient, setSelectedPatient] = useState<LookupPatient | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentFormData | null>(null);
  const [consultationFee, setConsultationFee] = useState<number>(0);

  const handlePatientSelect = (patient: LookupPatient) => {
    setSelectedPatient(patient);
  };

  const handlePaymentDataChange = useCallback(
    (data: PaymentFormData | null) => {
      setPaymentData(data);
    },
    []
  );

  const handleFormSubmit = async (data: AppointmentFormData) => {
    if (!selectedPatient) {
      toast.error(
        language === "ar"
          ? "يرجى اختيار المريض أولاً"
          : "Please select a patient first"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const requestBody: {
        patientId: number;
        doctorId: number;
        date: string;
        time: string;
        notes: string;
        payment?: PaymentFormData;
      } = {
        patientId: selectedPatient.patientId,
        doctorId: data.doctorId,
        date: data.appointmentDate,
        time: data.appointmentTime,
        notes: data.notes,
      };

      // Add payment data if provided
      if (paymentData) {
        requestBody.payment = paymentData;
      }

      const response = await fetch("/api/clinic/appointments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (response.ok) {
        let successMessage =
          language === "ar"
            ? "تم إنشاء الموعد بنجاح"
            : "Appointment created successfully";

        // If payment was collected, show receipt number
        if (responseData.receipt_number) {
          successMessage +=
            language === "ar"
              ? ` - رقم الإيصال: ${responseData.receipt_number}`
              : ` - Receipt: ${responseData.receipt_number}`;
        }

        toast.success(successMessage);
        router.push("/reception/dashboard");
      } else {
        throw new Error(responseData.message || "Failed to create appointment");
      }
    } catch (error: unknown) {
      console.error("Error creating appointment:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : language === "ar"
          ? "حدث خطأ أثناء إنشاء الموعد"
          : "An error occurred while creating the appointment";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearForm = () => {
    setSelectedPatient(null);
    setPaymentData(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs />

        {/* Header */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              {t.patientsManagement || "Patients management"}
            </p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t.newAppointment || "New appointment"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {language === "ar"
                ? "ابحث عن المريض ثم أنشئ موعداً جديداً"
                : "Search for a patient and create a new appointment"}
            </p>
          </div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Patient Search Section */}
          <div>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                {language === "ar" ? "1. اختر المريض" : "1. Select Patient"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {language === "ar"
                  ? "ابحث عن المريض باستخدام الرقم الوطني أو الهاتف"
                  : "Search for the patient using national ID or phone"}
              </p>
            </div>

            <PatientSearch
              onPatientSelect={handlePatientSelect}
              showSelectedCard={false}
            />

            {selectedPatient && (
              <div className="mt-4 p-4 bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-teal-700 dark:text-teal-400 font-medium mb-1">
                      {language === "ar" ? "المريض المحدد" : "Selected Patient"}
                    </p>
                    <p className="text-base font-semibold text-slate-900 dark:text-white">
                      {selectedPatient.name ||
                        (language === "ar"
                          ? "مريض بدون اسم"
                          : "Unnamed patient")}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {language === "ar" ? "الرقم الوطني: " : "National ID: "}
                      {selectedPatient.nationalId ||
                        (language === "ar" ? "غير متوفر" : "N/A")}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {language === "ar" ? "الهاتف: " : "Phone: "}
                      {selectedPatient.phone ||
                        (language === "ar" ? "غير متوفر" : "N/A")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPatient(null)}
                    className="text-xs text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 hover:underline"
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
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                  {language === "ar"
                    ? "2. التاريخ الطبي"
                    : "2. Medical History"}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {language === "ar"
                    ? "زيارات المريض السابقة والتشخيصات"
                    : "Patient's previous visits and diagnoses"}
                </p>
              </div>

              <PreviousVisits
                patientId={selectedPatient.patientId}
                showSummary
                limit={4}
              />
            </div>
          )}
        </div>

        {/* Step 3: Appointment Details */}
        {selectedPatient && (
          <div className="mt-8 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Appointment Form - Takes 2/3 of space */}
              <div className="lg:col-span-2">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                    {language === "ar"
                      ? "3. تفاصيل الموعد"
                      : "3. Appointment Details"}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {language === "ar"
                      ? "اختر الطبيب والتخصص والتاريخ والوقت وأي ملاحظات إضافية"
                      : "Select doctor, specialty, date, time, and any additional notes"}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm p-6 transition-colors duration-300">
                  <AppointmentForm
                    onSubmit={handleFormSubmit}
                    onClear={handleClearForm}
                  />
                </div>
              </div>

              {/* Payment Form - Takes 1/3 of space */}
              <div>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                    {language === "ar" ? "4. الدفع" : "4. Payment"}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {language === "ar"
                      ? "تحصيل الرسوم من المريض"
                      : "Collect fee from patient"}
                  </p>
                </div>

                <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-sm p-6 transition-colors duration-300">
                  <PaymentForm
                    consultationFee={consultationFee}
                    onPaymentDataChange={handlePaymentDataChange}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
