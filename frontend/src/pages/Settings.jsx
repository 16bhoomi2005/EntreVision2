import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Sliders,
  Database,
  RefreshCw,
  CheckCircle2,
  Lock,
  Globe,
  Trash2,
  Download,
  Check,
} from "lucide-react";

export default function Settings() {
  const [settingsState, setSettingsState] = useState({
    mandiAlerts: true,
    harvestCycleAlerts: true,
    subsidyAlerts: true,
    collabVisibility: true,
    autoMatch: true,
    highContrastMode: false,
    offlineCache: true,
  });

  const [savedNotice, setSavedNotice] = useState(false);

  const toggleSetting = (key) => {
    setSettingsState((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2000);
      return next;
    });
  };

  const handleClearCache = () => {
    if (window.confirm("Reset all cached assessment inputs and restore default sample data?")) {
      localStorage.removeItem("ev_skills_data");
      localStorage.removeItem("ev_user_documents");
      localStorage.removeItem("ev_user_resources");
      localStorage.removeItem("ev_user_location");
      localStorage.removeItem("ev_user_finances");
      localStorage.removeItem("ev_user_preferences");
      localStorage.removeItem("ev_assessment_results");
      alert("Local data cache refreshed successfully!");
      window.location.reload();
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 860, margin: "0 auto", width: "100%", paddingBottom: 60 }}>
      {/* Header */}
      <div className="card" style={{ padding: "28px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div className="glowing-pill" style={{ marginBottom: 10 }}>
              <SettingsIcon size={14} color="var(--citrus-orange)" />
              <span>System & Account Preferences</span>
            </div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0" }}>
              Settings & Preferences
            </h1>
            <p className="muted" style={{ margin: 0, fontSize: "0.88rem" }}>
              Configure real-time mandi intelligence, PMFME scheme notifications, collaboration privacy, and local data caches.
            </p>
          </div>

          {savedNotice && (
            <span className="skill-status-tag verified" style={{ fontSize: "0.78rem" }}>
              <Check size={14} /> Preferences Saved
            </span>
          )}
        </div>
      </div>

      {/* 1. Regional Citrus Intelligence & Notifications */}
      <div className="card" style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(249, 115, 22, 0.15)", display: "grid", placeItems: "center" }}>
            <Bell size={16} color="var(--citrus-orange)" />
          </div>
          <div>
            <strong style={{ fontSize: "1rem", color: "var(--text-heading)" }}>
              1. Mandi Rates & Agro-Climatic Intelligence
            </strong>
            <span style={{ fontSize: "0.76rem", color: "var(--muted)", display: "block" }}>
              Real-time SMS & web notifications tailored to Vidarbha APMC hubs
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderRadius: 12, background: "var(--panel-subtle)", border: "1px solid var(--line)" }}>
            <div>
              <strong style={{ display: "block", fontSize: "0.9rem", color: "var(--text-heading)" }}>
                Daily Mandi Price Bulletins (Kalamna, Katol, Warud)
              </strong>
              <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                Receive modal rate alerts for Ambia and Mrig crop grade arrivals
              </span>
            </div>
            <button
              type="button"
              onClick={() => toggleSetting("mandiAlerts")}
              style={{
                width: 44,
                height: 24,
                borderRadius: 999,
                background: settingsState.mandiAlerts ? "var(--ok)" : "var(--panel-solid)",
                border: `1px solid ${settingsState.mandiAlerts ? "var(--ok)" : "var(--line)"}`,
                position: "relative",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#fff",
                  position: "absolute",
                  top: 2,
                  left: settingsState.mandiAlerts ? 22 : 2,
                  transition: "all 0.2s ease",
                }}
              />
            </button>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderRadius: 12, background: "var(--panel-subtle)", border: "1px solid var(--line)" }}>
            <div>
              <strong style={{ display: "block", fontSize: "0.9rem", color: "var(--text-heading)" }}>
                ICAR-CCRI Seasonal Harvest & Weather Bulletins
              </strong>
              <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                Advisories for fruit harvesting, peel oil extraction timing, and fruit fly prevention
              </span>
            </div>
            <button
              type="button"
              onClick={() => toggleSetting("harvestCycleAlerts")}
              style={{
                width: 44,
                height: 24,
                borderRadius: 999,
                background: settingsState.harvestCycleAlerts ? "var(--ok)" : "var(--panel-solid)",
                border: `1px solid ${settingsState.harvestCycleAlerts ? "var(--ok)" : "var(--line)"}`,
                position: "relative",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#fff",
                  position: "absolute",
                  top: 2,
                  left: settingsState.harvestCycleAlerts ? 22 : 2,
                  transition: "all 0.2s ease",
                }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Government Schemes & Subsidies */}
      <div className="card" style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(52, 211, 153, 0.15)", display: "grid", placeItems: "center" }}>
            <Shield size={16} color="var(--ok)" />
          </div>
          <div>
            <strong style={{ fontSize: "1rem", color: "var(--text-heading)" }}>
              2. Government Scheme Tracking
            </strong>
            <span style={{ fontSize: "0.76rem", color: "var(--muted)", display: "block" }}>
              Direct alerts for PMFME ODOP, MIDH, AIF, and PMEGP subsidy windows
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px", borderRadius: 12, background: "var(--panel-subtle)", border: "1px solid var(--line)" }}>
          <div>
            <strong style={{ display: "block", fontSize: "0.9rem", color: "var(--text-heading)" }}>
              PMFME & Maharashtra State Subsidy Application Triggers
            </strong>
            <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
              Notify when DIC / District Resource Persons open new micro-food processing subsidy slots
            </span>
          </div>
          <button
            type="button"
            onClick={() => toggleSetting("subsidyAlerts")}
            style={{
              width: 44,
              height: 24,
              borderRadius: 999,
              background: settingsState.subsidyAlerts ? "var(--ok)" : "var(--panel-solid)",
              border: `1px solid ${settingsState.subsidyAlerts ? "var(--ok)" : "var(--line)"}`,
              position: "relative",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#fff",
                position: "absolute",
                top: 2,
                left: settingsState.subsidyAlerts ? 22 : 2,
                transition: "all 0.2s ease",
              }}
            />
          </button>
        </div>
      </div>

      {/* 3. Data Storage & Local Cache Control */}
      <div className="card" style={{ padding: "24px 28px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(99, 102, 241, 0.15)", display: "grid", placeItems: "center" }}>
            <Database size={16} color="var(--electric-blue)" />
          </div>
          <div>
            <strong style={{ fontSize: "1rem", color: "var(--text-heading)" }}>
              3. Data Cache & Privacy Management
            </strong>
            <span style={{ fontSize: "0.76rem", color: "var(--muted)", display: "block" }}>
              EntreVision uses offline-first local storage for instant access across wizard steps
            </span>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, padding: "14px 18px", borderRadius: 12, background: "var(--panel-subtle)", border: "1px solid var(--line)" }}>
          <div>
            <strong style={{ display: "block", fontSize: "0.9rem", color: "var(--text-heading)" }}>
              Reset Local Storage & Refresh Sample Assessment
            </strong>
            <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
              Clears browser local state and reloads pristine default Vidarbha profile data
            </span>
          </div>
          <button
            type="button"
            onClick={handleClearCache}
            className="btn-secondary-gloss"
            style={{ padding: "8px 16px", fontSize: "0.82rem", color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.4)" }}
          >
            <Trash2 size={15} /> Reset Local Cache
          </button>
        </div>
      </div>
    </div>
  );
}
