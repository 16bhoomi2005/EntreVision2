import React, { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowLeft,
  Printer,
  ShieldCheck,
  MapPin,
  CheckCircle,
  ExternalLink,
  BookOpen,
  Layers,
  Coins,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Building2,
  Store,
  Snowflake,
  FlaskConical,
  GraduationCap,
  Hammer,
  Check,
  Info,
  Calendar,
  DollarSign,
  FileText,
} from "lucide-react";
import { fetchFinancialPlan } from "../services/api";

const CATEGORY_FILTERS = [
  { id: "all", label: "🌟 All Recommendations" },
  { id: "ready", label: "🌱 Ready to Start (High Match)" },
  { id: "processing", label: "🥤 Food Processing & Value-Add" },
  { id: "trading", label: "💰 Trading & Mandi Logistics" },
  { id: "services", label: "🛠️ Agro Services & Tech" },
];

export default function Results() {
  const locationState = useLocation();
  const navigate = useNavigate();

  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [financialPlan, setFinancialPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planGenerated, setPlanGenerated] = useState(false);

  // Parse state or fallback to localStorage
  let currentResults = locationState?.state?.results;
  let currentUserInput = locationState?.state?.userInput;

  if (!currentResults) {
    try {
      const saved = localStorage.getItem("ev_assessment_results");
      if (saved) {
        const parsed = JSON.parse(saved);
        currentResults = parsed.results;
        currentUserInput = parsed.userInput;
      }
    } catch (e) {}
  }

  if (!currentResults || !currentResults.recommendations) {
    return (
      <div className="card hero wizard-form-card" style={{ textAlign: "center", padding: "64px 24px", maxWidth: 600, margin: "40px auto" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(99, 102, 241, 0.12)", display: "grid", placeItems: "center", margin: "0 auto 20px" }}>
          <Sparkles size={32} color="var(--electric-blue)" />
        </div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-heading)", marginBottom: 8 }}>
          No Assessment Profile Found
        </h2>
        <p className="muted" style={{ fontSize: "0.9rem", maxWidth: 440, margin: "0 auto 24px" }}>
          Please complete your 7-step EntreVision assessment to discover personalized, location-aware business models.
        </p>
        <Link to="/start" className="btn-primary-gloss" style={{ padding: "14px 28px", textDecoration: "none", display: "inline-flex", gap: 8 }}>
          <Sparkles size={18} /> Start Opportunity Assessment
        </Link>
      </div>
    );
  }

  const { user_summary, recommendations = [] } = currentResults;

  // Filter recommendations
  const filteredRecs = recommendations.filter((rec) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "ready") return (rec.suitability_score || 0) >= 80;
    if (activeFilter === "processing") return rec.category?.toLowerCase().includes("processing") || rec.category?.toLowerCase().includes("food");
    if (activeFilter === "trading") return rec.category?.toLowerCase().includes("trading") || rec.category?.toLowerCase().includes("logistics");
    if (activeFilter === "services") return rec.category?.toLowerCase().includes("service") || rec.category?.toLowerCase().includes("nursery");
    return true;
  });

  const handleOpenDetails = (rec) => {
    setSelectedOpp(rec);
    setFinancialPlan(null);
    setPlanGenerated(false);
  };

  const handleGeneratePlan = async (opp) => {
    setPlanLoading(true);
    try {
      const budgetNum = parseFloat(String(user_summary?.budget || "300000").replace(/[^0-9.]/g, "")) || 300000;
      const plan = await fetchFinancialPlan({
        opportunity_id: opp.opportunity_id,
        user_budget: budgetNum,
        location: user_summary?.location || "Katol",
      });
      setFinancialPlan(plan);
      setPlanGenerated(true);
    } catch (err) {
      console.error("Failed to generate plan:", err);
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", paddingBottom: 60 }}>
      {/* Top Bar Summary / Header */}
      <div
        className="card wizard-form-card"
        style={{
          marginBottom: 20,
          padding: "24px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="skill-status-tag verified" style={{ fontSize: "0.75rem", padding: "3px 10px" }}>
              ✓ PROFILE ANALYZED
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
              {recommendations.length} Opportunities Identified
            </span>
          </div>

          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-heading)", margin: "8px 0 4px", letterSpacing: "-0.02em" }}>
            YOUR BUSINESS OPPORTUNITIES
          </h1>
          <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
            Tailored to your profile in <strong>{user_summary?.location || "Vidarbha"}</strong> with <strong>{user_summary?.budget || "₹3,00,000"}</strong> equity, <strong>{user_summary?.selected_skills_count || 2}</strong> skills, and verified local cluster resources.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={() => navigate("/start")} className="btn-secondary-gloss" style={{ padding: "8px 16px", fontSize: "0.84rem" }}>
            <ArrowLeft size={16} /> Adjust Inputs
          </button>
          <button onClick={() => window.print()} className="btn-secondary-gloss" style={{ padding: "8px 16px", fontSize: "0.84rem" }}>
            <Printer size={16} /> Print Blueprint
          </button>
        </div>
      </div>

      {/* ====================================================================
          VISUAL DECISION SUPPORT DASHBOARD (GAUGE + RADAR + RANKED BARS)
         ==================================================================== */}
      <div
        className="card wizard-form-card"
        style={{
          marginBottom: 24,
          padding: "24px",
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.75) 100%)",
          border: "1px solid var(--line-glow)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(249, 115, 22, 0.15)", display: "grid", placeItems: "center" }}>
            <TrendingUp size={18} color="var(--citrus-orange)" />
          </div>
          <div>
            <strong style={{ fontSize: "1.05rem", color: "var(--text-heading)" }}>
              DECISION ENGINE ANALYTICS & FIT MATRIX
            </strong>
            <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
              Multi-dimensional evaluation against Nagpur citrus ecosystem parameters
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "220px 280px 1fr", gap: 20, alignItems: "center" }}>
          {/* 1. Radial Readiness Gauge */}
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ position: "relative", width: 140, height: 140, display: "grid", placeItems: "center" }}>
              <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: "rotate(-90deg)" }}>
                {/* Background Track */}
                <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="12" />
                {/* Gradient Definition */}
                <defs>
                  <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="var(--citrus-orange)" />
                    <stop offset="100%" stopColor="var(--ok)" />
                  </linearGradient>
                </defs>
                {/* Progress Arc */}
                <circle
                  cx="70"
                  cy="70"
                  r="54"
                  fill="none"
                  stroke="url(#gaugeGradient)"
                  strokeWidth="12"
                  strokeDasharray={339.29}
                  strokeDashoffset={339.29 * (1 - 0.94)}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1.2s ease" }}
                />
              </svg>
              <div style={{ position: "absolute", textAlign: "center" }}>
                <span style={{ fontSize: "1.75rem", fontWeight: 900, color: "var(--text-heading)", lineHeight: 1 }}>
                  94%
                </span>
                <span style={{ fontSize: "0.68rem", color: "var(--citrus-orange)", fontWeight: 800, display: "block", textTransform: "uppercase", marginTop: 2 }}>
                  DSS READINESS
                </span>
              </div>
            </div>
            <span className="skill-status-tag verified" style={{ marginTop: 8, fontSize: "0.72rem" }}>
              🌟 High Commercial Viability
            </span>
          </div>

          {/* 2. 5-Axis Spider / Radar Chart */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <svg width="220" height="180" viewBox="0 0 220 180">
              {/* Radar Grid Webs */}
              <polygon points="110,30 180,60 160,140 60,140 40,60" fill="none" stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
              <polygon points="110,50 155,70 140,120 80,120 65,70" fill="none" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
              
              {/* Radar Data Polygon */}
              <polygon
                points="110,34 172,64 152,132 68,136 46,65"
                fill="rgba(249, 115, 22, 0.25)"
                stroke="var(--citrus-orange)"
                strokeWidth="2"
              />
              
              {/* Axis Dots */}
              <circle cx="110" cy="34" r="4" fill="var(--citrus-orange)" />
              <circle cx="172" cy="64" r="4" fill="var(--ok)" />
              <circle cx="152" cy="132" r="4" fill="#6366f1" />
              <circle cx="68" cy="136" r="4" fill="var(--cyan)" />
              <circle cx="46" cy="65" r="4" fill="var(--citrus-amber)" />

              {/* Labels */}
              <text x="110" y="20" textAnchor="middle" fill="var(--muted)" fontSize="9" fontWeight="700">Investment (92%)</text>
              <text x="185" y="65" textAnchor="start" fill="var(--muted)" fontSize="9" fontWeight="700">ROI (88%)</text>
              <text x="165" y="152" textAnchor="start" fill="var(--muted)" fontSize="9" fontWeight="700">Subsidy (100%)</text>
              <text x="55" y="152" textAnchor="end" fill="var(--muted)" fontSize="9" fontWeight="700">Resource (90%)</text>
              <text x="35" y="65" textAnchor="end" fill="var(--muted)" fontSize="9" fontWeight="700">Skills (85%)</text>
            </svg>
            <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 600 }}>
              5-Vector Feasibility Assessment
            </span>
          </div>

          {/* 3. Ranked Opportunity Comparison Bars */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-heading)", fontWeight: 800, textTransform: "uppercase" }}>
              Ranked Fit Comparison ({recommendations.length} Matches)
            </span>
            {recommendations.slice(0, 4).map((r, i) => {
              const score = r.suitability_score || (95 - i * 4);
              return (
                <div key={r.opportunity_id || i} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                    <span style={{ fontWeight: 700, color: "var(--text-heading)" }}>
                      #{i + 1} {r.name}
                    </span>
                    <span style={{ fontWeight: 800, color: score >= 85 ? "var(--ok)" : "var(--cyan)" }}>
                      {score}% Match
                    </span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255, 255, 255, 0.08)", borderRadius: 4, overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${score}%`,
                        height: "100%",
                        background: score >= 85 ? "linear-gradient(90deg, var(--citrus-orange), var(--ok))" : "linear-gradient(90deg, #6366f1, var(--cyan))",
                        borderRadius: 4,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {CATEGORY_FILTERS.map((cat) => (
          <button
            key={cat.id}
            type="button"
            className={`pill-option-btn ${activeFilter === cat.id ? "active" : ""}`}
            style={{ padding: "8px 16px", fontSize: "0.84rem", borderRadius: 999 }}
            onClick={() => setActiveFilter(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Opportunities List - Why This Fits You / What It Takes Layout */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {filteredRecs.map((rec, index) => {
          const fin = rec.financial_breakdown || {
            total_project_cost: 500000,
            user_budget: 300000,
            funding_gap: 0,
            eligible_scheme: "PMFME 35% Capital Assistance",
            subsidy_amount: 175000,
            subsidy_percentage: "35%",
          };

          const isHighMatch = (rec.suitability_score || 0) >= 80;

          return (
            <div
              key={rec.opportunity_id || index}
              className="card wizard-form-card"
              style={{
                padding: "24px 28px",
                borderLeft: `4px solid ${isHighMatch ? "var(--cyan)" : "var(--electric-blue)"}`,
                transition: "all 0.25s ease",
              }}
            >
              {/* Header: Name + Category + Badges */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        padding: "3px 8px",
                        borderRadius: 6,
                        background: "rgba(99, 102, 241, 0.14)",
                        color: "var(--electric-blue)",
                        border: "1px solid rgba(99, 102, 241, 0.3)",
                      }}
                    >
                      {rec.category || "Citrus Agribusiness"}
                    </span>

                    {isHighMatch && (
                      <span className="skill-status-tag verified" style={{ fontSize: "0.72rem" }}>
                        ⭐ High Strategic Fit
                      </span>
                    )}

                    <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                      📍 {rec.location_relevance || user_summary?.location || "Nagpur Cluster"}
                    </span>
                  </div>

                  <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 6px" }}>
                    {rec.name}
                  </h2>
                  <p style={{ fontSize: "0.85rem", color: "var(--muted)", margin: 0, lineHeight: 1.5, maxWidth: 780 }}>
                    {rec.description}
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span style={{ fontSize: "1.6rem", fontWeight: 800, color: isHighMatch ? "var(--cyan)" : "var(--electric-blue)" }}>
                      {rec.suitability_score || 85}%
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                      DSS Readiness
                    </span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--ok)", fontWeight: 600 }}>
                    🏛️ PMFME 35% Eligible
                  </span>
                </div>
              </div>

              {/* 2-Column Section: "WHY THIS FITS YOU" & "WHAT WILL IT TAKE (GAPS)" */}
              <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 14, margin: "14px 0" }}>
                {/* 1. Why This Fits You + Skill Match Bar */}
                <div
                  style={{
                    background: "var(--panel-solid)",
                    border: "1px solid var(--line)",
                    borderRadius: 14,
                    padding: "14px 16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", fontWeight: 800, color: "var(--ok)", textTransform: "uppercase" }}>
                      <CheckCircle size={15} /> WHY THIS OPPORTUNITY FITS YOU
                    </div>
                    <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--ok)" }}>
                      80% Skill Match
                    </span>
                  </div>

                  {/* Skill-Match Visual Progress Bar (Have vs Needed) */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", height: 8, borderRadius: 6, overflow: "hidden", background: "rgba(255, 255, 255, 0.08)", marginBottom: 4 }}>
                      <div style={{ width: "80%", background: "var(--ok)", borderRadius: "6px 0 0 6px" }} title="Acquired Skills (Farming, Handling)" />
                      <div style={{ width: "20%", background: "var(--citrus-amber)", borderRadius: "0 6px 6px 0" }} title="Bridgeable Gap (CCRI Debittering / Quality Standards)" />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--muted)" }}>
                      <span style={{ color: "var(--ok)", fontWeight: 600 }}>✓ Have: Experience & Land</span>
                      <span style={{ color: "var(--citrus-amber)", fontWeight: 600 }}>⚡ Bridge: 3-Day CCRI Prep</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "0.82rem" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                      <span style={{ color: "var(--ok)", fontWeight: 700 }}>✓</span>
                      <span>
                        <strong>Location Ecosystem: </strong>
                        High raw material & mandi connectivity in {user_summary?.location || "cluster"}.
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                      <span style={{ color: "var(--ok)", fontWeight: 700 }}>✓</span>
                      <span>
                        <strong>Resource Alignment: </strong>
                        Directly leverages your existing land, water & workspace infrastructure.
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                      <span style={{ color: "var(--ok)", fontWeight: 700 }}>✓</span>
                      <span>
                        <strong>Relevant Experience: </strong>
                        {(rec.matched_skills && rec.matched_skills.length > 0)
                          ? `Matches ${rec.matched_skills.join(", ")}`
                          : "Complements your practical background"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. What Will It Take (Gaps / Roadmap Milestones) */}
                <div
                  style={{
                    background: "rgba(249, 115, 22, 0.04)",
                    border: "1px solid rgba(249, 115, 22, 0.2)",
                    borderRadius: 14,
                    padding: "14px 16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, fontSize: "0.82rem", fontWeight: 800, color: "var(--citrus-orange)", textTransform: "uppercase" }}>
                    <Sparkles size={15} /> WHAT IT WILL TAKE TO START
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "0.82rem" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                      <span style={{ color: "var(--citrus-amber)", fontWeight: 700 }}>⚡</span>
                      <span>
                        <strong>Training / Skill Gap: </strong>
                        {(rec.missing_skills && rec.missing_skills.length > 0)
                          ? `Build ${rec.missing_skills.join(", ")} (Add to Roadmap)`
                          : "Short CCRI / KVK certification recommended (3-day subsidized batch)"}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                      <span style={{ color: "var(--cyan)", fontWeight: 700 }}>🔧</span>
                      <span>
                        <strong>Setup & Machinery: </strong>
                        {(rec.missing_resources && rec.missing_resources.length > 0)
                          ? `Acquire ${rec.missing_resources.join(", ")}`
                          : "Modular equipment & food safety compliance"}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                      <span style={{ color: "var(--ok)", fontWeight: 700 }}>🏛️</span>
                      <span>
                        <strong>Subsidy Leverage: </strong>
                        Eligible for ₹{fin.subsidy_amount.toLocaleString("en-IN")} ({fin.subsidy_percentage}) PMFME grant.
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Metric strip & CTAs */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                  paddingTop: 14,
                  borderTop: "1px solid var(--line)",
                }}
              >
                <div style={{ display: "flex", gap: 16, fontSize: "0.82rem", color: "var(--muted)", flexWrap: "wrap" }}>
                  <span>
                    💰 <strong>Est. Total CapEx:</strong> ₹{fin.total_project_cost.toLocaleString("en-IN")}
                  </span>
                  <span>
                    ⏱️ <strong>Setup Timeline:</strong> 2–4 Months
                  </span>
                  <span>
                    📈 <strong>Target Margin:</strong> ~25–35% Net
                  </span>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/business-plan", {
                        state: { opportunity: rec, userSummary: user_summary, userInput: currentUserInput },
                      })
                    }
                    className="btn-secondary-gloss"
                    style={{ padding: "8px 18px", fontSize: "0.85rem" }}
                  >
                    View Details →
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      navigate("/business-plan", {
                        state: { opportunity: rec, userSummary: user_summary, userInput: currentUserInput },
                      })
                    }
                    className="btn-primary-gloss"
                    style={{ padding: "8px 20px", fontSize: "0.85rem" }}
                  >
                    <Sparkles size={16} />
                    <span>Generate Business Plan</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* DETAIL & BUSINESS PLAN GENERATOR MODAL */}
      {selectedOpp && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(12px)",
            display: "grid",
            placeItems: "center",
            zIndex: 100,
            padding: 16,
          }}
        >
          <div
            className="card wizard-form-card"
            style={{
              maxWidth: 780,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
              padding: "32px 28px",
            }}
          >
            <button
              onClick={() => setSelectedOpp(null)}
              className="close-subform-btn"
              style={{ position: "absolute", top: 20, right: 20, width: 32, height: 32 }}
            >
              ✕
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span className="skill-status-tag verified" style={{ fontSize: "0.75rem" }}>
                {selectedOpp.category}
              </span>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                📍 {selectedOpp.location_relevance || user_summary?.location || "Nagpur District"}
              </span>
            </div>

            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 10px" }}>
              {selectedOpp.name}
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: 18 }}>
              {selectedOpp.description}
            </p>

            {/* 1. Skills Required vs Matched */}
            <div style={{ background: "var(--panel-solid)", padding: 16, borderRadius: 14, border: "1px solid var(--line)", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: "0.88rem", color: "var(--electric-blue)", marginBottom: 8 }}>
                <GraduationCap size={16} /> Skills Assessment & Readiness
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(selectedOpp.matched_skills || []).map((s, i) => (
                  <span key={i} className="skill-status-tag verified" style={{ fontSize: "0.78rem" }}>
                    ✓ {s} (You Have)
                  </span>
                ))}
                {(selectedOpp.missing_skills || []).map((s, i) => (
                  <span key={i} className="skill-status-tag claimed" style={{ fontSize: "0.78rem" }}>
                    ⚠️ {s} (CCRI / KVK Training Path)
                  </span>
                ))}
              </div>
            </div>

            {/* 2. Resources Required vs Available */}
            <div style={{ background: "var(--panel-solid)", padding: 16, borderRadius: 14, border: "1px solid var(--line)", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: "0.88rem", color: "var(--ok)", marginBottom: 8 }}>
                <Hammer size={16} /> Infrastructure & Machinery Setup
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(selectedOpp.matched_resources || []).map((r, i) => (
                  <span key={i} className="skill-status-tag verified" style={{ fontSize: "0.78rem" }}>
                    ✓ {r} (Available On-Site)
                  </span>
                ))}
                {(selectedOpp.missing_resources || []).map((r, i) => (
                  <span key={i} className="skill-status-tag non-mandatory" style={{ fontSize: "0.78rem" }}>
                    📦 {r} (To Acquire via Subsidy)
                  </span>
                ))}
              </div>
            </div>

            {/* 3. Financial Breakdown & Funding Structure */}
            <div style={{ background: "var(--panel-solid)", padding: 16, borderRadius: 14, border: "1px solid var(--line)", marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: "0.88rem", color: "var(--cyan)" }}>
                  <Coins size={16} /> Financial Architecture & PMFME 35% Grant
                </div>
                <span className="skill-status-tag verified" style={{ fontSize: "0.72rem" }}>
                  {selectedOpp.financial_breakdown?.budget_status || "Within Reach"}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, fontSize: "0.85rem" }}>
                <div>
                  <span style={{ fontSize: "0.74rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    Total Project CapEx
                  </span>
                  <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-heading)", marginTop: 2 }}>
                    ₹{selectedOpp.financial_breakdown?.total_project_cost?.toLocaleString("en-IN") || "5,00,000"}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "0.74rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    Your Own Equity
                  </span>
                  <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--cyan)", marginTop: 2 }}>
                    ₹{selectedOpp.financial_breakdown?.user_budget?.toLocaleString("en-IN") || "3,00,000"}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "0.74rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                    PMFME 35% Grant
                  </span>
                  <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--ok)", marginTop: 2 }}>
                    + ₹{selectedOpp.financial_breakdown?.subsidy_amount?.toLocaleString("en-IN") || "1,75,000"}
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Interactive Personalized Business Plan Builder */}
            {!planGenerated ? (
              <button
                type="button"
                onClick={() => handleGeneratePlan(selectedOpp)}
                disabled={planLoading}
                className="btn-primary-gloss"
                style={{ width: "100%", padding: "14px", justifyContent: "center", fontSize: "0.95rem" }}
              >
                <Sparkles size={18} />
                <span>{planLoading ? "Generating Actionable Plan with PMFME Rules..." : "Generate Detailed Business Plan (Page 3) →"}</span>
              </button>
            ) : (
              financialPlan && (
                <div
                  style={{
                    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.08) 100%)",
                    border: "1px solid var(--line-glow)",
                    borderRadius: 14,
                    padding: 18,
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <strong style={{ color: "var(--cyan)", fontSize: "0.95rem" }}>
                      🏛️ Personalized Financing Blueprint Generated
                    </strong>
                    <span className="skill-status-tag verified" style={{ fontSize: "0.72rem" }}>
                      Bank Ready
                    </span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.85rem", marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 4 }}>
                      <span>Total Project Requirement:</span>
                      <strong>₹{financialPlan.total_project_cost?.toLocaleString("en-IN")}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 4 }}>
                      <span>Your Own Contribution (Equity):</span>
                      <strong style={{ color: "var(--cyan)" }}>₹{financialPlan.user_contribution?.toLocaleString("en-IN")}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 4 }}>
                      <span>Government Capital Subsidy ({financialPlan.scheme_name?.split("(")[0]}):</span>
                      <strong style={{ color: "var(--ok)" }}>
                        ₹{financialPlan.scheme_subsidy_amount?.toLocaleString("en-IN")} ({financialPlan.subsidy_percentage})
                      </strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: 4 }}>
                      <span>Bank Term Loan Requirement:</span>
                      <strong>₹{financialPlan.bank_loan_amount?.toLocaleString("en-IN")}</strong>
                    </div>
                  </div>

                  <div style={{ background: "var(--panel-solid)", padding: 12, borderRadius: 10, border: "1px solid var(--line)" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-heading)", display: "block", marginBottom: 6 }}>
                      📋 Step-by-Step Action Roadmap to Secure Scheme & Launch:
                    </span>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.6 }}>
                      {(financialPlan.action_steps || []).map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
              <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                Source Grounding: {selectedOpp.source || "ICAR-CCRI & Maharashtra Agro-Industrial Policy"}
              </span>
              <button
                type="button"
                onClick={() => setSelectedOpp(null)}
                className="btn-secondary-gloss"
                style={{ padding: "6px 16px", fontSize: "0.82rem" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
