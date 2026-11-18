import React, { useState, useEffect } from "react";
import { LineChart, TrendingUp, TrendingDown, Calendar, MapPin, DollarSign, Activity, AlertCircle } from "lucide-react";
import { fetchPriceForecast } from "../services/api";

export default function MarketRates() {
  const [forecastData, setForecastData] = useState(null);
  const [loadingForecast, setLoadingForecast] = useState(true);

  useEffect(() => {
    async function loadForecast() {
      try {
        const data = await fetchPriceForecast();
        setForecastData(data);
      } catch (err) {
        console.error("Failed to load live mandi price forecast:", err);
      } finally {
        setLoadingForecast(false);
      }
    }
    loadForecast();
  }, []);

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

      {/* Live M2 Mandi Price Forecaster */}
      {forecastData && (
        <div
          className="card"
          style={{
            marginBottom: 24,
            padding: "24px",
            background: "var(--panel)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(249, 115, 22, 0.15)", display: "grid", placeItems: "center" }}>
                <TrendingUp size={20} color="var(--citrus-orange)" />
              </div>
              <div>
                <strong style={{ fontSize: "1.1rem", color: "var(--text-heading)" }}>
                  M2 LIVE PRICE FORECASTER & MARKET ADVISORY
                </strong>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block" }}>
                  Trained on historical APMC arrivals and daily modal rates with 14-day linear trend regression
                </span>
              </div>
            </div>

            <span
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                padding: "4px 12px",
                borderRadius: 20,
                background: forecastData.Current_Trend?.includes("Uptrend") ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
                color: forecastData.Current_Trend?.includes("Uptrend") ? "var(--ok)" : "#f87171",
                border: `1px solid ${forecastData.Current_Trend?.includes("Uptrend") ? "rgba(34, 197, 94, 0.35)" : "rgba(239, 68, 68, 0.35)"}`,
              }}
            >
              {forecastData.Current_Trend}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 20 }}>
            <div style={{ background: "var(--panel-subtle)", padding: "14px", borderRadius: 12, border: "1px solid var(--line)" }}>
              <span className="field-label" style={{ margin: 0, fontSize: "0.72rem" }}>Latest Modal Mandi Rate</span>
              <strong style={{ fontSize: "1.35rem", color: "var(--text-heading)", display: "block", marginTop: 4 }}>
                ₹{forecastData.Latest_Price_Rs?.toLocaleString()} <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 400 }}>/ Quintal</span>
              </strong>
              <span style={{ fontSize: "0.8rem", color: "var(--citrus-orange)" }}>
                ≈ ₹{(forecastData.Latest_Price_Rs / 100).toFixed(1)} / kg
              </span>
            </div>

            <div style={{ background: "var(--panel-subtle)", padding: "14px", borderRadius: 12, border: "1px solid var(--line)" }}>
              <span className="field-label" style={{ margin: 0, fontSize: "0.72rem" }}>Historical Seasonal Average</span>
              <strong style={{ fontSize: "1.35rem", color: "var(--text-heading)", display: "block", marginTop: 4 }}>
                ₹{forecastData.Historical_Average?.toLocaleString()} <span style={{ fontSize: "0.8rem", color: "var(--muted)", fontWeight: 400 }}>/ Quintal</span>
              </strong>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                Baseline across Kalamna & Katol
              </span>
            </div>

            <div style={{ background: "var(--panel-subtle)", padding: "14px", borderRadius: 12, border: "1px solid var(--line)" }}>
              <span className="field-label" style={{ margin: 0, fontSize: "0.72rem" }}>Daily Price Velocity (Slope)</span>
              <strong style={{ fontSize: "1.35rem", color: forecastData.Daily_Change_Rate >= 0 ? "var(--ok)" : "#f87171", display: "block", marginTop: 4 }}>
                {forecastData.Daily_Change_Rate >= 0 ? "+" : ""}{forecastData.Daily_Change_Rate} ₹/day
              </strong>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                14-day velocity momentum
              </span>
            </div>
          </div>

          {/* Actionable Market Advice */}
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              background: "rgba(249, 115, 22, 0.12)",
              border: "1px solid rgba(249, 115, 22, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <AlertCircle size={20} color="var(--citrus-orange)" style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: "0.88rem", color: "var(--text-heading)", display: "block" }}>
                DECISION ENGINE ADVISORY FOR GROWERS & PROCESSORS:
              </strong>
              <span style={{ fontSize: "0.85rem", color: "var(--text)" }}>
                {forecastData.Market_Advice}
              </span>
            </div>
          </div>

          {/* 7-Day Predicted Trajectory Cards with Uncertainty Intervals */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
              <span style={{ fontSize: "0.78rem", color: "var(--muted)", fontWeight: 700, textTransform: "uppercase" }}>
                7-Day Predicted Price Trajectory & 95% Empirical Prediction Interval (₹ / Quintal):
              </span>
              <span style={{ fontSize: "0.72rem", color: "var(--cyan)", background: "rgba(6, 182, 212, 0.12)", padding: "2px 8px", borderRadius: 12 }}>
                Expanding Horizon Uncertainty: ±1.96 · RMSE · √(1 + h/10)
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
              {forecastData.Forecast_Next_7_Days?.map((f, i) => (
                <div
                  key={i}
                  style={{
                    textAlign: "center",
                    padding: "12px 6px",
                    background: "rgba(255, 255, 255, 0.04)",
                    borderRadius: 10,
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                  }}
                >
                  <span style={{ fontSize: "0.72rem", color: "var(--muted)", display: "block", fontWeight: 600 }}>Day {f.day}</span>
                  <strong style={{ fontSize: "1.05rem", color: "var(--text-heading)", display: "block", marginTop: 4 }}>
                    ₹{Math.round(f.predicted_price)}
                  </strong>
                  <span style={{ fontSize: "0.72rem", color: "var(--citrus-orange)", display: "block", marginTop: 2 }}>
                    ≈ ₹{(f.predicted_price / 100).toFixed(1)}/kg
                  </span>
                  {f.lower_bound && f.upper_bound && (
                    <div style={{ marginTop: 6, paddingTop: 6, borderTop: "1px dashed rgba(255, 255, 255, 0.1)", fontSize: "0.68rem", color: "var(--muted)" }}>
                      Range: <span style={{ color: "var(--text)" }}>₹{Math.round(f.lower_bound)} – ₹{Math.round(f.upper_bound)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chronological Validation & Model Accuracy Metrics */}
          {forecastData.Evaluation_Metrics && (
            <div
              style={{
                padding: "14px 16px",
                background: "var(--panel-subtle)",
                borderRadius: 12,
                border: "1px solid var(--line)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Activity size={16} color="var(--cyan)" />
                  <strong style={{ fontSize: "0.82rem", color: "var(--text-heading)", textTransform: "uppercase" }}>
                    Chronological Model Evaluation & Error Benchmarks
                  </strong>
                </div>
                <span style={{ fontSize: "0.72rem", color: "var(--ok)", background: "rgba(34, 197, 94, 0.12)", padding: "2px 10px", borderRadius: 12, fontWeight: 600 }}>
                  Selected: {forecastData.Evaluation_Metrics.selected_model}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 10 }}>
                <div style={{ background: "rgba(0,0,0,0.15)", padding: "8px 12px", borderRadius: 8 }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--muted)", display: "block" }}>Out-of-Sample MAE</span>
                  <strong style={{ fontSize: "0.95rem", color: "var(--text-heading)" }}>
                    ₹{forecastData.Evaluation_Metrics.MAE} <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>/ qtl</span>
                  </strong>
                </div>
                <div style={{ background: "rgba(0,0,0,0.15)", padding: "8px 12px", borderRadius: 8 }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--muted)", display: "block" }}>Out-of-Sample RMSE</span>
                  <strong style={{ fontSize: "0.95rem", color: "var(--text-heading)" }}>
                    ₹{forecastData.Evaluation_Metrics.RMSE} <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>/ qtl</span>
                  </strong>
                </div>
                <div style={{ background: "rgba(0,0,0,0.15)", padding: "8px 12px", borderRadius: 8 }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--muted)", display: "block" }}>Mean Abs Error Rate (MAPE)</span>
                  <strong style={{ fontSize: "0.95rem", color: "var(--text-heading)" }}>
                    {forecastData.Evaluation_Metrics.MAPE_pct}%
                  </strong>
                </div>
                <div style={{ background: "rgba(0,0,0,0.15)", padding: "8px 12px", borderRadius: 8 }}>
                  <span style={{ fontSize: "0.7rem", color: "var(--muted)", display: "block" }}>Validation Strategy</span>
                  <strong style={{ fontSize: "0.75rem", color: "var(--text)" }}>
                    Strict Temporal (No Lookahead)
                  </strong>
                </div>
              </div>

              <p style={{ margin: 0, fontSize: "0.72rem", color: "var(--muted)", lineHeight: 1.4 }}>
                ℹ️ <strong>Academic & Banking Transparency Notice:</strong> Forecasts are empirical statistical estimates accompanied by prediction intervals and measured test errors. Prices are not guaranteed and will vary with APMC daily arrivals and festive demand spikes.
              </p>
            </div>
          )}
        </div>
      )}

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
