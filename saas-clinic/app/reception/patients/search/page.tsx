"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

type Patient = {
  id: string;
  name: string;
  nationalId?: string;
  phone: string;
  dateOfBirth?: string;
  lastVisit?: string;
};

export default function SearchPatientPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSearched(false);

    if (!query.trim()) return;

    setLoading(true);

    try {
      const res = await fetch("/api/patients/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim() }), 
      });

      if (!res.ok) {
        throw new Error("Failed to search patients");
      }

      const data = await res.json();
      setResults(data.patients || []);
      setSearched(true);
    } catch (err) {
      setError(
        t.searchPatientServerError ||
          "حدث خطأ أثناء البحث عن المريض. حاول مرة أخرى."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPatient = (patientId: string) => {
    router.push(`/reception/patients/${patientId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* هيدر علوي */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500 mb-1">
              {t.patientsManagement || "إدارة المرضى"}
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              {t.searchPatient || "البحث عن مريض"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t.searchPatientSubtitle ||
                "ابحث باستخدام رقم الهوية أو رقم الهاتف للوصول إلى ملف المريض."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button
              onClick={() => router.back()}
              className="text-sm text-teal-700 hover:text-teal-800 hover:underline"
            >
              {t.back || "رجوع"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 md:p-7 border-b border-slate-100">
            <form
              onSubmit={handleSearch}
              className="flex flex-col md:flex-row gap-3 items-stretch"
            >
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-800 mb-1 text-right md:text-right">
                  {t.searchPatientLabel ||
                    "أدخل رقم الهوية أو رقم الهاتف للبحث عن المريض"}
                </label>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={
                    language === "ar"
                      ? "مثال: 123456789 أو 059XXXXXXXX"
                      : "e.g. 123456789 or 059XXXXXXXX"
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/70 focus:border-teal-500 transition"
                />
                <p className="mt-1 text-[11px] text-slate-500 text-right md:text-right">
                  {t.searchPatientHint ||
                    (language === "ar"
                      ? "يمكنك البحث برقم الهوية الكامل أو رقم الهاتف المسجل في النظام."
                      : "You can search by full national ID or registered phone number.")}
                </p>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="px-4 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm w-full md:w-auto"
                >
                  {loading
                    ? language === "ar"
                      ? "جاري البحث..."
                      : "Searching..."
                    : t.search || (language === "ar" ? "بحث" : "Search")}
                </button>
              </div>
            </form>

            {error && (
              <p className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                {error}
              </p>
            )}
          </div>

          <div className="p-6 md:p-7">
            {loading && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="inline-block h-4 w-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                <span>
                  {language === "ar"
                    ? "جاري جلب النتائج..."
                    : "Loading results..."}
                </span>
              </div>
            )}

            {!loading && searched && results.length === 0 && (
              <p className="text-sm text-slate-500">
                {t.noPatientsFound ||
                  (language === "ar"
                    ? "لا توجد أي نتائج مطابقة لبيانات البحث المدخلة."
                    : "No patients found matching your search.")}
              </p>
            )}

            {!loading && results.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>
                    {language === "ar"
                      ? `عدد النتائج: ${results.length}`
                      : `Results: ${results.length}`}
                  </span>
                  <span>
                    {language === "ar"
                      ? "اضغط على اسم المريض لفتح ملفه"
                      : "Click on the patient name to open their file"}
                  </span>
                </div>

                <div className="divide-y divide-slate-100 border rounded-2xl border-slate-100 overflow-hidden">
                  {results.map((patient) => (
                    <div
                      key={patient.id}
                      className="px-4 md:px-5 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-slate-50 transition cursor-pointer"
                      onClick={() => handleOpenPatient(patient.id)}
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {patient.name}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {language === "ar" ? "رقم الهوية: " : "National ID: "}
                          {patient.nationalId ||
                            (language === "ar" ? "غير متوفر" : "N/A")}
                          {" • "}
                          {language === "ar" ? "الهاتف: " : "Phone: "}
                          {patient.phone}
                        </p>
                        {patient.lastVisit && (
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {language === "ar"
                              ? `آخر زيارة: ${patient.lastVisit}`
                              : `Last visit: ${patient.lastVisit}`}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenPatient(patient.id);
                        }}
                        className="text-xs px-3 py-1.5 rounded-xl border border-teal-600 text-teal-700 hover:bg-teal-50 transition"
                      >
                        {language === "ar"
                          ? "فتح الملف الطبي"
                          : "Open medical file"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!searched && !loading && (
              <p className="text-xs text-slate-400 mt-1">
                {language === "ar"
                  ? "ابدأ بكتابة رقم الهوية أو رقم الهاتف ثم اضغط على زر البحث لعرض النتائج."
                  : "Start typing the national ID or phone number, then click search to see results."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
