import React from "react";
import { Cpu, ArrowDown, Sparkles, Check, ChevronRight } from "lucide-react";

export default function DecisionEngineVisual() {
  return (
    <div className="decision-visual-card">
      {/* 1. YOUR PROFILE */}
      <div className="visual-section">
        <div className="visual-header">
          <span className="visual-title">
            <span className="glowing-dot" style={{ width: 6, height: 6 }} />
            YOUR PROFILE
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontWeight: 600 }}>Inputs</span>
        </div>

        <div className="profile-tags-grid">
          <div className="profile-tag">
            <span>🌱</span>
            <span>Skills</span>
          </div>
          <div className="profile-tag">
            <span>📍</span>
            <span>Location</span>
          </div>
          <div className="profile-tag">
            <span>🏠</span>
            <span>Resources</span>
          </div>
          <div className="profile-tag">
            <span>💰</span>
            <span>Investment</span>
          </div>
        </div>
      </div>

      {/* Connection Arrow */}
      <div className="connector-line">
        <div style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "var(--panel-solid)",
          border: "1px solid var(--cyan)",
          display: "grid",
          placeItems: "center",
          color: "var(--cyan)",
          boxShadow: "0 0 10px rgba(6, 182, 212, 0.4)",
          zIndex: 1,
        }}>
          <ArrowDown size={12} />
        </div>
      </div>

      {/* 2. ENTREVISION ENGINE */}
      <div className="engine-core-pill">
        <div className="engine-name">
          <Cpu size={18} color="var(--cyan)" />
          <span>ENTREVISION ENGINE</span>
        </div>
        <span className="engine-status-tag">Matching 25+ Models</span>
      </div>

      {/* Connection Arrow */}
      <div className="connector-line">
        <div style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "var(--panel-solid)",
          border: "1px solid var(--electric-blue)",
          display: "grid",
          placeItems: "center",
          color: "var(--electric-blue)",
          boxShadow: "0 0 10px rgba(99, 102, 241, 0.4)",
          zIndex: 1,
        }}>
          <ArrowDown size={12} />
        </div>
      </div>

      {/* 3. BUSINESS OPPORTUNITY */}
      <div className="visual-section">
        <div className="visual-header">
          <span className="visual-title" style={{ color: "var(--ok)" }}>
            <Sparkles size={13} color="var(--ok)" />
            BUSINESS OPPORTUNITY
          </span>
          <span style={{ fontSize: "0.72rem", color: "var(--ok)", fontWeight: 700 }}>Matches Found</span>
        </div>

        <div className="opportunity-output-list">
          <div className="opportunity-tag">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>🍊</span>
              <span>Citrus Nursery</span>
            </div>
            <span className="match-rate">96% Fit • PMFME 35%</span>
          </div>

          <div className="opportunity-tag">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>🧃</span>
              <span>Citrus Processing</span>
            </div>
            <span className="match-rate">92% Fit • ICAR-CCRI</span>
          </div>

          <div className="opportunity-tag">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>📦</span>
              <span>Citrus Packing</span>
            </div>
            <span className="match-rate">88% Fit • APMC Hub</span>
          </div>
        </div>
      </div>
    </div>
  );
}
