import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  FileCheck,
  Building,
  GraduationCap,
  Award,
  BookOpen,
  Briefcase,
  Layers,
} from "lucide-react";

export const DEFAULT_POPULAR_SKILLS = [
  { id: "SKL01", label: "Farming", icon: "🌱", category: "Agronomy", desc: "Citrus orchard cultivation & pruning" },
  { id: "SKL02", label: "Nursery", icon: "🪴", category: "Horticulture", desc: "Mother plant propagation & budwood grafting" },
  { id: "SKL03", label: "Irrigation", icon: "💧", category: "Infrastructure", desc: "Drip irrigation & fertigation systems" },
  { id: "SKL04", label: "Packing", icon: "📦", category: "Post-Harvest", desc: "Grading, sorting & shellac waxing" },
  { id: "SKL05", label: "Food Processing", icon: "🥤", category: "Manufacturing", desc: "Juice extraction, RTS debittering & squashes" },
  { id: "SKL06", label: "Trading", icon: "💰", category: "Commerce", desc: "APMC wholesale auctioning & fruit brokering" },
  { id: "SKL07", label: "Marketing", icon: "📱", category: "Sales", desc: "Brand packaging, social commerce & retail supply" },
  { id: "SKL08", label: "Logistics", icon: "🚚", category: "Supply Chain", desc: "Reefer transport & cold chain staging" },
];

const PROFICIENCY_LEVELS = ["Beginner", "Intermediate", "Expert"];

const EXPERIENCE_YEARS = [
  "Less than 1 year",
  "1 year",
  "2 years",
  "3–5 years",
  "5+ years",
];

const ACQUISITION_METHODS = [
  { id: "formal_education", label: "Formal education", icon: "🎓" },
  { id: "certification", label: "Training / certification", icon: "📜" },
  { id: "work_experience", label: "Work experience", icon: "💼" },
  { id: "family_business", label: "Family business", icon: "👨‍👩‍👧" },
  { id: "self_taught", label: "Self-taught", icon: "💡" },
  { id: "other", label: "Other", icon: "✨" },
];

const LEARNING_MODES = [
  {
    id: "willing_to_learn",
    title: "Yes, I'm willing to learn new skills",
    desc: "Recommend high-potential ventures even if training is required. Skill gaps will be scheduled into your roadmap.",
    icon: "🚀",
  },
  {
    id: "current_only",
    title: "Only businesses matching my current skills",
    desc: "Filter strictly for turnkey opportunities that you can operate immediately without additional training.",
    icon: "🎯",
  },
  {
    id: "open_to_training",
    title: "Open to government / ICAR-CCRI certified training",
    desc: "Prioritize ventures eligible for PMFME / KVK subsidized incubation and skill-development grants.",
    icon: "🏛️",
  },
];

export default function SkillsStep({
  skillsList = [],
  selectedSkillsData = [],
  willingnessToLearn = "willing_to_learn",
  onChange,
  onNext,
  onBack,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  // Merge backend skills with default popular list
  const availableSkills = useMemo(() => {
    if (skillsList && skillsList.length > 0) {
      return skillsList.map((skl) => ({
        id: skl.skill_id,
        label: skl.user_label || skl.name,
        desc: skl.description || skl.category_group,
        icon: skl.icon || "🌱",
        category: skl.category_group || "Agro",
      }));
    }
    return DEFAULT_POPULAR_SKILLS;
  }, [skillsList]);

  // Filter skills by search query
  const filteredSkills = useMemo(() => {
    if (!searchTerm.trim()) return availableSkills;
    const lower = searchTerm.toLowerCase();
    return availableSkills.filter(
      (s) =>
        s.label.toLowerCase().includes(lower) ||
        (s.desc && s.desc.toLowerCase().includes(lower)) ||
        (s.category && s.category.toLowerCase().includes(lower))
    );
  }, [availableSkills, searchTerm]);

  // Add skill to selected list
  const handleAddSkill = (skill) => {
    const exists = selectedSkillsData.some((s) => s.skillId === skill.id);
    if (exists) return;

    const newSkillEntry = {
      skillId: skill.id,
      name: skill.label,
      icon: skill.icon || "🌱",
      proficiency: "Intermediate",
      yearsExperience: "2 years",
      howAcquired: "Work experience",
      certificateName: "",
      issuingOrg: "",
      certYear: "",
      certFileName: "",
      orgName: "",
      role: "",
      expDuration: "2 years",
      expFileName: "",
      notes: "",
    };

    onChange({ selectedSkillsData: [...selectedSkillsData, newSkillEntry] });
  };

  // Remove skill
  const handleRemoveSkill = (skillId) => {
    onChange({
      selectedSkillsData: selectedSkillsData.filter((s) => s.skillId !== skillId),
    });
  };

  // Update specific skill attribute
  const handleUpdateSkill = (skillId, updates) => {
    onChange({
      selectedSkillsData: selectedSkillsData.map((s) =>
        s.skillId === skillId ? { ...s, ...updates } : s
      ),
    });
  };

  // Dummy file upload simulation
  const handleFileUpload = (skillId, fieldName, file) => {
    if (file) {
      handleUpdateSkill(skillId, { [fieldName]: file.name });
    }
  };

  const handleContinue = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleContinue} className="about-me-container">
      {/* Intro Header */}
      <div className="wizard-intro-header">
        <h2 className="wizard-main-title">YOUR SKILLS & EXPERIENCE</h2>
        <p className="wizard-main-subtitle">
          Tell us what you know and what you can do. EntreVision matches verified opportunities and highlights bridgeable skill gaps.
        </p>
      </div>

      {/* Main Container Card */}
      <div className="card wizard-form-card">
        {/* 1. Skill Search & Quick Select */}
        <div className="form-group">
          <label className="wizard-field-label">
            <Search size={16} color="var(--cyan)" />
            <span>What skills do you have?</span>
          </label>

          <div style={{ position: "relative" }}>
            <input
              type="text"
              className="glass-input-field"
              placeholder="🔍 Search skills (e.g. Food Processing, Grafting, Trading)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: 42 }}
            />
            <Search
              size={18}
              color="var(--muted)"
              style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }}
            />
          </div>
        </div>

        {/* 2. Popular Skills Badges */}
        <div className="form-group">
          <span className="wizard-field-label" style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
            POPULAR SKILLS (Click to Add)
          </span>

          <div className="skills-pill-cloud">
            {filteredSkills.map((sk) => {
              const isSelected = selectedSkillsData.some((s) => s.skillId === sk.id);
              return (
                <button
                  type="button"
                  key={sk.id}
                  className={`skill-chip-btn ${isSelected ? "selected" : ""}`}
                  onClick={() => (isSelected ? handleRemoveSkill(sk.id) : handleAddSkill(sk))}
                >
                  <span>{sk.icon}</span>
                  <span>{sk.label}</span>
                  <span className="chip-action-icon">{isSelected ? "✓" : "+"}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="form-divider" />

        {/* 3. Selected Skills List with 2nd Layer Details */}
        <div className="form-group">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label className="wizard-field-label" style={{ margin: 0 }}>
              <Layers size={16} color="var(--electric-blue)" />
              <span>SELECTED SKILLS ({selectedSkillsData.length})</span>
            </label>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontWeight: 600 }}>
              Detailed Profiling
            </span>
          </div>

          {selectedSkillsData.length === 0 ? (
            <div
              style={{
                padding: "32px 20px",
                textAlign: "center",
                background: "var(--panel-subtle)",
                borderRadius: 16,
                border: "1px dashed var(--line)",
              }}
            >
              <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
                No skills selected yet. Click on the popular skills above or search to add your strengths.
              </p>
            </div>
          ) : (
            <div className="selected-skills-stack">
              {selectedSkillsData.map((item) => (
                <div key={item.skillId} className="skill-detail-card">
                  {/* Skill Card Header */}
                  <div className="skill-card-topbar">
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: "1.4rem" }}>{item.icon}</span>
                      <div>
                        <strong style={{ fontSize: "1.05rem", color: "var(--text-heading)", display: "block" }}>
                          {item.name}
                        </strong>
                        <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
                          <span className="skill-status-tag claimed">✓ Skill Claimed</span>
                          {item.certFileName ? (
                            <span className="skill-status-tag verified">📄 Certificate Attached</span>
                          ) : (
                            <span className="skill-status-tag non-mandatory">💡 Mentorship Ready</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="icon-btn-danger"
                      onClick={() => handleRemoveSkill(item.skillId)}
                      title="Remove skill"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* 1. Proficiency & Years Row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 14 }}>
                    <div>
                      <span className="field-sublabel">Proficiency Level:</span>
                      <div className="pill-selector-group mini">
                        {PROFICIENCY_LEVELS.map((lvl) => (
                          <button
                            type="button"
                            key={lvl}
                            className={`pill-option-btn mini ${item.proficiency === lvl ? "active" : ""}`}
                            onClick={() => handleUpdateSkill(item.skillId, { proficiency: lvl })}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="field-sublabel">Years of Experience:</span>
                      <select
                        className="glass-select-field mini"
                        value={item.yearsExperience}
                        onChange={(e) => handleUpdateSkill(item.skillId, { yearsExperience: e.target.value })}
                      >
                        {EXPERIENCE_YEARS.map((yr) => (
                          <option key={yr} value={yr}>
                            {yr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 2. How Acquired */}
                  <div style={{ marginTop: 14 }}>
                    <span className="field-sublabel">How did you acquire this skill?</span>
                    <div className="acquisition-pill-group">
                      {ACQUISITION_METHODS.map((acq) => (
                        <button
                          type="button"
                          key={acq.id}
                          className={`acquisition-btn ${item.howAcquired === acq.label ? "active" : ""}`}
                          onClick={() => handleUpdateSkill(item.skillId, { howAcquired: acq.label })}
                        >
                          <span>{acq.icon}</span>
                          <span>{acq.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3. Dynamic Acquisition Details: Certification */}
                  {item.howAcquired === "Training / certification" && (
                    <div className="acquisition-subform-box">
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <Award size={15} color="var(--violet)" />
                        <strong style={{ fontSize: "0.85rem", color: "var(--violet)", textTransform: "uppercase" }}>
                          Certification Details (Non-mandatory)
                        </strong>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 0.8fr", gap: 10 }}>
                        <input
                          type="text"
                          className="glass-input-field mini"
                          placeholder="Certificate Name (e.g. CCRI Nursery)"
                          value={item.certificateName}
                          onChange={(e) => handleUpdateSkill(item.skillId, { certificateName: e.target.value })}
                        />
                        <input
                          type="text"
                          className="glass-input-field mini"
                          placeholder="Issuing Org (e.g. ICAR-CCRI)"
                          value={item.issuingOrg}
                          onChange={(e) => handleUpdateSkill(item.skillId, { issuingOrg: e.target.value })}
                        />
                        <input
                          type="text"
                          className="glass-input-field mini"
                          placeholder="Year (e.g. 2023)"
                          value={item.certYear}
                          onChange={(e) => handleUpdateSkill(item.skillId, { certYear: e.target.value })}
                        />
                      </div>

                      {/* File Upload simulation */}
                      <div className="upload-row-box">
                        <label className="upload-glass-btn">
                          <Upload size={14} />
                          <span>{item.certFileName ? `Attached: ${item.certFileName}` : "📎 Upload Certificate (Optional)"}</span>
                          <input
                            type="file"
                            style={{ display: "none" }}
                            onChange={(e) => handleFileUpload(item.skillId, "certFileName", e.target.files[0])}
                          />
                        </label>
                        <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                          Supports PDF, JPG, PNG up to 5MB
                        </span>
                      </div>
                    </div>
                  )}

                  {/* 4. Dynamic Acquisition Details: Work Experience */}
                  {item.howAcquired === "Work experience" && (
                    <div className="acquisition-subform-box">
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <Briefcase size={15} color="var(--cyan)" />
                        <strong style={{ fontSize: "0.85rem", color: "var(--cyan)", textTransform: "uppercase" }}>
                          Work Experience Proof (Non-mandatory)
                        </strong>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 0.8fr", gap: 10 }}>
                        <input
                          type="text"
                          className="glass-input-field mini"
                          placeholder="Organization / Business"
                          value={item.orgName}
                          onChange={(e) => handleUpdateSkill(item.skillId, { orgName: e.target.value })}
                        />
                        <input
                          type="text"
                          className="glass-input-field mini"
                          placeholder="Role (e.g. Packhouse Supervisor)"
                          value={item.role}
                          onChange={(e) => handleUpdateSkill(item.skillId, { role: e.target.value })}
                        />
                        <input
                          type="text"
                          className="glass-input-field mini"
                          placeholder="Duration (e.g. 2 yrs)"
                          value={item.expDuration}
                          onChange={(e) => handleUpdateSkill(item.skillId, { expDuration: e.target.value })}
                        />
                      </div>

                      <div className="upload-row-box">
                        <label className="upload-glass-btn">
                          <Upload size={14} />
                          <span>{item.expFileName ? `Attached: ${item.expFileName}` : "📎 Upload Experience Letter (Optional)"}</span>
                          <input
                            type="file"
                            style={{ display: "none" }}
                            onChange={(e) => handleFileUpload(item.skillId, "expFileName", e.target.files[0])}
                          />
                        </label>
                        <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>
                          Proof allows higher institutional loan confidence
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="form-divider" />

        {/* 4. Willingness to Learn Section */}
        <div className="form-group">
          <label className="wizard-field-label">
            <Sparkles size={16} color="var(--ok)" />
            <span>ARE YOU WILLING TO LEARN NEW SKILLS?</span>
          </label>

          <div className="situation-grid">
            {LEARNING_MODES.map((mode) => {
              const isSelected = willingnessToLearn === mode.id;
              return (
                <div
                  key={mode.id}
                  className={`situation-card ${isSelected ? "selected" : ""}`}
                  onClick={() => onChange({ willingnessToLearn: mode.id })}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    <span style={{ fontSize: "1.3rem", marginTop: 2 }}>{mode.icon}</span>
                    <div>
                      <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)", display: "block" }}>
                        {mode.title}
                      </strong>
                      <p style={{ fontSize: "0.82rem", color: "var(--muted)", margin: "3px 0 0", lineHeight: 1.45 }}>
                        {mode.desc}
                      </p>
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
