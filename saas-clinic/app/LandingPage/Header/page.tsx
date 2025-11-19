"use client";

import Link from "next/link";
import { useState } from "react";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTheme } from "@/context/ThemeContext";
import "./header.css";

export default function Header() {
  const { isDark, toggleDark } = useTheme();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("");
  const { language } = useLanguage();

  const t = translations[language as keyof typeof translations];

  const navLinks = [
    { key: "whyUs", href: "#why-us" },
    { key: "features", href: "#features" },
    { key: "easyFast", href: "#easy" },
    { key: "pricing", href: "#pricing" },
  ];

  return (
    <header className={isDark ? "landing-header dark" : "landing-header"}>
      <div className="landing-header__inner">
        {/* Logo */}
        <Link href="/" className="logo">
          <img src="/assets/logo.png" alt="Palestine Clinics" />
          <div className="logo-text">{t.yourClinic}</div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="nav-links desktop-only">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={activeLink === link.href ? "active-nav" : ""}
              onClick={() => setActiveLink(link.href)}
            >
              {t[link.key as keyof typeof t]}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="actions flex items-center gap-4">
          {/* Desktop Actions */}
          <div className="desktop-only flex items-center gap-3">
            <button
              className="dark-toggle"
              onClick={toggleDark}
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={24} /> : <Moon size={24} />}
            </button>

            <LanguageSwitcher />

            <Link href="/join-us" className="btn btn-outline">
              {t.freeTrial}
            </Link>
            <Link href="/login" className="btn btn-primary">
              {t.login}
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="mobile-only flex items-center gap-2">
            <LanguageSwitcher />

            <button
              className="dark-toggle"
              onClick={toggleDark}
              aria-label="Toggle dark mode"
            >
              {isDark ? <Sun size={24} /> : <Moon size={24} />}
            </button>

            <button
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? "open" : ""}`}>
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={activeLink === link.href ? "active-nav" : ""}
            onClick={() => {
              setActiveLink(link.href);
              setMobileMenuOpen(false);
            }}
          >
            {t[link.key as keyof typeof t]}
          </Link>
        ))}

        <Link href="/join-us" className="btn btn-primary">
          {t.freeTrial}
        </Link>
        <Link href="/login" className="btn btn-secondary">
          {t.login}
        </Link>
      </div>
    </header>
  );
}
