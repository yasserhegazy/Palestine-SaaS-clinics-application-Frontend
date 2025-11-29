"use client";

import React from "react";
import { useLanguage } from "@/context/LanguageContext";


interface PageHeaderProps {
  label: string;
  title: string;
  description: string;
  backAction?: () => void;
  extraActions?: React.ReactNode;
  wrapperClass?: string; 
}

export default function PageHeader({
  label,
  title,
  description,
  backAction,
  extraActions,
  wrapperClass = "",
}: PageHeaderProps) {
      const { language } = useLanguage();
      const isArabic = language === "ar";
  return (
    <header className={wrapperClass}>
      <div className="flex items-center justify-between gap-3 mx-auto px-4 sm:px-6 lg:px-9 py-8 mb-6">
        <div>
          <p className="text-xs text-slate-500 mb-1">{label}</p>
          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        </div>

        <div className="flex items-center gap-3">
          {extraActions}

          {backAction && (
            <button
              onClick={backAction}
              className="text-sm text-teal-700 hover:text-teal-800 hover:underline"
            >
              {isArabic ? "رجوع" : "Back"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
