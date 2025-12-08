'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

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
    'today-appointments': { en: "Today's Appointments", ar: 'مواعيد اليوم' },
    patients: { en: 'Patients', ar: 'المرضى' },
    search: { en: 'Search', ar: 'بحث' },
    create: { en: 'Create appointment', ar: 'إنشاء موعد' },
    'medical-record': { en: 'Medical Record', ar: 'السجل الطبي' },
    'medical-records': { en: 'Medical Records', ar: 'السجلات الطبية' },
    'medical-history': { en: 'Medical History', ar: 'التاريخ الطبي' },
    analytics: { en: 'Analytics', ar: 'التحليلات' },
    'add-staff': { en: 'Add Staff', ar: 'إضافة موظف' },
    'management-staff': { en: 'Management Staff', ar: 'إدارة الموظفين' },
    register: { en: 'Register Patient', ar: 'تسجيل مريض' },
    update: { en: 'Update Patient', ar: 'تحديث مريض' },
  };

  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) return customItems;

    const paths = pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];

    if (paths.length === 0) return breadcrumbs;

    const role = paths[0];
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

      const href = segment === 'patients' ? null : currentPath;

      breadcrumbs.push({ label, href });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  if (breadcrumbs.length === 0) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4" aria-label="Breadcrumb">
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
            <span className="font-medium text-gray-900">{crumb.label}</span>
          ) : (
            <button onClick={() => crumb.href && router.push(crumb.href)} className="hover:text-teal-600 transition-colors">
              {crumb.label}
            </button>
          )}
        </div>
      ))}
    </nav>
  );
}
