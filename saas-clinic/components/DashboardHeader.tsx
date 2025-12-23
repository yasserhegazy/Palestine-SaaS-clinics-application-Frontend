"use client";

import React, { useState, useEffect } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import { Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { getClinicLogo } from "@/lib/api/clinicSettings";
import type { User, UserRole } from "@/types/auth";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import NotificationBell from "./common/NotificationBell";
import type { NotificationItem } from "@/types/notifications";

type RoleKey = Lowercase<UserRole>;

type DashboardHeaderTranslations = {
  patientPortal?: string;
  doctorPortal?: string;
  secretaryPortal?: string;
  adminPortal?: string;
  yourHealthRecords?: string;
  logout?: string;
  [key: string]: unknown;
};

interface DashboardHeaderProps {
  user: Pick<User, "name" | "role">;
  logout: () => void;
  t: DashboardHeaderTranslations;
  clinic?: { clinic_id?: number; logo?: string } | null;
}

const buildDemoNotifications = (language: string): NotificationItem[] => {
  const localized = (translations as Record<string, Record<string, string>>)[language];
  const fallback = translations.en;
  const strings = localized ?? fallback;

  return [
    {
      id: "1",
      title:
        strings.notificationAppointmentConfirmedTitle ??
        fallback.notificationAppointmentConfirmedTitle,
      body:
        strings.notificationAppointmentConfirmedBody ??
        fallback.notificationAppointmentConfirmedBody,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      status: "unread",
      category: "appointment",
      actionLabel:
        strings.notificationViewAction ?? fallback.notificationViewAction,
    },
    {
      id: "2",
      title: strings.notificationReminderTitle ?? fallback.notificationReminderTitle,
      body: strings.notificationReminderBody ?? fallback.notificationReminderBody,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      status: "unread",
      category: "reminder",
    },
    {
      id: "3",
      title:
        strings.notificationPendingRequestsTitle ??
        fallback.notificationPendingRequestsTitle,
      body:
        strings.notificationPendingRequestsBody ??
        fallback.notificationPendingRequestsBody,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
      status: "read",
      category: "message",
      actionLabel:
        strings.notificationOpenAction ?? fallback.notificationOpenAction,
    },
  ];
};

export default function DashboardHeader({
  user,
  logout,
  t,
  clinic,
}: DashboardHeaderProps) {
  const { language } = useLanguage();
  const router = useRouter();
  const isArabic = language === "ar";

  const roleKey = user.role.toLowerCase() as RoleKey;

  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [isLoadingLogo, setIsLoadingLogo] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    buildDemoNotifications(language)
  );

  // Refresh demo notifications when language changes while keeping read status.
  useEffect(() => {
    setNotifications((prev) => {
      const base = buildDemoNotifications(language);
      return base.map((item) => {
        const existing = prev.find((p) => p.id === item.id);
        return existing ? { ...item, status: existing.status } : item;
      });
    });
  }, [language]);

  // Get clinic ID for localStorage key
  const getClinicId = () => {
    // Get clinic_id from clinic prop if available
    return clinic?.clinic_id || null;
  };

  // Load logo from localStorage on mount
  useEffect(() => {
    const clinicId = getClinicId();
    if (clinicId) {
      const cachedLogo = localStorage.getItem(`clinic_logo_${clinicId}`);
      if (cachedLogo) {
        setLogoUrl(cachedLogo);
      } else if (clinic?.logo) {
        setLogoUrl(clinic.logo);
      }
    }
  }, []);

  // Fetch fresh clinic logo only for managers (to get latest updates and cache it)
  useEffect(() => {
    if (roleKey === "manager") {
      const clinicId = getClinicId();
      setIsLoadingLogo(true);
      getClinicLogo()
        .then((data) => {
          if (data.logo_url) {
            setLogoUrl(data.logo_url);
            // Cache the logo in localStorage for all users
            if (clinicId) {
              localStorage.setItem(`clinic_logo_${clinicId}`, data.logo_url);
            }
          }
        })
        .catch((error) => {
          console.error("Failed to fetch clinic logo:", error);
          // Keep using cached logo or clinic logo from AuthContext
        })
        .finally(() => {
          setIsLoadingLogo(false);
        });
    }
  }, [roleKey]);

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const capitalRole = capitalize(roleKey);

  const translatedRoles: Record<RoleKey, string> = {
    patient: isArabic ? "المريض " : "Patient",
    doctor: isArabic ? "الطبيب" : "Doctor",
    secretary: isArabic ? "الاستقبال" : "Secretary",
    admin: isArabic ? "الادمن " : "Admin",
    manager: isArabic ? "المدير" : "Manager",
  };

  const translatedRole = translatedRoles[roleKey] || capitalRole;

  // Titles
  const roleTitles: Partial<Record<RoleKey, string | undefined>> = {
    patient: t.patientPortal,
    doctor: t.doctorPortal,
    secretary: t.secretaryPortal,
    admin: t.adminPortal,
  };

  const headerTitle =
    roleTitles[roleKey] ??
    (isArabic ? `لوحة تحكم ${translatedRole}` : `Dashboard ${translatedRole}`);

  const handleMarkAllRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, status: "read" }))
    );
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === item.id ? { ...notif, status: "read" } : notif
      )
    );
    // Placeholder for navigation or modal trigger when wiring real data.
  };

  return (
    <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{headerTitle}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {(t.yourHealthRecords as string) ??
              (isArabic ? "سجلك الصحي" : "Your health records")}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <LanguageSwitcher />
          <NotificationBell
            items={notifications}
            onMarkAllRead={handleMarkAllRead}
            onItemClick={handleNotificationClick}
          />

          <div className="text-right">
            <p className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{translatedRole}</p>
          </div>

          {/* Clinic Logo - visible to all, clickable only for managers */}
          {!isLoadingLogo && logoUrl ? (
            roleKey === "manager" ? (
              <button
                onClick={() => router.push("/clinic/settings")}
                className="flex items-center justify-center transition-all duration-200 hover:opacity-80"
                title={isArabic ? "إعدادات العيادة" : "Clinic Settings"}
              >
                <img
                  src={logoUrl}
                  alt="Clinic Logo"
                  className="w-10 h-10 rounded-full object-cover border-2 border-teal-500 dark:border-teal-400 shadow-md hover:shadow-lg transition-shadow"
                />
              </button>
            ) : (
              <div className="flex items-center justify-center">
                <img
                  src={logoUrl}
                  alt="Clinic Logo"
                  className="w-10 h-10 rounded-full object-cover border-2 border-teal-500 dark:border-teal-400 shadow-md"
                />
              </div>
            )
          ) : roleKey === "manager" ? (
            <button
              onClick={() => router.push("/clinic/settings")}
              className="flex items-center justify-center transition-all duration-200 hover:opacity-80"
              title={isArabic ? "إعدادات العيادة" : "Clinic Settings"}
            >
              <div className="p-2 text-slate-600 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </div>
            </button>
          ) : null}

          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            {t.logout ?? (isArabic ? "تسجيل خروج" : "Logout")}
          </button>
        </div>
      </div>
    </header>
  );
}
