import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSkills, fetchResources, fetchLocations, getRecommendations } from "../services/api";
import { Sparkles, MapPin, CheckCircle, ArrowRight, ArrowLeft, Building2, Store, Snowflake, FlaskConical, Award, ShieldCheck, HelpCircle } from "lucide-react";
import OpportunityWizardTracker from "../components/opportunity/OpportunityWizardTracker";
import AboutMeStep from "../components/opportunity/AboutMeStep";
import SkillsStep from "../components/opportunity/SkillsStep";
import DocumentsStep, { DEFAULT_DOCUMENTS } from "../components/opportunity/DocumentsStep";
import ResourcesStep, { DEFAULT_RESOURCE_STATE } from "../components/opportunity/ResourcesStep";
import LocationStep, { DEFAULT_LOCATION_STATE } from "../components/opportunity/LocationStep";
import FinanceStep, { DEFAULT_FINANCE_STATE } from "../components/opportunity/FinanceStep";
import BusinessPreferencesStep, { DEFAULT_PREFERENCES_STATE } from "../components/opportunity/BusinessPreferencesStep";
import AnalysisScreen from "../components/opportunity/AnalysisScreen";

// Ecosystem mapping per micro-location
const LOCATION_ECOSYSTEM = {
  Katol: {
    research: "Regional Citrus Nursery & ICAR-CCRI Outreach Centre",
    market: "Katol APMC Orange Sub-Market Yard",
    storage: "Katol Farm-Gate Pre-Cooling & Chilling Units (350 MT)",
    industrial: "Katol Agro-Processing Cluster & MIDC Zone",
  },
  Narkhed: {
    research: "Citrus Disease Surveillance Cell (CCRI Network)",
    market: "Narkhed APMC Fruit Market (Direct Rail Loading)",
    storage: "Narkhed Cold Chain Staging Yard (1,200 MT)",
    industrial: "Amravati-Nagpur Border Agro Highway Corridor",
  },
  "Warud-Morshi": {
    research: "Horticulture Training Institute & CCRI Demonstration Plots",
    market: "Warud APMC Mandi (High-volume Mandarin Trading)",
    storage: "Warud Regional Packhouse & Shellac Waxing Line (2,000 MT)",
    industrial: "Warud Food Processing Industrial Cluster",
  },
  Kalmeshwar: {
    research: "MIDC Agro Testing & Soil Chemistry Lab",
    market: "Kalmeshwar APMC & Direct Wholesale Stalls",
    storage: "Kalmeshwar Multi-Commodity Cold Room (800 MT)",
    industrial: "Kalmeshwar MIDC Industrial Zone",
  },
  "Kalamna APMC": {
    research: "APEDA Export Certification & Quality Lab",
    market: "Central Kalamna APMC Fruit & Veg Yard (Asia's Top Mandi)",
    storage: "Kailasya Agro Industries & Multi-Chamber Storage (5,000 MT)",
    industrial: "Nagpur Central Logistics & Wholesale Hub",
  },
  "Hingna MIDC": {
    research: "VNIT & MSME Technology Incubation Centre",
    market: "Direct Nagpur Urban FMCG & Retail Distribution",
    storage: "B.K. Spices & Flowers Cold Storage (733.64 MT)",
    industrial: "Five Star Industrial Area, MIDC Hingna",
  },
  "Butibori MIDC": {
    research: "Central Food Technological Testing Labs",
    market: "National Highway FMCG Freight Network",
    storage: "Ras Frozen Foods IQF & Cold Chain (3,500 MT)",
    industrial: "Butibori 5-Star Industrial Estate (Large Scale Manufacturing)",
  },
  MIHAN: {
    research: "APEDA & Export Inspection Council Facility",
    market: "Air Cargo & Multimodal International Freight Hub",
    storage: "MIHAN Air-Cargo Perishable Handling Center (1,500 MT)",
    industrial: "Special Economic Zone (SEZ) & Global Logistics",
  },
  Mohpa: {
    research: "Katol-Mohpa Agro Advisory Centre",
    market: "Mohpa Primary Farm-Gate Collection Center",
    storage: "Farm-Level Zero Energy Cool Chambers (ZECC)",
    industrial: "Mohpa Rural Micro-Enterprise Belt",
  },
  Ramtek: {
    research: "Krishi Vigyan Kendra (KVK) Ramtek",
    market: "Ramtek Agro Mandi & Pilgrim Tourism Market",
    storage: "Ramtek Horticulture Packhouse (500 MT)",
    industrial: "Ramtek-Mansar Industrial Link",
  },
};

export default function VentureKhoj() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Available options from backend
  const [skillsList, setSkillsList] = useState([]);
  const [resourcesList, setResourcesList] = useState([]);
  const [locationsList, setLocationsList] = useState([]);

  // Step 1 (About Me) State
  const [aboutMe, setAboutMe] = useState(() => {
    try {
      const saved = localStorage.getItem("ev_about_me");
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      fullName: "",
      ageGroup: "18–25",
      education: "",
      currentSituation: "looking_opportunity",
      existingBusinessType: "",
      existingBusinessGoal: "",
      goals: ["first_business", "explore_local"],
    };
  });

  // Step 2 (Skills & Experience) State
  const [selectedSkillsData, setSelectedSkillsData] = useState(() => {
    try {
      const saved = localStorage.getItem("ev_skills_data");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        skillId: "SKL05",
        name: "Food Processing",
        icon: "🥤",
        proficiency: "Expert",
        yearsExperience: "2 years",
        howAcquired: "Training / certification",
        certificateName: "ICAR-CCRI Fruit Processing & Debittering",
        issuingOrg: "ICAR-CCRI Nagpur",
        certYear: "2023",
        certFileName: "ccri_debittering_cert.pdf",
        orgName: "",
        role: "",
        expDuration: "",
        expFileName: "",
      },
      {
        skillId: "SKL01",
        name: "Farming",
        icon: "🌱",
        proficiency: "Beginner",
        yearsExperience: "1 year",
        howAcquired: "Family business",
        certificateName: "",
        issuingOrg: "",
        certYear: "",
        certFileName: "",
        orgName: "",
        role: "",
        expDuration: "",
        expFileName: "",
      },
    ];
  });

  const [willingnessToLearn, setWillingnessToLearn] = useState("willing_to_learn");

  // Step 3 (Certificates & Documents) State
  const [documents, setDocuments] = useState(() => {
    try {
      const saved = localStorage.getItem("ev_user_documents");
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_DOCUMENTS;
  });

  // Step 4 (Resources & Existing Setup) State
  const [resourcesData, setResourcesData] = useState(() => {
    try {
      const saved = localStorage.getItem("ev_user_resources");
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_RESOURCE_STATE;
  });

  // Step 5 (Location & Local Ecosystem) State
  const [locationData, setLocationData] = useState(() => {
    try {
      const saved = localStorage.getItem("ev_user_location");
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_LOCATION_STATE;
  });

  // Step 6 (Financial Capacity) State
  const [financeData, setFinanceData] = useState(() => {
    try {
      const saved = localStorage.getItem("ev_user_finances");
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_FINANCE_STATE;
  });

  // Step 7 (Business Preferences) State
  const [preferencesData, setPreferencesData] = useState(() => {
    try {
      const saved = localStorage.getItem("ev_user_preferences");
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PREFERENCES_STATE;
  });

  // Analysis Screen state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResultData, setAnalysisResultData] = useState(null);

  // Fallback states for API compatibility
  const [location, setLocation] = useState("Katol");
  const [budget, setBudget] = useState(300000);
  const [fundingPref, setFundingPref] = useState("subsidy_and_loan");
  const [riskTolerance, setRiskTolerance] = useState("moderate");

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
        if (l.length > 0 && !locationData.selectedCluster) {
          setLocation(l[0].location_name);
        }
      } catch (err) {
        console.error("Error loading questionnaire data:", err);
      } finally {
        setDataLoading(false);
      }
    }
    loadInitialData();
  }, []);

  const handleAboutMeChange = (updates) => {
    setAboutMe((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem("ev_about_me", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleSkillsStepChange = (updates) => {
    if (updates.selectedSkillsData) {
      setSelectedSkillsData(updates.selectedSkillsData);
      try {
        localStorage.setItem("ev_skills_data", JSON.stringify(updates.selectedSkillsData));
      } catch {}
    }
    if (updates.willingnessToLearn) {
      setWillingnessToLearn(updates.willingnessToLearn);
    }
  };

  const handleDocumentsStepChange = (updates) => {
    if (updates.documents) {
      setDocuments(updates.documents);
      try {
        localStorage.setItem("ev_user_documents", JSON.stringify(updates.documents));
      } catch {}
    }
  };

  const handleResourcesStepChange = (updates) => {
    if (updates.resourcesData) {
      setResourcesData(updates.resourcesData);
      try {
        localStorage.setItem("ev_user_resources", JSON.stringify(updates.resourcesData));
      } catch {}
    }
  };

  const handleLocationStepChange = (updates) => {
    if (updates.locationData) {
      setLocationData(updates.locationData);
      const chosenCluster = updates.locationData.selectedCluster || "Katol";
      setLocation(chosenCluster);
      try {
        localStorage.setItem("ev_user_location", JSON.stringify(updates.locationData));
      } catch {}
    }
  };

  const handleFinanceStepChange = (updates) => {
    if (updates.financeData) {
      setFinanceData(updates.financeData);
      if (updates.financeData.availableCapitalINR) {
        setBudget(updates.financeData.availableCapitalINR);
      }
      if (updates.financeData.borrowingComfort === "no_loan") {
        setFundingPref("self");
      } else {
        setFundingPref("subsidy_and_loan");
      }
      try {
        localStorage.setItem("ev_user_finances", JSON.stringify(updates.financeData));
      } catch {}
    }
  };

  const handlePreferencesStepChange = (updates) => {
    if (updates.preferencesData) {
      setPreferencesData(updates.preferencesData);
      if (updates.preferencesData.riskTolerance) {
        setRiskTolerance(updates.preferencesData.riskTolerance);
      }
      if (updates.preferencesData.willingnessToLearn) {
        setWillingnessToLearn(updates.preferencesData.willingnessToLearn);
      }
      try {
        localStorage.setItem("ev_user_preferences", JSON.stringify(updates.preferencesData));
      } catch {}
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setIsAnalyzing(true);
    try {
      const extractedSkillIds = selectedSkillsData.map((s) => s.skillId);
      const activeLocation = locationData.selectedCluster || location || "Katol";
      const activeBudget = financeData.availableCapitalINR || budget || 300000;
      const payload = {
        about_me: aboutMe,
        skills: extractedSkillIds,
        skills_detailed: selectedSkillsData,
        willingness_to_learn: preferencesData.willingnessToLearn || willingnessToLearn,
        documents: documents,
        resources_detailed: resourcesData,
        has_land: resourcesData.hasLand,
        land_acres: resourcesData.hasLand ? parseFloat(resourcesData.landAcres) : 0.0,
        location: activeLocation,
        location_detailed: locationData,
        budget_inr: parseFloat(activeBudget),
        finance_detailed: financeData,
        business_preferences: preferencesData,
        needs_funding: financeData.borrowingComfort !== "no_loan",
        funding_preference: fundingPref,
        preferences: {
          risk_tolerance: preferencesData.riskTolerance || riskTolerance,
          business_types: preferencesData.businessTypes,
          scale: preferencesData.businessScale,
          time_commitment: preferencesData.timeCommitment,
        },
      };
      const results = await getRecommendations(payload);
      setAnalysisResultData({ results, userInput: payload });
      try {
        localStorage.setItem("ev_assessment_results", JSON.stringify({ results, userInput: payload }));
      } catch (e) {}
    } catch (err) {
      console.error("Error calculating recommendations:", err);
      // Fallback in case of backend delay
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysisComplete = () => {
    const dataToPass = analysisResultData || {
      results: null,
      userInput: { location: locationData.selectedCluster || "Katol", budget_inr: financeData.availableCapitalINR },
    };
    navigate("/results", { state: dataToPass });
  };

  const currentEco = LOCATION_ECOSYSTEM[location] || {
    research: "ICAR-CCRI Research & Nursery Lab",
    market: "Kalamna APMC Market Yard",
    storage: "Nagpur Regional Cold Storage Network",
    industrial: "Nagpur Agro Industrial Zone",
  };

  if (dataLoading) {
    return (
      <div className="card" style={{ textAlign: "center", padding: 48 }}>
        <p className="muted">Loading EntreVision recommendation options...</p>
      </div>
    );
  }

  return (
    <div className="wizard-main-wrapper">
      {/* 7-Step Progress Tracker */}
      {!isAnalyzing && (
        <OpportunityWizardTracker currentStep={step} onStepClick={(targetStep) => setStep(targetStep)} />
      )}

      {/* PAGE 2.8 — ANALYSIS PROCESSING SCREEN */}
      {isAnalyzing && (
        <AnalysisScreen onComplete={handleAnalysisComplete} />
      )}

      {/* STEP 1: PAGE 2.1 — ABOUT ME */}
      {!isAnalyzing && step === 1 && (
        <AboutMeStep
          data={aboutMe}
          onChange={handleAboutMeChange}
          onNext={() => setStep(2)}
        />
      )}

      {/* STEP 2: PAGE 2.2 — SKILLS & EXPERIENCE */}
      {!isAnalyzing && step === 2 && (
        <SkillsStep
          skillsList={skillsList}
          selectedSkillsData={selectedSkillsData}
          willingnessToLearn={willingnessToLearn}
          onChange={handleSkillsStepChange}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {/* STEP 3: PAGE 2.3 — CERTIFICATES & DOCUMENTS */}
      {!isAnalyzing && step === 3 && (
        <DocumentsStep
          documents={documents}
          onChange={handleDocumentsStepChange}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}

      {/* STEP 4: PAGE 2.4 — RESOURCES & EXISTING SETUP */}
      {!isAnalyzing && step === 4 && (
        <ResourcesStep
          resourcesData={resourcesData}
          onChange={handleResourcesStepChange}
          onNext={() => setStep(5)}
          onBack={() => setStep(3)}
        />
      )}

      {/* STEP 5: PAGE 2.5 — LOCATION & LOCAL ECOSYSTEM */}
      {!isAnalyzing && step === 5 && (
        <LocationStep
          locationData={locationData}
          locationsList={locationsList}
          onChange={handleLocationStepChange}
          onNext={() => setStep(6)}
          onBack={() => setStep(4)}
        />
      )}

      {/* STEP 6: PAGE 2.6 — FINANCIAL CAPACITY */}
      {!isAnalyzing && step === 6 && (
        <FinanceStep
          financeData={financeData}
          onChange={handleFinanceStepChange}
          onNext={() => setStep(7)}
          onBack={() => setStep(5)}
        />
      )}

      {/* STEP 7: PAGE 2.7 — BUSINESS PREFERENCES */}
      {!isAnalyzing && step === 7 && (
        <BusinessPreferencesStep
          preferencesData={preferencesData}
          onChange={handlePreferencesStepChange}
          onSubmit={handleSubmit}
          onBack={() => setStep(6)}
          loading={loading}
        />
      )}
    </div>
  );
}
