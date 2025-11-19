"use client";

import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import "./footer.css";

export default function Footer() {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  const quickLinks = [
    { key: "whyUs", href: "#why-us" },
    { key: "features", href: "#features" },
    { key: "easyFast", href: "#easy" },
    { key: "pricing", href: "#pricing" },
  ];

  return (
    <footer className={isDark ? "footer dark" : "footer"}>
      <div className="footer-container">
        <div className="footer-left">
          <Link href="/" className="footer-logo">
            <img src="/assets/logo.png" alt="Your Clinic Logo" />
            <h2 className="footer-title">{t.yourClinic}</h2>
          </Link>
       <p className="footer-copy">
  &copy; {new Date().getFullYear()} {t.yourClinic}. {t.rightsReserved}
</p>

        </div>

        <div className="footer-links">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href} className="footer-link">
              {t[link.key as keyof typeof t]}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
