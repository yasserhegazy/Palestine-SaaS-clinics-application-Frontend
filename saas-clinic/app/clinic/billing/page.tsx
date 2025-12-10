"use client";

import { useState, useEffect, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import Breadcrumbs from "@/components/Breadcrumbs";
import {
  DailyReportResponse,
  Payment,
  PaymentStatusColors,
  PaymentStatusLabels,
  PaymentMethodLabels,
} from "@/types/payment";

export default function BillingPage() {
  const { language } = useLanguage();
  const [report, setReport] = useState<DailyReportResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDailyReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/clinic/payments/daily-report?date=${selectedDate}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch report");
      }
      const data = await response.json();
      setReport(data);
    } catch (err) {
      console.error("Error fetching report:", err);
      setError(
        language === "ar"
          ? "فشل في تحميل التقرير"
          : "Failed to load report"
      );
    } finally {
      setLoading(false);
    }
  }, [selectedDate, language]);

  useEffect(() => {
    fetchDailyReport();
  }, [fetchDailyReport]);

  const formatCurrency = (amount: number) => `₪${amount.toFixed(2)}`;

  const getStatusLabel = (status: string) => {
    const labels = PaymentStatusLabels[status as keyof typeof PaymentStatusLabels];
    return labels ? (language === "ar" ? labels.ar : labels.en) : status;
  };

  const getMethodLabel = (method: string) => {
    const labels = PaymentMethodLabels[method as keyof typeof PaymentMethodLabels];
    return labels ? (language === "ar" ? labels.ar : labels.en) : method;
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs />

        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {language === "ar" ? "المحاسبة والفواتير" : "Billing & Payments"}
            </h1>
            <p className="text-sm text-slate-500">
              {language === "ar"
                ? "تقارير المدفوعات اليومية"
                : "Daily payment reports"}
            </p>
          </div>

          {/* Date Selector */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700">
              {language === "ar" ? "التاريخ:" : "Date:"}
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
            <p className="text-slate-500 mt-4">
              {language === "ar" ? "جاري التحميل..." : "Loading..."}
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <button
              onClick={fetchDailyReport}
              className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700"
            >
              {language === "ar" ? "إعادة المحاولة" : "Retry"}
            </button>
          </div>
        ) : report ? (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {/* Total Collected */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">
                      {language === "ar" ? "إجمالي المحصل" : "Total Collected"}
                    </p>
                    <p className="text-xl font-bold text-green-600">
                      {formatCurrency(report.summary.total_collected)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Partial Payments */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">
                      {language === "ar" ? "الدفعات الجزئية" : "Partial Payments"}
                    </p>
                    <p className="text-xl font-bold text-orange-600">
                      {formatCurrency(report.summary.total_partial)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Pending */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">
                      {language === "ar" ? "قيد الانتظار" : "Pending"}
                    </p>
                    <p className="text-xl font-bold text-yellow-600">
                      {formatCurrency(report.summary.total_pending)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Transactions */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">
                      {language === "ar" ? "عدد المعاملات" : "Transactions"}
                    </p>
                    <p className="text-xl font-bold text-blue-600">
                      {report.summary.total_transactions}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Secondary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-slate-100 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-slate-700">
                  {report.summary.cash_count}
                </p>
                <p className="text-xs text-slate-500">
                  {language === "ar" ? "دفع نقدي" : "Cash Payments"}
                </p>
              </div>
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-blue-700">
                  {report.summary.exempt_count}
                </p>
                <p className="text-xs text-slate-500">
                  {language === "ar" ? "حالات إعفاء" : "Exemptions"}
                </p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-purple-700">
                  {report.by_receiver.length}
                </p>
                <p className="text-xs text-slate-500">
                  {language === "ar" ? "موظفين محصلين" : "Staff Collecting"}
                </p>
              </div>
            </div>

            {/* By Receiver Table */}
            {report.by_receiver.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  {language === "ar" ? "التحصيل حسب الموظف" : "Collection by Staff"}
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                          {language === "ar" ? "الموظف" : "Staff"}
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                          {language === "ar" ? "المبلغ المحصل" : "Amount Collected"}
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                          {language === "ar" ? "عدد المعاملات" : "Transactions"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {report.by_receiver.map((receiver, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">
                            {receiver.receiver_name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-medium">
                            {formatCurrency(receiver.total_collected)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                            {receiver.transaction_count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Payments Table */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                {language === "ar" ? "جميع المعاملات" : "All Transactions"}
              </h2>

              {report.payments.length === 0 ? (
                <p className="text-center text-slate-500 py-8">
                  {language === "ar"
                    ? "لا توجد معاملات في هذا التاريخ"
                    : "No transactions on this date"}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                          {language === "ar" ? "رقم الإيصال" : "Receipt"}
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                          {language === "ar" ? "المريض" : "Patient"}
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                          {language === "ar" ? "المبلغ" : "Amount"}
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                          {language === "ar" ? "المدفوع" : "Paid"}
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                          {language === "ar" ? "الطريقة" : "Method"}
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                          {language === "ar" ? "الحالة" : "Status"}
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                          {language === "ar" ? "المحصل" : "Collected By"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {report.payments.map((payment: Payment) => (
                        <tr key={payment.payment_id}>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-slate-600">
                            {payment.receipt_number}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-900">
                            {payment.patient?.user?.name || "-"}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 font-medium">
                            {formatCurrency(payment.amount_paid)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                            {getMethodLabel(payment.payment_method)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                PaymentStatusColors[payment.status] || "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {getStatusLabel(payment.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                            {payment.receiver?.name || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
