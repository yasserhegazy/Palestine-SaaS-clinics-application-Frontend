"use client";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import PageHeader from "@/components/common/PageHeader";
import Breadcrumbs from "@/components/Breadcrumbs";
import { DollarSign, Receipt, Users, TrendingUp } from "lucide-react";

type Payment = {
  payment_id: number;
  receipt_number: string;
  amount: number;
  amount_paid: number;
  payment_method: string;
  status: string;
  payment_date: string;
  patient: { user: { name: string } };
  appointment: { doctor: { user: { name: string } } };
  receiver: { name: string };
};

type Summary = {
  date: string;
  total_collected: number;
  total_partial: number;
  total_exempt: number;
  total_pending: number;
  cash_count: number;
  exempt_count: number;
  total_transactions: number;
};

type ByReceiver = {
  receiver_name: string;
  total_collected: number;
  transaction_count: number;
};

export default function DailyReportsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [byReceiver, setByReceiver] = useState<ByReceiver[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchReport = async () => {
      if (!isAuthenticated || !user) return;
      try {
        setLoading(true);
        // Use role-based endpoint
        const endpoint = user.role === 'Secretary' 
          ? `/secretary/reports/daily?date=${date}`
          : `/clinic/payments/daily-report?date=${date}`;
        
        const response = await apiClient.get(endpoint);
        const payload = (response.data as any)?.data ?? response.data;
        setSummary(payload?.summary ?? null);
        setByReceiver(payload?.by_receiver ?? []);
        setPayments(payload?.payments ?? []);
      } catch (err) {
        console.error('Error fetching report:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [date, isAuthenticated, user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      Paid: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400",
      Pending: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400",
      Partial: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400",
      Exempt: "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
    };
    return badges[status as keyof typeof badges] || badges.Pending;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs />
        <PageHeader
          label={language === "ar" ? "التقارير المالية" : "Financial Reports"}
          title={language === "ar" ? "التقرير اليومي" : "Daily Report"}
          description={language === "ar" ? "عرض ملخص المدفوعات والمعاملات المالية اليومية" : "View daily payment summary and financial transactions"}
          backAction={() => router.push("/reception/dashboard")}
        />

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
            <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
              {language === "ar" ? "التاريخ" : "Date"}
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="px-4 py-2 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : summary ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-xl">
                      <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{language === "ar" ? "إجمالي المحصل" : "Total Collected"}</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">${(summary.total_collected + summary.total_partial).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-amber-100 dark:bg-amber-900/40 rounded-xl">
                      <TrendingUp className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{language === "ar" ? "معلق" : "Pending"}</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">${summary.total_pending.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-xl">
                      <Receipt className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{language === "ar" ? "المعاملات" : "Transactions"}</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{summary.total_transactions}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-xl">
                      <Users className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{language === "ar" ? "معفى" : "Exempt"}</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">{summary.total_exempt}</p>
                    </div>
                  </div>
                </div>
              </div>

              {byReceiver.length > 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {language === "ar" ? "حسب الموظف" : "By Staff Member"}
                    </h3>
                  </div>
                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {byReceiver.map((r, i) => (
                      <div key={i} className="px-5 py-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{r.receiver_name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{r.transaction_count} {language === "ar" ? "معاملة" : "transactions"}</p>
                        </div>
                        <p className="text-lg font-bold text-teal-600 dark:text-teal-400">${r.total_collected.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    {language === "ar" ? "تفاصيل المدفوعات" : "Payment Details"}
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full table-auto">
                    <thead className="bg-slate-50 dark:bg-slate-700/50">
                      <tr>
                        <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400">{language === "ar" ? "رقم الإيصال" : "Receipt"}</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400">{language === "ar" ? "المريض" : "Patient"}</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400">{language === "ar" ? "الطبيب" : "Doctor"}</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400">{language === "ar" ? "المبلغ" : "Amount"}</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400">{language === "ar" ? "المدفوع" : "Paid"}</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400">{language === "ar" ? "الطريقة" : "Method"}</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-slate-500 dark:text-slate-400">{language === "ar" ? "الحالة" : "Status"}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                      {payments.map((p) => (
                        <tr key={p.payment_id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                          <td className="px-4 py-3 text-center text-xs font-mono text-slate-600 dark:text-slate-400">{p.receipt_number}</td>
                          <td className="px-4 py-3 text-center text-sm text-slate-900 dark:text-white">{p.patient.user.name}</td>
                          <td className="px-4 py-3 text-center text-sm text-slate-600 dark:text-slate-400">{p.appointment.doctor.user.name}</td>
                          <td className="px-4 py-3 text-center text-sm font-medium text-slate-900 dark:text-white">${p.amount}</td>
                          <td className="px-4 py-3 text-center text-sm font-medium text-teal-600 dark:text-teal-400">${p.amount_paid}</td>
                          <td className="px-4 py-3 text-center text-xs text-slate-600 dark:text-slate-400">{p.payment_method}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(p.status)}`}>
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 text-center">
              <p className="text-slate-500 dark:text-slate-400">{language === "ar" ? "لا توجد بيانات لهذا التاريخ" : "No data for this date"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
