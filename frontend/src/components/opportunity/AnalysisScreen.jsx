import React, { useState, useEffect } from "react";
import {
  Sparkles,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Building2,
  Coins,
  MapPin,
  Sprout,
  Landmark,
} from "lucide-react";

const PROFILE_VERIFICATION_CHECKLIST = [
  { id: "profile", label: "Profile & Entrepreneur Intent", icon: "👤", delay: 350 },
  { id: "skills", label: "Skills & Technical Experience", icon: "🛠️", delay: 700 },
  { id: "documents", label: "Certificates & Document Proof", icon: "📄", delay: 1100 },
  { id: "resources", label: "Resources & Existing Setup (Land, Shed, Power)", icon: "🌾", delay: 1500 },
  { id: "finances", label: "Financial Capacity & 35% PMFME Subsidy Calculation", icon: "💰", delay: 1900 },
  { id: "location", label: "Location & Local Vidarbha Ecosystem", icon: "📍", delay: 2300 },
  { id: "preferences", label: "Business Preferences, Scale & Risk Profile", icon: "🎯", delay: 2700 },
];

const COMPARISON_DIMENSIONS = [
  { id: "opps", label: "25+ Vidarbha Business Opportunities", icon: "🌱", color: "var(--ok)" },
  { id: "eco", label: "Local APMC Mandis, Cold Chain & CCRI Outreach", icon: "📍", color: "var(--cyan)" },
  { id: "fin", label: "CapEx Requirements & Bank Debt Structuring", icon: "💰", color: "var(--electric-blue)" },
  { id: "schemes", label: "Government Assistance & Credit-Linked Grants", icon: "🏛️", color: "var(--violet)" },
];

export default function AnalysisScreen({ onComplete }) {
  const [completedItems, setCompletedItems] = useState([]);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [analysisFinished, setAnalysisFinished] = useState(false);

  useEffect(() => {
    const timers = PROFILE_VERIFICATION_CHECKLIST.map((item, index) => {
      return setTimeout(() => {
        setCompletedItems((prev) => [...prev, item.id]);
        setActiveStepIndex(index + 1);
        if (index === PROFILE_VERIFICATION_CHECKLIST.length - 1) {
          setTimeout(() => {
            setAnalysisFinished(true);
            setTimeout(() => {
              if (onComplete) onComplete();
            }, 1000);
          }, 600);
        }
      }, item.delay);
    });

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="card wizard-form-card" style={{ maxWidth: 680, margin: "0 auto", padding: "40px 32px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h2 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--text-heading)", letterSpacing: "-0.02em", marginBottom: 8 }}>
          ANALYZING YOUR PROFILE
        </h2>
        <p style={{ color: "var(--muted)", fontSize: "0.95rem", maxWidth: 480, margin: "0 auto", lineHeight: 1.5 }}>
          We're finding businesses that fit what you have and what you want to build.
        </p>
      </div>

      {/* Animated Glowing Radar Orb */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, margin: "16px 0 28px" }}>
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "var(--cyan)",
            boxShadow: "0 0 12px var(--cyan)",
            animation: "mapPulse 1.4s infinite ease-in-out",
          }}
        />
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "var(--electric-blue)",
            boxShadow: "0 0 12px var(--electric-blue)",
            animation: "mapPulse 1.4s infinite ease-in-out 0.2s",
          }}
        />
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "var(--violet)",
            boxShadow: "0 0 12px var(--violet)",
            animation: "mapPulse 1.4s infinite ease-in-out 0.4s",
          }}
        />
      </div>

      {/* 1. Verified Profile Dimensions Checklist */}
      <div
        style={{
          background: "var(--panel-solid)",
          border: "1px solid var(--line)",
          borderRadius: 18,
          padding: "18px 22px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
          boxShadow: "var(--shadow-card)",
          marginBottom: 24,
        }}
      >
        {PROFILE_VERIFICATION_CHECKLIST.map((item, index) => {
          const isDone = completedItems.includes(item.id);
          const isCurrent = activeStepIndex === index;

          return (
            <div
              key={item.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                borderRadius: 10,
                background: isCurrent
                  ? "rgba(6, 182, 212, 0.08)"
                  : isDone
                  ? "rgba(16, 185, 129, 0.04)"
                  : "transparent",
                border: isCurrent ? "1px solid var(--line-glow)" : "1px solid transparent",
                transition: "all 0.25s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: "1.1rem" }}>{item.icon}</span>
                <span
                  style={{
                    fontSize: "0.88rem",
                    fontWeight: isDone || isCurrent ? 700 : 500,
                    color: isDone ? "var(--text-heading)" : isCurrent ? "var(--cyan)" : "var(--muted)",
                  }}
                >
                  {item.label}
                </span>
              </div>

              <div>
                {isDone ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--ok)", fontSize: "0.8rem", fontWeight: 700 }}>
                    <CheckCircle2 size={18} color="var(--ok)" />
                  </div>
                ) : isCurrent ? (
                  <Loader2 size={18} color="var(--cyan)" style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--line)" }} />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Comparison Sub-Card */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.06) 100%)",
          border: "1px solid var(--line-glow)",
          borderRadius: 18,
          padding: "20px 22px",
          marginBottom: 20,
        }}
      >
        <span
          style={{
            fontSize: "0.78rem",
            fontWeight: 800,
            color: "var(--cyan)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            display: "block",
            marginBottom: 12,
          }}
        >
          🔄 COMPARING YOUR PROFILE WITH:
        </span>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {COMPARISON_DIMENSIONS.map((dim) => (
            <div
              key={dim.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "var(--panel-solid)",
                padding: "10px 12px",
                borderRadius: 12,
                border: "1px solid var(--line)",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "var(--text-heading)",
              }}
            >
              <span>{dim.icon}</span>
              <span>{dim.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Mentor Insight Footer Banner */}
      <div
        style={{
          textAlign: "center",
          padding: "12px 16px",
          fontSize: "0.84rem",
          color: "var(--muted)",
          lineHeight: 1.5,
        }}
      >
        <strong style={{ color: "var(--cyan)" }}>💡 EntreVision Mentor Engine: </strong>
        Finding opportunities that match your skills, resources, location and goals — structuring readiness & financing pathways instead of eliminating potentials.
      </div>

      {/* CTA Button when ready */}
      {analysisFinished && (
        <div style={{ marginTop: 18, display: "flex", justifyContent: "center" }}>
          <button
            type="button"
            className="btn-primary-gloss"
            style={{ padding: "14px 36px", fontSize: "1rem" }}
            onClick={() => onComplete && onComplete()}
          >
            <Sparkles size={18} />
            <span>View My Recommendations →</span>
          </button>
        </div>
      )}
    </div>
  );
}
