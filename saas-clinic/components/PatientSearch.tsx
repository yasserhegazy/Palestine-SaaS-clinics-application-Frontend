"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";

type LookupPatient = {
  patientId: string;
  nationalId?: string;
  userId?: string;
  name?: string;
  phone?: string;
  email?: string;
  raw: any;
};

const MIN_IDENTIFIER_LENGTH = 3;
const SEARCH_DEBOUNCE_MS = 250;

interface PatientSearchProps {
  onPatientSelect?: (patient: LookupPatient) => void;
  autoNavigate?: boolean;
  showSelectedCard?: boolean;
  className?: string;
}

export default function PatientSearch({
  onPatientSelect,
  autoNavigate = false,
  showSelectedCard = true,
  className = "",
}: PatientSearchProps) {
  const { language } = useLanguage();
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LookupPatient[]>([]);
  const [selectedPatient, setSelectedPatient] =
    useState<LookupPatient | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noResults, setNoResults] = useState(false);
  const [retryable, setRetryable] = useState(false);
  const [lookupTrigger, setLookupTrigger] = useState(0);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const activeRequest = useRef<AbortController | null>(null);

  const trimmedQuery = query.trim();

  const t = {
    sessionExpired:
      language === "ar"
        ? "انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى."
        : "Your session expired. Please login again.",
    notAuthorized:
      language === "ar"
        ? "ليست لديك صلاحية للبحث عن المرضى."
        : "You are not authorized to search patients.",
    searchPatientLabel:
      language === "ar"
        ? "أدخل رقم الهوية أو الهاتف لبدء البحث"
        : "Enter national ID or phone to start searching",
    searchPatientHint:
      language === "ar"
        ? "نبحث تلقائياً عن أول خمسة مرضى يطابقون البداية التي أدخلتها (هوية أو هاتف)."
        : "We automatically look up the first five patients whose ID or phone starts with what you type.",
  };

  const adaptLookupPatient = (record: any): LookupPatient => {
    const fallbackId =
      record?.patient_id ??
      record?.patientId ??
      record?.id ??
      record?.user?.id ??
      record?.user_id ??
      record?.national_id ??
      record?.user?.phone ??
      record?.user?.email ??
      `patient-${Math.random().toString(36).slice(2, 9)}`;

    return {
      patientId: String(fallbackId),
      nationalId: record?.national_id ?? record?.nationalId ?? undefined,
      userId:
        record?.user?.user_id ??
        record?.user?.id ??
        record?.user_id ??
        undefined,
      name: record?.user?.name ?? record?.name ?? undefined,
      phone: record?.user?.phone ?? record?.phone ?? undefined,
      email: record?.user?.email ?? record?.email ?? undefined,
      raw: record,
    };
  };

  useEffect(() => {
    const identifier = trimmedQuery;

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
      debounceTimeout.current = null;
    }

    if (activeRequest.current) {
      activeRequest.current.abort();
      activeRequest.current = null;
    }

    if (identifier.length < MIN_IDENTIFIER_LENGTH) {
      setSuggestions([]);
      setLoading(false);
      setNoResults(false);
      setRetryable(false);
      setError(null);
      return;
    }

    debounceTimeout.current = setTimeout(() => {
      const controller = new AbortController();
      activeRequest.current = controller;
      setLoading(true);
      setError(null);
      setNoResults(false);
      setRetryable(false);

      (async () => {
        try {
          const res = await fetch(
            `/api/clinic/patients/lookup?identifier=${encodeURIComponent(
              identifier
            )}`,
            { signal: controller.signal }
          );

          if (res.status === 401) {
            setSuggestions([]);
            setError(t.sessionExpired);
            router.push("/login");
            return;
          }

          if (res.status === 403) {
            setSuggestions([]);
            setError(t.notAuthorized);
            return;
          }

          if (!res.ok) {
            setSuggestions([]);
            setNoResults(true);
            setRetryable(true);
            return;
          }

          const data = await res.json();
          const records = Array.isArray(data?.patients) ? data.patients : [];
          const mapped = records.slice(0, 5).map(adaptLookupPatient);

          setSuggestions(mapped);
          setNoResults(mapped.length === 0);
        } catch (fetchError) {
          if ((fetchError as Error).name === "AbortError") {
            return;
          }
          console.error("Patient lookup failed:", fetchError);
          setSuggestions([]);
          setNoResults(true);
          setRetryable(true);
        } finally {
          setLoading(false);
          if (activeRequest.current === controller) {
            activeRequest.current = null;
          }
        }
      })();
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
        debounceTimeout.current = null;
      }
      if (activeRequest.current) {
        activeRequest.current.abort();
        activeRequest.current = null;
      }
    };
  }, [trimmedQuery, lookupTrigger, language, router]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setSelectedPatient(null);
    setError(null);
    setNoResults(false);
    setRetryable(false);
  };

  const handleRetry = () => {
    if (trimmedQuery.length >= MIN_IDENTIFIER_LENGTH) {
      setLookupTrigger((prev) => prev + 1);
    }
  };

  const handleSelectPatient = (patient: LookupPatient) => {
    setSelectedPatient(patient);
    setSuggestions([]);
    setNoResults(false);
    setRetryable(false);

    if (patient.nationalId) {
      setQuery(patient.nationalId);
    } else if (patient.phone) {
      setQuery(patient.phone);
    } else if (patient.name) {
      setQuery(patient.name);
    }

    // Call the callback if provided
    if (onPatientSelect) {
      onPatientSelect(patient);
    }

    // Auto-navigate if enabled
    if (autoNavigate && patient.patientId) {
      router.push(`/reception/patients/${patient.patientId}`);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setSelectedPatient(null);
    setError(null);
    setNoResults(false);
    setRetryable(false);
  };

  const handleOpenPatient = (patientId: string) => {
    if (!patientId) return;
    router.push(`/reception/patients/${patientId}`);
  };

  const fallbackName =
    language === "ar" ? "مريض بدون اسم" : "Unnamed patient";
  const fallbackNationalId = language === "ar" ? "غير متوفر" : "N/A";
  const fallbackPhone = language === "ar" ? "غير متوفر" : "N/A";
  const showSuggestions = trimmedQuery.length >= MIN_IDENTIFIER_LENGTH;

  return (
    <div className={className}>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 md:p-7 border-b border-slate-100">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col gap-3"
          >
            <label className="block text-sm font-medium text-slate-800">
              {t.searchPatientLabel}
            </label>

            <div className="relative">
              <input
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder={
                  language === "ar"
                    ? "مثال: 0599 أو 408"
                    : "e.g. 0599 or 408"
                }
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/70 focus:border-teal-500 transition"
              />

              {query && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute inset-y-0 end-3 text-xs text-slate-500 hover:text-slate-700"
                >
                  {language === "ar" ? "مسح" : "Clear"}
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-500">{t.searchPatientHint}</p>
          </form>

          {error && (
            <p className="mt-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <div className="p-6 md:p-7 space-y-6">
          {!showSuggestions && (
            <p className="text-xs text-slate-500">
              {language === "ar"
                ? `اكتب ${MIN_IDENTIFIER_LENGTH} خانات على الأقل لبدء البحث.`
                : `Type at least ${MIN_IDENTIFIER_LENGTH} characters to start searching.`}
            </p>
          )}

          {showSuggestions && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              {loading && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="inline-block h-4 w-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                  <span>
                    {language === "ar"
                      ? "جاري تحميل الاقتراحات..."
                      : "Loading suggestions..."}
                  </span>
                </div>
              )}

              {!loading && suggestions.length > 0 && (
                <div className="mt-3 divide-y divide-slate-200 border border-slate-200 rounded-xl bg-white overflow-hidden">
                  {suggestions.map((patient) => {
                    const name = patient.name || fallbackName;
                    const nationalId = patient.nationalId || fallbackNationalId;
                    const phone = patient.phone || fallbackPhone;

                    return (
                      <button
                        type="button"
                        key={`${patient.patientId}-${patient.userId ?? nationalId}`}
                        onClick={() => handleSelectPatient(patient)}
                        className="w-full text-left px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-teal-500/70 outline-none transition"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {name}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {language === "ar" ? "رقم الهوية: " : "National ID: "}
                            {nationalId}
                          </p>
                          <p className="text-xs text-slate-500">
                            {language === "ar" ? "الهاتف: " : "Phone: "}
                            {phone}
                          </p>
                        </div>

                        <span className="text-xs font-medium text-teal-700">
                          {language === "ar" ? "اختر" : "Select"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {!loading && !error && noResults && (
                <div className="mt-3 space-y-3">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm text-slate-500">
                    <span>
                      {language === "ar"
                        ? `لا توجد نتائج ل "${trimmedQuery}".`
                        : `No patients found for "${trimmedQuery}".`}
                    </span>
                    {retryable && (
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="text-xs font-semibold text-teal-700 hover:underline"
                      >
                        {language === "ar" ? "أعد المحاولة" : "Retry"}
                      </button>
                    )}
                  </div>
                  
                  {/* Create New Patient Button */}
                  <div className="pt-3 border-t border-slate-200">
                    <p className="text-xs text-slate-600 mb-2">
                      {language === "ar"
                        ? "لم تجد المريض؟ يمكنك إنشاء ملف جديد"
                        : "Patient not found? Create a new record"}
                    </p>
                    <button
                      type="button"
                      onClick={() => router.push('/reception/patients/register')}
                      className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      {language === "ar" ? "إنشاء ملف مريض جديد" : "Create new patient record"}
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <p className="mt-3 text-sm text-red-700">
                  {error}
                </p>
              )}
            </div>
          )}

          {selectedPatient && showSelectedCard && (
            <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500 mb-1">
                    {language === "ar" ? "المريض المختار" : "Selected patient"}
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    {selectedPatient.name || fallbackName}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === "ar" ? "رقم الهوية: " : "National ID: "}
                    {selectedPatient.nationalId || fallbackNationalId}
                  </p>
                  <p className="text-xs text-slate-500">
                    {language === "ar" ? "الهاتف: " : "Phone: "}
                    {selectedPatient.phone || fallbackPhone}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenPatient(selectedPatient.patientId)}
                    className="px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-medium hover:bg-teal-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    disabled={!selectedPatient.patientId}
                  >
                    {language === "ar" ? "فتح ملف المريض" : "Open patient file"}
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm hover:bg-slate-50 transition"
                  >
                    {language === "ar" ? "إلغاء الاختيار" : "Clear selection"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {!selectedPatient && !showSuggestions && (
            <p className="text-xs text-slate-400">
              {language === "ar"
                ? "ابدأ بكتابة رقم الهوية أو الهاتف (٣ خانات على الأقل) لإظهار النتائج المقترحة."
                : "Start typing the national ID or phone (minimum 3 characters) to see suggestions."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Export the type for use in other components
export type { LookupPatient };
