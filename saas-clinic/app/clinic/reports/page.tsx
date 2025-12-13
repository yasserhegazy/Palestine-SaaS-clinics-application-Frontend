"use client";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import axios from "axios";
import PageHeader from "@/components/common/PageHeader";
import Breadcrumbs from "@/components/Breadcrumbs";
import StatCard from "@/components/reports/StatCard";
import PaymentSummaryCard from "@/components/reports/PaymentSummaryCard";
import CollectionRateCard from "@/components/reports/CollectionRateCard";
import DateRangeSelector from "@/components/reports/DateRangeSelector";
import RevenueChart from "@/components/reports/RevenueChart";
import ConfirmModal from "@/components/ConfirmModal";
import { TrendingUp, Users, Calendar, DollarSign, Activity, UserCheck, Clock, BarChart3 } from "lucide-react";

export default function ClinicReportsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const [reportData, setReportData] = useState<any>(null);
  const [dateRange, setDateRange] = useState({ 
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0], 
    end: new Date().toISOString().split('T')[0] 
  });
  const [loading, setLoading] = useState(true);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);
  const formatCurrency = (value: number | string | undefined | null) =>
    `$${Number(value ?? 0).toFixed(2)}`;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/login");
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchReportData = async () => {
      if (!isAuthenticated) return;
      try {
        setLoading(true);
        const response = await apiClient.get('/clinic/reports', {
          params: {
            start_date: dateRange.start,
            end_date: dateRange.end
          }
        });
        setReportData(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 429) {
          setRateLimitMessage(
            language === "ar"
              ? "لقد تم إرسال العديد من الطلبات بسرعة. يُرجى الانتظار بضع ثوانٍ ثم المحاولة مرة أخرى."
              : "Too many requests in a short time. Please wait a few seconds and try again."
          );
        } else {
          console.error('Error fetching report data:', err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, [dateRange, isAuthenticated]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <Breadcrumbs />
        <PageHeader
          label={language === "ar" ? "التحليلات والتقارير" : "Analytics & Reports"}
          title={language === "ar" ? "تقارير العيادة" : "Clinic Reports"}
          description={language === "ar" ? "عرض شامل لأداء العيادة والإحصائيات المالية" : "Comprehensive overview of clinic performance and financial statistics"}
          backAction={() => router.push("/clinic/dashboard")}
        />

        <div className="space-y-6">
          <DateRangeSelector
            startDate={dateRange.start}
            endDate={dateRange.end}
            onStartDateChange={(date) => setDateRange({...dateRange, start: date})}
            onEndDateChange={(date) => setDateRange({...dateRange, end: date})}
            language={language}
          />

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            </div>
          ) : reportData ? (
            <>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  {language === "ar" ? "الأداء المالي" : "Financial Performance"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title={language === "ar" ? "إجمالي الإيرادات" : "Total Revenue"}
                    value={formatCurrency(reportData.financial?.total_revenue)}
                    icon={DollarSign}
                    iconBg="bg-teal-100 dark:bg-teal-900/40"
                    iconColor="text-teal-600 dark:text-teal-400"
                    textColor="text-teal-700 dark:text-teal-300"
                  />
                  <StatCard
                    title={language === "ar" ? "مدفوعات معلقة" : "Pending Payments"}
                    value={formatCurrency(reportData.financial?.total_pending)}
                    icon={Clock}
                    iconBg="bg-amber-100 dark:bg-amber-900/40"
                    iconColor="text-amber-600 dark:text-amber-400"
                    textColor="text-amber-700 dark:text-amber-300"
                  />
                  <StatCard
                    title={language === "ar" ? "المعاملات المدفوعة" : "Paid Transactions"}
                    value={reportData.financial?.paid_payments || 0}
                    subtitle={language === "ar" ? `من أصل ${reportData.financial?.total_payments || 0}` : `out of ${reportData.financial?.total_payments || 0}`}
                    icon={BarChart3}
                    iconBg="bg-teal-100 dark:bg-teal-900/40"
                    iconColor="text-teal-600 dark:text-teal-400"
                    textColor="text-teal-700 dark:text-teal-300"
                  />
                  <StatCard
                    title={language === "ar" ? "الإيرادات الشهرية" : "Monthly Revenue"}
                    value={formatCurrency(reportData.financial?.monthly_revenue)}
                    icon={Calendar}
                    iconBg="bg-teal-100 dark:bg-teal-900/40"
                    iconColor="text-teal-600 dark:text-teal-400"
                    textColor="text-teal-700 dark:text-teal-300"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                  {language === "ar" ? "إحصائيات العيادة" : "Clinic Statistics"}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard
                    title={language === "ar" ? "إجمالي المرضى" : "Total Patients"}
                    value={reportData.clinic_stats?.total_patients_count || 0}
                    icon={Users}
                    iconBg="bg-teal-100 dark:bg-teal-900/40"
                    iconColor="text-teal-600 dark:text-teal-400"
                  />
                  <StatCard
                    title={language === "ar" ? "الأطباء النشطون" : "Active Doctors"}
                    value={reportData.clinic_stats?.active_doctors_count || 0}
                    icon={UserCheck}
                    iconBg="bg-blue-100 dark:bg-blue-900/40"
                    iconColor="text-blue-600 dark:text-blue-400"
                  />
                  <StatCard
                    title={language === "ar" ? "الموظفون" : "Staff Members"}
                    value={reportData.clinic_stats?.employees_count || 0}
                    icon={Users}
                    iconBg="bg-purple-100 dark:bg-purple-900/40"
                    iconColor="text-purple-600 dark:text-purple-400"
                  />
                  <StatCard
                    title={language === "ar" ? "مواعيد اليوم" : "Today's Appointments"}
                    value={reportData.clinic_stats?.today_appointments_count || 0}
                    icon={Calendar}
                    iconBg="bg-green-100 dark:bg-green-900/40"
                    iconColor="text-green-600 dark:text-green-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <PaymentSummaryCard
                  paidPayments={reportData.financial?.paid_payments || 0}
                  pendingPayments={reportData.financial?.pending_payments || 0}
                  totalPayments={reportData.financial?.total_payments || 0}
                  language={language}
                />
                <CollectionRateCard
                  paidPayments={reportData.financial?.paid_payments || 0}
                  totalPayments={reportData.financial?.total_payments || 0}
                  language={language}
                />
                <RevenueChart
                  language={language}
                  onRateLimit={() =>
                    setRateLimitMessage(
                      language === "ar"
                        ? "لقد تم إرسال العديد من الطلبات بسرعة. يُرجى الانتظار بضع ثوانٍ ثم المحاولة مرة أخرى."
                        : "Too many requests in a short time. Please wait a few seconds and try again."
                    )
                  }
                />
              </div>

              {reportData.appointments_summary && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                    {language === "ar" ? "ملخص المواعيد" : "Appointments Summary"}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <StatCard
                      title={language === "ar" ? "إجمالي المواعيد" : "Total Appointments"}
                      value={reportData.appointments_summary.total || 0}
                      icon={Calendar}
                      iconBg="bg-slate-100 dark:bg-slate-700/40"
                      iconColor="text-slate-600 dark:text-slate-400"
                    />
                    <StatCard
                      title={language === "ar" ? "مكتملة" : "Completed"}
                      value={reportData.appointments_summary.completed || 0}
                      icon={Activity}
                      iconBg="bg-green-100 dark:bg-green-900/40"
                      iconColor="text-green-600 dark:text-green-400"
                    />
                    <StatCard
                      title={language === "ar" ? "معتمدة" : "Approved"}
                      value={reportData.appointments_summary.approved || 0}
                      icon={UserCheck}
                      iconBg="bg-blue-100 dark:bg-blue-900/40"
                      iconColor="text-blue-600 dark:text-blue-400"
                    />
                    <StatCard
                      title={language === "ar" ? "معلقة" : "Pending"}
                      value={reportData.appointments_summary.pending || 0}
                      icon={Clock}
                      iconBg="bg-amber-100 dark:bg-amber-900/40"
                      iconColor="text-amber-600 dark:text-amber-400"
                    />
                    <StatCard
                      title={language === "ar" ? "ملغية" : "Cancelled"}
                      value={reportData.appointments_summary.cancelled || 0}
                      icon={TrendingUp}
                      iconBg="bg-red-100 dark:bg-red-900/40"
                      iconColor="text-red-600 dark:text-red-400"
                    />
                  </div>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
      <ConfirmModal
        isOpen={!!rateLimitMessage}
        onClose={() => setRateLimitMessage(null)}
        onConfirm={() => setRateLimitMessage(null)}
        title={language === "ar" ? "تم تجاوز الحد" : "Rate limit reached"}
        message={rateLimitMessage || ""}
        confirmText={language === "ar" ? "حسنًا" : "Got it"}
        cancelText={language === "ar" ? "إغلاق" : "Close"}
        type="warning"
      />
    </div>
  );
}
