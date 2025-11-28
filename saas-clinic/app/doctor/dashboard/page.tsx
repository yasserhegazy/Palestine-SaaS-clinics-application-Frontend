"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { Appointment } from "@/types/appointment";
import { mapAppointmentFromApi, ApiAppointment } from "@/utils/mapAppointment";
import { DoctorStats } from "@/components/doctor/DoctorStats";
import { AppointmentFilters } from "@/components/doctor/AppointmentFilters";
import { AppointmentTable } from "@/components/doctor/AppointmentTable";

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

useEffect(() => {
  if (!user || !token) return;

  const fetchAppointments = async () => {
    try {
      setIsLoadingAppointments(true);
      setAppointmentsError(null);

      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

      const res = await fetch(`${API_BASE_URL}/api/doctor/appointments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`, 
        },
      });
console.log("TOKEN:", token);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || data.error);
      }

      const data = await res.json();

      const mapped: Appointment[] = (data.appointments as ApiAppointment[]).map(
        mapAppointmentFromApi
      );

      setAppointments(mapped);
    } catch (err: any) {
      setAppointmentsError(err.message);
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  fetchAppointments();
}, [user, token]);



  //  Approve appointment
  const handleApprove = async (appointmentId: number) => {
    try {
      const res = await fetch(
        `/api/doctor/appointments/approve/${appointmentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to approve appointment");
      }

      // Update status locally
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appointmentId ? { ...a, status: "approved" } : a
        )
      );
    } catch (err: any) {
      console.error("Error approving appointment", err);
      alert(err.message || "Failed to approve appointment");
    }
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      const apptDate = appt.dateTime?.slice(0, 10); // "2025-11-30"

      const matchesStatus =
        statusFilter === "all" || appt.status === statusFilter;

      const matchesDate = !dateFilter || apptDate === dateFilter;

      const term = searchTerm.trim().toLowerCase();
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
            />
          </div>
        </div>
      </main>
    </div>
  );
}
