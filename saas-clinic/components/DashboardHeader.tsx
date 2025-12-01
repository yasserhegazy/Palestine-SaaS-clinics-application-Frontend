"use client";

import React from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import type { User, UserRole } from "@/types/auth";
import { useLanguage } from "@/context/LanguageContext";

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
}

export default function DashboardHeader({
  user,
  logout,
  t,
}: DashboardHeaderProps) {
  const { language } = useLanguage();
  const isArabic = language === "ar";

  const roleKey = user.role.toLowerCase() as RoleKey;

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

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{headerTitle}</h1>
          <p className="text-sm text-slate-600">
            {(t.yourHealthRecords as string) ??
              (isArabic ? "سجلك الصحي" : "Your health records")}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <LanguageSwitcher />

          <div className="text-right">
            <p className="text-sm font-medium text-slate-900">{user.name}</p>
            <p className="text-xs text-slate-500">{translatedRole}</p>
          </div>

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
