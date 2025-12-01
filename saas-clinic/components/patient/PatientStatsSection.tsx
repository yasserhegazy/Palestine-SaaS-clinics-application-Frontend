// components/patient/PatientStatsSection.tsx
import StatCard from "@/components/StatCard";
import  { PatientDashboardData } from "@/types/patientDashboard";

interface PatientStatsSectionProps {
  t: Record<string, string>;
  language: string;
  dashboardData: PatientDashboardData | null;
  loading: boolean;
}

export function PatientStatsSection({
  t,
  language,
  dashboardData,
  loading,
}: PatientStatsSectionProps) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        label={t.upcomingAppointments}
        value={dashboardData?.stats?.upcoming_appointments ?? 0}
        sub={
          language === "ar"
            ? "مواعيد قادمة خلال الأيام المقبلة"
            : "Upcoming visits in the next days"
        }
        loading={loading}
      />
      <StatCard
        label={t.medicalRecords}
        value={dashboardData?.stats?.medical_records ?? 0}
        sub={
          language === "ar"
            ? "تقارير وفحوصات محفوظة في ملفك"
            : "Reports and tests stored in your file"
        }
        loading={loading}
      />
      <StatCard
        label={t.prescriptions}
        value={dashboardData?.stats?.prescriptions ?? 0}
        sub={
          language === "ar"
            ? "وصفات فعّالة يمكنك متابعتها الآن"
            : "Active prescriptions to follow now"
        }
        loading={loading}
      />
    </section>
  );
}
