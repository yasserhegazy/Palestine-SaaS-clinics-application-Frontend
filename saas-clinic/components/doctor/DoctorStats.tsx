// src/components/doctor/DoctorStats.tsx
import { Appointment } from "@/types/appointment";

interface DoctorStatsProps {
  appointments: Appointment[];
}

export function DoctorStats({ appointments }: DoctorStatsProps) {
  const pendingCount = appointments.filter(
    (a) => a.status.toString().toLowerCase() === "pending"
  ).length;

  const todaysAppointments = 12;
  const totalPatients = 156;

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
