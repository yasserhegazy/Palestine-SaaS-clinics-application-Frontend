'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, CircleDollarSign, TrendingUp, Users, UserCheck } from 'lucide-react';

import Breadcrumbs from '@/components/Breadcrumbs';
import StatCard from '@/components/reports/StatCard';
import DateRangeSelector from '@/components/reports/DateRangeSelector';
import RevenueChart from '@/components/RevenueChart';
import ClinicGrowthChart from '@/components/ClinicGrowthChart';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import { useRoleGuard } from '@/lib/roleGuard';

interface DashboardStats {
  total_clinics: number;
  active_users: number;
  total_patients: number;
  monthly_revenue: number;
  recent_clinics: RecentClinic[];
  revenue_history: RevenueData[];
  clinic_growth: GrowthData[];
}

interface RecentClinic {
  id: number;
  name: string;
  location: string;
  status: string;
  users_count: number;
  created_at: string;
}

interface RevenueData {
  name: string;
  revenue: number;
}

interface GrowthData {
  name: string;
  clinics: number;
}

const today = new Date();
const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

export default function PlatformReportsAndAnalyticsPage() {
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const t = translations[language];

  useRoleGuard([], true);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [startDate, setStartDate] = useState(startOfMonth.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const numberFormatter = useMemo(
    () =>
      new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
        maximumFractionDigits: 0,
      }),
    [language]
  );

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
      }),
    [language]
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchStats = useCallback(
    async (silent = false) => {
      if (!token) return;

      silent ? setRefreshing(true) : setLoadingStats(true);

      try {
        const response = await fetch('http://127.0.0.1:8000/api/admin/dashboard/stats', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
          setLastUpdated(new Date().toISOString());
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        silent ? setRefreshing(false) : setLoadingStats(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (user && token) {
      fetchStats();
    }
  }, [user, token, fetchStats]);

  const filteredClinics = useMemo(() => {
    if (!stats?.recent_clinics) return [];
    if (!startDate || !endDate) return stats.recent_clinics;

    const from = new Date(startDate);
    const to = new Date(endDate);
    to.setHours(23, 59, 59, 999);

    return stats.recent_clinics.filter((clinic) => {
      const created = new Date(clinic.created_at);
      return created >= from && created <= to;
    });
  }, [stats?.recent_clinics, startDate, endDate]);

  const averageRevenuePerClinic =
    stats && stats.total_clinics ? stats.monthly_revenue / stats.total_clinics : 0;
  const usersPerClinic = stats && stats.total_clinics ? stats.active_users / stats.total_clinics : 0;
  const patientsPerClinic =
    stats && stats.total_clinics ? stats.total_patients / stats.total_clinics : 0;

  const revenueChange = useMemo(() => {
    if (!stats?.revenue_history || stats.revenue_history.length < 2) return 0;
    const latest = stats.revenue_history[stats.revenue_history.length - 1]?.revenue ?? 0;
    const previous = stats.revenue_history[stats.revenue_history.length - 2]?.revenue ?? 0;
    if (!previous) return 0;
    return ((latest - previous) / previous) * 100;
  }, [stats?.revenue_history]);

  if (isLoading || loadingStats || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 transition-colors duration-300">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumbs />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-teal-600">
              {t.platformAnalytics || 'Platform analytics'}
            </p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {t.reports || 'Reports'} & {t.platformAnalytics || 'Analytics'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {language === 'ar'
                ? 'لوحة شاملة لمتابعة الإيرادات، نمو العيادات، ونشاط المستخدمين عبر المنصة.'
                : 'Track revenue, clinic growth, and usage insights across the platform.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <DateRangeSelector
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              language={language}
            />
            <button
              type="button"
              onClick={() => fetchStats(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:border-teal-200 dark:hover:border-teal-600 hover:text-teal-700 dark:hover:text-teal-300 transition"
            >
              <svg
                className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0114.13-3.36L23 10M1 14l5.36 4.36A9 9 0 0020.49 15" />
              </svg>
              {refreshing
                ? language === 'ar'
                  ? 'جارٍ التحديث...'
                  : 'Refreshing...'
                : language === 'ar'
                ? 'تحديث الآن'
                : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Summary */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title={t.totalClinics || 'Total Clinics'}
            value={numberFormatter.format(stats?.total_clinics || 0)}
            subtitle={language === 'ar' ? 'العيادات المسجلة' : 'Registered clinics'}
            icon={Building2}
            iconBg="bg-teal-50 dark:bg-teal-900/30"
            iconColor="text-teal-600 dark:text-teal-300"
          />
          <StatCard
            title={t.monthlyRevenue || 'Monthly Revenue'}
            value={currencyFormatter.format(stats?.monthly_revenue || 0)}
            subtitle={
              language === 'ar'
                ? `آخر شهر • ${revenueChange.toFixed(1)}%`
                : `Last month • ${revenueChange.toFixed(1)}%`
            }
            icon={CircleDollarSign}
            iconBg="bg-emerald-50 dark:bg-emerald-900/30"
            iconColor="text-emerald-600 dark:text-emerald-300"
          />
          <StatCard
            title={t.activeUsers || 'Active Users'}
            value={numberFormatter.format(stats?.active_users || 0)}
            subtitle={language === 'ar' ? 'موظفون ومديرون' : 'Staff across clinics'}
            icon={Users}
            iconBg="bg-blue-50 dark:bg-blue-900/30"
            iconColor="text-blue-600 dark:text-blue-300"
          />
          <StatCard
            title={t.totalPatients || 'Total Patients'}
            value={numberFormatter.format(stats?.total_patients || 0)}
            subtitle={language === 'ar' ? 'قيد المتابعة' : 'Patients across clinics'}
            icon={UserCheck}
            iconBg="bg-purple-50 dark:bg-purple-900/30"
            iconColor="text-purple-600 dark:text-purple-300"
          />
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart data={stats?.revenue_history || []} />
          <ClinicGrowthChart data={stats?.clinic_growth || []} />
        </section>

        {/* Efficiency cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {language === 'ar' ? 'متوسط لكل عيادة' : 'Average per clinic'}
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {currencyFormatter.format(averageRevenuePerClinic || 0)}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-300">
                <CircleDollarSign className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {language === 'ar'
                ? 'إيرادات الاشتراكات الشهرية لكل عيادة'
                : 'Monthly subscription revenue per clinic'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {language === 'ar' ? 'المستخدمون لكل عيادة' : 'Users per clinic'}
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {usersPerClinic ? numberFormatter.format(usersPerClinic) : '0'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {language === 'ar'
                ? 'نشاط الفريق عبر كل العيادات'
                : 'Active team members across the network'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {language === 'ar' ? 'المرضى لكل عيادة' : 'Patients per clinic'}
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {patientsPerClinic ? numberFormatter.format(patientsPerClinic) : '0'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {language === 'ar'
                ? 'متابعة المرضى المسجلين على المنصة'
                : 'Registered patients being followed across clinics'}
            </p>
          </div>
        </section>

        {/* Recent clinics */}
        <section className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden transition-colors duration-300">
          <div className="px-4 sm:px-5 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {t.recentClinics || 'Recent Clinics'}
              </h3>
              <p className="text-[11px] text-gray-500 dark:text-slate-400">
                {language === 'ar'
                  ? 'يتم تصفية القائمة حسب فترة التواريخ المحددة'
                  : 'Filtered by the selected reporting window'}
              </p>
            </div>
            {lastUpdated && (
              <span className="text-xs text-gray-500 dark:text-slate-400">
                {language === 'ar' ? 'آخر تحديث:' : 'Updated:'}{' '}
                {new Date(lastUpdated).toLocaleString(language === 'ar' ? 'ar-EG' : 'en-US')}
              </span>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-4 sm:px-5 py-3 text-left text-[11px] font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                    {t.clinicName || 'Clinic Name'}
                  </th>
                  <th className="px-4 sm:px-5 py-3 text-left text-[11px] font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                    {t.location || 'Location'}
                  </th>
                  <th className="px-4 sm:px-5 py-3 text-left text-[11px] font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                    {t.status || 'Status'}
                  </th>
                  <th className="px-4 sm:px-5 py-3 text-left text-[11px] font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                    {t.users || 'Users'}
                  </th>
                  <th className="px-4 sm:px-5 py-3 text-left text-[11px] font-medium text-gray-500 dark:text-slate-300 uppercase tracking-wider">
                    {language === 'ar' ? 'تاريخ الانضمام' : 'Joined'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {filteredClinics.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 sm:px-5 py-8 text-center text-sm text-gray-500 dark:text-slate-400"
                    >
                      {language === 'ar' ? 'لا توجد عيادات في هذه الفترة.' : 'No clinics in this window.'}
                    </td>
                  </tr>
                ) : (
                  filteredClinics.map((clinic) => (
                    <tr key={clinic.id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{clinic.name}</div>
                      </td>
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-xs text-gray-500 dark:text-slate-400">
                        {clinic.location || '—'}
                      </td>
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            clinic.status === 'Active'
                              ? 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400'
                              : 'bg-amber-50 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {clinic.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-xs text-gray-500 dark:text-slate-400">
                        {clinic.users_count}
                      </td>
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-xs text-gray-500 dark:text-slate-400">
                        {new Date(clinic.created_at).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-gray-500 dark:text-slate-400">
            {language === 'ar'
              ? 'اعتمد على لوحة التقارير لاتخاذ القرارات وتوجيه نمو العيادات.'
              : 'Use this overview to steer growth, renewals, and clinic onboarding.'}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push('/platform/clinics')}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            >
              {language === 'ar' ? 'إدارة العيادات' : 'Manage clinics'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/platform/settings')}
              className="px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition"
            >
              {t.settings || 'Settings'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
