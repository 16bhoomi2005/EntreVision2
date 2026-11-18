import React, { useState, useEffect } from "react";
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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { fetchFinancialPlan, fetchUserProfile, getRecommendations } from "../services/api";
import { useAuth } from "../context/AuthContext";

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
  const { user, activeVenture, setActiveVenture } = useAuth();
  const [roadmapSuccessMsg, setRoadmapSuccessMsg] = useState(null);

  const getStoredAssessment = () => {
    try {
      if (user?.id) {
        const userSaved = localStorage.getItem(`ev_${user.id}_assessment_results`);
        if (userSaved) return JSON.parse(userSaved);
      }
      const genericSaved = localStorage.getItem("ev_assessment_results");
      if (genericSaved) return JSON.parse(genericSaved);
      const guestSaved = localStorage.getItem("ev_guest_assessment_results");
      if (guestSaved) return JSON.parse(guestSaved);

      // Search across localStorage for any existing assessment_results
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes("assessment_results")) {
          const val = localStorage.getItem(key);
          if (val) return JSON.parse(val);
        }
      }
    } catch (e) {}
    return null;
  };

  const [resultsData, setResultsData] = useState(() => {
    if (locationState?.state?.results) return locationState.state.results;
    const stored = getStoredAssessment();
    return stored?.results || null;
  });

  const [userInputData, setUserInputData] = useState(() => {
    if (locationState?.state?.userInput) return locationState.state.userInput;
    const stored = getStoredAssessment();
    return stored?.userInput || null;
  });

  const [fetchingRemote, setFetchingRemote] = useState(false);

  useEffect(() => {
    if (resultsData) return;
    if (!user?.id) return;

    let isMounted = true;
    async function loadRemoteProfile() {
      setFetchingRemote(true);
      try {
        const profile = await fetchUserProfile(user.id);
        const assess = profile?.assessment || profile?.assessment_data;
        if (assess) {
          const res = await getRecommendations(assess);
          if (isMounted) {
            setResultsData(res);
            setUserInputData(assess);
            const storageKey = user?.id ? `ev_${user.id}_assessment_results` : "ev_assessment_results";
            localStorage.setItem(
              storageKey,
              JSON.stringify({ results: res, userInput: assess })
            );
          }
        }
      } catch (err) {
        console.error("Failed to fetch remote profile recommendations:", err);
      } finally {
        if (isMounted) setFetchingRemote(false);
      }
    }
    loadRemoteProfile();
    return () => {
      isMounted = false;
    };
  }, [user, resultsData]);

  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [financialPlan, setFinancialPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [planGenerated, setPlanGenerated] = useState(false);
  const [showFunnelDetails, setShowFunnelDetails] = useState(true);
  const [showCloseMatches, setShowCloseMatches] = useState(false);
  const [expandedReadiness, setExpandedReadiness] = useState({});

  const toggleReadiness = (oppId) => {
    setExpandedReadiness((prev) => ({ ...prev, [oppId]: !prev[oppId] }));
  };

  if (fetchingRemote) {
    return (
      <div className="card wizard-form-card" style={{ textAlign: "center", padding: "64px 24px", maxWidth: 600, margin: "40px auto" }}>
        <div style={{ width: 44, height: 44, margin: "0 auto 16px", border: "3px solid var(--line)", borderTopColor: "var(--citrus-orange)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text-heading)", marginBottom: 8 }}>
          Loading Your Verified Decision Profile
        </h2>
        <p className="muted" style={{ fontSize: "0.88rem" }}>
          Synthesizing your Vidarbha agricultural resources, APMC mandi rates, and DSS suitability models...
        </p>
      </div>
    );
  }

  if (!resultsData || !resultsData.recommendations) {
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

  const { user_summary, recommendations = [], hierarchical_funnel } = resultsData;

  const strictNames = hierarchical_funnel?.strict_matching_opportunities || [];
  const hasStrictMatches = Boolean(
    hierarchical_funnel &&
    hierarchical_funnel.has_strict_match &&
    strictNames.length > 0
  );

  const strictRecs = recommendations.filter((r) => strictNames.includes(r.name));
  const closeRecs = recommendations.filter((r) => !strictNames.includes(r.name));

  // If strict matches exist, main list shows strict matches ONLY by default!
  // When user toggles showCloseMatches, all evaluated recommendations are displayed.
  const baseRecs = hasStrictMatches ? (showCloseMatches ? recommendations : strictRecs) : recommendations;

  const filteredRecs = baseRecs.filter((rec) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "ready") return (rec.suitability_score || 0) >= 80;
    if (activeFilter === "processing") return rec.category?.toLowerCase().includes("processing") || rec.category?.toLowerCase().includes("food");
    if (activeFilter === "trading") return rec.category?.toLowerCase().includes("trading") || rec.category?.toLowerCase().includes("logistics");
    if (activeFilter === "services") return rec.category?.toLowerCase().includes("service") || rec.category?.toLowerCase().includes("nursery");
    return true;
  });

  const filteredCloseRecs = closeRecs.filter((rec) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "ready") return (rec.suitability_score || 0) >= 80;
    if (activeFilter === "processing") return rec.category?.toLowerCase().includes("processing") || rec.category?.toLowerCase().includes("food");
    if (activeFilter === "trading") return rec.category?.toLowerCase().includes("trading") || rec.category?.toLowerCase().includes("logistics");
    if (activeFilter === "services") return rec.category?.toLowerCase().includes("service") || rec.category?.toLowerCase().includes("nursery");
    return true;
  });

  const topRec = filteredRecs[0] || recommendations[0] || {};
  const topScore = topRec.suitability_score || user_summary?.top_match_score || 85;
  const radar = topRec.radar_scores || {
    investment: 85,
    roi: 80,
    subsidy: 95,
    resource: 80,
    skills: 75,
  };

  const cx = 110, cy = 95, rMax = 58;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const rInv = ((radar.investment || 80) / 100) * rMax;
  const rRoi = ((radar.roi || 75) / 100) * rMax;
  const rSub = ((radar.subsidy || 90) / 100) * rMax;
  const rRes = ((radar.resource || 70) / 100) * rMax;
  const rSkl = ((radar.skills || 65) / 100) * rMax;

  const p1 = `${cx + rInv * Math.cos(toRad(-90))},${cy + rInv * Math.sin(toRad(-90))}`;
  const p2 = `${cx + rRoi * Math.cos(toRad(-18))},${cy + rRoi * Math.sin(toRad(-18))}`;
  const p3 = `${cx + rSub * Math.cos(toRad(54))},${cy + rSub * Math.sin(toRad(54))}`;
  const p4 = `${cx + rRes * Math.cos(toRad(126))},${cy + rRes * Math.sin(toRad(126))}`;
  const p5 = `${cx + rSkl * Math.cos(toRad(198))},${cy + rSkl * Math.sin(toRad(198))}`;
  const dynamicRadarPoints = `${p1} ${p2} ${p3} ${p4} ${p5}`;

  const handleOpenDetails = (rec) => {
    setSelectedOpp(rec);
    setFinancialPlan(null);
    setPlanGenerated(false);
  };

  const handleAddToRoadmap = (rec) => {
    const fin = rec.financial_breakdown || {};
    const newVenture = {
      id: `OPP${String(rec.opportunity_id || 1).padStart(2, "0")}`,
      opportunity_id: rec.opportunity_id,
      name: rec.name,
      category: rec.category,
      location: `${user_summary?.location || user?.tehsil || "Katol"}, Nagpur District`,
      suitability_score: rec.suitability_score,
      feasibility_score: rec.suitability_score,
      capital_fit: rec.mcda_breakdown?.capital_fit || 85,
      infrastructure_fit: rec.mcda_breakdown?.infrastructure_fit || 80,
      market_fit: rec.mcda_breakdown?.market_fit || 80,
      skill_fit: rec.mcda_breakdown?.skill_fit || 80,
      score_type: "MCDA",
      mcda_breakdown: rec.mcda_breakdown || {},
      eligibility_status: rec.eligibility_status || (rec.is_eligible === false ? "Not Eligible" : "Eligible"),
      total_cost: fin.total_project_cost || 500000,
      own_equity: fin.farmer_equity_required || 150000,
      subsidy_amount: fin.subsidy_amount || 175000,
      subsidy_scheme: fin.eligible_scheme || "PMFME 35% Credit-Linked Capital Subsidy",
      bank_loan: fin.bank_loan_required || 175000,
      journey_phase: 1,
      current_task: "Review Bankable DPR & Prescribed Training",
      next_deadline: "Next 7 Days",
    };
    setActiveVenture(newVenture);
    setRoadmapSuccessMsg(`✓ Added "${rec.name}" to your Roadmap! Home Dashboard is now set to this venture.`);
    setTimeout(() => setRoadmapSuccessMsg(null), 5000);
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
            <span
              style={{
                fontSize: "0.75rem",
                padding: "3px 10px",
                background: hasStrictMatches ? "rgba(16, 185, 129, 0.15)" : "rgba(249, 115, 22, 0.15)",
                color: hasStrictMatches ? "var(--ok)" : "var(--citrus-orange)",
                border: `1px solid ${hasStrictMatches ? "rgba(16, 185, 129, 0.3)" : "rgba(249, 115, 22, 0.3)"}`,
                borderRadius: 6,
                fontWeight: 700,
              }}
            >
              {hasStrictMatches ? `✓ ${strictRecs.length} STRICT MATCH SURVIVED` : "⚠️ 0 STRICT MATCHES FOUND"}
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
              {hasStrictMatches
                ? `${strictRecs.length} Opportunity Passed All 11 Elimination Levels`
                : "Strict Filters Eliminated All Options"}
            </span>
          </div>

          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-heading)", margin: "8px 0 4px", letterSpacing: "-0.02em" }}>
            {hasStrictMatches ? "YOUR STRICT MATCHING BUSINESS OPPORTUNITY" : "HIERARCHICAL FILTER RESULTS"}
          </h1>
          <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
            {hasStrictMatches
              ? `Tailored strictly to your profile in ${user_summary?.location || "Narkhed"} with ₹${user_summary?.budget || "5,00,000"} equity and verified local cluster resources.`
              : `Evaluated against 26 citrus agribusiness models in ${user_summary?.location || "Narkhed"} across 11 sequential filter levels.`}
          </p>
          {user_summary?.assigned_persona && (
            <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", flexWrap: "wrap", gap: 8, background: "rgba(249, 115, 22, 0.12)", border: "1px solid rgba(249, 115, 22, 0.3)", padding: "4px 12px", borderRadius: 20 }}>
              <span style={{ fontSize: "0.82rem", color: "var(--citrus-orange)", fontWeight: 700 }}>
                🎯 Empirical Persona: {user_summary.assigned_persona}
              </span>
              {user_summary.primary_policy_leverage && (
                <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                  · {user_summary.primary_policy_leverage}
                </span>
              )}
            </div>
          )}
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
          11-STAGE SEQUENTIAL HIERARCHICAL DECISION FUNNEL
         ==================================================================== */}
      {hierarchical_funnel && (
        <div
          className="card wizard-form-card"
          style={{
            marginBottom: 24,
            padding: "20px 24px",
            background: hierarchical_funnel.has_strict_match
              ? "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, var(--panel) 100%)"
              : "linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, var(--panel) 100%)",
            border: hierarchical_funnel.has_strict_match
              ? "1px solid rgba(16, 185, 129, 0.35)"
              : "1px solid rgba(249, 115, 22, 0.35)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: hierarchical_funnel.has_strict_match ? "rgba(16, 185, 129, 0.2)" : "rgba(249, 115, 22, 0.2)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Layers size={20} color={hierarchical_funnel.has_strict_match ? "var(--ok)" : "var(--citrus-orange)"} />
              </div>
              <div>
                <strong style={{ fontSize: "1.05rem", color: "var(--text-heading)", textTransform: "uppercase" }}>
                  11-Stage Sequential Hierarchical Decision Funnel
                </strong>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                  Strict multi-level elimination across Age, Education, Goals, Skills, Land, Workspace, Vehicles, Existing Setup, Cluster, Budget & Interests
                </span>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {hierarchical_funnel.has_strict_match ? (
                <span className="skill-status-tag verified" style={{ fontSize: "0.78rem" }}>
                  ✓ {hierarchical_funnel.strict_matches_count} Strict Matches Survived
                </span>
              ) : (
                <span style={{ fontSize: "0.78rem", background: "rgba(239, 68, 68, 0.15)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.3)", padding: "3px 10px", borderRadius: 6, fontWeight: 700 }}>
                  ⚠️ Bottleneck at Level {hierarchical_funnel.bottleneck_level} (0 Direct Matches)
                </span>
              )}
              <button
                type="button"
                onClick={() => setShowFunnelDetails(!showFunnelDetails)}
                className="btn-secondary-gloss"
                style={{ padding: "4px 10px", fontSize: "0.75rem" }}
              >
                {showFunnelDetails ? "Hide Funnel Details" : "Inspect 11 Levels"}
              </button>
            </div>
          </div>

          {/* STATUS NOTIFICATION BANNER */}
          {!hasStrictMatches ? (
            <div
              style={{
                background: "rgba(249, 115, 22, 0.08)",
                border: "1px dashed rgba(249, 115, 22, 0.3)",
                borderRadius: 10,
                padding: "14px 18px",
                marginBottom: 16,
                fontSize: "0.85rem",
              }}
            >
              <div style={{ color: "var(--citrus-orange)", fontWeight: 800, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
                <AlertTriangle size={16} /> No businesses strictly matched all 11 criteria simultaneously.
              </div>
              <div style={{ color: "var(--text-body)", lineHeight: 1.5 }}>
                The strict sequential funnel reached 0 opportunities at <strong>Level {hierarchical_funnel.bottleneck_level}: {hierarchical_funnel.bottleneck_name}</strong> ({hierarchical_funnel.bottleneck_message}).
              </div>
            </div>
          ) : (
            <div
              style={{
                background: "rgba(16, 185, 129, 0.08)",
                border: "1px dashed rgba(16, 185, 129, 0.3)",
                borderRadius: 10,
                padding: "12px 16px",
                marginBottom: 16,
                fontSize: "0.85rem",
              }}
            >
              <div style={{ color: "var(--ok)", fontWeight: 800, marginBottom: 2 }}>
                ✓ {strictRecs.length} Business Model{strictRecs.length > 1 ? "s" : ""} Passed All 11 Strict Levels with Zero Gaps!
              </div>
              <div style={{ color: "var(--muted)", fontSize: "0.78rem" }}>
                Strict Surviving Opportunities: {strictNames.join(" • ")}
              </div>
            </div>
          )}

          {/* STEP-BY-STEP FUNNEL AUDIT CARDS */}
          {showFunnelDetails && hierarchical_funnel.steps && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
              {hierarchical_funnel.steps.map((st) => (
                <div
                  key={st.level}
                  style={{
                    background: st.status === "BOTTLENECK" ? "rgba(239, 68, 68, 0.08)" : "var(--panel-subtle)",
                    border: `1px solid ${st.status === "BOTTLENECK" ? "rgba(239, 68, 68, 0.3)" : "var(--line)"}`,
                    borderRadius: 8,
                    padding: "10px 12px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase" }}>
                      L{st.level}: {st.name}
                    </span>
                    <span
                      style={{
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: 4,
                        background: st.status === "PASSED" ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                        color: st.status === "PASSED" ? "var(--ok)" : "#f87171",
                      }}
                    >
                      {st.passed_count} Left
                    </span>
                  </div>
                  <div style={{ fontSize: "0.74rem", color: "var(--text-body)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={st.criterion}>
                    {st.criterion}
                  </div>
                  {st.dropped_count > 0 && (
                    <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginTop: 2 }}>
                      Filtered out: {st.dropped_count} options
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          NO STRICT MATCHES FOUND HERO STATE (SHOWN FIRST WHEN 0 STRICT MATCHES)
         ==================================================================== */}
      {hierarchical_funnel && !hasStrictMatches && !showCloseMatches && (
        <div
          className="card wizard-form-card"
          style={{
            textAlign: "center",
            padding: "54px 24px",
            marginBottom: 24,
            background: "linear-gradient(180deg, rgba(239, 68, 68, 0.05) 0%, rgba(15, 23, 42, 0.9) 100%)",
            border: "1px solid rgba(249, 115, 22, 0.4)",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.35)",
            borderRadius: 16,
          }}
        >
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: "50%",
              background: "rgba(249, 115, 22, 0.15)",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 18px",
              border: "1px solid rgba(249, 115, 22, 0.35)",
            }}
          >
            <AlertTriangle size={34} color="var(--citrus-orange)" />
          </div>

          <h2 style={{ fontSize: "1.55rem", fontWeight: 800, color: "var(--text-heading)", marginBottom: 8, letterSpacing: "-0.01em" }}>
            No Businesses Matched 100% of Your Strict Hierarchical Filters
          </h2>

          <p className="muted" style={{ fontSize: "0.94rem", maxWidth: 640, margin: "0 auto 16px", lineHeight: 1.6 }}>
            Your 11-level sequential filter eliminated candidate ventures at{" "}
            <strong style={{ color: "var(--text-heading)" }}>
              Level {hierarchical_funnel.bottleneck_level}: {hierarchical_funnel.bottleneck_name}
            </strong>
            .<br />
            <span style={{ color: "#f87171", fontWeight: 600 }}>
              Bottleneck Cause: {hierarchical_funnel.bottleneck_message}
            </span>
          </p>

          <p style={{ fontSize: "0.88rem", color: "var(--text-body)", maxWidth: 580, margin: "0 auto 28px", lineHeight: 1.5 }}>
            EntreVision's <strong>Decision Support System (DSS)</strong> has analyzed close-fit opportunities (80%–95% readiness) and generated actionable gap-bridging pathways (PMFME subsidy grants, ICAR-CCRI certified skill training, and land lease facilitation).
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setShowCloseMatches(true)}
              className="btn-primary-gloss"
              style={{
                padding: "14px 28px",
                fontSize: "0.95rem",
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                background: "linear-gradient(135deg, var(--citrus-orange) 0%, #ea580c 100%)",
                boxShadow: "0 0 24px rgba(249, 115, 22, 0.35)",
              }}
            >
              <Sparkles size={18} /> Show Close Recommendations (Decision Support System)
            </button>
            <button
              type="button"
              onClick={() => navigate("/start")}
              className="btn-secondary-gloss"
              style={{ padding: "14px 24px", fontSize: "0.9rem" }}
            >
              <ArrowLeft size={16} /> Relax / Adjust Filters
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          DECISION SUPPORT SYSTEM (DSS) RECOMMENDATIONS & GAP ROADMAP
         ==================================================================== */}
      {(hasStrictMatches || showCloseMatches) && (
        <>
          {hierarchical_funnel && !hasStrictMatches && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(99, 102, 241, 0.12)",
                border: "1px solid rgba(99, 102, 241, 0.35)",
                padding: "12px 18px",
                borderRadius: 10,
                marginBottom: 20,
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Sparkles size={18} color="var(--cyan)" />
                <span style={{ fontSize: "0.85rem", color: "var(--text-heading)", fontWeight: 600 }}>
                  Showing {filteredRecs.length} Close Matches Ranked by Decision Support System (DSS) with Root-Cause Gap Analysis
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowCloseMatches(false)}
                className="btn-secondary-gloss"
                style={{ padding: "4px 12px", fontSize: "0.75rem" }}
              >
                Hide Close Recommendations
              </button>
            </div>
          )}

          {/* VISUAL DECISION SUPPORT DASHBOARD (GAUGE + RADAR + RANKED BARS) */}
          <div
            className="card wizard-form-card"
            style={{
              marginBottom: 24,
              padding: "24px",
              background: "var(--panel)",
              border: "1px solid var(--line)",
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
                <circle cx="70" cy="70" r="54" fill="none" stroke="var(--line)" strokeWidth="12" />
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
                  strokeDashoffset={339.29 * (1 - topScore / 100)}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1.2s ease" }}
                />
              </svg>
              <div style={{ position: "absolute", textAlign: "center" }}>
                <span style={{ fontSize: "1.75rem", fontWeight: 900, color: "var(--text-heading)", lineHeight: 1 }}>
                  {topScore}%
                </span>
                <span style={{ fontSize: "0.68rem", color: "var(--citrus-orange)", fontWeight: 800, display: "block", textTransform: "uppercase", marginTop: 2 }}>
                  DSS READINESS
                </span>
              </div>
            </div>
            <span className="skill-status-tag verified" style={{ marginTop: 8, fontSize: "0.72rem" }}>
              {topScore >= 85 ? "🌟 High Commercial Viability" : "🌱 Feasible with Training"}
            </span>
          </div>

          {/* 2. 5-Axis Spider / Radar Chart */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <svg width="220" height="180" viewBox="0 0 220 180">
              {/* Radar Grid Webs */}
              <polygon points="110,35 168,54 146,118 74,118 52,54" fill="none" stroke="var(--line)" strokeWidth="1" />
              <polygon points="110,55 148,68 134,110 86,110 72,68" fill="none" stroke="var(--line)" strokeWidth="1" />
              
              {/* Radar Data Polygon */}
              <polygon
                points={dynamicRadarPoints}
                fill="rgba(249, 115, 22, 0.25)"
                stroke="var(--citrus-orange)"
                strokeWidth="2"
              />
              
              {/* Axis Dots */}
              <circle cx={p1.split(',')[0]} cy={p1.split(',')[1]} r="4" fill="var(--citrus-orange)" />
              <circle cx={p2.split(',')[0]} cy={p2.split(',')[1]} r="4" fill="var(--ok)" />
              <circle cx={p3.split(',')[0]} cy={p3.split(',')[1]} r="4" fill="#6366f1" />
              <circle cx={p4.split(',')[0]} cy={p4.split(',')[1]} r="4" fill="var(--cyan)" />
              <circle cx={p5.split(',')[0]} cy={p5.split(',')[1]} r="4" fill="var(--citrus-amber)" />

              {/* Labels */}
              <text x="110" y="20" textAnchor="middle" fill="var(--muted)" fontSize="9" fontWeight="700">Capital ({radar.investment || 85}%)</text>
              <text x="185" y="65" textAnchor="start" fill="var(--muted)" fontSize="9" fontWeight="700">ROI ({radar.roi || 80}%)</text>
              <text x="165" y="152" textAnchor="start" fill="var(--muted)" fontSize="9" fontWeight="700">Subsidy ({radar.subsidy || 95}%)</text>
              <text x="55" y="152" textAnchor="end" fill="var(--muted)" fontSize="9" fontWeight="700">Resource ({radar.resource || 80}%)</text>
              <text x="35" y="65" textAnchor="end" fill="var(--muted)" fontSize="9" fontWeight="700">Skills ({radar.skills || 75}%)</text>
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
                  <div style={{ height: 6, background: "var(--line)", borderRadius: 4, overflow: "hidden" }}>
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

      {/* ====================================================================
          REGIONAL MARKET INTELLIGENCE & CLUSTER ANALYTICS (REAL DATASETS)
         ==================================================================== */}
      {user_summary?.market_intelligence && (
        <div
          className="card wizard-form-card"
          style={{
            marginBottom: 24,
            padding: "20px 24px",
            background: "var(--panel)",
            border: "1px solid var(--line)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(56, 189, 248, 0.15)", display: "grid", placeItems: "center" }}>
                <MapPin size={18} color="var(--cyan)" />
              </div>
              <div>
                <strong style={{ fontSize: "1rem", color: "var(--text-heading)" }}>
                  REGIONAL MARKET INTELLIGENCE: {user_summary?.location?.toUpperCase()} CLUSTER
                </strong>
                <span style={{ fontSize: "0.75rem", color: "var(--muted)", display: "block" }}>
                  Live data synthesized from NHB Tehsil statistics, APMC Mandi daily arrivals, and CCRI registry
                </span>
              </div>
            </div>
            <span className="skill-status-tag verified" style={{ fontSize: "0.72rem" }}>
              ✓ LIVE DATA LOADED
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14 }}>
            {/* 1. Production Acreage */}
            <div style={{ background: "var(--panel-subtle)", padding: 12, borderRadius: 10, border: "1px solid var(--line)" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, display: "block" }}>
                Citrus Raw Material Base
              </span>
              <strong style={{ fontSize: "1.15rem", color: "var(--citrus-orange)", display: "block", marginTop: 4 }}>
                {user_summary?.market_intelligence?.citrus_production?.estimated_production_mt?.toLocaleString() || "1,80,000"} MT / Year
              </strong>
              <span style={{ fontSize: "0.72rem", color: "var(--text-body)" }}>
                {user_summary?.market_intelligence?.citrus_production?.estimated_area_hectares?.toLocaleString() || "24,000"} Ha • {user_summary?.market_intelligence?.citrus_production?.raw_material_density_verdict}
              </span>
            </div>

            {/* 2. Live Mandi Wholesale Rate */}
            <div style={{ background: "var(--panel-subtle)", padding: 12, borderRadius: 10, border: "1px solid var(--line)" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, display: "block" }}>
                Mandi Benchmark Price
              </span>
              <strong style={{ fontSize: "1.15rem", color: "var(--ok)", display: "block", marginTop: 4 }}>
                ₹{user_summary?.market_intelligence?.mandi_market_dynamics?.price_per_kg || 36.8} / kg
              </strong>
              <span style={{ fontSize: "0.72rem", color: "var(--text-body)" }}>
                30-Day Range: {user_summary?.market_intelligence?.mandi_market_dynamics?.price_range_30d || "₹33 - ₹41/kg"}
              </span>
            </div>

            {/* 3. Nearby Cold Chain & Processing Infra */}
            <div style={{ background: "var(--panel-subtle)", padding: 12, borderRadius: 10, border: "1px solid var(--line)" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, display: "block" }}>
                Cluster Infrastructure
              </span>
              <strong style={{ fontSize: "0.85rem", color: "var(--text-heading)", display: "block", marginTop: 4 }}>
                {user_summary?.market_intelligence?.nearby_infrastructure?.[0]?.name || "Local Cold Storage Hub"}
              </strong>
              <span style={{ fontSize: "0.72rem", color: "var(--cyan)" }}>
                Capacity: {user_summary?.market_intelligence?.nearby_infrastructure?.[0]?.capacity || "5,000 MT"}
              </span>
            </div>

            {/* 4. Skill Gap Bridge Institution */}
            <div style={{ background: "var(--panel-subtle)", padding: 12, borderRadius: 10, border: "1px solid var(--line)" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, display: "block" }}>
                Accredited Skill Bridge
              </span>
              <strong style={{ fontSize: "0.85rem", color: "var(--text-heading)", display: "block", marginTop: 4 }}>
                {user_summary?.market_intelligence?.training_institutions?.[0]?.name || "ICAR-CCRI Nagpur"}
              </strong>
              <span style={{ fontSize: "0.72rem", color: "var(--citrus-amber)" }}>
                Govt EDP / Skill Workshops Available
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Strict vs All Recommendations Toggle Pill Bar (when strict matches exist) */}
      {hasStrictMatches && closeRecs.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 16,
            padding: "10px 16px",
            background: "var(--panel-subtle)",
            border: "1px solid var(--line)",
            borderRadius: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-heading)" }}>
              Filter Scope:
            </span>
            <div style={{ display: "inline-flex", background: "rgba(0, 0, 0, 0.3)", borderRadius: 999, padding: 3, border: "1px solid var(--line)" }}>
              <button
                type="button"
                onClick={() => setShowCloseMatches(false)}
                style={{
                  padding: "6px 14px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  background: !showCloseMatches ? "rgba(16, 185, 129, 0.25)" : "transparent",
                  color: !showCloseMatches ? "var(--ok)" : "var(--muted)",
                  transition: "all 0.2s ease",
                }}
              >
                ✓ Strict Matches Only ({strictRecs.length})
              </button>
              <button
                type="button"
                onClick={() => setShowCloseMatches(true)}
                style={{
                  padding: "6px 14px",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  background: showCloseMatches ? "rgba(99, 102, 241, 0.25)" : "transparent",
                  color: showCloseMatches ? "var(--cyan)" : "var(--muted)",
                  transition: "all 0.2s ease",
                }}
              >
                💡 All Evaluated Models ({recommendations.length})
              </button>
            </div>
          </div>

          <span style={{ fontSize: "0.76rem", color: "var(--muted)" }}>
            {!showCloseMatches
              ? `Showing only ${strictRecs.length} opportunity that strictly passed all 11 filter levels`
              : `Showing all ${recommendations.length} models with DSS readiness scores & bridgeable gaps`}
          </span>
        </div>
      )}

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

          const isEligible = rec.is_eligible !== false && rec.eligibility_status !== "Not Eligible";
          const isHighMatch = (rec.suitability_score || 0) >= 80;
          const isStrictMatch = hierarchical_funnel?.strict_matching_opportunities?.includes(rec.name);

          return (
            <div
              key={rec.opportunity_id || index}
              className="card wizard-form-card"
              style={{
                padding: "24px 28px",
                borderLeft: `4px solid ${!isEligible ? "var(--citrus-amber)" : isStrictMatch ? "var(--ok)" : isHighMatch ? "var(--cyan)" : "var(--citrus-orange)"}`,
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

                    {/* Eligibility Badge */}
                    {isEligible ? (
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: "rgba(16, 185, 129, 0.18)",
                          color: "#34d399",
                          border: "1px solid rgba(16, 185, 129, 0.45)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        ✓ VERIFIED ELIGIBLE
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: "rgba(239, 68, 68, 0.16)",
                          color: "#f87171",
                          border: "1px solid rgba(239, 68, 68, 0.45)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        🚫 INELIGIBLE (Prerequisites Missing)
                      </span>
                    )}

                    {isStrictMatch ? (
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          padding: "3px 10px",
                          borderRadius: 6,
                          background: "rgba(16, 185, 129, 0.2)",
                          color: "var(--ok)",
                          border: "1px solid rgba(16, 185, 129, 0.4)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        ✓ STRICT MATCH (Passed All Filter Levels)
                      </span>
                    ) : (
                      <span
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          padding: "3px 8px",
                          borderRadius: 6,
                          background: "rgba(249, 115, 22, 0.14)",
                          color: "var(--citrus-orange)",
                          border: "1px solid rgba(249, 115, 22, 0.3)",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        💡 MCDA MATCH ({rec.suitability_score || 85}% Fit)
                      </span>
                    )}

                    {isHighMatch && !isStrictMatch && isEligible && (
                      <span className="skill-status-tag verified" style={{ fontSize: "0.72rem" }}>
                        ⭐ High Strategic Fit
                      </span>
                    )}

                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 6,
                        background: "rgba(6, 182, 212, 0.12)",
                        color: "var(--cyan)",
                        border: "1px solid rgba(6, 182, 212, 0.25)",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4
                      }}
                    >
                      ⚖️ MCDA Feasibility: {rec.feasibility_score || rec.suitability_score || 85}%
                    </span>

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

                  {/* Mandatory Eligibility Disqualifiers Banner */}
                  {!isEligible && rec.gap_analysis?.mandatory_reasons?.length > 0 && (
                    <div
                      style={{
                        marginTop: 10,
                        padding: "8px 12px",
                        background: "rgba(239, 68, 68, 0.12)",
                        border: "1px solid rgba(239, 68, 68, 0.35)",
                        borderRadius: 8,
                        color: "#fca5a5",
                        fontSize: "0.78rem",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span style={{ fontWeight: 800, color: "#f87171" }}>⚠️ MANDATORY REQUIREMENTS MISSING:</span>
                      <span>{rec.gap_analysis.mandatory_reasons.join(" • ")}</span>
                    </div>
                  )}

                  {/* MCDA 6-Factor Breakdown Summary */}
                  {rec.mcda_breakdown && Object.keys(rec.mcda_breakdown).length > 0 && (
                    <div
                      style={{
                        marginTop: 10,
                        padding: "8px 12px",
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid var(--line)",
                        borderRadius: 8,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 8,
                      }}
                    >
                      <div style={{ fontSize: "0.7rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase" }}>
                        ⚖️ 6-Factor MCDA Weights:
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: "0.73rem", color: "var(--text-body)" }}>
                        <span>Capital (25%): <strong>{rec.mcda_breakdown.capital_fit || 0}%</strong></span>
                        <span>Infra (20%): <strong>{rec.mcda_breakdown.infrastructure_fit || 0}%</strong></span>
                        <span>Market (20%): <strong>{rec.mcda_breakdown.market_fit || 0}%</strong></span>
                        <span>Skill (15%): <strong>{rec.mcda_breakdown.skill_fit || 0}%</strong></span>
                        <span>Resource (10%): <strong>{rec.mcda_breakdown.resource_fit || 0}%</strong></span>
                        <span>Location (10%): <strong>{rec.mcda_breakdown.location_fit || 0}%</strong></span>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span style={{ fontSize: "1.6rem", fontWeight: 800, color: !isEligible ? "var(--citrus-amber)" : isHighMatch ? "var(--cyan)" : "var(--electric-blue)" }}>
                      {rec.suitability_score || 85}%
                    </span>
                    <span style={{ fontSize: "0.72rem", color: !isEligible ? "#f87171" : "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                      {!isEligible ? "Score (Capped)" : "MCDA Index"}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: isEligible ? "var(--ok)" : "var(--citrus-amber)", fontWeight: 600 }}>
                    {isEligible ? "🏛️ PMFME 35% Eligible" : "⚠️ Ineligible Without Upgrades"}
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
                      {rec.skill_match_pct || Math.round((rec.skill_match || 0.8) * 100)}% Skill Match
                    </span>
                  </div>

                  {/* Skill-Match Visual Progress Bar (Have vs Needed) */}
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", height: 8, borderRadius: 6, overflow: "hidden", background: "rgba(255, 255, 255, 0.08)", marginBottom: 4 }}>
                      <div style={{ width: `${rec.skill_match_pct || Math.round((rec.skill_match || 0.8) * 100)}%`, background: "var(--ok)", borderRadius: "6px 0 0 6px" }} title="Acquired Skills" />
                      <div style={{ width: `${100 - (rec.skill_match_pct || Math.round((rec.skill_match || 0.8) * 100))}%`, background: "var(--citrus-amber)", borderRadius: "0 6px 6px 0" }} title="Bridgeable Gap" />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--muted)" }}>
                      <span style={{ color: "var(--ok)", fontWeight: 600 }}>✓ Verified: {(rec.matched_skills && rec.matched_skills.length > 0) ? rec.matched_skills.slice(0, 2).join(", ") : "Skills & Land"}</span>
                      <span style={{ color: "var(--citrus-amber)", fontWeight: 600 }}>⚡ Gap: {(rec.missing_skills && rec.missing_skills.length > 0) ? rec.missing_skills.slice(0, 2).join(", ") : "Advanced Training"}</span>
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

                {/* 2. Business Feasibility Gap Analysis & Readiness Report (Phase 9) */}
                {(() => {
                  const rep = rec.readiness_report || rec.gap_analysis || {};
                  const oppKey = rec.opportunity_id ?? rec.id ?? index;
                  const isExpanded = expandedReadiness[oppKey] ?? (index === 0);
                  const whatHas = rep.what_user_has || [];
                  const whatLacks = rep.what_user_lacks || [];
                  const whatArranged = rep.what_can_be_arranged || [];
                  const addlInv = rep.estimated_additional_investment || null;
                  const nextSteps = rep.recommended_next_steps || [];
                  const hasGaps = rep.has_gaps ?? (whatLacks.length > 0);

                  return (
                    <div
                      style={{
                        background: hasGaps ? "rgba(249, 115, 22, 0.04)" : "rgba(34, 197, 94, 0.04)",
                        border: `1px solid ${hasGaps ? "rgba(249, 115, 22, 0.22)" : "rgba(34, 197, 94, 0.22)"}`,
                        borderRadius: 14,
                        padding: "16px",
                      }}
                    >
                      {/* Card Header & Toggle */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{
                            width: 28,
                            height: 28,
                            borderRadius: 6,
                            background: hasGaps ? "rgba(249, 115, 22, 0.15)" : "rgba(34, 197, 94, 0.15)",
                            display: "grid",
                            placeItems: "center",
                            color: hasGaps ? "var(--citrus-orange)" : "var(--ok)"
                          }}>
                            <Sparkles size={16} />
                          </div>
                          <div>
                            <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--text-heading)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                              Business Feasibility Gap Analysis & Readiness Report
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                              Connecting Recommendation Engine, Financial Engine & User Operational Readiness
                            </div>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {hasGaps ? (
                            <span style={{ fontSize: "0.72rem", background: "rgba(249, 115, 22, 0.18)", color: "var(--citrus-orange)", padding: "3px 10px", borderRadius: 6, fontWeight: 700 }}>
                              ⚡ {whatLacks.length} Gaps to Address
                            </span>
                          ) : (
                            <span style={{ fontSize: "0.72rem", background: "rgba(34, 197, 94, 0.18)", color: "var(--ok)", padding: "3px 10px", borderRadius: 6, fontWeight: 700 }}>
                              ✓ High Readiness Match
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => toggleReadiness(oppKey)}
                            style={{
                              background: "rgba(255,255,255,0.06)",
                              border: "1px solid var(--line)",
                              borderRadius: 6,
                              padding: "4px 10px",
                              color: "var(--text-heading)",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            {isExpanded ? <>Collapse <ChevronUp size={14} /></> : <>View 5-Section Report <ChevronDown size={14} /></>}
                          </button>
                        </div>
                      </div>

                      {/* Brief summary row if collapsed */}
                      {!isExpanded && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, fontSize: "0.78rem" }}>
                          <div style={{ background: "rgba(34, 197, 94, 0.08)", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(34, 197, 94, 0.2)" }}>
                            <div style={{ color: "var(--ok)", fontWeight: 700 }}>✓ What You Have</div>
                            <div style={{ color: "var(--text-body)", fontSize: "0.72rem", marginTop: 2 }}>{whatHas.length} verified operational inputs ready</div>
                          </div>
                          <div style={{ background: "rgba(249, 115, 22, 0.08)", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(249, 115, 22, 0.2)" }}>
                            <div style={{ color: "var(--citrus-orange)", fontWeight: 700 }}>⚠️ What You Lack</div>
                            <div style={{ color: "var(--text-body)", fontSize: "0.72rem", marginTop: 2 }}>{whatLacks.length} requirements need arrangement</div>
                          </div>
                          <div style={{ background: "rgba(99, 102, 241, 0.08)", padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(99, 102, 241, 0.2)" }}>
                            <div style={{ color: "var(--electric-blue)", fontWeight: 700 }}>💰 Additional Out-of-Pocket</div>
                            <div style={{ color: "var(--text-body)", fontSize: "0.72rem", marginTop: 2 }}>
                              {addlInv ? `₹${(addlInv.total_additional_funds_needed / 100000).toFixed(2)}L` : "Calculated in report"}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Full 5-Section Readiness Report */}
                      {isExpanded && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 10 }}>
                          
                          {/* 1. What the User Already Has */}
                          <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(34, 197, 94, 0.25)", borderRadius: 10, padding: "12px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                              <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--ok)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                                <CheckCircle size={14} /> 1. What You Already Have ({whatHas.length} Verified Assets)
                              </div>
                              <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>Confirmed from your wizard profile</span>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
                              {whatHas.map((item, hIdx) => (
                                <div key={hIdx} style={{ background: "rgba(34, 197, 94, 0.06)", border: "1px solid rgba(34, 197, 94, 0.18)", borderRadius: 8, padding: "8px 10px" }}>
                                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
                                    <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--ok)", textTransform: "uppercase", background: "rgba(34, 197, 94, 0.15)", padding: "1px 6px", borderRadius: 4 }}>
                                      {item.category}
                                    </span>
                                    <span style={{ fontSize: "0.7rem", color: "var(--ok)", fontWeight: 700 }}>✓ Verified</span>
                                  </div>
                                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-heading)", marginTop: 2 }}>{item.title}</div>
                                  <div style={{ fontSize: "0.72rem", color: "var(--text-body)", marginTop: 2 }}>{item.detail}</div>
                                </div>
                              ))}
                              {whatHas.length === 0 && (
                                <div style={{ fontSize: "0.75rem", color: "var(--muted)", fontStyle: "italic" }}>
                                  No primary assets recorded yet. Complete Step 2-4 in the Assessment Wizard to register existing machinery or land.
                                </div>
                              )}
                            </div>
                          </div>

                          {/* 2. What the User Lacks (Requirements vs Profile Comparison) */}
                          <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(249, 115, 22, 0.25)", borderRadius: 10, padding: "12px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                              <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--citrus-orange)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                                <AlertTriangle size={14} /> 2. What You Lack ({whatLacks.length} Gaps to Address)
                              </div>
                              <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>Direct comparison: Business Requirements vs Your Inputs</span>
                            </div>

                            {whatLacks.length > 0 ? (
                              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {whatLacks.map((gap, gIdx) => (
                                  <div key={gIdx} style={{ background: "rgba(249, 115, 22, 0.05)", border: "1px solid rgba(249, 115, 22, 0.18)", borderRadius: 8, padding: "8px 12px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                        <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "var(--citrus-orange)", textTransform: "uppercase", background: "rgba(249, 115, 22, 0.15)", padding: "1px 6px", borderRadius: 4 }}>
                                          {gap.category}
                                        </span>
                                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-heading)" }}>
                                          {gap.title}
                                        </span>
                                      </div>
                                      <span style={{
                                        fontSize: "0.68rem",
                                        fontWeight: 700,
                                        padding: "1px 8px",
                                        borderRadius: 4,
                                        background: gap.criticality === "High" ? "rgba(239, 68, 68, 0.15)" : "rgba(245, 158, 11, 0.15)",
                                        color: gap.criticality === "High" ? "#f87171" : "var(--citrus-amber)"
                                      }}>
                                        {gap.criticality} Priority Gap
                                      </span>
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8, fontSize: "0.74rem", marginTop: 4 }}>
                                      <div>
                                        <span style={{ color: "var(--muted)" }}>Required by Business: </span>
                                        <strong style={{ color: "var(--text-heading)" }}>{gap.required}</strong>
                                      </div>
                                      <div>
                                        <span style={{ color: "var(--muted)" }}>Your Current Profile: </span>
                                        <strong style={{ color: "var(--text-heading)" }}>{gap.available}</strong>
                                      </div>
                                      <div>
                                        <span style={{ color: "var(--muted)" }}>Operational Gap: </span>
                                        <strong style={{ color: "var(--citrus-orange)" }}>{gap.gap}</strong>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div style={{ fontSize: "0.75rem", color: "var(--ok)", background: "rgba(34, 197, 94, 0.08)", padding: "8px 12px", borderRadius: 8 }}>
                                ✓ No critical operational gaps identified. Your existing land, capital, power, and equipment align with this venture.
                              </div>
                            )}
                          </div>

                          {/* 3. What Can Be Arranged (Solutions & Financing Bridges) */}
                          <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(99, 102, 241, 0.25)", borderRadius: 10, padding: "12px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                              <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--electric-blue)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                                <Coins size={14} /> 3. What Can Be Arranged ({whatArranged.length} Solutions & Bridges)
                              </div>
                              <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>Subsidies, bank credit, and vendor terms</span>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 8 }}>
                              {whatArranged.map((sol, sIdx) => (
                                <div key={sIdx} style={{ background: "rgba(99, 102, 241, 0.05)", border: "1px solid rgba(99, 102, 241, 0.18)", borderRadius: 8, padding: "8px 12px" }}>
                                  <div style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text-heading)", marginBottom: 4 }}>
                                    {sol.item}
                                  </div>
                                  <div style={{ fontSize: "0.72rem", color: "var(--text-body)", marginBottom: 4 }}>
                                    {sol.mechanism}
                                  </div>
                                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.68rem", color: "var(--muted)", paddingTop: 4, borderTop: "1px dashed rgba(255,255,255,0.06)" }}>
                                    <span>🏛️ <strong>Source:</strong> {sol.source}</span>
                                    <span>⏳ <strong>Timeline:</strong> {sol.estimated_timeline}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* 4. Estimated Additional Investment */}
                          {addlInv && (
                            <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(6, 182, 212, 0.25)", borderRadius: 10, padding: "12px 14px" }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                                <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                                  <DollarSign size={14} /> 4. Estimated Additional Investment (Out-of-Pocket Breakdown)
                                </div>
                                <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>Total CapEx: ₹{(addlInv.required_total_capex / 100000).toFixed(2)} Lakhs</span>
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 8, marginBottom: 8 }}>
                                <div style={{ background: "rgba(255,255,255,0.03)", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--line)" }}>
                                  <div style={{ fontSize: "0.68rem", color: "var(--muted)" }}>Promoter Equity Gap</div>
                                  <div style={{ fontSize: "0.92rem", fontWeight: 800, color: addlInv.promoter_equity_gap > 0 ? "var(--citrus-amber)" : "var(--ok)", marginTop: 2 }}>
                                    ₹{addlInv.promoter_equity_gap?.toLocaleString("en-IN")}
                                  </div>
                                  <div style={{ fontSize: "0.66rem", color: "var(--muted)", marginTop: 2 }}>
                                    Need ₹{(addlInv.required_promoter_equity / 100000).toFixed(2)}L vs Have ₹{(addlInv.available_capital / 100000).toFixed(2)}L
                                  </div>
                                </div>

                                <div style={{ background: "rgba(255,255,255,0.03)", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--line)" }}>
                                  <div style={{ fontSize: "0.68rem", color: "var(--muted)" }}>Working Capital Margin</div>
                                  <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "var(--text-heading)", marginTop: 2 }}>
                                    ₹{addlInv.working_capital_margin_needed?.toLocaleString("en-IN")}
                                  </div>
                                  <div style={{ fontSize: "0.66rem", color: "var(--muted)", marginTop: 2 }}>
                                    25% promoter share of CC limit
                                  </div>
                                </div>

                                <div style={{ background: "rgba(255,255,255,0.03)", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--line)" }}>
                                  <div style={{ fontSize: "0.68rem", color: "var(--muted)" }}>Statutory & Training</div>
                                  <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "var(--text-heading)", marginTop: 2 }}>
                                    ₹{addlInv.statutory_and_training_fees?.toLocaleString("en-IN")}
                                  </div>
                                  <div style={{ fontSize: "0.66rem", color: "var(--muted)", marginTop: 2 }}>
                                    CCRI training, FSSAI & power deposits
                                  </div>
                                </div>

                                <div style={{ background: "rgba(249, 115, 22, 0.1)", padding: "8px 10px", borderRadius: 8, border: "1px solid rgba(249, 115, 22, 0.3)" }}>
                                  <div style={{ fontSize: "0.68rem", color: "var(--citrus-orange)", fontWeight: 700 }}>Total Additional Needed</div>
                                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--citrus-orange)", marginTop: 2 }}>
                                    ₹{addlInv.total_additional_funds_needed?.toLocaleString("en-IN")}
                                  </div>
                                  <div style={{ fontSize: "0.66rem", color: "var(--text-body)", marginTop: 2 }}>
                                    {addlInv.total_additional_funds_formatted} out-of-pocket
                                  </div>
                                </div>
                              </div>

                              <div style={{ background: "rgba(34, 197, 94, 0.08)", border: "1px dashed rgba(34, 197, 94, 0.3)", borderRadius: 6, padding: "6px 10px", fontSize: "0.72rem", color: "var(--text-heading)" }}>
                                💡 <strong>Covered by Institutional Funding:</strong> ₹{addlInv.subsidy_coverage_amount?.toLocaleString("en-IN")} Government Subsidy + ₹{addlInv.bank_loan_coverage_amount?.toLocaleString("en-IN")} Bank Term Loan
                              </div>
                            </div>
                          )}

                          {/* 5. Recommended Next Steps (Actionable Preparation Roadmap) */}
                          <div style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--line)", borderRadius: 10, padding: "12px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                              <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--citrus-orange)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                                <FileText size={14} /> 5. Recommended Next Steps (Prioritized Preparation Checklist)
                              </div>
                              <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>Pre-requisites before bank appraisal</span>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                              {(nextSteps.length > 0 ? nextSteps : (rep.action_plan || [])).map((step, sIdx) => {
                                const isObj = typeof step === "object";
                                const stepNum = isObj ? step.step_number : sIdx + 1;
                                const title = isObj ? step.title : `Action Step ${sIdx + 1}`;
                                const action = isObj ? step.action : step;
                                const entity = isObj ? step.entity : null;
                                const priority = isObj ? step.priority : "Immediate";

                                return (
                                  <div key={sIdx} style={{ display: "flex", alignItems: "flex-start", gap: 8, background: "rgba(255,255,255,0.03)", padding: "8px 10px", borderRadius: 6, fontSize: "0.74rem" }}>
                                    <span style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(249, 115, 22, 0.15)", color: "var(--citrus-orange)", fontWeight: 800, fontSize: "0.7rem", display: "grid", placeItems: "center", flexShrink: 0 }}>
                                      {stepNum}
                                    </span>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                        <strong style={{ color: "var(--text-heading)" }}>{title}</strong>
                                        <span style={{ fontSize: "0.65rem", padding: "1px 6px", borderRadius: 4, background: priority === "Immediate" ? "rgba(249, 115, 22, 0.18)" : "rgba(99, 102, 241, 0.18)", color: priority === "Immediate" ? "var(--citrus-orange)" : "var(--electric-blue)", fontWeight: 700 }}>
                                          {priority}
                                        </span>
                                      </div>
                                      <div style={{ color: "var(--text-body)", marginTop: 2 }}>{action}</div>
                                      {entity && (
                                        <div style={{ fontSize: "0.68rem", color: "var(--muted)", marginTop: 2 }}>
                                          🏢 Responsible Agency / Portal: <strong>{entity}</strong>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Explainable AI (XAI) Feature Attribution */}
              {rec.ml_prediction?.explainable_ai_factors && (
                <div style={{ background: "var(--panel-subtle)", border: "1px dashed var(--line)", borderRadius: 8, padding: "8px 12px", margin: "10px 0" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>
                    🤖 Explainable AI (XAI) Feature Attribution:
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {rec.ml_prediction.explainable_ai_factors.slice(0, 4).map((f, fIdx) => (
                      <span
                        key={fIdx}
                        style={{
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          background: f.positive ? "rgba(16, 185, 129, 0.12)" : "rgba(239, 68, 68, 0.12)",
                          color: f.positive ? "var(--ok)" : "#ef4444",
                          padding: "2px 8px",
                          borderRadius: 4,
                          border: `1px solid ${f.positive ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"}`
                        }}
                      >
                        {f.positive ? "✓ " : "⚠ "} {f.factor} (+{f.impact} impact)
                      </span>
                    ))}
                  </div>
                </div>
              )}

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
                    💰 <strong>Est. Total CapEx:</strong> {rec.est_capex_formatted || ("₹" + fin.total_project_cost.toLocaleString("en-IN"))}
                  </span>
                  <span>
                    ⏱️ <strong>Setup Timeline:</strong> {rec.setup_timeline || "2–3 Months"}
                  </span>
                  <span>
                    📈 <strong>Target Margin:</strong> {rec.est_margin || "~30% Net"}
                  </span>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                  {(() => {
                    const isAdded =
                      activeVenture?.name === rec.name ||
                      activeVenture?.opportunity_id === rec.opportunity_id ||
                      activeVenture?.id === String(rec.opportunity_id) ||
                      activeVenture?.id === `OPP${String(rec.opportunity_id).padStart(2, "0")}`;
                    return (
                      <button
                        type="button"
                        onClick={() => handleAddToRoadmap(rec)}
                        className={isAdded ? "pill-option-btn active" : "btn-secondary-gloss"}
                        style={{
                          padding: "8px 16px",
                          fontSize: "0.85rem",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          background: isAdded ? "rgba(34, 197, 94, 0.2)" : undefined,
                          borderColor: isAdded ? "rgba(34, 197, 94, 0.5)" : undefined,
                          color: isAdded ? "#4ade80" : undefined,
                          fontWeight: 700,
                        }}
                      >
                        <span>{isAdded ? "✓ In My Roadmap (Active on Home)" : "🗺️ Add to Roadmap"}</span>
                      </button>
                    );
                  })()}

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/business-plan", {
                        state: { opportunity: rec, userSummary: user_summary, userInput: userInputData },
                      })
                    }
                    className="btn-primary-gloss"
                    style={{ padding: "8px 20px", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: 6 }}
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

      {/* Expandable prompt card at the bottom of strict matches */}
      {hasStrictMatches && closeRecs.length > 0 && !showCloseMatches && (
        <div
          className="card wizard-form-card"
          style={{
            textAlign: "center",
            padding: "26px 20px",
            marginTop: 20,
            border: "1px dashed rgba(99, 102, 241, 0.4)",
            background: "rgba(99, 102, 241, 0.05)",
            borderRadius: 12,
          }}
        >
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-heading)", marginBottom: 4 }}>
            Looking for More Options?
          </div>
          <p className="muted" style={{ fontSize: "0.85rem", maxWidth: 540, margin: "0 auto 16px" }}>
            EntreVision's Decision Support System (DSS) also identified {closeRecs.length} additional close matches (93%–95% fit) with bridgeable skill and capital gaps.
          </p>
          <button
            type="button"
            onClick={() => setShowCloseMatches(true)}
            className="btn-secondary-gloss"
            style={{ padding: "10px 22px", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            <Sparkles size={16} color="var(--cyan)" />
            Show {closeRecs.length} Additional Close Recommendations (DSS)
          </button>
        </div>
      )}
        </>
      )}

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
