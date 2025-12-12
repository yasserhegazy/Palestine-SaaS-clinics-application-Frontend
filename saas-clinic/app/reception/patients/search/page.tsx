"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { useRouter } from "next/navigation";
import PatientSearch, { LookupPatient } from "@/components/PatientSearch";
import Breadcrumbs from "@/components/Breadcrumbs";
import ThemeToggle from "@/components/ThemeToggle";

export default function SearchPatientPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();

  const [selectedPatient, setSelectedPatient] = useState<LookupPatient | null>(
    null
  );
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handlePatientSelect = (patient: LookupPatient) => {
    setSelectedPatient(patient);
    setSearchPerformed(true);
  };

  const handleRegisterNew = () => {
    router.push("/reception/patients/register");
  };

  const handleClear = () => {
    setSelectedPatient(null);
    setSearchPerformed(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-slate-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 py-8 px-4 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
    
        
        <Breadcrumbs />

        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
              {t.patientsManagement || "Patients management"}
            </p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {t.searchPatient || "Search for a patient"}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {language === "ar"
                ? "ابحث عن مريض موجود أو سجل مريض جديد"
                : "Search for an existing patient or register a new one"}
            </p>
          </div>

        
        </div>

        <PatientSearch
          showSelectedCard={false}
          onPatientSelect={handlePatientSelect}
          onSearchStart={() => {
            setSelectedPatient(null);
            setSearchPerformed(false);
          }}
        />

        {selectedPatient && (
          <div className="mt-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors duration-300">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 px-6 py-4 border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-700/40 flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {language === "ar"
                        ? "تم العثور على المريض"
                        : "Patient Found"}
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {language === "ar"
                        ? "المريض مسجل في النظام"
                        : "Patient is registered in the system"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClear}
                  className="text-sm text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 hover:underline"
                >
                  {language === "ar" ? "مسح" : "Clear"}
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    {t.fullNameLabel || "Full name"}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {selectedPatient.name || "-"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    {t.nationalIdLabel || "National ID"}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {selectedPatient.nationalId || "-"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    {t.phoneLabel || "Phone"}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {selectedPatient.phone || "-"}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    {language === "ar" ? "معرف المريض" : "Patient ID"}
                  </p>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {selectedPatient.patientId ||
                      selectedPatient.raw?.patient_id ||
                      "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
