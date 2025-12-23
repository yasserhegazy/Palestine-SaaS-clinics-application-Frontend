'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

interface BreadcrumbItem {
  label: string;
  href: string | null;
}

interface BreadcrumbsProps {
  customItems?: BreadcrumbItem[];
}

export default function Breadcrumbs({ customItems }: BreadcrumbsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useLanguage();
  const { user, isPlatformAdmin } = useAuth();

  const roleLabels: Record<string, { en: string; ar: string }> = {
    platform: { en: 'Admin', ar: 'الإدارة' },
    reception: { en: 'Reception', ar: 'الاستقبال' },
    doctor: { en: 'Doctor', ar: 'الطبيب' },
    patient: { en: 'Patient', ar: 'المريض' },
    clinic: { en: 'Clinic', ar: 'العيادة' },
  };

  const translations: Record<string, { en: string; ar: string }> = {
    dashboard: { en: 'Dashboard', ar: 'لوحة التحكم' },
    clinics: { en: 'Clinics', ar: 'العيادات' },
    new: { en: 'New Clinic', ar: 'عيادة جديدة' },
    reports: { en: 'Reports', ar: 'التقارير' },
    settings: { en: 'Settings', ar: 'الإعدادات' },
    appointments: { en: 'Appointments', ar: 'المواعيد' },
    "appointments-requests": { en: 'Appointments Requests', ar: 'طلبات المواعيد' },
    'today-appointments': { en: "Today's Appointments", ar: 'مواعيد اليوم' },
    requests: { en: 'Requests', ar: 'الطلبات' },
    today: { en: 'Today', ar: 'اليوم' },
    upcoming: { en: 'Upcoming', ar: 'القادمة' },
    patients: { en: 'Patients', ar: 'المرضى' },
    search: { en: 'Search', ar: 'بحث' },
    create: { en: 'Create appointment', ar: 'إنشاء موعد' },
    'medical-record': { en: 'Medical Record', ar: 'السجل الطبي' },
    'medical-records': { en: 'Medical Records', ar: 'السجلات الطبية' },
    'medical-history': { en: 'Medical History', ar: 'التاريخ الطبي' },
    analytics: { en: 'Analytics', ar: 'التحليلات' },
    'add-staff': { en: 'Add Staff', ar: 'إضافة موظف' },
    'management-staff': { en: 'Management Staff', ar: 'إدارة الموظفين' },
    'manage-schedule': { en: 'Manage Schedule', ar: 'إدارة الجداول' },
    register: { en: 'Register Patient', ar: 'تسجيل مريض' },
    update: { en: 'Update Patient', ar: 'تحديث مريض' },
  };

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) return customItems;

    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    if (paths.length === 0) return breadcrumbs;

    // Determine the user's actual role-based path
    let userRolePath = '';
    if (isPlatformAdmin) {
      userRolePath = 'platform';
    } else if (user?.role === 'Manager') {
      userRolePath = 'clinic';
    } else if (user?.role === 'Doctor') {
      userRolePath = 'doctor';
    } else if (user?.role === 'Secretary') {
      userRolePath = 'reception';
    } else if (user?.role === 'Patient') {
      userRolePath = 'patient';
    }

    // Use the user's actual role for the breadcrumb, not the URL path
    const role = userRolePath || paths[0];
    const roleLabel = roleLabels[role];
    if (!roleLabel) return breadcrumbs;

    const dashboardLabel = translations.dashboard?.[language] ?? 'Dashboard';
    const dashboardHref = `/${role}/dashboard`;

    breadcrumbs.push({ label: roleLabel[language], href: dashboardHref });

    const isOnDashboard = pathname === dashboardHref || paths[1] === 'dashboard';
    breadcrumbs.push({ label: dashboardLabel, href: isOnDashboard ? null : dashboardHref });

    let currentPath = `/${role}`;
    for (let i = 1; i < paths.length; i++) {
      const segment = paths[i];
      if (segment === 'dashboard') {
        currentPath = dashboardHref;
        continue;
      }
      if (segment.match(/^\d+$/)) continue;

      currentPath += `/${segment}`;
      const translation = translations[segment];

      const isPatientNewAppointment = role === 'patient' && paths[i - 1] === 'appointments' && segment === 'new';
      const isReceptionNewPatient = role === 'reception' && paths[i - 1] === 'patients' && segment === 'new';

      const label = isPatientNewAppointment
        ? language === 'ar'
          ? 'موعد جديد'
          : 'New Appointment'
        : isReceptionNewPatient
        ? language === 'ar'
          ? 'مريض جديد'
          : 'New Patient'
        : translation
        ? translation[language]
        : segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');

      // Make "patients" and "appointments" static (no href) in reception and doctor
      const href = (segment === 'patients' || segment === 'appointments') 
        ? null 
        : currentPath;

      breadcrumbs.push({ label, href });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  if (breadcrumbs.length === 0) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4 transition-colors" aria-label="Breadcrumb">
      {breadcrumbs.map((crumb, index) => (
        <div key={`${crumb.href || crumb.label}-${index}`} className="flex items-center">
          {index > 0 && (
            <svg
              className={`w-4 h-4 mx-2 ${language === 'ar' ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {index === breadcrumbs.length - 1 || crumb.href === null ? (
            <span className="font-medium text-gray-900 dark:text-white">{crumb.label}</span>
          ) : (
            <button onClick={() => crumb.href && router.push(crumb.href)} className="hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
              {crumb.label}
            </button>
          )}
        </div>
      ))}
    </nav>
  );
}
