import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth, persistUserAssessmentToStorage } from "../context/AuthContext";
import { fetchUserProfile, saveUserProfile } from "../services/api";
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

// ============================================================================
// DEFENSIVE NORMALIZATION HELPERS (BRIDGES WIZARD DATA & PROFILE HUB)
// ============================================================================

function normalizeAboutMe(raw, user) {
  if (!raw || typeof raw !== "object") {
    return {
      fullName: user?.full_name || "",
      education: user?.education || "",
      currentSituation: user?.current_situation || "",
      goals: [],
    };
  }

  return {
    fullName: raw.fullName || user?.full_name || "",
    education: raw.education || user?.education || "",
    currentSituation: raw.currentSituation || user?.current_situation || "",
    goals: Array.isArray(raw.goals) ? raw.goals : [],
  };
}

function normalizeSkills(raw) {
  if (!raw) return { skills: [], channels: [], willingToLearn: "" };

  if (Array.isArray(raw)) {
    const list = raw.map((item, idx) => ({
      id: item.skillId || item.id || `s_${idx}`,
      name: item.name || item.label || "Agro Skill",
      level: item.proficiency || item.level || "Intermediate",
      years: item.yearsExperience || item.years || "1 Year",
      icon: item.icon || "🌱",
    }));
    return {
      skills: list,
      channels: [],
      willingToLearn: "",
    };
  }

  if (typeof raw === "object" && Array.isArray(raw.skills)) {
    return {
      skills: raw.skills,
      channels: Array.isArray(raw.channels) ? raw.channels : [],
      willingToLearn: raw.willingToLearn || "",
    };
  }

  return { skills: [], channels: [], willingToLearn: "" };
}

function normalizeDocuments(raw) {
  if (!raw) return [];

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
          name: `${e.duration || "Experience"} — ${e.org || "Agro Venture"}`,
          type: "Experience",
          relatedSkill: e.role || "Operations",
          issuedBy: e.org || "Employer",
          status: "Added",
          year: e.duration || "1 Year",
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
    if (Array.isArray(raw.otherDocs)) {
      raw.otherDocs.forEach((o, idx) => {
        list.push({
          id: o.id || `oth_${idx}`,
          name: o.title || o.name || "Supporting Document",
          type: "Document",
          relatedSkill: "General",
          issuedBy: "Authority",
          status: o.status === "added" ? "Added" : "Needs Attention",
          year: "2026",
        });
      });
    }
    return list;
  }

  return [];
}

function normalizeResources(raw) {
  const defaultResources = [
    { id: "r1", name: "Farm Land", status: "○ Not available", icon: "🌱", available: false },
    { id: "r2", name: "Water Source", status: "○ Not available", icon: "💧", available: false },
    { id: "r3", name: "Work Shed", status: "○ Not available", icon: "🏠", available: false },
    { id: "r4", name: "Transport Vehicle", status: "○ Not available", icon: "🚚", available: false },
    { id: "r5", name: "Cold Storage", status: "○ Not available", icon: "📦", available: false },
  ];

  const defaultSetup = {
    hasExistingBusiness: "No",
    machineryAvailable: "None",
    currentActivity: "None",
  };

  if (!raw || typeof raw !== "object") {
    return {
      resources: defaultResources,
      existingSetup: defaultSetup,
    };
  }

  if (Array.isArray(raw.resources)) {
    return {
      resources: raw.resources,
      existingSetup: raw.existingSetup || defaultSetup,
    };
  }

  // Handle rich ResourcesStep schema
  const resourcesList = [
    {
      id: "r1",
      name: raw.hasLand ? `Farm Land (${raw.landAcres || 0} Acres)` : "Farm Land",
      status: raw.hasLand ? `✓ Available (${raw.landOwnership || "Owned"})` : "○ Not available",
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
      name: raw.hasWorkspace ? `Work Shed (${raw.workspaceAreaSqFt || 0} sq.ft)` : "Work Shed",
      status: raw.hasWorkspace ? "✓ Available" : "○ Not available",
      icon: "🏠",
      available: Boolean(raw.hasWorkspace),
    },
    {
      id: "r4",
      name: "Transport Vehicle",
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
      hasExistingBusiness: raw.existingSetupStatus === "active_business" ? "Yes (Active Enterprise)" : raw.existingSetupStatus === "idle_assets" ? "Idle Assets / Machinery" : "No",
      machineryAvailable: (raw.equipmentList || []).map((e) => e.name).join(", ") || "None",
      currentActivity: raw.existingBusinessDesc || (raw.existingSetupStatus === "none" ? "None" : ""),
    },
  };
}

export function formatBorrowingPreference(pref) {
  if (!pref || pref === "Not set") return "Not set";
  const map = {
    no_loan: "No loan (100% Self-funded)",
    small_loan: "Small loan (20–30% of project)",
    open_to_loans: "Open to loans with subsidy (PMFME 35%)",
    significant_financing: "Significant project financing",
    moderate_loan: "Moderate bank loan",
  };
  return map[pref] || pref;
}

export function formatInvestmentHorizon(horizon) {
  if (!horizon || horizon === "Not set") return "Not set";
  const map = {
    immediately: "⚡ Immediately (Capital ready)",
    within_3_months: "🌱 Within 3 months",
    within_6_months: "📅 Within 6 months",
    within_1_year: "⏳ Within 1 year",
    exploring: "🔍 Exploring feasibility",
  };
  return map[horizon] || horizon;
}

function normalizeFinances(raw) {
  if (!raw || typeof raw !== "object") {
    return {
      personalSavings: 0,
      availableCapitalINR: 0,
      rangeLabel: "Not set",
      fundingSources: [],
      borrowingPreference: "Not set",
      borrowingComfort: "Not set",
      investmentHorizon: "Not set",
    };
  }

  let savingsNum = 0;
  if (typeof raw.personalSavings === "number") savingsNum = raw.personalSavings;
  else if (typeof raw.personalSavings === "string") {
    const parsed = parseFloat(raw.personalSavings.replace(/[^0-9.]/g, ""));
    if (!isNaN(parsed)) savingsNum = parsed;
  } else if (raw.availableCapitalINR) {
    savingsNum = Number(raw.availableCapitalINR);
  } else if (raw.budget_inr) {
    savingsNum = Number(raw.budget_inr);
  }

  let label = raw.rangeLabel;
  if (!label || label === "Not set") {
    if (savingsNum > 0) {
      if (savingsNum < 100000) label = "Below ₹1 Lakh";
      else if (savingsNum <= 500000) label = "₹1–5 Lakh";
      else if (savingsNum <= 1000000) label = "₹5–10 Lakh";
      else if (savingsNum <= 2500000) label = "₹10–25 Lakh";
      else label = "₹25 Lakh+";
    } else {
      label = "Not set";
    }
  }

  const borrowing = raw.borrowingPreference || raw.borrowingComfort || "Not set";
  const horizon = raw.investmentHorizon || "Not set";
  const sources = Array.isArray(raw.fundingSources) && raw.fundingSources.length > 0
    ? raw.fundingSources
    : Array.isArray(raw.capitalSources) && raw.capitalSources.length > 0
    ? raw.capitalSources
    : [];

  return {
    personalSavings: savingsNum,
    availableCapitalINR: savingsNum,
    rangeLabel: label,
    fundingSources: sources,
    borrowingPreference: borrowing,
    borrowingComfort: borrowing,
    investmentHorizon: horizon,
  };
}

function normalizeLocation(raw, user) {
  const defaultDistrict = user?.district || "Nagpur";
  const defaultTehsil = user?.tehsil || "Katol";
  const defaultCurrent = `${defaultDistrict} District`;

  if (!raw || typeof raw !== "object") {
    return {
      currentLocation: defaultCurrent,
      preferredBusinessLocation: defaultTehsil,
      operatingPreference: "Within native taluka / tehsil",
      willingToRelocate: "No, stay in home cluster",
    };
  }

  return {
    currentLocation: raw.currentLocation || raw.operatingArea || (raw.district ? `${raw.district} District` : defaultCurrent),
    preferredBusinessLocation: raw.preferredBusinessLocation || raw.selectedCluster || raw.preferredLocation || raw.tehsil || defaultTehsil,
    operatingPreference: raw.operatingPreference || "Within native taluka / tehsil",
    willingToRelocate: raw.willingToRelocate || "No, stay in home cluster",
  };
}

function normalizePreferences(raw) {
  if (!raw || typeof raw !== "object") {
    return {
      interestedSectors: [],
      preferredScale: "Not set",
      timeCommitment: "Not set",
      corePriorities: [],
    };
  }

  const sectors = Array.isArray(raw.interestedSectors)
    ? raw.interestedSectors
    : Array.isArray(raw.businessTypes)
    ? raw.businessTypes
    : Array.isArray(raw.sectors)
    ? raw.sectors
    : [];

  const scale = raw.preferredScale || raw.businessScale || raw.scale || "Not set";
  const commitment = raw.timeCommitment || raw.commitment || "Not set";
  const priorities = Array.isArray(raw.corePriorities)
    ? raw.corePriorities
    : Array.isArray(raw.priorities)
    ? raw.priorities
    : [];

  return {
    interestedSectors: sectors,
    preferredScale: scale,
    timeCommitment: commitment,
    corePriorities: priorities,
  };
}

function normalizePrivacy(raw) {
  const defaultPrivacy = {
    profileVisibility: "Relevant EntreVision users",
    collabVisibility: "Only relevant matches",
    showSkills: "Yes",
    showResources: "Only for collaboration matches",
    financialVisibility: "Private",
  };

  if (!raw || typeof raw !== "object") return defaultPrivacy;

  return {
    profileVisibility: raw.profileVisibility || defaultPrivacy.profileVisibility,
    collabVisibility: raw.collabVisibility || defaultPrivacy.collabVisibility,
    showSkills: raw.showSkills || defaultPrivacy.showSkills,
    showResources: raw.showResources || defaultPrivacy.showResources,
    financialVisibility: "Private",
  };
}

// ============================================================================
// MAIN PROFILE COMPONENT
// ============================================================================
export default function Profile() {
  const { user } = useAuth();
  const getUserKey = (key) => (user?.id ? `ev_${user.id}_${key}` : `ev_guest_${key}`);

  // Active view tab: "overview" | "about" | "skills" | "documents" | "resources" | "finances" | "locations" | "interests" | "privacy"
  const [activeSection, setActiveSection] = useState("overview");

  // Save feedback notification
  const [saveNotice, setSaveNotice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Profile Completion Modal (10.10)
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // File input ref for genuine document uploads
  const fileInputRef = React.useRef(null);
  const [uploadCategory, setUploadCategory] = useState("Certificate");

  // States initialized strictly from user-scoped storage without leaking other users' data
  const [aboutMe, setAboutMe] = useState(() => {
    try {
      if (user?.id) {
        const saved = localStorage.getItem(`ev_${user.id}_about_me`);
        if (saved) return normalizeAboutMe(JSON.parse(saved), user);
      }
    } catch (e) {}
    return normalizeAboutMe(null, user);
  });

  const [skillsData, setSkillsData] = useState(() => {
    try {
      if (user?.id) {
        const saved = localStorage.getItem(`ev_${user.id}_skills_data`);
        if (saved) return normalizeSkills(JSON.parse(saved));
      }
    } catch (e) {}
    return normalizeSkills(null);
  });

  const [documentsData, setDocumentsData] = useState(() => {
    try {
      if (user?.id) {
        const saved = localStorage.getItem(`ev_${user.id}_user_documents`);
        if (saved) return normalizeDocuments(JSON.parse(saved));
      }
    } catch (e) {}
    return normalizeDocuments(null);
  });

  const [resourcesData, setResourcesData] = useState(() => {
    try {
      if (user?.id) {
        const saved = localStorage.getItem(`ev_${user.id}_user_resources`);
        if (saved) return normalizeResources(JSON.parse(saved));
      }
    } catch (e) {}
    return normalizeResources(null);
  });

  const [financesData, setFinancesData] = useState(() => {
    try {
      if (user?.id) {
        const saved = localStorage.getItem(`ev_${user.id}_user_finances`);
        if (saved) return normalizeFinances(JSON.parse(saved));
      }
    } catch (e) {}
    return normalizeFinances(null);
  });

  const [locationData, setLocationData] = useState(() => {
    try {
      if (user?.id) {
        const saved = localStorage.getItem(`ev_${user.id}_user_location`);
        if (saved) return normalizeLocation(JSON.parse(saved), user);
      }
    } catch (e) {}
    return normalizeLocation(null, user);
  });

  const [preferencesData, setPreferencesData] = useState(() => {
    try {
      if (user?.id) {
        const saved = localStorage.getItem(`ev_${user.id}_user_preferences`);
        if (saved) return normalizePreferences(JSON.parse(saved));
      }
    } catch (e) {}
    return normalizePreferences(null);
  });

  const [privacyData, setPrivacyData] = useState(() => {
    try {
      if (user?.id) {
        const saved = localStorage.getItem(`ev_${user.id}_user_privacy`);
        if (saved) return normalizePrivacy(JSON.parse(saved));
      }
    } catch (e) {}
    return normalizePrivacy(null);
  });

  // Sync with user's persistent database profile
  useEffect(() => {
    if (!user?.id) {
      setLoadingProfile(false);
      return;
    }
    setLoadingProfile(true);
    fetchUserProfile(user.id)
      .then((data) => {
        if (data?.assessment_data) {
          const ad = data.assessment_data;
          if (ad.about_me) setAboutMe(normalizeAboutMe(ad.about_me, user));
          if (ad.skills_detailed || ad.skills) setSkillsData(normalizeSkills(ad.skills_detailed || ad.skills));
          if (ad.documents) setDocumentsData(normalizeDocuments(ad.documents));
          if (ad.resources_detailed) setResourcesData(normalizeResources(ad.resources_detailed));
          if (ad.finance_detailed) setFinancesData(normalizeFinances(ad.finance_detailed));
          if (ad.location_detailed) setLocationData(normalizeLocation(ad.location_detailed, user));
          if (ad.business_preferences) setPreferencesData(normalizePreferences(ad.business_preferences));
          persistUserAssessmentToStorage(user.id, ad, data.active_venture);
        } else {
          // If no stored assessment data, initialize fresh with this specific user's attributes
          const savedAbout = localStorage.getItem(`ev_${user.id}_about_me`);
          if (savedAbout) setAboutMe(normalizeAboutMe(JSON.parse(savedAbout), user));
          else setAboutMe(normalizeAboutMe(null, user));

          const savedSkills = localStorage.getItem(`ev_${user.id}_skills_data`);
          if (savedSkills) setSkillsData(normalizeSkills(JSON.parse(savedSkills)));
          else setSkillsData(normalizeSkills(null));

          const savedDocs = localStorage.getItem(`ev_${user.id}_user_documents`);
          if (savedDocs) setDocumentsData(normalizeDocuments(JSON.parse(savedDocs)));
          else setDocumentsData(normalizeDocuments(null));

          const savedRes = localStorage.getItem(`ev_${user.id}_user_resources`);
          if (savedRes) setResourcesData(normalizeResources(JSON.parse(savedRes)));
          else setResourcesData(normalizeResources(null));

          const savedFin = localStorage.getItem(`ev_${user.id}_user_finances`);
          if (savedFin) setFinancesData(normalizeFinances(JSON.parse(savedFin)));
          else setFinancesData(normalizeFinances(null));

          const savedLoc = localStorage.getItem(`ev_${user.id}_user_location`);
          if (savedLoc) setLocationData(normalizeLocation(JSON.parse(savedLoc), user));
          else setLocationData(normalizeLocation(null, user));

          const savedPref = localStorage.getItem(`ev_${user.id}_user_preferences`);
          if (savedPref) setPreferencesData(normalizePreferences(JSON.parse(savedPref)));
          else setPreferencesData(normalizePreferences(null));
        }
      })
      .catch((err) => {
        console.warn("Could not sync user profile from server:", err);
      })
      .finally(() => {
        setLoadingProfile(false);
      });
  }, [user?.id]);

  // Inline input states for Skill adding
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState("Intermediate");

  // Save all profile state to user-scoped storage & backend database
  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem(getUserKey("about_me"), JSON.stringify(aboutMe));
      localStorage.setItem(getUserKey("skills_data"), JSON.stringify(skillsData));
      localStorage.setItem(getUserKey("user_documents"), JSON.stringify(documentsData));
      localStorage.setItem(getUserKey("user_resources"), JSON.stringify(resourcesData));
      localStorage.setItem(getUserKey("user_finances"), JSON.stringify(financesData));
      localStorage.setItem(getUserKey("user_location"), JSON.stringify(locationData));
      localStorage.setItem(getUserKey("user_preferences"), JSON.stringify(preferencesData));
      localStorage.setItem(getUserKey("user_privacy"), JSON.stringify(privacyData));

      // Also persist to backend database
      if (user?.id) {
        const assessmentPayload = {
          about_me: aboutMe,
          skills_detailed: skillsData.skills,
          documents: documentsData,
          resources_detailed: resourcesData,
          finance_detailed: financesData,
          location_detailed: locationData,
          business_preferences: preferencesData,
        };
        await saveUserProfile({
          user_id: user.id,
          profile: {
            full_name: aboutMe.fullName,
            education: aboutMe.education,
            current_situation: aboutMe.currentSituation,
            district: locationData.currentLocation,
            tehsil: locationData.preferredBusinessLocation,
          },
          assessment_data: assessmentPayload,
        });
        persistUserAssessmentToStorage(user.id, assessmentPayload, null);
      }

      setSaveNotice(true);
      setTimeout(() => setSaveNotice(false), 2500);
    } catch (e) {
      console.error("Error saving profile:", e);
      alert("Failed to save profile changes to database. Please check your connection.");
    } finally {
      setIsSaving(false);
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

  // Financial capacity update handlers
  const handleUpdateFinanceAmount = (amount) => {
    const num = Math.max(0, Number(amount) || 0);
    let label = "Not set";
    if (num > 0) {
      if (num < 100000) label = "Below ₹1 Lakh";
      else if (num <= 500000) label = "₹1–5 Lakh";
      else if (num <= 1000000) label = "₹5–10 Lakh";
      else if (num <= 2500000) label = "₹10–25 Lakh";
      else label = "₹25 Lakh+";
    }
    setFinancesData((prev) => ({
      ...prev,
      personalSavings: num,
      availableCapitalINR: num,
      rangeLabel: label,
    }));
  };

  const handleToggleFundingSource = (source) => {
    setFinancesData((prev) => {
      const current = Array.isArray(prev.fundingSources) ? prev.fundingSources : [];
      const next = current.includes(source)
        ? current.filter((s) => s !== source)
        : [...current, source];
      return { ...prev, fundingSources: next };
    });
  };

  const handleUpdateBorrowing = (pref) => {
    setFinancesData((prev) => ({
      ...prev,
      borrowingPreference: pref,
      borrowingComfort: pref,
    }));
  };

  const handleUpdateHorizon = (horizon) => {
    setFinancesData((prev) => ({
      ...prev,
      investmentHorizon: horizon,
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
    const hasAbout = Boolean(aboutMe?.fullName && aboutMe?.education && aboutMe.education !== "Not specified");
    const hasSkills = Array.isArray(skillsData?.skills) && skillsData.skills.length >= 1;
    const hasResources = Array.isArray(resourcesData?.resources) && resourcesData.resources.some((r) => r.available);
    const hasLocation = Boolean(locationData?.preferredBusinessLocation && locationData.preferredBusinessLocation !== "Not specified");
    const hasPreferences = Array.isArray(preferencesData?.interestedSectors) && preferencesData.interestedSectors.length >= 1;
    const hasDocs = Array.isArray(documentsData) && documentsData.filter((d) => d.status === "Added").length >= 1;
    const hasSetup = Boolean(resourcesData?.existingSetup?.currentActivity && resourcesData.existingSetup.currentActivity !== "None" && resourcesData.existingSetup.currentActivity !== "");

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

  // File upload handler for actual documents / certificates
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newDoc = {
      id: `doc_${Date.now()}`,
      name: file.name.replace(/\.[^/.]+$/, ""),
      type: uploadCategory,
      relatedSkill: "Verified Credential",
      issuedBy: "Uploaded File",
      status: "Added",
      year: new Date().getFullYear().toString(),
    };
    setDocumentsData((prev) => [...(Array.isArray(prev) ? prev : []), newDoc]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerUpload = (category = "Certificate") => {
    setUploadCategory(category);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const skillsList = Array.isArray(skillsData?.skills) ? skillsData.skills : [];
  const docsList = Array.isArray(documentsData) ? documentsData : [];
  const resList = Array.isArray(resourcesData?.resources) ? resourcesData.resources : [];

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", paddingBottom: 60 }}>
      {/* Hidden file input for genuine document / certificate uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
        style={{ display: "none" }}
      />

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
                  {aboutMe?.fullName || user?.full_name || "New Entrepreneur"}
                </h1>
                <span className="badge-verified" style={{ fontSize: "0.72rem" }}>
                  Entrepreneur Profile
                </span>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 4, fontSize: "0.82rem", color: "var(--muted)", flexWrap: "wrap" }}>
                <span>🎓 {aboutMe?.education || "Education not specified"}</span>
                <span>📍 {locationData?.preferredBusinessLocation || user?.tehsil || "Location not set"}</span>
                <span>💼 {aboutMe?.currentSituation || "Status not specified"}</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {saveNotice && (
              <span style={{ fontSize: "0.82rem", color: "var(--ok)", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Check size={16} /> Saved to Database!
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
                  {completionStats.percentage < 50
                    ? "Complete your profile to unlock precision AI recommendations and DPRs."
                    : "Your profile is well developed for business matching and scheme funding."}
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
                  <strong>{aboutMe?.fullName || user?.full_name || "Not specified"}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 4 }}>
                  <span className="muted">Education:</span>
                  <strong>{aboutMe?.education || "Not specified"}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 4 }}>
                  <span className="muted">Location:</span>
                  <strong>{locationData?.currentLocation || "Not specified"}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="muted">Status:</span>
                  <strong style={{ color: "var(--cyan)" }}>{aboutMe?.currentSituation || "Not specified"}</strong>
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
                {skillsList.length === 0 ? (
                  <div style={{ color: "var(--muted)", fontStyle: "italic", padding: "8px 0" }}>
                    No skills added yet. Click Manage Skills to add your capabilities.
                  </div>
                ) : (
                  skillsList.map((s) => (
                    <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span>{s.icon} {s.name}</span>
                      <span className="tag" style={{ fontSize: "0.7rem" }}>{s.level}</span>
                    </div>
                  ))
                )}
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
                {docsList.length === 0 ? (
                  <div style={{ color: "var(--muted)", fontStyle: "italic", padding: "8px 0" }}>
                    No documents or certificates uploaded yet.
                  </div>
                ) : (
                  <>
                    <div style={{ color: "var(--ok)", fontWeight: 700 }}>
                      ✓ {docsList.filter((d) => d.status === "Added").length} certificates / documents added
                    </div>
                    {docsList.some((d) => d.status === "Needs Attention") && (
                      <div style={{ color: "#f59e0b", fontWeight: 700 }}>
                        ⚠ {docsList.filter((d) => d.status === "Needs Attention").length} document needs attention
                      </div>
                    )}
                  </>
                )}
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
                {resList.filter((r) => r.available).length === 0 ? (
                  <div style={{ color: "var(--muted)", fontStyle: "italic", padding: "8px 0" }}>
                    No resources configured yet. Click Edit Setup to add land, water, or machinery.
                  </div>
                ) : (
                  resList.slice(0, 3).map((r) => (
                    <div key={r.id} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>{r.icon} {r.name}</span>
                      <strong style={{ color: r.available ? "var(--ok)" : "var(--muted)" }}>{r.status}</strong>
                    </div>
                  ))
                )}
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
                  <strong>
                    {financesData?.personalSavings > 0
                      ? `${financesData.rangeLabel} (₹${financesData.personalSavings.toLocaleString("en-IN")})`
                      : "Not set"}
                  </strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="muted">Borrowing Preference:</span>
                  <strong>{formatBorrowingPreference(financesData?.borrowingPreference)}</strong>
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
                  <strong>{locationData?.currentLocation || "Not specified"}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className="muted">Preferred Business Location:</span>
                  <strong style={{ color: "var(--cyan)" }}>{locationData?.preferredBusinessLocation || "Not specified"}</strong>
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
            {skillsList.length === 0 ? (
              <div
                style={{
                  gridColumn: "1 / -1",
                  background: "var(--panel-subtle)",
                  padding: "24px 20px",
                  borderRadius: 12,
                  border: "1px dashed var(--line)",
                  textAlign: "center",
                  color: "var(--muted)",
                }}
              >
                No skills added yet. Add your agricultural, processing, or business skills below to get tailored matches.
              </div>
            ) : (
              skillsList.map((skill) => (
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
              ))
            )}
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
              {skillsData?.channels && skillsData.channels.length > 0 ? (
                skillsData.channels.map((c) => (
                  <span key={c} style={{ color: "var(--ok)", fontWeight: 700 }}>✓ {c}</span>
                ))
              ) : (
                <span style={{ color: "var(--muted)", fontStyle: "italic" }}>No acquisition channels recorded</span>
              )}
            </div>

            <div style={{ marginTop: 14, fontSize: "0.84rem" }}>
              <span className="muted">Willing to learn new skills?</span>
              <strong style={{ marginLeft: 8, color: "var(--text-heading)" }}>
                ● {skillsData?.willingToLearn || "Not specified"}
              </strong>
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
              onClick={() => triggerUpload("Document")}
              className="btn-primary-gloss"
              style={{ fontSize: "0.82rem", padding: "8px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Upload size={14} />
              <span>[+ Upload Document]</span>
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
                  onClick={() => triggerUpload("Certificate")}
                  className="pill-option-btn"
                  style={{ fontSize: "0.74rem", padding: "4px 8px", display: "inline-flex", alignItems: "center", gap: 4 }}
                >
                  <Upload size={12} />
                  <span>[+ Upload Certificate]</span>
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {docsList.filter((d) => d.type === "Certificate").length === 0 ? (
                  <div style={{ background: "var(--panel-subtle)", padding: "14px 16px", borderRadius: 10, border: "1px dashed var(--line)", color: "var(--muted)", fontStyle: "italic", fontSize: "0.85rem" }}>
                    No certificates uploaded. Upload your course completion, vocational, or CCRI training certificates.
                  </div>
                ) : (
                  docsList.filter((d) => d.type === "Certificate").map((doc) => (
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
                  ))
                )}
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
                  onClick={() => {
                    const org = prompt("Enter experience details (e.g. '2 years - Orchard Management'):");
                    if (org) {
                      setDocumentsData((prev) => [
                        ...(Array.isArray(prev) ? prev : []),
                        {
                          id: `exp_${Date.now()}`,
                          name: org,
                          type: "Experience",
                          relatedSkill: "Operations",
                          issuedBy: "Self / Family / Employer",
                          status: "Added",
                          year: new Date().getFullYear().toString(),
                        },
                      ]);
                    }
                  }}
                  className="pill-option-btn"
                  style={{ fontSize: "0.74rem", padding: "4px 8px" }}
                >
                  [+ Add Experience]
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {docsList.filter((d) => d.type === "Experience").length === 0 ? (
                  <div style={{ background: "var(--panel-subtle)", padding: "14px 16px", borderRadius: 10, border: "1px dashed var(--line)", color: "var(--muted)", fontStyle: "italic", fontSize: "0.85rem" }}>
                    No experience records added yet.
                  </div>
                ) : (
                  docsList.filter((d) => d.type === "Experience").map((exp) => (
                    <div key={exp.id} style={{ background: "var(--panel-subtle)", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--line)" }}>
                      <strong style={{ fontSize: "0.9rem", color: "var(--text-heading)" }}>
                        ✓ {exp.name}
                      </strong>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* OTHER DOCUMENTS SECTION */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--violet)", textTransform: "uppercase" }}>
                  OTHER DOCUMENTS & LICENSES
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {docsList.filter((d) => d.type !== "Certificate" && d.type !== "Experience").length === 0 ? (
                  <div style={{ background: "var(--panel-subtle)", padding: "14px 16px", borderRadius: 10, border: "1px dashed var(--line)", color: "var(--muted)", fontStyle: "italic", fontSize: "0.85rem" }}>
                    No other documents or licenses added.
                  </div>
                ) : (
                  docsList.filter((d) => d.type !== "Certificate" && d.type !== "Experience").map((doc) => (
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
                  ))
                )}
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
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted">Existing Business:</span>
                <strong>{resourcesData?.existingSetup?.hasExistingBusiness || "No"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted">Equipment:</span>
                <strong>{resourcesData?.existingSetup?.machineryAvailable || "None"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="muted">Current Activity:</span>
                <strong>{resourcesData?.existingSetup?.currentActivity || "None"}</strong>
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
          <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-heading)", margin: "0 0 6px" }}>
            💰 FINANCIAL CAPACITY
          </h2>
          <p className="muted" style={{ fontSize: "0.85rem", margin: "0 0 20px" }}>
            Configure your initial liquid capital, borrowing comfort, and funding sources to personalize venture recommendations and subsidy matches.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* 1. AVAILABLE INITIAL CAPITAL */}
            <div style={{ background: "var(--panel-subtle)", padding: 18, borderRadius: 12, border: "1px solid var(--line)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <label style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--text-heading)", textTransform: "uppercase" }}>
                  Available Initial Capital (₹)
                </label>
                <span className="pill" style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--cyan)" }}>
                  Bracket: {financesData?.rangeLabel || "Not set"}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--muted)" }}>₹</span>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  placeholder="e.g. 250000"
                  value={financesData?.personalSavings || ""}
                  onChange={(e) => handleUpdateFinanceAmount(e.target.value)}
                  className="input-gloss"
                  style={{
                    flex: 1,
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    padding: "10px 14px",
                    color: "var(--text-heading)",
                  }}
                />
              </div>

              {/* Quick Preset Buttons */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: "0.74rem", color: "var(--muted)", fontWeight: 600 }}>Quick Presets:</span>
                {[
                  { label: "₹50,000 (Below 1L)", amount: 50000 },
                  { label: "₹2.5 Lakh (1–5L)", amount: 250000 },
                  { label: "₹7.5 Lakh (5–10L)", amount: 750000 },
                  { label: "₹15 Lakh (10–25L)", amount: 1500000 },
                  { label: "₹30 Lakh (25L+)", amount: 3000000 },
                ].map((preset) => {
                  const isCurrent = financesData?.personalSavings === preset.amount;
                  return (
                    <button
                      key={preset.amount}
                      type="button"
                      onClick={() => handleUpdateFinanceAmount(preset.amount)}
                      className={`pill-option-btn ${isCurrent ? "active" : ""}`}
                      style={{ fontSize: "0.76rem", padding: "4px 10px" }}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. BORROWING PREFERENCE */}
            <div style={{ background: "var(--panel-subtle)", padding: 18, borderRadius: 12, border: "1px solid var(--line)" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--text-heading)", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
                Borrowing & Loan Preference
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10 }}>
                {[
                  {
                    id: "no_loan",
                    title: "No loan (100% Self-funded)",
                    desc: "Prefer zero debt, investing solely from own savings",
                  },
                  {
                    id: "small_loan",
                    title: "Small loan (20–30% of project)",
                    desc: "Open to minor working capital or Mudra micro-loans",
                  },
                  {
                    id: "open_to_loans",
                    title: "Open to loans with subsidy (PMFME 35%)",
                    desc: "Interested in bank term loans backed by government subsidies",
                  },
                  {
                    id: "significant_financing",
                    title: "Significant project financing (up to 75%)",
                    desc: "Willing to leverage major bank finance for high-scale capex",
                  },
                ].map((item) => {
                  const isSelected = financesData?.borrowingPreference === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleUpdateBorrowing(item.id)}
                      className={`pill-option-btn ${isSelected ? "active" : ""}`}
                      style={{
                        padding: 12,
                        textAlign: "left",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        alignItems: "flex-start",
                        borderRadius: 10,
                        border: isSelected ? "1.5px solid var(--cyan)" : "1px solid var(--line)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: "0.86rem", color: isSelected ? "var(--cyan)" : "var(--text-heading)" }}>
                        <span>{isSelected ? "●" : "○"}</span>
                        <span>{item.title}</span>
                      </div>
                      <span style={{ fontSize: "0.74rem", color: "var(--muted)", lineHeight: 1.3 }}>{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. FUNDING SOURCES */}
            <div style={{ background: "var(--panel-subtle)", padding: 18, borderRadius: 12, border: "1px solid var(--line)" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--text-heading)", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
                Eligible / Intended Funding Sources
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  "Personal Savings (Liquid funds)",
                  "Family / Partner Contribution",
                  "Government Subsidy (PMFME 35% / MIDH)",
                  "Bank Term Loan",
                  "Mudra / Micro-Enterprise Credit",
                  "Kisan Credit Card (KCC)",
                ].map((src) => {
                  const isSelected = Array.isArray(financesData?.fundingSources) && financesData.fundingSources.includes(src);
                  return (
                    <button
                      key={src}
                      type="button"
                      onClick={() => handleToggleFundingSource(src)}
                      className={`pill-option-btn ${isSelected ? "active" : ""}`}
                      style={{ fontSize: "0.82rem", padding: "6px 12px" }}
                    >
                      <span>{isSelected ? "☑" : "☐"}</span>
                      <span>{src}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. INVESTMENT HORIZON */}
            <div style={{ background: "var(--panel-subtle)", padding: 18, borderRadius: 12, border: "1px solid var(--line)" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 800, color: "var(--text-heading)", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
                Investment Horizon
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  { id: "immediately", label: "⚡ Immediately (Capital ready)" },
                  { id: "within_3_months", label: "🌱 Within 3 months" },
                  { id: "within_6_months", label: "📅 Within 6 months" },
                  { id: "within_1_year", label: "⏳ Within 1 year" },
                  { id: "exploring", label: "🔍 Exploring feasibility" },
                ].map((h) => {
                  const isSelected = financesData?.investmentHorizon === h.id;
                  return (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => handleUpdateHorizon(h.id)}
                      className={`pill-option-btn ${isSelected ? "active" : ""}`}
                      style={{ fontSize: "0.82rem", padding: "6px 12px" }}
                    >
                      <span>{isSelected ? "●" : "○"}</span>
                      <span>{h.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BOTTOM SAVE CONTROLS & LINK */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, flexWrap: "wrap", gap: 10 }}>
              <Link
                to="/financial-assistant"
                className="btn-secondary-gloss"
                style={{ fontSize: "0.82rem", padding: "8px 14px", textDecoration: "none" }}
              >
                Detailed CapEx & Subsidy Calculator →
              </Link>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="btn-primary-gloss"
                style={{ fontSize: "0.88rem", padding: "8px 22px" }}
              >
                {isSaving ? "Saving..." : "Save Financial Capacity"}
              </button>
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
                {locationData?.currentLocation || "Not specified"}
              </div>
            </div>

            <div style={{ background: "var(--panel-subtle)", padding: 16, borderRadius: 12, border: "1px solid var(--line)" }}>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                Preferred Business Location
              </span>
              <div style={{ fontSize: "1rem", fontWeight: 800, color: "var(--cyan)", marginTop: 2 }}>
                {locationData?.preferredBusinessLocation || "Not specified"}
              </div>
            </div>

            <div style={{ background: "var(--panel-subtle)", padding: 16, borderRadius: 12, border: "1px solid var(--line)" }}>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                Operating Preference
              </span>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-heading)", marginTop: 2 }}>
                {locationData?.operatingPreference || "Not specified"}
              </div>
            </div>

            <div style={{ background: "var(--panel-subtle)", padding: 16, borderRadius: 12, border: "1px solid var(--line)" }}>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                Willing to Relocate?
              </span>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--ok)", marginTop: 2 }}>
                {locationData?.willingToRelocate || "Not specified"}
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
                {preferencesData?.interestedSectors && preferencesData.interestedSectors.length > 0 ? (
                  preferencesData.interestedSectors.map((s) => (
                    <span key={s} style={{ color: "var(--ok)", fontWeight: 700 }}>✓ {s}</span>
                  ))
                ) : (
                  <span style={{ color: "var(--muted)", fontStyle: "italic" }}>None specified</span>
                )}
              </div>
            </div>

            <div style={{ background: "var(--panel-subtle)", padding: 16, borderRadius: 12, border: "1px solid var(--line)" }}>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                Preferred Scale
              </span>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-heading)", marginTop: 2 }}>
                {preferencesData?.preferredScale || "Not set"}
              </div>
            </div>

            <div style={{ background: "var(--panel-subtle)", padding: 16, borderRadius: 12, border: "1px solid var(--line)" }}>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                Time Commitment
              </span>
              <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-heading)", marginTop: 2 }}>
                {preferencesData?.timeCommitment || "Not set"}
              </div>
            </div>

            <div style={{ background: "var(--panel-subtle)", padding: 16, borderRadius: 12, border: "1px solid var(--line)" }}>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                Priorities
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6, fontSize: "0.85rem" }}>
                {preferencesData?.corePriorities && preferencesData.corePriorities.length > 0 ? (
                  preferencesData.corePriorities.map((p) => (
                    <span key={p} style={{ color: "var(--cyan)", fontWeight: 700 }}>✓ {p}</span>
                  ))
                ) : (
                  <span style={{ color: "var(--muted)", fontStyle: "italic" }}>None specified</span>
                )}
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
