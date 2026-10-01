import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSkills, fetchResources, fetchLocations, getRecommendations } from "../services/api";

export default function Assessment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Available options from API
  const [skillsList, setSkillsList] = useState([]);
  const [resourcesList, setResourcesList] = useState([]);
  const [locationsList, setLocationsList] = useState([]);

  // User responses state
  const [location, setLocation] = useState("Katol");
  const [hasLand, setHasLand] = useState(true);
  const [landAcres, setLandAcres] = useState(2.0);
  const [selectedSkills, setSelectedSkills] = useState(["SKL01"]);
  const [selectedResources, setSelectedResources] = useState(["RES01", "RES02"]);
  const [budget, setBudget] = useState(300000);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [s, r, l] = await Promise.all([
          fetchSkills(),
          fetchResources(),
          fetchLocations(),
        ]);
        setSkillsList(s);
        setResourcesList(r);
        setLocationsList(l);
        if (l.length > 0) setLocation(l[0].location_name);
      } catch (err) {
        console.error("Error loading assessment options:", err);
      } finally {
        setDataLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const toggleSkill = (skillId) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  const toggleResource = (resId) => {
    setSelectedResources((prev) =>
      prev.includes(resId) ? prev.filter((id) => id !== resId) : [...prev, resId]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        location,
        budget_inr: parseFloat(budget),
        has_land: hasLand,
        land_acres: hasLand ? parseFloat(landAcres) : 0.0,
        skills: selectedSkills,
        resources: selectedResources,
      };
      const results = await getRecommendations(payload);
      navigate("/results", { state: { results, userInput: payload } });
    } catch (err) {
      alert("Error calculating recommendations: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <p style={{ fontSize: "1.25rem", color: "var(--text-muted)" }}>
          Loading assessment data...
        </p>
      </div>
    );
  }

  return (
    <div className="wizard-container">
      {/* Step Indicators */}
      <div className="wizard-progress">
        {[
          { num: 1, label: "Location & Land" },
          { num: 2, label: "Skills" },
          { num: 3, label: "Resources" },
          { num: 4, label: "Budget" },
          { num: 5, label: "Review" },
        ].map((s) => (
          <div key={s.num} className="step-indicator">
            <div
              className={`step-circle ${
                step === s.num ? "active" : step > s.num ? "completed" : ""
              }`}
            >
              {step > s.num ? "✓" : s.num}
            </div>
            <span className="step-title">{s.label}</span>
          </div>
        ))}
      </div>

      {/* STEP 1: Location & Land */}
      {step === 1 && (
        <div>
          <div className="wizard-header">
            <h2>Where are you based and do you have land?</h2>
            <p style={{ color: "var(--text-muted)" }}>
              Location determines proximity to APMC markets, cold storages, and transport corridors.
            </p>
          </div>

          <div style={{ marginBottom: "1.5rem", textAlign: "left" }}>
            <label style={{ fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>
              Select your Nagpur / Vidarbha Micro-Location:
            </label>
            <select
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
                fontSize: "1rem",
              }}
            >
              {locationsList.map((loc) => (
                <option key={loc.location_id} value={loc.location_name}>
                  {loc.location_name} ({loc.cluster_type} - {loc.distance_from_nagpur_km} km)
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "1.5rem", textAlign: "left" }}>
            <label style={{ fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>
              Do you own or lease agricultural or industrial land?
            </label>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button
                type="button"
                className={`btn-secondary-outline ${hasLand ? "active" : ""}`}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  background: hasLand ? "var(--primary-light)" : "#fff",
                  borderColor: hasLand ? "var(--primary)" : "var(--border-color)",
                  color: hasLand ? "var(--primary)" : "var(--text-main)",
                  fontWeight: 700,
                }}
                onClick={() => setHasLand(true)}
              >
                🌱 Yes, I have Land
              </button>
              <button
                type="button"
                className={`btn-secondary-outline ${!hasLand ? "active" : ""}`}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  background: !hasLand ? "var(--primary-light)" : "#fff",
                  borderColor: !hasLand ? "var(--primary)" : "var(--border-color)",
                  color: !hasLand ? "var(--primary)" : "var(--text-main)",
                  fontWeight: 700,
                }}
                onClick={() => setHasLand(false)}
              >
                🏢 No Land (Asset-Light / Rental)
              </button>
            </div>
          </div>

          {hasLand && (
            <div style={{ marginBottom: "1.5rem", textAlign: "left" }}>
              <label style={{ fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>
                Total Available Land Area (in Acres):
              </label>
              <input
                type="number"
                min="0.25"
                step="0.5"
                value={landAcres}
                onChange={(e) => setLandAcres(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border-color)",
                  fontSize: "1rem",
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Skills */}
      {step === 2 && (
        <div>
          <div className="wizard-header">
            <h2>What skills or experience do you have?</h2>
            <p style={{ color: "var(--text-muted)" }}>
              Select any skills that apply to you or your team (Select all that apply).
            </p>
          </div>

          <div className="selection-grid">
            {skillsList.map((skl) => {
              const isSelected = selectedSkills.includes(skl.skill_id);
              return (
                <div
                  key={skl.skill_id}
                  className={`selection-card ${isSelected ? "selected" : ""}`}
                  onClick={() => toggleSkill(skl.skill_id)}
                >
                  <div className="card-title">
                    <span>{skl.user_label}</span>
                    <span>{isSelected ? "✅" : "➕"}</span>
                  </div>
                  <div className="card-desc">{skl.category}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: Resources */}
      {step === 3 && (
        <div>
          <div className="wizard-header">
            <h2>What physical resources or equipment do you have access to?</h2>
            <p style={{ color: "var(--text-muted)" }}>
              Existing resources reduce capital expenditure and increase your feasibility score.
            </p>
          </div>

          <div className="selection-grid">
            {resourcesList.map((res) => {
              const isSelected = selectedResources.includes(res.resource_id);
              return (
                <div
                  key={res.resource_id}
                  className={`selection-card ${isSelected ? "selected" : ""}`}
                  onClick={() => toggleResource(res.resource_id)}
                >
                  <div className="card-title">
                    <span>{res.user_label}</span>
                    <span>{isSelected ? "✅" : "➕"}</span>
                  </div>
                  <div className="card-desc">{res.category}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 4: Budget */}
      {step === 4 && (
        <div>
          <div className="wizard-header">
            <h2>What is your intended investment capacity?</h2>
            <p style={{ color: "var(--text-muted)" }}>
              Your equity will be matched with credit-linked government subsidies (PMFME / MIDH).
            </p>
          </div>

          <div style={{ textAlign: "center", margin: "2rem 0" }}>
            <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--primary)" }}>
              ₹{Number(budget).toLocaleString("en-IN")}
            </div>
            <p style={{ color: "var(--text-muted)", marginTop: "0.25rem" }}>
              Initial Capital / Own Equity
            </p>
          </div>

          {/* Quick preset chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", justifyContent: "center", marginBottom: "2rem" }}>
            {[50000, 100000, 300000, 500000, 1000000, 2500000, 5000000].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setBudget(val)}
                className={`btn-secondary-outline ${budget === val ? "active" : ""}`}
                style={{
                  background: budget === val ? "var(--primary)" : "#fff",
                  color: budget === val ? "#fff" : "var(--text-main)",
                  borderColor: budget === val ? "var(--primary)" : "var(--border-color)",
                }}
              >
                ₹{val >= 100000 ? `${val / 100000} Lakh${val >= 200000 ? "s" : ""}` : `${val / 1000}k`}
              </button>
            ))}
          </div>

          <div style={{ textAlign: "left" }}>
            <label style={{ fontWeight: 600, display: "block", marginBottom: "0.5rem" }}>
              Or enter custom budget (₹ INR):
            </label>
            <input
              type="number"
              min="10000"
              step="50000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-color)",
                fontSize: "1rem",
              }}
            />
          </div>
        </div>
      )}

      {/* STEP 5: Review */}
      {step === 5 && (
        <div>
          <div className="wizard-header">
            <h2>Ready to Discover Your Best Matches</h2>
            <p style={{ color: "var(--text-muted)" }}>
              Here is a summary of your profile before running the Decision Support engine.
            </p>
          </div>

          <div style={{ background: "#f8fafc", padding: "1.5rem", borderRadius: "var(--radius-md)", textAlign: "left", marginBottom: "1.5rem" }}>
            <div style={{ marginBottom: "0.75rem" }}>
              <strong>📍 Location:</strong> {location} {hasLand ? `(${landAcres} Acres Land Available)` : "(No Land)"}
            </div>
            <div style={{ marginBottom: "0.75rem" }}>
              <strong>💰 Investment Capacity:</strong> ₹{Number(budget).toLocaleString("en-IN")}
            </div>
            <div style={{ marginBottom: "0.75rem" }}>
              <strong>🌱 Selected Skills ({selectedSkills.length}):</strong>{" "}
              {selectedSkills.length > 0 ? `${selectedSkills.length} skills selected` : "None"}
            </div>
            <div>
              <strong>🏢 Selected Resources ({selectedResources.length}):</strong>{" "}
              {selectedResources.length > 0 ? `${selectedResources.length} resources selected` : "None"}
            </div>
          </div>
        </div>
      )}

      {/* Wizard Actions Footer */}
      <div className="wizard-actions">
        {step > 1 ? (
          <button type="button" className="btn-prev" onClick={() => setStep(step - 1)}>
            ← Back
          </button>
        ) : (
          <div />
        )}

        {step < 5 ? (
          <button type="button" className="btn-next" onClick={() => setStep(step + 1)}>
            Next Step →
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary-large"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? "Evaluating Matches..." : "🚀 Calculate My Best Matches"}
          </button>
        )}
      </div>
    </div>
  );
}
