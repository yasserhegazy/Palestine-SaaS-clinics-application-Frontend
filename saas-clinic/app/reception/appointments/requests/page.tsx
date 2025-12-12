"use client";

import { useMemo, useState } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import Breadcrumbs from "@/components/Breadcrumbs";

type AppointmentStatus = "new" | "approved" | "rejected" | "rescheduled";

interface AppointmentRequest {
  id: string;
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

const initialRequests: AppointmentRequest[] = [
  {
    id: "REQ-1001",
    patientName: "أحمد محمد",
    nationalId: "401234567",
    phone: "0590000000",
    specialty: "طب القلب",
    doctorName: "د. خالد يوسف",
    preferredDate: "2025-02-20",
    preferredTime: "15:00",
    createdAt: "2025-02-18 10:30",
    status: "new",
    portalSource: "البوابة الإلكترونية",
    complaint: "ألم مستمر في الصدر الأيسر منذ أسبوع.",
  },
  {
    id: "REQ-1002",
    patientName: "سارة علي",
    nationalId: "408765432",
    phone: "0591111111",
    specialty: "طب الأطفال",
    doctorName: "د. محمد رائد",
    preferredDate: "2025-02-21",
    preferredTime: "11:00",
    createdAt: "2025-02-18 11:15",
    status: "new",
    portalSource: "تطبيق الهاتف",
    complaint: "حرارة عالية وألم في حلقيه.",
  },
];

export default function AppointmentRequestsPage() {
  const [requests, setRequests] = useState<AppointmentRequest[]>(initialRequests);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">("new");
  const [selectedRequest, setSelectedRequest] = useState<AppointmentRequest | undefined>(undefined);
  const [actionNote, setActionNote] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language];

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch =
        req.patientName.includes(search) ||
        req.phone.includes(search) ||
        (req.nationalId && req.nationalId.includes(search)) ||
        req.id.includes(search);

      const matchesStatus = statusFilter === "all" ? true : req.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, statusFilter]);

  const handleOpenDetails = (req: AppointmentRequest) => {
    setSelectedRequest(req);
    setActionNote("");
    setNewDate(req.preferredDate);
    setNewTime(req.preferredTime);
  };

  const closeDetails = () => {
    setSelectedRequest(undefined);
    setActionNote("");
  };

  const updateRequestStatus = (
    id: string,
    status: AppointmentStatus,
    options?: { newDate?: string; newTime?: string; note?: string }
  ) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? {
              ...req,
              status,
              preferredDate: options?.newDate ?? req.preferredDate,
              preferredTime: options?.newTime ?? req.preferredTime,
              note: options?.note ?? req.note,
            }
          : req
      )
    );
    closeDetails();
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <Breadcrumbs />

        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500 mb-1">
              {t.patientsManagement || (language === "ar" ? "إدارة المرضى" : "Patients management")}
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              {t.appointmentRequestsTitle || (language === "ar" ? "طلبات المواعيد" : "Appointment Requests")}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t.appointmentRequestsSubtitle ||
                (language === "ar" ? "مراجعة الطلبات الواردة من البوابة الإلكترونية، تدقيق التفاصيل وتحويلها للطبيب المناسب للموافقة من الادمن." : "Review requests from the online portal, verify details and forward to the appropriate doctor for admin approval.")}
            </p>
          </div>

 
        </div>

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
              className="w-full rounded-lg border border-gray-500 px-3 py-2 text-black text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: t.appointmentStatusAll || (language === "ar" ? "الكل" : "All"), value: "all" as const },
              { label: t.appointmentStatusNew || (language === "ar" ? "جديدة" : "New"), value: "new" as const },
              { label: t.appointmentStatusApproved || (language === "ar" ? "مُأكدة" : "Approved"), value: "approved" as const },
              { label: t.appointmentStatusRejected || (language === "ar" ? "مرفوضة" : "Rejected"), value: "rejected" as const },
              {
                label: t.appointmentStatusRescheduled || (language === "ar" ? "مُعاد جدولته" : "Rescheduled"),
                value: "rescheduled" as const,
              },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setStatusFilter(item.value)}
                className={`px-3 py-1 text-xs rounded-full border ${
                  statusFilter === item.value
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-sm text-gray-500">
          {(t.appointmentRequestsCountLabel || (language === "ar" ? "عدد الطلبات" : "Number of requests")) + ": "}
          <span className="font-semibold text-gray-800">{filteredRequests.length}</span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
          <div className="p-4 md:p-6">
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full text-sm text-right">
                <thead className="bg-gray-50 text-xs text-gray-500">
                  <tr>
                    <th className="px-4 py-3">{t.appointmentRequestNumber || (language === "ar" ? "رقم الطلب" : "Request ID")}</th>
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
                      <td colSpan={8} className="px-4 py-6 text-center text-gray-400 text-sm">
                        {t.appointmentRequestsNoResults ||
                          (language === "ar" ? "لا توجد طلبات مطابقة للبحث من الفلتر الحالي." : "No matching requests found for current filter.")}
                      </td>
                    </tr>
                  )}

                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{req.id}</td>
                      <td className="px-4 py-3 text-gray-900">{req.patientName}</td>
                      <td className="px-4 py-3 text-gray-700">{req.phone}</td>
                      <td className="px-4 py-3 text-gray-700">{req.specialty}</td>
                      <td className="px-4 py-3 text-gray-700">{req.doctorName ?? "-"}</td>
                      <td className="px-4 py-3 text-gray-700">
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
                          {t.viewDetails || (language === "ar" ? "عرض التفاصيل" : "View details")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl text-gray-600 shadow-lg max-w-xl w-full mx-4 p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    {t.appointmentDetailsTitle || (language === "ar" ? "تفاصيل طلب الموعد" : "Appointment Request Details")}
                  </h2>
                  <p className="text-xs text-gray">
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
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                  aria-label={t.close || (language === "ar" ? "إغلاق" : "Close")}
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <InfoItem label={t.appointmentDetailsPatientName || "OO3U. OU,U.OñUSO"} value={selectedRequest.patientName} />
                <InfoItem label={t.appointmentDetailsNationalId || "OñU,U. OU,UØU^USOc"} value={selectedRequest.nationalId ?? "-"} />
                <InfoItem label={t.appointmentDetailsPhone || "OñU,U. OU,UØOO¦U?"} value={selectedRequest.phone} />
                <InfoItem
                  label={t.appointmentDetailsSource || "U.OæO_Oñ OU,OúU,O\""}
                  value={selectedRequest.portalSource ?? "OU,O\"U^OO\"Oc OU,OU,UŸO¦OñU^U+USOc"}
                />
                <InfoItem label={t.appointmentDetailsSpecialty || "OU,O¦OrOæOæ"} value={selectedRequest.specialty} />
                <InfoItem
                  label={t.appointmentDetailsDoctor || "OU,OúO\"USO\" OU,U.OúU,U^O\""}
                  value={selectedRequest.doctorName ?? "O3USO¦U. OOrO¦USOOñ OU,OúO\"USO\" U,OO-U,OU<"}
                />
                <InfoItem
                  label={t.appointmentDetailsPreferredSlot || "OU,U.U^O1O_ OU,U.U?OU,"}
                  value={`${selectedRequest.preferredDate} - ${selectedRequest.preferredTime}`}
                />
                <InfoItem
                  label={t.appointmentDetailsCurrentStatus || (language === "ar" ? "الحالة الحالية" : "Current Status")}
                  value={<StatusBadge status={selectedRequest.status} />}
                />
              </div>

              {selectedRequest.complaint && (
                <div className="mt-2">
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    {t.appointmentDetailsComplaint || (language === "ar" ? "وصف الحالة / الشكوى" : "Complaint / Description")}
                  </div>
                  <p className="text-sm text-gray-800 bg-gray-50 rounded-lg px-3 py-2">{selectedRequest.complaint}</p>
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
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder={
                    t.appointmentNotePlaceholder || (language === "ar"
                      ? "مثال: تم تأكيد الموعد، يُرجى الحضور قبل 10 دقائق..."
                      : "Example: Appointment confirmed, please arrive 10 minutes earlier...")
                  }
                />
              </div>

              <div className="flex flex-col md:flex-row justify-between gap-3 pt-2">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() =>
                      updateRequestStatus(selectedRequest.id, "approved", {
                        note: actionNote,
                        newDate,
                        newTime,
                      })
                    }
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
                  >
                    {t.appointmentActionApprove || (language === "ar" ? "تأكيد الموعد" : "Approve Request")}
                  </button>
                  <button
                    onClick={() =>
                      updateRequestStatus(selectedRequest.id, "rescheduled", {
                        note:
                          actionNote ||
                          (t.appointmentRescheduleNote || (language === "ar"
                            ? "تم إعادة جدولة الموعد."
                            : "Appointment has been rescheduled.")),
                        newDate,
                        newTime,
                      })
                    }
                    className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm hover:bg-amber-600"
                  >
                    {t.appointmentActionReschedule || (language === "ar" ? "إعادة جدولة" : "Reschedule")}
                  </button>
                  <button
                    onClick={() =>
                      updateRequestStatus(selectedRequest.id, "rejected", {
                        note:
                          actionNote ||
                          (t.appointmentRejectNote || (language === "ar"
                            ? "تم رفض الطلب بسبب عدم توفر موعد مناسب."
                            : "The request was rejected due to unavailability of a suitable slot.")),
                      })
                    }
                    className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600"
                  >
                    {t.appointmentActionReject || (language === "ar" ? "رفض الطلب" : "Reject Request")}
                  </button>
                </div>

                <button
                  onClick={closeDetails}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
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
    new: {
      label: t.appointmentStatusNew || (language === "ar" ? "جديد" : "New"),
      className: "bg-blue-50 text-blue-700 border-blue-100",
    },
    approved: {
      label: t.appointmentStatusApproved || (language === "ar" ? "مُأكد" : "Approved"),
      className: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    rejected: {
      label: t.appointmentStatusRejected || (language === "ar" ? "مرفوض" : "Rejected"),
      className: "bg-red-50 text-red-700 border-red-100",
    },
    rescheduled: {
      label: t.appointmentStatusRescheduled || (language === "ar" ? "مُعاد جدولته" : "Rescheduled"),
      className: "bg-amber-50 text-amber-700 border-amber-100",
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
