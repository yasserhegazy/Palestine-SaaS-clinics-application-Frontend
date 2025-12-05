"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import DashboardHeader from "@/components/DashboardHeader";
import { translations } from "@/lib/translations";
import type { ReactNode } from "react";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { user, logout, clinic, isLoading } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const isArabic = language === "ar";
  const t = translations[language] ?? {};

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{isArabic ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  // Don't render protected content if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <div dir={isArabic ? "rtl" : "ltr"} className="min-h-screen bg-slate-50">
      <DashboardHeader
        user={{ name: user.name, role: user.role }}
        logout={logout}
        t={t}
        clinic={clinic}
      />
      {children}
    </div>
  );
}
