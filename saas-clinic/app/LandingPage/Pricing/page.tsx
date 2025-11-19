"use client";

import { useTheme } from "@/context/ThemeContext";
import { useLanguage } from "@/context/LanguageContext";
import { translations } from "@/lib/translations";
import "./pricing.css";
import Link from "next/link";

export default function PricingSection() {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const t = translations[language as keyof typeof translations];

  const plans = [
    {
      name: t.basicPlan,
      price: "29",
      desc: t.basicDesc,
      features: [t.feature1, t.feature2, t.feature3],
      popular: false,
    },
    {
      name: t.proPlan,
      price: "59",
      desc: t.proDesc,
      features: [t.feature1, t.feature2, t.feature3, t.feature4],
      popular: true,
    },
    {
      name: t.enterprisePlan,
      price: "99",
      desc: t.enterpriseDesc,
      features: [t.featureBig1, t.featureBig2, t.featureBig3],
      popular: false,
    },
  ];

  return (
    <section id="pricing" className={`pricing-section ${isDark ? "night-mode" : ""}`}>
      <div className="pricing-header">
        <h2 className="pricing-title">{t.pricingTitle}</h2>
        <p className="pricing-subtitle">{t.pricingSubtitle}</p>
      </div>

      <div className="pricing-cards">
        {plans.map((plan, idx) => (
          <div key={idx} className={`price-card ${plan.popular ? "popular" : ""}`}>
            {plan.popular && <div className="popular-badge">{t.mostPopular}</div>}
            
            <h3 className="plan-name">{plan.name}</h3>
            <p className="plan-desc">{plan.desc}</p>
            <div className="price">
              <span className="currency">$</span>
              <span className="amount">{plan.price}</span>
              <span className="period">/mo</span>
            </div>

            <ul className="features-list">
              {plan.features.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
 <Link href="/join-us" className="choose-btn">
  {t.choosePlan}
</Link>

     
          </div>
        ))}
      </div>
    </section>
  );
}
