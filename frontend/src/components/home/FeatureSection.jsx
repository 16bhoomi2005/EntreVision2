import React from "react";
import { MapPin, BarChart3, Coins } from "lucide-react";

export default function FeatureSection() {
  const features = [
    {
      title: "LOCATION-AWARE",
      desc: "Recommendations consider your local ecosystem, markets and infrastructure.",
      icon: "📍",
      accentColor: "var(--cyan)",
    },
    {
      title: "DATA-GROUNDED",
      desc: "Opportunities are supported by agricultural research and government sources.",
      icon: "📊",
      accentColor: "var(--electric-blue)",
    },
    {
      title: "FINANCIAL ASSISTANCE",
      desc: "Explore relevant government schemes and funding possibilities for your opportunity.",
      icon: "💰",
      accentColor: "var(--ok)",
    },
  ];

  return (
    <section className="section-wrapper">
      <div className="section-header">
        <span className="section-eyebrow">Key Capabilities</span>
        <h2 className="section-heading">Built For Precision Entrepreneurship</h2>
      </div>

      <div className="features-grid-3">
        {features.map((item, idx) => (
          <div key={idx} className="feature-glass-card">
            <div className="feature-icon-wrapper">
              <span>{item.icon}</span>
            </div>
            <h3 className="feature-heading">{item.title}</h3>
            <p className="feature-body">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
