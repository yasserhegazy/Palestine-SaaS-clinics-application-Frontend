"use client";

import React, { useState, useEffect } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";
import { Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { getClinicLogo } from "@/lib/api/clinicSettings";
import type { User, UserRole } from "@/types/auth";
import { useLanguage } from "@/context/LanguageContext";
import NotificationBell from "./common/NotificationBell";
import { useNotifications } from "@/app/hooks/useNotifications";

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

export default function DashboardHeader({
  user,
  logout,
  t,
  clinic,
}: DashboardHeaderProps) {
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const {
    items: notifications,
    markAllRead,
    markRead,
  } = useNotifications({ enabled: !!user, pollIntervalMs: 60000 });

  const roleKey = user.role.toLowerCase() as RoleKey;

  const getClinicId = () => clinic?.clinic_id || null;

  /* ================= Logo ================= */
  useEffect(() => {
    const clinicId = getClinicId();
    if (!clinicId) return;

    const cachedLogo = localStorage.getItem(`clinic_logo_${clinicId}`);
    if (cachedLogo) setLogoUrl(cachedLogo);
    else if (clinic?.logo) setLogoUrl(clinic.logo);
  }, []);

  useEffect(() => {
    if (roleKey !== "manager") return;

    const clinicId = getClinicId();
    getClinicLogo().then((data) => {
      if (data?.logo_url) {
        setLogoUrl(data.logo_url);
        if (clinicId) {
          localStorage.setItem(`clinic_logo_${clinicId}`, data.logo_url);
        }
      }
    });
  }, [roleKey]);

  /* ================= Translations ================= */
  const translatedRoles: Record<RoleKey, string> = {
    patient: isArabic ? "المريض" : "Patient",
    doctor: isArabic ? "الطبيب" : "Doctor",
    secretary: isArabic ? "الاستقبال" : "Secretary",
    admin: isArabic ? "المدير" : "Admin",
    manager: isArabic ? "المدير العام" : "Manager",
  };

  const roleTitles: Partial<Record<RoleKey, string | undefined>> = {
    patient: t.patientPortal,
    doctor: t.doctorPortal,
    secretary: t.secretaryPortal,
    admin: t.adminPortal,
  };

  const headerTitle =
    roleTitles[roleKey] ??
    (isArabic
      ? `لوحة تحكم ${translatedRoles[roleKey]}`
      : `Dashboard ${translatedRoles[roleKey]}`);

  /* ================= Notifications ================= */
  const handleNotificationClick = (item: { id: string; href?: string }) => {
    markRead(item.id);
    if (item.href) {
      const rolePath = `/${user.role.toLowerCase()}`;
      const target = item.href.startsWith("/") ? item.href : `/${item.href}`;
      router.push(
        target.startsWith(rolePath) ? target : `${rolePath}${target}`
      );
      closeMenu();
    }
  };

  const openMenu = () => {
    setMenuOpen(true);
    setTimeout(() => setMenuVisible(true), 10);
  };

  const closeMenu = () => {
    setMenuVisible(false);
    setTimeout(() => setMenuOpen(false), 300);
  };

  /* ================= UI ================= */
  return (
    <header
      dir={isArabic ? "rtl" : "ltr"}
      className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700"
    >
      {/* ================= Top Bar ================= */}
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">{headerTitle}</h1>
          <p className="text-sm text-slate-500 hidden sm:block">
            {(t.yourHealthRecords as string) ??
              (isArabic ? "سجلك الصحي" : "Your health records")}
          </p>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          <LanguageSwitcher />

          <NotificationBell
            items={notifications}
            onMarkAllRead={markAllRead}
            onItemClick={handleNotificationClick}
          />

          <div className="text-right">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-slate-500">
              {translatedRoles[roleKey]}
            </p>
          </div>

          {logoUrl && (
            <img
              src={logoUrl}
              alt="Clinic Logo"
              className="w-10 h-10 rounded-full border-2 border-teal-500"
            />
          )}

          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
          >
            {t.logout ?? (isArabic ? "تسجيل خروج" : "Logout")}
          </button>
        </div>

        {/* Mobile Icons */}
        <div className="md:hidden flex items-center gap-2">
          <NotificationBell
            items={notifications}
            onMarkAllRead={markAllRead}
            onItemClick={handleNotificationClick}
          />

          <button
            onClick={menuOpen ? closeMenu : openMenu}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
<Menu />
          </button>
        </div>
      </div>

      {/* ================= Overlay ================= */}
      {menuOpen && (
        <div
          onClick={closeMenu}
          className={`fixed inset-0 z-40 bg-black/30 transition-opacity duration-300 ${
            menuVisible ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* ================= Side Drawer ================= */}
      {menuOpen && (
        <div
          className={`
            fixed top-0 left-0 z-50
            h-screen w-[80%] max-w-sm
            bg-white dark:bg-slate-800
            shadow-2xl dark:shadow-black/60
            flex flex-col px-4 py-6
            transform transition-all duration-300 ease-out
            ${menuVisible ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          {/* Close Button */}
<button
  onClick={closeMenu}
  className={`
    absolute top-4
    ${isArabic ? "left-4" : "right-4"}
    p-2 rounded-full
    hover:bg-slate-100 dark:hover:bg-slate-700
    transition
  `}
>
  <X className="w-5 h-5" />
</button>

          {/* User */}
          <div className="text-center space-y-1 mb-6">
            <p className="font-semibold text-lg">{user.name}</p>
            <p className="text-sm text-slate-500">
              {translatedRoles[roleKey]}
            </p>
          </div>

          {/* Preferences */}
          <div className="flex-1 space-y-4">
            <p className="text-xs font-semibold text-slate-500 uppercase">
              {isArabic ? "الإعدادات" : "Preferences"}
            </p>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-700">
              <div>
                <p className="text-sm font-medium">
                  {isArabic ? "الوضع الليلي" : "Dark Mode"}
                </p>
                <p className="text-xs text-slate-500">
                  {isArabic ? "تغيير مظهر التطبيق" : "Switch appearance"}
                </p>
              </div>
              <ThemeToggle />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-700">
              <div>
                <p className="text-sm font-medium">
                  {isArabic ? "اللغة" : "Language"}
                </p>
                <p className="text-xs text-slate-500">
                  {isArabic ? "تغيير لغة التطبيق" : "Change language"}
                </p>
              </div>
              <LanguageSwitcher />
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="mt-6 w-full bg-red-600 text-white py-3 rounded-xl font-medium"
          >
            {t.logout ?? (isArabic ? "تسجيل خروج" : "Logout")}
          </button>
        </div>
      )}
    </header>
  );
}
