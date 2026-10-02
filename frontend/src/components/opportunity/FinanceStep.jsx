import React, { useState } from "react";
import {
  Coins,
  Wallet,
  Landmark,
  PiggyBank,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  HelpCircle,
  Clock,
  Gauge,
  Percent,
  Calculator,
  CheckCircle2,
  AlertCircle,
  Building,
  CreditCard,
  Users,
  Info,
} from "lucide-react";

export const DEFAULT_FINANCE_STATE = {
  // 1. Available Liquid Capital
  budgetTier: "1_to_5_lakh", // "below_1_lakh" | "1_to_5_lakh" | "5_to_10_lakh" | "10_to_25_lakh" | "above_25_lakh"
  availableCapitalINR: 300000, // Exact amount

  // 2. Funding Sources
  fundingSources: ["personal_savings", "govt_subsidy", "bank_loan"],

  // 3. Borrowing Preference
  borrowingComfort: "open_to_loans", // "no_loan" | "small_loan" | "open_to_loans" | "significant_financing"

  // 4. Investment Horizon
  investmentHorizon: "within_3_months", // "immediately" | "within_3_months" | "within_6_months" | "within_1_year" | "exploring"

  // 5. Expected Investment Comfort
  comfortLevel: "moderate", // "low" | "moderate" | "large" | "not_sure"

  // 6. Existing Commitments
  existingLoans: "no", // "no" | "moderate" | "significant"
};

const CAPITAL_TIERS = [
  { id: "below_1_lakh", label: "Below ₹1 lakh", defaultVal: 75000, desc: "Micro / Low-risk entry" },
  { id: "1_to_5_lakh", label: "₹1–5 lakh", defaultVal: 300000, desc: "Standard entry & micro-units" },
  { id: "5_to_10_lakh", label: "₹5–10 lakh", defaultVal: 750000, desc: "Semi-automated setups" },
  { id: "10_to_25_lakh", label: "₹10–25 lakh", defaultVal: 1500000, desc: "Commercial processing line" },
  { id: "above_25_lakh", label: "₹25 lakh+", defaultVal: 3500000, desc: "Full-scale industrial plant" },
];

const FUNDING_SOURCE_OPTIONS = [
  { id: "personal_savings", label: "Personal savings (Liquid funds)", icon: "💰" },
  { id: "family_friends", label: "Family / Friends support", icon: "🤝" },
  { id: "partner_equity", label: "Business partner / Co-founder", icon: "👥" },
  { id: "bank_loan", label: "Bank loan / MUDRA / CGTMSE", icon: "🏦" },
  { id: "govt_subsidy", label: "Government assistance / PMFME 35% Subsidy", icon: "🏛️" },
  { id: "investor", label: "Angel investor / Venture funding", icon: "📈" },
  { id: "other", label: "Other / Asset sale / Unsecured", icon: "💼" },
];

const BORROWING_OPTIONS = [
  {
    id: "no_loan",
    title: "I don't want a loan",
    desc: "100% self-funded only. Zero debt and zero interest liability.",
    icon: "🛡️",
  },
  {
    id: "small_loan",
    title: "I may consider a small loan",
    desc: "Willing to borrow up to 20–30% of project cost to cover equipment or working capital.",
    icon: "🌱",
  },
  {
    id: "open_to_loans",
    title: "I'm open to loans with government subsidy",
    desc: "Comfortable taking bank term loans backed by PMFME 35% capital subsidy / AIF interest subvention.",
    icon: "🏦",
  },
  {
    id: "significant_financing",
    title: "I can consider significant project financing",
    desc: "Ready to leverage 65–80% institutional bank debt for high-ROI commercial machinery.",
    icon: "🚀",
  },
];

const HORIZON_OPTIONS = [
  { id: "immediately", label: "⚡ Immediately", desc: "Capital is ready, eager to start setup now" },
  { id: "within_3_months", label: "🌱 Within 3 months", desc: "Actively planning, finalising machinery & space" },
  { id: "within_6_months", label: "📅 Within 6 months", desc: "Arranging finances and conducting local survey" },
  { id: "within_1_year", label: "⏳ Within 1 year", desc: "Medium-term planning and learning stage" },
  { id: "exploring", label: "🔍 Only exploring for now", desc: "Evaluating feasibility and market viability" },
];

const COMFORT_LEVEL_OPTIONS = [
  {
    id: "low",
    title: "Low-investment / Asset-light",
    desc: "Prefer minimal upfront capital risk (e.g. trading, nursery, farm-gate packaging).",
  },
  {
    id: "moderate",
    title: "Moderate investment",
    desc: "Comfortable with balanced capex with subsidy support (e.g. juice line, cold room).",
  },
  {
    id: "large",
    title: "Large investment if suitable",
    desc: "Willing to invest high capital for lucrative, defensible manufacturing lines.",
  },
  {
    id: "not_sure",
    title: "I'm not sure yet",
    desc: "Recommend the best balance based on my skills, location, and market ROI.",
  },
];

const EXISTING_LOAN_OPTIONS = [
  { id: "no", title: "No active loans", desc: "Clean balance sheet with no major ongoing EMI commitments" },
  { id: "moderate", title: "Yes, moderate loan obligations", desc: "Manageable monthly EMIs that do not impact new business cash flows" },
  { id: "significant", title: "Yes, significant existing EMIs", desc: "Prefer asset-light or rapid cashflow models to manage debt service" },
];

export default function FinanceStep({
  financeData = DEFAULT_FINANCE_STATE,
  onChange,
  onNext,
  onBack,
}) {
  const data = { ...DEFAULT_FINANCE_STATE, ...financeData };

  // Calculate dynamic leverage & PMFME 35% subsidy
  const ownEquity = Number(data.availableCapitalINR) || 100000;
  
  // Standard PMFME Scheme: Max project cost eligible is ₹28.5L for ₹10L subsidy (35% with max cap of ₹10L).
  // Promoters contribute 10-20% min, bank gives balance loan.
  const estimatedMaxSubsidy = Math.min(Math.round(ownEquity * 1.5), 1000000);
  const estimatedBankLoan = data.borrowingComfort === "no_loan" ? 0 : Math.round(ownEquity * 2.5);
  const totalAccessibleProject = ownEquity + (data.borrowingComfort === "no_loan" ? 0 : (estimatedMaxSubsidy + estimatedBankLoan));

  const handleTierSelect = (tier) => {
    onChange({
      financeData: {
        ...data,
        budgetTier: tier.id,
        availableCapitalINR: tier.defaultVal,
      },
    });
  };

  const handleAmountChange = (val) => {
    const num = Math.max(10000, Number(val) || 0);
    let matchedTier = "1_to_5_lakh";
    if (num < 100000) matchedTier = "below_1_lakh";
    else if (num <= 500000) matchedTier = "1_to_5_lakh";
    else if (num <= 1000000) matchedTier = "5_to_10_lakh";
    else if (num <= 2500000) matchedTier = "10_to_25_lakh";
    else matchedTier = "above_25_lakh";

    onChange({
      financeData: {
        ...data,
        budgetTier: matchedTier,
        availableCapitalINR: num,
      },
    });
  };

  const toggleSource = (id) => {
    const current = data.fundingSources || [];
    const next = current.includes(id)
      ? current.filter((s) => s !== id)
      : [...current, id];
    onChange({
      financeData: {
        ...data,
        fundingSources: next,
      },
    });
  };

  const handleContinue = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleContinue} className="about-me-container">
      {/* Intro Header */}
      <div className="wizard-intro-header">
        <h2 className="wizard-main-title">UNDERSTAND YOUR FINANCES</h2>
        <p className="wizard-main-subtitle">
          This helps us identify businesses that fit your current financial capacity and structure potential funding routes with government assistance.
        </p>
      </div>

      {/* Main Glass Container */}
      <div className="card wizard-form-card">
        {/* ====================================================================
            1. 💰 AVAILABLE CAPITAL (Liquid Money to Invest)
           ==================================================================== */}
        <div className="doc-category-box">
          <div className="doc-category-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Wallet size={20} color="var(--cyan)" />
              <div>
                <strong style={{ fontSize: "1.05rem", color: "var(--text-heading)" }}>
                  💰 AVAILABLE LIQUID CAPITAL
                </strong>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                  How much money can you actually put into starting this business right now?
                </span>
              </div>
            </div>
          </div>

          {/* Distinction Banner: Available Capital != Total Wealth */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: "10px 14px",
              borderRadius: 12,
              background: "rgba(99, 102, 241, 0.08)",
              border: "1px solid var(--line-glow)",
              marginBottom: 16,
              fontSize: "0.82rem",
              lineHeight: 1.5,
            }}
          >
            <Info size={18} color="var(--cyan)" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong style={{ color: "var(--text-heading)" }}>Important Distinction: Available Capital ≠ Total Wealth. </strong>
              <span style={{ color: "var(--muted)" }}>
                Even if you own land, tractors, or property, specify only the <strong>liquid cash/funds</strong> you are willing to inject into starting this venture.
              </span>
            </div>
          </div>

          {/* Quick Capital Tiers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, marginBottom: 16 }}>
            {CAPITAL_TIERS.map((tier) => {
              const isSelected = data.budgetTier === tier.id;
              return (
                <button
                  type="button"
                  key={tier.id}
                  className={`pill-option-btn ${isSelected ? "active" : ""}`}
                  style={{
                    padding: "10px 12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 4,
                  }}
                  onClick={() => handleTierSelect(tier)}
                >
                  <span style={{ fontSize: "0.88rem", fontWeight: 700 }}>{tier.label}</span>
                  <span style={{ fontSize: "0.7rem", opacity: 0.8 }}>{tier.desc}</span>
                </button>
              );
            })}
          </div>

          {/* Exact Capital Value Display & Slider */}
          <div
            style={{
              padding: 16,
              borderRadius: 14,
              background: "var(--panel-solid)",
              border: "1px solid var(--line)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
              <span className="field-sublabel" style={{ margin: 0 }}>
                Adjust Exact Own Contribution:
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: "0.9rem", fontWeight: 800, color: "var(--cyan)" }}>₹</span>
                <input
                  type="number"
                  min="25000"
                  max="5000000"
                  step="25000"
                  className="glass-input-field mini"
                  style={{ width: 140, fontWeight: 800, fontSize: "0.95rem", textAlign: "right" }}
                  value={data.availableCapitalINR}
                  onChange={(e) => handleAmountChange(e.target.value)}
                />
                <span style={{ fontSize: "0.82rem", color: "var(--muted)", fontWeight: 600 }}>
                  ({data.availableCapitalINR >= 100000 ? `₹${(data.availableCapitalINR / 100000).toFixed(1)} Lakh` : `₹${data.availableCapitalINR / 1000}k`})
                </span>
              </div>
            </div>

            <input
              type="range"
              min="50000"
              max="5000000"
              step="25000"
              value={data.availableCapitalINR}
              onChange={(e) => handleAmountChange(e.target.value)}
              style={{ width: "100%", accentColor: "var(--cyan)", cursor: "pointer" }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--muted)", marginTop: 6 }}>
              <span>₹50,000 (Micro)</span>
              <span>₹5 Lakh (Standard)</span>
              <span>₹15 Lakh (Commercial)</span>
              <span>₹50 Lakh+ (Industrial)</span>
            </div>
          </div>
        </div>

        {/* ====================================================================
            2. 🏛️ WHERE CAN THE MONEY COME FROM? (Funding Sources)
           ==================================================================== */}
        <div className="doc-category-box">
          <div className="doc-category-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Landmark size={20} color="var(--ok)" />
              <div>
                <strong style={{ fontSize: "1.05rem", color: "var(--text-heading)" }}>
                  🏛️ WHERE CAN THE MONEY COME FROM?
                </strong>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                  Select all the potential capital channels available to you
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 10 }}>
            {FUNDING_SOURCE_OPTIONS.map((src) => {
              const isSelected = (data.fundingSources || []).includes(src.id);
              return (
                <div
                  key={src.id}
                  className={`goal-checkbox-card ${isSelected ? "checked" : ""}`}
                  style={{ padding: "10px 14px", fontSize: "0.84rem" }}
                  onClick={() => toggleSource(src.id)}
                >
                  <div className="custom-checkbox-square" style={{ width: 18, height: 18 }}>
                    {isSelected && <span style={{ fontSize: "0.75rem" }}>✓</span>}
                  </div>
                  <span style={{ fontSize: "1.1rem" }}>{src.icon}</span>
                  <span style={{ fontWeight: isSelected ? 700 : 500 }}>{src.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ====================================================================
            3. 🏦 BORROWING PREFERENCE & DEBT COMFORT
           ==================================================================== */}
        <div className="doc-category-box">
          <div className="doc-category-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <TrendingUp size={20} color="var(--electric-blue)" />
              <div>
                <strong style={{ fontSize: "1.05rem", color: "var(--text-heading)" }}>
                  🏦 BORROWING & LOAN PREFERENCE
                </strong>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                  How comfortable are you with borrowing or institutional debt?
                </span>
              </div>
            </div>
          </div>

          <div className="situation-grid">
            {BORROWING_OPTIONS.map((opt) => {
              const isSelected = data.borrowingComfort === opt.id;
              return (
                <div
                  key={opt.id}
                  className={`situation-card ${isSelected ? "selected" : ""}`}
                  style={{ padding: "12px 16px" }}
                  onClick={() =>
                    onChange({
                      financeData: { ...data, borrowingComfort: opt.id },
                    })
                  }
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ fontSize: "1.2rem", marginTop: 2 }}>{opt.icon}</span>
                    <div>
                      <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)", display: "block" }}>
                        {opt.title}
                      </strong>
                      <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{opt.desc}</span>
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
            4. ⏱️ INVESTMENT HORIZON (When Can You Invest?)
           ==================================================================== */}
        <div className="doc-category-box">
          <div className="doc-category-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Clock size={20} color="var(--violet)" />
              <div>
                <strong style={{ fontSize: "1.05rem", color: "var(--text-heading)" }}>
                  ⏱️ WHEN CAN YOU INVEST? (INVESTMENT HORIZON)
                </strong>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                  Timeline before you are ready to commit capital and deploy operations
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10 }}>
            {HORIZON_OPTIONS.map((h) => {
              const isSelected = data.investmentHorizon === h.id;
              return (
                <div
                  key={h.id}
                  className={`situation-card ${isSelected ? "selected" : ""}`}
                  style={{ padding: "12px 14px", flexDirection: "column", alignItems: "flex-start" }}
                  onClick={() =>
                    onChange({
                      financeData: { ...data, investmentHorizon: h.id },
                    })
                  }
                >
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                    <strong style={{ fontSize: "0.9rem", color: "var(--text-heading)" }}>{h.label}</strong>
                    <div className="situation-radio-circle">
                      {isSelected && <div className="radio-inner-dot" />}
                    </div>
                  </div>
                  <span style={{ fontSize: "0.76rem", color: "var(--muted)", marginTop: 4 }}>{h.desc}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ====================================================================
            5. 🎯 EXPECTED INVESTMENT COMFORT & SCALE
           ==================================================================== */}
        <div className="doc-category-box">
          <div className="doc-category-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Gauge size={20} color="var(--cyan)" />
              <div>
                <strong style={{ fontSize: "1.05rem", color: "var(--text-heading)" }}>
                  🎯 WHAT LEVEL OF INVESTMENT ARE YOU COMFORTABLE WITH?
                </strong>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                  Business scale preference separate from current bank balance
                </span>
              </div>
            </div>
          </div>

          <div className="situation-grid">
            {COMFORT_LEVEL_OPTIONS.map((c) => {
              const isSelected = data.comfortLevel === c.id;
              return (
                <div
                  key={c.id}
                  className={`situation-card ${isSelected ? "selected" : ""}`}
                  style={{ padding: "12px 16px" }}
                  onClick={() =>
                    onChange({
                      financeData: { ...data, comfortLevel: c.id },
                    })
                  }
                >
                  <div>
                    <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)", display: "block" }}>
                      {c.title}
                    </strong>
                    <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{c.desc}</span>
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
            6. 📊 EXISTING FINANCIAL COMMITMENTS
           ==================================================================== */}
        <div className="doc-category-box">
          <div className="doc-category-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <CreditCard size={20} color="var(--ok)" />
              <div>
                <strong style={{ fontSize: "1.05rem", color: "var(--text-heading)" }}>
                  📊 EXISTING FINANCIAL COMMITMENTS
                </strong>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                  Do you currently have ongoing personal or business loan EMIs?
                </span>
              </div>
            </div>
          </div>

          <div className="situation-grid">
            {EXISTING_LOAN_OPTIONS.map((opt) => {
              const isSelected = data.existingLoans === opt.id;
              return (
                <div
                  key={opt.id}
                  className={`situation-card ${isSelected ? "selected" : ""}`}
                  style={{ padding: "12px 16px" }}
                  onClick={() =>
                    onChange({
                      financeData: { ...data, existingLoans: opt.id },
                    })
                  }
                >
                  <div>
                    <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)", display: "block" }}>
                      {opt.title}
                    </strong>
                    <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{opt.desc}</span>
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
            7. 💡 MENTOR LEVERAGE CARD (NO OPPORTUNITY ELIMINATED)
           ==================================================================== */}
        <div
          className="doc-center-highlight-box"
          style={{
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(16, 185, 129, 0.08) 100%)",
            borderColor: "rgba(99, 102, 241, 0.35)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Sparkles size={18} color="var(--electric-blue)" />
            <strong style={{ fontSize: "1rem", color: "var(--text-heading)", textTransform: "uppercase" }}>
              💡 ENTREVISION MENTOR PRINCIPLE: NO OPPORTUNITY ELIMINATED TOO EARLY
            </strong>
          </div>

          <p style={{ fontSize: "0.84rem", color: "var(--text)", lineHeight: 1.6, margin: "0 0 14px 0" }}>
            If a high-margin citrus processing business requires <strong>₹15 Lakh</strong> and your available capital is <strong>₹{ownEquity.toLocaleString("en-IN")}</strong>, EntreVision will <strong>NOT</strong> reject it. Instead, our Decision Support System will calculate the <strong>Financial Gap</strong> and suggest actionable pathways (PMFME 35% Capital Subsidy, MUDRA loans, or phased machinery modular setups).
          </p>

          {/* ====================================================================
              FUNDING WATERFALL & CAPITAL STACK VISUALIZER
             ==================================================================== */}
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Visual Stacked Capital Bar */}
            <div style={{ background: "var(--panel-solid)", padding: 18, borderRadius: 16, border: "1px solid var(--line)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-heading)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  📊 Project Capital Stack Allocation (Example ₹15 Lakh Agro Unit)
                </span>
                <span style={{ fontSize: "0.82rem", color: "var(--citrus-orange)", fontWeight: 700 }}>
                  Total Capacity: ₹{Math.max(1500000, totalAccessibleProject).toLocaleString("en-IN")}
                </span>
              </div>

              {/* Progress Stack Bar */}
              <div style={{ display: "flex", height: 28, borderRadius: 10, overflow: "hidden", border: "1px solid var(--line-glass)", marginBottom: 12 }}>
                <div
                  style={{
                    width: `${Math.round((ownEquity / Math.max(1500000, totalAccessibleProject)) * 100)}%`,
                    minWidth: 40,
                    background: "linear-gradient(135deg, var(--citrus-orange), var(--citrus-amber))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.74rem",
                    fontWeight: 800,
                    color: "#fff",
                    transition: "width 0.4s ease",
                  }}
                  title="Promoter Equity (Your Own Funds)"
                >
                  Own Equity ({Math.round((ownEquity / Math.max(1500000, totalAccessibleProject)) * 100)}%)
                </div>
                <div
                  style={{
                    width: `${Math.round((estimatedBankLoan / Math.max(1500000, totalAccessibleProject)) * 100)}%`,
                    minWidth: 40,
                    background: "linear-gradient(135deg, #6366f1, #3b82f6)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.74rem",
                    fontWeight: 800,
                    color: "#fff",
                    transition: "width 0.4s ease",
                  }}
                  title="Bank Term Loan"
                >
                  Bank Loan ({Math.round((estimatedBankLoan / Math.max(1500000, totalAccessibleProject)) * 100)}%)
                </div>
                <div
                  style={{
                    width: `${Math.round((estimatedMaxSubsidy / Math.max(1500000, totalAccessibleProject)) * 100)}%`,
                    minWidth: 40,
                    background: "linear-gradient(135deg, #10b981, #059669)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.74rem",
                    fontWeight: 800,
                    color: "#fff",
                    transition: "width 0.4s ease",
                  }}
                  title="PMFME 35% Capital Subsidy"
                >
                  35% Subsidy ({Math.round((estimatedMaxSubsidy / Math.max(1500000, totalAccessibleProject)) * 100)}%)
                </div>
              </div>

              {/* Waterfall Steps Explanation Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
                <div style={{ background: "var(--panel-subtle)", padding: 12, borderRadius: 12, borderLeft: "3px solid var(--citrus-orange)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.76rem", color: "var(--muted)", fontWeight: 700 }}>1. Promoter Margin</span>
                    <span style={{ fontSize: "0.72rem", color: "var(--ok)", fontWeight: 700 }}>Liquid Equity</span>
                  </div>
                  <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-heading)", marginTop: 4 }}>
                    ₹{ownEquity.toLocaleString("en-IN")}
                  </div>
                  <p style={{ fontSize: "0.76rem", color: "var(--muted)", margin: "4px 0 0 0" }}>
                    Your upfront investment directly deposited for initial machine advance.
                  </p>
                </div>

                <div style={{ background: "var(--panel-subtle)", padding: 12, borderRadius: 12, borderLeft: "3px solid #6366f1" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.76rem", color: "var(--muted)", fontWeight: 700 }}>2. Bank Term Loan</span>
                    <span style={{ fontSize: "0.72rem", color: "#38bdf8", fontWeight: 700 }}>MUDRA / CGTMSE</span>
                  </div>
                  <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-heading)", marginTop: 4 }}>
                    ₹{estimatedBankLoan.toLocaleString("en-IN")}
                  </div>
                  <p style={{ fontSize: "0.76rem", color: "var(--muted)", margin: "4px 0 0 0" }}>
                    Sanctioned by commercial bank with collateral-free CGTMSE credit guarantee.
                  </p>
                </div>

                <div style={{ background: "var(--panel-subtle)", padding: 12, borderRadius: 12, borderLeft: "3px solid #10b981" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.76rem", color: "var(--muted)", fontWeight: 700 }}>3. Credit-Linked Subsidy</span>
                    <span style={{ fontSize: "0.72rem", color: "var(--ok)", fontWeight: 700 }}>PMFME ODOP 35%</span>
                  </div>
                  <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--ok)", marginTop: 4 }}>
                    ₹{estimatedMaxSubsidy.toLocaleString("en-IN")}
                  </div>
                  <p style={{ fontSize: "0.76rem", color: "var(--muted)", margin: "4px 0 0 0" }}>
                    Paid by MOFPI post-setup to bank reserve account, reducing your active loan principal!
                  </p>
                </div>
              </div>

              {/* Clarification banner on credit-linked subsidy timing */}
              <div style={{ marginTop: 12, padding: "8px 12px", borderRadius: 8, background: "rgba(249, 115, 22, 0.08)", border: "1px solid rgba(249, 115, 22, 0.25)", display: "flex", alignItems: "center", gap: 8, fontSize: "0.78rem" }}>
                <Info size={16} color="var(--citrus-orange)" style={{ flexShrink: 0 }} />
                <span style={{ color: "var(--text)" }}>
                  <strong>How the PMFME subsidy works:</strong> The bank sanctions your project upfront. After plant machinery is installed and inspected, the 35% subsidy is credited directly to reduce your loan EMI.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="wizard-actions-bar">
          <button type="button" className="btn-secondary-gloss" onClick={onBack}>
            <ArrowLeft size={16} /> Back
          </button>
          <button type="submit" className="btn-primary-gloss" style={{ padding: "16px 36px" }}>
            <span>Continue</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </form>
  );
}
