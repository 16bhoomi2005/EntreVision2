import React from "react";
import { Sprout, MapPin, Award, Landmark } from "lucide-react";

export default function TrustStats() {
  const stats = [
    {
      val: "25+",
      lbl: "Business Models",
      icon: <Sprout size={18} color="var(--ok)" />,
    },
    {
      val: "10",
      lbl: "Locations",
      icon: <MapPin size={18} color="var(--cyan)" />,
    },
    {
      val: "Research",
      lbl: "Grounded",
      icon: <Award size={18} color="var(--violet)" />,
    },
    {
      val: "Government",
      lbl: "Assistance",
      icon: <Landmark size={18} color="var(--electric-blue)" />,
    },
  ];

  return (
    <div className="trust-strip-grid">
      {stats.map((item, idx) => (
        <div key={idx} className="trust-card">
          <div className="trust-val">
            {item.val}
            {item.icon}
          </div>
          <div className="trust-lbl">{item.lbl}</div>
        </div>
      ))}
    </div>
  );
}
