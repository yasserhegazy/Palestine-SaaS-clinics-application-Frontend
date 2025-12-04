'use client';

import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import ConfirmModal from '@/components/ConfirmModal';
import Toast from '@/components/Toast';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRoleGuard } from '@/lib/roleGuard';

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
  users_count: number;
  created_at: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export default function ClinicsManagement() {
  const { user, token, isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();

  useRoleGuard(['Admin']);

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState<PaginationMeta>({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
  });

  // Modal and Toast states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({ isOpen: false, message: '', type: 'success' });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchClinics = async (page = 1) => {
    if (!token) return;

    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: pagination.per_page.toString(),
        status: statusFilter,
        search: searchTerm,
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/clinics?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }

      const data = await response.json();

      if (data.success) {
        setClinics(data.clinics.data || []);
        setPagination({
          current_page: data.clinics.current_page,
          last_page: data.clinics.last_page,
          per_page: data.clinics.per_page,
          total: data.clinics.total,
        });
      }
    } catch (error) {
      console.error('Failed to fetch clinics:', error);
      setClinics([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search term
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (isAuthenticated && token) {
        fetchClinics();
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(debounceTimer);
  }, [isAuthenticated, token, statusFilter, searchTerm]);

  // Fetch immediately when status filter changes
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchClinics();
    }
  }, [statusFilter]);

  const openConfirmModal = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setShowConfirmModal(true);
  };

  const handleToggleStatus = async () => {
    if (!token || !selectedClinic) return;

    const clinicId = selectedClinic.clinic_id;

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/admin/clinics/${clinicId}/toggle-status`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON');
      }

      const data = await response.json();

      if (data.success) {
        // Update the clinic in the list
        setClinics((prev) =>
          prev.map((clinic) =>
            clinic.clinic_id === clinicId ? { ...clinic, status: data.clinic.status } : clinic
          )
        );
        
        setToast({
          isOpen: true,
          message:
            language === 'ar'
              ? `تم ${data.clinic.status === 'Active' ? 'تفعيل' : 'تعطيل'} العيادة بنجاح`
              : `Clinic ${data.clinic.status === 'Active' ? 'activated' : 'deactivated'} successfully`,
          type: 'success',
        });
      } else {
        throw new Error(data.message || 'Failed to toggle status');
      }
    } catch (error) {
      console.error('Failed to toggle clinic status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setToast({
        isOpen: true,
        message:
          language === 'ar'
            ? `فشل في تغيير حالة العيادة: ${errorMessage}`
            : `Failed to toggle clinic status: ${errorMessage}`,
        type: 'error',
      });
    }
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumbs />
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'ar' ? 'إدارة العيادات' : 'Manage Clinics'}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {language === 'ar'
                ? 'عرض وإدارة جميع العيادات المسجلة في المنصة'
                : 'View and manage all registered clinics on the platform'}
            </p>
          </div>
          <button
            onClick={() => router.push('/platform/clinics/new')}
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {language === 'ar' ? 'إضافة عيادة جديدة' : 'Add New Clinic'}
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'البحث' : 'Search'}
              </label>
              <input
                type="text"
                placeholder={
                  language === 'ar' ? 'ابحث عن عيادة...' : 'Search for a clinic...'
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">
                {language === 'ar' ? 'الحالة' : 'Status'}
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">{language === 'ar' ? 'الكل' : 'All'}</option>
                <option value="Active">{language === 'ar' ? 'نشط' : 'Active'}</option>
                <option value="Inactive">
                  {language === 'ar' ? 'غير نشط' : 'Inactive'}
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Clinics Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mx-auto">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-5 py-3 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ar' ? 'اسم العيادة' : 'Clinic Name'}
                  </th>
                  <th className="px-4 sm:px-5 py-3 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ar' ? 'الموقع' : 'Location'}
                  </th>
                  <th className="px-4 sm:px-5 py-3 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ar' ? 'الخطة' : 'Plan'}
                  </th>
                  <th className="px-4 sm:px-5 py-3 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ar' ? 'المستخدمين' : 'Users'}
                  </th>
                  <th className="px-4 sm:px-5 py-3 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ar' ? 'الحالة' : 'Status'}
                  </th>
                  <th className="px-4 sm:px-5 py-3 text-center text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                    {language === 'ar' ? 'الإجراءات' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr key="loading">
                    <td
                      colSpan={6}
                      className="px-4 sm:px-5 py-8 text-center text-sm text-gray-500"
                    >
                      {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
                    </td>
                  </tr>
                ) : clinics.length > 0 ? (
                  clinics.map((clinic, index) => (
                    <tr key={`clinic-${clinic.clinic_id || index}`} className="hover:bg-gray-50 transition">
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-center">
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {clinic.name}
                          </div>
                          <div className="text-xs text-gray-500">{clinic.email}</div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-xs text-gray-500 text-center">
                        {clinic.address}
                      </td>
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-center">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700">
                          {clinic.subscription_plan}
                        </span>
                      </td>
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-xs text-gray-500 text-center">
                        {clinic.users_count}
                      </td>
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            clinic.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {clinic.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-5 py-3 whitespace-nowrap text-xs">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openConfirmModal(clinic)}
                            className={`px-3 py-1 rounded-lg font-medium transition ${
                              clinic.status === 'Active'
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {clinic.status === 'Active'
                              ? language === 'ar'
                                ? 'تعطيل'
                                : 'Deactivate'
                              : language === 'ar'
                              ? 'تفعيل'
                              : 'Activate'}
                          </button>
                          <button
                            onClick={() => router.push(`/platform/clinics/${clinic.clinic_id}/analytics`)}
                            className="px-3 py-1 rounded-lg font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                          >
                            {language === 'ar' ? 'عرض' : 'View'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr key="empty">
                    <td
                      colSpan={6}
                      className="px-4 sm:px-5 py-8 text-center text-sm text-gray-500"
                    >
                      {language === 'ar' ? 'لا توجد عيادات' : 'No clinics found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.last_page > 1 && (
            <div className="px-4 sm:px-5 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-xs text-gray-500">
                {language === 'ar'
                  ? `عرض ${(pagination.current_page - 1) * pagination.per_page + 1} إلى ${Math.min(
                      pagination.current_page * pagination.per_page,
                      pagination.total
                    )} من ${pagination.total}`
                  : `Showing ${(pagination.current_page - 1) * pagination.per_page + 1} to ${Math.min(
                      pagination.current_page * pagination.per_page,
                      pagination.total
                    )} of ${pagination.total}`}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchClinics(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {language === 'ar' ? 'السابق' : 'Previous'}
                </button>
                <button
                  onClick={() => fetchClinics(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {language === 'ar' ? 'التالي' : 'Next'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleToggleStatus}
        title={
          selectedClinic?.status === 'Active'
            ? language === 'ar'
              ? 'تعطيل العيادة'
              : 'Deactivate Clinic'
            : language === 'ar'
            ? 'تفعيل العيادة'
            : 'Activate Clinic'
        }
        message={
          selectedClinic?.status === 'Active'
            ? language === 'ar'
              ? `هل أنت متأكد من تعطيل عيادة "${selectedClinic?.name}"؟ لن يتمكن المستخدمون من الوصول إلى النظام.`
              : `Are you sure you want to deactivate "${selectedClinic?.name}"? Users will not be able to access the system.`
            : language === 'ar'
            ? `هل أنت متأكد من تفعيل عيادة "${selectedClinic?.name}"؟ سيتمكن المستخدمون من الوصول إلى النظام.`
            : `Are you sure you want to activate "${selectedClinic?.name}"? Users will be able to access the system.`
        }
        confirmText={
          selectedClinic?.status === 'Active'
            ? language === 'ar'
              ? 'تعطيل'
              : 'Deactivate'
            : language === 'ar'
            ? 'تفعيل'
            : 'Activate'
        }
        cancelText={language === 'ar' ? 'إلغاء' : 'Cancel'}
        type={selectedClinic?.status === 'Active' ? 'warning' : 'info'}
      />

      {/* Toast Notification */}
      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
}
