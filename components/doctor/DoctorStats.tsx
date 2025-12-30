// src/components/doctor/DoctorStats.tsx
import { Appointment } from "@/types/appointment";
import StatCard from "@/components/StatCard";
import { Calendar, Users, Clock } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface DoctorStatsProps {
  appointments: Appointment[];
  loading?: boolean;
}

export function DoctorStats({ appointments, loading = false }: DoctorStatsProps) {
  const { language } = useLanguage();
  const isArabic = language === "ar";
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
    (a) => {
      const status = (a.status ?? "").toString().toLowerCase();
      return status === "pending" || status === "requested";
    }
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

  const stats = [
    {
      label: isArabic ? "مواعيد اليوم" : "Today's Appointments",
      value: todaysAppointments,
      icon: Calendar,
      color: "teal" as const,
    },
    {
      label: isArabic ? "إجمالي المرضى" : "Total Patients",
      value: totalPatients,
      icon: Users,
      color: "blue" as const,
    },
    {
      label: isArabic ? "الطلبات المعلقة" : "Pending Requests",
      value: pendingCount,
      icon: Clock,
      color: "amber" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-3">
      {stats.map((stat) => (
        <StatCard
          key={stat.label}
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
          loading={loading}
        />
      ))}
    </div>
  );
}
