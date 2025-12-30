"use client";

import { useMemo, useState, useEffect } from "react";
import type React from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import Breadcrumbs from "@/components/Breadcrumbs";
import apiClient from "@/lib/api";

type AppointmentStatus = "Requested" | "Approved" | "Cancelled" | "Completed";

interface AppointmentRequest {
  id: number;
  patientName: string;
  nationalId?: string;
  phone: string;
  specialty: string;
  doctorName?: string;
  preferredDate: string;
  preferredTime: string;
  createdAt: string;
  status: AppointmentStatus;
  note?: string;
  portalSource?: string;
  complaint?: string;
}


export default function AppointmentRequestsPage() {
  const [requests, setRequests] = useState<AppointmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("Requested");
  const [selectedRequest, setSelectedRequest] = useState<AppointmentRequest | undefined>(undefined);
  const [actionNote, setActionNote] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const { language } = useLanguage();
  const t = translations[language];

  // Fetch appointment requests from backend
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get("/secretary/appointments/requests");
        
        if (response.data.success) {
          const apiData = response.data.data;
          const formattedRequests: AppointmentRequest[] = apiData.map((item: unknown) => {
            const appointment = item as {
              id: number;
              patient?: { name?: string; national_id?: string; phone?: string };
              doctor?: { name?: string; specialization?: string };
              date?: string;
              time?: string;
              created_at?: string;
              status: string;
              notes?: string;
            };
            return {
              id: appointment.id,
              patientName: appointment.patient?.name || "N/A",
              nationalId: appointment.patient?.national_id,
              phone: appointment.patient?.phone || "N/A",
              specialty: appointment.doctor?.specialization || "N/A",
              doctorName: appointment.doctor?.name,
              preferredDate: appointment.date || "",
              preferredTime: appointment.time || "",
              createdAt: new Date(appointment.created_at || Date.now()).toLocaleString(),
              status: appointment.status as AppointmentStatus,
              note: appointment.notes,
              complaint: appointment.notes,
            };
          });
          setRequests(formattedRequests);
        }
      } catch (err: unknown) {
        console.error("Error fetching appointment requests:", err);
        const errorMessage = err instanceof Error && 'response' in err && typeof err.response === 'object' && err.response !== null && 'data' in err.response && typeof err.response.data === 'object' && err.response.data !== null && 'message' in err.response.data 
          ? String(err.response.data.message)
          : "Failed to load appointment requests";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch =
        req.patientName.toLowerCase().includes(search.toLowerCase()) ||
        req.phone.includes(search) ||
        (req.nationalId && req.nationalId.includes(search)) ||
        req.id.toString().includes(search);

      const matchesStatus = statusFilter === "all" ? true : req.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const handleOpenDetails = (req: AppointmentRequest) => {
    setSelectedRequest(req);
    setActionNote("");
    // Ensure time is in HH:mm format for the time input
    const timeFormatted = req.preferredTime ? req.preferredTime.substring(0, 5) : "";
    setNewDate(req.preferredDate);
    setNewTime(timeFormatted);
  };

  const closeDetails = () => {
    setSelectedRequest(undefined);
    setActionNote("");
    setActionLoading(false);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      setActionLoading(true);
      const response = await apiClient.put(`/secretary/appointments/approve/${selectedRequest.id}`);
      
      if (response.data.success) {
        // Update the local state
        setRequests((prev) =>
          prev.map((req) =>
            req.id === selectedRequest.id
              ? { ...req, status: "Approved" as AppointmentStatus }
              : req
          )
        );
        closeDetails();
      }
    } catch (err: unknown) {
      console.error("Error approving appointment:", err);
      const errorMessage = err instanceof Error && 'response' in err && typeof err.response === 'object' && err.response !== null && 'data' in err.response && typeof err.response.data === 'object' && err.response.data !== null && 'message' in err.response.data 
        ? String(err.response.data.message)
        : "Failed to approve appointment";
      alert(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    const reason = actionNote || (language === "ar"
      ? "تم رفض الطلب بسبب عدم توفر موعد مناسب."
      : "The request was rejected due to unavailability of a suitable slot.");

    try {
      setActionLoading(true);
      const response = await apiClient.put(`/secretary/appointments/reject/${selectedRequest.id}`, {
        rejection_reason: reason,
      });
      
      if (response.data.success) {
        // Update the local state
        setRequests((prev) =>
          prev.map((req) =>
            req.id === selectedRequest.id
              ? { ...req, status: "Cancelled" as AppointmentStatus, note: reason }
              : req
          )
        );
        closeDetails();
      }
    } catch (err: unknown) {
      console.error("Error rejecting appointment:", err);
      const errorMessage = err instanceof Error && 'response' in err && typeof err.response === 'object' && err.response !== null && 'data' in err.response && typeof err.response.data === 'object' && err.response.data !== null && 'message' in err.response.data 
        ? String(err.response.data.message)
        : "Failed to reject appointment";
      alert(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReschedule = async () => {
    if (!selectedRequest) return;

    if (!newDate || !newTime) {
      alert(language === "ar" ? "يرجى إدخال التاريخ والوقت" : "Please enter date and time");
      return;
    }

    try {
      setActionLoading(true);
      
      // Ensure time is in H:i format (remove seconds if present)
      const formattedTime = newTime.substring(0, 5);
      
      const response = await apiClient.put(`/secretary/appointments/reschedule/${selectedRequest.id}`, {
        appointment_date: newDate,
        appointment_time: formattedTime,
      });
      
      if (response.data.success) {
        // Update the local state
        setRequests((prev) =>
          prev.map((req) =>
            req.id === selectedRequest.id
              ? {
                  ...req,
                  status: "Approved" as AppointmentStatus,
                  preferredDate: newDate,
                  preferredTime: newTime,
                }
              : req
          )
        );
        closeDetails();
      }
    } catch (err: unknown) {
      console.error("Error rescheduling appointment:", err);
      const errorMessage = err instanceof Error && 'response' in err && typeof err.response === 'object' && err.response !== null && 'data' in err.response && typeof err.response.data === 'object' && err.response.data !== null && 'message' in err.response.data 
        ? String(err.response.data.message)
        : "Failed to reschedule appointment";
      alert(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-6">
        <Breadcrumbs />

        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500 mb-1">
              {t.patientsManagement || (language === "ar" ? "إدارة المرضى" : "Patients management")}
            </p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t.appointmentRequestsTitle || (language === "ar" ? "طلبات المواعيد" : "Appointment Requests")}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t.appointmentRequestsSubtitle ||
                (language === "ar" ? "مراجعة الطلبات الواردة من البوابة الإلكترونية، تدقيق التفاصيل وتحويلها للطبيب المناسب للموافقة من الادمن." : "Review requests from the online portal, verify details and forward to the appropriate doctor for admin approval.")}
            </p>
          </div>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {language === "ar" ? "جاري التحميل..." : "Loading..."}
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
              <div className="flex items-center gap-2 w-full md:w-1/2">
                <input
                  type="text"
                  placeholder={
                    t.appointmentRequestsSearchPlaceholder ||
                    (language === "ar" ? "بحث بالاسم، رقم الهوية، الهاتف، رقم الطلب..." : "Search by name, ID, phone, request number...")
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-lg border border-gray-500 dark:border-slate-600 px-3 py-2 text-black dark:text-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { label: t.appointmentStatusAll || (language === "ar" ? "الكل" : "All"), value: "all" as const },
                  { label: t.appointmentStatusNew || (language === "ar" ? "جديدة" : "Requested"), value: "Requested" as const },
                  { label: t.appointmentStatusApproved || (language === "ar" ? "مُأكدة" : "Approved"), value: "Approved" as const },
                  { label: t.appointmentStatusRejected || (language === "ar" ? "مرفوضة" : "Cancelled"), value: "Cancelled" as const },
                  {
                    label: language === "ar" ? "مكتملة" : "Completed",
                    value: "Completed" as const,
                  },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setStatusFilter(item.value)}
                    className={`px-3 py-1 text-xs rounded-full border ${
                      statusFilter === item.value
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-sm text-gray-500">
              {(t.appointmentRequestsCountLabel || (language === "ar" ? "عدد الطلبات" : "Number of requests")) + ": "}
              <span className="font-semibold text-gray-800 dark:text-slate-200">{filteredRequests.length}</span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <div className="p-4 md:p-6">
                <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-600">
              <table className="min-w-full text-sm text-right">
                <thead className="bg-gray-50 dark:bg-slate-700/50 text-xs text-gray-500 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3">{language === "ar" ? "رقم الطلب" : "Request ID"}</th>
                    <th className="px-4 py-3">
                      {t.appointmentDetailsPatientName || (language === "ar" ? "اسم المريض" : "Patient Name")}
                    </th>
                    <th className="px-4 py-3">{t.appointmentDetailsPhone || (language === "ar" ? "الهاتف" : "Phone")}</th>
                    <th className="px-4 py-3">{t.appointmentDetailsSpecialty || (language === "ar" ? "التخصص" : "Specialty")}</th>
                    <th className="px-4 py-3">{t.appointmentDetailsDoctor || (language === "ar" ? "الطبيب" : "Doctor")}</th>
                    <th className="px-4 py-3">
                      {t.appointmentDetailsPreferredSlot || (language === "ar" ? "الموعد المفضل" : "Preferred Slot")}
                    </th>
                    <th className="px-4 py-3">{t.appointmentDetailsCurrentStatus || (language === "ar" ? "الحالة" : "Status")}</th>
                    <th className="px-4 py-3">{t.actions || (language === "ar" ? "إجراءات" : "Actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-6 text-center text-gray-400 dark:text-slate-500 text-sm">
                        {t.appointmentRequestsNoResults ||
                          (language === "ar" ? "لا توجد طلبات مطابقة للبحث من الفلتر الحالي." : "No matching requests found for current filter.")}
                      </td>
                    </tr>
                  )}

                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="border-t border-gray-100 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600 dark:text-slate-400">{req.id}</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-white">{req.patientName}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{req.phone}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{req.specialty}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-slate-300">{req.doctorName ?? "-"}</td>
                      <td className="px-4 py-3 text-gray-700 dark:text-slate-300">
                        {req.preferredDate} - {req.preferredTime}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleOpenDetails(req)}
                          className="text-xs px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100"
                        >
                          {language === "ar" ? "عرض التفاصيل" : "View details"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
            </div>
          </>
        )}

        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white dark:bg-slate-800 rounded-2xl text-gray-600 dark:text-slate-300 shadow-lg max-w-xl w-full mx-4 p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {t.appointmentDetailsTitle || (language === "ar" ? "تفاصيل طلب الموعد" : "Appointment Request Details")}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {(t.appointmentDetailsRequestNumber || (language === "ar" ? "رقم الطلب" : "Request Number")) +
                      `: ${selectedRequest.id}`}{" "}
                    •{" "}
                    {language === "ar"
                      ? `تاريخ التقديم: ${selectedRequest.createdAt}`
                      : `Submitted at: ${selectedRequest.createdAt}`}
                  </p>
                </div>
                <button
                  onClick={closeDetails}
                  className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 text-xl leading-none"
                  aria-label={language === "ar" ? "إغلاق" : "Close"}
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <InfoItem
                  label={t.appointmentDetailsPatientName || (language === "ar" ? "??? ??????" : "Patient Name")}
                  value={selectedRequest.patientName}
                />
                <InfoItem
                  label={t.appointmentDetailsNationalId || (language === "ar" ? "????? ??????" : "National ID")}
                  value={selectedRequest.nationalId ?? "-"}
                />
                <InfoItem
                  label={t.appointmentDetailsPhone || (language === "ar" ? "??? ??????" : "Phone")}
                  value={selectedRequest.phone}
                />
                <InfoItem
                  label={t.appointmentDetailsSource || (language === "ar" ? "???? ?????" : "Request Source")}
                  value={selectedRequest.portalSource ?? (language === "ar" ? "??? ????" : "Not specified")}
                />
                <InfoItem
                  label={t.appointmentDetailsSpecialty || (language === "ar" ? "??????" : "Specialty")}
                  value={selectedRequest.specialty}
                />
                <InfoItem
                  label={t.appointmentDetailsDoctor || (language === "ar" ? "?????? ???????" : "Requested Doctor")}
                  value={selectedRequest.doctorName ?? (language === "ar" ? "?? ??? ?????? ???? ???" : "No doctor selected yet")}
                />
                <InfoItem
                  label={t.appointmentDetailsPreferredSlot || (language === "ar" ? "????? ??????" : "Preferred Slot")}
                  value={`${selectedRequest.preferredDate} - ${selectedRequest.preferredTime}`}
                />
                <InfoItem
                  label={t.appointmentDetailsCurrentStatus || (language === "ar" ? "?????? ???????" : "Current Status")}
                  value={<StatusBadge status={selectedRequest.status} />}
                />
              </div>

              {selectedRequest.complaint && (
                <div className="mt-2">
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    {t.appointmentDetailsComplaint || (language === "ar" ? "وصف الحالة / الشكوى" : "Complaint / Description")}
                  </div>
                  <p className="text-sm text-gray-800 dark:text-slate-200 bg-gray-50 dark:bg-slate-700 rounded-lg px-3 py-2">{selectedRequest.complaint}</p>
                </div>
              )}

              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {t.appointmentDetailsDate || (language === "ar" ? "تاريخ الموعد" : "Appointment Date")}
                  </label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {t.appointmentDetailsTime || (language === "ar" ? "وقت الموعد" : "Appointment Time")}
                  </label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mt-2">
                <label className="block text-xs text-gray-500 mb-1">
                  {t.appointmentDetailsNoteLabel ||
                    (language === "ar" ? "ملاحظات (تكتب في تأكيد الموعد / رسالة إرسالها للمريض)" : "Notes (written in confirmation / message to patient)")}
                </label>
                <textarea
                  rows={3}
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder={
                    language === "ar"
                      ? "مثال: تم تأكيد الموعد، يُرجى الحضور قبل 10 دقائق..."
                      : "Example: Appointment confirmed, please arrive 10 minutes earlier..."
                  }
                />
              </div>

              <div className="flex flex-col md:flex-row justify-between gap-3 pt-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? (language === "ar" ? "جاري المعالجة..." : "Processing...") : (t.appointmentActionApprove || (language === "ar" ? "تأكيد الموعد" : "Approve Request"))}
                  </button>
                  <button
                    onClick={handleReschedule}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? (language === "ar" ? "جاري المعالجة..." : "Processing...") : (t.appointmentActionReschedule || (language === "ar" ? "إعادة جدولة" : "Reschedule"))}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {actionLoading ? (language === "ar" ? "جاري المعالجة..." : "Processing...") : (t.appointmentActionReject || (language === "ar" ? "رفض الطلب" : "Reject Request"))}
                  </button>
                </div>

                <button
                  onClick={closeDetails}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t.appointmentActionClose || (language === "ar" ? "الغاء / إغلاق" : "Cancel / Close")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: AppointmentStatus }) {
  const { language } = useLanguage();
  const t = translations[language];

  const map: Record<AppointmentStatus, { label: string; className: string }> = {
    Requested: {
      label: t.appointmentStatusNew || (language === "ar" ? "جديد" : "Requested"),
      className: "bg-blue-50 text-blue-700 border-blue-100",
    },
    Approved: {
      label: t.appointmentStatusApproved || (language === "ar" ? "مُأكد" : "Approved"),
      className: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    Cancelled: {
      label: t.appointmentStatusRejected || (language === "ar" ? "مرفوض" : "Cancelled"),
      className: "bg-red-50 text-red-700 border-red-100",
    },
    Completed: {
      label: language === "ar" ? "مكتمل" : "Completed",
      className: "bg-gray-50 text-gray-700 border-gray-100",
    },
  };

  const item = map[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-xs font-medium ${item.className}`}
    >
      {item.label}
    </span>
  );
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-sm text-gray-900">{value}</div>
    </div>
  );
}
