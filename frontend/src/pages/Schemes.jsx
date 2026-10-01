import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Landmark,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Upload,
  Calendar,
  Clock,
  Building2,
  Coins,
  ArrowRight,
  ArrowLeft,
  MapPin,
  ShieldCheck,
  Tag,
  Check,
  Plus,
  RefreshCw,
  Eye,
  Layers,
  Award,
  BookOpen
} from "lucide-react";

// ============================================================================
// 1. MASTER SCHEME DATASET (NAGPUR / VIDARBHA CITRUS ECOSYSTEM)
// ============================================================================
const SCHEMES_DATABASE = [
  {
    id: "PMFME-001",
    name: "PMFME (Pradhan Mantri Formalisation of Micro food processing Enterprises)",
    shortName: "PMFME Scheme",
    dept: "Ministry of Food Processing Industries (MoFPI) & Govt of Maharashtra",
    category: "Central Sector ODOP Grant",
    rate: "35% Credit-Linked Capital Subsidy",
    rateNumeric: 0.35,
    ceiling: "Max ₹10.0 Lakhs per micro-enterprise",
    maxSubsidyINR: 1000000,
    contribution: "Min 10% Beneficiary Equity, Balance via Bank Term Loan",
    focusOdop: "Nagpur Mandarin Orange (One District One Product)",
    description:
      "A flagship central scheme aimed at providing financial, technical, and business support for upgrading existing micro food processing units and creating new enterprises under the ODOP mandate.",
    relevantBusinesses: [
      "Disease-Free Certified Citrus Nursery",
      "Cold-Pressed Citrus Juice & RTS Beverages",
      "Citrus Peel Essential Oil & Pectin Extraction",
      "Farm-Gate Sorting, Grading & Waxing Facility",
      "Citrus Marmalade, Jam & Peel Candy Processing",
    ],
    assistancePoints: [
      "35% credit-linked capital subsidy for plant machinery, processing equipment, and food-grade civil infrastructure.",
      "Seed capital of ₹40,000 per member for SHGs for working capital and small tools.",
      "50% grant for branding, marketing, and packaging support for FPO/cluster products.",
      "Free technical EDP and food processing training through district resource persons.",
    ],
    eligibilityRules: [
      { key: "business_type", label: "Business Type", requirement: "Food processing / Citrus value-addition unit", status: "satisfied" },
      { key: "location", label: "Location", requirement: "Nagpur, Amravati, Wardha, or MP citrus belt", status: "satisfied" },
      { key: "applicant_type", label: "Applicant Type", requirement: "Individual entrepreneur, FPO, SHG, or Partnership", status: "satisfied" },
      { key: "age_limit", label: "Age Requirement", requirement: "Above 18 years of age", status: "satisfied" },
      { key: "promoter_equity", label: "Promoter Equity", requirement: "At least 10% own financial contribution", status: "satisfied" },
      { key: "bank_loan", label: "Bank Term Loan", requirement: "Formal term loan sanction from scheduled commercial bank", status: "info_needed" },
      { key: "fssai_cert", label: "FSSAI Food Safety", requirement: "FSSAI Registration or State License commitment", status: "info_needed" },
    ],
    documents: [
      { id: "aadhaar", name: "Aadhaar Card of Applicant", profileKey: "identity", required: true },
      { id: "pan", name: "PAN Card / Firm PAN", profileKey: "pan", required: true },
      { id: "bank_statement", name: "Bank Account Passbook / 6-Month Statement", profileKey: "financial", required: true },
      { id: "dpr", name: "Detailed Project Report (DPR) / EntreVision Business Plan", profileKey: "dpr", required: true },
      { id: "land_rent", name: "Land 7/12 Extract or Registered Lease Agreement", profileKey: "land", required: true },
      { id: "fssai", name: "FSSAI License / Food Safety Registration", profileKey: "fssai", required: false },
      { id: "udyam", name: "Udyam MSME Registration Certificate", profileKey: "udyam", required: false },
    ],
    officialPortal: "https://mofpi.gov.in/pmfme",
    nodalAgency: "Maharashtra State Agricultural Marketing Board (MSAMB) / District Resource Person (DRP)",
    officialProcessingPeriod: "30 to 45 working days for District Level Committee (DLC) sanction",
  },
  {
    id: "MIDH-NHB-002",
    name: "MIDH / NHB (Mission for Integrated Development of Horticulture)",
    shortName: "MIDH / NHB Scheme",
    dept: "Ministry of Agriculture and Farmers Welfare & National Horticulture Board (NHB)",
    category: "Central Horticulture Infrastructure Subsidy",
    rate: "35% - 50% Capital Assistance (Back-Ended)",
    rateNumeric: 0.40,
    ceiling: "Component-specific (up to ₹25–₹50 Lakhs for high-tech units)",
    maxSubsidyINR: 5000000,
    contribution: "Min 50% Promoter Equity & Bank Term Loan",
    focusOdop: "Citrus Nurseries, High-Density Orchards, Packhouses, CA Cold Storages",
    description:
      "Comprehensive scheme providing capital investment subsidies for high-tech commercial horticulture, disease-free nursery propagation, post-harvest packhouses, and controlled-atmosphere cold chains.",
    relevantBusinesses: [
      "Disease-Free Certified Citrus Nursery",
      "Farm-Gate Sorting, Grading & Waxing Facility",
      "Micro Cold Storage & Ripening Unit (15–25 MT)",
      "High-Density Citrus Orchard Propagation",
    ],
    assistancePoints: [
      "50% capital subsidy for high-tech certified mother nurseries (up to ₹25 Lakhs per hectare).",
      "35% subsidy for integrated packhouses, mechanized grading & waxing lines.",
      "35% credit-linked back-ended subsidy for cold storages (up to 5,000 MT capacity).",
      "Assistance for micro-irrigation, fertigation systems, and shade-net polyhouses.",
    ],
    eligibilityRules: [
      { key: "business_type", label: "Business Type", requirement: "Horticulture nursery, cold chain, or packhouse", status: "satisfied" },
      { key: "location", label: "Location", requirement: "Recognized horticulture production cluster", status: "satisfied" },
      { key: "applicant_type", label: "Applicant Type", requirement: "Individual, Farmer, FPO, Agri-Graduate", status: "satisfied" },
      { key: "land_ownership", label: "Land Availability", requirement: "Minimum 1 to 2 acres suitable land with water source", status: "satisfied" },
      { key: "tech_standards", label: "Horticulture Accreditation", requirement: "Compliance with ICAR-CCRI / NHB technical guidelines", status: "info_needed" },
      { key: "bank_dpr", label: "Bank Appraised DPR", requirement: "Detailed DPR with bank term loan appraisal", status: "info_needed" },
    ],
    documents: [
      { id: "aadhaar", name: "Aadhaar / ID Proof", profileKey: "identity", required: true },
      { id: "land_712", name: "Land Title / 7/12 Extract (Minimum 1 Acre)", profileKey: "land", required: true },
      { id: "water_test", name: "Water & Soil Quality Test Certificate", profileKey: "soil_test", required: true },
      { id: "dpr_nhb", name: "Bank-Appraised DPR with Civil Blueprint", profileKey: "dpr", required: true },
      { id: "bank_sanction", name: "Bank Term Loan In-Principle Sanction Letter", profileKey: "financial", required: true },
      { id: "nursery_cert", name: "ICAR-CCRI / Agri Training Certificate", profileKey: "ccri_cert", required: false },
    ],
    officialPortal: "https://nhb.gov.in",
    nodalAgency: "National Horticulture Board (NHB) Nagpur Office / Commissioner of Agriculture Pune",
    officialProcessingPeriod: "60 to 90 days (Technical screening + Joint Inspection Committee audit)",
  },
  {
    id: "AIF-003",
    name: "AIF (Agriculture Infrastructure Fund)",
    shortName: "AIF Scheme",
    dept: "Department of Agriculture and Farmers Welfare (DA&FW)",
    category: "Interest Subvention & Credit Guarantee",
    rate: "3% Interest Subvention p.a. + CGTMSE Fee Waiver",
    rateNumeric: 0.03,
    ceiling: "Subvention on loans up to ₹2.0 Crores for 7 years",
    maxSubsidyINR: 20000000,
    contribution: "Min 10% Promoter Contribution, 90% Bank Debt",
    focusOdop: "Post-Harvest Management & Community Farming Assets",
    description:
      "A medium-long term debt financing facility for investment in viable projects for post-harvest management infrastructure and community farming assets through 3% interest subvention and CGTMSE credit guarantee.",
    relevantBusinesses: [
      "Farm-Gate Sorting, Grading & Waxing Facility",
      "Micro Cold Storage & Ripening Unit (15–25 MT)",
      "Cold-Pressed Citrus Juice & RTS Beverages",
      "Custom Hiring Centre for Citrus Mechanization",
      "Organic Citrus Waste Compost & Bio-Fertilizer",
    ],
    assistancePoints: [
      "3% per annum interest subvention on term loans up to ₹2.0 Crores for a maximum period of 7 years.",
      "Credit guarantee coverage under CGTMSE scheme for loans up to ₹2.0 Crores with fee paid by Govt.",
      "Convergence allowed with all other Central and State capital subsidy schemes (e.g. PMFME + AIF).",
      "Fast-track single-window digital loan application routed directly to selected bank branches.",
    ],
    eligibilityRules: [
      { key: "business_type", label: "Business Type", requirement: "Post-harvest infrastructure / Primary processing asset", status: "satisfied" },
      { key: "location", label: "Location", requirement: "Any agricultural area / Agro-processing park", status: "satisfied" },
      { key: "applicant_type", label: "Applicant Type", requirement: "Agri-entrepreneur, Startup, FPO, PACS, Individual", status: "satisfied" },
      { key: "bank_borrower", label: "Borrower Eligibility", requirement: "Eligible for commercial bank term loan", status: "satisfied" },
      { key: "cibil_score", label: "Credit History", requirement: "Satisfactory CIBIL score (usually >650)", status: "info_needed" },
    ],
    documents: [
      { id: "aadhaar", name: "Aadhaar Card", profileKey: "identity", required: true },
      { id: "pan", name: "PAN Card", profileKey: "pan", required: true },
      { id: "project_dpr", name: "EntreVision Detailed Project Report (DPR)", profileKey: "dpr", required: true },
      { id: "bank_account", name: "KYC & Bank Statement (1 Year)", profileKey: "financial", required: true },
      { id: "land_proof", name: "Land Ownership / Long Lease Proof", profileKey: "land", required: true },
    ],
    officialPortal: "https://agriinfra.dac.gov.in",
    nodalAgency: "PMU National Agriculture Infra Fund & All Scheduled Commercial Banks",
    officialProcessingPeriod: "15 to 30 working days via national portal routing",
  },
  {
    id: "PMEGP-004",
    name: "PMEGP (Prime Minister's Employment Generation Programme)",
    shortName: "PMEGP Scheme",
    dept: "Ministry of MSME & Khadi and Village Industries Commission (KVIC)",
    category: "Credit-Linked Subsidy Scheme",
    rate: "25% (Rural Area) / 15% (Urban Area) Margin Money",
    rateNumeric: 0.25,
    ceiling: "Project cost up to ₹50 Lakhs (Manufacturing) / ₹20 Lakhs (Services)",
    maxSubsidyINR: 1250000,
    contribution: "5% to 10% Own Contribution",
    focusOdop: "New Rural Micro Enterprises & Agro-Manufacturing",
    description:
      "Credit-linked subsidy programme to generate self-employment opportunities in rural and semi-urban areas by setting up micro-enterprises in manufacturing and service sectors.",
    relevantBusinesses: [
      "Citrus Peel Essential Oil & Pectin Extraction",
      "Citrus Marmalade, Jam & Peel Candy Processing",
      "Organic Citrus Waste Compost & Bio-Fertilizer",
      "Custom Hiring Centre for Citrus Mechanization",
    ],
    assistancePoints: [
      "25% margin money subsidy for General Category in rural areas (35% for Special Category/SC/ST/Women/OBC).",
      "Project cost ceiling up to ₹50 Lakhs for manufacturing units and ₹20 Lakhs for service centres.",
      "10% beneficiary equity for general category (5% for special categories).",
      "Mandatory free Entrepreneurship Development Programme (EDP) training conducted online.",
    ],
    eligibilityRules: [
      { key: "age_limit", label: "Age Requirement", requirement: "18 years and above", status: "satisfied" },
      { key: "education", label: "Educational Qualification", requirement: "Minimum 8th standard pass for manufacturing >₹10L", status: "satisfied" },
      { key: "new_unit", label: "Unit Status", requirement: "Only new micro enterprises are eligible", status: "satisfied" },
      { key: "edp_training", label: "EDP Training", requirement: "Mandatory EDP training completion certificate", status: "info_needed" },
      { key: "no_prior_subsidy", label: "Prior Assistance", requirement: "Must not have availed subsidy under other Central/State credit scheme", status: "info_needed" },
    ],
    documents: [
      { id: "aadhaar", name: "Aadhaar Card", profileKey: "identity", required: true },
      { id: "education_proof", name: "8th / 10th / Degree Certificate", profileKey: "education", required: true },
      { id: "edp_cert", name: "EDP Training Completion Certificate", profileKey: "edp_cert", required: false },
      { id: "caste_cert", name: "Caste / Category Certificate (if applicable for 35%)", profileKey: "caste_cert", required: false },
      { id: "project_profile", name: "Project Summary DPR", profileKey: "dpr", required: true },
      { id: "rural_cert", name: "Rural Area Certificate / Gram Panchayat NOC", profileKey: "rural_cert", required: true },
    ],
    officialPortal: "https://www.kviconline.gov.in/pmegpeportal",
    nodalAgency: "KVIC / KVIB / District Industries Centre (DIC Nagpur)",
    officialProcessingPeriod: "30 to 60 days (Task Force Committee interview + Bank sanction)",
  },
  {
    id: "CMEGP-MH-005",
    name: "CMEGP (Chief Minister's Employment Generation Programme - Maharashtra)",
    shortName: "Maha CMEGP",
    dept: "Directorate of Industries, Government of Maharashtra",
    category: "Maharashtra State Capital Subsidy",
    rate: "15% - 35% Capital Subsidy",
    rateNumeric: 0.25,
    ceiling: "Project cost up to ₹50 Lakhs (Manufacturing)",
    maxSubsidyINR: 1250000,
    contribution: "5% to 10% Promoter Contribution",
    focusOdop: "Maharashtra Industrial & Agro-Processing Enterprise Setup",
    description:
      "Maharashtra State flagship scheme offering financial assistance to establish new micro-enterprises, with special incentives for Vidarbha industrial and agro-processing clusters.",
    relevantBusinesses: [
      "Disease-Free Certified Citrus Nursery",
      "Cold-Pressed Citrus Juice & RTS Beverages",
      "Citrus Peel Essential Oil & Pectin Extraction",
      "Farm-Gate Sorting, Grading & Waxing Facility",
    ],
    assistancePoints: [
      "15% to 35% financial subsidy on project cost for establishing manufacturing units up to ₹50 Lakhs.",
      "Special 35% rate for SC/ST/Women/Minority applicants in Vidarbha region.",
      "Online single-window portal approval routed via District Industries Centre (DIC).",
    ],
    eligibilityRules: [
      { key: "domicile", label: "State Domicile", requirement: "Maharashtra State Domicile Certificate", status: "satisfied" },
      { key: "age_limit", label: "Age Requirement", requirement: "18 to 45 years (up to 50 for reserved categories)", status: "satisfied" },
      { key: "education", label: "Education", requirement: "Minimum 7th standard pass (10th for >₹25L projects)", status: "satisfied" },
      { key: "location", label: "Project Location", requirement: "Must be located within Maharashtra State", status: "satisfied" },
      { key: "pan_card", label: "Tax Identification", requirement: "Valid PAN Card", status: "satisfied" },
    ],
    documents: [
      { id: "aadhaar", name: "Aadhaar Card", profileKey: "identity", required: true },
      { id: "domicile", name: "Maharashtra Domicile Certificate", profileKey: "domicile", required: true },
      { id: "education", name: "Educational Proof", profileKey: "education", required: true },
      { id: "dpr", name: "Detailed Project Report (DPR)", profileKey: "dpr", required: true },
      { id: "pan", name: "PAN Card", profileKey: "pan", required: true },
    ],
    officialPortal: "https://maha-cmegp.gov.in",
    nodalAgency: "District Industries Centre (DIC) Nagpur / KVIB",
    officialProcessingPeriod: "30 to 45 working days",
  },
  {
    id: "KUSUM-006",
    name: "MahaUrja / PM-KUSUM (Solar Cold Chain & Agri Pumping Scheme)",
    shortName: "MahaUrja Solar Grant",
    dept: "Maharashtra Energy Development Agency (MEDA) & MNRE",
    category: "Renewable Energy & Solar Assistance",
    rate: "60% - 90% Capital Assistance on Solar Systems",
    rateNumeric: 0.60,
    ceiling: "Subsidized 3HP to 7.5HP Solar Pumps & Solar Cold Storage Kits",
    maxSubsidyINR: 450000,
    contribution: "10% Beneficiary Share",
    focusOdop: "Solar Irrigation & Zero-Grid Post-Harvest Storage",
    description:
      "Capital assistance for farmers and agro-enterprises to install off-grid solar water pumps and solar-energized micro cold storage units, reducing operating electricity expenses to near zero.",
    relevantBusinesses: [
      "Disease-Free Certified Citrus Nursery",
      "Micro Cold Storage & Ripening Unit (15–25 MT)",
      "Farm-Gate Sorting, Grading & Waxing Facility",
    ],
    assistancePoints: [
      "Up to 90% subsidy on solar agricultural water pump sets (3HP, 5HP, 7.5HP).",
      "Capital grant for solarizing micro cold storage chambers to guarantee uninterrupted chilling during power outages.",
      "Direct benefit disbursement through MEDA MahaUrja portal.",
    ],
    eligibilityRules: [
      { key: "water_source", label: "Water / Energy Source", requirement: "Existing functional borewell/well on property", status: "satisfied" },
      { key: "land_712", label: "Land Record", requirement: "Applicant name on 7/12 extract or valid farm title", status: "satisfied" },
      { key: "no_grid_meter", label: "Grid Status", requirement: "No prior energized conventional agri pump connection", status: "info_needed" },
    ],
    documents: [
      { id: "aadhaar", name: "Aadhaar Card", profileKey: "identity", required: true },
      { id: "712_extract", name: "7/12 Land Extract (within 3 months)", profileKey: "land", required: true },
      { id: "no_dues", name: "MSEDCL Electricity No Dues Certificate", profileKey: "msedcl_noc", required: true },
      { id: "bank_passbook", name: "Bank Passbook Copy", profileKey: "financial", required: true },
    ],
    officialPortal: "https://www.mahaurja.com",
    nodalAgency: "MEDA (Maharashtra Energy Development Agency) Nagpur Divisional Office",
    officialProcessingPeriod: "45 to 60 days based on vendor installation allocation",
  },
];

// ============================================================================
// 2. MAIN GOVERNMENT SCHEMES COMPONENT
// ============================================================================
export default function Schemes() {
  const navigate = useNavigate();
  const location = useLocation();

  // Active view: "directory" | "details" | "eligibility" | "missing_req" | "documents" | "application_process" | "tracker"
  const [activeView, setActiveView] = useState("directory");

  // Selected scheme state
  const [selectedSchemeId, setSelectedSchemeId] = useState("PMFME-001");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "my_business" | "my_location" | "eligible"

  // User Profile Data from localStorage (or fallback mock)
  const [userProfile, setUserProfile] = useState(() => {
    let businessName = "Disease-Free Certified Citrus Nursery";
    let locationStr = "Katol, Nagpur District";
    let hasDocuments = {
      identity: true,
      pan: true,
      financial: true,
      land: true,
      dpr: true,
      fssai: false,
      udyam: false,
      ccri_cert: false,
      edp_cert: false,
      msedcl_noc: false,
    };

    try {
      const savedPlan = localStorage.getItem("ev_active_business_plan");
      if (savedPlan) {
        const parsed = JSON.parse(savedPlan);
        if (parsed.opportunity?.name) businessName = parsed.opportunity.name;
        if (parsed.userInput?.location || parsed.userSummary?.location) {
          locationStr = parsed.userInput?.location || parsed.userSummary?.location;
        }
      }
      const savedDocs = localStorage.getItem("ev_user_documents");
      if (savedDocs) {
        const parsedDocs = JSON.parse(savedDocs);
        parsedDocs.forEach((d) => {
          if (d.type?.toLowerCase().includes("aadhaar") || d.name?.toLowerCase().includes("aadhaar")) hasDocuments.identity = true;
          if (d.type?.toLowerCase().includes("pan") || d.name?.toLowerCase().includes("pan")) hasDocuments.pan = true;
          if (d.type?.toLowerCase().includes("land") || d.name?.toLowerCase().includes("7/12")) hasDocuments.land = true;
          if (d.type?.toLowerCase().includes("cert") || d.name?.toLowerCase().includes("training")) hasDocuments.ccri_cert = true;
        });
      }
    } catch (e) {}

    return {
      businessName,
      locationStr,
      applicantType: "Individual Entrepreneur",
      documents: hasDocuments,
    };
  });

  // Submitted applications tracker list (localStorage backed)
  const [applications, setApplications] = useState(() => {
    try {
      const saved = localStorage.getItem("ev_scheme_applications");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: "APP-PMFME-2026-0842",
        schemeId: "PMFME-001",
        schemeName: "PMFME (ODOP Nagpur Mandarin)",
        appliedDate: "24/09/2026",
        status: "Under Review",
        referenceNo: "MH-NGP-PMFME-884920",
        portal: "https://mofpi.gov.in/pmfme",
        nodalOfficer: "District Resource Person (Katol Cluster)",
        processingTime: "30 to 45 working days",
        lastUpdated: "28/09/2026",
      },
    ];
  });

  // Missing requirement modal or action state
  const [missingModalItem, setMissingModalItem] = useState(null);

  // Selected scheme object
  const currentScheme = useMemo(() => {
    return SCHEMES_DATABASE.find((s) => s.id === selectedSchemeId) || SCHEMES_DATABASE[0];
  }, [selectedSchemeId]);

  // Compute dynamic eligibility status for current scheme
  const eligibilityAssessment = useMemo(() => {
    const rules = currentScheme.eligibilityRules.map((rule) => {
      let dynamicStatus = "satisfied"; // green
      let explanation = "Matches your current profile";

      if (rule.key === "fssai_cert" && !userProfile.documents.fssai) {
        dynamicStatus = "info_needed"; // yellow
        explanation = "FSSAI Registration document not yet uploaded in profile";
      } else if (rule.key === "edp_training" && !userProfile.documents.edp_cert) {
        dynamicStatus = "info_needed";
        explanation = "EDP Training completion certificate required before final sanction";
      } else if (rule.key === "tech_standards" && !userProfile.documents.ccri_cert) {
        dynamicStatus = "info_needed";
        explanation = "ICAR-CCRI Technical accreditation certificate not found in profile";
      } else if (rule.key === "bank_loan" || rule.key === "bank_dpr") {
        dynamicStatus = "info_needed";
        explanation = "Requires DPR submission to bank (Ready via EntreVision Business Plan)";
      }

      return {
        ...rule,
        dynamicStatus,
        explanation,
      };
    });

    const hasNotSatisfied = rules.some((r) => r.dynamicStatus === "not_satisfied");
    const hasInfoNeeded = rules.some((r) => r.dynamicStatus === "info_needed");

    let overallStatus = "satisfied";
    let statusLabel = "Requirements satisfied";
    let statusColor = "var(--ok)";
    let statusBg = "var(--ok-bg)";

    if (hasNotSatisfied) {
      overallStatus = "not_satisfied";
      statusLabel = "Requirement not satisfied";
      statusColor = "#ef4444";
      statusBg = "rgba(239, 68, 68, 0.1)";
    } else if (hasInfoNeeded) {
      overallStatus = "info_needed";
      statusLabel = "Some information / documents still required";
      statusColor = "#f59e0b";
      statusBg = "rgba(245, 158, 11, 0.1)";
    }

    return {
      rules,
      overallStatus,
      statusLabel,
      statusColor,
      statusBg,
    };
  }, [currentScheme, userProfile]);

  // Filter schemes
  const filteredSchemes = useMemo(() => {
    return SCHEMES_DATABASE.filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.dept.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.focusOdop.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (activeFilter === "my_business") {
        return s.relevantBusinesses.some((b) =>
          b.toLowerCase().includes(userProfile.businessName.toLowerCase().split(" ")[0])
        );
      }
      if (activeFilter === "my_location") {
        return s.dept.toLowerCase().includes("maharashtra") || s.focusOdop.toLowerCase().includes("nagpur");
      }
      if (activeFilter === "eligible") {
        return s.rateNumeric >= 0.25;
      }
      return true;
    });
  }, [searchQuery, activeFilter, userProfile]);

  // Helper to upload document simulation
  const handleSimulateDocumentUpload = (docProfileKey) => {
    setUserProfile((prev) => ({
      ...prev,
      documents: {
        ...prev.documents,
        [docProfileKey]: true,
      },
    }));
    try {
      const currentDocs = JSON.parse(localStorage.getItem("ev_user_documents") || "[]");
      currentDocs.push({
        id: `doc_${Date.now()}`,
        name: `${docProfileKey.toUpperCase()} Verified Document`,
        type: docProfileKey,
        uploadedAt: new Date().toISOString(),
      });
      localStorage.setItem("ev_user_documents", JSON.stringify(currentDocs));
    } catch (e) {}
    setMissingModalItem(null);
  };

  // Helper to add missing item to Roadmap
  const handleAddToRoadmap = (taskTitle) => {
    try {
      const savedRoadmap = JSON.parse(localStorage.getItem("ev_user_roadmap") || "[]");
      savedRoadmap.push({
        id: `task_${Date.now()}`,
        title: taskTitle,
        category: "Government Scheme Compliance",
        schemeId: currentScheme.id,
        status: "Pending",
        addedAt: new Date().toISOString(),
      });
      localStorage.setItem("ev_user_roadmap", JSON.stringify(savedRoadmap));
      alert(`✓ Added task to My Roadmap: "${taskTitle}"`);
    } catch (e) {
      alert(`✓ Task queued for My Roadmap: "${taskTitle}"`);
    }
  };

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", paddingBottom: 60 }}>
      {/* ====================================================================
          PAGE HEADER & ACTIVE NAVIGATION BAR
         ==================================================================== */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="pill" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Landmark size={14} /> Financial Assistance & Subsidies
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>PAGE 7</span>
            </div>
            <h1 style={{ fontSize: "1.85rem", fontWeight: 800, margin: "6px 0 4px", color: "var(--text-heading)" }}>
              🏛️ Government Schemes Directory
            </h1>
            <p className="muted" style={{ margin: 0, fontSize: "0.95rem" }}>
              Find financial assistance, verify eligibility transparently, prepare documents, and track applications for your citrus venture.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setActiveView("tracker")}
              className={`pill-option-btn ${activeView === "tracker" ? "active" : ""}`}
              style={{ fontSize: "0.82rem", padding: "8px 14px" }}
            >
              📋 My Applications ({applications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveView("documents")}
              className={`pill-option-btn ${activeView === "documents" ? "active" : ""}`}
              style={{ fontSize: "0.82rem", padding: "8px 14px" }}
            >
              📄 Document Checklist
            </button>
          </div>
        </div>

        {/* Global Context Indicator: Current Business & Location */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginTop: 16,
            padding: "10px 14px",
            background: "var(--panel-subtle)",
            borderRadius: 12,
            border: "1px solid var(--line)",
            fontSize: "0.82rem",
            flexWrap: "wrap",
          }}
        >
          <span style={{ color: "var(--muted)" }}>Analyzing schemes for:</span>
          <span style={{ fontWeight: 800, color: "var(--text-heading)" }}>
            🍊 {userProfile.businessName}
          </span>
          <span style={{ color: "var(--muted)" }}>• Location:</span>
          <span style={{ fontWeight: 700, color: "var(--cyan)" }}>
            📍 {userProfile.locationStr}
          </span>
          <Link
            to="/financial-assistant"
            style={{ marginLeft: "auto", fontSize: "0.78rem", color: "var(--electric-blue)", textDecoration: "none", fontWeight: 700 }}
          >
            💰 View CapEx Breakdown →
          </Link>
        </div>
      </div>

      {/* ====================================================================
          VIEW 1: PAGE 7 — SCHEME DIRECTORY & RELEVANCE FILTER
         ==================================================================== */}
      {activeView === "directory" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Search & Filter Header */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
              <div style={{ position: "relative", flex: 1, minWidth: 260 }}>
                <Search
                  size={18}
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--muted)",
                  }}
                />
                <input
                  type="text"
                  placeholder="Search schemes by name, ministry, or ODOP product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px 10px 42px",
                    borderRadius: 12,
                    background: "var(--panel-subtle)",
                    border: "1px solid var(--line)",
                    color: "var(--text-heading)",
                    fontSize: "0.88rem",
                    outline: "none",
                  }}
                />
              </div>

              {/* Segmented Filter Pills */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  { id: "all", label: "All Schemes" },
                  { id: "my_business", label: "Relevant to My Business" },
                  { id: "my_location", label: "Vidarbha / Maharashtra" },
                  { id: "eligible", label: "High Subsidy (≥25%)" },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActiveFilter(f.id)}
                    className={`pill-option-btn ${activeFilter === f.id ? "active" : ""}`}
                    style={{ fontSize: "0.8rem", padding: "8px 12px" }}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Scheme Cards Grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filteredSchemes.map((scheme) => {
              const isRelevant = scheme.relevantBusinesses.some((b) =>
                b.toLowerCase().includes(userProfile.businessName.toLowerCase().split(" ")[0])
              );

              return (
                <div
                  key={scheme.id}
                  className="card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                    border: isRelevant ? "1px solid var(--line-glow)" : "1px solid var(--line)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span className="tag" style={{ fontSize: "0.72rem", background: "var(--panel-subtle)" }}>
                          {scheme.id} • {scheme.category}
                        </span>
                        {isRelevant ? (
                          <span
                            style={{
                              fontSize: "0.72rem",
                              fontWeight: 800,
                              color: "var(--ok)",
                              background: "var(--ok-bg)",
                              padding: "2px 8px",
                              borderRadius: 6,
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                            }}
                          >
                            ✓ Business category appears relevant
                          </span>
                        ) : (
                          <span style={{ fontSize: "0.72rem", color: "var(--muted)", background: "var(--panel-subtle)", padding: "2px 8px", borderRadius: 6 }}>
                            ○ General Horticulture Scheme
                          </span>
                        )}
                      </div>

                      <h3 style={{ margin: "6px 0 2px", fontSize: "1.25rem", fontWeight: 800, color: "var(--text-heading)" }}>
                        {scheme.name}
                      </h3>
                      <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                        {scheme.dept}
                      </span>
                    </div>

                    {/* Subsidy Highlight Badge */}
                    <div
                      style={{
                        background: "rgba(16, 185, 129, 0.08)",
                        border: "1px solid var(--ok-border)",
                        padding: "8px 16px",
                        borderRadius: 14,
                        textAlign: "right",
                      }}
                    >
                      <div style={{ fontSize: "1.15rem", fontWeight: 900, color: "var(--ok)" }}>
                        {scheme.rate}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                        {scheme.ceiling}
                      </div>
                    </div>
                  </div>

                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.5 }}>
                    {scheme.description}
                  </p>

                  {/* Summary Attributes */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: 10,
                      background: "var(--panel-subtle)",
                      padding: "10px 14px",
                      borderRadius: 12,
                      fontSize: "0.8rem",
                    }}
                  >
                    <div>
                      <span style={{ color: "var(--muted)", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700 }}>
                        Beneficiary Share
                      </span>
                      <div style={{ fontWeight: 700, color: "var(--text-heading)", marginTop: 2 }}>
                        {scheme.contribution}
                      </div>
                    </div>

                    <div>
                      <span style={{ color: "var(--muted)", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700 }}>
                        Priority Focus Area
                      </span>
                      <div style={{ fontWeight: 700, color: "var(--cyan)", marginTop: 2 }}>
                        {scheme.focusOdop}
                      </div>
                    </div>

                    <div>
                      <span style={{ color: "var(--muted)", fontSize: "0.72rem", textTransform: "uppercase", fontWeight: 700 }}>
                        Eligibility Status
                      </span>
                      <div style={{ fontWeight: 700, color: "#f59e0b", marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
                        <AlertTriangle size={14} /> Eligibility needs to be checked
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, flexWrap: "wrap", gap: 10 }}>
                    <a
                      href={scheme.officialPortal}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: "0.78rem", color: "var(--muted)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
                    >
                      <span>Official Portal: {scheme.shortName}</span>
                      <ExternalLink size={12} />
                    </a>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSchemeId(scheme.id);
                          setActiveView("details");
                        }}
                        className="btn-secondary-gloss"
                        style={{ fontSize: "0.8rem", padding: "7px 14px" }}
                      >
                        View Details
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedSchemeId(scheme.id);
                          setActiveView("eligibility");
                        }}
                        className="btn-primary-gloss"
                        style={{ fontSize: "0.8rem", padding: "7px 16px" }}
                      >
                        <span>Check My Eligibility →</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ====================================================================
          VIEW 2: PAGE 7.1 — SCHEME DETAILS DRILL-DOWN
         ==================================================================== */}
      {activeView === "details" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Top Return Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => setActiveView("directory")}
              className="btn-secondary-gloss"
              style={{ fontSize: "0.82rem", padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <ArrowLeft size={16} /> Back to Government Schemes Directory
            </button>

            <button
              type="button"
              onClick={() => setActiveView("eligibility")}
              className="btn-primary-gloss"
              style={{ fontSize: "0.82rem", padding: "8px 18px" }}
            >
              <span>Check My Eligibility for This Scheme →</span>
            </button>
          </div>

          {/* Scheme Master Card */}
          <div className="card" style={{ border: "1px solid var(--line-glow)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
              <div>
                <span className="pill" style={{ fontSize: "0.72rem" }}>
                  {currentScheme.id} • {currentScheme.dept}
                </span>
                <h1 style={{ margin: "8px 0 4px", fontSize: "1.65rem", fontWeight: 800, color: "var(--text-heading)" }}>
                  {currentScheme.name}
                </h1>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--muted)" }}>
                  Administering Authority: <strong>{currentScheme.nodalAgency}</strong>
                </p>
              </div>

              <div
                style={{
                  background: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid var(--ok-border)",
                  padding: "10px 18px",
                  borderRadius: 14,
                  textAlign: "right",
                }}
              >
                <span style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 800 }}>
                  Assistance Rate
                </span>
                <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "var(--ok)", marginTop: 2 }}>
                  {currentScheme.rate}
                </div>
                <span style={{ fontSize: "0.74rem", color: "var(--muted)" }}>
                  {currentScheme.ceiling}
                </span>
              </div>
            </div>

            {/* WHAT IS THIS SCHEME? */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-heading)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <BookOpen size={18} color="var(--cyan)" /> What is this scheme?
              </h3>
              <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--text)", lineHeight: 1.6 }}>
                {currentScheme.description}
              </p>
            </div>

            {/* 💰 ASSISTANCE SECTION */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-heading)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <Coins size={18} color="var(--ok)" /> Financial Assistance Provided
              </h3>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: "0.86rem", color: "var(--muted)", lineHeight: 1.6 }}>
                {currentScheme.assistancePoints.map((pt, idx) => (
                  <li key={idx} style={{ marginBottom: 6 }}>
                    <strong style={{ color: "var(--text)" }}>{pt}</strong>
                  </li>
                ))}
              </ul>
            </div>

            {/* 👤 WHO CAN APPLY? */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-heading)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <ShieldCheck size={18} color="var(--electric-blue)" /> Who Can Apply & Eligibility Rules
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
                {currentScheme.eligibilityRules.map((r, idx) => (
                  <div key={idx} style={{ background: "var(--panel-subtle)", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--line)" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                      {r.label}
                    </span>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-heading)", marginTop: 2 }}>
                      {r.requirement}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 📄 REQUIRED DOCUMENTS PREVIEW */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-heading)", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                <FileText size={18} color="var(--violet)" /> Mandatory Documents Required
              </h3>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {currentScheme.documents.map((d) => (
                  <span
                    key={d.id}
                    style={{
                      background: "var(--panel-subtle)",
                      border: "1px solid var(--line)",
                      padding: "6px 12px",
                      borderRadius: 8,
                      fontSize: "0.78rem",
                      color: "var(--text)",
                    }}
                  >
                    □ {d.name} {d.required && <strong style={{ color: "var(--cyan)" }}>*</strong>}
                  </span>
                ))}
              </div>
            </div>

            {/* 🌐 OFFICIAL PORTAL & PROCESSING TIME */}
            <div
              style={{
                marginTop: 20,
                padding: "14px 18px",
                background: "rgba(99, 102, 241, 0.08)",
                borderRadius: 14,
                border: "1px solid var(--line-glow)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase" }}>
                  Officially Stated Processing Time
                </span>
                <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-heading)", marginTop: 2 }}>
                  ⏱️ {currentScheme.officialProcessingPeriod}
                </div>
              </div>

              <a
                href={currentScheme.officialPortal}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary-gloss"
                style={{ fontSize: "0.82rem", padding: "8px 16px", textDecoration: "none" }}
              >
                <span>Visit Official Portal ({currentScheme.shortName})</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          VIEW 3: PAGE 7.2 — PERSONALIZED ELIGIBILITY CHECKER
         ==================================================================== */}
      {activeView === "eligibility" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => setActiveView("directory")}
              className="btn-secondary-gloss"
              style={{ fontSize: "0.82rem", padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <ArrowLeft size={16} /> Back to Schemes Directory
            </button>

            <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
              Scheme: <strong>{currentScheme.shortName}</strong>
            </span>
          </div>

          {/* Checker Hero Card */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="pill">Profile Match Engine</span>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>PAGE 7.2</span>
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 6px" }}>
              Check Your Eligibility
            </h2>
            <p className="muted" style={{ margin: 0, fontSize: "0.88rem" }}>
              We compare the scheme requirements with verified information in your profile so you know where you stand before applying.
            </p>

            {/* Live Criteria Assessment Table */}
            <div
              style={{
                marginTop: 20,
                background: "var(--panel-solid)",
                borderRadius: 14,
                border: "1px solid var(--line)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.5fr 2fr 1.5fr",
                  padding: "10px 16px",
                  background: "var(--panel-subtle)",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  color: "var(--muted)",
                  textTransform: "uppercase",
                }}
              >
                <span>Scheme Requirement</span>
                <span>Your Profile Match</span>
                <span style={{ textAlign: "right" }}>Assessment Status</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                {eligibilityAssessment.rules.map((rule, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.5fr 2fr 1.5fr",
                      padding: "12px 16px",
                      borderTop: "1px solid var(--line)",
                      fontSize: "0.85rem",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong style={{ color: "var(--text-heading)" }}>{rule.label}</strong>
                      <p style={{ margin: "2px 0 0", fontSize: "0.74rem", color: "var(--muted)" }}>
                        {rule.requirement}
                      </p>
                    </div>

                    <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                      {rule.explanation}
                    </span>

                    <div style={{ textAlign: "right" }}>
                      {rule.dynamicStatus === "satisfied" && (
                        <span
                          style={{
                            fontSize: "0.76rem",
                            fontWeight: 800,
                            color: "var(--ok)",
                            background: "var(--ok-bg)",
                            padding: "4px 10px",
                            borderRadius: 6,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          🟢 Requirement satisfied
                        </span>
                      )}

                      {rule.dynamicStatus === "info_needed" && (
                        <button
                          type="button"
                          onClick={() => {
                            setMissingModalItem(rule);
                            setActiveView("missing_req");
                          }}
                          style={{
                            fontSize: "0.76rem",
                            fontWeight: 800,
                            color: "#f59e0b",
                            background: "rgba(245, 158, 11, 0.1)",
                            padding: "4px 10px",
                            borderRadius: 6,
                            border: "1px solid rgba(245, 158, 11, 0.3)",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          🟡 Information required
                        </button>
                      )}

                      {rule.dynamicStatus === "not_satisfied" && (
                        <span
                          style={{
                            fontSize: "0.76rem",
                            fontWeight: 800,
                            color: "#ef4444",
                            background: "rgba(239, 68, 68, 0.1)",
                            padding: "4px 10px",
                            borderRadius: 6,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          🔴 Requirement not satisfied
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Status Banner */}
            <div
              style={{
                marginTop: 20,
                padding: "16px 20px",
                borderRadius: 14,
                background: eligibilityAssessment.statusBg,
                border: `1px solid ${eligibilityAssessment.statusColor}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                  CURRENT OVERALL STATUS
                </span>
                <div style={{ fontSize: "1.2rem", fontWeight: 900, color: eligibilityAssessment.statusColor, marginTop: 2 }}>
                  {eligibilityAssessment.statusLabel}
                </div>
                <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--muted)" }}>
                  EntreVision verifies criteria transparently without acting as the government approval body.
                </p>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setActiveView("documents")}
                  className="btn-secondary-gloss"
                  style={{ fontSize: "0.82rem", padding: "8px 14px" }}
                >
                  📄 View Document Checklist
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView("application_process")}
                  className="btn-primary-gloss"
                  style={{ fontSize: "0.82rem", padding: "8px 18px" }}
                >
                  <span>Proceed to Application Steps →</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          VIEW 4: PAGE 7.3 — MISSING REQUIREMENTS (MENTOR RESOLUTION)
         ==================================================================== */}
      {activeView === "missing_req" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <button
            type="button"
            onClick={() => setActiveView("eligibility")}
            className="btn-secondary-gloss"
            style={{ alignSelf: "flex-start", fontSize: "0.82rem", padding: "6px 12px" }}
          >
            ← Back to Eligibility Assessment
          </button>

          <div className="card" style={{ border: "1px solid rgba(245, 158, 11, 0.4)", background: "rgba(245, 158, 11, 0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="pill" style={{ color: "#f59e0b", borderColor: "rgba(245, 158, 11, 0.4)" }}>
                Requirement Gap Resolution
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>PAGE 7.3</span>
            </div>

            <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-heading)", margin: "6px 0 4px" }}>
              ⚠️ Information / Requirement Gap
            </h2>
            <p className="muted" style={{ margin: "0 0 16px 0", fontSize: "0.88rem" }}>
              We couldn't find evidence of the required qualification or document in your profile for <strong>{currentScheme.shortName}</strong>.
            </p>

            <div style={{ background: "var(--panel-solid)", padding: 18, borderRadius: 14, border: "1px solid var(--line)", marginBottom: 20 }}>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                Target Requirement
              </span>
              <h3 style={{ margin: "4px 0 2px", fontSize: "1.1rem", fontWeight: 800, color: "var(--text-heading)" }}>
                {missingModalItem?.label || "Technical Certification & Training"}
              </h3>
              <p style={{ margin: 0, fontSize: "0.84rem", color: "var(--muted)" }}>
                {missingModalItem?.requirement || "Accreditation or training documentation required for subsidy appraisal."}
              </p>
            </div>

            {/* Mentor Engine Actionable Paths */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <h4 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "var(--text-heading)" }}>
                What You Can Do:
              </h4>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
                {/* Action 1: Upload */}
                <div style={{ background: "var(--panel-solid)", padding: 16, borderRadius: 12, border: "1px solid var(--line)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)" }}>
                      1. Upload Existing Document
                    </strong>
                    <p style={{ margin: "6px 0 14px", fontSize: "0.8rem", color: "var(--muted)" }}>
                      If you already hold this certificate or document on file, upload it to update your profile.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSimulateDocumentUpload(missingModalItem?.key || "ccri_cert")}
                    className="btn-primary-gloss"
                    style={{ fontSize: "0.8rem", padding: "8px" }}
                  >
                    <Upload size={14} /> Upload & Verify Document
                  </button>
                </div>

                {/* Action 2: Find Training */}
                <div style={{ background: "var(--panel-solid)", padding: 16, borderRadius: 12, border: "1px solid var(--line)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)" }}>
                      2. Find Relevant Training
                    </strong>
                    <p style={{ margin: "6px 0 14px", fontSize: "0.8rem", color: "var(--muted)" }}>
                      ICAR-CCRI (Nagpur) & KVIC conduct authorized certified training workshops.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert("Redirecting to CCRI & KVIC training schedule directory...")}
                    className="btn-secondary-gloss"
                    style={{ fontSize: "0.8rem", padding: "8px" }}
                  >
                    🎓 View Training Workshops
                  </button>
                </div>

                {/* Action 3: Add to Roadmap */}
                <div style={{ background: "var(--panel-solid)", padding: 16, borderRadius: 12, border: "1px solid var(--line)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)" }}>
                      3. Add to My Roadmap
                    </strong>
                    <p style={{ margin: "6px 0 14px", fontSize: "0.8rem", color: "var(--muted)" }}>
                      Turn this requirement into a scheduled milestone in your launch roadmap.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddToRoadmap(`Complete ${missingModalItem?.label || "Certification"} for ${currentScheme.shortName}`)}
                    className="pill-option-btn active"
                    style={{ fontSize: "0.8rem", padding: "8px" }}
                  >
                    🗺️ Add to My Roadmap
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          VIEW 5: PAGE 7.4 — DOCUMENT CHECKLIST (SYNCED WITH PROFILE)
         ==================================================================== */}
      {activeView === "documents" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => setActiveView("directory")}
              className="btn-secondary-gloss"
              style={{ fontSize: "0.82rem", padding: "6px 12px" }}
            >
              ← Back to Schemes Directory
            </button>

            <button
              type="button"
              onClick={() => setActiveView("application_process")}
              className="btn-primary-gloss"
              style={{ fontSize: "0.82rem", padding: "8px 16px" }}
            >
              <span>Application Workflow →</span>
            </button>
          </div>

          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="pill">Profile Sync</span>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>PAGE 7.4</span>
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 6px" }}>
              📄 Document Checklist for {currentScheme.shortName}
            </h2>
            <p className="muted" style={{ margin: 0, fontSize: "0.88rem" }}>
              Documents already uploaded to your profile are automatically available. You do not need to re-upload them.
            </p>

            {/* Documents List */}
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
              {currentScheme.documents.map((doc) => {
                const isAvailable = Boolean(userProfile.documents[doc.profileKey]);

                return (
                  <div
                    key={doc.id}
                    style={{
                      background: "var(--panel-solid)",
                      padding: "14px 18px",
                      borderRadius: 12,
                      border: isAvailable ? "1px solid var(--ok-border)" : "1px solid var(--line)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: 12,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: "1.3rem" }}>
                        {isAvailable ? "✓" : "📄"}
                      </span>
                      <div>
                        <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)" }}>
                          {doc.name}
                        </strong>
                        {doc.required && (
                          <span style={{ marginLeft: 6, fontSize: "0.7rem", color: "var(--cyan)", fontWeight: 700 }}>
                            * Mandatory
                          </span>
                        )}
                        <div style={{ fontSize: "0.76rem", color: "var(--muted)", marginTop: 2 }}>
                          {isAvailable ? (
                            <span style={{ color: "var(--ok)", fontWeight: 700 }}>✓ Available in My Documents</span>
                          ) : (
                            <span style={{ color: "#f59e0b" }}>⚠ Not found in profile</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      {isAvailable ? (
                        <span className="badge-verified" style={{ fontSize: "0.76rem" }}>
                          ✓ Ready for Application
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSimulateDocumentUpload(doc.profileKey)}
                          className="btn-secondary-gloss"
                          style={{ fontSize: "0.78rem", padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: 4 }}
                        >
                          <Upload size={12} /> Upload Document
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer action to link to Profile */}
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                Manage all stored documents in <strong>My Profile → Documents</strong>
              </span>
              <Link to="/profile" className="btn-secondary-gloss" style={{ fontSize: "0.78rem", padding: "6px 12px", textDecoration: "none" }}>
                👤 Open My Profile Documents
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          VIEW 6: PAGE 7.5 — 7-STAGE APPLICATION PROCESS
         ==================================================================== */}
      {activeView === "application_process" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => setActiveView("eligibility")}
              className="btn-secondary-gloss"
              style={{ fontSize: "0.82rem", padding: "6px 12px" }}
            >
              ← Back to Eligibility Check
            </button>

            <button
              type="button"
              onClick={() => setActiveView("tracker")}
              className="btn-primary-gloss"
              style={{ fontSize: "0.82rem", padding: "8px 16px" }}
            >
              <span>View Submitted Applications Tracker →</span>
            </button>
          </div>

          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="pill">Execution Flow</span>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>PAGE 7.5</span>
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 6px" }}>
              🚀 Step-by-Step Application Process
            </h2>
            <p className="muted" style={{ margin: 0, fontSize: "0.88rem" }}>
              Official 7-step pathway to prepare, submit, and receive financial assistance under <strong>{currentScheme.shortName}</strong>.
            </p>

            {/* 7 Interactive Process Steps */}
            <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                {
                  step: "01",
                  title: "Check Scheme Eligibility",
                  description: "Pre-screen age, location, land availability, and credit score against official parameters.",
                  status: "Completed via EntreVision",
                  done: true,
                },
                {
                  step: "02",
                  title: "Prepare Supporting Documents",
                  description: "Assemble Aadhaar, PAN, 7/12 land extract, bank statements, and certifications.",
                  status: "Ready in Profile",
                  done: true,
                },
                {
                  step: "03",
                  title: "Prepare Project DPR / Business Plan",
                  description: "Generate bank-ready Detailed Project Report with CapEx, working capital, and 5-year financial projections.",
                  specialAction: true,
                  done: true,
                },
                {
                  step: "04",
                  title: "Register on Official Government Portal",
                  description: `Create applicant login on ${currentScheme.officialPortal} using Aadhaar & mobile OTP.`,
                  link: currentScheme.officialPortal,
                  done: false,
                },
                {
                  step: "05",
                  title: "Submit Online & Route to Nodal Bank",
                  description: "Fill the e-application form, upload DPR dossier, and select your preferred bank branch.",
                  done: false,
                },
                {
                  step: "06",
                  title: "District Committee / Bank Appraisal",
                  description: `Review by District Level Committee (DLC) / Bank officer. Officially stated timeline: ${currentScheme.officialProcessingPeriod}.`,
                  done: false,
                },
                {
                  step: "07",
                  title: "Sanction & Credit-Linked Disbursement",
                  description: "Bank releases term loan; capital subsidy is credited to beneficiary loan account after commercial commissioning.",
                  done: false,
                },
              ].map((s) => (
                <div
                  key={s.step}
                  style={{
                    background: s.done ? "rgba(16, 185, 129, 0.04)" : "var(--panel-solid)",
                    padding: 16,
                    borderRadius: 14,
                    border: s.done ? "1px solid var(--ok-border)" : "1px solid var(--line)",
                    display: "flex",
                    gap: 16,
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 10,
                      background: s.done ? "var(--ok)" : "var(--panel-subtle)",
                      color: s.done ? "#fff" : "var(--muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 900,
                      fontSize: "0.95rem",
                      flexShrink: 0,
                    }}
                  >
                    {s.step}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                      <strong style={{ fontSize: "0.98rem", color: "var(--text-heading)" }}>
                        {s.title}
                      </strong>
                      {s.done && (
                        <span style={{ fontSize: "0.74rem", color: "var(--ok)", fontWeight: 700 }}>
                          ✓ Ready
                        </span>
                      )}
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.5 }}>
                      {s.description}
                    </p>

                    {/* Step 3 Special DPR Link */}
                    {s.specialAction && (
                      <div
                        style={{
                          marginTop: 10,
                          padding: "10px 14px",
                          background: "rgba(99, 102, 241, 0.08)",
                          borderRadius: 10,
                          border: "1px solid var(--line-glow)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        <span style={{ fontSize: "0.78rem", color: "var(--text)" }}>
                          ✓ Business overview • ✓ CapEx & OpEx • ✓ Funding requirements
                        </span>
                        <Link
                          to="/business-plan"
                          className="btn-primary-gloss"
                          style={{ fontSize: "0.76rem", padding: "6px 12px", textDecoration: "none" }}
                        >
                          📄 Use My EntreVision Business Plan →
                        </Link>
                      </div>
                    )}

                    {/* Portal Link */}
                    {s.link && (
                      <a
                        href={s.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: "0.78rem", color: "var(--cyan)", textDecoration: "none", fontWeight: 700 }}
                      >
                        <span>Open {currentScheme.shortName} Application Portal</span>
                        <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          VIEW 7: PAGE 7.6 — APPLICATION TRACKING LOG
         ==================================================================== */}
      {activeView === "tracker" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => setActiveView("directory")}
              className="btn-secondary-gloss"
              style={{ fontSize: "0.82rem", padding: "6px 12px" }}
            >
              ← Back to Schemes Directory
            </button>
          </div>

          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="pill">Status Tracking</span>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>PAGE 7.6</span>
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 6px" }}>
              🏛️ My Scheme Applications
            </h2>
            <p className="muted" style={{ margin: 0, fontSize: "0.88rem" }}>
              Track the live progress of submitted subsidy and capital grant applications.
            </p>

            {/* Applications List */}
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14 }}>
              {applications.map((app) => (
                <div
                  key={app.id}
                  style={{
                    background: "var(--panel-solid)",
                    padding: 18,
                    borderRadius: 14,
                    border: "1px solid var(--line-glow)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <span className="tag" style={{ fontSize: "0.72rem" }}>
                        Application ID: {app.id}
                      </span>
                      <h3 style={{ margin: "6px 0 2px", fontSize: "1.2rem", fontWeight: 800, color: "var(--text-heading)" }}>
                        {app.schemeName}
                      </h3>
                      <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                        Reference No: <strong>{app.referenceNo}</strong> • Submitted: <strong>{app.appliedDate}</strong>
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 800,
                          color: "#f59e0b",
                          background: "rgba(245, 158, 11, 0.12)",
                          padding: "4px 12px",
                          borderRadius: 8,
                          border: "1px solid rgba(245, 158, 11, 0.3)",
                        }}
                      >
                        ● {app.status}
                      </span>
                      <div style={{ fontSize: "0.72rem", color: "var(--muted)", marginTop: 4 }}>
                        Last Updated: {app.lastUpdated}
                      </div>
                    </div>
                  </div>

                  {/* Progress milestones */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                      gap: 10,
                      marginTop: 16,
                      paddingTop: 14,
                      borderTop: "1px solid var(--line)",
                      fontSize: "0.78rem",
                    }}
                  >
                    <div>
                      <span style={{ color: "var(--ok)", fontWeight: 700 }}>✓ Eligibility Checked</span>
                    </div>
                    <div>
                      <span style={{ color: "var(--ok)", fontWeight: 700 }}>✓ Documents Uploaded</span>
                    </div>
                    <div>
                      <span style={{ color: "var(--ok)", fontWeight: 700 }}>✓ Application Submitted</span>
                    </div>
                    <div>
                      <span style={{ color: "#f59e0b", fontWeight: 700 }}>● Under Review (DLC)</span>
                    </div>
                  </div>

                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px dashed var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontSize: "0.76rem", color: "var(--muted)" }}>
                      ⏱️ Officially stated processing period: <strong>{app.processingTime}</strong>
                    </span>

                    <a
                      href={app.portal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary-gloss"
                      style={{ fontSize: "0.76rem", padding: "6px 12px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}
                    >
                      <span>Open Official Portal</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
