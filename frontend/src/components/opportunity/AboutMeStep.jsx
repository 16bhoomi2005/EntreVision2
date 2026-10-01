import React from "react";
import { ArrowRight, User, GraduationCap, Briefcase, Target, Check, Sparkles, Building } from "lucide-react";

const AGE_GROUPS = ["Under 18", "18–25", "26–35", "36–50", "50+"];

const EDUCATION_OPTIONS = [
  "High School / 10th / 12th",
  "Diploma / Technical Certification",
  "Bachelor's Degree (Graduate)",
  "Master's / Post Graduate",
  "Agricultural / Vocational Training",
  "Self-taught / Experiential Learning",
];

const SITUATION_OPTIONS = [
  { id: "student", label: "Student", icon: "🎓", desc: "Currently studying, exploring future ventures" },
  { id: "looking_opportunity", label: "Looking for a business opportunity", icon: "🔎", desc: "Ready to start, looking for the right fit" },
  { id: "existing_business", label: "Already running a business", icon: "🏢", desc: "Looking to scale, modernize or diversify" },
  { id: "employed", label: "Working / Employed", icon: "💼", desc: "Employed professional transitioning to entrepreneurship" },
  { id: "planning_start", label: "Planning to start a business", icon: "🚀", desc: "Have ideas and preparing capital/resources" },
];

const GOAL_OPTIONS = [
  { id: "first_business", label: "Start my first business", icon: "🌱" },
  { id: "expand_existing", label: "Expand an existing business", icon: "📈" },
  { id: "new_idea", label: "Find a new business idea", icon: "💡" },
  { id: "monetize_resources", label: "Turn my existing resources into a business", icon: "🚜" },
  { id: "explore_local", label: "Explore opportunities in my area", icon: "📍" },
];

export default function AboutMeStep({ data, onChange, onNext }) {
  const {
    fullName = "",
    ageGroup = "18–25",
    education = "",
    currentSituation = "looking_opportunity",
    existingBusinessType = "",
    existingBusinessGoal = "",
    goals = ["first_business", "explore_local"],
  } = data;

  const toggleGoal = (goalId) => {
    const nextGoals = goals.includes(goalId)
      ? goals.filter((g) => g !== goalId)
      : [...goals, goalId];
    onChange({ goals: nextGoals });
  };

  const handleContinue = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleContinue} className="about-me-container">
      {/* Section Header */}
      <div className="wizard-intro-header">
        <h2 className="wizard-main-title">LET'S GET TO KNOW YOU</h2>
        <p className="wizard-main-subtitle">
          This helps us understand what kind of entrepreneur you want to become.
        </p>
      </div>

      {/* Main Glass Form Card */}
      <div className="card wizard-form-card">
        {/* 1. Full Name */}
        <div className="form-group">
          <label className="wizard-field-label">
            <User size={16} color="var(--cyan)" />
            <span>Full Name</span>
          </label>
          <input
            type="text"
            className="glass-input-field"
            placeholder="e.g. Rahul Sharma"
            value={fullName}
            onChange={(e) => onChange({ fullName: e.target.value })}
            required
          />
        </div>

        {/* 2. Age Group */}
        <div className="form-group">
          <label className="wizard-field-label">
            <span>Age Group</span>
          </label>
          <div className="pill-selector-group">
            {AGE_GROUPS.map((grp) => (
              <button
                type="button"
                key={grp}
                className={`pill-option-btn ${ageGroup === grp ? "active" : ""}`}
                onClick={() => onChange({ ageGroup: grp })}
              >
                {grp}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Education */}
        <div className="form-group">
          <label className="wizard-field-label">
            <GraduationCap size={16} color="var(--electric-blue)" />
            <span>Education</span>
          </label>
          <div className="select-wrapper">
            <select
              className="glass-select-field"
              value={education}
              onChange={(e) => onChange({ education: e.target.value })}
            >
              <option value="" disabled>
                Select your highest/current education
              </option>
              {EDUCATION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4. Current Situation */}
        <div className="form-group">
          <label className="wizard-field-label">
            <Briefcase size={16} color="var(--violet)" />
            <span>Current Situation</span>
          </label>
          <div className="situation-grid">
            {SITUATION_OPTIONS.map((opt) => {
              const isSelected = currentSituation === opt.id;
              return (
                <div
                  key={opt.id}
                  className={`situation-card ${isSelected ? "selected" : ""}`}
                  onClick={() => onChange({ currentSituation: opt.id })}
                >
                  <div className="situation-card-header">
                    <span className="situation-icon">{opt.icon}</span>
                    <strong className="situation-title">{opt.label}</strong>
                  </div>
                  <div className="situation-radio-circle">
                    {isSelected && <div className="radio-inner-dot" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dynamic Mentor Context: If Already Running a Business */}
          {currentSituation === "existing_business" && (
            <div className="contextual-subform-box">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Sparkles size={16} color="var(--cyan)" />
                <strong style={{ fontSize: "0.92rem", color: "var(--cyan)" }}>
                  Tailoring EntreVision for your Existing Venture:
                </strong>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label className="wizard-field-label" style={{ fontSize: "0.8rem" }}>
                    What business are you currently running?
                  </label>
                  <input
                    type="text"
                    className="glass-input-field"
                    placeholder="e.g. Citrus Nursery / Mandi Trader"
                    value={existingBusinessType}
                    onChange={(e) => onChange({ existingBusinessType: e.target.value })}
                  />
                </div>
                <div>
                  <label className="wizard-field-label" style={{ fontSize: "0.8rem" }}>
                    What are you trying to improve?
                  </label>
                  <input
                    type="text"
                    className="glass-input-field"
                    placeholder="e.g. Expand capacity / PMFME Subsidy"
                    value={existingBusinessGoal}
                    onChange={(e) => onChange({ existingBusinessGoal: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="form-divider" />

        {/* 5. What are you hoping to achieve? */}
        <div className="form-group">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <label className="wizard-field-label" style={{ margin: 0 }}>
              <Target size={16} color="var(--ok)" />
              <span>What are you hoping to achieve?</span>
            </label>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>
              {goals.length} selected
            </span>
          </div>

          <div className="goals-options-grid">
            {GOAL_OPTIONS.map((g) => {
              const isChecked = goals.includes(g.id);
              return (
                <div
                  key={g.id}
                  className={`goal-checkbox-card ${isChecked ? "checked" : ""}`}
                  onClick={() => toggleGoal(g.id)}
                >
                  <div className="custom-checkbox-square">
                    {isChecked && <Check size={14} strokeWidth={3} />}
                  </div>
                  <span style={{ fontSize: "1.1rem" }}>{g.icon}</span>
                  <span className="goal-label">{g.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <div className="wizard-actions-bar">
          <button type="submit" className="btn-primary-gloss" style={{ marginLeft: "auto", padding: "16px 36px" }}>
            <span>Continue</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </form>
  );
}
