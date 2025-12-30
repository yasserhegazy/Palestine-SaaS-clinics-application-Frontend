"use client";
import React, { useState } from "react";

type FormData = {
  logo?: File | null;
  clinicName: string;
  email: string;
  phone: string;
  city: string;
  specialty: string;
  website: string;
  description: string;
};

export default function JoinUsPage() {
  const [form, setForm] = useState<FormData>({
    logo: null,
    clinicName: "",
    email: "",
    phone: "",
    city: "",
    specialty: "",
    website: "",
    description: "",
  });
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setForm((p) => ({ ...p, logo: file }));
    const url = URL.createObjectURL(file);
    setLogoPreview(url);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.clinicName.trim()) next.clinicName = "اسم العيادة مطلوب";
    if (!form.email.trim()) next.email = "البريد الإلكتروني مطلوب";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "صيغة بريد غير صحيحة";
    if (!form.phone.trim()) next.phone = "رقم الهاتف مطلوب";
    if (!form.city.trim()) next.city = "المدينة مطلوبة";
    if (!form.specialty.trim()) next.specialty = "اختر تخصص العيادة";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // هنا تربط الـ API
    console.log("Clinic payload:", form);
    alert("تم إرسال طلب الانضمام بنجاح ✅");
  };

  return (
    <div className="min-h-screen w-full bg-[#f3f7f6] flex items-center justify-center p-6">
      {/* خلفية تجميلية بلون الهوية */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="w-72 h-72 rounded-full bg-[var(--color-primary-light)] blur-3xl absolute -top-16 -left-10" />
        <div className="w-80 h-80 rounded-full bg-[var(--color-primary-light)] blur-3xl absolute bottom-10 right-10" />
      </div>

      <div
        dir="rtl"
        className="relative z-10 w-full max-w-[720px] bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-[var(--color-primary-light)] p-6 md:p-10"
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-primary-dark)]">
            انضم إلى <span className="text-[var(--color-primary)]">عيادتك</span>
          </h1>
          <p className="mt-2 text-gray-600">
            سجّل عيادتك وابدأ إدارة المواعيد والمرضى بسهولة عبر منصتنا.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {/* شعار العيادة */}
          <div className="grid md:grid-cols-[160px_1fr] gap-4 items-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-32 h-32 rounded-xl border  flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoPreview}
                    alt="شعار العيادة"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm text-gray-500">لا يوجد شعار</span>
                )}
              </div>
              <label className="relative inline-block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogo}
                  className="hidden  bg-white border"
                />
                <span className="cursor-pointer inline-flex items-center justify-center rounded-lg px-4 py-2 text-white bg-[var(--color-primary-dark)] hover:bg-[var(--color-primary-dark)] transition">
                  رفع الشعار
                </span>
              </label>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--color-gray-light)] mb-1 ">
                  اسم العيادة
                </label>
                <input
                  name="clinicName"
                  value={form.clinicName}
                  onChange={handleChange}
                  placeholder="مثلاً: عيادة الامل الطبية"
                  className="w-full px-4 py-2.5 border border-[var(--color-primary-light)] rounded-lg bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                {errors.clinicName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.clinicName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-[var(--color-gray-light)] mb-1">
                  {" "}
                  البريد الإلكتروني
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="example@clinic.com"
                  className="w-full px-4 py-2.5 border border-[var(--color-primary-light)] rounded-lg bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-[var(--color-gray-light)] mb-1">
                  {" "}
                  رقم الهاتف
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="05xxxxxxxx"
                  className="w-full px-4 py-2.5 border border-[var(--color-primary-light)] rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-[var(--color-gray-light)] mb-1">
                  {" "}
                  المدينة
                </label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="الرياض / جدة / عمان ..."
                  className="w-full px-4 py-2.5 border border-[var(--color-primary-light)] rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                {errors.city && (
                  <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-[var(--color-gray-light)] mb-1">
                  {" "}
                  التخصص
                </label>
                <select
                  name="specialty"
                  value={form.specialty}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-[var(--color-primary-light)] rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="">اختر تخصص العيادة</option>
                  <option value="عام">طبيب عام</option>
                  <option value="أسنان">أسنان</option>
                  <option value="جلدية">جلدية</option>
                  <option value="أطفال">أطفال</option>
                  <option value="نسائية">نسائية وتوليد</option>
                  <option value="باطنية">باطنية</option>
                  <option value="عظام">عظام</option>
                  <option value="عيون">عيون</option>
                </select>
                {errors.specialty && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.specialty}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-[var(--color-gray-light)] mb-1">
                  {" "}
                  موقع العيادة (اختياري)
                </label>
                <input
                  name="website"
                  type="url"
                  value={form.website}
                  onChange={handleChange}
                  placeholder="https://clinic.example"
                  className="w-full px-4 py-2.5 border border-[var(--color-primary-light)] rounded-lg bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>
            </div>
          </div>

          {/* وصف مختصر */}
          <div>
            <label className="block text-sm text-[var(--color-gray-light)] mb-1">
              {" "}
              وصف مختصر عن العيادة
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="عرّفنا عن خدماتك وأوقات الدوام..."
              className="w-full px-4 py-2.5 border border-[var(--color-primary-light)] rounded-lg bg-white text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          {/* الإرسال */}
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              بإرسالك هذا الطلب، فإنك توافق على شروط الاستخدام وسياسة الخصوصية.
            </p>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-white bg-[var(--color-primary-dark)] hover:bg-[var(--color-primary)] transition"
            >
              إنشاء حساب للعيادة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
