"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { Appointment } from "@/types/appointment";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/common/PageHeader";
import Breadcrumbs from "@/components/Breadcrumbs";

interface AppointmentsResponse {
  appointments: Appointment[];
}

type ApiError = {
  message?: string;
  error?: string;
};

export default function DoctorUpcomingAppointmentsPage() {
  const { user, token, isLoading } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [appointmentsError, setAppointmentsError] = useState<string | null>(
    null
  );

  const hasLoaded = useRef(false);

  const fetchAppointments = useCallback(async () => {
    if (!user || !token) return;

    try {
      if (!hasLoaded.current) setIsLoadingAppointments(true);

      setAppointmentsError(null);

      const res = await fetch("/api/doctor/appointments/upcoming", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = (await res.json()) as AppointmentsResponse | ApiError;

      if (!res.ok) {
        throw new Error(
          (json as ApiError).message ||
            (json as ApiError).error ||
            (isArabic ? "U?O'U, U?US OªU,O\" OU,U.U^OO1USO_" : "Failed to fetch appointments")
        );
      }

      setAppointments((json as AppointmentsResponse).appointments);
      hasLoaded.current = true;
    } catch (err) {
      console.error("Error fetching appointments:", err);
      const message =
        err instanceof Error
          ? err.message
          : isArabic
          ? "U?O'U, U?US OªU,O\" OU,U.U^OO1USO_"
          : "Failed to fetch appointments";
      setAppointmentsError(message);
      toast.error(message);
    } finally {
      setIsLoadingAppointments(false);
    }
  }, [user, token, isArabic]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const upcomingAppointments = useMemo(() => {
    const now = new Date();
    const todayMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    return appointments.filter((appt) => {
      if (!appt.dateTime) return false;

      const apptDate = new Date(appt.dateTime);
      const isFutureOrToday = apptDate >= todayMidnight;
      const isApproved = appt.status?.toLowerCase() === "approved";

      const createdByDoctor =
        (
          appt as {
            createdBy?: string;
            created_by?: string;
            createdByDoctor?: boolean;
          }
        ).createdBy === "doctor" ||
        (
          appt as {
            createdBy?: string;
            created_by?: string;
            createdByDoctor?: boolean;
          }
        ).created_by === "doctor" ||
        (
          appt as {
            createdBy?: string;
            created_by?: string;
            createdByDoctor?: boolean;
          }
        ).createdByDoctor === true;

      return isFutureOrToday && (isApproved || createdByDoctor);
    });
  }, [appointments]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900" dir={isArabic ? "rtl" : "ltr"}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs
          customItems={[
            { label: isArabic ? "OU,OúO\"USO\"" : "Doctor", href: "/doctor/dashboard" },
            {
              label: isArabic ? "U,U^O-Oc OU,O¦O-UŸU." : "Dashboard",
              href: "/doctor/dashboard",
            },
            {
              label: isArabic ? "OU,U.U^OO1USO_ OU,U,OO_U.Oc" : "Upcoming appointments",
              href: null,
            },
          ]}
        />
        <PageHeader
          label={isArabic ? "U.U^OO1USO_UŸ OU,U,OO_U.Oc" : "Your upcoming appointments"}
          title={
            isArabic
              ? "OU,U.U^OO1USO_ OU,U,OO_U.Oc (OU,U.U,O\"U^U,Oc OœU^ OU,U.O-OªU^OýOc U.U+ OU,OúO\"USO\")"
              : "Upcoming appointments (approved or created by you)"
          }
          description={
            isArabic
              ? "O1OñO OU,U.U^OO1USO_ OU,U,OO_U.Oc OU,O¦US O¦U. OU,U.U^OU?U,Oc O1U,USUØO OœU^ OU,O¦US U,U.O¦ O\"O-OªOýUØO O\"U+U?O3UŸ."
              : "View upcoming appointments that are approved or were created by the doctor."
          }
          backAction={() => router.push("/doctor/dashboard")}
        />

        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 mt-6">
          <div className="px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-700">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {isArabic ? "OU,U.U^OO1USO_ OU,U,OO_U.Oc" : "Upcoming appointments"}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isArabic
                ? "UØOøUØ OU,OæU?O-Oc O¦O1OñO OU,U.U^OO1USO_ OU,U.O3O¦U,O\"U,USOc OU,U.U^OU?U, O1U,USUØO OœU^ OU,U.O-OªU^OýOc U.U+ U,O\"U, OU,OúO\"USO\"."
                : "This page shows future appointments that are approved or created by the doctor."}
            </p>
            {appointmentsError && (
              <p className="mt-1 text-[11px] text-red-600">
                {appointmentsError}
              </p>
            )}
          </div>

          <div className="p-4 sm:p-6">
            {isLoadingAppointments ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
              </div>
            ) : upcomingAppointments.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-10">
                {isArabic
                  ? "U,O USU^OªO_ U.U^OO1USO_ U,OO_U.Oc O-OU,USOU<."
                  : "No upcoming appointments."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-slate-200 dark:border-slate-700 text-black dark:text-white rounded-xl overflow-hidden">
                  <thead className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm">
                    <tr>
                      <th className="px-4 py-2 text-start">
                        {isArabic ? "OU,U.OñUSO" : "Patient"}
                      </th>
                      <th className="px-4 py-2 text-start">
                        {isArabic ? "OU,UØOO¦U?" : "Phone"}
                      </th>
                      <th className="px-4 py-2 text-start">
                        {isArabic ? "OU,O¦OOñUSOr" : "Date"}
                      </th>
                      <th className="px-4 py-2 text-start">
                        {isArabic ? "OU,U^U,O¦" : "Time"}
                      </th>
                      <th className="px-4 py-2 text-start">
                        {isArabic ? "OU,O-OU,Oc" : "Status"}
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {upcomingAppointments.map((appt) => {
                      const date = appt.dateTime
                        ? new Date(appt.dateTime).toLocaleDateString()
                        : "-";
                      const time = appt.dateTime
                        ? new Date(appt.dateTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-";

                      return (
                        <tr key={appt.id} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                          <td className="px-4 py-2 font-medium">
                            {appt.patientName}
                          </td>
                          <td className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300">
                            {appt.patientPhone || "-"}
                          </td>
                          <td className="px-4 py-2 text-sm">{date}</td>
                          <td className="px-4 py-2 text-sm">{time}</td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 rounded-full text-xs bg-teal-100 text-teal-700">
                              {appt.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
