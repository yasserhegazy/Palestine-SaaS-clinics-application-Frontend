'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import Breadcrumbs from '@/components/Breadcrumbs';
import { getClinicSettings, updateClinicSettings, type ClinicSettings } from '@/lib/api/clinicSettings'; 
import {
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CreditCardIcon,
  CheckCircleIcon,
  PhotoIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';

// Connect to the API endpoint to fetch real data


export default function ClinicSettingsPage() {
  const { clinic, user } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];

  // State management
  const [clinicData, setClinicData] = useState<ClinicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    subscription_plan: 'Premium' as 'Basic' | 'Standard' | 'Premium',
    status: 'Active' as 'Active' | 'Inactive',
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fetch clinic settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getClinicSettings();
        console.log('Fetched clinic settings:', data);
        console.log('Logo URL from fetch:', data.logo_url);
        setClinicData(data);
        setFormData({
          name: data.name,
          address: data.address,
          phone: data.phone,
          email: data.email,
          subscription_plan: data.subscription_plan,
          status: data.status,
        });
        if (data.logo_url) {
          console.log('Setting logo preview to:', data.logo_url);
          setLogoPreview(data.logo_url);
        } else {
          console.log('No logo_url found in response');
        }
      } catch (err: any) {
        console.error('Error fetching clinic settings:', err);
        setError(err.message || 'Failed to load clinic settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    
    try {
      const updatedClinic = await updateClinicSettings({
        ...formData,
        logo: selectedFile,
      });
      
      console.log('Updated clinic data:', updatedClinic);
      console.log('Logo URL:', updatedClinic.logo_url);
      
      setClinicData(updatedClinic);
      setFormData({
        name: updatedClinic.name,
        address: updatedClinic.address,
        phone: updatedClinic.phone,
        email: updatedClinic.email,
        subscription_plan: updatedClinic.subscription_plan,
        status: updatedClinic.status,
      });
      setLogoPreview(updatedClinic.logo_url || null);
      setSelectedFile(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error updating clinic settings:', err);
      setError(err.message || 'Failed to update clinic settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (clinicData) {
      setFormData({
        name: clinicData.name,
        address: clinicData.address,
        phone: clinicData.phone,
        email: clinicData.email,
        subscription_plan: clinicData.subscription_plan,
        status: clinicData.status,
      });
      setLogoPreview(clinicData.logo_url || null);
      setSelectedFile(null);
    }
  };

  const isArabic = language === 'ar';

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900" dir={isArabic ? 'rtl' : 'ltr'}>
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-green-50 border border-green-200 rounded-xl shadow-lg p-4 flex items-center gap-3">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">{isArabic ? 'تم تحديث الإعدادات!' : 'Settings Updated!'}</p>
              <p className="text-sm text-green-700">{isArabic ? 'تم حفظ إعدادات العيادة بنجاح.' : 'Your clinic settings have been saved successfully.'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-red-50 border border-red-200 rounded-xl shadow-lg p-4 flex items-center gap-3">
            <InformationCircleIcon className="h-6 w-6 text-red-600" />
            <div>
              <p className="font-semibold text-red-900">{isArabic ? 'خطأ' : 'Error'}</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumbs />

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{t.settings || (isArabic ? 'إعدادات العيادة' : 'Clinic Settings')}</h1>
            <p className="text-sm text-gray-500 mt-1">{isArabic ? 'إدارة معلومات العيادة والتفضيلات' : 'Manage your clinic information and preferences'}</p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all duration-200 text-sm font-medium flex items-center gap-2"
          >
            {t.back || 'Back'}
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <svg className="animate-spin h-12 w-12 text-teal-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-gray-600">{isArabic ? 'جاري تحميل إعدادات العيادة...' : 'Loading clinic settings...'}</p>
            </div>
          </div>
        ) : (
        <>
        <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
          {/* Clinic Information Card */}
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-teal-50 to-blue-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-teal-600 rounded-lg">
                  <BuildingOfficeIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{isArabic ? 'معلومات العيادة' : 'Clinic Information'}</h2>
                  <p className="text-sm text-gray-600">{isArabic ? 'تحديث التفاصيل الأساسية للعيادة' : "Update your clinic's basic details"}</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Logo Upload Section */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex-shrink-0">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isArabic ? 'شعار العيادة' : 'Clinic Logo'}
                  </label>
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 group-hover:border-teal-500 transition-colors flex items-center justify-center overflow-hidden bg-gray-50">
                      {logoPreview ? (
                        <img 
                          src={logoPreview} 
                          alt="Logo preview" 
                          className="w-full h-full object-cover"
                          onLoad={() => console.log('Image loaded successfully:', logoPreview)}
                          onError={(e) => console.error('Image failed to load:', logoPreview, e)}
                        />
                      ) : (
                        <div className="text-center">
                          <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                          <p className="text-xs text-gray-500">{isArabic ? 'رفع الشعار' : 'Upload Logo'}</p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/svg+xml"
                      onChange={handleLogoChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {isArabic ? 'الحد الأقصى 2 ميجابايت • JPG, PNG, GIF, SVG' : 'Max 2MB • JPG, PNG, GIF, SVG'}
                  </p>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Clinic Name */}
                  <div className="md:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.clinicName || (isArabic ? 'اسم العيادة' : 'Clinic Name')} *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="pl-10 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                        placeholder={isArabic ? 'أدخل اسم العيادة' : 'Enter clinic name'}
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                      {isArabic ? 'العنوان' : 'Address'} *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPinIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="address"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleInputChange}
                        className="pl-10 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                        placeholder={isArabic ? 'أدخل عنوان العيادة' : 'Enter clinic address'}
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.phone || (isArabic ? 'رقم الهاتف' : 'Phone Number')} *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="pl-10 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                        placeholder="+970599123456"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      {t.email || (isArabic ? 'البريد الإلكتروني' : 'Email Address')} *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10 w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all"
                        placeholder="clinic@example.com"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription & Status Card */}
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <CreditCardIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{isArabic ? 'الاشتراك والحالة' : 'Subscription & Status'}</h2>
                  <p className="text-sm text-gray-600">{isArabic ? 'إدارة خطة الاشتراك وحالة العيادة' : 'Manage your subscription plan and clinic status'}</p>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Subscription Plan */}
              <div>
                <label htmlFor="subscription_plan" className="block text-sm font-medium text-gray-700 mb-2">
                  {isArabic ? 'خطة الاشتراك' : 'Subscription Plan'}
                </label>
                <div className="relative">
                  <select
                    id="subscription_plan"
                    name="subscription_plan"
                    value={formData.subscription_plan}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all appearance-none cursor-pointer bg-white"
                  >
                    <option value="Basic">{t.basicPlan || (isArabic ? 'الخطة الأساسية' : 'Basic Plan')}</option>
                    <option value="Standard">{t.proPlan || (isArabic ? 'الخطة المتقدمة' : 'Standard Plan')}</option>
                    <option value="Premium">{t.enterprisePlan || (isArabic ? 'الخطة المميزة' : 'Premium Plan')}</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
                <div className="mt-2 flex items-start gap-2">
                  <InformationCircleIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-gray-500">
                    {formData.subscription_plan === 'Basic' && (isArabic ? 'حتى 50 مريض، 2 طبيب' : 'Up to 50 patients, 2 doctors')}
                    {formData.subscription_plan === 'Standard' && (isArabic ? 'حتى 200 مريض، 5 أطباء' : 'Up to 200 patients, 5 doctors')}
                    {formData.subscription_plan === 'Premium' && (isArabic ? 'عدد غير محدود من المرضى والأطباء' : 'Unlimited patients and doctors')}
                  </p>
                </div>
              </div>

              {/* Clinic Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  {t.status || (isArabic ? 'حالة العيادة' : 'Clinic Status')}
                </label>
                <div className="relative">
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all appearance-none cursor-pointer bg-white"
                  >
                    <option value="Active">{t.active || (isArabic ? 'نشط' : 'Active')}</option>
                    <option value="Inactive">{isArabic ? 'غير نشط' : 'Inactive'}</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                  </div>
                </div>
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                    formData.status === 'Active' 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      formData.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                    }`}></span>
                    {formData.status === 'Active' ? (isArabic ? 'العيادة تقبل المرضى' : 'Clinic is accepting patients') : (isArabic ? 'العيادة لا تقبل المرضى' : 'Clinic is not accepting patients')}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={handleCancel}
              className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-all"
            >
              {t.cancel || (isArabic ? 'إلغاء' : 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-teal-600 text-white font-medium hover:bg-teal-700 shadow-lg shadow-teal-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isArabic ? 'جاري الحفظ...' : 'Saving...'}
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5" />
                  {t.save || (isArabic ? 'حفظ التغييرات' : 'Save Changes')}
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex gap-3">
            <InformationCircleIcon className="h-6 w-6 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">{isArabic ? 'معلومات هامة' : 'Important Information'}</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• {isArabic ? 'التغييرات على معلومات العيادة ستنعكس على النظام بأكمله' : 'Changes to clinic information will be reflected across the entire system'}</li>
                <li>• {isArabic ? 'يجب أن يكون البريد الإلكتروني فريداً وسيستخدم لإشعارات النظام' : 'Email address must be unique and will be used for system notifications'}</li>
                <li>• {isArabic ? 'تعيين الحالة إلى "غير نشط" سيمنع تسجيلات المرضى الجدد' : 'Setting status to "Inactive" will prevent new patient registrations'}</li>
                <li>• {isArabic ? 'قد يستغرق ظهور تغييرات الشعار بضع لحظات في النظام' : 'Logo changes may take a few moments to appear throughout the system'}</li>
              </ul>
            </div>
          </div>
        </div>
        </>
        )}
      </main>
    </div>
  );
}
