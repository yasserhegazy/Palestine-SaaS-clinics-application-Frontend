"use client";

import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import "./heroSection.css";

export default function HeroSection() {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  return (
    <section className={`hero-section ${isDark ? "night-mode" : ""}`}>
      <div className="hero-overlay"></div>
      
      <div className="hero-content">
        <h1 className="hero-title">
          {t.welcomeTo} <span className="text-primary-light">{t.palestineClinics}</span>
        </h1>
        <p className="hero-subtitle">{t.heroSubtitle}</p>

        <div className="hero-buttons">
          <Link href="/login" className="btn-primary">
            {t.login}
          </Link>
          <Link href="/join-us" className="btn-outline">
            {t.freeTrial}
          </Link>
        </div>
      </div>
    </section>
  );
}
