'use client';

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRoleGuard } from '@/lib/roleGuard';

interface User {
  user_id: number;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
  created_at: string;
}

interface Clinic {
  clinic_id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  status: 'Active' | 'Inactive';
  subscription_plan: 'Basic' | 'Standard' | 'Premium';
  subscription_start: string;
  subscription_end: string;
  logo_url?: string;
  created_at: string;
}

interface ClinicAnalytics {
  clinic: Clinic;
  users: {
    doctors: User[];
    patients: User[];
    secretaries: User[];
    managers: User[];
  };
  user_counts: {
    total: number;
    doctors: number;
    patients: number;
    secretaries: number;
    managers: number;
    active: number;
    inactive: number;
  };
  appointment_stats: {
    total: number;
    requested: number;
    pending: number;
    approved: number;
    completed: number;
    cancelled: number;
    rejected: number;
  };
  subscription: {
    plan: string;
    start_date: string;
    end_date: string;
    days_remaining: number;
    is_active: boolean;
    is_expiring_soon: boolean;
  } | null;
}

type UserRole = 'doctors' | 'patients' | 'secretaries' | 'managers';

export default function ClinicAnalytics() {
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();
  const params = useParams();
  const clinicId = params.id as string;

  useRoleGuard(['Admin']);

  const [analytics, setAnalytics] = useState<ClinicAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<UserRole>('doctors');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && token && clinicId) {
      fetchAnalytics();
    }
  }, [isAuthenticated, token, clinicId]);

  const fetchAnalytics = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/clinics/${clinicId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setAnalytics(data);
      } else {
        throw new Error(data.message || 'Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Failed to fetch clinic analytics:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to load clinic data'
      );
    } finally {
      setLoading(false);
    }
  };

  const getFilteredUsers = (users: User[]) => {
    if (!searchTerm) return users;
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === 'ar' ? 'ar-EG' : 'en-US',
      {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }
    );
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-800 font-medium">{error}</p>
            <button
              onClick={() => router.push('/platform/clinics')}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              {language === 'ar' ? 'العودة إلى القائمة' : 'Back to List'}
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (loading || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const { clinic, users, user_counts, appointment_stats, subscription } = analytics;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumbs
          customItems={[
            { label: language === 'ar' ? 'لوحة التحكم' : 'Dashboard', href: '/platform/dashboard' },
            { label: language === 'ar' ? 'العيادات' : 'Clinics', href: '/platform/clinics' },
            { label: clinic.name, href: `/platform/clinics/${clinic.clinic_id}/analytics` },
          ]}
        />
        {/* Header with Clinic Info */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {clinic.logo_url && (
                <img
                  src={clinic.logo_url}
                  alt={clinic.name}
                  className="w-16 h-16 rounded-xl object-cover"
                />
              )}
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{clinic.name}</h1>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      clinic.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {clinic.status}
                  </span>
                  <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700">
                    {clinic.subscription_plan}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{clinic.address}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{clinic.email}</span>
                  <span>•</span>
                  <span>{clinic.phone}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push('/platform/clinics')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              {language === 'ar' ? 'رجوع' : 'Back'}
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Users */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {language === 'ar' ? 'إجمالي المستخدمين' : 'Total Users'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {user_counts.total}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {user_counts.active} {language === 'ar' ? 'نشط' : 'active'}
                </p>
              </div>
              <div className="w-12 h-12 bg-teal-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Total Appointments */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {language === 'ar' ? 'إجمالي المواعيد' : 'Total Appointments'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {appointment_stats.total}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {appointment_stats.completed} {language === 'ar' ? 'مكتمل' : 'completed'}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Doctors */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {language === 'ar' ? 'الأطباء' : 'Doctors'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {user_counts.doctors}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Patients */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {language === 'ar' ? 'المرضى' : 'Patients'}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {user_counts.patients}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Info */}
        {subscription && (
          <div className={`rounded-xl border p-5 ${
            subscription.is_expiring_soon
              ? 'bg-amber-50 border-amber-200'
              : subscription.is_active
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className={`font-semibold ${
                  subscription.is_expiring_soon
                    ? 'text-amber-900'
                    : subscription.is_active
                    ? 'text-emerald-900'
                    : 'text-red-900'
                }`}>
                  {language === 'ar' ? 'حالة الاشتراك' : 'Subscription Status'}
                </h3>
                <p className={`text-sm mt-1 ${
                  subscription.is_expiring_soon
                    ? 'text-amber-700'
                    : subscription.is_active
                    ? 'text-emerald-700'
                    : 'text-red-700'
                }`}>
                  {formatDate(subscription.start_date)} - {formatDate(subscription.end_date)}
                </p>
              </div>
              <div className="text-right">
                <p className={`text-2xl font-bold ${
                  subscription.is_expiring_soon
                    ? 'text-amber-900'
                    : subscription.is_active
                    ? 'text-emerald-900'
                    : 'text-red-900'
                }`}>
                  {subscription.days_remaining}
                </p>
                <p className={`text-xs ${
                  subscription.is_expiring_soon
                    ? 'text-amber-700'
                    : subscription.is_active
                    ? 'text-emerald-700'
                    : 'text-red-700'
                }`}>
                  {language === 'ar' ? 'يوم متبقي' : 'days remaining'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Appointment Statistics */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            {language === 'ar' ? 'إحصائيات المواعيد' : 'Appointment Statistics'}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-slate-700 rounded-lg">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{appointment_stats.total}</p>
              <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                {language === 'ar' ? 'الإجمالي' : 'Total'}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-700">{appointment_stats.requested}</p>
              <p className="text-xs text-purple-600 mt-1">
                {language === 'ar' ? 'مطلوب' : 'Requested'}
              </p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-700">{appointment_stats.pending}</p>
              <p className="text-xs text-yellow-600 mt-1">
                {language === 'ar' ? 'قيد الموافقة' : 'Pending Approval'}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-700">{appointment_stats.approved}</p>
              <p className="text-xs text-blue-600 mt-1">
                {language === 'ar' ? 'موافق عليه' : 'Approved'}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-700">{appointment_stats.completed}</p>
              <p className="text-xs text-green-600 mt-1">
                {language === 'ar' ? 'مكتمل' : 'Completed'}
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-700">{appointment_stats.cancelled}</p>
              <p className="text-xs text-red-600 mt-1">
                {language === 'ar' ? 'ملغى' : 'Cancelled'}
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-700">{appointment_stats.rejected}</p>
              <p className="text-xs text-orange-600 mt-1">
                {language === 'ar' ? 'مرفوض' : 'Rejected'}
              </p>
            </div>
          </div>
        </div>

        {/* Users Section */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-slate-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {language === 'ar' ? 'المستخدمون' : 'Users'}
            </h2>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-slate-700">
            <div className="flex overflow-x-auto">
              {(['doctors', 'patients', 'secretaries', 'managers'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => setActiveTab(role)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                    activeTab === role
                      ? 'border-teal-600 text-teal-600'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  {language === 'ar'
                    ? role === 'doctors'
                      ? 'الأطباء'
                      : role === 'patients'
                      ? 'المرضى'
                      : role === 'secretaries'
                      ? 'السكرتارية'
                      : 'المديرون'
                    : role.charAt(0).toUpperCase() + role.slice(1)}{' '}
                  ({users[role].length})
                </button>
              ))}
            </div>
          </div>

          {/* Search */}
          <div className="p-4 bg-gray-50 dark:bg-slate-700">
            <input
              type="text"
              placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 dark:bg-slate-600 dark:text-white dark:placeholder-gray-400"
            />
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    {language === 'ar' ? 'الاسم' : 'Name'}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    {language === 'ar' ? 'الهاتف' : 'Phone'}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                    {language === 'ar' ? 'تاريخ التسجيل' : 'Joined'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                {getFilteredUsers(users[activeTab]).length > 0 ? (
                  getFilteredUsers(users[activeTab]).map((user) => (
                    <tr key={user.user_id} className="hover:bg-gray-50 dark:hover:bg-slate-700 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white text-center">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-center">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-center">
                        {user.phone || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            user.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-center">
                        {formatDate(user.created_at)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                      {language === 'ar' ? 'لا يوجد مستخدمون' : 'No users found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
