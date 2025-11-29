// src/components/doctor/AppointmentTable.tsx

import { useState } from "react";
import type { Appointment } from "@/types/appointment";

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
  // ----------------------------
  // State for Reject Modal
  // ----------------------------
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // ----------------------------
  // State for Reschedule Modal
  // ----------------------------
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

  const appointment_time = `${hours}:${minutes}`; // 24-hour format

  onReschedule(rescheduleId, appointment_date, appointment_time);
  closeRescheduleModal();
};

 
  if (isLoading) return <div>Loading appointments...</div>;
  if (error) return <div className="text-red-600 text-sm">{error}</div>;
  if (!appointments.length)
    return <div className="text-sm text-gray-500">No appointments found.</div>;

  return (
    <>
      <table className="min-w-full text-sm text-black">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-2">Patient</th>
            <th className="text-left py-2 px-2">Date &amp; Time</th>
            <th className="text-left py-2 px-2">Status</th>
            <th className="text-left py-2 px-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appt) => (
            <tr key={appt.id} className="border-b">
              <td className="py-2 px-2">
                <div className="font-medium">{appt.patientName}</div>
                <div className="text-xs text-gray-500">
                  {appt.patientPhone ?? ""}
                </div>
              </td>
              <td className="py-2 px-2">
                {appt.dateTime ? new Date(appt.dateTime).toLocaleString() : "-"}
              </td>
              <td className="py-2 px-2 capitalize">{appt.status}</td>
              <td className="py-2 px-2">
                {appt.status === "requested" ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onApprove(appt.id)}
                      className="px-2 py-1 text-xs rounded bg-emerald-600 text-white hover:bg-emerald-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => openRejectModal(appt.id)}
                      className="px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => openRescheduleModal(appt.id)}
                      className="px-2 py-1 text-xs rounded bg-yellow-600 text-white hover:bg-yellow-700"
                    >
                      Reschedule
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-gray-500">No actions</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Reject Modal */}
      {isRejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-5">
            <h2 className="text-lg font-semibold mb-3 text-gray-900">
              سبب رفض الموعد
            </h2>
            <p className="text-xs text-gray-500 mb-3">
              اكتب السبب الذي سيتم إرساله للمريض أو حفظه في السجل.
            </p>
            <textarea
              className="w-full border rounded-md text-sm p-2 text-black min-h-[80px] mb-4"
              placeholder="اكتب سبب الرفض هنا..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={closeRejectModal}
                className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                إلغاء
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-3 py-1.5 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                disabled={!rejectReason.trim()}
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {isRescheduleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-5">
            <h2 className="text-lg font-semibold mb-3 text-gray-900">
              Reschedule Appointment
            </h2>
            <input
              type="datetime-local"
              className="w-full border rounded-md text-sm p-2 mb-4 text-black"
              value={rescheduleDateTime}
              onChange={(e) => setRescheduleDateTime(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={closeRescheduleModal}
                className="px-3 py-1.5 text-xs rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReschedule}
                className="px-3 py-1.5 text-xs rounded bg-yellow-600 text-white hover:bg-yellow-700 disabled:opacity-60"
                disabled={!rescheduleDateTime}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
