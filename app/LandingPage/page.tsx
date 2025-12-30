"use client";

import { useState, useEffect } from "react";
import "./landing.css";
import Header from "./Header/page";
import HeroSection from "./HeroSection/page";
import WhyUsSection from "./Why/page";
import FeaturesSection from "./Featuers/page";
import EasyStepsSection from "./How/page";
import PricingSection from "./Pricing/page";
import Footer from "./Footer/page";

export default function LandingPage() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="landing-page">
      <Header />
      <HeroSection />
      <WhyUsSection />
      <FeaturesSection />
      <EasyStepsSection />
      <PricingSection />
      <Footer />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="scroll-to-top"
          aria-label="Scroll to top"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
      )}
    </div>
  );
}
