import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchSkills, fetchResources, fetchLocations, getRecommendations, fetchUserProfile, saveUserProfile } from "../services/api";
import { useAuth, persistUserAssessmentToStorage } from "../context/AuthContext";
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

export default function VentureKhoj() {
  const navigate = useNavigate();
  const { user, setActiveVenture } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Available options from backend
  const [skillsList, setSkillsList] = useState([]);
  const [resourcesList, setResourcesList] = useState([]);
  const [locationsList, setLocationsList] = useState([]);

  const getUserKey = (key) => (user?.id ? `ev_${user.id}_${key}` : `ev_guest_${key}`);

  // Step 1 (About Me) State
  const [aboutMe, setAboutMe] = useState(() => {
    try {
      const uKey = user?.id ? `ev_${user.id}_about_me` : "ev_guest_about_me";
      const saved = localStorage.getItem(uKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      fullName: user?.full_name || "",
      ageGroup: "",
      education: "",
      currentSituation: "",
      existingBusinessType: "",
      existingBusinessGoal: "",
      goals: [],
    };
  });

  // Step 2 (Skills & Experience) State - Clean empty array by default
  const [selectedSkillsData, setSelectedSkillsData] = useState(() => {
    try {
      const uKey = user?.id ? `ev_${user.id}_skills_data` : "ev_guest_skills_data";
      const saved = localStorage.getItem(uKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
        if (parsed && typeof parsed === "object" && Array.isArray(parsed.skills)) return parsed.skills;
      }
    } catch {}
    return [];
  });

  const [willingnessToLearn, setWillingnessToLearn] = useState("willing_to_learn");

  // Step 3 (Certificates & Documents) State
  const [documents, setDocuments] = useState(() => {
    try {
      const uKey = user?.id ? `ev_${user.id}_user_documents` : "ev_guest_user_documents";
      const saved = localStorage.getItem(uKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_DOCUMENTS;
  });

  // Step 4 (Resources & Existing Setup) State
  const [resourcesData, setResourcesData] = useState(() => {
    try {
      const uKey = user?.id ? `ev_${user.id}_user_resources` : "ev_guest_user_resources";
      const saved = localStorage.getItem(uKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_RESOURCE_STATE;
  });

  // Step 5 (Location & Local Ecosystem) State
  const [locationData, setLocationData] = useState(() => {
    try {
      const uKey = user?.id ? `ev_${user.id}_user_location` : "ev_guest_user_location";
      const saved = localStorage.getItem(uKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      ...DEFAULT_LOCATION_STATE,
      selectedCluster: user?.tehsil || "Katol",
      operatingArea: user?.district || "Nagpur District",
    };
  });

  // Step 6 (Financial Capacity) State
  const [financeData, setFinanceData] = useState(() => {
    try {
      const uKey = user?.id ? `ev_${user.id}_user_finances` : "ev_guest_user_finances";
      const saved = localStorage.getItem(uKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_FINANCE_STATE;
  });

  // Step 7 (Business Preferences) State
  const [preferencesData, setPreferencesData] = useState(() => {
    try {
      const uKey = user?.id ? `ev_${user.id}_user_preferences` : "ev_guest_user_preferences";
      const saved = localStorage.getItem(uKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_PREFERENCES_STATE;
  });

  // Analysis Screen state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResultData, setAnalysisResultData] = useState(null);

  // Fallback states for API compatibility
  const [location, setLocation] = useState(user?.tehsil || "Katol");
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

  // Sync state when authenticated user changes or loads
  useEffect(() => {
    if (!user?.id) return;
    fetchUserProfile(user.id)
      .then((res) => {
        if (res?.assessment_data) {
          const ad = res.assessment_data;
          if (ad.about_me) setAboutMe(ad.about_me);
          if (Array.isArray(ad.skills_detailed)) setSelectedSkillsData(ad.skills_detailed);
          if (ad.willingness_to_learn) setWillingnessToLearn(ad.willingness_to_learn);
          if (ad.documents) setDocuments(ad.documents);
          if (ad.resources_detailed) setResourcesData(ad.resources_detailed);
          if (ad.location_detailed) {
            setLocationData(ad.location_detailed);
            if (ad.location_detailed.selectedCluster) setLocation(ad.location_detailed.selectedCluster);
          }
          if (ad.finance_detailed) {
            setFinanceData(ad.finance_detailed);
            if (ad.finance_detailed.availableCapitalINR) setBudget(ad.finance_detailed.availableCapitalINR);
          }
          if (ad.business_preferences) {
            setPreferencesData(ad.business_preferences);
            if (ad.business_preferences.riskTolerance) setRiskTolerance(ad.business_preferences.riskTolerance);
          }
        } else {
          // Fresh user with no saved assessment — reset to clean defaults
          setAboutMe({
            fullName: user.full_name || "",
            ageGroup: "18–25",
            education: "",
            currentSituation: "looking_opportunity",
            existingBusinessType: "",
            existingBusinessGoal: "",
            goals: ["first_business", "explore_local"],
          });
          setSelectedSkillsData([]);
          setWillingnessToLearn("willing_to_learn");
          setDocuments(DEFAULT_DOCUMENTS);
          setResourcesData(DEFAULT_RESOURCE_STATE);
          setLocationData({
            ...DEFAULT_LOCATION_STATE,
            selectedCluster: user.tehsil || "Katol",
            operatingArea: user.district || "Nagpur District",
          });
          setFinanceData(DEFAULT_FINANCE_STATE);
          setPreferencesData(DEFAULT_PREFERENCES_STATE);
        }
      })
      .catch((err) => {
        console.warn("Could not load backend user profile:", err);
      });
  }, [user?.id]);

  const handleAboutMeChange = (updates) => {
    setAboutMe((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(getUserKey("about_me"), JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleSkillsStepChange = (updates) => {
    if (updates.selectedSkillsData) {
      setSelectedSkillsData(updates.selectedSkillsData);
      try {
        localStorage.setItem(getUserKey("skills_data"), JSON.stringify(updates.selectedSkillsData));
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
        localStorage.setItem(getUserKey("user_documents"), JSON.stringify(updates.documents));
      } catch {}
    }
  };

  const handleResourcesStepChange = (updates) => {
    if (updates.resourcesData) {
      setResourcesData(updates.resourcesData);
      try {
        localStorage.setItem(getUserKey("user_resources"), JSON.stringify(updates.resourcesData));
      } catch {}
    }
  };

  const handleLocationStepChange = (updates) => {
    if (updates.locationData) {
      setLocationData(updates.locationData);
      const chosenCluster = updates.locationData.selectedCluster || "Katol";
      setLocation(chosenCluster);
      try {
        localStorage.setItem(getUserKey("user_location"), JSON.stringify(updates.locationData));
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
        localStorage.setItem(getUserKey("user_finances"), JSON.stringify(updates.financeData));
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
        localStorage.setItem(getUserKey("user_preferences"), JSON.stringify(updates.preferencesData));
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

      const extractedResourceIds = [];
      if (resourcesData.hasLand) extractedResourceIds.push("RES01");
      if (resourcesData.waterSources?.some((w) => ["borewell", "drip_irrigation", "canal"].includes(w))) extractedResourceIds.push("RES02");
      if (resourcesData.transportModes?.some((t) => t.type === "tractor")) extractedResourceIds.push("RES03");
      if (resourcesData.equipmentList?.some((e) => e.id === "polyhouse")) extractedResourceIds.push("RES04");
      if (resourcesData.hasWorkspace) extractedResourceIds.push("RES05");
      if (resourcesData.powerType === "three_phase") extractedResourceIds.push("RES06");
      if (resourcesData.equipmentList?.some((e) => e.id === "dry_storage")) extractedResourceIds.push("RES07");
      if (resourcesData.equipmentList?.some((e) => e.id === "juice_extractor")) extractedResourceIds.push("RES08");
      if (resourcesData.equipmentList?.some((e) => e.id === "peel_oil_unit")) extractedResourceIds.push("RES09");
      if (resourcesData.transportModes?.some((t) => ["mini_truck", "freight_truck", "reefer"].includes(t.type))) extractedResourceIds.push("RES10");
      if (resourcesData.equipmentList?.some((e) => e.id === "grading_line")) extractedResourceIds.push("RES11");
      if (resourcesData.equipmentList?.some((e) => e.id === "cold_storage")) extractedResourceIds.push("RES12");

      const parsedCapital = parseFloat(activeBudget) || 200000;
      let calculatedLabel = "₹1–5 Lakh";
      if (parsedCapital < 100000) calculatedLabel = "Below ₹1 Lakh";
      else if (parsedCapital <= 500000) calculatedLabel = "₹1–5 Lakh";
      else if (parsedCapital <= 1000000) calculatedLabel = "₹5–10 Lakh";
      else if (parsedCapital <= 2500000) calculatedLabel = "₹10–25 Lakh";
      else calculatedLabel = "₹25 Lakh+";

      const enrichedFinanceData = {
        ...financeData,
        availableCapitalINR: parsedCapital,
        personalSavings: parsedCapital,
        rangeLabel: calculatedLabel,
        borrowingComfort: financeData.borrowingComfort || "open_to_loans",
        borrowingPreference: financeData.borrowingComfort || "open_to_loans",
        fundingSources: Array.isArray(financeData.fundingSources) && financeData.fundingSources.length > 0 ? financeData.fundingSources : ["Personal Savings", "PMFME 35% Subsidy"],
        investmentHorizon: financeData.investmentHorizon || "within_3_months",
      };

      const payload = {
        user_id: user?.id,
        about_me: aboutMe,
        skills: extractedSkillIds,
        skills_detailed: selectedSkillsData,
        willingness_to_learn: preferencesData.willingnessToLearn || willingnessToLearn,
        documents: documents,
        resources: extractedResourceIds,
        resources_detailed: resourcesData,
        has_land: resourcesData.hasLand,
        land_acres: resourcesData.hasLand ? parseFloat(resourcesData.landAcres) : 0.0,
        location: activeLocation,
        location_detailed: locationData,
        budget_inr: parsedCapital,
        finance_detailed: enrichedFinanceData,
        business_preferences: preferencesData,
        interests: preferencesData.businessTypes || [],
        risk_tolerance: preferencesData.riskTolerance || riskTolerance || "moderate_risk",
        business_scale: preferencesData.businessScale || "small",
        time_commitment: preferencesData.timeCommitment || "full_time",
        needs_funding: enrichedFinanceData.borrowingComfort !== "no_loan",
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
        localStorage.setItem(getUserKey("assessment_results"), JSON.stringify({ results, userInput: payload }));
      } catch (e) {}

      if (user?.id) {
        const assessmentPayload = {
          about_me: aboutMe,
          skills_detailed: selectedSkillsData,
          willingness_to_learn: preferencesData.willingnessToLearn || willingnessToLearn,
          documents: documents,
          resources_detailed: resourcesData,
          finance_detailed: enrichedFinanceData,
          location_detailed: locationData,
          business_preferences: preferencesData,
          latest_recommendations: results,
        };
        persistUserAssessmentToStorage(user.id, assessmentPayload, null);
        saveUserProfile({
          user_id: user.id,
          profile: {
            full_name: aboutMe.fullName || user.full_name,
            district: locationData.operatingArea || user.district,
            tehsil: activeLocation || user.tehsil,
          },
          assessment_data: assessmentPayload,
        }).catch((err) => console.warn("Failed to backup saveUserProfile:", err));
      }
    } catch (err) {
      console.error("Error calculating recommendations:", err);
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

      {/* Wizard Step Content */}
      {!isAnalyzing && (
        <div style={{ maxWidth: 880, margin: "0 auto", width: "100%" }}>
          {/* STEP 1: PAGE 2.1 — ABOUT ME */}
          {step === 1 && (
            <AboutMeStep
              data={aboutMe}
              onChange={handleAboutMeChange}
              onNext={() => setStep(2)}
            />
          )}

          {/* STEP 2: PAGE 2.2 — SKILLS & EXPERIENCE */}
          {step === 2 && (
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
          {step === 3 && (
            <DocumentsStep
              documents={documents}
              onChange={handleDocumentsStepChange}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}

          {/* STEP 4: PAGE 2.4 — RESOURCES & EXISTING SETUP */}
          {step === 4 && (
            <ResourcesStep
              resourcesData={resourcesData}
              onChange={handleResourcesStepChange}
              onNext={() => setStep(5)}
              onBack={() => setStep(3)}
            />
          )}

          {/* STEP 5: PAGE 2.5 — LOCATION & LOCAL ECOSYSTEM */}
          {step === 5 && (
            <LocationStep
              locationData={locationData}
              locationsList={locationsList}
              onChange={handleLocationStepChange}
              onNext={() => setStep(6)}
              onBack={() => setStep(4)}
            />
          )}

          {/* STEP 6: PAGE 2.6 — FINANCIAL CAPACITY */}
          {step === 6 && (
            <FinanceStep
              financeData={financeData}
              onChange={handleFinanceStepChange}
              onNext={() => setStep(7)}
              onBack={() => setStep(5)}
            />
          )}

          {/* STEP 7: PAGE 2.7 — BUSINESS PREFERENCES */}
          {step === 7 && (
            <BusinessPreferencesStep
              preferencesData={preferencesData}
              onChange={handlePreferencesStepChange}
              onSubmit={handleSubmit}
              onBack={() => setStep(6)}
              loading={loading}
            />
          )}
        </div>
      )}
    </div>
  );
}
