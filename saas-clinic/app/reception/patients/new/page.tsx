"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { useRouter } from "next/navigation";

import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function NewPatientPage() {
  const { language } = useLanguage();
  const t = translations[language];
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    nationalId: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Failed to create patient");
      }

      setMessage(
        t.newPatientSuccess ||
          "تم إنشاء حساب المريض وإرسال كلمة المرور عبر SMS."
      );
      setForm({ name: "", nationalId: "", phone: "" });
    } catch (err) {
      setError(
        t.newPatientServerError || "حدث خطأ أثناء إنشاء المريض. حاول مرة أخرى."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* هيدر علوي */}
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500 mb-1">
              {t.patientsManagement || "إدارة المرضى"}
            </p>
            <h1 className="text-2xl font-bold text-slate-900">
              {t.newPatient || "تسجيل مريض جديد"}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {t.newPatientSubtitle ||
                "أدخل بيانات المريض الأساسية ليتم إنشاء حساب له وإرسال كلمة المرور تلقائياً."}
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

        {/* الكارد الرئيسي */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[1.4fr,1fr]">
            {/* الفورم */}
            <form
              onSubmit={handleSubmit}
              className="p-6 md:p-7 space-y-4 border-b md:border-b-0 md:border-l border-slate-100"
            >
              {/* حقل الاسم */}
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1 text-right">
                  {t.fullNameLabel || "الاسم الكامل"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder={
                    t.fullNamePlaceholder || "اكتب الاسم الثلاثي أو الرباعي"
                  }
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/70 focus:border-teal-500 transition"
                />
              </div>

              {/* حقل رقم الهوية */}
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1 text-right">
                  {t.nationalIdLabel || "رقم الهوية"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  name="nationalId"
                  value={form.nationalId}
                  onChange={handleChange}
                  required
                  placeholder={t.nationalIdPlaceholder || "مثال: 123456789"}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/70 focus:border-teal-500 transition"
                />
                <p className="mt-1 text-[11px] text-slate-500 text-right">
                  {t.nationalIdHint ||
                    "يُستخدم للتأكد من عدم تكرار تسجيل نفس المريض."}
                </p>
              </div>

              {/* حقل رقم الهاتف */}
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1 text-right">
                  {t.phoneLabel || "رقم الهاتف"}{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  placeholder={t.phonePlaceholder || "مثال: 059XXXXXXXX"}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/70 focus:border-teal-500 transition"
                />
                <p className="mt-1 text-[11px] text-slate-500 text-right">
                  {t.phoneHint ||
                    "سيتم إرسال كلمة المرور الأولى لهذا الرقم عبر رسالة SMS."}
                </p>
              </div>

              {/* رسائل النجاح / الخطأ */}
              {message && (
                <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                  {message}
                </p>
              )}
              {error && (
                <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {error}
                </p>
              )}

              {/* أزرار */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setForm({ name: "", nationalId: "", phone: "" })
                  }
                  className="px-3 py-2 text-sm rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  {t.clearForm || "مسح الحقول"}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2.5 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading
                    ? t.saving || "جاري الحفظ..."
                    : t.saveAndSendPassword || "حفظ وإرسال كلمة المرور"}
                </button>
              </div>
            </form>

            <div className="p-6 md:p-7 bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col justify-between">
              <div
                className={`space-y-3 ${
                  language === "ar" ? "text-right" : "text-left"
                }`}
              >
                <h2 className="text-sm font-semibold text-slate-900">
                  {t.newPatientTipsTitle || "إرشادات تسجيل مريض جديد"}
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t.newPatientTipsBody ||
                    "تأكّد من مطابقة بيانات الهوية ورقم الهاتف مع الوثائق الرسمية الخاصة بالمريض، لأن هذه المعلومات ستُستخدم لاحقاً في تسجيل الدخول للبوابة الإلكترونية وفي التواصل معه."}
                </p>
                <ul
                  className={`mt-2 space-y-1 text-xs text-slate-600 list-disc ${
                    language === "ar" ? "pr-4" : "pl-4"
                  }`}
                >
                  <li>
                    {t.newPatientTip1 ||
                      "تجنّب إدخال أسماء مختصرة قدر الإمكان."}
                  </li>
                  <li>
                    {t.newPatientTip2 ||
                      "تأكد من كتابة رقم الهاتف بشكل صحيح مع المقدمة."}
                  </li>
                  <li>
                    {t.newPatientTip3 ||
                      "أبلغ المريض بأن كلمة المرور أُرسلت على هاتفه."}
                  </li>
                </ul>
              </div>

              <div
                className={`mt-6 text-[11px] text-slate-500 border-t border-slate-200 pt-3 ${
                  language === "ar" ? "text-right" : "text-left"
                }`}
              >
                {t.newPatientFooter ||
                  "عند حفظ البيانات، يقوم النظام تلقائياً بإنشاء حساب للمريض وإرسال كلمة مرور مؤقتة يمكنه تغييرها لاحقاً من خلال البوابة الإلكترونية."}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
