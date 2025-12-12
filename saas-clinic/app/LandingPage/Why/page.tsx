"use client";

import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import { FiClock, FiUserCheck, FiTrendingUp, FiHeadphones } from "react-icons/fi";
import "./why.modules.css";

export default function WhyUsSection() {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  const cards = [
    { title: t.fastBooking, description: t.fastBookingDesc, icon: <FiClock size={50} className="text-teal-600" /> },
    { title: t.patientTracking, description: t.patientTrackingDesc, icon: <FiUserCheck size={50} className="text-teal-600" /> },
    { title: t.workflow, description: t.workflowDesc, icon: <FiTrendingUp size={50} className="text-teal-600" /> },
    { title: t.support, description: t.supportDesc, icon: <FiHeadphones size={50} className="text-teal-600" /> },
  ];

  return (
    <section id="why-us" className={`why-us-section ${isDark ? "night-mode" : ""}`}>
      <div className="section-Why">
        
<div className='section-header' >
        <h2 className="section-title">{t.whyU}</h2>
        <p className="section-subtitle">{t.whyUsSubtitle}</p>
</div>
        <div className="cards">
          {cards.map((card, idx) => (
            <div key={idx} className="card">
              <div className="card-icon">{card.icon}</div>
              <h3 className="card-title">{card.title}</h3>
              <p className="card-desc">{card.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
