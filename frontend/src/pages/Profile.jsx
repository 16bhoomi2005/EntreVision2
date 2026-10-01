import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  User,
  MapPin,
  Briefcase,
  Award,
  Shield,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Upload,
  Plus,
  Trash2,
  Edit3,
  Save,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
  Coins,
  Sprout,
  Building2,
  Layers,
  Calendar,
  Check,
  ArrowRight,
  ChevronRight,
  Tag,
  Info,
  X,
  HelpCircle,
  Truck,
  Snowflake,
  ExternalLink
} from "lucide-react";

// ============================================================================
// DEFENSIVE NORMALIZATION HELPERS (BRIDGES WIZARD DATA & PROFILE HUB)
// ============================================================================

function normalizeAboutMe(raw) {
  const fallback = {
    fullName: "Bhoomika Vaishya",
    education: "Engineering (B.Tech / Agritech Focus)",
    currentSituation: "Planning to start a business",
    goals: ["Start my first business", "Use my existing resources", "Find a new business idea"],
  };

  if (!raw || typeof raw !== "object") return fallback;

  return {
    fullName: raw.fullName || fallback.fullName,
    education: raw.education || fallback.education,
    currentSituation: raw.currentSituation || fallback.currentSituation,
    goals: Array.isArray(raw.goals) ? raw.goals : fallback.goals,
  };
}

function normalizeSkills(raw) {
  const fallbackSkills = [
    { id: "s1", name: "Farming & Orchard Management", level: "Intermediate", years: "2 Years", icon: "🌱" },
    { id: "s2", name: "Digital Marketing & D2C Branding", level: "Beginner", years: "1 Year", icon: "📱" },
    { id: "s3", name: "Programming & Technology Systems", level: "Intermediate", years: "2 Years", icon: "💻" },
  ];

  if (!raw) return { skills: fallbackSkills, channels: ["Education", "Training", "Family business"], willingToLearn: "Yes" };

  if (Array.isArray(raw)) {
    const list = raw.map((item, idx) => ({
      id: item.skillId || item.id || `s_${idx}`,
      name: item.name || item.label || "Agro Skill",
      level: item.proficiency || item.level || "Intermediate",
      years: item.yearsExperience || item.years || "1 Year",
      icon: item.icon || "🌱",
    }));
    return {
      skills: list.length > 0 ? list : fallbackSkills,
      channels: ["Education", "Training", "Family business"],
      willingToLearn: "Yes",
    };
  }

  if (typeof raw === "object" && Array.isArray(raw.skills)) {
    return {
      skills: raw.skills,
      channels: Array.isArray(raw.channels) ? raw.channels : ["Education", "Training"],
      willingToLearn: raw.willingToLearn || "Yes",
    };
  }

  return { skills: fallbackSkills, channels: ["Education", "Training"], willingToLearn: "Yes" };
}

function normalizeDocuments(raw) {
  const fallbackDocs = [
    {
      id: "doc_1",
      name: "Agricultural Training Certificate",
      type: "Certificate",
      relatedSkill: "Farming",
      issuedBy: "Regional Agri College",
      status: "Added",
      year: "2026",
    },
    {
      id: "doc_2",
      name: "Food Processing Certificate",
      type: "Certificate",
      relatedSkill: "Food Processing",
      issuedBy: "Food Tech Academy",
      status: "Added",
      year: "2025",
    },
    {
      id: "doc_3",
      name: "Land Document (7/12 Extract)",
      type: "Land Document",
      relatedSkill: "Property Title",
      issuedBy: "Maharashtra Revenue Dept",
      status: "Added",
      year: "2026",
    },
    {
      id: "doc_4",
      name: "Business Registration (Udyam MSME)",
      type: "Official Registration",
      relatedSkill: "Business Setup",
      issuedBy: "Ministry of MSME",
      status: "Needs Attention",
      year: "Pending Filing",
    },
  ];

  if (!raw) return fallbackDocs;

  if (Array.isArray(raw)) {
    return raw.map((d, idx) => ({
      id: d.id || `doc_${idx}`,
      name: d.name || "Official Document",
      type: d.type || "Document",
      relatedSkill: d.relatedSkill || d.skill || "Business Setup",
      issuedBy: d.issuedBy || d.org || "Govt Authority",
      status: d.status === "added" || d.status === "Added" ? "Added" : "Needs Attention",
      year: d.year || "2026",
    }));
  }

  if (typeof raw === "object") {
    const list = [];
    if (Array.isArray(raw.certificates)) {
      raw.certificates.forEach((c, idx) => {
        list.push({
          id: c.id || `cert_${idx}`,
          name: c.name || "Training Certificate",
          type: "Certificate",
          relatedSkill: c.skill || "Horticulture",
          issuedBy: c.org || "Accredited Institute",
          status: c.status === "added" ? "Added" : "Needs Attention",
          year: c.year || "2025",
        });
      });
    }
    if (Array.isArray(raw.experience)) {
      raw.experience.forEach((e, idx) => {
        list.push({
          id: e.id || `exp_${idx}`,
          name: `${e.duration || "2 Years"} Experience — ${e.org || "Agro Venture"}`,
          type: "Experience",
          relatedSkill: e.role || "Operations",
          issuedBy: e.org || "Employer",
          status: "Added",
          year: e.duration || "2 Years",
        });
      });
    }
    if (Array.isArray(raw.licenses)) {
      raw.licenses.forEach((l, idx) => {
        list.push({
          id: l.id || `lic_${idx}`,
          name: l.name || "Business License",
          type: "Official Registration",
          relatedSkill: "Regulatory",
          issuedBy: l.authority || "State Govt",
          status: l.status === "added" ? "Added" : "Needs Attention",
          year: "Active",
        });
      });
    }
    if (list.length > 0) return list;
  }

  return fallbackDocs;
}

function normalizeResources(raw) {
  const fallback = {
    resources: [
      { id: "r1", name: "Farm Land", status: "✓ I own it", icon: "🌱", available: true },
      { id: "r2", name: "Water Source", status: "✓ Available", icon: "💧", available: true },
      { id: "r3", name: "Work Shed", status: "✓ I have access", icon: "🏠", available: true },
      { id: "r4", name: "Transport Vehicle", status: "○ Not available", icon: "🚚", available: false },
      { id: "r5", name: "Cold Storage", status: "○ Not available", icon: "📦", available: false },
    ],
    existingSetup: {
      hasExistingBusiness: "No",
      machineryAvailable: "Farm equipment & pump",
      currentActivity: "Agriculture",
    },
  };

  if (!raw || typeof raw !== "object") return fallback;

  if (Array.isArray(raw.resources)) {
    return {
      resources: raw.resources,
      existingSetup: raw.existingSetup || fallback.existingSetup,
    };
  }

  // Handle rich ResourcesStep schema
  const resourcesList = [
    {
      id: "r1",
      name: raw.hasLand ? `Farm Land (${raw.landAcres || 2.5} Acres)` : "Farm Land",
      status: raw.hasLand ? `✓ I own it (${raw.landOwnership || "Owned"})` : "○ Not available",
      icon: "🌱",
      available: Boolean(raw.hasLand),
    },
    {
      id: "r2",
      name: "Water Source (Borewell / Drip)",
      status: Array.isArray(raw.waterSources) && raw.waterSources.length > 0 ? "✓ Available" : "○ Not available",
      icon: "💧",
      available: Boolean(Array.isArray(raw.waterSources) && raw.waterSources.length > 0),
    },
    {
      id: "r3",
      name: raw.hasWorkspace ? `Work Shed (${raw.workspaceAreaSqFt || 1500} sq.ft)` : "Work Shed",
      status: raw.hasWorkspace ? "✓ I have access" : "○ Not available",
      icon: "🏠",
      available: Boolean(raw.hasWorkspace),
    },
    {
      id: "r4",
      name: "Transport Vehicle (Tractor / Mini-Truck)",
      status: Array.isArray(raw.transportModes) && raw.transportModes.length > 0 ? "✓ Available" : "○ Not available",
      icon: "🚚",
      available: Boolean(Array.isArray(raw.transportModes) && raw.transportModes.length > 0),
    },
    {
      id: "r5",
      name: "Cold Storage & Pre-Cooling",
      status: Array.isArray(raw.equipmentList) && raw.equipmentList.some((e) => e.id === "cold_storage") ? "✓ Available / Nearby" : "○ Not available",
      icon: "📦",
      available: Boolean(Array.isArray(raw.equipmentList) && raw.equipmentList.some((e) => e.id === "cold_storage")),
    },
  ];

  return {
    resources: resourcesList,
    existingSetup: {
      hasExistingBusiness: raw.existingSetupStatus === "active_business" ? "Yes (Active Enterprise)" : "No",
      machineryAvailable: (raw.equipmentList || []).map((e) => e.name).join(", ") || "Farm equipment & pump",
      currentActivity: raw.existingBusinessDesc || "Citrus Agriculture",
    },
  };
}

function normalizeFinances(raw) {
  const fallback = {
    personalSavings: 250000,
    rangeLabel: "₹1–5 Lakh",
    fundingSources: ["Personal savings", "Government assistance", "Bank finance"],
    borrowingPreference: "Open to loans",
    investmentHorizon: "Within 6 months",
  };

  if (!raw || typeof raw !== "object") return fallback;

  let savingsNum = 250000;
  if (typeof raw.personalSavings === "number") savingsNum = raw.personalSavings;
  else if (typeof raw.personalSavings === "string") {
    const parsed = parseFloat(raw.personalSavings.replace(/[^0-9.]/g, ""));
    if (!isNaN(parsed)) savingsNum = parsed;
  } else if (raw.budget_inr) {
    savingsNum = Number(raw.budget_inr);
  }

  let label = raw.rangeLabel || "₹1–5 Lakh";
  if (savingsNum > 500000 && savingsNum <= 1000000) label = "₹5–10 Lakh";
  else if (savingsNum > 1000000) label = "₹10–25 Lakh";

  return {
    personalSavings: savingsNum,
    rangeLabel: label,
    fundingSources: Array.isArray(raw.fundingSources) ? raw.fundingSources : fallback.fundingSources,
    borrowingPreference: raw.borrowingPreference || fallback.borrowingPreference,
    investmentHorizon: raw.investmentHorizon || fallback.investmentHorizon,
  };
}

function normalizeLocation(raw) {
  const fallback = {
    currentLocation: "Nagpur District",
    preferredBusinessLocation: "Katol",
    operatingPreference: "Within Nagpur District",
    willingToRelocate: "Yes, within Vidarbha",
  };

  if (!raw || typeof raw !== "object") return fallback;

  return {
    currentLocation: raw.currentLocation || raw.district || fallback.currentLocation,
    preferredBusinessLocation: raw.preferredBusinessLocation || raw.preferredLocation || raw.location || fallback.preferredBusinessLocation,
    operatingPreference: raw.operatingPreference || fallback.operatingPreference,
    willingToRelocate: raw.willingToRelocate || fallback.willingToRelocate,
  };
}

function normalizePreferences(raw) {
  const fallback = {
    interestedSectors: ["Agriculture", "Food Processing", "Agritech"],
    preferredScale: "Small / Micro",
    timeCommitment: "Full-time",
    corePriorities: [
      "Use existing resources",
      "Local market opportunity",
      "Steady income",
    ],
  };

  if (!raw || typeof raw !== "object") return fallback;

  return {
    interestedSectors: Array.isArray(raw.interestedSectors) ? raw.interestedSectors : Array.isArray(raw.sectors) ? raw.sectors : fallback.interestedSectors,
    preferredScale: raw.preferredScale || raw.scale || fallback.preferredScale,
    timeCommitment: raw.timeCommitment || raw.commitment || fallback.timeCommitment,
    corePriorities: Array.isArray(raw.corePriorities) ? raw.corePriorities : Array.isArray(raw.priorities) ? raw.priorities : fallback.corePriorities,
  };
}

function normalizePrivacy(raw) {
  const fallback = {
    profileVisibility: "Relevant EntreVision users",
    collabVisibility: "Only relevant matches",
    showSkills: "Yes",
    showResources: "Only for collaboration matches",
    financialVisibility: "Private",
  };

  if (!raw || typeof raw !== "object") return fallback;

  return {
    profileVisibility: raw.profileVisibility || fallback.profileVisibility,
    collabVisibility: raw.collabVisibility || fallback.collabVisibility,
    showSkills: raw.showSkills || fallback.showSkills,
    showResources: raw.showResources || fallback.showResources,
    financialVisibility: "Private",
  };
}

// ============================================================================
// MAIN PROFILE COMPONENT
// ============================================================================
export default function Profile() {
  // Active view tab: "overview" | "about" | "skills" | "documents" | "resources" | "finances" | "locations" | "interests" | "privacy"
  const [activeSection, setActiveSection] = useState("overview");

  // Save feedback notification
  const [saveNotice, setSaveNotice] = useState(false);

  // Profile Completion Modal (10.10)
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // States with robust safe fallbacks
  const [aboutMe, setAboutMe] = useState(() => {
    try {
      const saved = localStorage.getItem("ev_about_me");
      if (saved) return normalizeAboutMe(JSON.parse(saved));
    } catch (e) {}
    return normalizeAboutMe(null);
  });

  const [skillsData, setSkillsData] = useState(() => {
    try {
      const saved = localStorage.getItem("ev_skills_data");
      if (saved) return normalizeSkills(JSON.parse(saved));
    } catch (e) {}
    return normalizeSkills(null);
  });

  const [documentsData, setDocumentsData] = useState(() => {
    try {
      const saved = localStorage.getItem("ev_user_documents");
      if (saved) return normalizeDocuments(JSON.parse(saved));
    } catch (e) {}
    return normalizeDocuments(null);
  });

  const [resourcesData, setResourcesData] = useState(() => {
    try {
      const saved = localStorage.getItem("ev_user_resources");
      if (saved) return normalizeResources(JSON.parse(saved));
    } catch (e) {}
    return normalizeResources(null);
  });

  const [financesData, setFinancesData] = useState(() => {
    try {
      const saved = localStorage.getItem("ev_user_finances");
      if (saved) return normalizeFinances(JSON.parse(saved));
    } catch (e) {}
    return normalizeFinances(null);
  });

  const [locationData, setLocationData] = useState(() => {
    try {
      const saved = localStorage.getItem("ev_user_location");
      if (saved) return normalizeLocation(JSON.parse(saved));
    } catch (e) {}
    return normalizeLocation(null);
  });

  const [preferencesData, setPreferencesData] = useState(() => {
    try {
      const saved = localStorage.getItem("ev_user_preferences");
      if (saved) return normalizePreferences(JSON.parse(saved));
    } catch (e) {}
    return normalizePreferences(null);
  });

  const [privacyData, setPrivacyData] = useState(() => {
    try {
      const saved = localStorage.getItem("ev_user_privacy");
      if (saved) return normalizePrivacy(JSON.parse(saved));
    } catch (e) {}
    return normalizePrivacy(null);
  });

  // Inline input states for Skill adding
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState("Intermediate");

  // Save all profile state to localStorage
  const handleSaveProfile = () => {
    try {
      localStorage.setItem("ev_about_me", JSON.stringify(aboutMe));
      localStorage.setItem("ev_skills_data", JSON.stringify(skillsData));
      localStorage.setItem("ev_user_documents", JSON.stringify(documentsData));
      localStorage.setItem("ev_user_resources", JSON.stringify(resourcesData));
      localStorage.setItem("ev_user_finances", JSON.stringify(financesData));
      localStorage.setItem("ev_user_location", JSON.stringify(locationData));
      localStorage.setItem("ev_user_preferences", JSON.stringify(preferencesData));
      localStorage.setItem("ev_user_privacy", JSON.stringify(privacyData));

      setSaveNotice(true);
      setTimeout(() => setSaveNotice(false), 2000);
    } catch (e) {
      console.error("Error saving profile:", e);
    }
  };

  // Add new skill
  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    const newSkill = {
      id: `s_${Date.now()}`,
      name: newSkillName.trim(),
      level: newSkillLevel,
      years: "1 year",
      icon: "🌱",
    };
    setSkillsData((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), newSkill],
    }));
    setNewSkillName("");
  };

  // Remove skill
  const handleRemoveSkill = (id) => {
    setSkillsData((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((s) => s.id !== id),
    }));
  };

  // Add Document prompt
  const handleAddDocumentPrompt = () => {
    const docName = prompt("Enter document title (e.g. 'FSSAI License' or 'Soil Test Report'):");
    if (!docName) return;

    const newDoc = {
      id: `doc_${Date.now()}`,
      name: docName,
      type: "Official Document",
      relatedSkill: "Business Setup",
      issuedBy: "Issuing Authority",
      status: "Added",
      year: new Date().getFullYear().toString(),
    };
    setDocumentsData((prev) => [...(Array.isArray(prev) ? prev : []), newDoc]);
  };

  // Profile completion calculation
  const completionStats = useMemo(() => {
    const hasAbout = Boolean(aboutMe?.fullName && aboutMe?.education);
    const hasSkills = Array.isArray(skillsData?.skills) && skillsData.skills.length >= 2;
    const hasResources = Array.isArray(resourcesData?.resources) && resourcesData.resources.some((r) => r.available);
    const hasLocation = Boolean(locationData?.preferredBusinessLocation);
    const hasPreferences = Array.isArray(preferencesData?.interestedSectors) && preferencesData.interestedSectors.length >= 1;
    const hasDocs = Array.isArray(documentsData) && documentsData.filter((d) => d.status === "Added").length >= 2;
    const hasSetup = Boolean(resourcesData?.existingSetup?.currentActivity);

    const sections = [
      { name: "About Me", complete: hasAbout, weight: 15, key: "about" },
      { name: "Skills", complete: hasSkills, weight: 15, key: "skills" },
      { name: "Resources", complete: hasResources, weight: 15, key: "resources" },
      { name: "Location", complete: hasLocation, weight: 15, key: "locations" },
      { name: "Business Preferences", complete: hasPreferences, weight: 15, key: "interests" },
      { name: "Certificates", complete: hasDocs, weight: 15, key: "documents" },
      { name: "Existing Setup", complete: hasSetup, weight: 10, key: "resources" },
    ];

    const completedWeight = sections.filter((s) => s.complete).reduce((acc, s) => acc + s.weight, 0);
    const missingSections = sections.filter((s) => !s.complete);

    return {
      percentage: completedWeight,
      sections,
      missingSections,
    };
  }, [aboutMe, skillsData, documentsData, resourcesData, locationData, preferencesData]);

  const skillsList = Array.isArray(skillsData?.skills) ? skillsData.skills : [];
  const docsList = Array.isArray(documentsData) ? documentsData : [];
  const resList = Array.isArray(resourcesData?.resources) ? resourcesData.resources : [];

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", paddingBottom: 60 }}>
      {/* ====================================================================
          PAGE HEADER & GLOBAL SAVE BAR
         ==================================================================== */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 60,
                height: 60,
                borderRadius: 16,
                background: "linear-gradient(135deg, var(--electric-blue), var(--cyan))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.8rem",
                color: "#fff",
                boxShadow: "0 8px 24px var(--line-glow)",
              }}
            >
              👤
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 800, color: "var(--text-heading)" }}>
                  {aboutMe?.fullName || "Bhoomika Vaishya"}
                </h1>
                <span className="badge-verified" style={{ fontSize: "0.72rem" }}>
                  Entrepreneur Profile
                </span>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 4, fontSize: "0.82rem", color: "var(--muted)", flexWrap: "wrap" }}>
                <span>🎓 {aboutMe?.education}</span>
                <span>📍 {locationData?.preferredBusinessLocation} / {locationData?.currentLocation}</span>
                <span>💼 {aboutMe?.currentSituation}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {saveNotice && (
              <span style={{ fontSize: "0.82rem", color: "var(--ok)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Check size={16} /> Saved Everywhere!
              </span>
            )}

            <button
              type="button"
              onClick={handleSaveProfile}
              className="btn-primary-gloss"
              style={{ fontSize: "0.85rem", padding: "8px 18px", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* PROFILE COMPLETION HERO CARD */}
        <div
          style={{
            marginTop: 20,
            padding: "16px 20px",
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.06) 100%), var(--panel-subtle)",
            borderRadius: 14,
            border: "1px solid var(--line-glow)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <div>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase" }}>
                PROFILE COMPLETION
              </span>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 2 }}>
                <strong style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text-heading)" }}>
                  {completionStats.percentage}%
                </strong>
                <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                  Complete your profile to improve opportunity recommendations.
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowCompletionModal(true)}
              className="btn-secondary-gloss"
              style={{ fontSize: "0.78rem", padding: "6px 14px" }}
            >
              Complete Profile →
            </button>
          </div>

          <div
            style={{
              marginTop: 12,
              height: 8,
              borderRadius: 4,
              background: "var(--panel-solid)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${completionStats.percentage}%`,
                height: "100%",
                background: "linear-gradient(90deg, var(--ok), var(--cyan))",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* ====================================================================
          PAGE 10.1: SECTION NAVIGATION BAR
         ==================================================================== */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 20 }}>
        {[
          { id: "overview", label: "📋 Profile Overview" },
          { id: "about", label: "👤 About Me" },
          { id: "skills", label: "🛠️ Skills & Experience" },
          { id: "documents", label: "📄 Certificates & Documents" },
          { id: "resources", label: "🏗️ Resources & Setup" },
          { id: "finances", label: "💰 Financial Capacity" },
          { id: "locations", label: "📍 Locations" },
          { id: "interests", label: "🌱 Business Interests" },
          { id: "privacy", label: "🔐 Privacy" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveSection(tab.id)}
            className={`pill-option-btn ${activeSection === tab.id ? "active" : ""}`}
            style={{ fontSize: "0.82rem", padding: "8px 14px", whiteSpace: "nowrap", fontWeight: 700 }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ====================================================================
          VIEW 1: PAGE 10 — PROFILE OVERVIEW DASHBOARD
         ==================================================================== */}
      {activeSection === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 }}>
          {/* ABOUT ME CARD */}
          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--text-heading)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>👤</span> ABOUT ME
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveSection("about")}
                  className="btn-secondary-gloss"
                  style={{ fontSize: "0.74rem", padding: "4px 10px" }}
                >
                  Edit →
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "0.84rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 4 }}>
                  <span className="muted">Name:</span>
                  <strong>{aboutMe?.fullName || "Bhoomika"}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 4 }}>
                  <span className="muted">Education:</span>
                  <strong>{aboutMe?.education || "Engineering"}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 4 }}>
                  <span className="muted">Location:</span>
                  <strong>{locationData?.currentLocation || "Nagpur / Vidarbha"}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="muted">Status:</span>
                  <strong style={{ color: "var(--cyan)" }}>{aboutMe?.currentSituation || "Planning a business"}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* SKILLS CARD */}
          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--text-heading)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>🛠️</span> SKILLS
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveSection("skills")}
                  className="btn-secondary-gloss"
                  style={{ fontSize: "0.74rem", padding: "4px 10px" }}
                >
                  Manage Skills →
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "0.84rem" }}>
                {skillsList.map((s) => (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{s.icon} {s.name}</span>
                    <span className="tag" style={{ fontSize: "0.7rem" }}>{s.level}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CERTIFICATES & DOCUMENTS CARD */}
          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--text-heading)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>📄</span> CERTIFICATES & DOCUMENTS
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveSection("documents")}
                  className="btn-secondary-gloss"
                  style={{ fontSize: "0.74rem", padding: "4px 10px" }}
                >
                  Manage Documents →
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "0.84rem" }}>
                <div style={{ color: "var(--ok)", fontWeight: 700 }}>
                  ✓ {docsList.filter((d) => d.status === "Added").length} certificates added
                </div>
                <div style={{ color: "#f59e0b", fontWeight: 700 }}>
                  ⚠ {docsList.filter((d) => d.status === "Needs Attention").length} document needs attention
                </div>
              </div>
            </div>
          </div>

          {/* RESOURCES & SETUP CARD */}
          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--text-heading)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>🏗️</span> MY RESOURCES
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveSection("resources")}
                  className="btn-secondary-gloss"
                  style={{ fontSize: "0.74rem", padding: "4px 10px" }}
                >
                  Edit Setup →
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "0.84rem" }}>
                {resList.slice(0, 3).map((r) => (
                  <div key={r.id} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{r.icon} {r.name}</span>
                    <strong style={{ color: "var(--ok)" }}>{r.status}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FINANCIAL CAPACITY CARD */}
          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--text-heading)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>💰</span> FINANCIAL CAPACITY
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveSection("finances")}
                  className="btn-secondary-gloss"
                  style={{ fontSize: "0.74rem", padding: "4px 10px" }}
                >
                  Edit Financial Info →
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "0.84rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 4 }}>
                  <span className="muted">Available Initial Capital:</span>
                  <strong>{financesData?.rangeLabel || "₹1–5 Lakh"} (₹{(financesData?.personalSavings || 250000).toLocaleString("en-IN")})</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="muted">Borrowing Preference:</span>
                  <strong>{financesData?.borrowingPreference || "Open to loans"}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* LOCATIONS CARD */}
          <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "var(--text-heading)", display: "flex", alignItems: "center", gap: 6 }}>
                  <span>📍</span> MY LOCATIONS
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveSection("locations")}
                  className="btn-secondary-gloss"
                  style={{ fontSize: "0.74rem", padding: "4px 10px" }}
                >
                  Edit Locations →
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "0.84rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 4 }}>
                  <span className="muted">Current Location:</span>
                  <strong>{locationData?.currentLocation || "Nagpur District"}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="muted">Preferred Business Location:</span>
                  <strong style={{ color: "var(--cyan)" }}>{locationData?.preferredBusinessLocation || "Katol"}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          VIEW 2: PAGE 10.2 — ABOUT ME
         ==================================================================== */}
      {activeSection === "about" && (
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="pill">Personal Information</span>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>PAGE 10.2</span>
          </div>
          <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-heading)", margin: "0 0 16px" }}>
            👤 ABOUT ME
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
                Full Name
              </label>
              <input
                type="text"
                value={aboutMe?.fullName || ""}
                onChange={(e) => setAboutMe((prev) => ({ ...prev, fullName: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "var(--panel-subtle)",
                  border: "1px solid var(--line)",
                  color: "var(--text-heading)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
                Education
              </label>
              <input
                type="text"
                value={aboutMe?.education || ""}
                onChange={(e) => setAboutMe((prev) => ({ ...prev, education: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "var(--panel-subtle)",
                  border: "1px solid var(--line)",
                  color: "var(--text-heading)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
                Current Situation
              </label>
              <input
                type="text"
                value={aboutMe?.currentSituation || ""}
                onChange={(e) => setAboutMe((prev) => ({ ...prev, currentSituation: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "var(--panel-subtle)",
                  border: "1px solid var(--line)",
                  color: "var(--text-heading)",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  outline: "none",
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginBottom: 8 }}>
              What are you hoping to achieve?
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 8 }}>
              {[
                "Start my first business",
                "Expand existing business",
                "Find a new business idea",
                "Use my existing resources",
              ].map((goal) => {
                const isSelected = Array.isArray(aboutMe?.goals) && aboutMe.goals.includes(goal);
                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => {
                      const currentGoals = Array.isArray(aboutMe?.goals) ? aboutMe.goals : [];
                      setAboutMe((prev) => ({
                        ...prev,
                        goals: isSelected ? currentGoals.filter((g) => g !== goal) : [...currentGoals, goal],
                      }));
                    }}
                    className={`pill-option-btn ${isSelected ? "active" : ""}`}
                    style={{ fontSize: "0.82rem", padding: "8px 12px", justifyContent: "flex-start" }}
                  >
                    <span>{isSelected ? "☑" : "☐"}</span>
                    <span>{goal}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
            <button
              type="button"
              onClick={handleSaveProfile}
              className="btn-primary-gloss"
              style={{ fontSize: "0.85rem", padding: "8px 20px" }}
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          VIEW 3: PAGE 10.3 — SKILLS & EXPERIENCE
         ==================================================================== */}
      {activeSection === "skills" && (
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="pill">Capabilities</span>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>PAGE 10.3</span>
          </div>
          <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-heading)", margin: "0 0 16px" }}>
            🛠️ SKILLS & EXPERIENCE
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
            {skillsList.map((skill) => (
              <div
                key={skill.id}
                style={{
                  background: "var(--panel-subtle)",
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: "1.3rem" }}>{skill.icon}</span>
                  <div>
                    <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)" }}>{skill.name}</strong>
                    <div style={{ fontSize: "0.76rem", color: "var(--muted)", marginTop: 2 }}>
                      {skill.years}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span className="tag" style={{ fontSize: "0.74rem" }}>{skill.level}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill.id)}
                    style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer", padding: 4 }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Skill Form */}
          <div style={{ marginTop: 16, padding: 14, background: "rgba(99, 102, 241, 0.05)", borderRadius: 12, border: "1px solid var(--line-glow)", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Enter skill name (e.g. 'Food Processing', 'Marketing')"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              style={{
                flex: 1,
                minWidth: 220,
                padding: "8px 12px",
                borderRadius: 8,
                background: "var(--panel-solid)",
                border: "1px solid var(--line)",
                color: "var(--text-heading)",
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
            <select
              value={newSkillLevel}
              onChange={(e) => setNewSkillLevel(e.target.value)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                background: "var(--panel-solid)",
                border: "1px solid var(--line)",
                color: "var(--text-heading)",
                fontSize: "0.85rem",
                outline: "none",
              }}
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <button
              type="button"
              onClick={handleAddSkill}
              className="btn-primary-gloss"
              style={{ fontSize: "0.82rem", padding: "8px 14px" }}
            >
              [+ Add Skill]
            </button>
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
              How did you acquire your skills?
            </span>
            <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap", fontSize: "0.84rem" }}>
              {["Education", "Training", "Work experience", "Family business"].map((c) => (
                <span key={c} style={{ color: "var(--ok)", fontWeight: 700 }}>✓ {c}</span>
              ))}
            </div>

            <div style={{ marginTop: 14, fontSize: "0.84rem" }}>
              <span className="muted">Willing to learn new skills?</span>
              <strong style={{ marginLeft: 8, color: "var(--text-heading)" }}>● Yes</strong>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          VIEW 4: PAGE 10.4 — CERTIFICATES & DOCUMENTS
         ==================================================================== */}
      {activeSection === "documents" && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span className="pill">Repository</span>
                <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>PAGE 10.4</span>
              </div>
              <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-heading)", margin: 0 }}>
                📄 CERTIFICATES & DOCUMENTS
              </h2>
            </div>

            <button
              type="button"
              onClick={handleAddDocumentPrompt}
              className="btn-primary-gloss"
              style={{ fontSize: "0.82rem", padding: "8px 14px" }}
            >
              [+ Add Document]
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* CERTIFICATES SECTION */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase" }}>
                  CERTIFICATES
                </span>
                <button
                  type="button"
                  onClick={handleAddDocumentPrompt}
                  className="pill-option-btn"
                  style={{ fontSize: "0.74rem", padding: "4px 8px" }}
                >
                  [+ Add Certificate]
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {docsList.filter((d) => d.type === "Certificate").map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      background: "var(--panel-subtle)",
                      padding: "12px 16px",
                      borderRadius: 10,
                      border: "1px solid var(--line)",
                    }}
                  >
                    <strong style={{ fontSize: "0.9rem", color: "var(--text-heading)" }}>
                      ✓ {doc.name}
                    </strong>
                    <div style={{ fontSize: "0.76rem", color: "var(--muted)", marginTop: 2 }}>
                      Related skill: {doc.relatedSkill} • Added: {doc.year}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* EXPERIENCE SECTION */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--ok)", textTransform: "uppercase" }}>
                  EXPERIENCE
                </span>
                <button
                  type="button"
                  onClick={() => alert("Added experience record.")}
                  className="pill-option-btn"
                  style={{ fontSize: "0.74rem", padding: "4px 8px" }}
                >
                  [+ Add Experience]
                </button>
              </div>

              <div style={{ background: "var(--panel-subtle)", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--line)" }}>
                <strong style={{ fontSize: "0.9rem", color: "var(--text-heading)" }}>
                  ✓ 2 years — Family Agricultural Business
                </strong>
              </div>
            </div>

            {/* OTHER DOCUMENTS SECTION */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--violet)", textTransform: "uppercase" }}>
                  OTHER DOCUMENTS
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {docsList.filter((d) => d.type !== "Certificate").map((doc) => (
                  <div
                    key={doc.id}
                    style={{
                      background: "var(--panel-subtle)",
                      padding: "12px 16px",
                      borderRadius: 10,
                      border: "1px solid var(--line)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>{doc.name}</span>
                    <span
                      style={{
                        fontSize: "0.76rem",
                        fontWeight: 700,
                        color: doc.status === "Added" ? "var(--ok)" : "#f59e0b",
                      }}
                    >
                      {doc.status === "Added" ? "✓ Added" : "— Needs Attention"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          VIEW 5: PAGE 10.5 — RESOURCES & EXISTING SETUP
         ==================================================================== */}
      {activeSection === "resources" && (
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span className="pill">Physical Infrastructure</span>
                <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>PAGE 10.5</span>
              </div>
              <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-heading)", margin: 0 }}>
                🏗️ MY RESOURCES
              </h2>
            </div>

            <button
              type="button"
              onClick={() => alert("Added new resource field.")}
              className="btn-primary-gloss"
              style={{ fontSize: "0.82rem", padding: "8px 14px" }}
            >
              [+ Add Resource]
            </button>
          </div>

          <div style={{ background: "var(--panel-subtle)", borderRadius: 12, overflow: "hidden", border: "1px solid var(--line)", marginBottom: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", padding: "10px 16px", background: "var(--panel-solid)", fontSize: "0.78rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
              <span>RESOURCE</span>
              <span style={{ textAlign: "right" }}>STATUS</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {resList.map((res) => (
                <div
                  key={res.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.5fr 1fr",
                    padding: "12px 16px",
                    borderTop: "1px solid var(--line)",
                    fontSize: "0.88rem",
                    alignItems: "center",
                  }}
                >
                  <span>{res.icon} {res.name}</span>
                  <span style={{ textAlign: "right", fontWeight: 700, color: res.available ? "var(--ok)" : "var(--muted)" }}>
                    {res.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "var(--panel-subtle)", padding: 16, borderRadius: 12, border: "1px solid var(--line)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                EXISTING SETUP
              </span>
              <button
                type="button"
                onClick={() => alert("Edit setup parameters")}
                className="btn-secondary-gloss"
                style={{ fontSize: "0.74rem", padding: "4px 8px" }}
              >
                [Edit Setup]
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted">Existing Business:</span>
                <strong>{resourcesData?.existingSetup?.hasExistingBusiness || "No"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted">Equipment:</span>
                <strong>{resourcesData?.existingSetup?.machineryAvailable || "Farm equipment"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted">Current Activity:</span>
                <strong>{resourcesData?.existingSetup?.currentActivity || "Agriculture"}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          VIEW 6: PAGE 10.6 — FINANCIAL CAPACITY
         ==================================================================== */}
      {activeSection === "finances" && (
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="pill">Capital</span>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>PAGE 10.6</span>
          </div>
          <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-heading)", margin: "0 0 16px" }}>
            💰 FINANCIAL CAPACITY
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "var(--panel-subtle)", padding: 16, borderRadius: 12, border: "1px solid var(--line)" }}>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                Available Initial Capital
              </span>
              <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--cyan)", marginTop: 2 }}>
                {financesData?.rangeLabel || "₹1–5 Lakh"} (₹{(financesData?.personalSavings || 250000).toLocaleString("en-IN")})
              </div>
            </div>

            <div style={{ background: "var(--panel-subtle)", padding: 16, borderRadius: 12, border: "1px solid var(--line)" }}>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                Funding Sources
              </span>
              <div style={{ display: "flex", gap: 14, marginTop: 6, flexWrap: "wrap", fontSize: "0.85rem" }}>
                {(financesData?.fundingSources || []).map((f) => (
                  <span key={f} style={{ color: "var(--ok)", fontWeight: 700 }}>✓ {f}</span>
                ))}
              </div>
            </div>

            <div style={{ background: "var(--panel-subtle)", padding: 16, borderRadius: 12, border: "1px solid var(--line)" }}>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                Borrowing Preference
              </span>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-heading)", marginTop: 2 }}>
                {financesData?.borrowingPreference || "Open to loans"}
              </div>
            </div>

            <div style={{ background: "var(--panel-subtle)", padding: 16, borderRadius: 12, border: "1px solid var(--line)" }}>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                Investment Horizon
              </span>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-heading)", marginTop: 2 }}>
                {financesData?.investmentHorizon || "Within 6 months"}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Link to="/financial-assistant" className="btn-primary-gloss" style={{ fontSize: "0.85rem", padding: "8px 18px", textDecoration: "none" }}>
                [Edit Financial Information]
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          VIEW 7: PAGE 10.7 — MY LOCATIONS
         ==================================================================== */}
      {activeSection === "locations" && (
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="pill">Geography</span>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>PAGE 10.7</span>
          </div>
          <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-heading)", margin: "0 0 16px" }}>
            📍 MY LOCATIONS
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "var(--panel-subtle)", padding: 16, borderRadius: 12, border: "1px solid var(--line)" }}>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                Current Location
              </span>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text-heading)", marginTop: 2 }}>
                {locationData?.currentLocation || "Nagpur District"}
              </div>
            </div>

            <div style={{ background: "var(--panel-subtle)", padding: 16, borderRadius: 12, border: "1px solid var(--line)" }}>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                Preferred Business Location
              </span>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--cyan)", marginTop: 2 }}>
                {locationData?.preferredBusinessLocation || "Katol"}
              </div>
            </div>

            <div style={{ background: "var(--panel-subtle)", padding: 16, borderRadius: 12, border: "1px solid var(--line)" }}>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                Operating Preference
              </span>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-heading)", marginTop: 2 }}>
                {locationData?.operatingPreference || "Within Nagpur District"}
              </div>
            </div>

            <div style={{ background: "var(--panel-subtle)", padding: 16, borderRadius: 12, border: "1px solid var(--line)" }}>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                Willing to Relocate?
              </span>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--ok)", marginTop: 2 }}>
                {locationData?.willingToRelocate || "Yes, within Vidarbha"}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <Link to="/locations" className="btn-primary-gloss" style={{ fontSize: "0.85rem", padding: "8px 18px", textDecoration: "none" }}>
                [Edit Locations]
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          VIEW 8: PAGE 10.8 — BUSINESS INTERESTS
         ==================================================================== */}
      {activeSection === "interests" && (
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="pill">Preferences</span>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>PAGE 10.8</span>
          </div>
          <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-heading)", margin: "0 0 16px" }}>
            🌱 BUSINESS INTERESTS
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "var(--panel-subtle)", padding: 16, borderRadius: 12, border: "1px solid var(--line)" }}>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                Interested In
              </span>
              <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap", fontSize: "0.85rem" }}>
                {(preferencesData?.interestedSectors || []).map((s) => (
                  <span key={s} style={{ color: "var(--ok)", fontWeight: 700 }}>✓ {s}</span>
                ))}
              </div>
            </div>

            <div style={{ background: "var(--panel-subtle)", padding: 16, borderRadius: 12, border: "1px solid var(--line)" }}>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                Preferred Scale
              </span>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-heading)", marginTop: 2 }}>
                {preferencesData?.preferredScale || "Small / Micro"}
              </div>
            </div>

            <div style={{ background: "var(--panel-subtle)", padding: 16, borderRadius: 12, border: "1px solid var(--line)" }}>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                Time Commitment
              </span>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-heading)", marginTop: 2 }}>
                {preferencesData?.timeCommitment || "Full-time"}
              </div>
            </div>

            <div style={{ background: "var(--panel-subtle)", padding: 16, borderRadius: 12, border: "1px solid var(--line)" }}>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                Priorities
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6, fontSize: "0.85rem" }}>
                {(preferencesData?.corePriorities || []).map((p) => (
                  <span key={p} style={{ color: "var(--cyan)", fontWeight: 700 }}>✓ {p}</span>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="btn-primary-gloss"
                style={{ fontSize: "0.85rem", padding: "8px 18px" }}
              >
                [Edit Preferences]
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          VIEW 9: PAGE 10.11 — PRIVACY CONTROLS
         ==================================================================== */}
      {activeSection === "privacy" && (
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="pill">Protection</span>
            <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>PAGE 10.11</span>
          </div>
          <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-heading)", margin: "0 0 16px" }}>
            🔐 PRIVACY
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: "var(--panel-subtle)", padding: 14, borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="muted">Profile visibility</span>
              <strong>● {privacyData?.profileVisibility || "Relevant EntreVision users"}</strong>
            </div>

            <div style={{ background: "var(--panel-subtle)", padding: 14, borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="muted">Collaboration visibility</span>
              <strong>● {privacyData?.collabVisibility || "Only relevant matches"}</strong>
            </div>

            <div style={{ background: "var(--panel-subtle)", padding: 14, borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="muted">Show my skills</span>
              <strong style={{ color: "var(--ok)" }}>✓ {privacyData?.showSkills || "Yes"}</strong>
            </div>

            <div style={{ background: "var(--panel-subtle)", padding: 14, borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="muted">Show my resources</span>
              <strong style={{ color: "var(--ok)" }}>✓ {privacyData?.showResources || "Only for collaboration matches"}</strong>
            </div>

            <div style={{ background: "var(--panel-subtle)", padding: 14, borderRadius: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="muted">Financial information</span>
              <strong style={{ color: "var(--cyan)", display: "flex", alignItems: "center", gap: 4 }}>
                <Lock size={14} /> Private
              </strong>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: PAGE 10.10 — PROFILE COMPLETION DETAIL MODAL
         ==================================================================== */}
      {showCompletionModal && (
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
              maxWidth: 560,
              width: "100%",
              padding: 24,
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <span className="pill" style={{ fontSize: "0.72rem" }}>
                  Readiness Diagnostic
                </span>
                <h2 style={{ margin: "6px 0 2px", fontSize: "1.35rem", fontWeight: 800, color: "var(--text-heading)" }}>
                  PROFILE COMPLETION
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setShowCompletionModal(false)}
                style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--cyan)", marginBottom: 12 }}>
              {completionStats.percentage}% Complete
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
              {completionStats.sections.map((s, idx) => (
                <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                  <span>{s.complete ? "✓" : "⚠"} {s.name}</span>
                  <strong style={{ color: s.complete ? "var(--ok)" : "#f59e0b" }}>
                    {s.complete ? "Complete" : "Action Needed"}
                  </strong>
                </div>
              ))}
            </div>

            <div style={{ background: "var(--panel-subtle)", padding: 14, borderRadius: 12, marginBottom: 18 }}>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                Complete these to improve:
              </span>
              <ul style={{ margin: "6px 0 0 16px", padding: 0, fontSize: "0.82rem", color: "var(--text-heading)", lineHeight: 1.5 }}>
                <li>• Skill-gap analysis & CCRI training matching</li>
                <li>• Scheme matching (PMFME / NHB grants)</li>
                <li>• Business recommendations accuracy</li>
                <li>• Business plan generation & DPR export</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowCompletionModal(false);
                if (completionStats.missingSections.length > 0) {
                  setActiveSection(completionStats.missingSections[0].key);
                }
              }}
              className="btn-primary-gloss"
              style={{ width: "100%", justifyContent: "center", padding: "10px" }}
            >
              [Complete Profile]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
