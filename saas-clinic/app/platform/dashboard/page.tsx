'use client';

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import DashboardHeader from '@/components/DashboardHeader';
import DashboardHero from '@/components/DashboardHero';
import StatCard from '@/components/StatCard';
import RevenueChart from '@/components/RevenueChart';
import ClinicGrowthChart from '@/components/ClinicGrowthChart';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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

export default function PlatformDashboard() {
  const { user, token, isAuthenticated, isLoading, logout } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();
  
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // Protect route - only platform admins can access
  useRoleGuard([], true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!token) return;
      
      try {
        const response = await fetch('http://127.0.0.1:8000/api/admin/dashboard/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    if (user && token) {
      fetchStats();
    }
  }, [user, token]);

  if (isLoading || !user || loadingStats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString(
    language === 'ar' ? 'ar-EG' : 'en-US',
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        user={{ name: user.name, role: user.role }}
        logout={logout}
        t={t}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <DashboardHero
          title={
            language === 'ar'
              ? `مرحباً، ${user.name.split(' ')[0]} 👋`
              : `Welcome, ${user.name.split(' ')[0]} 👋`
          }
          subtitle={today}
          description={
            language === 'ar'
              ? 'من هنا يمكنك إدارة جميع العيادات، متابعة الإحصائيات، إعدادات المنصة ومراقبة الأداء العام.'
              : 'From here you can manage all clinics, monitor statistics, configure platform settings and track overall performance.'
          }
        />

        {/* Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label={t.totalClinics || 'Total Clinics'}
            value={stats?.total_clinics || 0}
            sub={language === 'ar' ? 'عيادات مسجلة' : 'Registered clinics'}
          />
          <StatCard
            label={t.activeUsers || 'Active Users'}
            value={stats?.active_users || 0}
            sub={language === 'ar' ? 'مستخدمين نشطين' : 'Active users'}
          />
          <StatCard
            label={t.totalPatients || 'Total Patients'}
            value={stats?.total_patients || 0}
            sub={language === 'ar' ? 'مرضى مسجلين' : 'Registered patients'}
          />
          <StatCard
            label={t.monthlyRevenue || 'Monthly Revenue'}
            value={`$${stats?.monthly_revenue || 0}`}
            sub={language === 'ar' ? 'إيرادات الشهر' : 'This month revenue'}
          />
        </section>

        {/* Charts Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart data={stats?.revenue_history || []} />
          <ClinicGrowthChart data={stats?.clinic_growth || []} />
        </section>

        {/* Quick Actions */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-4 sm:px-5 py-3 border-b flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t.quickActions || (language === 'ar' ? 'الإجراءات السريعة' : 'Quick Actions')}
              </h3>
            </div>
          </div>

          <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Manage Clinics */}
            <button
              onClick={() => router.push('/platform/clinics')}
              className="flex flex-col items-start gap-1 rounded-2xl border border-gray-100 bg-gray-50/80 hover:bg-teal-50 hover:border-teal-200 transition px-4 py-3 text-left"
            >
              <span className="text-xs font-semibold text-teal-700">
                {language === 'ar' ? 'إدارة العيادات' : 'Manage Clinics'}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {language === 'ar' ? 'عرض وإدارة جميع العيادات' : 'View and manage all clinics'}
              </span>
              <span className="text-[11px] text-gray-500">
                {language === 'ar' ? 'تفعيل، تعطيل، وتحرير العيادات المسجلة' : 'Activate, deactivate, and edit registered clinics'}
              </span>
            </button>

            {/* View Reports */}
            <button
              onClick={() => router.push('/platform/reports')}
              className="flex flex-col items-start gap-1 rounded-2xl border border-gray-100 bg-gray-50/80 hover:bg-blue-50 hover:border-blue-200 transition px-4 py-3 text-left"
            >
              <span className="text-xs font-semibold text-blue-700">
                {language === 'ar' ? 'التقارير والإحصائيات' : 'Reports & Analytics'}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {language === 'ar' ? 'عرض تقارير المنصة المفصلة' : 'View detailed platform reports'}
              </span>
              <span className="text-[11px] text-gray-500">
                {language === 'ar' ? 'تحليلات شاملة للأداء والإيرادات' : 'Comprehensive performance and revenue analytics'}
              </span>
            </button>

            {/* Platform Settings */}
            <button
              onClick={() => router.push('/platform/settings')}
              className="flex flex-col items-start gap-1 rounded-2xl border border-gray-100 bg-gray-50/80 hover:bg-purple-50 hover:border-purple-200 transition px-4 py-3 text-left"
            >
              <span className="text-xs font-semibold text-purple-700">
                {language === 'ar' ? 'إعدادات المنصة' : 'Platform Settings'}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {language === 'ar' ? 'إدارة إعدادات النظام' : 'Manage system settings'}
              </span>
              <span className="text-[11px] text-gray-500">
                {language === 'ar' ? 'تكوين المنصة والخطط والاشتراكات' : 'Configure platform, plans and subscriptions'}
              </span>
            </button>
          </div>
        </section>

        {/* Recent Clinics Table */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-3 border-b flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{t.recentClinics || 'Recent Clinics'}</h3>
              <p className="text-[11px] text-gray-500">
                {language === 'ar' ? 'آخر العيادات المسجلة' : 'Latest registered clinics'}
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-5 py-3 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">{t.clinicName || 'Clinic Name'}</th>
                  <th className="px-4 sm:px-5 py-3 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">{t.location || 'Location'}</th>
                  <th className="px-4 sm:px-5 py-3 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">{t.status || 'Status'}</th>
                  <th className="px-4 sm:px-5 py-3 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">{t.users || 'Users'}</th>
                  <th className="px-4 sm:px-5 py-3 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">{t.joinedDate || 'Joined Date'}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loadingStats ? (
                  <tr>
                    <td colSpan={5} className="px-4 sm:px-5 py-8 text-center text-sm text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : stats?.recent_clinics && stats.recent_clinics.length > 0 ? (
                  stats.recent_clinics.map((clinic) => (
                    <tr key={clinic.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{clinic.name}</div>
                      </td>
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-xs text-gray-500">{clinic.location}</td>
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          clinic.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : 'bg-amber-50 text-amber-700'
                        }`}>
                          {clinic.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-xs text-gray-500">{clinic.users_count}</td>
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-xs text-gray-500">
                        {new Date(clinic.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 sm:px-5 py-8 text-center text-sm text-gray-500">
                      No clinics found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
