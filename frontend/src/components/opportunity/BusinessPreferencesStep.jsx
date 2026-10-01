import React from "react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Briefcase,
  Layers,
  Clock,
  Calendar,
  ShieldAlert,
  Users,
  Target,
  GraduationCap,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Store,
  Factory,
  Truck,
  Wrench,
  Cpu,
  Sprout,
  HeartHandshake,
  Check,
} from "lucide-react";

export const DEFAULT_PREFERENCES_STATE = {
  businessTypes: ["food_processing", "trading_selling"],
  businessScale: "small_enterprise",
  timeCommitment: "full_time",
  startTimeline: "within_3_months",
  riskTolerance: "moderate",
  startingApproach: "on_my_own",
  corePriorities: [
    "existing_resources",
    "existing_skills",
    "steady_income",
    "local_market",
  ],
  willingnessToLearn: "practical_affordable",
};

const BUSINESS_TYPE_OPTIONS = [
  { id: "agriculture", label: "Agriculture & Cultivation", icon: "🌱", desc: "Citrus farming, nursery & shade-net polyhouses" },
  { id: "manufacturing", label: "Production & Manufacturing", icon: "🏭", desc: "Peel oil, bio-compost & packaging materials" },
  { id: "food_processing", label: "Food Processing & Value Addition", icon: "🥤", desc: "Juice, squash, RTS beverages & fruit pulping" },
  { id: "trading_selling", label: "Trading & Wholesale Selling", icon: "💰", desc: "Mandi commission, shellac waxing & fresh exports" },
  { id: "logistics_storage", label: "Logistics & Cold Storage", icon: "🚚", desc: "Farm-gate pre-cooling & refrigerated transit" },
  { id: "services", label: "Agro Services & Equipment Rental", icon: "🛠️", desc: "Tractor custom hiring, sprayers & agronomy" },
  { id: "technology", label: "Technology & Agritech", icon: "💻", desc: "Soil sensors, mandi analytics & traceability" },
  { id: "open_to_all", label: "I'm open to anything viable", icon: "🤔", desc: "Prioritize maximum return on investment and subsidy" },
];

const SCALE_OPTIONS = [
  { id: "home_based", label: "Small / Home-Based", desc: "Low capex, artisanal or kitchen-scale pilot setup" },
  { id: "micro", label: "Micro Business", desc: "Dedicated shop or small farm-gate packing shed" },
  { id: "small_enterprise", label: "Small Enterprise", desc: "Commercial machinery, 3–10 staff, regional market" },
  { id: "medium_large", label: "Medium / Large Enterprise", desc: "Industrial MIDC plot, high volume export lines" },
  { id: "not_sure", label: "Not sure / Recommend for me", desc: "Let EntreVision optimize based on budget & skills" },
];

const TIME_OPTIONS = [
  { id: "part_time", label: "⏱️ Part-time", desc: "10–20 hours/week alongside existing job or farm" },
  { id: "full_time", label: "⚡ Full-time", desc: "100% dedicated primary entrepreneurial venture" },
  { id: "seasonal", label: "🍊 Seasonal", desc: "Intensive focus during citrus harvest (Oct–March)" },
  { id: "family_business", label: "👨‍👩‍👧 Family Business", desc: "Shared daily workload among family members" },
];

const TIMELINE_OPTIONS = [
  { id: "immediately", label: "⚡ Immediately" },
  { id: "within_3_months", label: "🌱 Within 3 months" },
  { id: "within_6_months", label: "📅 Within 6 months" },
  { id: "within_1_year", label: "⏳ Within 1 year" },
  { id: "just_exploring", label: "🔍 Just exploring" },
];

const RISK_OPTIONS = [
  {
    id: "low",
    title: "Prefer Lower Risk",
    desc: "Low upfront capex, proven local demand, immediate cash flows (e.g. Mandi trading, certified nursery).",
    icon: "🛡️",
  },
  {
    id: "moderate",
    title: "Moderate Risk",
    desc: "Balanced investment backed by 35% PMFME subsidies (e.g. Micro juice unit, cold room).",
    icon: "⚖️",
  },
  {
    id: "high",
    title: "Open to Higher Risk / High Growth",
    desc: "Commercial capex, automated processing lines, export-grade grading & oil extraction.",
    icon: "🚀",
  },
  {
    id: "not_sure",
    title: "Not Sure",
    desc: "Match me with the most stable risk-adjusted return model.",
    icon: "❓",
  },
];

const STARTING_APPROACH_OPTIONS = [
  { id: "on_my_own", label: "On my own", desc: "Solo founder managing operations directly", icon: "👤" },
  { id: "with_family", label: "With family", desc: "Family-owned and operated venture", icon: "👨‍👩‍👦" },
  { id: "with_partner", label: "With a business partner", desc: "Co-investing with complementary skills", icon: "🤝" },
  { id: "open_collaboration", label: "Open to collaboration / FPO", desc: "Interested in FPO aggregation or joint ventures", icon: "🌐" },
];

const CORE_PRIORITIES_OPTIONS = [
  { id: "low_investment", label: "Low initial investment & fast breakeven", icon: "💵" },
  { id: "existing_resources", label: "Leverage my existing land / shed / tractor", icon: "🚜" },
  { id: "existing_skills", label: "Directly utilize my current skills", icon: "🎯" },
  { id: "steady_income", label: "Steady predictable monthly cash flow", icon: "📈" },
  { id: "high_growth", label: "High long-term scalability & margins", icon: "🚀" },
  { id: "local_market", label: "Strong local Vidarbha / Nagpur mandi demand", icon: "📍" },
  { id: "social_impact", label: "Support local farmers & environmental impact", icon: "🌱" },
];

const LEARNING_OPTIONS = [
  {
    id: "willing_to_learn",
    title: "Yes — I'm fully willing to build new skills",
    desc: "Eager to attend CCRI / KVK workshops and master technical processes.",
    icon: "🎓",
  },
  {
    id: "practical_affordable",
    title: "Yes — If training is practical & affordable",
    desc: "Open to short local training sessions and subsidized government programs.",
    icon: "📘",
  },
  {
    id: "current_skills_only",
    title: "Prefer opportunities matching my current skills",
    desc: "Prioritize models where I can start immediately without new training.",
    icon: "⚡",
  },
  {
    id: "not_sure",
    title: "Not sure / Show me the skill gaps",
    desc: "Evaluate the requirement first before committing to training.",
    icon: "🤔",
  },
];

export default function BusinessPreferencesStep({
  preferencesData = DEFAULT_PREFERENCES_STATE,
  loading = false,
  onChange,
  onSubmit,
  onBack,
}) {
  const data = { ...DEFAULT_PREFERENCES_STATE, ...preferencesData };

  const toggleBusinessType = (id) => {
    let current = data.businessTypes || [];
    if (id === "open_to_all") {
      current = current.includes("open_to_all") ? [] : ["open_to_all"];
    } else {
      current = current.filter((t) => t !== "open_to_all");
      current = current.includes(id) ? current.filter((t) => t !== id) : [...current, id];
    }
    onChange({ preferencesData: { ...data, businessTypes: current } });
  };

  const togglePriority = (id) => {
    const current = data.corePriorities || [];
    const next = current.includes(id)
      ? current.filter((p) => p !== id)
      : [...current, id];
    onChange({ preferencesData: { ...data, corePriorities: next } });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="about-me-container">
      {/* Intro Header */}
      <div className="wizard-intro-header">
        <h2 className="wizard-main-title">TELL US WHAT KIND OF BUSINESS YOU WANT</h2>
        <p className="wizard-main-subtitle">
          The purpose is to understand what kind of business you <strong>actually want</strong>, not just what you are technically capable of doing.
        </p>
      </div>

      {/* Main Glass Container */}
      <div className="card wizard-form-card">
        {/* ====================================================================
            1. 🥤 WHAT TYPE OF BUSINESS INTERESTS YOU?
           ==================================================================== */}
        <div className="doc-category-box">
          <div className="doc-category-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Briefcase size={20} color="var(--cyan)" />
              <div>
                <strong style={{ fontSize: "1.05rem", color: "var(--text-heading)" }}>
                  1. WHAT TYPE OF BUSINESS INTERESTS YOU?
                </strong>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                  Select all sectors or value-chain stages that excite you
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
            {BUSINESS_TYPE_OPTIONS.map((item) => {
              const isSelected = (data.businessTypes || []).includes(item.id);
              return (
                <div
                  key={item.id}
                  className={`goal-checkbox-card ${isSelected ? "checked" : ""}`}
                  style={{ padding: "12px 14px", alignItems: "flex-start" }}
                  onClick={() => toggleBusinessType(item.id)}
                >
                  <div className="custom-checkbox-square" style={{ width: 18, height: 18, marginTop: 2 }}>
                    {isSelected && <span style={{ fontSize: "0.75rem" }}>✓</span>}
                  </div>
                  <span style={{ fontSize: "1.2rem", marginTop: 1 }}>{item.icon}</span>
                  <div>
                    <strong style={{ fontSize: "0.88rem", color: "var(--text-heading)", display: "block" }}>
                      {item.label}
                    </strong>
                    <span style={{ fontSize: "0.76rem", color: "var(--muted)", lineHeight: 1.3, display: "block", marginTop: 2 }}>
                      {item.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ====================================================================
            2. 🏢 WHAT SCALE ARE YOU LOOKING FOR?
           ==================================================================== */}
        <div className="doc-category-box">
          <div className="doc-category-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Layers size={20} color="var(--ok)" />
              <div>
                <strong style={{ fontSize: "1.05rem", color: "var(--text-heading)" }}>
                  2. WHAT SCALE ARE YOU LOOKING FOR?
                </strong>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                  Operational scale and initial footprint preference
                </span>
              </div>
            </div>
          </div>

          <div className="situation-grid">
            {SCALE_OPTIONS.map((scale) => {
              const isSelected = data.businessScale === scale.id;
              return (
                <div
                  key={scale.id}
                  className={`situation-card ${isSelected ? "selected" : ""}`}
                  style={{ padding: "12px 16px" }}
                  onClick={() => onChange({ preferencesData: { ...data, businessScale: scale.id } })}
                >
                  <div>
                    <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)", display: "block" }}>
                      {scale.label}
                    </strong>
                    <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{scale.desc}</span>
                  </div>
                  <div className="situation-radio-circle">
                    {isSelected && <div className="radio-inner-dot" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ====================================================================
            3. ⏱️ TIME COMMITMENT & 4. 📅 TIMELINE (2-Column Grid)
           ==================================================================== */}
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 16 }}>
          {/* Question 3: Time Commitment */}
          <div className="doc-category-box" style={{ margin: 0 }}>
            <div className="doc-category-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Clock size={18} color="var(--electric-blue)" />
                <div>
                  <strong style={{ fontSize: "0.98rem", color: "var(--text-heading)" }}>
                    3. TIME COMMITMENT
                  </strong>
                  <span style={{ fontSize: "0.74rem", color: "var(--muted)", display: "block" }}>
                    How much time can you give?
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {TIME_OPTIONS.map((t) => {
                const isSelected = data.timeCommitment === t.id;
                return (
                  <div
                    key={t.id}
                    className={`situation-card ${isSelected ? "selected" : ""}`}
                    style={{ padding: "10px 12px" }}
                    onClick={() => onChange({ preferencesData: { ...data, timeCommitment: t.id } })}
                  >
                    <div>
                      <strong style={{ fontSize: "0.86rem", color: "var(--text-heading)", display: "block" }}>
                        {t.label}
                      </strong>
                      <span style={{ fontSize: "0.74rem", color: "var(--muted)" }}>{t.desc}</span>
                    </div>
                    <div className="situation-radio-circle">
                      {isSelected && <div className="radio-inner-dot" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Question 4: Timeline */}
          <div className="doc-category-box" style={{ margin: 0 }}>
            <div className="doc-category-header">
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Calendar size={18} color="var(--violet)" />
                <div>
                  <strong style={{ fontSize: "0.98rem", color: "var(--text-heading)" }}>
                    4. STARTING TIMELINE
                  </strong>
                  <span style={{ fontSize: "0.74rem", color: "var(--muted)", display: "block" }}>
                    When would you like to launch?
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {TIMELINE_OPTIONS.map((tl) => {
                const isSelected = data.startTimeline === tl.id;
                return (
                  <div
                    key={tl.id}
                    className={`situation-card ${isSelected ? "selected" : ""}`}
                    style={{ padding: "10px 12px" }}
                    onClick={() => onChange({ preferencesData: { ...data, startTimeline: tl.id } })}
                  >
                    <strong style={{ fontSize: "0.86rem", color: "var(--text-heading)" }}>{tl.label}</strong>
                    <div className="situation-radio-circle">
                      {isSelected && <div className="radio-inner-dot" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ====================================================================
            5. 🛡️ RISK TOLERANCE
           ==================================================================== */}
        <div className="doc-category-box">
          <div className="doc-category-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ShieldAlert size={20} color="var(--cyan)" />
              <div>
                <strong style={{ fontSize: "1.05rem", color: "var(--text-heading)" }}>
                  5. HOW COMFORTABLE ARE YOU WITH RISK?
                </strong>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                  Risk vs return trade-off for your business model
                </span>
              </div>
            </div>
          </div>

          <div className="situation-grid">
            {RISK_OPTIONS.map((r) => {
              const isSelected = data.riskTolerance === r.id;
              return (
                <div
                  key={r.id}
                  className={`situation-card ${isSelected ? "selected" : ""}`}
                  style={{ padding: "12px 16px" }}
                  onClick={() => onChange({ preferencesData: { ...data, riskTolerance: r.id } })}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ fontSize: "1.2rem", marginTop: 2 }}>{r.icon}</span>
                    <div>
                      <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)", display: "block" }}>
                        {r.title}
                      </strong>
                      <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{r.desc}</span>
                    </div>
                  </div>
                  <div className="situation-radio-circle">
                    {isSelected && <div className="radio-inner-dot" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ====================================================================
            6. 👥 HOW DO YOU WANT TO START? (Team / Partnership)
           ==================================================================== */}
        <div className="doc-category-box">
          <div className="doc-category-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Users size={20} color="var(--electric-blue)" />
              <div>
                <strong style={{ fontSize: "1.05rem", color: "var(--text-heading)" }}>
                  6. HOW DO YOU WANT TO START?
                </strong>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                  Solo venture, family enterprise, or partner co-founding
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10 }}>
            {STARTING_APPROACH_OPTIONS.map((opt) => {
              const isSelected = data.startingApproach === opt.id;
              return (
                <div
                  key={opt.id}
                  className={`situation-card ${isSelected ? "selected" : ""}`}
                  style={{ padding: "12px 14px", flexDirection: "column", alignItems: "flex-start" }}
                  onClick={() => onChange({ preferencesData: { ...data, startingApproach: opt.id } })}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "1.1rem" }}>{opt.icon}</span>
                      <strong style={{ fontSize: "0.88rem", color: "var(--text-heading)" }}>{opt.label}</strong>
                    </div>
                    <div className="situation-radio-circle">
                      {isSelected && <div className="radio-inner-dot" />}
                    </div>
                  </div>
                  <span style={{ fontSize: "0.76rem", color: "var(--muted)", marginTop: 6 }}>{opt.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ====================================================================
            7. 🎯 WHAT MATTERS MOST TO YOU? (Core Priorities)
           ==================================================================== */}
        <div className="doc-category-box">
          <div className="doc-category-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Target size={20} color="var(--ok)" />
              <div>
                <strong style={{ fontSize: "1.05rem", color: "var(--text-heading)" }}>
                  7. WHAT MATTERS MOST TO YOU?
                </strong>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                  Select the key outcomes and criteria defining success for you
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
            {CORE_PRIORITIES_OPTIONS.map((p) => {
              const isSelected = (data.corePriorities || []).includes(p.id);
              return (
                <div
                  key={p.id}
                  className={`goal-checkbox-card ${isSelected ? "checked" : ""}`}
                  style={{ padding: "10px 14px", fontSize: "0.84rem" }}
                  onClick={() => togglePriority(p.id)}
                >
                  <div className="custom-checkbox-square" style={{ width: 18, height: 18 }}>
                    {isSelected && <span style={{ fontSize: "0.75rem" }}>✓</span>}
                  </div>
                  <span style={{ fontSize: "1.1rem" }}>{p.icon}</span>
                  <span style={{ fontWeight: isSelected ? 700 : 500 }}>{p.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ====================================================================
            8. 🎓 WILLINGNESS TO BUILD NEW SKILLS (Mentor Concept Addition)
           ==================================================================== */}
        <div
          className="doc-category-box"
          style={{
            background: "linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(99, 102, 241, 0.06) 100%)",
            borderColor: "rgba(6, 182, 212, 0.3)",
          }}
        >
          <div className="doc-category-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <GraduationCap size={20} color="var(--cyan)" />
              <div>
                <strong style={{ fontSize: "1.05rem", color: "var(--text-heading)" }}>
                  8. ARE YOU WILLING TO BUILD NEW SKILLS IF AN OPPORTUNITY REQUIRES THEM?
                </strong>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                  EntreVision mentors you: if a great business has a skill gap, we provide learning pathways rather than rejecting it.
                </span>
              </div>
            </div>
          </div>

          <div className="situation-grid">
            {LEARNING_OPTIONS.map((l) => {
              const isSelected = data.willingnessToLearn === l.id;
              return (
                <div
                  key={l.id}
                  className={`situation-card ${isSelected ? "selected" : ""}`}
                  style={{ padding: "12px 16px" }}
                  onClick={() => onChange({ preferencesData: { ...data, willingnessToLearn: l.id } })}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ fontSize: "1.2rem", marginTop: 2 }}>{l.icon}</span>
                    <div>
                      <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)", display: "block" }}>
                        {l.title}
                      </strong>
                      <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{l.desc}</span>
                    </div>
                  </div>
                  <div className="situation-radio-circle">
                    {isSelected && <div className="radio-inner-dot" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Final CTA Bar */}
        <div className="wizard-actions-bar">
          <button type="button" className="btn-secondary-gloss" onClick={onBack} disabled={loading}>
            <ArrowLeft size={16} /> Back
          </button>
          <button
            type="submit"
            className="btn-primary-gloss"
            style={{
              padding: "18px 40px",
              fontSize: "1.05rem",
              background: "linear-gradient(135deg, var(--electric-blue) 0%, var(--cyan) 100%)",
              boxShadow: "0 10px 30px -5px rgba(99, 102, 241, 0.5)",
            }}
            disabled={loading}
          >
            <Sparkles size={20} />
            <span>{loading ? "Matching Algorithm Running..." : "ANALYZE MY PROFILE →"}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
