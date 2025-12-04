"use client";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import DashboardHeader from "@/components/DashboardHeader";
import { translations } from "@/lib/translations";
import type { ReactNode } from "react";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const isArabic = language === "ar";
  const t = translations[language] ?? {};

  return (
    <div dir={isArabic ? "rtl" : "ltr"} className="min-h-screen bg-slate-50">
      {user && (
        <DashboardHeader
          user={{ name: user.name, role: user.role }}
          logout={logout}
          t={t}
        />
      )}
      {children}
    </div>
  );
}
