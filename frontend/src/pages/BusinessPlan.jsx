import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Printer,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Coins,
  Building2,
  Store,
  Snowflake,
  FlaskConical,
  GraduationCap,
  Hammer,
  ShieldCheck,
  FileText,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Landmark,
  Compass,
  Check,
  Info,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { fetchFinancialPlan } from "../services/api";

const PLAN_SECTIONS = [
  { id: "overview", label: "01 Business Overview", icon: "📋" },
  { id: "why_fits", label: "02 Why This Business?", icon: "🎯" },
  { id: "skills", label: "03 Skills & Training", icon: "🧠" },
  { id: "resources", label: "04 Resources & Setup", icon: "🏗️" },
  { id: "location", label: "05 Location & Ecosystem", icon: "📍" },
  { id: "finance", label: "06 Investment & Finance", icon: "💰" },
  { id: "schemes", label: "07 Government Schemes", icon: "🏛️" },
  { id: "implementation", label: "08 Implementation Roadmap", icon: "🚀" },
];

export default function BusinessPlan() {
  const locationState = useLocation();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("overview");
  const [viewMode, setViewMode] = useState("overview_card"); // "overview_card" (3.1) | "full_plan" (3.2)
  const [roadmapAdded, setRoadmapAdded] = useState(false);
  const [customSkills, setCustomSkills] = useState([]);
  const [financialPlan, setFinancialPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);

  // Retrieve opportunity data from state or localStorage
  let oppData = locationState?.state?.opportunity;
  let userSummary = locationState?.state?.userSummary;
  let userInput = locationState?.state?.userInput;

  if (!oppData) {
    try {
      const saved = localStorage.getItem("ev_active_business_plan");
      if (saved) {
        const parsed = JSON.parse(saved);
        oppData = parsed.opportunity;
        userSummary = parsed.userSummary;
        userInput = parsed.userInput;
      }
    } catch (e) {}
  }

  // Fallback defaults if opened directly
  const opportunity = oppData || {
    opportunity_id: "OPP01",
    name: "Disease-Free Certified Citrus Nursery",
    category: "Agri-Business & Nursery",
    description: "High-demand production and supply of disease-free, certified Nagpur Mandarin saplings using ICAR-CCRI budwood protocols and shade-net polyhouse infrastructure.",
    location_relevance: "Katol, Narkhed, Warud-Morshi, Nagpur",
    suitability_score: 92,
    matched_skills: ["Farming & Orchard Management", "Basic Irrigation"],
    missing_skills: ["Citrus Grafting & CCRI Budwood Protocols", "Disease Surveillance"],
    matched_resources: ["Agricultural Land (2.5 Acres)", "Reliable Borewell Water", "3-Phase Power"],
    missing_resources: ["Shade-Net Polyhouse (1,000 sq. m)", "Micro-Sprinklers"],
    financial_breakdown: {
      total_project_cost: 480000,
      user_budget: 250000,
      funding_gap: 0,
      eligible_scheme: "PMFME 35% Credit-Linked Subsidy (MoFPI)",
      subsidy_amount: 168000,
      subsidy_percentage: "35%",
    },
  };

  const activeLocation = userInput?.location || userSummary?.location || "Katol, Nagpur District";
  const ownEquity = userInput?.budget_inr || parseFloat(String(userSummary?.budget || "250000").replace(/[^0-9.]/g, "")) || 250000;
  const totalCost = opportunity.financial_breakdown?.total_project_cost || 480000;
  const subsidyAmount = opportunity.financial_breakdown?.subsidy_amount || Math.round(totalCost * 0.35);
  const bankLoan = Math.max(0, totalCost - ownEquity - subsidyAmount);

  useEffect(() => {
    try {
      localStorage.setItem("ev_active_business_plan", JSON.stringify({ opportunity, userSummary, userInput }));
    } catch (e) {}

    // Pre-calculate financial plan if needed
    async function loadPlan() {
      try {
        setPlanLoading(true);
        const p = await fetchFinancialPlan({
          opportunity_id: opportunity.opportunity_id || "OPP01",
          user_budget: ownEquity,
          location: activeLocation,
        });
        setFinancialPlan(p);
      } catch (err) {
        console.warn("Could not fetch financial plan API, using local DSS calculations:", err);
      } finally {
        setPlanLoading(false);
      }
    }
    loadPlan();
  }, [opportunity.opportunity_id]);

  const handleAddToRoadmap = () => {
    setRoadmapAdded(true);
    try {
      const roadmapItem = {
        id: opportunity.opportunity_id || "OPP01",
        name: opportunity.name,
        category: opportunity.category,
        location: activeLocation,
        targetCapEx: totalCost,
        addedAt: new Date().toISOString(),
        phases: [
          { phase: 1, title: "Market & Land Survey", status: "completed" },
          { phase: 2, title: "CCRI Mother Plant Certification", status: "in_progress" },
          { phase: 3, title: "PMFME 35% Bank DPR Submission", status: "pending" },
          { phase: 4, title: "Shade-net Polyhouse Setup", status: "pending" },
          { phase: 5, title: "Commercial Grafting & Launch", status: "pending" },
        ],
      };
      localStorage.setItem("ev_saved_roadmap", JSON.stringify(roadmapItem));
    } catch (e) {}
  };

  return (
    <div style={{ maxWidth: 1160, margin: "0 auto", paddingBottom: 60 }}>
      {/* Top Breadcrumb Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <button
          onClick={() => navigate("/results")}
          className="btn-secondary-gloss"
          style={{ padding: "8px 16px", fontSize: "0.84rem", display: "inline-flex", gap: 6 }}
        >
          <ArrowLeft size={16} /> Back to Recommendations
        </button>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setViewMode(viewMode === "overview_card" ? "full_plan" : "overview_card")}
            className="btn-secondary-gloss"
            style={{ padding: "8px 16px", fontSize: "0.84rem" }}
          >
            {viewMode === "overview_card" ? "📑 Open Full Plan" : "🗂️ View Summary"}
          </button>
          <button onClick={() => window.print()} className="btn-secondary-gloss" style={{ padding: "8px 16px", fontSize: "0.84rem" }}>
            <Printer size={16} /> Print Business Plan
          </button>
        </div>
      </div>

      {/* ====================================================================
          3.1 — OPPORTUNITY OVERVIEW (Summary Readiness Screen)
         ==================================================================== */}
      {viewMode === "overview_card" && (
        <div className="card wizard-form-card" style={{ padding: "36px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, marginBottom: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span className="skill-status-tag verified" style={{ fontSize: "0.75rem" }}>
                  {opportunity.category}
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                  📍 Suitable Location: {opportunity.location_relevance || activeLocation}
                </span>
              </div>
              <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 8px" }}>
                {opportunity.name}
              </h1>
              <p style={{ fontSize: "0.92rem", color: "var(--muted)", lineHeight: 1.6, maxWidth: 780, margin: 0 }}>
                {opportunity.description}
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--cyan)" }}>
                {opportunity.suitability_score || 92}%
              </span>
              <span style={{ display: "block", fontSize: "0.72rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Overall Fit Index
              </span>
            </div>
          </div>

          <div style={{ height: 1, background: "var(--line)", margin: "20px 0" }} />

          {/* Why This Business & Readiness 2-Column Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 20, marginBottom: 28 }}>
            {/* Box 1: Why This Business */}
            <div style={{ background: "var(--panel-solid)", padding: 20, borderRadius: 16, border: "1px solid var(--line)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.88rem", fontWeight: 800, color: "var(--ok)", textTransform: "uppercase", marginBottom: 14 }}>
                <CheckCircle2 size={18} /> WHY THIS BUSINESS FITS YOU
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.86rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "var(--ok)", fontWeight: 800 }}>✓</span>
                  <span>
                    <strong>Matches Your Location: </strong>
                    Detected prime citrus production cluster with ICAR-CCRI demonstration plots in {activeLocation}.
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "var(--ok)", fontWeight: 800 }}>✓</span>
                  <span>
                    <strong>Matches Your Resources: </strong>
                    Directly monetizes your available land, water source, and 3-phase power connection.
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "var(--ok)", fontWeight: 800 }}>✓</span>
                  <span>
                    <strong>Relevant Experience: </strong>
                    Builds on your practical agricultural background for nursery mother-plant propagation.
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "var(--cyan)", fontWeight: 800 }}>⚠</span>
                  <span>
                    <strong>Identified Setup Need: </strong>
                    Requires shade-net polyhouse erection and CCRI certification (structured in business plan).
                  </span>
                </div>
              </div>
            </div>

            {/* Box 2: Your Readiness Matrix */}
            <div style={{ background: "rgba(99, 102, 241, 0.06)", padding: 20, borderRadius: 16, border: "1px solid var(--line-glow)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.88rem", fontWeight: 800, color: "var(--electric-blue)", textTransform: "uppercase", marginBottom: 14 }}>
                <Compass size={18} /> YOUR READINESS MATRIX
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.86rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--line)", paddingBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>🧠 Technical Skills</span>
                  <span style={{ color: "var(--ok)", fontWeight: 700 }}>✓ Good Match</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--line)", paddingBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>🌾 Land & Resources</span>
                  <span style={{ color: "var(--ok)", fontWeight: 700 }}>✓ Available</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--line)", paddingBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>📍 Local Ecosystem</span>
                  <span style={{ color: "var(--ok)", fontWeight: 700 }}>✓ Suitable</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--line)", paddingBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>💰 Financial Capital</span>
                  <span style={{ color: "var(--cyan)", fontWeight: 700 }}>⚠ PMFME Subsidy Leverage</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600 }}>📄 Certifications</span>
                  <span style={{ color: "var(--violet)", fontWeight: 700 }}>⚠ Training Required</span>
                </div>
              </div>
            </div>
          </div>

          {/* Primary CTA */}
          <div style={{ textAlign: "center" }}>
            <button
              type="button"
              onClick={() => setViewMode("full_plan")}
              className="btn-primary-gloss"
              style={{ padding: "16px 44px", fontSize: "1.05rem" }}
            >
              <Sparkles size={20} />
              <span>GENERATE MY BUSINESS PLAN →</span>
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          3.2 — GENERATED BUSINESS PLAN (Modular Tabbed Navigation Hub)
         ==================================================================== */}
      {viewMode === "full_plan" && (
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, alignItems: "flex-start" }}>
          {/* Left Navigation Sidebar */}
          <div
            className="card wizard-form-card"
            style={{
              padding: "16px",
              position: "sticky",
              top: 24,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ padding: "8px 12px 14px", borderBottom: "1px solid var(--line)", marginBottom: 6 }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                BUSINESS PLAN HUB
              </span>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 0" }}>
                {opportunity.name}
              </h3>
            </div>

            {PLAN_SECTIONS.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: isActive
                      ? "linear-gradient(135deg, rgba(99, 102, 241, 0.16) 0%, rgba(6, 182, 212, 0.1) 100%)"
                      : "transparent",
                    border: isActive ? "1px solid var(--line-glow)" : "1px solid transparent",
                    color: isActive ? "var(--text-heading)" : "var(--muted)",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{sec.icon}</span>
                    <span>{sec.label}</span>
                  </span>
                  {isActive && <ChevronRight size={14} color="var(--cyan)" />}
                </button>
              );
            })}

            {/* Quick Action in Sidebar */}
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)" }}>
              <button
                type="button"
                onClick={handleAddToRoadmap}
                className={roadmapAdded ? "pill-option-btn active" : "btn-secondary-gloss"}
                style={{ width: "100%", padding: "10px 12px", fontSize: "0.82rem", justifyContent: "center" }}
              >
                {roadmapAdded ? "✓ Added to My Roadmap" : "🗺️ Save to My Roadmap"}
              </button>
            </div>
          </div>

          {/* Right Main Plan Content */}
          <div className="card wizard-form-card" style={{ padding: "32px 28px", minHeight: 650 }}>
            {/* ================================================================
                TAB 1: 01 BUSINESS OVERVIEW
               ================================================================ */}
            {activeSection === "overview" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase" }}>
                      01 • BUSINESS OVERVIEW
                    </span>
                    <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 0" }}>
                      What You Will Do
                    </h2>
                  </div>
                  <span className="skill-status-tag verified" style={{ fontSize: "0.75rem" }}>
                    🌱 Production & Supply
                  </span>
                </div>

                <div style={{ background: "var(--panel-solid)", padding: 18, borderRadius: 14, border: "1px solid var(--line)", marginBottom: 18 }}>
                  <p style={{ fontSize: "0.92rem", lineHeight: 1.6, color: "var(--text)", margin: 0 }}>
                    {opportunity.description}
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                  <div style={{ background: "var(--panel-solid)", padding: 16, borderRadius: 14, border: "1px solid var(--line)" }}>
                    <strong style={{ fontSize: "0.88rem", color: "var(--electric-blue)", display: "block", marginBottom: 8 }}>
                      🎯 Target Customers & Off-takers
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.84rem", color: "var(--muted)", lineHeight: 1.6 }}>
                      <li>Commercial citrus farmers planting new orchards</li>
                      <li>Secondary nurseries in Amravati, Wardha & Chhindwara</li>
                      <li>MahaAgro government procurement tenders</li>
                      <li>Farmer Producer Organizations (FPOs) bulk sapling orders</li>
                    </ul>
                  </div>

                  <div style={{ background: "var(--panel-solid)", padding: 16, borderRadius: 14, border: "1px solid var(--line)" }}>
                    <strong style={{ fontSize: "0.88rem", color: "var(--ok)", display: "block", marginBottom: 8 }}>
                      📦 Business Model Characteristics
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.84rem", color: "var(--muted)", lineHeight: 1.6 }}>
                      <li><strong>Type:</strong> Agro-propagation & disease-free nursery</li>
                      <li><strong>Footprint:</strong> Land-dependent (0.5 – 2 Acres)</li>
                      <li><strong>Seasonality:</strong> Year-round with peak monsoon dispatches</li>
                      <li><strong>Gross Margins:</strong> ~35–45% per certified rootstock</li>
                    </ul>
                  </div>
                </div>

                <div className="wizard-actions-bar">
                  <div />
                  <button type="button" className="btn-primary-gloss" onClick={() => setActiveSection("why_fits")}>
                    <span>Next: Why This Business →</span>
                  </button>
                </div>
              </div>
            )}

            {/* ================================================================
                TAB 2: 02 WHY THIS BUSINESS?
               ================================================================ */}
            {activeSection === "why_fits" && (
              <div>
                <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase" }}>
                  02 • STRATEGIC REASONING
                </span>
                <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 16px" }}>
                  Why EntreVision Recommended This
                </h2>

                {/* Profile Matching Logic Box */}
                <div style={{ background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.06) 100%)", padding: 20, borderRadius: 16, border: "1px solid var(--line-glow)", marginBottom: 20 }}>
                  <strong style={{ fontSize: "0.9rem", color: "var(--text-heading)", display: "block", marginBottom: 12 }}>
                    💡 Decision Engine Synthesis:
                  </strong>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: "0.84rem" }}>
                    <div style={{ background: "var(--panel-solid)", padding: 12, borderRadius: 10, border: "1px solid var(--line)" }}>
                      <span style={{ color: "var(--cyan)", fontWeight: 700 }}>📍 Location Alignment</span>
                      <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>
                        {activeLocation} is in the epicenter of the Vidarbha citrus cluster with high replanting demand.
                      </p>
                    </div>

                    <div style={{ background: "var(--panel-solid)", padding: 12, borderRadius: 10, border: "1px solid var(--line)" }}>
                      <span style={{ color: "var(--ok)", fontWeight: 700 }}>🌱 Skills Alignment</span>
                      <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>
                        Your practical farming experience provides immediate operational baseline for mother plant care.
                      </p>
                    </div>

                    <div style={{ background: "var(--panel-solid)", padding: 12, borderRadius: 10, border: "1px solid var(--line)" }}>
                      <span style={{ color: "var(--electric-blue)", fontWeight: 700 }}>🏠 Resources Leverage</span>
                      <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>
                        Uses your owned agricultural land and borewell water, eliminating major lease rental expenses.
                      </p>
                    </div>

                    <div style={{ background: "var(--panel-solid)", padding: 12, borderRadius: 10, border: "1px solid var(--line)" }}>
                      <span style={{ color: "var(--violet)", fontWeight: 700 }}>💰 Capital & Grant Fit</span>
                      <p style={{ margin: "4px 0 0", color: "var(--muted)" }}>
                        ₹{ownEquity.toLocaleString("en-IN")} equity unlocks ₹{subsidyAmount.toLocaleString("en-IN")} PMFME capital grant.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="wizard-actions-bar">
                  <button type="button" className="btn-secondary-gloss" onClick={() => setActiveSection("overview")}>
                    ← Previous
                  </button>
                  <button type="button" className="btn-primary-gloss" onClick={() => setActiveSection("skills")}>
                    <span>Next: Skills & Training →</span>
                  </button>
                </div>
              </div>
            )}

            {/* ================================================================
                TAB 3: 03 SKILLS & TRAINING
               ================================================================ */}
            {activeSection === "skills" && (
              <div>
                <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase" }}>
                  03 • TECHNICAL READINESS
                </span>
                <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 16px" }}>
                  Required Skills & Gap Analysis
                </h2>

                <div style={{ background: "var(--panel-solid)", borderRadius: 14, border: "1px solid var(--line)", overflow: "hidden", marginBottom: 20 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", padding: "10px 16px", background: "var(--panel-subtle)", fontSize: "0.78rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                    <span>Required Technical Skill</span>
                    <span>Your Verification Status</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {(opportunity.matched_skills || []).map((s, idx) => (
                      <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", padding: "12px 16px", borderTop: "1px solid var(--line)", fontSize: "0.85rem", alignItems: "center" }}>
                        <span style={{ fontWeight: 600 }}>🌱 {s}</span>
                        <span style={{ color: "var(--ok)", fontWeight: 700 }}>✓ Verified Available</span>
                      </div>
                    ))}
                    {(opportunity.missing_skills || []).map((s, idx) => (
                      <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", padding: "12px 16px", borderTop: "1px solid var(--line)", fontSize: "0.85rem", alignItems: "center", background: "rgba(245, 158, 11, 0.04)" }}>
                        <span style={{ fontWeight: 600 }}>🪴 {s}</span>
                        <span style={{ color: "var(--cyan)", fontWeight: 700 }}>⚠ Training Recommended</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skill Gap Action Card */}
                <div style={{ background: "rgba(6, 182, 212, 0.08)", padding: 18, borderRadius: 14, border: "1px solid rgba(6, 182, 212, 0.3)", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <GraduationCap size={20} color="var(--cyan)" />
                    <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)" }}>
                      BRIDGING THE SKILL GAP: Citrus Grafting & Budwood Protocols
                    </strong>
                  </div>
                  <p style={{ fontSize: "0.84rem", color: "var(--muted)", lineHeight: 1.5, margin: "0 0 12px 0" }}>
                    ICAR-Central Citrus Research Institute (Nagpur) conducts certified 5-day nursery propagation workshops. Adding this to your Roadmap prepares you for Maharashtra state nursery accreditation.
                  </p>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button type="button" onClick={() => alert("Redirecting to CCRI Training Schedule portal...")} className="pill-option-btn" style={{ fontSize: "0.78rem" }}>
                      🎓 Find CCRI Training
                    </button>
                    <button type="button" onClick={handleAddToRoadmap} className="pill-option-btn active" style={{ fontSize: "0.78rem" }}>
                      🗺️ Add Training to My Roadmap
                    </button>
                    <button type="button" onClick={() => navigate("/profile")} className="pill-option-btn" style={{ fontSize: "0.78rem" }}>
                      📄 Add Existing Certificate
                    </button>
                  </div>
                </div>

                <div className="wizard-actions-bar">
                  <button type="button" className="btn-secondary-gloss" onClick={() => setActiveSection("why_fits")}>
                    ← Previous
                  </button>
                  <button type="button" className="btn-primary-gloss" onClick={() => setActiveSection("resources")}>
                    <span>Next: Resources & Setup →</span>
                  </button>
                </div>
              </div>
            )}

            {/* ================================================================
                TAB 4: 04 RESOURCES & INFRASTRUCTURE
               ================================================================ */}
            {activeSection === "resources" && (
              <div>
                <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase" }}>
                  04 • PHYSICAL ASSETS
                </span>
                <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 16px" }}>
                  Resources & Infrastructure Requirements
                </h2>

                <div style={{ background: "var(--panel-solid)", borderRadius: 14, border: "1px solid var(--line)", overflow: "hidden", marginBottom: 20 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", padding: "10px 16px", background: "var(--panel-subtle)", fontSize: "0.78rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                    <span>Physical Infrastructure Asset</span>
                    <span>Status</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {(opportunity.matched_resources || []).map((r, idx) => (
                      <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", padding: "12px 16px", borderTop: "1px solid var(--line)", fontSize: "0.85rem", alignItems: "center" }}>
                        <span style={{ fontWeight: 600 }}>🌾 {r}</span>
                        <span style={{ color: "var(--ok)", fontWeight: 700 }}>✓ Available On-Site</span>
                      </div>
                    ))}
                    {(opportunity.missing_resources || []).map((r, idx) => (
                      <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", padding: "12px 16px", borderTop: "1px solid var(--line)", fontSize: "0.85rem", alignItems: "center", background: "rgba(245, 158, 11, 0.04)" }}>
                        <span style={{ fontWeight: 600 }}>🏗️ {r}</span>
                        <span style={{ color: "var(--cyan)", fontWeight: 700 }}>⚠ Setup Required</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Infrastructure Gap Resolution */}
                <div style={{ background: "rgba(99, 102, 241, 0.08)", padding: 18, borderRadius: 14, border: "1px solid var(--line-glow)", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <Hammer size={18} color="var(--electric-blue)" />
                    <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)" }}>
                      SETUP GAP: Shade-Net Polyhouse & Micro-Sprinklers (~₹1.80 Lakh)
                    </strong>
                  </div>
                  <p style={{ fontSize: "0.84rem", color: "var(--muted)", lineHeight: 1.5, margin: "0 0 12px 0" }}>
                    Eligible for 50% capital subsidy under National Horticulture Mission (NHM) or 35% PMFME grant.
                  </p>

                  <button
                    type="button"
                    onClick={() => setActiveSection("finance")}
                    className="btn-primary-gloss"
                    style={{ padding: "8px 18px", fontSize: "0.82rem" }}
                  >
                    <span>Estimate CapEx in Financial Breakdown →</span>
                  </button>
                </div>

                <div className="wizard-actions-bar">
                  <button type="button" className="btn-secondary-gloss" onClick={() => setActiveSection("skills")}>
                    ← Previous
                  </button>
                  <button type="button" className="btn-primary-gloss" onClick={() => setActiveSection("location")}>
                    <span>Next: Location Analysis →</span>
                  </button>
                </div>
              </div>
            )}

            {/* ================================================================
                TAB 5: 05 LOCATION & ECOSYSTEM
               ================================================================ */}
            {activeSection === "location" && (
              <div>
                <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase" }}>
                  05 • ECOSYSTEM LINKAGES
                </span>
                <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 16px" }}>
                  Location & Micro-Infrastructure ({activeLocation})
                </h2>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                  <div style={{ background: "var(--panel-solid)", padding: 14, borderRadius: 12, border: "1px solid var(--line)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: "0.85rem", color: "var(--ok)" }}>
                      <Store size={16} /> APMC Mandi Access
                    </div>
                    <p style={{ margin: "6px 0 0", fontSize: "0.8rem", color: "var(--muted)" }}>
                      Katol Sub-Mandi & Direct farmer linkages across 40+ citrus growing villages.
                    </p>
                  </div>

                  <div style={{ background: "var(--panel-solid)", padding: 14, borderRadius: 12, border: "1px solid var(--line)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: "0.85rem", color: "var(--cyan)" }}>
                      <FlaskConical size={16} /> Research & Budwood Labs
                    </div>
                    <p style={{ margin: "6px 0 0", fontSize: "0.8rem", color: "var(--muted)" }}>
                      ICAR-CCRI Regional Outreach Centre & Certified Mother Plant demonstration farm.
                    </p>
                  </div>

                  <div style={{ background: "var(--panel-solid)", padding: 14, borderRadius: 12, border: "1px solid var(--line)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: "0.85rem", color: "var(--electric-blue)" }}>
                      <Snowflake size={16} /> Pre-Cooling & Chilling Units
                    </div>
                    <p style={{ margin: "6px 0 0", fontSize: "0.8rem", color: "var(--muted)" }}>
                      Farm-gate pre-cooling (350 MT) for budwood preservation and nursery hydration.
                    </p>
                  </div>

                  <div style={{ background: "var(--panel-solid)", padding: 14, borderRadius: 12, border: "1px solid var(--line)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: "0.85rem", color: "var(--violet)" }}>
                      <Building2 size={16} /> Industrial Corridor & Logistics
                    </div>
                    <p style={{ margin: "6px 0 0", fontSize: "0.8rem", color: "var(--muted)" }}>
                      NH-353J Corridor providing 1-day freight dispatch to Amravati, Nagpur, and MP borders.
                    </p>
                  </div>
                </div>

                <div className="wizard-actions-bar">
                  <button type="button" className="btn-secondary-gloss" onClick={() => setActiveSection("resources")}>
                    ← Previous
                  </button>
                  <button type="button" className="btn-primary-gloss" onClick={() => setActiveSection("finance")}>
                    <span>Next: Investment & Finance →</span>
                  </button>
                </div>
              </div>
            )}

            {/* ================================================================
                TAB 6: 06 INVESTMENT & FINANCE
               ================================================================ */}
            {activeSection === "finance" && (
              <div>
                <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase" }}>
                  06 • CAPITAL ARCHITECTURE
                </span>
                <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 16px" }}>
                  Estimated CapEx & Financial Breakdown
                </h2>

                {/* CapEx Breakdown Table */}
                <div style={{ background: "var(--panel-solid)", borderRadius: 14, border: "1px solid var(--line)", padding: "16px 20px", marginBottom: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.88rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 6 }}>
                      <span className="muted">1. Shade-Net Polyhouse (1,000 sq. m civil structure):</span>
                      <strong>₹1,80,000</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 6 }}>
                      <span className="muted">2. Mother Plant Rootstocks & CCRI Certified Budwood:</span>
                      <strong>₹95,000</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 6 }}>
                      <span className="muted">3. Micro-Sprinkler & Drip Irrigation Unit:</span>
                      <strong>₹65,000</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 6 }}>
                      <span className="muted">4. Potting Media, Soil Testing & Initial Working Capital:</span>
                      <strong>₹1,40,000</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 6, fontSize: "1rem" }}>
                      <strong>Total Estimated Project Requirement:</strong>
                      <strong style={{ color: "var(--text-heading)" }}>₹{totalCost.toLocaleString("en-IN")}</strong>
                    </div>
                  </div>
                </div>

                {/* Capital Structuring Card */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
                  <div style={{ background: "var(--panel-solid)", padding: 14, borderRadius: 12, border: "1px solid var(--line)" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                      Your Own Equity
                    </span>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--cyan)", marginTop: 2 }}>
                      ₹{ownEquity.toLocaleString("en-IN")}
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "var(--ok)" }}>Liquid Capital</span>
                  </div>

                  <div style={{ background: "var(--panel-solid)", padding: 14, borderRadius: 12, border: "1px solid var(--line)" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                      PMFME 35% Subsidy
                    </span>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--ok)", marginTop: 2 }}>
                      + ₹{subsidyAmount.toLocaleString("en-IN")}
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>Credit-Linked Grant</span>
                  </div>

                  <div style={{ background: "var(--panel-solid)", padding: 14, borderRadius: 12, border: "1px solid var(--line)" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                      Bank Term Loan
                    </span>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--electric-blue)", marginTop: 2 }}>
                      + ₹{bankLoan.toLocaleString("en-IN")}
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>MUDRA / CGTMSE</span>
                  </div>
                </div>

                {/* Direct Link to Page 6 Financial Assistant */}
                <div style={{ background: "rgba(99, 102, 241, 0.08)", padding: 16, borderRadius: 14, border: "1px solid var(--line-glow)", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)", display: "flex", alignItems: "center", gap: 6 }}>
                      <Coins size={18} color="var(--cyan)" /> Want to test assumptions or simulate loans?
                    </strong>
                    <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--muted)" }}>
                      Open the interactive Financial Assistant to test minimum vs standard setups, edit CapEx line items, and run bank loan EMI calculators.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/financial-assistant", { state: { opportunity, userSummary, userInput } })}
                    className="btn-primary-gloss"
                    style={{ fontSize: "0.82rem", padding: "8px 16px" }}
                  >
                    💰 Open in Financial Assistant →
                  </button>
                </div>

                <div className="wizard-actions-bar">
                  <button type="button" className="btn-secondary-gloss" onClick={() => setActiveSection("location")}>
                    ← Previous
                  </button>
                  <button type="button" className="btn-primary-gloss" onClick={() => setActiveSection("schemes")}>
                    <span>Next: Government Schemes →</span>
                  </button>
                </div>
              </div>
            )}

            {/* ================================================================
                TAB 7: 07 GOVERNMENT SCHEMES
               ================================================================ */}
            {activeSection === "schemes" && (
              <div>
                <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase" }}>
                  07 • SCHEMES & SUBSIDIES
                </span>
                <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 16px" }}>
                  Eligible Government Financial Assistance
                </h2>

                <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(99, 102, 241, 0.08)", border: "1px solid var(--line-glow)", marginBottom: 16, fontSize: "0.82rem" }}>
                  <strong>Important Note: </strong> Recommendation ≠ Eligibility confirmation. EntreVision pre-qualifies potential schemes based on your profile, then verifies detailed criteria.
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                  <div style={{ background: "var(--panel-solid)", padding: 16, borderRadius: 14, border: "1px solid var(--line)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <strong style={{ fontSize: "0.95rem", color: "var(--text-heading)" }}>
                        🏛️ PMFME Scheme (Pradhan Mantri Formalisation of Micro food processing)
                      </strong>
                      <span className="skill-status-tag verified" style={{ fontSize: "0.72rem" }}>
                        35% Capital Grant
                      </span>
                    </div>
                    <p style={{ fontSize: "0.84rem", color: "var(--muted)", margin: "0 0 10px 0" }}>
                      Provides 35% credit-linked capital subsidy up to ₹10 Lakh for agro-nursery and processing setups.
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="button" onClick={() => alert("Checking PMFME Eligibility for " + opportunity.name + "...")} className="pill-option-btn active" style={{ fontSize: "0.76rem" }}>
                        ✓ Check My Eligibility
                      </button>
                      <button type="button" onClick={() => navigate("/schemes")} className="pill-option-btn" style={{ fontSize: "0.76rem" }}>
                        View Scheme Guidelines
                      </button>
                    </div>
                  </div>

                  <div style={{ background: "var(--panel-solid)", padding: 16, borderRadius: 14, border: "1px solid var(--line)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <strong style={{ fontSize: "0.95rem", color: "var(--text-heading)" }}>
                        🌾 Agriculture Infrastructure Fund (AIF)
                      </strong>
                      <span className="skill-status-tag claimed" style={{ fontSize: "0.72rem" }}>
                        3% Interest Subvention
                      </span>
                    </div>
                    <p style={{ fontSize: "0.84rem", color: "var(--muted)", margin: "0 0 10px 0" }}>
                      Provides 3% interest discount on bank loans up to ₹2 Crore with CGTMSE credit guarantee coverage.
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button type="button" onClick={() => navigate("/schemes")} className="pill-option-btn" style={{ fontSize: "0.76rem" }}>
                        Explore AIF Terms
                      </button>
                    </div>
                  </div>
                </div>

                <div className="wizard-actions-bar">
                  <button type="button" className="btn-secondary-gloss" onClick={() => setActiveSection("finance")}>
                    ← Previous
                  </button>
                  <button type="button" className="btn-primary-gloss" onClick={() => setActiveSection("implementation")}>
                    <span>Next: Implementation Roadmap →</span>
                  </button>
                </div>
              </div>
            )}

            {/* ================================================================
                TAB 8: 08 IMPLEMENTATION ROADMAP
               ================================================================ */}
            {activeSection === "implementation" && (
              <div>
                <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase" }}>
                  08 • STEP-BY-STEP EXECUTION
                </span>
                <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 16px" }}>
                  How to Start (Phased Implementation Plan)
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                  {[
                    { phase: "PHASE 1", title: "Research & Validation", tasks: ["Understand local Vidarbha grower demand", "Verify Katol APMC sapling trading seasons"] },
                    { phase: "PHASE 2", title: "Skills & Compliance", tasks: ["Enroll in ICAR-CCRI 5-day nursery workshop", "Apply for State Horticulture Nursery Registration"] },
                    { phase: "PHASE 3", title: "Infrastructure Setup", tasks: ["Erect 1,000 sq. m shade-net structure", "Install micro-sprinkler misting lines"] },
                    { phase: "PHASE 4", title: "Finance & Scheme Sanction", tasks: ["Submit Detailed Project Report (DPR) to PMFME portal", "Obtain bank in-principle loan sanction"] },
                    { phase: "PHASE 5", title: "Mother Plant & Budwood Sourcing", tasks: ["Procure certified disease-free rootstocks from CCRI", "Initiate grafting cycle"] },
                    { phase: "PHASE 6", title: "Commercial Launch & Distribution", tasks: ["Distribute first batch of 15,000 saplings to local orchards", "Expand FPO contracts"] },
                  ].map((p, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "var(--panel-solid)",
                        border: "1px solid var(--line)",
                        borderRadius: 14,
                        padding: "14px 18px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span className="skill-status-tag verified" style={{ fontSize: "0.72rem" }}>
                          {p.phase}
                        </span>
                        <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)" }}>
                          {p.title}
                        </strong>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.5 }}>
                        {p.tasks.map((t, tIdx) => (
                          <li key={tIdx}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Final Roadmap CTA */}
                <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
                  <button
                    type="button"
                    onClick={handleAddToRoadmap}
                    className="btn-primary-gloss"
                    style={{
                      padding: "16px 40px",
                      fontSize: "1.05rem",
                      background: "linear-gradient(135deg, var(--electric-blue) 0%, var(--cyan) 100%)",
                    }}
                  >
                    <Sparkles size={18} />
                    <span>{roadmapAdded ? "✓ Added to My Roadmap! Open Roadmap →" : "🗺️ ADD THIS PLAN TO MY ROADMAP →"}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
