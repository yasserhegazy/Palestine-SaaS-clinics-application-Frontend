"use client";

import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import {
  FiFileText,
  FiClipboard,
  FiUser,
  FiActivity,
  FiFile,
  FiDollarSign,
  FiCalendar
} from "react-icons/fi";
import "./featuers.css";

export default function FeaturesSection() {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  const features = [
    { icon: <FiUser size={40} className="text-teal-600"/>, title: t.patientInfo, desc: t.patientInfoDesc },
    { icon: <FiClipboard size={40} className="text-teal-600"/>, title: t.medicalRecords, desc: t.medicalRecordsDesc },
    { icon: <FiFileText size={40} className="text-teal-600"/>, title: t.prescriptions, desc: t.prescriptionsDesc },
    { icon: <FiFile size={40} className="text-teal-600"/>, title: t.images, desc: t.imagesDesc },
    { icon: <FiActivity size={40} className="text-teal-600"/>, title: t.reports, desc: t.reportsDesc },
    { icon: <FiUser size={40} className="text-teal-600"/>, title: t.staff, desc: t.staffDesc },
    { icon: <FiDollarSign size={40} className="text-teal-600"/>, title: t.billing, desc: t.billingDesc },
    { icon: <FiCalendar size={40} className="text-teal-600"/>, title: t.appointments, desc: t.appointmentsDesc },
  ];

  return (
    <section id="features" className={`features-section ${isDark ? "dark-mode" : ""}`}>
      <div className="features-container">
        <div className="features-header">
          <h2 className="features-title">{t.feature}</h2>
          <p className="features-subtitle">{t.featuresSubtitle}</p>
        </div>

        <div className="features-grid">
          {features.map((feature, idx) => (
            <div key={idx} className="feature-item">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-item-title">{feature.title}</h3>
              <p className="feature-item-desc">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
