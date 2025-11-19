"use client";

import "./landing.css";
import Header from "./Header/page";
import HeroSection from "./HeroSection/page";
import WhyUsSection from "./Why/page";
import FeaturesSection from "./Featuers/page";
import EasyStepsSection from "./How/page";
import PricingSection from "./Pricing/page";
import Footer from "./Footer/page";

export default function LandingPage() {
  return (
    <div className="landing-page">
      <Header />
      <HeroSection />
      <WhyUsSection />
      <FeaturesSection />
      <EasyStepsSection />
      <PricingSection />
      <Footer />
    </div>
  );
}
