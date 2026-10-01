import React from "react";
import { UserCheck, Layers, Compass, Rocket, Check } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "UNDERSTAND YOU",
      points: ["Skills", "Experience", "Certificates"],
      icon: <UserCheck size={20} color="var(--cyan)" />,
      accent: "var(--cyan)",
    },
    {
      num: "02",
      title: "ANALYZE YOUR RESOURCES",
      points: ["Land", "Equipment", "Investment"],
      icon: <Layers size={20} color="var(--electric-blue)" />,
      accent: "var(--electric-blue)",
    },
    {
      num: "03",
      title: "EXPLORE YOUR LOCATION",
      points: ["Markets", "Infrastructure", "Ecosystem"],
      icon: <Compass size={20} color="var(--violet)" />,
      accent: "var(--violet)",
    },
    {
      num: "04",
      title: "BUILD YOUR PLAN",
      points: ["Finance", "Schemes", "Roadmap"],
      icon: <Rocket size={20} color="var(--ok)" />,
      accent: "var(--ok)",
    },
  ];

  return (
    <section id="how-it-works" className="section-wrapper">
      <div className="section-header">
        <span className="section-eyebrow">Interactive Process</span>
        <h2 className="section-heading">HOW ENTRE VISION WORKS</h2>
        <p style={{ color: "var(--muted)", margin: "6px 0 0", fontSize: "0.95rem" }}>
          Understand your profile → Analyze suitability → Explore opportunities → Build your business.
        </p>
      </div>

      <div className="steps-horizontal-grid">
        {steps.map((step, idx) => (
          <div key={idx} className="step-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div className="step-num-badge">{step.num}</div>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "var(--panel-subtle)",
                  border: "1px solid var(--line)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {step.icon}
              </div>
            </div>

            <h3 className="step-card-title">{step.title}</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
              {step.points.map((pt, pIdx) => (
                <div
                  key={pIdx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: "0.85rem",
                    color: "var(--muted)",
                  }}
                >
                  <div
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      background: step.accent,
                    }}
                  />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
