// src/components/doctor/DoctorStats.tsx
import { Appointment } from "@/types/appointment";

interface DoctorStatsProps {
  appointments: Appointment[];
}

export function DoctorStats({ appointments }: DoctorStatsProps) {
  const today = new Date();

  const todaysAppointments = appointments.filter((a) => {
    if (!a.dateTime) return false;
    const d = new Date(a.dateTime);
    if (Number.isNaN(d.getTime())) return false;

    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  }).length;

  const pendingCount = appointments.filter(
    (a) => (a.status ?? "").toString().toLowerCase() === "pending"
  ).length;
const patientKeys = new Set<string>();

for (const a of appointments) {
  const key =
    (a.patientId && String(a.patientId)) ||
    a.patientPhone ||
    a.patientName ||
    "";

  if (key) patientKeys.add(key);
}


  const totalPatients = patientKeys.size;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-3 text-black">
      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-sm text-gray-600 mb-1">Today&apos;s Appointments</p>
        <p className="text-3xl font-bold text-gray-900">{todaysAppointments}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-sm text-gray-600 mb-1">Total Patients</p>
        <p className="text-3xl font-bold text-gray-900">{totalPatients}</p>
      </div>
      <div className="bg-white rounded-lg shadow p-4">
        <p className="text-sm text-gray-600 mb-1">Pending Requests</p>
        <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
      </div>
    </div>
  );
}
