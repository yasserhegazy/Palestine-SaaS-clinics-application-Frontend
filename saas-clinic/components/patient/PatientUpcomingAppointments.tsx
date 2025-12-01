// components/patient/PatientUpcomingAppointments.tsx
import { useRouter } from "next/navigation";
import type { UpcomingAppointment } from "@/types/patientDashboard";

interface PatientUpcomingAppointmentsProps {
  t: Record<string, string>;
  language: string;
  loading: boolean;
  appointments: UpcomingAppointment[];
}

export function PatientUpcomingAppointments({
  t,
  language,
  loading,
  appointments,
}: PatientUpcomingAppointmentsProps) {
  const router = useRouter();

  const getStatusBadge = (status: string) => {
    if (["Approved", "confirmed"].includes(status)) {
      return (
        <div className="flex flex-col items-end gap-0.5">
          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700">
            {language === "ar" ? "مؤكد" : "Confirmed"}
          </span>
        </div>
      );
    }
    if (["Requested", "Pending Doctor Approval", "pending"].includes(status)) {
      return (
        <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-700">
          {language === "ar" ? "بانتظار الموافقة" : "Pending approval"}
        </span>
      );
    }
    return null;
  };

  return (
    <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-4 sm:px-5 py-3 border-b flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            {t.upcomingAppointments}
          </h3>
          <p className="text-[11px] text-slate-500">
            {language === "ar"
              ? "تفاصيل المواعيد القادمة مع الأطباء"
              : "Details of your upcoming visits"}
          </p>
        </div>
        <button
          className="text-xs text-teal-700 hover:text-teal-800 hover:underline"
          onClick={() => router.push("/patient/appointments")}
        >
          {language === "ar" ? "عرض كل المواعيد" : "View all"}
        </button>
      </div>

      {loading ? (
        <div className="p-6 text-center text-sm text-slate-500">Loading...</div>
      ) : appointments.length === 0 ? (
        <div className="p-6">
          <p className="text-sm text-slate-500">{t.noUpcomingAppointments}</p>
          <button
            onClick={() => router.push("/patient/appointments/new")}
            className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
          >
            {t.bookAppointment}
          </button>
        </div>
      ) : (
        <div className="divide-y">
          {appointments.map((app, idx) => (
            <div
              key={idx}
              className="px-4 sm:px-5 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-slate-50 transition"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center justify-center rounded-xl bg-slate-900 text-white px-3 py-2 text-center">
                  <span className="text-xs font-semibold">
                    {new Date(app.appointment_date).toLocaleDateString()}
                  </span>
                  <span className="text-[11px] opacity-80">
                    {new Date(app.appointment_date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {app.clinic?.name ?? "Clinic"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === "ar"
                      ? `مع ${app.doctor?.user?.name ?? ""}`
                      : `With ${app.doctor?.user?.name ?? ""}`}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1">
                {getStatusBadge(app.status)}
                <button className="text-[11px] text-teal-700 hover:underline">
                  {language === "ar"
                    ? "عرض تفاصيل الموعد"
                    : "View appointment details"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
