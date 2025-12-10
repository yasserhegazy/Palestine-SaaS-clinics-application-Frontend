'use client';

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { translations } from '@/lib/translations';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useRoleGuard } from '@/lib/roleGuard';
import DashboardHero from '@/components/DashboardHero';
import StatCard from '@/components/StatCard';
import QuickActionCard from '@/components/QuickActionCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getClinicStats, type ClinicStats } from '@/lib/api/clinicDashboard';
import { getClinicSettings, type ClinicSettings } from '@/lib/api/clinicSettings';

export default function ClinicDashboard() {
  const { user, clinic, token, isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const successMessage = searchParams.get('success');
  const [flashMessage, setFlashMessage] = useState<string>(successMessage || '');
  const [clinicData, setClinicData] = useState<ClinicSettings | null>(null);
  const [stats, setStats] = useState<ClinicStats | null>(null);
  const [isLoadingClinic, setIsLoadingClinic] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const t = translations[language];

  // Protect route - only clinic managers can access
  useRoleGuard(['Manager']);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Handle flash message from URL
  useEffect(() => {
    if (successMessage) {
      // Clear URL params
      router.replace('/clinic/dashboard');
      // Auto-dismiss after 5 seconds
      const timer = setTimeout(() => setFlashMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, router]);

  // Fetch fresh clinic settings and stats on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingClinic(true);
        setIsLoadingStats(true);
        
        // Fetch settings
        try {
            const data = await getClinicSettings();
            setClinicData(data);
        } catch (error) {
            console.error('Failed to fetch clinic settings:', error);
        }

        // Fetch stats
        if (token) {
            try {
                const statsData = await getClinicStats(token);
                setStats(statsData);
            } catch (error) {
                console.error('Failed to fetch clinic stats:', error);
            }
        }

      } catch (error) {
        console.error('General error fetching dashboard data:', error);
      } finally {
        setIsLoadingClinic(false);
        setIsLoadingStats(false);
      }
    };

    if (isAuthenticated && user) {
      fetchData();
    }
  }, [isAuthenticated, user]);

  if (isLoading || !user) {
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
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumbs />

        {/* Flash Message */}
        {flashMessage && (
          <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-lg flex items-center justify-between animate-fade-in">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-teal-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-teal-800 font-medium">{flashMessage}</p>
            </div>
            <button
              onClick={() => setFlashMessage('')}
              className="text-teal-600 hover:text-teal-800"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Hero Section */}
        <DashboardHero
          title={
            language === 'ar'
              ? `مرحباً، ${user.name} 👋`
              : `Welcome, ${user.name} 👋`
          }
          subtitle={today}
          description={
             isLoadingClinic 
              ? '...' 
              : (clinicData?.name || clinic?.name || '') + ' - ' + (clinicData?.address || clinic?.address || '')
          }
          secondaryAction={
            <button 
              onClick={() => router.push('/clinic/management-staff')}
              className="flex items-center gap-2 text-white hover:text-teal-50 transition-colors"
            >
              <span className="font-semibold">
                {t.managementStaff || (language === 'ar' ? 'إدارة الطاقم' : 'Manage Staff')}
              </span>
              <svg className="w-4 h-4 rtl:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          }
        />

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
             label={t.todaysAppointments || (language === 'ar' ? 'مواعيد اليوم' : "Today's Appointments")}
             value={isLoadingStats ? '...' : (stats?.today_appointments_count || 0)}
             sub={language === 'ar' ? 'موعد مسجل' : 'Registered appointments'}
          />
          <StatCard
             label={t.activeDoctors || (language === 'ar' ? 'الأطباء النشطين' : 'Active Doctors')}
             value={isLoadingStats ? '...' : (stats?.active_doctors_count || 0)}
             sub={language === 'ar' ? 'طبيب متاح' : 'Available doctors'}
          />
          <StatCard
             label={t.totalPatients || (language === 'ar' ? 'إجمالي المرضى' : 'Total Patients')}
             value={isLoadingStats ? '...' : (stats?.total_patients_count || 0)}
             sub={language === 'ar' ? 'ملف طبي' : 'Medical records'}
          />
          <StatCard
             label={t.thisMonth || (language === 'ar' ? 'هذا الشهر' : 'This Month')}
             value={isLoadingStats ? '...' : `₪${stats?.monthly_revenue || 0}`}
             sub={language === 'ar' ? 'إيرادات' : 'Revenue'}
          />
        </section>

        {/* Quick Actions */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-4 sm:px-5 py-3 border-b flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t.clinicManagement || (language === 'ar' ? 'إدارة العيادة' : 'Clinic Management')}
              </h3>
            </div>
          </div>

          <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <QuickActionCard
              label={t.addStaff || (language === 'ar' ? 'إضافة موظف' : 'Add Staff')}
              title={t.addStaff || (language === 'ar' ? 'إضافة موظف جديد' : 'Add New Staff')}
              description={t.doctorsSecretaries || (language === 'ar' ? 'أطباء وسكرتاريا' : 'Doctors & Secretaries')}
              href="/clinic/add-staff"
              color="blue"
            />
            
            <QuickActionCard
              label={t.managementStaff || (language === 'ar' ? 'طاقم الإدارة' : 'Management Staff')}
              title={t.managementStaff || (language === 'ar' ? 'إدارة الموظفين' : 'Manage Staff')}
              description={t.manageEmployees || (language === 'ar' ? 'إدارة حسابات الموظفين' : 'Manage employee accounts')}
              href="/clinic/management-staff"
              color="orange"
            />

            <QuickActionCard
              label={t.manageSchedule || (language === 'ar' ? 'جدول الدوام' : 'Manage Schedule')}
              title={t.manageSchedule || (language === 'ar' ? 'تنسيق المواعيد' : 'Coordinate Schedule')}
              description={t.doctorAvailability || (language === 'ar' ? 'أوقات توفر الأطباء' : 'Doctor availability times')}
              href="/clinic/manage-schedule"
              color="teal"
            />

            <QuickActionCard
              label={t.reports || (language === 'ar' ? 'التقارير' : 'Reports')}
              title={t.reports || (language === 'ar' ? 'التقارير والإحصائيات' : 'Reports & Analytics')}
              description={t.clinicAnalytics || (language === 'ar' ? 'تحليل أداء العيادة' : 'Analyze clinic performance')}
              href="/clinic/reports" // Assuming a route
              color="purple"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
