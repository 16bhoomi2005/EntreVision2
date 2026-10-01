import React, { useState } from "react";
import {
  Sprout,
  Building2,
  Truck,
  Snowflake,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Zap,
  Droplets,
  Tractor,
  Layers,
  Store,
  Info,
} from "lucide-react";

export const DEFAULT_RESOURCE_STATE = {
  // 1. Land & Agro Space
  hasLand: true,
  landAcres: 2.5,
  landOwnership: "owned", // owned | family | leased | shared
  waterSources: ["borewell", "drip_irrigation"], // borewell | drip_irrigation | canal | rainfed
  landLocationNote: "Katol Taluka, Nagpur",

  // 2. Workspace & Building
  hasWorkspace: true,
  workspaceType: "shed", // shed | shop | workshop | factory | farm_structure
  workspaceAreaSqFt: 1500,
  powerType: "three_phase", // three_phase | solar | single_phase | off_grid

  // 3. Transport
  transportModes: [
    { type: "tractor", label: "Farm Tractor & Trolley", availability: "owned" },
    { type: "mini_truck", label: "Mini-Truck (Bolero/Ace)", availability: "rent" },
  ],

  // 4. Equipment & Storage
  equipmentList: [
    { id: "dry_storage", name: "Dry Storage Godown / Shed", availability: "owned", icon: "🏠" },
    { id: "cold_storage", name: "Cold Storage & Pre-Cooling", availability: "nearby", icon: "❄️" },
    { id: "grading_line", name: "Sorting & Shellac Waxing Line", availability: "nearby", icon: "📦" },
    { id: "juice_extractor", name: "Juice Extractor / Pulper", availability: "can_acquire", icon: "🥤" },
  ],

  // 5. Existing Business / Setup
  existingSetupStatus: "active_business", // none | active_business | equipment_only
  existingBusinessDesc: "Nagpur mandarin orchard (400 trees) with seasonal mandi sales",
  existingBusinessStage: "expanding", // operating | starting | expanding | seasonal_inactive
};

const WATER_OPTIONS = [
  { id: "borewell", label: "Reliable Borewell / Tube Well", icon: "💧" },
  { id: "drip_irrigation", label: "Drip / Micro-Irrigation Line", icon: "🌱" },
  { id: "canal", label: "Canal / Farm Pond / Well", icon: "🌊" },
  { id: "rainfed", label: "Rain-fed Only", icon: "🌧️" },
];

const POWER_OPTIONS = [
  { id: "three_phase", label: "3-Phase Commercial / Agro Power", icon: "⚡" },
  { id: "solar", label: "Solar Powered (Off-grid / Hybrid)", icon: "☀️" },
  { id: "single_phase", label: "Single-Phase Domestic Power", icon: "🔌" },
];

const TRANSPORT_CATALOG = [
  { type: "two_wheeler", label: "Two-Wheeler (Field Commute)", icon: "🛵" },
  { type: "tractor", label: "Farm Tractor & Trolley", icon: "🚜" },
  { type: "mini_truck", label: "Mini-Truck / Pick-up", icon: "🛻" },
  { type: "freight_truck", label: "Commercial Freight Truck", icon: "🚚" },
  { type: "reefer", label: "Refrigerated Reefer Van", icon: "❄️🚚" },
];

const EQUIPMENT_CATALOG = [
  { id: "dry_storage", name: "Dry Storage Godown / Pack Shed", icon: "🏠" },
  { id: "cold_storage", name: "Cold Storage / Pre-Cooling Unit", icon: "❄️" },
  { id: "grading_line", name: "Grading, Sorting & Waxing Unit", icon: "📦" },
  { id: "juice_extractor", name: "Citrus Juice Extraction / Debittering Unit", icon: "🥤" },
  { id: "polyhouse", name: "Polyhouse / Green Shade Netting", icon: "🪴" },
  { id: "peel_oil_unit", name: "Cold-Pressed Citrus Peel Oil Extractor", icon: "🧪" },
];

const AVAILABILITY_LEVELS = [
  { id: "owned", label: "I Own It", badgeClass: "owned" },
  { id: "accessible", label: "Family / Partner Access", badgeClass: "accessible" },
  { id: "nearby", label: "Available Nearby (APMC/Hub)", badgeClass: "nearby" },
  { id: "can_acquire", label: "Can Rent / Lease", badgeClass: "rent" },
];

export default function ResourcesStep({
  resourcesData = DEFAULT_RESOURCE_STATE,
  onChange,
  onNext,
  onBack,
}) {
  const data = { ...DEFAULT_RESOURCE_STATE, ...resourcesData };

  // Water source toggle
  const toggleWater = (id) => {
    const current = data.waterSources || [];
    const next = current.includes(id)
      ? current.filter((w) => w !== id)
      : [...current, id];
    onChange({ resourcesData: { ...data, waterSources: next } });
  };

  // Add / Toggle Transport
  const toggleTransportMode = (item) => {
    const list = data.transportModes || [];
    const exists = list.find((t) => t.type === item.type);
    let nextList;
    if (exists) {
      nextList = list.filter((t) => t.type !== item.type);
    } else {
      nextList = [...list, { type: item.type, label: item.label, availability: "owned" }];
    }
    onChange({ resourcesData: { ...data, transportModes: nextList } });
  };

  // Update Transport availability
  const updateTransportAvailability = (type, availability) => {
    const list = (data.transportModes || []).map((t) =>
      t.type === type ? { ...t, availability } : t
    );
    onChange({ resourcesData: { ...data, transportModes: list } });
  };

  // Add / Toggle Equipment
  const toggleEquipment = (item) => {
    const list = data.equipmentList || [];
    const exists = list.find((e) => e.id === item.id);
    let nextList;
    if (exists) {
      nextList = list.filter((e) => e.id !== item.id);
    } else {
      nextList = [...list, { id: item.id, name: item.name, availability: "owned", icon: item.icon }];
    }
    onChange({ resourcesData: { ...data, equipmentList: nextList } });
  };

  // Update Equipment availability
  const updateEquipmentAvailability = (id, availability) => {
    const list = (data.equipmentList || []).map((e) =>
      e.id === id ? { ...e, availability } : e
    );
    onChange({ resourcesData: { ...data, equipmentList: list } });
  };

  const handleContinue = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleContinue} className="about-me-container">
      {/* Intro Header */}
      <div className="wizard-intro-header">
        <h2 className="wizard-main-title">WHAT DO YOU ALREADY HAVE?</h2>
        <p className="wizard-main-subtitle">
          Your existing land, equipment, transport, and facilities determine which business models are most practical and cost-effective.
        </p>
      </div>

      {/* Main Glass Container */}
      <div className="card wizard-form-card">
        {/* ====================================================================
            1. 🌾 LAND & AGRO SPACE
           ==================================================================== */}
        <div className="doc-category-box">
          <div className="doc-category-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Sprout size={20} color="var(--ok)" />
              <div>
                <strong style={{ fontSize: "1.05rem", color: "var(--text-heading)" }}>
                  🌾 LAND & FARM SPACE
                </strong>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                  Agricultural acreage, orchard land, or commercial plots
                </span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="wizard-field-label">Do you have access to land?</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button
                type="button"
                className={`pill-option-btn ${data.hasLand ? "active" : ""}`}
                style={{ justifyContent: "center", display: "flex" }}
                onClick={() => onChange({ resourcesData: { ...data, hasLand: true } })}
              >
                🌱 Yes, I have land
              </button>
              <button
                type="button"
                className={`pill-option-btn ${!data.hasLand ? "active" : ""}`}
                style={{ justifyContent: "center", display: "flex" }}
                onClick={() => onChange({ resourcesData: { ...data, hasLand: false } })}
              >
                🏢 No land (Asset-Light / Rental)
              </button>
            </div>
          </div>

          {data.hasLand && (
            <div className="contextual-subform-box" style={{ marginTop: 6 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1.4fr", gap: 12 }}>
                <div>
                  <label className="field-sublabel">Land Available (Acres)</label>
                  <input
                    type="number"
                    min="0.25"
                    step="0.25"
                    className="glass-input-field mini"
                    value={data.landAcres}
                    onChange={(e) =>
                      onChange({ resourcesData: { ...data, landAcres: parseFloat(e.target.value) || 0 } })
                    }
                  />
                </div>

                <div>
                  <label className="field-sublabel">Ownership Type</label>
                  <select
                    className="glass-select-field mini"
                    value={data.landOwnership}
                    onChange={(e) =>
                      onChange({ resourcesData: { ...data, landOwnership: e.target.value } })
                    }
                  >
                    <option value="owned">Owned by Self</option>
                    <option value="family">Family / Ancestral Owned</option>
                    <option value="leased">Leased (Long Term)</option>
                    <option value="shared">Shared / Partnership</option>
                  </select>
                </div>

                <div>
                  <label className="field-sublabel">Location / Cluster</label>
                  <input
                    type="text"
                    className="glass-input-field mini"
                    placeholder="e.g. Katol, Narkhed, Kalmeshwar"
                    value={data.landLocationNote}
                    onChange={(e) =>
                      onChange({ resourcesData: { ...data, landLocationNote: e.target.value } })
                    }
                  />
                </div>
              </div>

              {/* Water & Irrigation Sub-group */}
              <div style={{ marginTop: 14 }}>
                <span className="field-sublabel">Water Sources & Irrigation Available:</span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
                  {WATER_OPTIONS.map((w) => {
                    const isSelected = (data.waterSources || []).includes(w.id);
                    return (
                      <div
                        key={w.id}
                        className={`goal-checkbox-card ${isSelected ? "checked" : ""}`}
                        style={{ padding: "8px 12px", fontSize: "0.82rem" }}
                        onClick={() => toggleWater(w.id)}
                      >
                        <div className="custom-checkbox-square" style={{ width: 16, height: 16 }}>
                          {isSelected && <span style={{ fontSize: "0.7rem" }}>✓</span>}
                        </div>
                        <span>{w.icon}</span>
                        <span>{w.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ====================================================================
            2. 🏭 WORKSPACE & POWER
           ==================================================================== */}
        <div className="doc-category-box">
          <div className="doc-category-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Building2 size={20} color="var(--electric-blue)" />
              <div>
                <strong style={{ fontSize: "1.05rem", color: "var(--text-heading)" }}>
                  🏭 WORKSPACE & INFRASTRUCTURE
                </strong>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                  Covered shed, packhouse floor, power connection, and workshop area
                </span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="wizard-field-label">Do you have a covered workspace / shed?</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button
                type="button"
                className={`pill-option-btn ${data.hasWorkspace ? "active" : ""}`}
                style={{ justifyContent: "center", display: "flex" }}
                onClick={() => onChange({ resourcesData: { ...data, hasWorkspace: true } })}
              >
                🏢 Yes, I have workspace
              </button>
              <button
                type="button"
                className={`pill-option-btn ${!data.hasWorkspace ? "active" : ""}`}
                style={{ justifyContent: "center", display: "flex" }}
                onClick={() => onChange({ resourcesData: { ...data, hasWorkspace: false } })}
              >
                ○ No dedicated building yet
              </button>
            </div>
          </div>

          {data.hasWorkspace && (
            <div className="contextual-subform-box" style={{ marginTop: 6 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1.4fr", gap: 12 }}>
                <div>
                  <label className="field-sublabel">Workspace Type</label>
                  <select
                    className="glass-select-field mini"
                    value={data.workspaceType}
                    onChange={(e) =>
                      onChange({ resourcesData: { ...data, workspaceType: e.target.value } })
                    }
                  >
                    <option value="shed">Work Shed / Godown</option>
                    <option value="shop">Retail Shop / Roadside Outlet</option>
                    <option value="workshop">Machinery Workshop</option>
                    <option value="factory">Food-Grade Processing Unit</option>
                    <option value="farm_structure">Farm-Gate Packhouse Structure</option>
                  </select>
                </div>

                <div>
                  <label className="field-sublabel">Approx Area (Sq. Ft.)</label>
                  <input
                    type="number"
                    min="100"
                    step="100"
                    className="glass-input-field mini"
                    value={data.workspaceAreaSqFt}
                    onChange={(e) =>
                      onChange({ resourcesData: { ...data, workspaceAreaSqFt: parseInt(e.target.value) || 0 } })
                    }
                  />
                </div>

                <div>
                  <label className="field-sublabel">Electricity Supply</label>
                  <select
                    className="glass-select-field mini"
                    value={data.powerType}
                    onChange={(e) =>
                      onChange({ resourcesData: { ...data, powerType: e.target.value } })
                    }
                  >
                    {POWER_OPTIONS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ====================================================================
            3. 🚚 TRANSPORTATION MODES & AVAILABILITY LEVEL
           ==================================================================== */}
        <div className="doc-category-box">
          <div className="doc-category-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Truck size={20} color="var(--cyan)" />
              <div>
                <strong style={{ fontSize: "1.05rem", color: "var(--text-heading)" }}>
                  🚚 LOGISTICS & VEHICLE ACCESS
                </strong>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                  Categorize vehicles as Owned, Family Accessible, or Hirable
                </span>
              </div>
            </div>
          </div>

          <div className="skills-pill-cloud">
            {TRANSPORT_CATALOG.map((item) => {
              const selectedEntry = (data.transportModes || []).find((t) => t.type === item.type);
              const isSelected = !!selectedEntry;
              return (
                <button
                  type="button"
                  key={item.type}
                  className={`skill-chip-btn ${isSelected ? "selected" : ""}`}
                  onClick={() => toggleTransportMode(item)}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  <span className="chip-action-icon">{isSelected ? "✓" : "+"}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Transport Items with Availability Level */}
          {(data.transportModes || []).length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              {(data.transportModes || []).map((t) => (
                <div key={t.type} className="resource-availability-row">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Truck size={16} color="var(--cyan)" />
                    <strong style={{ fontSize: "0.88rem", color: "var(--text-heading)" }}>{t.label}</strong>
                  </div>

                  <div className="availability-segmented-group">
                    {AVAILABILITY_LEVELS.map((lvl) => (
                      <button
                        type="button"
                        key={lvl.id}
                        className={`availability-pill-btn ${t.availability === lvl.id ? `active ${lvl.badgeClass}` : ""}`}
                        onClick={() => updateTransportAvailability(t.type, lvl.id)}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ====================================================================
            4. ❄️ STORAGE & EQUIPMENT INFRASTRUCTURE
           ==================================================================== */}
        <div className="doc-category-box">
          <div className="doc-category-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Snowflake size={20} color="var(--violet)" />
              <div>
                <strong style={{ fontSize: "1.05rem", color: "var(--text-heading)" }}>
                  ❄️ STORAGE & PROCESSING EQUIPMENT
                </strong>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                  Cold chain, sorting lines, juice extraction, and value-addition gear
                </span>
              </div>
            </div>
          </div>

          <div className="skills-pill-cloud">
            {EQUIPMENT_CATALOG.map((item) => {
              const selectedEntry = (data.equipmentList || []).find((e) => e.id === item.id);
              const isSelected = !!selectedEntry;
              return (
                <button
                  type="button"
                  key={item.id}
                  className={`skill-chip-btn ${isSelected ? "selected" : ""}`}
                  onClick={() => toggleEquipment(item)}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                  <span className="chip-action-icon">{isSelected ? "✓" : "+"}</span>
                </button>
              );
            })}
          </div>

          {/* Selected Equipment with Smart Status */}
          {(data.equipmentList || []).length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
              {(data.equipmentList || []).map((e) => (
                <div key={e.id} className="resource-availability-row">
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: "1.1rem" }}>{e.icon}</span>
                    <strong style={{ fontSize: "0.88rem", color: "var(--text-heading)" }}>{e.name}</strong>
                  </div>

                  <div className="availability-segmented-group">
                    {AVAILABILITY_LEVELS.map((lvl) => (
                      <button
                        type="button"
                        key={lvl.id}
                        className={`availability-pill-btn ${e.availability === lvl.id ? `active ${lvl.badgeClass}` : ""}`}
                        onClick={() => updateEquipmentAvailability(e.id, lvl.id)}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ====================================================================
            5. 🏢 EXISTING BUSINESS & OPERATIONAL SETUP
           ==================================================================== */}
        <div className="doc-category-box">
          <div className="doc-category-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Store size={20} color="var(--ok)" />
              <div>
                <strong style={{ fontSize: "1.05rem", color: "var(--text-heading)" }}>
                  🏢 EXISTING BUSINESS / ORCHARD SETUP
                </strong>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                  Help EntreVision build on top of your existing agricultural or trade operations
                </span>
              </div>
            </div>
          </div>

          <div className="situation-grid">
            {[
              { id: "none", title: "I don't have an existing business", desc: "First-time entrepreneur starting from a fresh venture blueprint" },
              { id: "active_business", title: "I already have an active business / orchard", desc: "Currently operating orange orchards, nursery, packing, or trade unit" },
              { id: "equipment_only", title: "I have unused land or idle machinery", desc: "Looking to monetize existing infrastructure with a high-margin business model" },
            ].map((opt) => {
              const isSelected = data.existingSetupStatus === opt.id;
              return (
                <div
                  key={opt.id}
                  className={`situation-card ${isSelected ? "selected" : ""}`}
                  onClick={() => onChange({ resourcesData: { ...data, existingSetupStatus: opt.id } })}
                >
                  <div>
                    <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)", display: "block" }}>{opt.title}</strong>
                    <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{opt.desc}</span>
                  </div>
                  <div className="situation-radio-circle">
                    {isSelected && <div className="radio-inner-dot" />}
                  </div>
                </div>
              );
            })}
          </div>

          {data.existingSetupStatus !== "none" && (
            <div className="contextual-subform-box" style={{ marginTop: 10 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 12 }}>
                <div>
                  <label className="field-sublabel">Describe your current operations & assets:</label>
                  <input
                    type="text"
                    className="glass-input-field mini"
                    placeholder="e.g. 4-acre mandarin orchard in Katol, borewell, 400 bearing trees"
                    value={data.existingBusinessDesc}
                    onChange={(e) =>
                      onChange({ resourcesData: { ...data, existingBusinessDesc: e.target.value } })
                    }
                  />
                </div>

                <div>
                  <label className="field-sublabel">Current Business Stage:</label>
                  <select
                    className="glass-select-field mini"
                    value={data.existingBusinessStage}
                    onChange={(e) =>
                      onChange({ resourcesData: { ...data, existingBusinessStage: e.target.value } })
                    }
                  >
                    <option value="operating">Operating & Stable</option>
                    <option value="expanding">Expanding / Modernizing</option>
                    <option value="starting">Early Stage Setup</option>
                    <option value="seasonal_inactive">Seasonally Inactive (Seeking Value-Add)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ====================================================================
            6. SMART RESOURCE GAP & LEVERAGE SUMMARY CARD
           ==================================================================== */}
        <div className="doc-center-highlight-box">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Sparkles size={18} color="var(--ok)" />
            <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)", textTransform: "uppercase" }}>
              💡 SMART RESOURCE PROFILE DETECTED
            </strong>
          </div>

          <p style={{ fontSize: "0.82rem", color: "var(--muted)", margin: "0 0 10px 0", lineHeight: 1.5 }}>
            EntreVision's decision engine will calculate exact CapEx savings by leveraging your owned land and nearby cluster infrastructure (e.g. Katol Cold Stores & Kalamna APMC Mandi).
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <span className="skill-status-tag verified">✓ Land Asset Ready</span>
            <span className="skill-status-tag verified">✓ Water & 3-Phase Power Active</span>
            <span className="skill-status-tag claimed">🚚 Logistics Adaptable</span>
            <span className="skill-status-tag non-mandatory">❄️ Cold Chain Via Cluster Facility</span>
          </div>
        </div>

        {/* Navigation Action Buttons */}
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
