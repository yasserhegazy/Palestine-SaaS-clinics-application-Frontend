"use client";

import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { useRouter } from "next/navigation";
import PatientSearch from "@/components/PatientSearch";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function SearchPatientPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <Breadcrumbs />

        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500 mb-1">
              {t.patientsManagement || "Patients management"}
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              {t.searchPatient || "Search for a patient"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t.searchPatientSubtitle ||
                "Find and review patient records quickly and securely."}
            </p>
          </div>

          <button
            onClick={() => router.back()}
            className="text-sm text-teal-700 hover:text-teal-800 hover:underline"
          >
            {t.back || "Back"}
          </button>
        </div>

        <PatientSearch showSelectedCard={true} />
      </div>
    </div>
  );
}
