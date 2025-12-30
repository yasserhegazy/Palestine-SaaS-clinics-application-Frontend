'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { translations } from '@/lib/translations';
import Breadcrumbs from '@/components/Breadcrumbs';
import { useRoleGuard } from '@/lib/roleGuard';
import Toast from '@/components/Toast';

type PlanKey = 'Basic' | 'Standard' | 'Premium';

interface PlanConfig {
  price: number;
  doctors: number | 'Unlimited';
  patients: number | 'Unlimited';
}

interface PlatformSettings {
  platformName: string;
  logoUrl: string;
  supportEmail: string;
  supportPhone: string;
  baseUrl: string;
  allowPublicRegistration: boolean;
  requireApproval: boolean;
  defaultPlan: PlanKey;
  welcomeSender: string;
  plans: Record<PlanKey, PlanConfig>;
  inactivePolicy: 'block' | 'readonly';
  warnDays: number;
  autoDisable: boolean;
  defaultLanguage: 'en' | 'ar';
  timezone: string;
  forceRtl: boolean;
  notifyRegistration: boolean;
  notifyExpiry: boolean;
}

const initialSettings: PlatformSettings = {
  platformName: 'Palestine Clinics SaaS',
  logoUrl: '',
  supportEmail: 'support@platform.com',
  supportPhone: '+970 599 000 000',
  baseUrl: 'http://localhost:3000',
  allowPublicRegistration: true,
  requireApproval: true,
  defaultPlan: 'Standard',
  welcomeSender: 'Palestine Clinics Team',
  plans: {
    Basic: { price: 29, doctors: 2, patients: 50 },
    Standard: { price: 59, doctors: 5, patients: 200 },
    Premium: { price: 99, doctors: 'Unlimited', patients: 'Unlimited' },
  },
  inactivePolicy: 'block',
  warnDays: 10,
  autoDisable: true,
  defaultLanguage: 'en',
  timezone: 'Asia/Gaza',
  forceRtl: false,
  notifyRegistration: true,
  notifyExpiry: true,
};

export default function PlatformSettingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();

  useRoleGuard([], true);

  const [settings, setSettings] = useState<PlatformSettings>(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    isOpen: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ isOpen: false, message: '', type: 'success' });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    setTimeout(() => {
      setSettings(initialSettings);
      setLoading(false);
    }, 250);
  }, []);

  const isArabic = language === 'ar';

  const handleChange = (key: keyof PlatformSettings, value: PlatformSettings[keyof PlatformSettings]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handlePlanChange = (plan: PlanKey, key: keyof PlanConfig, value: PlanConfig[keyof PlanConfig]) => {
    setSettings((prev) => ({
      ...prev,
      plans: {
        ...prev.plans,
        [plan]: { ...prev.plans[plan], [key]: value },
      },
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await new Promise((res) => setTimeout(res, 600));
      setToast({
        isOpen: true,
        message: isArabic ? 'تم حفظ إعدادات المنصة بنجاح.' : 'Platform settings saved successfully.',
        type: 'success',
      });
    } catch (error) {
      console.error('Failed to save settings', error);
      setToast({
        isOpen: true,
        message: isArabic ? 'تعذر حفظ الإعدادات.' : 'Failed to save settings.',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Breadcrumbs />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {isArabic ? 'إعدادات المنصة' : 'Platform Settings'}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {isArabic
                ? 'تهيئة الهوية والدعم والتسجيل والاشتراكات لجميع العيادات.'
                : 'Configure identity, onboarding, plans, and policies across all clinics.'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => router.push('/platform/clinics')}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            >
              {isArabic ? 'إدارة العيادات' : 'Manage Clinics'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/platform/reports')}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            >
              {t.viewReports || (isArabic ? 'عرض التقارير' : 'View Reports')}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identity & Support */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isArabic ? 'هوية المنصة والدعم' : 'Platform Identity & Support'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {isArabic ? 'الشعار ومعلومات التواصل والدعم للمنصة.' : 'Branding and support contact details for the platform.'}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {isArabic ? 'اسم المنصة' : 'Platform Name'}
                </label>
                <input
                  type="text"
                  value={settings.platformName}
                  onChange={(e) => handleChange('platformName', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {isArabic ? 'رابط الشعار' : 'Logo URL'}
                </label>
                <input
                  type="url"
                  value={settings.logoUrl}
                  onChange={(e) => handleChange('logoUrl', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {isArabic ? 'بريد الدعم' : 'Support Email'}
                </label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => handleChange('supportEmail', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {isArabic ? 'هاتف الدعم' : 'Support Phone'}
                </label>
                <input
                  type="tel"
                  value={settings.supportPhone}
                  onChange={(e) => handleChange('supportPhone', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {isArabic ? 'عنوان المنصة الأساسي' : 'Base URL'}
                </label>
                <input
                  type="url"
                  value={settings.baseUrl}
                  onChange={(e) => handleChange('baseUrl', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 text-sm"
                />
              </div>
            </div>
          </section>

          {/* Onboarding & Access */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isArabic ? 'التسجيل والوصول' : 'Onboarding & Access'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {isArabic ? 'تحكم في فتح نموذج الانضمام والموافقة والخطة الافتراضية.' : 'Control the join flow, approvals, and default plan.'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {isArabic ? 'فتح نموذج الانضمام' : 'Open public registration'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {isArabic ? 'السماح للعيادات بالتقديم عبر /register/clinic.' : 'Allow clinics to apply via /register/clinic.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange('allowPublicRegistration', !settings.allowPublicRegistration)}
                  className={`w-12 h-7 rounded-full transition flex items-center ${settings.allowPublicRegistration ? 'bg-teal-600' : 'bg-gray-300 dark:bg-slate-600'}`}
                >
                  <span
                    className={`h-5 w-5 bg-white rounded-full shadow transform transition ${settings.allowPublicRegistration ? 'translate-x-5' : 'translate-x-1'}`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {isArabic ? 'يتطلب موافقة يدوية' : 'Require manual approval'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {isArabic ? 'إبقاء الطلبات قيد المراجعة حتى الموافقة.' : 'Keep new clinic requests pending until approved.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange('requireApproval', !settings.requireApproval)}
                  className={`w-12 h-7 rounded-full transition flex items-center ${settings.requireApproval ? 'bg-teal-600' : 'bg-gray-300 dark:bg-slate-600'}`}
                >
                  <span
                    className={`h-5 w-5 bg-white rounded-full shadow transform transition ${settings.requireApproval ? 'translate-x-5' : 'translate-x-1'}`}
                  />
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {isArabic ? 'الخطة الافتراضية' : 'Default plan for new clinics'}
                </label>
                <select
                  value={settings.defaultPlan}
                  onChange={(e) => handleChange('defaultPlan', e.target.value as PlanKey)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                >
                  <option value="Basic">{t.basicPlan || (isArabic ? 'الخطة الأساسية' : 'Basic')}</option>
                  <option value="Standard">{t.proPlan || (isArabic ? 'الخطة القياسية' : 'Standard')}</option>
                  <option value="Premium">{t.enterprisePlan || (isArabic ? 'الخطة المميزة' : 'Premium')}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {isArabic ? 'اسم المرسل في الترحيب' : 'Welcome sender name'}
                </label>
                <input
                  type="text"
                  value={settings.welcomeSender}
                  onChange={(e) => handleChange('welcomeSender', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                  placeholder={isArabic ? 'مثال: فريق المنصة' : 'e.g. Platform Team'}
                />
              </div>
            </div>
          </section>

          {/* Plans */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isArabic ? 'الخطط والأسعار' : 'Subscription Plans'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {isArabic ? 'تحكم بالحدود والأسعار المستخدمة مع العيادات.' : 'Control limits and pricing applied to clinics.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {isArabic ? 'تعطيل تلقائي عند انتهاء الاشتراك' : 'Auto-disable when expired'}
                </label>
                <button
                  type="button"
                  onClick={() => handleChange('autoDisable', !settings.autoDisable)}
                  className={`w-12 h-7 rounded-full transition flex items-center ${settings.autoDisable ? 'bg-teal-600' : 'bg-gray-300 dark:bg-slate-600'}`}
                >
                  <span
                    className={`h-5 w-5 bg-white rounded-full shadow transform transition ${settings.autoDisable ? 'translate-x-5' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['Basic', 'Standard', 'Premium'] as PlanKey[]).map((plan) => {
                const planData = settings.plans[plan];
                return (
                  <div key={plan} className="rounded-xl border border-gray-200 dark:border-slate-700 p-4 bg-gray-50/60 dark:bg-slate-800">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white">{plan}</h3>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {language === 'ar' ? 'للعيادات الجديدة' : 'For new clinics'}
                      </span>
                    </div>
                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                        {isArabic ? 'السعر الشهري ($)' : 'Monthly price ($)'}
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={planData.price}
                        onChange={(e) => handlePlanChange(plan, 'price', Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                      />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                          {isArabic ? 'الأطباء' : 'Doctors'}
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={planData.doctors === 'Unlimited' ? '' : planData.doctors}
                          onChange={(e) =>
                            handlePlanChange(plan, 'doctors', e.target.value === '' ? 'Unlimited' : Number(e.target.value))
                          }
                          placeholder={isArabic ? 'غير محدود' : 'Unlimited'}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                          {isArabic ? 'المرضى' : 'Patients'}
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={planData.patients === 'Unlimited' ? '' : planData.patients}
                          onChange={(e) =>
                            handlePlanChange(plan, 'patients', e.target.value === '' ? 'Unlimited' : Number(e.target.value))
                          }
                          placeholder={isArabic ? 'غير محدود' : 'Unlimited'}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                        />
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">
                      {plan === 'Basic'
                        ? isArabic
                          ? 'حتى 50 مريض و2 طبيب حسب العيادة.'
                          : 'Up to 50 patients and 2 doctors per clinic.'
                        : plan === 'Standard'
                        ? isArabic
                          ? 'حتى 200 مريض و5 أطباء.'
                          : 'Up to 200 patients and 5 doctors.'
                        : isArabic
                        ? 'عدد غير محدود من المرضى والأطباء.'
                        : 'Unlimited patients and doctors.'}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Policies */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isArabic ? 'سياسات التعطيل والتنبيه' : 'Clinic Status Policies'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {isArabic ? 'ما يحدث عند إلغاء تفعيل عيادة وكيفية التنبيه بانتهاء الاشتراك.' : 'Control inactive behavior and expiry warnings.'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {isArabic ? 'سلوك العيادة غير المفعلة' : 'Inactive clinic behavior'}
                </label>
                <select
                  value={settings.inactivePolicy}
                  onChange={(e) => handleChange('inactivePolicy', e.target.value as PlatformSettings['inactivePolicy'])}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                >
                  <option value="block">{isArabic ? 'منع تسجيل الدخول' : 'Block logins'}</option>
                  <option value="readonly">{isArabic ? 'وضع قراءة فقط' : 'Read-only access'}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {isArabic ? 'أيام قبل الانتهاء للتنبيه' : 'Warn days before expiry'}
                </label>
                <input
                  type="number"
                  min={1}
                  value={settings.warnDays}
                  onChange={(e) => handleChange('warnDays', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {isArabic ? 'إشعار انتهاء الاشتراك' : 'Notify on expiry'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {isArabic ? 'تنبيه المدراء قرب انتهاء الاشتراك.' : 'Alert managers when subscriptions near end.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange('notifyExpiry', !settings.notifyExpiry)}
                  className={`w-12 h-7 rounded-full transition flex items-center ${settings.notifyExpiry ? 'bg-teal-600' : 'bg-gray-300 dark:bg-slate-600'}`}
                >
                  <span
                    className={`h-5 w-5 bg-white rounded-full shadow transform transition ${settings.notifyExpiry ? 'translate-x-5' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Localization */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isArabic ? 'اللغة والتنسيق' : 'Localization Defaults'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {isArabic ? 'اللغة الافتراضية والمنطقة الزمنية ودعم RTL.' : 'Default language, timezone, and RTL preferences.'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {isArabic ? 'اللغة الافتراضية' : 'Default language'}
                </label>
                <select
                  value={settings.defaultLanguage}
                  onChange={(e) => handleChange('defaultLanguage', e.target.value as 'en' | 'ar')}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                >
                  <option value="en">{isArabic ? 'الإنجليزية' : 'English'}</option>
                  <option value="ar">{isArabic ? 'العربية' : 'Arabic'}</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {isArabic ? 'المنطقة الزمنية' : 'Timezone'}
                </label>
                <input
                  type="text"
                  value={settings.timezone}
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                  placeholder="Asia/Gaza"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {isArabic ? 'فرض اتجاه RTL للعربية' : 'Force RTL for Arabic'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {isArabic ? 'استخدم اتجاه من اليمين عند اختيار العربية.' : 'Use right-to-left layout when Arabic is selected.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleChange('forceRtl', !settings.forceRtl)}
                  className={`w-12 h-7 rounded-full transition flex items-center ${settings.forceRtl ? 'bg-teal-600' : 'bg-gray-300 dark:bg-slate-600'}`}
                >
                  <span
                    className={`h-5 w-5 bg-white rounded-full shadow transform transition ${settings.forceRtl ? 'translate-x-5' : 'translate-x-1'}`}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isArabic ? 'التنبيهات' : 'Notifications'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {isArabic ? 'نصوص سريعة لتنبيهات الموافقة والانتهاء.' : 'Quick templates for approval and expiry alerts.'}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {isArabic ? 'نص تنبيه التسجيل' : 'Registration alert'}
                </label>
                <textarea
                  rows={3}
                  defaultValue={
                    isArabic
                      ? 'تمت الموافقة على عيادتكم. يمكنكم تسجيل الدخول والبدء.'
                      : 'Your clinic registration is approved. You can now sign in and start.'
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  {isArabic ? 'نص تنبيه انتهاء الاشتراك' : 'Expiry alert'}
                </label>
                <textarea
                  rows={3}
                  defaultValue={
                    isArabic
                      ? 'سينتهي اشتراك العيادة قريبًا. يرجى التجديد لتجنب إيقاف الحساب.'
                      : 'Clinic subscription is expiring soon. Please renew to avoid suspension.'
                  }
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <input
                  id="notifyRegistration"
                  type="checkbox"
                  checked={settings.notifyRegistration}
                  onChange={(e) => handleChange('notifyRegistration', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="notifyRegistration" className="text-sm text-gray-700 dark:text-gray-200">
                  {isArabic ? 'إرسال عند الموافقة/الرفض' : 'Send on approval/decline'}
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="notifyExpiry"
                  type="checkbox"
                  checked={settings.notifyExpiry}
                  onChange={(e) => handleChange('notifyExpiry', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="notifyExpiry" className="text-sm text-gray-700 dark:text-gray-200">
                  {isArabic ? 'إرسال قرب انتهاء الاشتراك' : 'Send near subscription end'}
                </label>
              </div>
            </div>
          </section>

          {/* Audit Preview */}
          <section className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isArabic ? 'آخر التغييرات' : 'Recent Changes'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  {isArabic ? 'سجل مختصر للإعدادات المحدثة.' : 'Lightweight audit of recent updates.'}
                </p>
              </div>
              <span className="text-xs text-gray-500 dark:text-slate-400">
                {isArabic ? 'للعرض فقط' : 'Read-only'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { actor: 'Platform Admin', action: isArabic ? 'عدّل خطة Standard' : 'Updated Standard plan pricing', time: '2h ago' },
                { actor: 'Platform Admin', action: isArabic ? 'فعّل تنبيهات الانتهاء' : 'Enabled expiry alerts', time: '1d ago' },
                { actor: 'Platform Admin', action: isArabic ? 'حدث بيانات الدعم' : 'Updated support contact', time: '3d ago' },
              ].map((item, idx) => (
                <div key={idx} className="rounded-xl border border-gray-200 dark:border-slate-700 px-4 py-3 bg-gray-50/60 dark:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.actor}</p>
                    <span className="text-xs text-gray-500 dark:text-slate-400">{item.time}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.action}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setSettings(initialSettings)}
              className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            >
              {t.cancel || (isArabic ? 'إلغاء' : 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving
                ? isArabic
                  ? 'جارٍ الحفظ...'
                  : 'Saving...'
                : t.save || (isArabic ? 'حفظ' : 'Save')}
            </button>
          </div>
        </form>
      </main>
      <Toast
        isOpen={toast.isOpen}
        onClose={() => setToast({ ...toast, isOpen: false })}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
}
