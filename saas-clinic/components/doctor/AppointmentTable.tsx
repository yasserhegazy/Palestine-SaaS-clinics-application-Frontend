// src/components/doctor/AppointmentTable.tsx
import { Appointment } from "@/types/appointment";

interface AppointmentTableProps {
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
  onApprove?: (id: number) => void;
}

export function AppointmentTable({
  appointments,
  isLoading,
  error,
  onApprove,
}: AppointmentTableProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (appointments.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No appointment requests found for the selected filters.
      </p>
    );
  }

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString();
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const statusLabel = (status: string) => {
    switch (status) {
      case "requested":
        return "Requested";
      case "approved":
        return "Approved";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return status;
    }
  };

  const statusClass = (status: string) => {
    switch (status) {
      case "requested":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-emerald-100 text-emerald-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="px-3 py-2 text-left font-medium text-gray-600">
              Patient
            </th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">
              Clinic
            </th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">
              Date
            </th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">
              Time
            </th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">
              Status
            </th>
            <th className="px-3 py-2 text-left font-medium text-gray-600">
              Notes
            </th>
            <th className="px-3 py-2 text-right font-medium text-gray-600">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {appointments.map((appt) => (
            <tr key={appt.id} className="hover:bg-gray-50">
              <td className="px-3 py-2">
                <div className="font-medium text-gray-900">
                  {appt.patientName}
                </div>
                {appt.patientPhone && (
                  <div className="text-xs text-gray-500">
                    {appt.patientPhone}
                  </div>
                )}
              </td>
              <td className="px-3 py-2 text-gray-700">
                {appt.clinicName || "-"}
              </td>
              <td className="px-3 py-2 text-gray-700">
                {formatDate(appt.dateTime)}
              </td>
              <td className="px-3 py-2 text-gray-700">
                {formatTime(appt.dateTime)}
              </td>
              <td className="px-3 py-2">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(
                    appt.status
                  )}`}
                >
                  {statusLabel(appt.status)}
                </span>
              </td>
              <td className="px-3 py-2 text-gray-700 max-w-xs truncate">
                {appt.notes || "-"}
              </td>
              <td className="px-3 py-2 text-right space-x-2">
                {appt.status === "requested" && onApprove && (
                  <button
                    onClick={() => onApprove(appt.id)}
                    className="px-3 py-1 rounded-md bg-emerald-600 text-white text-xs hover:bg-emerald-700"
                  >
                    Approve
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
