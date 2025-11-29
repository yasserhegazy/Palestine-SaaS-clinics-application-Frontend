"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import type { Appointment } from "@/types/appointment";
import { DoctorStats } from "@/components/doctor/DoctorStats";
import { AppointmentFilters } from "@/components/doctor/AppointmentFilters";
import { AppointmentTable } from "@/components/doctor/AppointmentTable";

interface AppointmentsResponse {
  appointments: Appointment[];
}

export default function DoctorDashboard() {
  const { user, token, logout, clinic, isLoading } = useAuth();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(
    null
  );

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>(""); // yyyy-mm-dd
  const [searchTerm, setSearchTerm] = useState<string>("");

  // ------------------------
  // Fetch appointments
  // ------------------------
  useEffect(() => {
    if (!user || !token) return;

    const fetchAppointments = async () => {
      try {
        setIsLoadingAppointments(true);
        setAppointmentsError(null);

        const res = await fetch("/api/doctor/appointments", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data: AppointmentsResponse = await res.json();

        if (!res.ok) {
          throw new Error(
  
            (data as any).message || "Failed to fetch appointments"
          );
        }

setAppointments(data.appointments);
        console.log("appointments in state =>", data.appointments);
      } catch (err: unknown) {
        console.error("Error fetching appointments:", err);
        let message = "Failed to fetch appointments";
        if (err instanceof Error) message = err.message;
        setAppointmentsError(message);
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    fetchAppointments();
  }, [user, token]);

  // ------------------------
  // Approve / Reject handlers
  // ------------------------
  const handleApprove = async (appointmentId: number) => {
    if (!token) {
      alert("Missing token");
      return;
    }

    try {
      const res = await fetch(
        `/api/doctor/appointments/approve/${appointmentId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to approve appointment");
      }

      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appointmentId ? { ...a, status: "approved" } : a
        )
      );
    } catch (err: unknown) {
      console.error("Error approving appointment:", err);
      let message = "Failed to approve appointment";
      if (err instanceof Error) message = err.message;
      alert(message);
    }
  };

const handleReject = async (appointmentId: number, rejectionReason: string) => {
  if (!token) return alert("Missing token");
  if (!rejectionReason.trim()) return alert("Rejection reason is required");

  try {
    const res = await fetch(
      `/api/doctor/appointments/reject/${appointmentId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rejection_reason: rejectionReason }), 
      }
    );

    const data = await res.json();

    if (!res.ok)
      throw new Error(data.message || "Failed to reject appointment");

    console.log("Appointment rejected", data);
  } catch (err) {
    console.error("Error rejecting appointment:", err);
    alert(err instanceof Error ? err.message : "Failed to reject appointment");
  }
};
const handleReschedule = async (
  id: number,
  appointment_date: string,
  appointment_time: string
) => {
  try {
    if (!token) throw new Error("Unauthorized: missing token");

    const res = await fetch(`/api/doctor/appointments/reschedule/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        appointment_date,
        appointment_time,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Error rescheduling appointment");
    }

    console.log("Rescheduled successfully", data);

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: "approved",
              appointment_date,
              appointment_time,
            }
          : a
      )
    );
  } catch (err: any) {
    console.error("Error rescheduling appointment:", err.message);
    alert(err.message);
  }
};




  // ------------------------
  // Filters
  // ------------------------
const filteredAppointments = useMemo(() => {
  const term = searchTerm.trim().toLowerCase();

  return appointments.filter((appt) => {
    const matchesStatus =
      statusFilter === "all" ||
      appt.status?.toLowerCase() === statusFilter.toLowerCase();

    let apptDate = "";
    if (appt.dateTime) {
      apptDate = new Date(appt.dateTime).toISOString().slice(0, 10); // "YYYY-MM-DD"
    }
    const matchesDate = !dateFilter || apptDate === dateFilter;

    const matchesSearch =
      !term ||
      appt.patientName.toLowerCase().includes(term) ||
      (appt.patientPhone ?? "").toLowerCase().includes(term) ||
      (appt.clinicName ?? "").toLowerCase().includes(term) ||
      (appt.notes ?? "").toLowerCase().includes(term);

    return matchesStatus && matchesDate && matchesSearch;
  });
}, [appointments, statusFilter, dateFilter, searchTerm]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Doctor Dashboard
            </h1>
            <p className="text-sm text-gray-600">{clinic?.name}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 text-white mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome, Dr. {user.name}!</h2>
          <p className="text-purple-100">
            Manage your patients and appointment requests.
          </p>
        </div>

        {/* Stats */}
        <DoctorStats appointments={appointments} />

        {/* Appointment Requests Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Appointment Requests
              </h3>
              <p className="text-xs text-gray-500">
                Pending and approved appointment requests.
              </p>
            </div>

            <AppointmentFilters
              statusFilter={statusFilter}
              dateFilter={dateFilter}
              searchTerm={searchTerm}
              onStatusChange={setStatusFilter}
              onDateChange={setDateFilter}
              onSearchChange={setSearchTerm}
            />
          </div>

          <div className="p-6">
            <AppointmentTable
              appointments={filteredAppointments}
              isLoading={isLoadingAppointments}
              error={appointmentsError}
              onApprove={handleApprove}
              onReject={handleReject}
              onReschedule={handleReschedule}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
