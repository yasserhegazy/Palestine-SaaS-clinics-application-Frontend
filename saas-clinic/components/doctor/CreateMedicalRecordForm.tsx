"use client";

import { useState, FormEvent, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import type { Appointment } from "@/types/appointment";
import toast from "react-hot-toast";
import { format } from "date-fns";

interface CreateMedicalRecordFormProps {
  appointment: Appointment;
  onClose: () => void;
  onSuccess: () => void;
}

interface FieldErrors {
  symptoms?: string;
  diagnosis?: string;
  prescription?: string;
  next_visit?: string;
}

const MIN_LEN = 10;

export default function CreateMedicalRecordForm({
  appointment,
  onClose,
  onSuccess,
}: CreateMedicalRecordFormProps) {
  const { token } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === "ar";

  const [symptoms, setSymptoms] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [prescription, setPrescription] = useState("");
  const [nextVisit, setNextVisit] = useState("");
  const [createNextAppointment, setCreateNextAppointment] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const todayLabel = format(new Date(), "yyyy-MM-dd");
  const patientName = useMemo(
    () =>
      appointment.patientName ||
      (isArabic ? "مريض بدون اسم" : "Unnamed patient"),
    [appointment.patientName, isArabic]
  );

  // ============= Validation ============= //
  const validate = (): boolean => {
    const newErrors: FieldErrors = {};

    const checkField = (
      value: string,
      key: keyof FieldErrors,
      requiredMsg: string,
      minMsg: string
    ) => {
      if (!value.trim()) {
        newErrors[key] = requiredMsg;
      } else if (value.trim().length < MIN_LEN) {
        newErrors[key] = minMsg;
      }
    };

    checkField(
      symptoms,
      "symptoms",
      isArabic ? "حقل الأعراض مطلوب" : "Symptoms are required",
      isArabic
        ? `الأعراض يجب أن تكون على الأقل ${MIN_LEN} أحرف`
        : `Symptoms must be at least ${MIN_LEN} characters`
    );

    checkField(
      diagnosis,
      "diagnosis",
      isArabic ? "حقل التشخيص مطلوب" : "Diagnosis is required",
      isArabic
        ? `التشخيص يجب أن يكون على الأقل ${MIN_LEN} أحرف`
        : `Diagnosis must be at least ${MIN_LEN} characters`
    );

    checkField(
      prescription,
      "prescription",
      isArabic ? "حقل الوصفة الطبية مطلوب" : "Prescription is required",
      isArabic
        ? `الوصفة يجب أن تكون على الأقل ${MIN_LEN} أحرف`
        : `Prescription must be at least ${MIN_LEN} characters`
    );

    if (nextVisit) {
      const selected = new Date(nextVisit);
      const today = new Date();
      selected.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);

      if (isNaN(selected.getTime())) {
        newErrors.next_visit = isArabic ? "تاريخ غير صالح" : "Invalid date";
      } else if (selected <= today) {
        newErrors.next_visit = isArabic
          ? "يجب أن يكون موعد الزيارة القادمة في المستقبل"
          : "Next visit date must be in the future";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ============= Submit ============= //
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error(isArabic ? "مستخدم غير مصرح" : "Unauthorized user");
      return;
    }

    if (!validate()) return;

    try {
      setSubmitting(true);

      const payload = {
        symptoms: symptoms.trim(),
        diagnosis: diagnosis.trim(),
        prescription: prescription.trim(),
        next_visit: nextVisit || null,
        create_next_appointment: createNextAppointment,
      };

      const res = await fetch(
        `/api/doctor/appointments/complete/${appointment.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        const msg =
          json?.message ||
          (isArabic
            ? "فشل في إنشاء السجل الطبي"
            : "Failed to create medical record");
        throw new Error(msg);
      }

      // Show success message
      let successMsg = isArabic
        ? "تم إنشاء السجل الطبي بنجاح"
        : "Medical record created successfully";

      // If next appointment was created, add that info
      if (json.next_appointment) {
        const nextApptDate = json.next_appointment.appointment_date;
        const nextApptTime = json.next_appointment.appointment_time;
        successMsg += isArabic
          ? `\nتم جدولة موعد المتابعة: ${nextApptDate} في ${nextApptTime}`
          : `\nFollow-up scheduled: ${nextApptDate} at ${nextApptTime}`;
      }

      toast.success(successMsg);

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : isArabic
          ? "حدث خطأ غير متوقع"
          : "Unexpected error";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // helper لستايل عدّاد الأحرف
  const charColor = (value: string) =>
    value.trim().length < MIN_LEN ? "text-amber-600" : "text-emerald-600";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1.5 bg-gradient-to-l from-teal-500 via-emerald-500 to-sky-500" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 end-3 text-lg text-slate-400 hover:text-slate-600"
          aria-label={isArabic ? "إغلاق" : "Close"}
        >
          ×
        </button>

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex flex-col gap-1">
            <p className="text-[11px] uppercase tracking-[0.15em] text-teal-600 font-semibold">
              {isArabic ? "إنشاء سجل طبي" : "Create Medical Record"}
            </p>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {patientName}
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {isArabic ? "تاريخ الزيارة: " : "Visit date: "}
                  <span className="font-medium text-slate-700">
                    {todayLabel}
                  </span>
                </p>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-1 text-[11px]">
                <span className="inline-flex items-center rounded-full bg-teal-50 text-teal-700 px-2 py-0.5 font-semibold border border-teal-100">
                  {isArabic ? "موعد #" : "Appointment #"} {appointment.id}
                </span>
                {appointment.dateTime && (
                  <span className="text-slate-500">
                    {isArabic ? "وقت الموعد: " : "Appointment time: "}
                    <span className="font-medium text-slate-700">
                      {format(new Date(appointment.dateTime), "HH:mm")}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Symptoms & Diagnosis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Symptoms */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 px-3.5 py-3">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    {isArabic ? "الأعراض *" : "Symptoms *"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {isArabic
                      ? "صف شكوى المريض والأعراض الرئيسية بالتفصيل."
                      : "Describe the patient's main complaints and symptoms."}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-medium ${charColor(symptoms)}`}
                >
                  {symptoms.trim().length}/{MIN_LEN}
                </span>
              </div>

              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-teal-500 resize-none"
                placeholder={
                  isArabic
                    ? "مثال: ألم في الصدر منذ ٣ أيام مع ضيق في التنفس عند المجهود..."
                    : "Example: Chest pain for 3 days with shortness of breath on exertion..."
                }
              />
              {errors.symptoms && (
                <p className="mt-1 text-[11px] text-rose-600">
                  {errors.symptoms}
                </p>
              )}
            </div>

            {/* Diagnosis */}
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 px-3.5 py-3">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    {isArabic ? "التشخيص *" : "Diagnosis *"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {isArabic
                      ? "اكتب التقييم الطبي والتشخيص النهائي أو المبدئي."
                      : "Write your medical assessment and final or provisional diagnosis."}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-medium ${charColor(diagnosis)}`}
                >
                  {diagnosis.trim().length}/{MIN_LEN}
                </span>
              </div>

              <textarea
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                rows={4}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-teal-500 resize-none"
                placeholder={
                  isArabic
                    ? "مثال: متلازمة الشريان التاجي الحادة - يلزم تقييم عاجل..."
                    : "Example: Acute coronary syndrome – requires urgent evaluation..."
                }
              />
              {errors.diagnosis && (
                <p className="mt-1 text-[11px] text-rose-600">
                  {errors.diagnosis}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3.5 py-3">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  {isArabic ? "الوصفة الطبية *" : "Prescription *"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {isArabic
                    ? "الأدوية، الجرعات، فترة العلاج وأي تعليمات إضافية."
                    : "Medications, dosages, duration, and any extra instructions."}
                </p>
              </div>
              <span
                className={`text-[10px] font-medium ${charColor(prescription)}`}
              >
                {prescription.trim().length}/{MIN_LEN}
              </span>
            </div>

            <textarea
              value={prescription}
              onChange={(e) => setPrescription(e.target.value)}
              rows={5}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-teal-500 resize-none"
              placeholder={
                isArabic
                  ? "مثال: Aspirin 81mg مرة يومياً بعد الأكل لمدة شهر...\n+ تعليمات: الراحة، تجنب المجهود، المتابعة بعد أسبوع."
                  : "Example: Aspirin 81mg once daily after meals for 1 month...\n+ Instructions: rest, avoid exertion, follow-up in 1 week."
              }
            />
            {errors.prescription && (
              <p className="mt-1 text-[11px] text-rose-600">
                {errors.prescription}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3.5 py-3">
              <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                {isArabic
                  ? "موعد الزيارة القادمة (اختياري)"
                  : "Next visit date (optional)"}
              </label>
              <input
                type="date"
                value={nextVisit}
                onChange={(e) => setNextVisit(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/25 focus:border-teal-500"
              />
              {errors.next_visit && (
                <p className="mt-1 text-[11px] text-rose-600">
                  {errors.next_visit}
                </p>
              )}
              <p className="mt-1 text-[11px] text-slate-500">
                {isArabic
                  ? "اتركه فارغاً إذا لم يتم تحديد موعد متابعة."
                  : "Leave empty if no follow-up date is scheduled."}
              </p>
            </div>

            <div className="hidden sm:flex flex-col text-[11px] text-slate-500">
              <p className="font-semibold text-slate-700 mb-1">
                {isArabic ? "ملاحظات:" : "Notes:"}
              </p>
              <p>
                {isArabic
                  ? "بعد حفظ السجل الطبي، سيتم ربطه بالموعد الحالي ويمكن للطبيب مراجعة السجل لاحقاً من صفحة المريض."
                  : "After saving, this medical record will be linked to the current appointment and can be reviewed later from the patient profile."}
              </p>
            </div>
          </div>

          {/* Auto-schedule next appointment checkbox */}
          <div className="rounded-2xl border border-teal-100 bg-teal-50/30 px-3.5 py-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={createNextAppointment}
                onChange={(e) => setCreateNextAppointment(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-teal-300 text-teal-600 focus:ring-2 focus:ring-teal-500/25"
              />
              <div className="flex-1">
                <p className="text-xs font-semibold text-teal-900">
                  {isArabic
                    ? "جدولة موعد المتابعة تلقائياً"
                    : "Auto-schedule follow-up appointment"}
                </p>
                <p className="text-[11px] text-teal-700 mt-0.5">
                  {isArabic
                    ? "سيتم إنشاء موعد جديد تلقائياً في أول وقت متاح في جدولك. سيظهر الموعد للمريض في صفحته."
                    : "A new appointment will be automatically created at the first available slot in your schedule. The patient will see it on their page."}
                </p>
              </div>
            </label>
          </div>
        </form>

        {/* Footer Buttons */}
        <div className="px-6 pb-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 bg-slate-50/80">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-white disabled:opacity-60"
          >
            {isArabic ? "إلغاء" : "Cancel"}
          </button>
          <button
            type="submit"
            formAction=""
            onClick={(e) => {
              const form = (e.currentTarget.closest("form") ??
                document.querySelector("form")) as HTMLFormElement | null;
              if (form) form.requestSubmit();
            }}
            disabled={submitting}
            className="px-4 py-1.5 rounded-lg bg-teal-600 text-xs font-semibold text-white hover:bg-teal-700 shadow-sm hover:shadow disabled:opacity-60"
          >
            {submitting
              ? isArabic
                ? "جاري الحفظ..."
                : "Saving..."
              : isArabic
              ? "حفظ السجل الطبي"
              : "Save Medical Record"}
          </button>
        </div>
      </div>
    </div>
  );
}
