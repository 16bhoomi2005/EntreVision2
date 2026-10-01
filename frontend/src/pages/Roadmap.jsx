import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Map,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Lock,
  Unlock,
  AlertTriangle,
  FileText,
  Building2,
  Landmark,
  Coins,
  GraduationCap,
  Users,
  ShieldCheck,
  Calendar,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Plus,
  Check,
  X,
  Sliders,
  Award,
  Layers,
  HelpCircle,
  Upload
} from "lucide-react";

// ============================================================================
// 1. MASTER 6-PHASE ROADMAP TEMPLATE (NAGPUR CITRUS VENTURES)
// ============================================================================
const DEFAULT_ROADMAP_PHASES = [
  {
    id: "phase_1",
    phaseNumber: 1,
    title: "1. Research & Validation",
    icon: "🔍",
    timeframe: "Weeks 1–2",
    description: "Validate customer demand, local APMC mandi market dynamics, and competitive supply density.",
    tasks: [
      {
        id: "T1_1",
        title: "Complete EntreVision 7-Step Opportunity Assessment",
        whyRequired: "Evaluates your personal skills, physical resources, land, and budget against 10 citrus commercial archetypes.",
        moduleLink: "/find-opportunity",
        moduleLabel: "Opportunity Assessment",
        defaultCompleted: true,
        dependencies: [],
      },
      {
        id: "T1_2",
        title: "Validate Local Citrus Mandi Prices & Supply in Katol / Kalamna",
        whyRequired: "Understanding seasonal price fluctuations between Ambia (Sept–Nov) and Mrig (Feb–April) bahar crops ensures accurate revenue projections.",
        moduleLink: "/locations",
        moduleLabel: "Location Explorer",
        defaultCompleted: true,
        dependencies: [],
      },
      {
        id: "T1_3",
        title: "Analyze Competitor Density & Nearby Infrastructure Hubs",
        whyRequired: "Checks distances to accredited cold storage (e.g. Ras Frozen 3,500 MT) and ICAR-CCRI technical demonstration units.",
        moduleLink: "/locations",
        moduleLabel: "Cluster Infrastructure",
        defaultCompleted: true,
        dependencies: ["T1_1"],
      },
      {
        id: "T1_4",
        title: "Confirm Target Customer Demand with Local Orchardists & FPOs",
        whyRequired: "Validates direct off-take interest for disease-free saplings or processed citrus products before capital deployment.",
        moduleLink: "/collaboration",
        moduleLabel: "Collaboration Network",
        defaultCompleted: true,
        dependencies: ["T1_1"],
      },
    ],
  },
  {
    id: "phase_2",
    phaseNumber: 2,
    title: "2. Business Planning",
    icon: "📋",
    timeframe: "Weeks 3–4",
    description: "Generate comprehensive 8-section Business Plan and establish technical feasibility parameters.",
    tasks: [
      {
        id: "T2_1",
        title: "Select Commercial Business Archetype",
        whyRequired: "Locks in whether your initial focus is certified nursery propagation, juicing, essential oil extraction, or post-harvest grading.",
        moduleLink: "/opportunities",
        moduleLabel: "Business Models",
        defaultCompleted: true,
        dependencies: ["T1_4"],
      },
      {
        id: "T2_2",
        title: "Generate Bank-Ready EntreVision Business Plan",
        whyRequired: "Creates detailed CapEx schedules, skill gap resolutions, resource mappings, and 5-year financial projections.",
        moduleLink: "/business-plan",
        moduleLabel: "Business Plan Hub",
        defaultCompleted: true,
        dependencies: ["T2_1"],
      },
      {
        id: "T2_3",
        title: "Map Physical Site & Ecosystem Dependencies",
        whyRequired: "Validates 3-phase commercial electrical lines, borewell discharge capacity, and road connectivity in Katol.",
        moduleLink: "/business-plan",
        moduleLabel: "Resources Section",
        defaultCompleted: true,
        dependencies: ["T2_2"],
      },
    ],
  },
  {
    id: "phase_3",
    phaseNumber: 3,
    title: "3. Skills & Compliance",
    icon: "🎓",
    timeframe: "Month 2",
    description: "Complete mandatory technical training, obtain state nursery accreditation or FSSAI license, and file MSME Udyam.",
    tasks: [
      {
        id: "T3_1",
        title: "Record Existing Agronomy & Farm Management Experience",
        whyRequired: "Establishes founder technical background for bank credit appraisal and government subsidy eligibility.",
        moduleLink: "/profile",
        moduleLabel: "My Profile",
        defaultCompleted: true,
        dependencies: ["T2_2"],
      },
      {
        id: "T3_2",
        title: "Complete ICAR-CCRI Certified Citrus Budding & Propagation Workshop",
        whyRequired: "Mandatory technical prerequisite for commercial disease-free nursery accreditation by Maharashtra Dept of Agriculture.",
        moduleLink: "/profile",
        moduleLabel: "Upload Certificate",
        actionOptions: ["Find CCRI Training", "Upload Existing Certificate", "Add Experience"],
        defaultCompleted: false,
        dependencies: ["T3_1"],
      },
      {
        id: "T3_3",
        title: "Obtain Maharashtra State Nursery Accreditation / FSSAI License",
        whyRequired: "Legal requirement to sell certified planting material or food-grade processed citrus products in Maharashtra.",
        moduleLink: "/schemes",
        moduleLabel: "Compliance Checklist",
        actionOptions: ["Apply on MahaAgri Portal", "Upload Inspection NOC"],
        defaultCompleted: false,
        dependencies: ["T3_2"],
      },
      {
        id: "T3_4",
        title: "Complete Udyam MSME, GST & Local Gram Panchayat / MIDC NOC",
        whyRequired: "Establishes formal micro-enterprise identity required for banking, tax inputs, and government subsidy disbursement.",
        moduleLink: "/schemes",
        moduleLabel: "MSME Portal",
        actionOptions: ["File Udyam Online (Free)", "Upload GST Certificate"],
        defaultCompleted: false,
        dependencies: ["T3_1"],
      },
    ],
  },
  {
    id: "phase_4",
    phaseNumber: 4,
    title: "4. Investment & Finance",
    icon: "💰",
    timeframe: "Months 2–3",
    description: "Structure CapEx budgets, calculate funding gaps, apply for 35% PMFME grant, and secure bank debt.",
    tasks: [
      {
        id: "T4_1",
        title: "Finalize CapEx Breakdown & 3-Month Working Capital in Financial Assistant",
        whyRequired: "Translates equipment, polyhouse structures, rootstock procurement, and wages into an itemized financial plan.",
        moduleLink: "/financial-assistant",
        moduleLabel: "Financial Assistant",
        defaultCompleted: false,
        dependencies: ["T2_2"],
      },
      {
        id: "T4_2",
        title: "Structure Own Founder Equity vs Bank Term Loan Requirement",
        whyRequired: "Ensures at least 10% own equity is liquid and simulates bank loan EMIs (MUDRA / SBI Agri Infra) for the funding gap.",
        moduleLink: "/financial-assistant",
        moduleLabel: "Loan Simulator",
        defaultCompleted: false,
        dependencies: ["T4_1"],
      },
      {
        id: "T4_3",
        title: "Submit PMFME 35% Capital Subsidy Application on MoFPI Portal",
        whyRequired: "Secures credit-linked capital grant of up to ₹10 Lakhs (or 35% of project cost) under ODOP Nagpur Mandarin scope.",
        moduleLink: "/schemes",
        moduleLabel: "Government Schemes",
        defaultCompleted: false,
        dependencies: ["T4_1", "T3_4"],
      },
    ],
  },
  {
    id: "phase_5",
    phaseNumber: 5,
    title: "5. Infrastructure & Setup",
    icon: "🏗️",
    timeframe: "Months 3–5",
    description: "Construct polyhouse shed, install automated drip/misting, and procure certified mother stock.",
    tasks: [
      {
        id: "T5_1",
        title: "Erect 1,000 sq. m UV-Stabilized Shade-Net Polyhouse & Micro-Sprinklers",
        whyRequired: "Provides controlled biosecurity enclosure preventing vector-borne citrus greening (HLB) and phytophthora rot.",
        moduleLink: "/business-plan",
        moduleLabel: "Setup Blueprint",
        defaultCompleted: false,
        dependencies: ["T4_2"],
      },
      {
        id: "T5_2",
        title: "Procure Certified Rangpur Lime Rootstocks & CCRI-Indexed Budwood",
        whyRequired: "Establishes virus-free mother propagation blocks guaranteeing true-to-type, high-yielding Nagpur Mandarin saplings.",
        moduleLink: "/collaboration",
        moduleLabel: "Find Budwood Source",
        defaultCompleted: false,
        dependencies: ["T5_1", "T3_2"],
      },
    ],
  },
  {
    id: "phase_6",
    phaseNumber: 6,
    title: "6. Launch & Market Entry",
    icon: "🚀",
    timeframe: "Month 5+",
    description: "Begin commercial propagation/production, deploy QR traceability tags, and execute FPO off-take contracts.",
    tasks: [
      {
        id: "T6_1",
        title: "Produce First Commercial Batch & Attach Weatherproof QR Care Tags",
        whyRequired: "Ensures plant traceability and gives buyers digital access to CCRI budwood certification and cultivation guides.",
        moduleLink: "/business-plan",
        moduleLabel: "Traceability System",
        defaultCompleted: false,
        dependencies: ["T5_2"],
      },
      {
        id: "T6_2",
        title: "Execute Direct Supply Contracts with Vidarbha FPOs & Orchardists",
        whyRequired: "Secures advance booking for 10,000 saplings at ₹85–₹110/unit, establishing immediate positive cash flows.",
        moduleLink: "/collaboration",
        moduleLabel: "FPO Buyer Linkages",
        defaultCompleted: false,
        dependencies: ["T6_1"],
      },
    ],
  },
];

// ============================================================================
// 2. MAIN ROADMAP COMPONENT
// ============================================================================
export default function Roadmap() {
  const navigate = useNavigate();

  // Active view toggle: "checklist" | "timeline"
  const [viewMode, setViewMode] = useState("checklist");

  // Selected Phase filter: "all" or phase ID
  const [activePhaseFilter, setActivePhaseFilter] = useState("all");

  // Selected Task for Detail Drawer / Modal (Page 9.2)
  const [selectedTask, setSelectedTask] = useState(null);

  // Business and Location context
  const [businessContext, setBusinessContext] = useState(() => {
    let name = "Disease-Free Certified Citrus Nursery";
    let location = "Katol, Nagpur District";
    try {
      const savedPlan = localStorage.getItem("ev_active_business_plan");
      if (savedPlan) {
        const parsed = JSON.parse(savedPlan);
        if (parsed.opportunity?.name) name = parsed.opportunity.name;
        if (parsed.userInput?.location || parsed.userSummary?.location) {
          location = parsed.userInput?.location || parsed.userSummary?.location;
        }
      }
    } catch (e) {}
    return { name, location };
  });

  // Completed Tasks state (localStorage backed)
  const [completedTaskIds, setCompletedTaskIds] = useState(() => {
    try {
      const saved = localStorage.getItem("ev_completed_roadmap_tasks");
      if (saved) return JSON.parse(saved);
    } catch (e) {}

    // Default pre-completed initial discovery & validation tasks
    const initial = [];
    DEFAULT_ROADMAP_PHASES.forEach((phase) => {
      phase.tasks.forEach((t) => {
        if (t.defaultCompleted) initial.push(t.id);
      });
    });

    // Check if user has uploaded certificates or documents in profile
    try {
      const docs = JSON.parse(localStorage.getItem("ev_user_documents") || "[]");
      if (docs.some((d) => d.type?.includes("cert") || d.name?.toLowerCase().includes("ccri"))) {
        initial.push("T3_2");
      }
      if (docs.some((d) => d.type?.includes("fssai") || d.type?.includes("nursery"))) {
        initial.push("T3_3");
      }
    } catch (e) {}

    return Array.from(new Set(initial));
  });

  // Custom added tasks from Collaboration or Schemes
  const [customRoadmapItems, setCustomRoadmapItems] = useState(() => {
    try {
      const saved = localStorage.getItem("ev_user_roadmap");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  // Persist completed tasks
  const toggleTaskCompletion = (taskId) => {
    setCompletedTaskIds((prev) => {
      const isCompleted = prev.includes(taskId);
      const updated = isCompleted ? prev.filter((id) => id !== taskId) : [...prev, taskId];
      try {
        localStorage.setItem("ev_completed_roadmap_tasks", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    // If modal open, update selected task state
    if (selectedTask && selectedTask.id === taskId) {
      setSelectedTask((prev) => ({
        ...prev,
        isCompleted: !prev.isCompleted,
      }));
    }
  };

  // Compute Total Progress & Counts
  const progressMetrics = useMemo(() => {
    let totalTasks = 0;
    let completedCount = 0;

    DEFAULT_ROADMAP_PHASES.forEach((phase) => {
      phase.tasks.forEach((t) => {
        totalTasks += 1;
        if (completedTaskIds.includes(t.id)) completedCount += 1;
      });
    });

    const percentage = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

    // Find current active phase (first phase with incomplete tasks)
    let activePhase = DEFAULT_ROADMAP_PHASES[0];
    for (const phase of DEFAULT_ROADMAP_PHASES) {
      const phaseCompleted = phase.tasks.every((t) => completedTaskIds.includes(t.id));
      if (!phaseCompleted) {
        activePhase = phase;
        break;
      }
    }

    return {
      totalTasks,
      completedCount,
      percentage,
      activePhase,
    };
  }, [completedTaskIds]);

  // Check if a task is locked by unmet dependencies (Page 9.4)
  const isTaskLocked = (task) => {
    if (!task.dependencies || task.dependencies.length === 0) return false;
    return !task.dependencies.every((depId) => completedTaskIds.includes(depId));
  };

  // Urgent alerts for top bar (Page 9.6)
  const urgentAlerts = useMemo(() => {
    const alerts = [];
    if (!completedTaskIds.includes("T3_2")) {
      alerts.push({
        id: "alert_ccri",
        title: "Upload ICAR-CCRI Training Certificate or Attend 5-Day Workshop",
        actionLink: "/profile",
        actionLabel: "Upload Document",
      });
    }
    if (!completedTaskIds.includes("T4_3")) {
      alerts.push({
        id: "alert_pmfme",
        title: "Submit PMFME 35% Subsidy DPR to Nodal Bank before Batch Launch",
        actionLink: "/schemes",
        actionLabel: "View Scheme",
      });
    }
    return alerts;
  }, [completedTaskIds]);

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", paddingBottom: 60 }}>
      {/* ====================================================================
          PAGE HEADER & OVERALL PROGRESS HERO
         ==================================================================== */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="pill" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Map size={14} /> Execution Center
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>PAGE 9</span>
            </div>
            <h1 style={{ fontSize: "1.85rem", fontWeight: 800, margin: "6px 0 4px", color: "var(--text-heading)" }}>
              🗺️ My Execution Roadmap
            </h1>
            <p className="muted" style={{ margin: 0, fontSize: "0.95rem" }}>
              Your personalized milestone journey from initial concept to commercial launch for <strong>{businessContext.name}</strong>.
            </p>
          </div>

          {/* View Mode Toggle: Checklist vs Timeline */}
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => setViewMode("checklist")}
              className={`pill-option-btn ${viewMode === "checklist" ? "active" : ""}`}
              style={{ fontSize: "0.82rem", padding: "8px 14px" }}
            >
              📋 Checklist View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("timeline")}
              className={`pill-option-btn ${viewMode === "timeline" ? "active" : ""}`}
              style={{ fontSize: "0.82rem", padding: "8px 14px" }}
            >
              ⏳ Timeline View (9.5)
            </button>
          </div>
        </div>

        {/* OVERALL PROGRESS HERO CARD */}
        <div
          style={{
            marginTop: 20,
            padding: "18px 22px",
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%), var(--panel-solid)",
            borderRadius: 16,
            border: "1px solid var(--line-glow)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase" }}>
                Overall Readiness & Execution Progress
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 4 }}>
                <span style={{ fontSize: "2.2rem", fontWeight: 900, color: "var(--text-heading)", lineHeight: 1 }}>
                  {progressMetrics.percentage}%
                </span>
                <span style={{ fontSize: "0.9rem", color: "var(--muted)", fontWeight: 700 }}>
                  ({progressMetrics.completedCount} of {progressMetrics.totalTasks} milestones completed)
                </span>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.72rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                CURRENT ACTIVE PHASE
              </span>
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--ok)", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--ok)", display: "inline-block" }} />
                {progressMetrics.activePhase.title}
              </div>
              <span style={{ fontSize: "0.74rem", color: "var(--muted)" }}>
                Target: {progressMetrics.activePhase.timeframe}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div
            style={{
              marginTop: 14,
              height: 12,
              borderRadius: 6,
              background: "var(--panel-subtle)",
              overflow: "hidden",
              border: "1px solid var(--line)",
            }}
          >
            <div
              style={{
                width: `${progressMetrics.percentage}%`,
                height: "100%",
                background: "linear-gradient(90deg, var(--electric-blue), var(--cyan))",
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>

        {/* PAGE 9.6 — ROADMAP ALERTS & ATTENTION BANNER */}
        {urgentAlerts.length > 0 && (
          <div
            style={{
              marginTop: 16,
              padding: "12px 16px",
              background: "rgba(245, 158, 11, 0.08)",
              border: "1px solid rgba(245, 158, 11, 0.3)",
              borderRadius: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <AlertTriangle size={18} color="#f59e0b" />
              <div>
                <strong style={{ fontSize: "0.85rem", color: "var(--text-heading)" }}>
                  ⚠️ {urgentAlerts.length} task{urgentAlerts.length > 1 ? "s" : ""} need your immediate attention
                </strong>
                <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                  {urgentAlerts[0].title}
                </div>
              </div>
            </div>

            <Link
              to={urgentAlerts[0].actionLink}
              className="btn-primary-gloss"
              style={{ fontSize: "0.76rem", padding: "6px 14px", textDecoration: "none" }}
            >
              {urgentAlerts[0].actionLabel} →
            </Link>
          </div>
        )}
      </div>

      {/* ====================================================================
          VIEW 1: CHECKLIST VIEW (6 STRUCTURED PHASES)
         ==================================================================== */}
      {viewMode === "checklist" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Phase Filter Tabs */}
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
            <button
              type="button"
              onClick={() => setActivePhaseFilter("all")}
              className={`pill-option-btn ${activePhaseFilter === "all" ? "active" : ""}`}
              style={{ fontSize: "0.8rem", padding: "7px 14px", whiteSpace: "nowrap" }}
            >
              All Phases (6)
            </button>
            {DEFAULT_ROADMAP_PHASES.map((p) => {
              const isCompleted = p.tasks.every((t) => completedTaskIds.includes(t.id));
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setActivePhaseFilter(p.id)}
                  className={`pill-option-btn ${activePhaseFilter === p.id ? "active" : ""}`}
                  style={{ fontSize: "0.8rem", padding: "7px 14px", whiteSpace: "nowrap" }}
                >
                  <span>{isCompleted ? "✓" : p.icon}</span>
                  <span>{p.title.split(". ")[1]}</span>
                </button>
              );
            })}
          </div>

          {/* Phases List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {DEFAULT_ROADMAP_PHASES.filter(
              (p) => activePhaseFilter === "all" || activePhaseFilter === p.id
            ).map((phase) => {
              const phaseTasks = phase.tasks;
              const completedInPhase = phaseTasks.filter((t) => completedTaskIds.includes(t.id)).length;
              const isPhaseAllDone = completedInPhase === phaseTasks.length;
              const isCurrentActive = progressMetrics.activePhase.id === phase.id;

              return (
                <div
                  key={phase.id}
                  className="card"
                  style={{
                    border: isCurrentActive
                      ? "1px solid var(--cyan)"
                      : isPhaseAllDone
                      ? "1px solid var(--ok-border)"
                      : "1px solid var(--line)",
                    background: isCurrentActive ? "rgba(6, 182, 212, 0.03)" : "var(--panel)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 14,
                  }}
                >
                  {/* Phase Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          background: isPhaseAllDone
                            ? "var(--ok-bg)"
                            : isCurrentActive
                            ? "rgba(6, 182, 212, 0.15)"
                            : "var(--panel-subtle)",
                          color: isPhaseAllDone ? "var(--ok)" : isCurrentActive ? "var(--cyan)" : "var(--muted)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "1.3rem",
                          fontWeight: 900,
                          flexShrink: 0,
                        }}
                      >
                        {isPhaseAllDone ? "✓" : phase.icon}
                      </div>

                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "var(--text-heading)" }}>
                            {phase.title}
                          </h3>
                          <span className="tag" style={{ fontSize: "0.72rem" }}>
                            {phase.timeframe}
                          </span>
                          {isPhaseAllDone && (
                            <span className="badge-verified" style={{ fontSize: "0.7rem" }}>
                              ✓ Phase Completed
                            </span>
                          )}
                          {isCurrentActive && !isPhaseAllDone && (
                            <span style={{ fontSize: "0.7rem", color: "var(--cyan)", background: "rgba(6, 182, 212, 0.15)", padding: "2px 8px", borderRadius: 6, fontWeight: 800 }}>
                              ● In Progress
                            </span>
                          )}
                        </div>
                        <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "var(--muted)" }}>
                          {phase.description}
                        </p>
                      </div>
                    </div>

                    <div style={{ fontSize: "0.85rem", fontWeight: 800, color: isPhaseAllDone ? "var(--ok)" : "var(--muted)" }}>
                      {completedInPhase} / {phaseTasks.length} tasks completed
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                    {phaseTasks.map((task) => {
                      const isCompleted = completedTaskIds.includes(task.id);
                      const locked = isTaskLocked(task);

                      return (
                        <div
                          key={task.id}
                          style={{
                            background: isCompleted ? "rgba(16, 185, 129, 0.04)" : "var(--panel-subtle)",
                            padding: "12px 16px",
                            borderRadius: 12,
                            border: isCompleted ? "1px solid var(--ok-border)" : "1px solid var(--line)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 12,
                            opacity: locked && !isCompleted ? 0.65 : 1,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 260 }}>
                            <button
                              type="button"
                              onClick={() => toggleTaskCompletion(task.id)}
                              style={{
                                background: isCompleted ? "var(--ok)" : "transparent",
                                border: isCompleted ? "1px solid var(--ok)" : "2px solid var(--muted)",
                                borderRadius: 6,
                                width: 22,
                                height: 22,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                color: "#fff",
                                flexShrink: 0,
                              }}
                              title={isCompleted ? "Mark as Incomplete" : "Mark as Complete"}
                            >
                              {isCompleted && <Check size={14} />}
                            </button>

                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <strong
                                  style={{
                                    fontSize: "0.88rem",
                                    color: isCompleted ? "var(--muted)" : "var(--text-heading)",
                                    textDecoration: isCompleted ? "line-through" : "none",
                                  }}
                                >
                                  {task.title}
                                </strong>
                                {locked && !isCompleted && (
                                  <span style={{ fontSize: "0.68rem", color: "var(--muted)", display: "inline-flex", alignItems: "center", gap: 3 }}>
                                    <Lock size={10} /> Locked by prerequisite
                                  </span>
                                )}
                              </div>
                              <p style={{ margin: "2px 0 0", fontSize: "0.76rem", color: "var(--muted)" }}>
                                {task.whyRequired}
                              </p>
                            </div>
                          </div>

                          {/* Task Action Buttons */}
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            {task.moduleLink && (
                              <Link
                                to={task.moduleLink}
                                className="btn-secondary-gloss"
                                style={{ fontSize: "0.74rem", padding: "6px 10px", textDecoration: "none" }}
                              >
                                {task.moduleLabel} →
                              </Link>
                            )}

                            <button
                              type="button"
                              onClick={() => setSelectedTask({ ...task, phaseTitle: phase.title, isCompleted, locked })}
                              className="pill-option-btn"
                              style={{ fontSize: "0.74rem", padding: "6px 10px" }}
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Roadmap Items from Ecosystem */}
          {customRoadmapItems.length > 0 && (
            <div className="card">
              <h3 style={{ margin: "0 0 10px", fontSize: "1.15rem", fontWeight: 800, color: "var(--text-heading)" }}>
                🤝 Custom Ecosystem & Collaboration Milestones
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {customRoadmapItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      background: "var(--panel-subtle)",
                      padding: "10px 14px",
                      borderRadius: 10,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: "0.85rem", color: "var(--text-heading)" }}>
                        {item.title}
                      </strong>
                      <div style={{ fontSize: "0.74rem", color: "var(--muted)" }}>
                        Category: {item.category} • Added: {new Date(item.addedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <span className="tag" style={{ fontSize: "0.72rem" }}>
                      ● {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ====================================================================
          VIEW 2: PAGE 9.5 — TIMELINE VIEW
         ==================================================================== */}
      {viewMode === "timeline" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="pill">Execution Horizon</span>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>PAGE 9.5</span>
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 6px" }}>
              ⏳ Milestone Timeline Roadmap
            </h2>
            <p className="muted" style={{ margin: 0, fontSize: "0.88rem" }}>
              Estimated sequential progression from initial research to commercial fruit/sapling sales.
            </p>

            {/* Vertical Flow Timeline */}
            <div style={{ marginTop: 24, position: "relative", paddingLeft: 24 }}>
              {/* Vertical Glowing Line */}
              <div
                style={{
                  position: "absolute",
                  left: 11,
                  top: 10,
                  bottom: 10,
                  width: 3,
                  background: "linear-gradient(180deg, var(--ok) 0%, var(--cyan) 50%, var(--electric-blue) 100%)",
                  borderRadius: 2,
                }}
              />

              {DEFAULT_ROADMAP_PHASES.map((phase, idx) => {
                const isCompleted = phase.tasks.every((t) => completedTaskIds.includes(t.id));
                const isCurrent = progressMetrics.activePhase.id === phase.id;

                return (
                  <div key={phase.id} style={{ position: "relative", marginBottom: 28 }}>
                    {/* Node Dot */}
                    <div
                      style={{
                        position: "absolute",
                        left: -24,
                        top: 2,
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: isCompleted ? "var(--ok)" : isCurrent ? "var(--cyan)" : "var(--panel-solid)",
                        border: isCompleted ? "2px solid #fff" : "2px solid var(--line-glow)",
                        boxShadow: isCurrent ? "0 0 12px var(--cyan)" : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.7rem",
                        color: "#fff",
                        fontWeight: 900,
                      }}
                    >
                      {isCompleted ? "✓" : idx + 1}
                    </div>

                    {/* Timeline Phase Card */}
                    <div
                      style={{
                        background: "var(--panel-solid)",
                        padding: 16,
                        borderRadius: 14,
                        border: isCurrent ? "1px solid var(--cyan)" : "1px solid var(--line)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: "1.2rem" }}>{phase.icon}</span>
                          <strong style={{ fontSize: "1.1rem", color: "var(--text-heading)" }}>
                            {phase.title}
                          </strong>
                          <span className="tag" style={{ fontSize: "0.72rem" }}>
                            {phase.timeframe}
                          </span>
                        </div>

                        {isCompleted ? (
                          <span style={{ fontSize: "0.74rem", color: "var(--ok)", fontWeight: 800 }}>
                            ✓ Phase Completed
                          </span>
                        ) : isCurrent ? (
                          <span style={{ fontSize: "0.74rem", color: "var(--cyan)", fontWeight: 800 }}>
                            ● Active Phase
                          </span>
                        ) : (
                          <span style={{ fontSize: "0.74rem", color: "var(--muted)" }}>
                            ○ Upcoming
                          </span>
                        )}
                      </div>

                      <p style={{ margin: "6px 0 10px", fontSize: "0.82rem", color: "var(--muted)" }}>
                        {phase.description}
                      </p>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {phase.tasks.map((t) => {
                          const done = completedTaskIds.includes(t.id);
                          return (
                            <span
                              key={t.id}
                              style={{
                                fontSize: "0.74rem",
                                background: done ? "var(--ok-bg)" : "var(--panel-subtle)",
                                color: done ? "var(--ok)" : "var(--text)",
                                padding: "4px 8px",
                                borderRadius: 6,
                                border: done ? "1px solid var(--ok-border)" : "1px solid var(--line)",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                              }}
                            >
                              {done ? "✓" : "□"} {t.title}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL / DRAWER: PAGE 9.2 — INDIVIDUAL TASK DRILL-DOWN
         ==================================================================== */}
      {selectedTask && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(8px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            style={{
              background: "var(--panel-solid)",
              border: "1px solid var(--line-glow)",
              borderRadius: 20,
              maxWidth: 580,
              width: "100%",
              padding: 24,
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <span className="pill" style={{ fontSize: "0.72rem" }}>
                  {selectedTask.phaseTitle}
                </span>
                <h2 style={{ margin: "6px 0 2px", fontSize: "1.3rem", fontWeight: 800, color: "var(--text-heading)" }}>
                  {selectedTask.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Why is this required? */}
              <div style={{ background: "var(--panel-subtle)", padding: 14, borderRadius: 12 }}>
                <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase" }}>
                  Why is this required?
                </span>
                <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--text-heading)", lineHeight: 1.5 }}>
                  {selectedTask.whyRequired}
                </p>
              </div>

              {/* Status */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 10, background: "var(--panel-subtle)" }}>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>Current Status:</span>
                {selectedTask.isCompleted ? (
                  <span style={{ fontSize: "0.82rem", color: "var(--ok)", fontWeight: 800 }}>
                    🟢 Requirement Satisfied & Completed
                  </span>
                ) : selectedTask.locked ? (
                  <span style={{ fontSize: "0.82rem", color: "var(--muted)", fontWeight: 700 }}>
                    🔒 Locked (Prerequisite Incomplete)
                  </span>
                ) : (
                  <span style={{ fontSize: "0.82rem", color: "#f59e0b", fontWeight: 800 }}>
                    🟡 In Progress
                  </span>
                )}
              </div>

              {/* Impact of Completion */}
              <div style={{ fontSize: "0.78rem", color: "var(--muted)", lineHeight: 1.5 }}>
                <strong>After completing this milestone:</strong>
                <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                  <li>Updates your profile and document repository</li>
                  <li>Re-evaluates business readiness score and subsidy eligibility</li>
                  <li>Unlocks dependent downstream infrastructure and finance tasks</li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 22, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
              {selectedTask.moduleLink ? (
                <Link
                  to={selectedTask.moduleLink}
                  className="btn-secondary-gloss"
                  style={{ fontSize: "0.82rem", padding: "8px 14px", textDecoration: "none" }}
                  onClick={() => setSelectedTask(null)}
                >
                  Open {selectedTask.moduleLabel} →
                </Link>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={() => toggleTaskCompletion(selectedTask.id)}
                className={selectedTask.isCompleted ? "btn-secondary-gloss" : "btn-primary-gloss"}
                style={{ fontSize: "0.82rem", padding: "8px 18px" }}
              >
                {selectedTask.isCompleted ? "Re-Open Task" : "✓ Mark as Complete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
