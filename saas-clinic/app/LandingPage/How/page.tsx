"use client";

import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import "./how.css";

export default function EasyStepsParallaxSection() {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  const steps = [
    { number: 1, title: t.step1Title, description: t.step1Desc },
    { number: 2, title: t.step2Title, description: t.step2Desc },
    { number: 3, title: t.step3Title, description: t.step3Desc },
    { number: 4, title: t.step4Title, description: t.step4Desc },
  ];

  return (
    <section
      id="easy"
      className={` easy-steps-parallax-section ${isDark ? "night-mode" : ""}`}
    >
      <div className="overlay">
        <div className="steps-header">
          <h2 className="section-title">{t.easyFast}</h2>
          <p className="section-subtitle">{t.easyFastSubtitle}</p>
        </div>
        <div className="steps-container">
          {steps.map((step) => (
            <div key={step.number} className="step-item">
              <div className="step-number">{step.number}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
