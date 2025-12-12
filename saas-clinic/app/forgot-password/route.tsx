"use client";

import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const { language, isRTL } = useLanguage();
  const t = translations[language];

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const API_URL = process.env.NEXT_PUBLIC_API_URL; // Laravel

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || "Something went wrong");
      } else {
        setMessage(
          language === "ar"
            ? "تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني (إن كان مسجلًا)."
            : "A password reset link has been sent to your email (if it exists)."
        );
      }
    } catch (err: any) {
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-teal-50 via-white to-cyan-50 p-4">
      {/* الخلفية */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>

      <div className="w-full max-w-md relative">
        {/* Language toggle */}
        <div className="absolute top-0 right-0 mt-2 mr-2">
          <LanguageSwitcher />
        </div>

        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden mt-16">
          {/* Header */}
          <div className="bg-linear-to-r from-teal-600 to-cyan-600 px-8 py-8 text-white text-center relative">
            <h1 className="text-22xl font-bold mb-2">
              {language === "en" ? "Forgot Password" : "نسيت كلمة المرور؟"}
            </h1>
            <p className="text-teal-100 text-sm">
              {language === "en"
                ? "Enter your email to receive a reset link."
                : "أدخل بريدك الإلكتروني لإرسال رابط إعادة التعيين."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Success message */}
            {message && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-center text-green-700 text-sm">
                {message}
              </div>
            )}

            {/* Email field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === "en" ? "Email Address" : "البريد الإلكتروني"}
              </label>

              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`block w-full py-3 ${
                  isRTL ? "text-right" : "text-left"
                } border-gray-300 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500`}
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-linear-to-r from-teal-600 to-cyan-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:from-teal-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? language === "en"
                  ? "Sending..."
                  : "جارِ الإرسال..."
                : language === "en"
                ? "Send Reset Link"
                : "إرسال رابط إعادة التعيين"}
            </button>

            {/* Back to login */}
            <div className="text-center">
              <Link
                href="/login"
                className="text-sm text-teal-600 hover:text-teal-700"
              >
                {language === "en"
                  ? "Back to login"
                  : "العودة لصفحة تسجيل الدخول"}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
