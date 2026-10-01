import React from "react";
import { Settings as SettingsIcon, Bell, Moon, Shield, Sliders } from "lucide-react";

export default function Settings() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 860, margin: "0 auto", width: "100%" }}>
      <div className="card" style={{ padding: "36px 32px" }}>
        <div className="glowing-pill" style={{ marginBottom: 12 }}>
          <SettingsIcon size={14} color="var(--electric-blue)" />
          <span>System Preferences</span>
        </div>
        <h2 style={{ fontSize: "1.75rem", marginBottom: 8 }}>Settings & Preferences</h2>
        <p className="muted" style={{ margin: 0 }}>
          Manage your account preferences, local agro-data caching, and notifications.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderRadius: 14, background: "var(--panel-subtle)", border: "1px solid var(--line)" }}>
            <div>
              <strong style={{ display: "block", fontSize: "0.95rem" }}>Live Mandi APMC Rate Alerts</strong>
              <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Receive daily price updates for Kalamna and Katol citrus markets</span>
            </div>
            <input type="checkbox" defaultChecked style={{ width: 20, height: 20, accentColor: "var(--accent)" }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderRadius: 14, background: "var(--panel-subtle)", border: "1px solid var(--line)" }}>
            <div>
              <strong style={{ display: "block", fontSize: "0.95rem" }}>PMFME & MIDH Scheme Notifications</strong>
              <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Get alerts when new subsidy windows open for Nagpur orange cluster</span>
            </div>
            <input type="checkbox" defaultChecked style={{ width: 20, height: 20, accentColor: "var(--accent)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
