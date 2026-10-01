import React from "react";
import { LineChart, TrendingUp, Calendar, MapPin, DollarSign } from "lucide-react";

export default function MarketRates() {
  const seasons = [
    {
      name: "Ambiya Bahar (Summer Crop)",
      flowering: "January — February",
      harvesting: "September — December",
      avgMandiRate: "₹25 — ₹45 / kg",
      exportRate: "₹65 — ₹95 / kg",
      characteristics: "High TSS (°Brix 10–12), smooth golden peel, strong domestic Diwali and Durga Puja festive demand."
    },
    {
      name: "Mrig Bahar (Winter Crop)",
      flowering: "June — July (Monsoon)",
      harvesting: "February — April",
      avgMandiRate: "₹35 — ₹60 / kg",
      exportRate: "₹80 — ₹120 / kg",
      characteristics: "Deep orange coloration, tighter peel, superior juice yield (42%), highly preferred for Middle East & Bangladesh exports."
    }
  ];

  const grades = [
    {
      grade: "Grade A (Export / Premium Retail)",
      diameter: "70 mm — 80 mm",
      priceRange: "₹55 — ₹90 / kg",
      channels: "APEDA exports (UAE, Qatar, Bangladesh), Tier-1 supermarket chains, quick commerce."
    },
    {
      grade: "Grade B (Domestic Table Consumption)",
      diameter: "60 mm — 70 mm",
      priceRange: "₹30 — ₹50 / kg",
      channels: "Kalamna APMC wholesale, Mumbai Vashi APMC, Delhi Azadpur Mandi, local fruit stalls."
    },
    {
      grade: "Grade C & Processing Cull",
      diameter: "< 60 mm / Minor blemishes",
      priceRange: "₹12 — ₹22 / kg",
      channels: "Industrial RTS beverage processors, squash/jam manufacturers, essential oil cold pressing."
    }
  ];

  return (
    <div>
      <div className="card" style={{ marginBottom: 24 }}>
        <span className="pill">Vidarbha Mandi & APMC Intelligence</span>
        <h2 style={{ margin: "8px 0 4px", fontSize: "1.5rem" }}>
          Nagpur Mandarin Market Price & Seasonality Dynamics
        </h2>
        <p className="muted" style={{ margin: 0 }}>
          Commercial price benchmarks across harvesting seasons, fruit grading tiers, and farm-gate to APMC wholesale realisations.
        </p>
      </div>

      {/* 2 Bahar Seasons */}
      <h3 style={{ margin: "0 0 16px", fontSize: "1.2rem", fontWeight: 800 }}>Seasonal Cropping Cycles</h3>
      <div className="grid" style={{ marginTop: 0, marginBottom: 24 }}>
        {seasons.map((s, idx) => (
          <div key={idx} className="card">
            <span className="tag" style={{ fontSize: "0.75rem" }}>{s.name}</span>
            <div style={{ display: "flex", justifyContent: "space-between", margin: "12px 0 8px" }}>
              <div>
                <span className="field-label" style={{ margin: 0 }}>Harvest Window</span>
                <strong>{s.harvesting}</strong>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className="field-label" style={{ margin: 0 }}>Avg Mandi Price</span>
                <strong style={{ color: "var(--ok)" }}>{s.avgMandiRate}</strong>
              </div>
            </div>
            <p className="muted" style={{ fontSize: "0.85rem", lineHeight: 1.5, margin: "8px 0 12px" }}>
              {s.characteristics}
            </p>
            <div className="match" style={{ marginTop: 0, padding: 8 }}>
              <small>EXPORT REALISATION</small>
              <span style={{ display: "block", fontWeight: 700, fontSize: "0.9rem", color: "var(--accent)" }}>{s.exportRate}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Grading & Pricing Tier */}
      <h3 style={{ margin: "0 0 16px", fontSize: "1.2rem", fontWeight: 800 }}>Commercial Grading & Industrial Realisation</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {grades.map((g, idx) => (
          <div key={idx} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <strong style={{ fontSize: "1.05rem", color: "var(--text)" }}>{g.grade}</strong>
              <div style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: 4 }}>
                Size: {g.diameter} • Target: {g.channels}
              </div>
            </div>
            <div style={{ background: "var(--panel-2)", border: "1px solid var(--line)", padding: "8px 18px", borderRadius: 12, textAlign: "right" }}>
              <span className="field-label" style={{ margin: 0 }}>Farm-Gate Realisation</span>
              <span style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--accent)" }}>{g.priceRange}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
