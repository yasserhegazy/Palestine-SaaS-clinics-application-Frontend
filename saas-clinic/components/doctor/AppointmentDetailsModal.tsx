"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import type { Appointment } from "@/types/appointment";
import toast from "react-hot-toast";
import { format } from "date-fns";
import axios from "axios";

interface MedicalRecord {
  id: number;
  visit_date: string;
  symptoms: string;
  diagnosis: string;
  prescription: string;
  doctor_name?: string;
  created_at?: string;
}

interface PatientFromApi {
  patient_id: number;
  date_of_birth?: string;
  gender?: string;
  blood_type?: string;
  allergies?: string;
  user: {
    name: string;
    phone?: string;
    email?: string;
  };
}

interface PatientHistoryResponse {
  patient: PatientFromApi;
  medicalHistory: MedicalRecord[];
}

type PatientHistoryApiResponse =
  | PatientHistoryResponse
  | (Partial<PatientHistoryResponse> & {
      history?: MedicalRecord[];
      message?: string;
    });

interface AppointmentDetailsModalProps {
  appointment: Appointment;
  onClose: () => void;
  onCreateMedicalRecord?: (appointment: Appointment) => void;
}

function getAge(dob?: string | null): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export default function AppointmentDetailsModal({
  appointment,
  onClose,
  onCreateMedicalRecord,
}: AppointmentDetailsModalProps) {
  const { token } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === "ar";

  const [patient, setPatient] = useState<PatientFromApi | null>(null);
  const [history, setHistory] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const displayName = useMemo(() => {
    if (patient?.user?.name?.trim()) return patient.user.name;
    if (appointment.patientName?.trim()) return appointment.patientName;
    if (patient?.user?.email) return patient.user.email;
    if (appointment.patientPhone) return appointment.patientPhone;
    return isArabic ? "مريض بدون اسم" : "Unnamed patient";
  }, [patient, appointment, isArabic]);

  const displayPhone = useMemo(() => {
    return (
      patient?.user?.phone ||
      appointment.patientPhone ||
      (isArabic ? "لا يوجد رقم" : "No phone")
    );
  }, [patient, appointment, isArabic]);

  const age = useMemo(
    () => getAge(patient?.date_of_birth),
    [patient?.date_of_birth]
  );

  const formattedDate = useMemo(() => {
    if (!appointment.dateTime) return "-";
    const d = new Date(appointment.dateTime);
    if (isNaN(d.getTime())) return "-";
    try {
      return format(d, "yyyy-MM-dd");
    } catch {
      return "-";
    }
  }, [appointment.dateTime]);

  const formattedTime = useMemo(() => {
    if (!appointment.dateTime) return "-";
    const d = new Date(appointment.dateTime);
    if (isNaN(d.getTime())) return "-";
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  }, [appointment.dateTime]);

  const sortedHistory = useMemo(() => {
    if (!history) return [];
    return [...history]
      .sort((a, b) => {
        const da = new Date(a.visit_date).getTime();
        const db = new Date(b.visit_date).getTime();
        return db - da; // latest first
      })
      .slice(0, 5);
  }, [history]);

  // -------- FETCH PATIENT HISTORY -------- //
  useEffect(() => {
    if (!token || !appointment.patientId) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(
          `http://127.0.0.1:8000/api/clinic/patients/${appointment.patientId}/history`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        const json = res.data as PatientHistoryApiResponse;

        if ("patient" in json && json.patient) {
          setPatient(json.patient);
        }

        if ("medicalHistory" in json && Array.isArray(json.medicalHistory)) {
          setHistory(json.medicalHistory);
        } else if ("history" in json && Array.isArray(json.history)) {
          // fallback لو اسم الحقل مختلف في الباك
          setHistory(json.history);
        }
      } catch (err: unknown) {
        const msg =
          axios.isAxiosError(err) && err.response?.data?.message
            ? err.response.data.message
            : err instanceof Error
            ? err.message
            : isArabic
            ? "حدث خطأ أثناء جلب السجل الطبي"
            : "Something went wrong while fetching medical history";

        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [appointment.patientId, token, isArabic]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 end-3 text-lg text-slate-400 hover:text-slate-600"
          aria-label={isArabic ? "إغلاق" : "Close"}
        >
          ×
        </button>

        {/* Header: title + name */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-700">
          <p className="text-[11px] uppercase tracking-wide text-teal-600 font-semibold">
            {isArabic ? "تفاصيل الموعد" : "Appointment Details"}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">
            {displayName}
          </h2>
          {appointment.clinicName && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {isArabic ? "العيادة: " : "Clinic: "} {appointment.clinicName}
            </p>
          )}
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Error state */}
          {error && (
            <div className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
              {error}
            </div>
          )}

          {/* Row: Appointment Info + Patient Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Appointment Info */}
            <div className="space-y-2">
              <h3 className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                {isArabic ? "معلومات الموعد" : "Appointment Info"}
              </h3>
              <div className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 px-3 py-2 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <p>
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {isArabic ? "التاريخ: " : "Date: "}
                  </span>
                  {formattedDate}
                </p>
                <p>
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {isArabic ? "الوقت: " : "Time: "}
                  </span>
                  {formattedTime}
                </p>
                <p>
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {isArabic ? "الحالة: " : "Status: "}
                  </span>
                  <span className="inline-flex items-center ms-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-600 dark:text-white text-[11px]">
                    {appointment.status}
                  </span>
                </p>
                {appointment.notes && (
                  <p>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {isArabic ? "ملاحظات: " : "Notes: "}
                    </span>
                    {appointment.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Patient Info */}
            <div className="space-y-2">
              <h3 className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                {isArabic ? "بيانات المريض" : "Patient Information"}
              </h3>
              <div className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50 px-3 py-2 text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <p>
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {isArabic ? "الاسم: " : "Name: "}
                  </span>
                  {displayName}
                </p>
                <p>
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {isArabic ? "رقم الهاتف: " : "Phone: "}
                  </span>
                  {displayPhone}
                </p>
                {age !== null && (
                  <p>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {isArabic ? "العمر: " : "Age: "}
                    </span>
                    {age} {isArabic ? "سنة" : "years"}
                  </p>
                )}
                {patient?.gender && (
                  <p>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {isArabic ? "الجنس: " : "Gender: "}
                    </span>
                    {patient.gender}
                  </p>
                )}
                {patient?.blood_type && (
                  <p>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {isArabic ? "فصيلة الدم: " : "Blood Type: "}
                    </span>
                    {patient.blood_type}
                  </p>
                )}
                {patient?.allergies && (
                  <p>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {isArabic ? "الحساسية: " : "Allergies: "}
                    </span>
                    {patient.allergies}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Medical History */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                {isArabic
                  ? "السجل الطبي السابق (آخر 5 زيارات)"
                  : "Previous Medical History (last 5 visits)"}
              </h3>
              {sortedHistory.length > 0 && (
                <button
                  type="button"
                  className="text-[11px] font-semibold text-teal-700 hover:text-teal-800"
                >
                  {isArabic ? "عرض السجل الكامل" : "View full history"}
                </button>
              )}
            </div>

            {loading ? (
              <p className="text-[11px] text-slate-500">
                {isArabic ? "جاري تحميل السجل الطبي..." : "Loading history..."}
              </p>
            ) : sortedHistory.length === 0 ? (
              <p className="text-[11px] text-slate-500">
                {isArabic
                  ? "لا يوجد زيارات سابقة مسجلة."
                  : "No previous visits recorded."}
              </p>
            ) : (
              <div className="space-y-3">
                {sortedHistory.map((record) => (
                  <div
                    key={record.id}
                    className="rounded-xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-semibold text-slate-800 dark:text-white">
                        {record.visit_date}
                      </p>
                      {record.doctor_name && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {isArabic ? "د." : "Dr."} {record.doctor_name}
                        </p>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      <span className="font-semibold">
                        {isArabic ? "التشخيص: " : "Diagnosis: "}
                      </span>
                      {record.diagnosis}
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                      <span className="font-semibold">
                        {isArabic ? "الوصفة: " : "Prescription: "}
                      </span>
                      {record.prescription}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            {isArabic ? "إغلاق" : "Close"}
          </button>

          <button
            type="button"
            onClick={() =>
              onCreateMedicalRecord && onCreateMedicalRecord(appointment)
            }
            className="px-4 py-1.5 rounded-lg bg-teal-600 text-xs font-semibold text-white hover:bg-teal-700 shadow-sm hover:shadow"
          >
            {isArabic ? "إنشاء سجل طبي" : "Create Medical Record"}
          </button>
        </div>
      </div>
    </div>
  );
}
