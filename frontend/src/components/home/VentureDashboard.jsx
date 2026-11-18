import React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  Printer,
  CheckCircle2,
  Clock,
  Landmark,
  Coins,
  MapPin,
  TrendingUp,
  FileText,
  Calendar,
  Layers,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function VentureDashboard({ activeVenture }) {
  const { user } = useAuth();

  const vName = (activeVenture?.name || "").toLowerCase();
  const vCat = (activeVenture?.category || "").toLowerCase();

  const isFood = vCat.includes("food") || vCat.includes("processing") || vCat.includes("beverage") || vName.includes("juice") || vName.includes("jelly") || vName.includes("spread");
  const isBio = vCat.includes("bio") || vCat.includes("waste") || vCat.includes("by-product") || vName.includes("oil") || vName.includes("enzyme") || vName.includes("cleaning");
  const isCold = vCat.includes("cold") || vCat.includes("storage") || vCat.includes("logistics") || vName.includes("cold") || vName.includes("sorting") || vName.includes("grading");

  const totalCost = Number(activeVenture?.total_cost || activeVenture?.financial_breakdown?.total_project_cost || activeVenture?.targetCapEx || 500000);
  const ownEquity = Number(activeVenture?.own_equity || activeVenture?.financial_breakdown?.farmer_equity_required || Math.round(totalCost * 0.35));
  const subsidyAmount = Number(activeVenture?.subsidy_amount || activeVenture?.financial_breakdown?.subsidy_amount || Math.round(totalCost * 0.35));
  const subsidyScheme = activeVenture?.subsidy_scheme || activeVenture?.financial_breakdown?.eligible_scheme || "PMFME 35% Credit-Linked Capital Subsidy";
  const bankLoan = Number(activeVenture?.bank_loan || activeVenture?.financial_breakdown?.bank_loan_required || Math.max(0, totalCost - ownEquity - subsidyAmount));

  const venture = {
    id: activeVenture?.id || activeVenture?.opportunity_id || "OPP01",
    name: activeVenture?.name || "Citrus Agribusiness Venture",
    category: activeVenture?.category || (isFood ? "Food Processing & Value Addition" : isBio ? "Citrus By-Products & Bio-Economy" : isCold ? "Cold Storage & Mandi Logistics" : "Citrus Agro-Enterprise"),
    location: activeVenture?.location || (user?.tehsil ? `${user.tehsil}, Nagpur District` : "Nagpur District"),
    suitability_score: activeVenture?.suitability_score || 94,
    feasibility_score: activeVenture?.feasibility_score || activeVenture?.suitability_score || 94,
    capital_fit: activeVenture?.capital_fit || activeVenture?.mcda_breakdown?.capital_fit || 90,
    infrastructure_fit: activeVenture?.infrastructure_fit || activeVenture?.land_fit || activeVenture?.mcda_breakdown?.infrastructure_fit || 88,
    market_fit: activeVenture?.market_fit || activeVenture?.mcda_breakdown?.market_fit || 88,
    skill_fit: activeVenture?.skill_fit || activeVenture?.mcda_breakdown?.skill_fit || 85,
    score_type: activeVenture?.score_type || "MCDA",
    total_cost: totalCost,
    own_equity: ownEquity,
    subsidy_amount: subsidyAmount,
    subsidy_scheme: subsidyScheme,
    bank_loan: bankLoan,
  };

  const JOURNEY_STAGES = [
    {
      phase: 1,
      title: "Market & Land Feasibility",
      desc: "7-step resource matching & land suitability verified in Vidarbha cluster.",
      status: "completed",
    },
    {
      phase: 2,
      title: isFood
        ? "ICAR-CCRI Food Processing Workshop & FSSAI Filing"
        : isBio
        ? "Hydro-Steam Distillation & Bio-Enzyme Formulation Workshop"
        : isCold
        ? "APMC & NHB Cold Chain Infrastructure Accreditation"
        : "ICAR-CCRI Workshop & Nursery Accreditation",
      desc: isFood
        ? "Food safety SOPs, pasteurization protocols, and FSSAI state manufacturing license."
        : isBio
        ? "Steam condensing protocols, terpene isolation, and MPCB pollution NOC."
        : isCold
        ? "Pre-cooling chamber specs, temperature sensors, and APMC trader tie-ups."
        : "State Horticulture nursery registration & mother plant protocols.",
      status: "in_progress",
    },
    {
      phase: 3,
      title: `${(subsidyScheme || "PMFME").split(" ")[0]} 35% DPR Bank Submission`,
      desc: "Submit Detailed Project Report to MoFPI / NHB portal & commercial bank sanction.",
      status: "pending",
    },
    {
      phase: 4,
      title: isFood
        ? "SS-304 Food Grade Processing Unit Erection"
        : isBio
        ? "Distillation Still & Fermentation Tanks Commissioning"
        : isCold
        ? "Reefer Pre-Cooling Chambers & Solar Roof Installation"
        : "Infrastructure & Polyhouse Erection",
      desc: isFood
        ? "Sanitary food-contact equipment, automatic bottling, and NABL water testing."
        : isBio
        ? "Hydro-distillation still, essential oil centrifuge, and bio-enzyme settling line."
        : isCold
        ? "1,000 MT multi-commodity cold chambers and backup generator sanction."
        : "1,000 sq. m shade-net structure & micro-sprinkler misting lines.",
      status: "pending",
    },
    {
      phase: 5,
      title: isFood
        ? "Commercial Production & Trial Batch Quality Testing"
        : isBio
        ? "Feedstock Aggregation & Aroma Oil Extraction"
        : isCold
        ? "Mandi Orange Influx & Controlled Degreening Runs"
        : "Certified Budwood & Grafting Cycle",
      desc: isFood
        ? "Process Grade-B oranges into RTS drinks and vitamin-C jelly spreads with CCRI standards."
        : isBio
        ? "Procure citrus rinds from Nagpur APMC and extract high-purity d-limonene aroma oil."
        : isCold
        ? "Grade-sorting lines and temperature-controlled storage during peak Mrig/Ambia harvest."
        : "Procure CCRI certified disease-free rootstocks; initiate grafting.",
      status: "pending",
    },
    {
      phase: 6,
      title: isFood
        ? "Retail Packaging & Quick Commerce Distribution"
        : isBio
        ? "B2B Off-Take Agreements with FMCG Brands"
        : isCold
        ? "Cold Logistics & Mandi Offtake Execution"
        : "Commercial Distribution & Orchard Offtake",
      desc: isFood
        ? "Distribute bottled products to grocery networks across Nagpur, Pune & Mumbai."
        : isBio
        ? "Supply certified d-limonene and bio-cleaners to cosmetics and household formulators."
        : isCold
        ? "Provide cold logistics to exporters sending Nagpur oranges to Bangladesh and UAE."
        : "Distribute 15,000 certified saplings to Katol/Warud orchards.",
      status: "pending",
    },
  ];

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto", padding: "10px 0 60px" }}>
      {/* Top Welcome Banner */}
      <div
        className="card"
        style={{
          background: "var(--panel)",
          border: "1px solid var(--line)",
          borderRadius: 16,
          boxShadow: "var(--shadow-card)",
          padding: "32px",
          marginBottom: 28,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span className="pill" style={{ background: "rgba(249, 115, 22, 0.2)", color: "var(--citrus-orange)", border: "1px solid rgba(249, 115, 22, 0.4)" }}>
                  {user?.avatar || "🍊"} Welcome Back, {user?.full_name || "Agro-Entrepreneur"}
                </span>
                <span className="tag-badge" style={{ fontSize: "0.76rem" }}>
                  Active Venture Command Center
                </span>
              </div>
              <h1 style={{ fontSize: "2rem", margin: "4px 0 8px", color: "var(--text-heading)" }}>
                {venture.name}
              </h1>
              <p className="muted" style={{ margin: 0, fontSize: "0.92rem", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <span><MapPin size={15} style={{ verticalAlign: "middle", marginRight: 4 }} color="var(--citrus-orange)" /> {venture.location}</span>
                <span>•</span>
                <span><Layers size={15} style={{ verticalAlign: "middle", marginRight: 4 }} color="var(--cyan)" /> {venture.category}</span>
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              {/* Feasibility Score (MCDA) */}
              <div
                style={{
                  background: "rgba(34, 197, 94, 0.12)",
                  border: "1px solid rgba(34, 197, 94, 0.35)",
                  borderRadius: 14,
                  padding: "10px 16px",
                  textAlign: "center",
                  minWidth: 120,
                }}
              >
                <span style={{ fontSize: "0.68rem", color: "#4ade80", fontWeight: 800, textTransform: "uppercase", display: "block", letterSpacing: 0.5 }}>
                  Feasibility Score
                </span>
                <strong style={{ fontSize: "1.75rem", color: "#4ade80", lineHeight: 1.1 }}>
                  {venture.feasibility_score}%
                </strong>
                <span style={{ fontSize: "0.66rem", color: "var(--cyan)", display: "block", marginTop: 2, fontWeight: 700 }}>
                  ⚖️ MCDA Model
                </span>
              </div>

              {/* MCDA Factor Scores Breakdown */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "6px 12px",
                  background: "var(--panel-subtle)",
                  border: "1px solid var(--line)",
                  borderRadius: 12,
                  padding: "8px 14px",
                  fontSize: "0.74rem",
                }}
              >
                <div>
                  <span style={{ color: "var(--muted)" }}>Capital Fit: </span>
                  <strong style={{ color: "var(--ok)", fontWeight: 800 }}>{venture.capital_fit}%</strong>
                </div>
                <div>
                  <span style={{ color: "var(--muted)" }}>Infra Fit: </span>
                  <strong style={{ color: "var(--cyan)", fontWeight: 800 }}>{venture.infrastructure_fit}%</strong>
                </div>
                <div>
                  <span style={{ color: "var(--muted)" }}>Market Fit: </span>
                  <strong style={{ color: "var(--citrus-orange)", fontWeight: 800 }}>{venture.market_fit}%</strong>
                </div>
                <div>
                  <span style={{ color: "var(--muted)" }}>Skill Fit: </span>
                  <strong style={{ color: "var(--text-heading)", fontWeight: 800 }}>{venture.skill_fit}%</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Breakdown Strip */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
              marginTop: 24,
              paddingTop: 20,
              borderTop: "1px solid var(--line)",
            }}
          >
            <div>
              <span className="field-label" style={{ margin: 0, fontSize: "0.72rem" }}>Total Project Cost</span>
              <strong style={{ fontSize: "1.25rem", color: "var(--text-heading)", display: "block", marginTop: 2 }}>
                ₹{venture.total_cost?.toLocaleString()}
              </strong>
            </div>

            <div>
              <span className="field-label" style={{ margin: 0, fontSize: "0.72rem" }}>Promoter Equity (Your Capital)</span>
              <strong style={{ fontSize: "1.25rem", color: "var(--cyan)", display: "block", marginTop: 2 }}>
                ₹{venture.own_equity?.toLocaleString()}
              </strong>
            </div>

            <div>
              <span className="field-label" style={{ margin: 0, fontSize: "0.72rem" }}>
                Govt Subsidy (35% PMFME)
              </span>
              <strong style={{ fontSize: "1.25rem", color: "var(--citrus-orange)", display: "block", marginTop: 2 }}>
                ₹{venture.subsidy_amount?.toLocaleString()}
              </strong>
            </div>

            <div>
              <span className="field-label" style={{ margin: 0, fontSize: "0.72rem" }}>Bank Term Loan</span>
              <strong style={{ fontSize: "1.25rem", color: "#a78bfa", display: "block", marginTop: 2 }}>
                ₹{venture.bank_loan?.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24, alignItems: "start" }}>
        {/* Left Column: Business Implementation Journey Tracker */}
        <div
          className="card"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: "24px",
            boxShadow: "var(--shadow-card)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.15rem", color: "var(--text-heading)", display: "flex", alignItems: "center", gap: 8 }}>
                <Calendar size={18} color="var(--citrus-orange)" />
                Your Implementation Journey
              </h3>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                Phased execution roadmap for your active citrus venture
              </span>
            </div>
            <Link
              to="/roadmap"
              style={{
                fontSize: "0.82rem",
                color: "var(--citrus-orange)",
                textDecoration: "none",
                fontWeight: 600,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              Open Full Roadmap →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {JOURNEY_STAGES.map((s) => (
              <div
                key={s.phase}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "14px",
                  borderRadius: 12,
                  background:
                    s.status === "in_progress"
                      ? "rgba(249, 115, 22, 0.08)"
                      : s.status === "completed"
                      ? "rgba(34, 197, 94, 0.06)"
                      : "rgba(255, 255, 255, 0.02)",
                  border:
                    s.status === "in_progress"
                      ? "1px solid rgba(249, 115, 22, 0.35)"
                      : s.status === "completed"
                      ? "1px solid rgba(34, 197, 94, 0.25)"
                      : "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <div style={{ marginTop: 2 }}>
                  {s.status === "completed" ? (
                    <CheckCircle2 size={20} color="#4ade80" />
                  ) : s.status === "in_progress" ? (
                    <div className="glowing-dot" style={{ width: 14, height: 14, background: "var(--citrus-orange)", boxShadow: "0 0 10px var(--citrus-orange)" }} />
                  ) : (
                    <div style={{ width: 14, height: 14, borderRadius: "50%", border: "2px solid var(--muted)", margin: "3px" }} />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "0.92rem", color: s.status === "pending" ? "var(--muted)" : "var(--text-heading)" }}>
                      Phase {s.phase}: {s.title}
                    </strong>
                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 10,
                        background:
                          s.status === "completed"
                            ? "rgba(34, 197, 94, 0.2)"
                            : s.status === "in_progress"
                            ? "rgba(249, 115, 22, 0.2)"
                            : "rgba(255, 255, 255, 0.06)",
                        color:
                          s.status === "completed"
                            ? "#4ade80"
                            : s.status === "in_progress"
                            ? "var(--citrus-orange)"
                            : "var(--muted)",
                      }}
                    >
                      {s.status === "completed" ? "Done" : s.status === "in_progress" ? "In Progress" : "Upcoming"}
                    </span>
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--muted)" }}>
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Quick Action Cards & Live Tools */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Action 1: Bankable DPR */}
          <div
            className="card"
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: 16,
              padding: "20px",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(6, 182, 212, 0.15)", display: "grid", placeItems: "center" }}>
                <Printer size={18} color="var(--cyan)" />
              </div>
              <div>
                <strong style={{ fontSize: "0.98rem", color: "var(--text-heading)" }}>
                  Bankable Project Report (DPR)
                </strong>
                <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>
                  Ready for PMFME Portal & Bank Submission
                </span>
              </div>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.5, marginBottom: 16 }}>
              Complete 8-section report with Capex/Opex schedule, loan amortization, and 35% subsidy claim notes.
            </p>
            <Link
              to="/business-plan"
              className="cta"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "10px",
                fontSize: "0.88rem",
                textDecoration: "none",
                borderRadius: 8,
              }}
            >
              <FileText size={16} /> Open & Print Bankable DPR →
            </Link>
          </div>

          {/* Action 2: Mandi Price Forecaster */}
          <div
            className="card"
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
              borderRadius: 16,
              padding: "20px",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(249, 115, 22, 0.15)", display: "grid", placeItems: "center" }}>
                <TrendingUp size={18} color="var(--citrus-orange)" />
              </div>
              <div>
                <strong style={{ fontSize: "0.98rem", color: "var(--text-heading)" }}>
                  Mandi Rates & 7-Day Forecast
                </strong>
                <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>
                  Kalamna & Katol APMC daily modal prices
                </span>
              </div>
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.5, marginBottom: 16 }}>
              Track fruit arrival volumes, price velocity, and AI harvest advice to maximize your returns.
            </p>
            <Link
              to="/market-rates"
              className="glass-btn"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "10px",
                fontSize: "0.88rem",
                textDecoration: "none",
                borderRadius: 8,
                width: "100%",
                color: "var(--text-heading)",
              }}
            >
              Check Mandi Trends →
            </Link>
          </div>

          {/* Action 3: Switch Active Venture or Re-evaluate */}
          <div
            style={{
              padding: "16px",
              borderRadius: 14,
              background: "var(--panel-subtle)",
              border: "1px dashed var(--line)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <span style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block" }}>
              Want to switch to another venture or test new parameters?
            </span>
            <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap" }}>
              <Link
                to="/results"
                style={{
                  fontSize: "0.82rem",
                  color: "var(--citrus-orange)",
                  textDecoration: "none",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                🗺️ Switch Active Venture →
              </Link>
              <Link
                to="/assess"
                style={{
                  fontSize: "0.82rem",
                  color: "var(--cyan)",
                  textDecoration: "none",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <RotateCcw size={13} /> Re-run Wizard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
