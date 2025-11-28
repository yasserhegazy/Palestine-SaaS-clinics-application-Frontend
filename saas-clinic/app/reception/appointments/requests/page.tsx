"use client";

import { useMemo, useState } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import LanguageSwitcher from "@/components/LanguageSwitcher";


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
    patientName: "محمد أحمد",
    nationalId: "401234567",
    phone: "0590000000",
    specialty: "طب العظام",
    doctorName: "د. خالد يوسف",
    preferredDate: "2025-02-20",
    preferredTime: "15:00",
    createdAt: "2025-02-18 10:30",
    status: "new",
    portalSource: "البوابة الإلكترونية",
    complaint: "ألم مستمر في الركبة اليمنى منذ شهر.",
  },

  {
    id: "REQ-1002",
    patientName: "سارة علي",
    nationalId: "408765432",
    phone: "0591111111",
    specialty: "طب الأطفال",
    doctorName: "د. أحمد رائد",
    preferredDate: "2025-02-21",
    preferredTime: "11:00",
    createdAt: "2025-02-18 11:15",
    status: "new",
    portalSource: "تطبيق الجوال",
    complaint: "حرارة عالية وتقيؤ منذ يومين.",
  },
];


export default function AppointmentRequestsPage() {
  const [requests, setRequests] =
    useState<AppointmentRequest[]>(initialRequests);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">(
    "new"
  );
  const [selectedRequest, setSelectedRequest] = useState<
    AppointmentRequest | undefined
  >(undefined);
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

      const matchesStatus =
        statusFilter === "all" ? true : req.status === statusFilter;

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
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500 mb-1">
              {t.patientsManagement || "إدارة المرضى"}
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              {t.appointmentRequestsTitle || "طلبات المواعيد"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t.appointmentRequestsSubtitle ||
                "مراجعة الطلبات القادمة من البوابة الإلكترونية، تدقيق التفاصيل، وتحويلها للطبيب المناسب للموافقة أو التعديل."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={() => router.back()}
              className="text-sm text-teal-700 hover:text-teal-800 hover:underline"
            >
              {t.back || "رجوع"}
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <div className="flex items-center gap-2 w-full md:w-1/2">
            <input
              type="text"
              placeholder={
                t.appointmentRequestsSearchPlaceholder ||
                "بحث بالاسم، رقم الهوية، الهاتف، رقم الطلب..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-500 px-3 py-2 text-black text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              {
                label: t.appointmentStatusAll || "الكل",
                value: "all" as const,
              },
              {
                label: t.appointmentStatusNew || "جديدة",
                value: "new" as const,
              },
              {
                label: t.appointmentStatusApproved || "مقبولة",
                value: "approved" as const,
              },
              {
                label: t.appointmentStatusRejected || "مرفوضة",
                value: "rejected" as const,
              },
              {
                label: t.appointmentStatusRescheduled || "مُعاد جدولتها",
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
          {(t.appointmentRequestsCountLabel || "عدد الطلبات") + ": "}
          <span className="font-semibold text-gray-800">
            {filteredRequests.length}
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
          <div className="p-4 md:p-6">
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="min-w-full text-sm text-right">
                <thead className="bg-gray-50 text-xs text-gray-500">
                  <tr>
                    <th className="px-4 py-3">رقم الطلب</th>
                    <th className="px-4 py-3">
                      {t.appointmentDetailsPatientName || "اسم المريض"}
                    </th>
                    <th className="px-4 py-3">
                      {t.appointmentDetailsPhone || "الهاتف"}
                    </th>
                    <th className="px-4 py-3">
                      {t.appointmentDetailsSpecialty || "التخصص"}
                    </th>
                    <th className="px-4 py-3">
                      {t.appointmentDetailsDoctor || "الطبيب"}
                    </th>
                    <th className="px-4 py-3">
                      {t.appointmentDetailsPreferredSlot || "الموعد المفضل"}
                    </th>
                    <th className="px-4 py-3">
                      {t.appointmentDetailsCurrentStatus || "الحالة"}
                    </th>
                    <th className="px-4 py-3">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-4 py-6 text-center text-gray-400 text-sm"
                      >
                        {t.appointmentRequestsNoResults ||
                          "لا توجد طلبات مطابقة للبحث أو الفلتر الحالي."}
                      </td>
                    </tr>
                  )}

                  {filteredRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">
                        {req.id}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {req.patientName}
                      </td>
                      <td className="px-4 py-3 text-gray-700">{req.phone}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {req.specialty}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {req.doctorName ?? "-"}
                      </td>
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

    
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white rounded-2xl text-gray-600 shadow-lg max-w-xl w-full mx-4 p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    {t.appointmentDetailsTitle || "تفاصيل طلب الموعد"}
                  </h2>
                  <p className="text-xs text-gray">
                    {(t.appointmentDetailsRequestNumber || "رقم الطلب") +
                      `: ${selectedRequest.id}`}{" "}
                    ·{" "}
                    {language === "ar"
                      ? `تاريخ التقديم: ${selectedRequest.createdAt}`
                      : `Submitted at: ${selectedRequest.createdAt}`}
                  </p>
                </div>
                <button
                  onClick={closeDetails}
                  className="text-gray-400 hover:text-gray-600 text-xl leading-none"
                  aria-label={language === "ar" ? "إغلاق" : "Close"}
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <InfoItem
                  label={t.appointmentDetailsPatientName || "اسم المريض"}
                  value={selectedRequest.patientName}
                />
                <InfoItem
                  label={t.appointmentDetailsNationalId || "رقم الهوية"}
                  value={selectedRequest.nationalId ?? "-"}
                />
                <InfoItem
                  label={t.appointmentDetailsPhone || "رقم الهاتف"}
                  value={selectedRequest.phone}
                />
                <InfoItem
                  label={t.appointmentDetailsSource || "مصدر الطلب"}
                  value={selectedRequest.portalSource ?? "البوابة الإلكترونية"}
                />
                <InfoItem
                  label={t.appointmentDetailsSpecialty || "التخصص"}
                  value={selectedRequest.specialty}
                />
                <InfoItem
                  label={t.appointmentDetailsDoctor || "الطبيب المطلوب"}
                  value={
                    selectedRequest.doctorName ?? "سيتم اختيار الطبيب لاحقاً"
                  }
                />
                <InfoItem
                  label={t.appointmentDetailsPreferredSlot || "الموعد المفضل"}
                  value={`${selectedRequest.preferredDate} - ${selectedRequest.preferredTime}`}
                />
                <InfoItem
                  label={t.appointmentDetailsCurrentStatus || "الحالة الحالية"}
                  value={<StatusBadge status={selectedRequest.status} />}
                />
              </div>

              {selectedRequest.complaint && (
                <div className="mt-2">
                  <div className="text-xs font-semibold text-gray-600 mb-1">
                    {t.appointmentDetailsComplaint || "وصف الحالة / الشكوى"}
                  </div>
                  <p className="text-sm text-gray-800 bg-gray-50 rounded-lg px-3 py-2">
                    {selectedRequest.complaint}
                  </p>
                </div>
              )}

              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    {t.appointmentDetailsDate || "تاريخ الموعد"}
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
                    {t.appointmentDetailsTime || "وقت الموعد"}
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
                    "ملاحظة (تظهر في ملف الموعد / يمكن إرسالها للمريض)"}
                </label>
                <textarea
                  rows={3}
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
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
                    onClick={() =>
                      updateRequestStatus(selectedRequest.id, "approved", {
                        note: actionNote,
                        newDate,
                        newTime,
                      })
                    }
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm hover:bg-emerald-700"
                  >
                    {t.appointmentActionApprove || "قبول الموعد"}
                  </button>
                  <button
                    onClick={() =>
                      updateRequestStatus(selectedRequest.id, "rescheduled", {
                        note:
                          actionNote ||
                          (language === "ar"
                            ? "تم إعادة جدولة الموعد."
                            : "Appointment has been rescheduled."),
                        newDate,
                        newTime,
                      })
                    }
                    className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm hover:bg-amber-600"
                  >
                    {t.appointmentActionReschedule || "إعادة جدولة"}
                  </button>
                  <button
                    onClick={() =>
                      updateRequestStatus(selectedRequest.id, "rejected", {
                        note:
                          actionNote ||
                          (language === "ar"
                            ? "تم رفض الطلب بسبب عدم توفر موعد مناسب."
                            : "The request was rejected due to unavailability of a suitable slot."),
                      })
                    }
                    className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm hover:bg-red-600"
                  >
                    {t.appointmentActionReject || "رفض الطلب"}
                  </button>
                </div>

                <button
                  onClick={closeDetails}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50"
                >
                  {t.appointmentActionClose || "إلغاء / إغلاق"}
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
      label: t.appointmentStatusNew || "جديد",
      className: "bg-blue-50 text-blue-700 border-blue-100",
    },
    approved: {
      label: t.appointmentStatusApproved || "مقبول",
      className: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    rejected: {
      label: t.appointmentStatusRejected || "مرفوض",
      className: "bg-red-50 text-red-700 border-red-100",
    },
    rescheduled: {
      label: t.appointmentStatusRescheduled || "مُعاد جدولته",
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

/* مكوّن صغير لعنصر معلومات */
function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="text-sm text-gray-900">{value}</div>
    </div>
  );
}
