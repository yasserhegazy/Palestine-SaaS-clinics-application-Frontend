// src/components/doctor/AppointmentTable.tsx

import { useState } from "react";
import type { Appointment } from "@/types/appointment";
import { useLanguage } from "@/context/LanguageContext";

interface AppointmentTableProps {
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
  onApprove: (id: number) => void;
  onReject: (id: number, reason: string) => void;
  onReschedule: (
    id: number,
    appointment_date: string,
    appointment_time: string
  ) => void;
}

export function AppointmentTable({
  appointments,
  isLoading,
  error,
  onApprove,
  onReject,
  onReschedule,
}: AppointmentTableProps) {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [rescheduleDateTime, setRescheduleDateTime] = useState("");
  const [rescheduleId, setRescheduleId] = useState<number | null>(null);

  const openRejectModal = (id: number) => {
    setSelectedId(id);
    setRejectReason("");
    setIsRejectOpen(true);
  };

  const closeRejectModal = () => {
    setSelectedId(null);
    setRejectReason("");
    setIsRejectOpen(false);
  };

  const handleConfirmReject = () => {
    if (!selectedId) return;
    onReject(selectedId, rejectReason.trim());
    closeRejectModal();
  };

  const openRescheduleModal = (id: number) => {
    setRescheduleId(id);
    setRescheduleDateTime("");
    setIsRescheduleOpen(true);
  };

  const closeRescheduleModal = () => {
    setRescheduleId(null);
    setRescheduleDateTime("");
    setIsRescheduleOpen(false);
  };

  const handleConfirmReschedule = () => {
    if (!rescheduleId || !rescheduleDateTime) return;

    const dt = new Date(rescheduleDateTime);

    const appointment_date = dt.toISOString().split("T")[0];

    const hours = dt.getHours().toString().padStart(2, "0");
    const minutes = dt.getMinutes().toString().padStart(2, "0");

    const appointment_time = `${hours}:${minutes}`;

    onReschedule(rescheduleId, appointment_date, appointment_time);
    closeRescheduleModal();
  };

  if (isLoading)
    return (
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {isArabic ? "جاري تحميل المواعيد..." : "Loading appointments..."}
      </div>
    );

  if (error) return <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>;

  if (!appointments.length)
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {isArabic ? "لا توجد مواعيد." : "No appointments found."}
      </div>
    );

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-700">
            <tr className="border-b dark:border-slate-600">
              <th className="py-2.5 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300 text-center">
                {isArabic ? "المريض" : "Patient"}
              </th>
              <th className="py-2.5 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300 text-center">
                {isArabic ? "التاريخ والوقت" : "Date & Time"}
              </th>
              <th className="py-2.5 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300 text-center">
                {isArabic ? "الحالة" : "Status"}
              </th>
              <th className="py-2.5 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300 text-center">
                {isArabic ? "الإجراءات" : "Actions"}
              </th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt, idx) => (
              <tr
                key={appt.id ?? `${appt.patientName}-${appt.dateTime}-${idx}`}
                className="border-b last:border-0 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <td className="py-3 px-3 align-middle text-center">
                  <div className="font-medium text-slate-900 dark:text-white">{appt.patientName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {appt.patientPhone ?? ""}
                  </div>
                </td>
                <td className="py-3 px-3 align-middle text-center text-slate-700 dark:text-slate-300">
                  {appt.dateTime
                    ? new Date(appt.dateTime).toLocaleString(
                      
                      )
                    : "-"}
                </td>
                <td className="py-3 px-3 align-middle text-center capitalize text-slate-700 dark:text-slate-300">
                  {appt.status}
                </td>
                <td className="py-3 px-3 align-middle">
                  {appt.status === "requested" ? (
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button
                        onClick={() => onApprove(appt.id)}
                        className="px-4 py-1.5 text-xs font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      >
                        {isArabic ? "موافقة" : "Approve"}
                      </button>
                      <button
                        onClick={() => openRejectModal(appt.id)}
                        className="px-4 py-1.5 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-red-500/20"
                      >
                        {isArabic ? "رفض" : "Reject"}
                      </button>
                      <button
                        onClick={() => openRescheduleModal(appt.id)}
                        className="px-4 py-1.5 text-xs font-medium rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-colors shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                      >
                        {isArabic ? "إعادة جدولة" : "Reschedule"}
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {isArabic
                          ? "لا توجد إجراءات على هذه الحالة."
                          : "No actions for this status."}
                      </span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Reject Modal */}
      {isRejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg w-full max-w-md p-5 transition-colors">
            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              {isArabic ? "سبب رفض الموعد" : "Appointment rejection reason"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              {isArabic
                ? "اكتب السبب الذي سيتم إرساله للمريض أو حفظه في السجل."
                : "Write the reason that will be sent to the patient or saved in the record."}
            </p>
            <textarea
              className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 rounded-lg text-sm p-3 text-slate-700 dark:text-slate-200 min-h-[100px] mb-4 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all duration-200 resize-none"
              placeholder={
                isArabic
                  ? "اكتب سبب الرفض هنا..."
                  : "Write the rejection reason here..."
              }
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={closeRejectModal}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500/20"
              >
                {isArabic ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-red-500/20"
                disabled={!rejectReason.trim()}
              >
                {isArabic ? "تأكيد الرفض" : "Confirm rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {isRescheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg w-full max-w-md p-5 transition-colors">
            <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              {isArabic ? "إعادة جدولة الموعد" : "Reschedule appointment"}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {isArabic
                ? "اختر تاريخ ووقت جديدين لهذا الموعد."
                : "Choose a new date and time for this appointment."}
            </p>
            <input
              type="datetime-local"
              className="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-700 rounded-lg text-sm p-3 mb-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/20 focus:border-yellow-500 transition-all duration-200"
              value={rescheduleDateTime}
              onChange={(e) => setRescheduleDateTime(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={closeRescheduleModal}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500/20"
              >
                {isArabic ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={handleConfirmReschedule}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-yellow-600 text-white hover:bg-yellow-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-yellow-500/20"
                disabled={!rescheduleDateTime}
              >
                {isArabic ? "تأكيد" : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
