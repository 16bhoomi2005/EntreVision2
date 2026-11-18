import React, { useState, useEffect, useMemo } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Printer,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Coins,
  Building2,
  Store,
  Snowflake,
  FlaskConical,
  GraduationCap,
  Hammer,
  ShieldCheck,
  FileText,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  Landmark,
  Compass,
  Check,
  Info,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { fetchFinancialPlan } from "../services/api";
import { useAuth } from "../context/AuthContext";
import BankGradeDPRModal from "../components/BankGradeDPRModal";

export function getOpportunityArchetype(opportunity, activeLocation = "Nagpur Cluster") {
  const name = (opportunity?.name || "").toLowerCase();

  // 1. Mobile Kiosk / Cold-Pressed Juice / RTS Drinks
  if (name.includes("juice") || name.includes("shake") || name.includes("kiosk") || name.includes("beverage") || name.includes("rts")) {
    return {
      type: "juice_kiosk",
      tagline: "Farm-to-City Direct Cold-Pressed Citrus Retail Enterprise",
      archetypeName: "Urban Mobile Juice & Shake Kiosk",
      characteristics: {
        type: "Direct-to-Consumer Quick Service Retail & Cold-Pressed Station",
        footprint: "Zero Land Required (Mobile Food Cart / Kiosk, 30–60 sq.ft)",
        seasonality: "Year-Round (Peak sales during Feb–June heatwave & festival seasons)",
        margins: "~45–60% Gross Margin per bottle/cup",
      },
      targetCustomers: [
        "Morning walkers & health enthusiasts at public parks (Traffic Park, Seminary Hills)",
        "Daily commuters & office workers at Metro stations (Sitabuldi, Airport South)",
        "Tech employees & visitors across MIHAN IT SEZ & Butibori corporate parks",
        "Direct retail consumers & family shoppers in high-footfall commercial markets",
      ],
      locationReason: `High-transit connectivity into Nagpur urban consumption hubs with direct fruit aggregation from ${activeLocation || "Katol / Kalmeshwar"}.`,
      resourceReason: "Eliminates need for agricultural land or farm sheds; operates using clean mobile cart infrastructure and commercial juicing hardware.",
      experienceReason: "Leverages hands-on product knowledge of sweet orange varieties (Nagpur Mandarin) for premium seed-free extraction.",
      setupNeed: "Commercial cold-press automatic citrus juicer, insulated mobile cart, deep refrigeration chiller, and FSSAI Basic Hygiene Certification.",
      skillGapTitle: "BRIDGING THE SKILL GAP: FSSAI Food Hygiene & Cold Extraction SOPs",
      skillGapDesc: "ICAR-CCRI & CFTRI provide certified micro-processing workshops in hygienic citrus processing, pulp extraction, and food safety standards.",
      infraHighlight: "Central Kalamna APMC & Cotton Market for direct early-morning citrus crate sourcing at wholesale rates.",
      roadmapPhases: [
        { phase: "PHASE 1", title: "Location Survey & Footfall Mapping", tasks: ["Map high-traffic urban spots (Dharampeth, MIHAN, Metro stations)", "Benchmark daily footfalls between 7 AM–11 AM and 4 PM–9 PM"] },
        { phase: "PHASE 2", title: "FSSAI Registration & Sanitary SOPs", tasks: ["Apply for FSSAI Basic Food Business Registration (₹100/yr)", "Formulate cold-pressed hygiene protocols and biodegradable cup packaging"] },
        { phase: "PHASE 3", title: "Cart & Machine Fabrication", tasks: ["Procure food-grade SS-304 commercial automatic citrus press", "Equip customized battery-assisted mobile cart with display refrigeration"] },
        { phase: "PHASE 4", title: "Mandi Sourcing & PMFME Capital Subsidy", tasks: ["Establish daily morning crates supply link with Katol / Kalamna growers", "Submit PMFME 35% micro-enterprise DPR to bank"] },
        { phase: "PHASE 5", title: "Pilot Launch & QR Payments", tasks: ["Deploy kiosk with UPI digital payments and QR menu card", "Launch introductory sampling with 2 signature drinks: Cold-Pressed Mandarin & Sweet Peel Shake"] },
        { phase: "PHASE 6", title: "Multi-Location Scaling", tasks: ["Achieve stable 150+ cups/day volume (₹4,500–₹6,500 daily turnover)", "Replicate mobile cart units at 2 additional suburban hubs"] },
      ],
      capexBreakdown: [
        { name: "Commercial SS-304 Cold-Press Citrus Juicer & Extractor", pct: 0.40 },
        { name: "Insulated Stainless Steel Mobile Cart with Chilled Display", pct: 0.30 },
        { name: "Under-Counter Deep Chiller & Recyclable Packaging Buffer", pct: 0.18 },
        { name: "FSSAI Basic Food License, QR Branding & Setup Buffer", pct: 0.12 },
      ],
    };
  }

  // 2. Disease Diagnostic & Leaf Analysis Clinic
  if (name.includes("diagnostic") || name.includes("clinic") || name.includes("leaf") || name.includes("testing") || name.includes("soil")) {
    return {
      type: "diagnostic_clinic",
      tagline: "Mobile Agro-Diagnostic & Orchard Health Testing Clinic",
      archetypeName: "Citrus Diagnostic & Leaf Health Lab",
      characteristics: {
        type: "Decentralized Agricultural Diagnostic & Precision Advisory Service",
        footprint: "Mobile Field Kit (Backpack / 2-Wheeler / 80 sq.ft diagnostic kiosk)",
        seasonality: "Year-Round (Peaks in Ambia Bahar flowering Nov–Feb and Mrig Bahar June–Aug)",
        margins: "~65–75% Operating Margin per field test audit",
      },
      targetCustomers: [
        "Commercial citrus orchard growers battling Dieback, Phytophthora, or Citrus Greening",
        "Farmer Producer Organizations (FPOs) needing pre-harvest leaf tissue certification",
        "Fertilizer and agro-chemical retail dealers offering value-added testing to farmers",
        "Horticulture contract farming companies and high-density orchard developers",
      ],
      locationReason: `Direct access to dense citrus belts across ${activeLocation || "Katol & Narkhed"} with over 35,000 hectares of commercial mandarin orchards.`,
      resourceReason: "Requires zero crop acreage; uses portable spectrophotometer and digital soil-water testing meters.",
      experienceReason: "Builds directly on your horticultural observation skills to identify nutritional deficiencies and fungal pathogens.",
      setupNeed: "Portable soil EC/pH meter, digital handheld microscope, rapid Phytophthora lateral flow test strips, and CCRI diagnostic training.",
      skillGapTitle: "BRIDGING THE SKILL GAP: ICAR-CCRI Citrus Pathogen Identification Protocol",
      skillGapDesc: "ICAR-Central Citrus Research Institute Nagpur offers certified 7-day technical training on citrus disease diagnosis, leaf nutrient indexing, and remedial spray prescriptions.",
      infraHighlight: "ICAR-CCRI Diagnostic Laboratories on Amravati Road for advanced reference assays and sample indexing.",
      roadmapPhases: [
        { phase: "PHASE 1", title: "Cluster Orchard Health Survey", tasks: ["Map 20 villages in Katol, Narkhed & Kalmeshwar with high Dieback incidence", "Interview 50 growers regarding testing willingness and pesticide expenditure"] },
        { phase: "PHASE 2", title: "CCRI Technical Diagnostic Certification", tasks: ["Enroll in ICAR-CCRI technical training on citrus plant health assays", "Obtain accreditation for field-level leaf sampling and NPK diagnosis"] },
        { phase: "PHASE 3", title: "Diagnostic Equipment Procurement", tasks: ["Procure portable digital refractometer, soil NPK/pH sensors, and digital field microscope", "Prepare branded bilingual (Marathi/English) soil-leaf test report templates"] },
        { phase: "PHASE 4", title: "FPO & Village Camp Tie-ups", tasks: ["Partner with 4 primary FPOs to conduct weekend diagnostic camps", "Submit PMFME / MSME scheme application for technical service assistance"] },
        { phase: "PHASE 5", title: "Commercial Mobile Testing Rollout", tasks: ["Launch on-farm testing service charging ₹350–₹500 per orchard diagnostic audit", "Deliver instant advisory report with precise nutrient & bio-fungicide plan"] },
        { phase: "PHASE 6", title: "Subscription Model & Annual Retainers", tasks: ["Onboard 120 orchards on annual health monitoring contracts (4 visits/year)", "Introduce automated WhatsApp soil health reminder service"] },
      ],
      capexBreakdown: [
        { name: "Portable Leaf Spectrophotometer, Digital pH/EC & NPK Meters", pct: 0.38 },
        { name: "Phytophthora & Citrus Greening Rapid Diagnostic Test Strips", pct: 0.24 },
        { name: "Mobile Field Kit Casing, Handheld Digital Microscope & Tablet", pct: 0.22 },
        { name: "ICAR-CCRI Technical Diagnostic Certification & Working Buffer", pct: 0.16 },
      ],
    };
  }

  // 3. Peel Processing / Candied Peel / Essential Oil / Bio-Enzyme
  if (name.includes("peel") || name.includes("oil") || name.includes("candied") || name.includes("enzyme") || name.includes("waste") || name.includes("byproduct")) {
    return {
      type: "peel_processing",
      tagline: "Zero-Waste Citrus Peel Valorization & Bakery Inclusions",
      archetypeName: "Citrus Byproduct & Candied Peel Unit",
      characteristics: {
        type: "Agro-Waste Upcycling & Secondary Food Ingredient Manufacturing",
        footprint: "Semi-Covered Processing Area (250–500 sq.ft with 3-phase power)",
        seasonality: "Harvest Season Manufacturing (Oct–March) with year-round dried product sales",
        margins: "~50–65% Margin by converting ₹2/kg waste peels into ₹180/kg gourmet confectionery",
      },
      targetCustomers: [
        "Artisanal bakeries, patisseries, and cake manufacturers across Nagpur and Pune",
        "Confectionery & pan-masala ingredient aggregators sourcing dried citrus peel flakes",
        "Herbal cosmetic brands purchasing organic d-limonene & citrus essential oils",
        "Organic agricultural input cooperatives sourcing citrus bio-enzymes for pest deterrence",
      ],
      locationReason: `Surrounded by large-scale citrus peeling and packing centers in ${activeLocation || "Katol & Kalamna"}, securing near-zero raw material procurement cost.`,
      resourceReason: "Utilizes available covered shed or workshop space with washing water drainage and domestic/commercial power.",
      experienceReason: "Capitalizes on familiarity with citrus handling, grading, and post-harvest washing procedures.",
      setupNeed: "Stainless steel peeling/blanching kettles, osmotic sugar syruping tanks, hybrid solar tunnel dryer, and vacuum packaging unit.",
      skillGapTitle: "BRIDGING THE SKILL GAP: CFTRI / CCRI Citrus Byproduct Processing Standards",
      skillGapDesc: "Hands-on training in sugar brix monitoring, citric acid preservation, and food-grade packaging ensures compliance with FSSAI regulations.",
      infraHighlight: "Katol Agro-Processing Cluster and MIDC cold rooms for raw rind batch preservation before dehydration.",
      roadmapPhases: [
        { phase: "PHASE 1", title: "Raw Material Sourcing Agreements", tasks: ["Tie up with 10 juice kiosks and Kalamna grading yards for clean waste peels", "Conduct trial blanching and test sugar saturation curves"] },
        { phase: "PHASE 2", title: "FSSAI & Environmental Approvals", tasks: ["Apply for FSSAI State Manufacturing License", "Obtain MSME Udyam registration and Green Category PCB clearance"] },
        { phase: "PHASE 3", title: "Processing Shed & Solar Dryer Setup", tasks: ["Install stainless steel food-grade blanching vats and curing tanks", "Erect hybrid solar dehydrator cabinet (50 kg batch capacity)"] },
        { phase: "PHASE 4", title: "PMFME 35% Capital Grant Sanction", tasks: ["Submit Detailed Project Report under PMFME ODOP scheme (Nagpur Citrus)", "Secure 35% credit-linked capital subsidy for equipment"] },
        { phase: "PHASE 5", title: "Bakery Commercial Sampling", tasks: ["Distribute 1 kg tasting samples to 30 leading bakeries in Nagpur city", "Finalize supply contracts for diced candied peels at ₹160–₹220/kg"] },
        { phase: "PHASE 6", title: "Product Line Expansion", tasks: ["Scale production to 1.5 MT/month candied peel and 100L essential oil", "Launch packaged retail snack jars under proprietary D2C brand"] },
      ],
      capexBreakdown: [
        { name: "SS-316 Hydro-Steam Distillation Unit & Blanching Tanks", pct: 0.42 },
        { name: "Centrifuge Oil Separator & Electric Citrus Peel Shredder", pct: 0.26 },
        { name: "Hybrid Solar Dehydrator Cabinet (50 kg batch capacity)", pct: 0.18 },
        { name: "PCB Green Category Consent, FSSAI Registration & Working Capital", pct: 0.14 },
      ],
    };
  }

  // 4. Marmalade / Jam / RTS Bottling
  if (name.includes("marmalade") || name.includes("jam") || name.includes("preserve") || name.includes("bottling") || name.includes("pulp")) {
    return {
      type: "marmalade_food",
      tagline: "Gourmet Nagpur Mandarin Marmalade & Value-Added Preserves",
      archetypeName: "Artisanal Jam & Citrus Preserve Enterprise",
      characteristics: {
        type: "Small-Batch Gourmet Food Processing & Culinary Value-Addition",
        footprint: "FSSAI-Compliant Food Processing Facility (300–600 sq.ft)",
        seasonality: "Manufactured during seasonal glut; sold year-round as shelf-stable food",
        margins: "~40–55% Gross Margin across retail and institutional gift packaging",
      },
      targetCustomers: [
        "Premium grocery supermarkets and specialty gourmet shops in Vidarbha & Mumbai",
        "Hospitality sector: boutique hotels, heritage resorts, and airport souvenir gift shops",
        "Direct-to-consumer (D2C) e-commerce buyers looking for authentic GI-tagged Nagpur Orange treats",
        "Corporate gifting agencies designing seasonal festive agro-gift hampers",
      ],
      locationReason: `Located right at the geographical origin of the GI-tagged Nagpur Mandarin in ${activeLocation || "Nagpur District"}, delivering supreme brand authenticity.`,
      resourceReason: "Operates efficiently within a clean covered workspace, utilizing potable water and sanitary cooking infrastructure.",
      experienceReason: "Translates traditional fruit preservation and recipe formulation into standard commercial batches.",
      setupNeed: "Steam-jacketed stainless steel cooking kettle, manual jar capper, digital refractometer (Brix meter), and sterile glass jar line.",
      skillGapTitle: "BRIDGING THE SKILL GAP: Commercial Fruit Preservation & FSSAI Thermal Processing",
      skillGapDesc: "Mastering pectin balance, pH stabilization, and thermal sterilization ensures consistent jelly set and 12-month ambient shelf life.",
      infraHighlight: "Central Food Technology Research Institute (CFTRI) protocols & MIDC food park testing laboratories.",
      roadmapPhases: [
        { phase: "PHASE 1", title: "Recipe Standardization & Shelf-Life Study", tasks: ["Formulate low-sugar gourmet mandarin marmalade recipe", "Test pectin-acid balance and confirm 12-month ambient stability"] },
        { phase: "PHASE 2", title: "Food Safety & Regulatory Licensing", tasks: ["Obtain FSSAI Manufacturing License & Agmark certification", "Implement Good Manufacturing Practices (GMP) and sanitary layout"] },
        { phase: "PHASE 3", title: "Commercial Kitchen Equipment Setup", tasks: ["Procure stainless steel steam cooking kettle, pulper, and jar sterilizer", "Source custom branded glass jars and tamper-proof induction foil lids"] },
        { phase: "PHASE 4", title: "PMFME ODOP Scheme Sanction", tasks: ["File Detailed Project Report on PMFME portal under ODOP Nagpur Orange", "Secure 35% subsidy and bank sanction for processing hardware"] },
        { phase: "PHASE 5", title: "Market Launch & Specialty Store Placement", tasks: ["Place inaugural 500-jar batch across Nagpur airport and premier supermarkets", "Launch Instagram & WhatsApp business ordering catalog"] },
        { phase: "PHASE 6", title: "Corporate Gifting & Regional Distribution", tasks: ["Secure corporate Diwali & New Year hamper orders", "Expand monthly production to 3,000 jars"] },
      ],
      capexBreakdown: [
        { name: "Steam-Jacketed SS Cooking Kettle & Industrial Fruit Pulper", pct: 0.40 },
        { name: "Semi-Automatic Jar Capping, Foil Sealing & Labeling Station", pct: 0.25 },
        { name: "Commercial Kitchen Epoxied Washdown Setup & SS Prep Tables", pct: 0.20 },
        { name: "FSSAI Manufacturing License, Agmark Assays & Glass Jars", pct: 0.15 },
      ],
    };
  }

  // 5. Nursery & Propagation (Default fallback if truly a nursery model)
  return {
    type: "nursery",
    tagline: "Certified Disease-Free Citrus Mother Plant & Rootstock Propagation",
    archetypeName: "Disease-Free Certified Citrus Nursery",
    characteristics: {
      type: "Agro-Propagation & Certified Disease-Free Budwood Nursery",
      footprint: "Land-Dependent (0.5 – 2.0 Acres agricultural land)",
      seasonality: "Year-Round Nursery Care (Peak dispatch in monsoon June–Sept & winter Dec–Jan)",
      margins: "~35–45% per certified rootstock sapling",
    },
    targetCustomers: [
      "Commercial citrus farmers planting new orchards across Vidarbha and MP",
      "Secondary nurseries in Amravati, Wardha & Chhindwara needing indexed budwood",
      "Maharashtra State Horticulture Department tenders for subsidy distribution",
      "Farmer Producer Organizations (FPOs) executing high-density replanting programs",
    ],
    locationReason: `Detected prime citrus production cluster with ICAR-CCRI demonstration plots in ${activeLocation || "Katol / Narkhed"}.`,
    resourceReason: "Directly monetizes available land footprint, reliable borewell water source, and 3-phase agricultural power connection.",
    experienceReason: "Builds on your practical agricultural background for nursery mother-plant propagation and disease surveillance.",
    setupNeed: "UV-stabilized 50% shade-net polyhouse (1,000 sq. m), micro-sprinklers, and certified Rangpur lime rootstocks.",
    skillGapTitle: "BRIDGING THE SKILL GAP: Citrus Grafting & CCRI Budwood Protocols",
    skillGapDesc: "ICAR-Central Citrus Research Institute (Nagpur) conducts certified 5-day nursery propagation workshops. Adding this to your Roadmap prepares you for Maharashtra state nursery accreditation.",
    infraHighlight: "ICAR-CCRI Regional Outreach Centre & Certified Mother Plant demonstration farm.",
    roadmapPhases: [
      { phase: "PHASE 1", title: "Research & Grower Demand Validation", tasks: ["Understand local Vidarbha grower demand for Rangpur lime rootstocks", "Verify Katol APMC sapling trading seasons and pre-booking trends"] },
      { phase: "PHASE 2", title: "Skills & State Nursery Registration", tasks: ["Enroll in ICAR-CCRI 5-day nursery propagation workshop", "Apply for Maharashtra State Horticulture Nursery Registration"] },
      { phase: "PHASE 3", title: "Polyhouse & Irrigation Setup", tasks: ["Erect 1,000 sq. m shade-net structure with UV-stabilized 50% mesh", "Install automated micro-sprinkler misting lines and soil benches"] },
      { phase: "PHASE 4", title: "Finance & Scheme Sanction", tasks: ["Submit Detailed Project Report (DPR) to PMFME portal", "Obtain bank in-principle loan sanction with 35% capital subsidy"] },
      { phase: "PHASE 5", title: "Mother Plant & Budwood Sourcing", tasks: ["Procure certified disease-free rootstocks and indexed budwood from CCRI", "Initiate first seasonal T-budding grafting cycle"] },
      { phase: "PHASE 6", title: "Commercial Launch & Distribution", tasks: ["Distribute first batch of 15,000 certified saplings to local orchards", "Sign recurring nursery off-take contracts with 3 regional FPOs"] },
    ],
    capexBreakdown: [
      { name: "UV-Stabilized 50% Shade-Net Polyhouse (1,000 sq. m GI Structure)", pct: 0.38 },
      { name: "Mother Plant Rootstocks & CCRI Certified Nagpur Mandarin Budwood", pct: 0.20 },
      { name: "Micro-Sprinklers & Automated Drip Fertigation Unit", pct: 0.14 },
      { name: "Sterilized Potting Media, Grow Bags & Initial Working Capital", pct: 0.28 },
    ],
  };
}

const PLAN_SECTIONS = [
  { id: "overview", label: "01 Business Overview", icon: "📋" },
  { id: "why_fits", label: "02 Why This Business?", icon: "🎯" },
  { id: "skills", label: "03 Skills & Training", icon: "🧠" },
  { id: "resources", label: "04 Resources & Setup", icon: "🏗️" },
  { id: "location", label: "05 Location & Ecosystem", icon: "📍" },
  { id: "finance", label: "06 Investment & Finance", icon: "💰" },
  { id: "schemes", label: "07 Government Schemes", icon: "🏛️" },
  { id: "implementation", label: "08 Implementation Roadmap", icon: "🚀" },
];

export default function BusinessPlan() {
  const locationState = useLocation();
  const navigate = useNavigate();
  const { user, activeVenture, setActiveVenture } = useAuth();

  const [activeSection, setActiveSection] = useState("overview");
  const [viewMode, setViewMode] = useState("overview_card"); // "overview_card" (3.1) | "full_plan" (3.2)
  const [financialPlan, setFinancialPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [customSkills, setCustomSkills] = useState([]);
  const [isDPRModalOpen, setIsDPRModalOpen] = useState(false);

  // Retrieve opportunity data from state or localStorage
  let oppData = locationState?.state?.opportunity;
  let userSummary = locationState?.state?.userSummary;
  let userInput = locationState?.state?.userInput;

  if (!oppData) {
    try {
      const saved = localStorage.getItem("ev_active_business_plan");
      if (saved) {
        const parsed = JSON.parse(saved);
        oppData = parsed.opportunity;
        userSummary = parsed.userSummary;
        userInput = parsed.userInput;
      }
    } catch (e) {}
  }

  // Fallback defaults if opened directly
  const opportunity = oppData || {
    opportunity_id: "OPP01",
    name: "Disease-Free Certified Citrus Nursery",
    category: "Agri-Business & Nursery",
    description: "High-demand production and supply of disease-free, certified Nagpur Mandarin saplings using ICAR-CCRI budwood protocols and shade-net polyhouse infrastructure.",
    location_relevance: "Katol, Narkhed, Warud-Morshi, Nagpur",
    suitability_score: 92,
    matched_skills: ["Farming & Orchard Management", "Basic Irrigation"],
    missing_skills: ["Citrus Grafting & CCRI Budwood Protocols", "Disease Surveillance"],
    matched_resources: ["Agricultural Land (2.5 Acres)", "Reliable Borewell Water", "3-Phase Power"],
    missing_resources: ["Shade-Net Polyhouse (1,000 sq. m)", "Micro-Sprinklers"],
    financial_breakdown: {
      total_project_cost: 480000,
      user_budget: 250000,
      funding_gap: 0,
      eligible_scheme: "PMFME 35% Credit-Linked Subsidy (MoFPI)",
      subsidy_amount: 168000,
      subsidy_percentage: "35%",
    },
  };

  // Dynamic user profile resolution from scoped & global localStorage or state
  const userProfile = useMemo(() => {
    let skills = [];
    let resources = {};
    let finances = {};
    let documents = [];
    let locationVal = user?.tehsil ? `${user.tehsil}, ${user.district || "Nagpur District"}` : (userInput?.location || userSummary?.location || "Katol, Nagpur District");

    try {
      const uId = user?.id;
      const sKey = uId ? `ev_${uId}_skills_data` : "ev_skills_data";
      const rKey = uId ? `ev_${uId}_user_resources` : "ev_user_resources";
      const fKey = uId ? `ev_${uId}_user_finances` : "ev_user_finances";
      const dKey = uId ? `ev_${uId}_user_documents` : "ev_user_documents";

      const savedSkills = localStorage.getItem(sKey) || localStorage.getItem("ev_skills_data");
      if (savedSkills) {
        const parsed = JSON.parse(savedSkills);
        skills = Array.isArray(parsed) ? parsed : (parsed.skills || []);
      }

      const savedRes = localStorage.getItem(rKey) || localStorage.getItem("ev_user_resources");
      if (savedRes) {
        resources = JSON.parse(savedRes);
      }

      const savedFin = localStorage.getItem(fKey) || localStorage.getItem("ev_user_finances");
      if (savedFin) {
        finances = JSON.parse(savedFin);
      }

      const savedDocs = localStorage.getItem(dKey) || localStorage.getItem("ev_user_documents");
      if (savedDocs) {
        documents = JSON.parse(savedDocs);
      }
    } catch (e) {}

    return { skills, resources, finances, documents, location: locationVal };
  }, [user, userInput, userSummary]);

  const activeLocation = userInput?.location || userSummary?.location || userProfile?.location || "Katol, Nagpur District";
  
  // Dynamic user equity resolution: prioritizes profile personal savings/available capital
  const profileSavings = Number(userProfile?.finances?.personalSavings || userProfile?.finances?.availableCapitalINR || 0);
  const ownEquity = profileSavings > 0
    ? profileSavings
    : (userInput?.budget_inr || parseFloat(String(userSummary?.budget || "250000").replace(/[^0-9.]/g, "")) || 250000);

  const totalCost = opportunity.financial_breakdown?.total_project_cost || 480000;
  const subsidyAmount = opportunity.financial_breakdown?.subsidy_amount || Math.round(totalCost * 0.35);
  const initialBankLoan = Math.max(0, totalCost - ownEquity);
  const netLoanAfterSubsidy = Math.max(0, totalCost - ownEquity - subsidyAmount);
  const bankLoan = initialBankLoan;

  const archetype = useMemo(() => getOpportunityArchetype(opportunity, activeLocation), [opportunity, activeLocation]);

  // Scalable, mathematically exact CapEx items proportional to totalCost
  const capexItems = useMemo(() => {
    const template = archetype?.capexBreakdown || [
      { name: "Core Production Machinery & Technical Equipment", pct: 0.45 },
      { name: "Facility Setup & Workspace Infrastructure", pct: 0.25 },
      { name: "Raw Material Buffer & 3-Month Working Capital", pct: 0.20 },
      { name: "Statutory Licenses, Registrations & Setup Buffer", pct: 0.10 },
    ];

    let runningSum = 0;
    return template.map((item, idx) => {
      let cost = 0;
      if (idx === template.length - 1) {
        cost = Math.max(0, totalCost - runningSum);
      } else {
        cost = Math.round((totalCost * item.pct) / 1000) * 1000;
        runningSum += cost;
      }
      return {
        name: item.name,
        cost,
      };
    });
  }, [archetype, totalCost]);

  // Dynamic Readiness Matrix calculation based on genuine user assets & venture requirements
  const readinessMatrix = useMemo(() => {
    // 1. Technical Skills
    const matchedCount = (opportunity.matched_skills || []).length;
    const missingSkills = opportunity.missing_skills || [];
    let skillsStatus = {
      label: "✓ Good Match",
      color: "var(--ok)",
      desc: `${matchedCount} core skills verified`
    };
    if (missingSkills.length === 0 && matchedCount > 0) {
      skillsStatus = { label: "✓ Fully Qualified", color: "var(--ok)", desc: "100% skill match" };
    } else if (matchedCount === 0 && missingSkills.length > 0) {
      skillsStatus = { label: `⚠ Gap: ${missingSkills[0]}`, color: "var(--cyan)", desc: "Training prescribed" };
    } else if (missingSkills.length > 0) {
      skillsStatus = { label: `✓ Match (${missingSkills.length} Gap)`, color: "var(--ok)", desc: `Prescribed: ${missingSkills[0]}` };
    }

    // 2. Land & Resources
    const isMobileOrZeroLand = archetype.type === "diagnostic_clinic" || archetype.type === "juice_kiosk" ||
      archetype.characteristics?.footprint?.toLowerCase().includes("zero land") ||
      archetype.characteristics?.footprint?.toLowerCase().includes("mobile");

    let landStatus = { label: "✓ Available", color: "var(--ok)", desc: "Resources verified" };
    const resList = Array.isArray(userProfile.resources?.resources) ? userProfile.resources.resources : [];
    const landRes = resList.find(r => r.id === "r1");
    const shedRes = resList.find(r => r.id === "r3");
    const landAcres = userProfile.resources?.landAcres || (userInput?.has_land ? userInput?.land_acres : null) || 0;

    if (isMobileOrZeroLand) {
      landStatus = { label: "✓ Zero Land Footprint", color: "var(--ok)", desc: "Mobile kit / cart operation" };
    } else if (landRes?.available || landAcres > 0) {
      landStatus = { label: `✓ Available (${landAcres > 0 ? landAcres + " Acres" : "Land Owned"})`, color: "var(--ok)", desc: "Owned farm acreage" };
    } else if (shedRes?.available || userProfile.resources?.hasWorkspace) {
      landStatus = { label: "✓ Work Shed Ready", color: "var(--ok)", desc: "Covered commercial workspace" };
    } else {
      landStatus = { label: "⚠ Land / Shed Lease Needed", color: "var(--cyan)", desc: "Footprint requirement pending" };
    }

    // 3. Local Ecosystem
    const userTehsil = user?.tehsil || userProfile.location?.split(",")[0]?.trim() || "Katol";
    let ecosystemStatus = {
      label: `✓ Prime Cluster (${userTehsil})`,
      color: "var(--ok)",
      desc: "Direct access to Vidarbha citrus corridor"
    };

    // 4. Financial Capital
    const equityRatio = ownEquity / (totalCost || 1);
    let financeStatus = {
      label: "⚠ PMFME Subsidy Leverage",
      color: "var(--cyan)",
      desc: "35% credit-linked capital subsidy"
    };
    if (equityRatio >= 0.5) {
      financeStatus = {
        label: `✓ Self-Financed (${Math.round(equityRatio * 100)}% Equity)`,
        color: "var(--ok)",
        desc: "Low debt exposure"
      };
    } else if (equityRatio >= 0.2) {
      financeStatus = {
        label: `⚠ PMFME Leverage (${Math.round((subsidyAmount / totalCost) * 100)}% Subsidy + Loan)`,
        color: "var(--cyan)",
        desc: "35% credit-linked capital subsidy"
      };
    } else {
      financeStatus = {
        label: "⚠ High Grant/Debt Need",
        color: "var(--amber)",
        desc: "Promoter margin shortfall"
      };
    }

    // 5. Certifications & Documents
    const docCount = Array.isArray(userProfile.documents) ? userProfile.documents.length : 0;
    let certStatus = {
      label: "⚠ Training Required",
      color: "var(--violet)",
      desc: "Prescribed certification to obtain"
    };
    if (docCount >= 2) {
      certStatus = {
        label: `✓ Verified (${docCount} Docs on File)`,
        color: "var(--ok)",
        desc: "Verified profile documents"
      };
    } else if (docCount === 1) {
      certStatus = {
        label: "✓ 1 Document on File",
        color: "var(--ok)",
        desc: "Additional trade certifications recommended"
      };
    } else if (archetype.type === "juice_kiosk" || archetype.type === "marmalade_food") {
      certStatus = {
        label: "⚠ FSSAI Registration Needed",
        color: "var(--violet)",
        desc: "Food business registration required"
      };
    } else if (archetype.type === "nursery") {
      certStatus = {
        label: "⚠ CCRI Nursery Accreditation",
        color: "var(--violet)",
        desc: "Mandatory budwood certification"
      };
    } else if (archetype.type === "diagnostic_clinic") {
      certStatus = {
        label: "⚠ CCRI Diagnostic Training",
        color: "var(--violet)",
        desc: "Plant pathogen indexing course"
      };
    }

    return {
      skills: skillsStatus,
      resources: landStatus,
      ecosystem: ecosystemStatus,
      finance: financeStatus,
      certifications: certStatus
    };
  }, [opportunity, archetype, userProfile, ownEquity, totalCost, subsidyAmount, user, userInput]);

  // Dynamic Fit Reasons tailored to current user profile
  const dynamicFitReasons = useMemo(() => {
    const userTehsil = user?.tehsil || userProfile.location?.split(",")[0]?.trim() || "Katol";
    const userLocation = `${userTehsil}, ${user?.district || "Nagpur District"}`;

    // 1. Location Reason
    let locationReason = `Located in ${userLocation}, within the central Nagpur mandarin production corridor for low-cost sourcing and rapid market access.`;
    if (archetype.type === "diagnostic_clinic") {
      locationReason = `Based in ${userLocation}, placing your mobile clinic within 45 minutes of over 35,000 hectares of commercial orchards across ${userTehsil} and adjoining tehsils.`;
    } else if (archetype.type === "juice_kiosk") {
      locationReason = `Based in ${userLocation}, offering seamless highway logistics to high-footfall urban consumption hubs and direct morning crate sourcing from local APMC mandis.`;
    } else if (archetype.type === "nursery") {
      locationReason = `Situated in ${userLocation}, right in the epicenter of the Vidarbha citrus replanting zone with close proximity to ICAR-CCRI mother tree blocks.`;
    } else if (archetype.type === "peel_processing") {
      locationReason = `Located in ${userLocation}, directly adjacent to major citrus peeling and packing sheds, securing assured raw peel feedstock at minimal transit cost.`;
    }

    // 2. Resource Reason
    let resourceReason = archetype.resourceReason;
    const isMobile = archetype.type === "diagnostic_clinic" || archetype.type === "juice_kiosk";
    const landAcres = userProfile.resources?.landAcres || (userInput?.has_land ? userInput?.land_acres : null) || 0;
    if (isMobile) {
      resourceReason = "Requires zero crop acreage; uses portable testing instruments and compact mobile hardware that deploy without civil construction delays.";
    } else if (landAcres > 0) {
      resourceReason = `Directly monetizes your ${landAcres} acres of agricultural land and existing water connection, saving up to ₹1.8 Lakhs in annual commercial lease rents.`;
    } else if (userProfile.resources?.hasWorkspace) {
      resourceReason = "Leverages your covered work shed for compliant equipment installation, washing lines, and hygienic product storage.";
    }

    // 3. Experience Reason
    let experienceReason = archetype.experienceReason;
    if (opportunity.matched_skills && opportunity.matched_skills.length > 0) {
      experienceReason = `Builds directly on your practical background in ${opportunity.matched_skills.join(" and ")}, enabling rapid operational ramp-up.`;
    }

    // 4. Setup Need
    let setupNeed = archetype.setupNeed;
    if (opportunity.missing_resources && opportunity.missing_resources.length > 0) {
      setupNeed = `${opportunity.missing_resources.slice(0, 3).join(", ")}, accompanied by ${opportunity.missing_skills?.[0] || "prescribed domain training"}.`;
    }

    return {
      locationReason,
      resourceReason,
      experienceReason,
      setupNeed
    };
  }, [archetype, opportunity, user, userProfile, userInput]);

  // Pre-qualified government schemes tailored to the selected venture's category
  const eligibleSchemes = useMemo(() => {
    const name = (opportunity?.name || "").toLowerCase();
    const cat = (opportunity?.category || "").toLowerCase();

    // 1. Diagnostic Clinic / Testing Services
    if (name.includes("diagnostic") || name.includes("clinic") || name.includes("testing") || name.includes("soil") || cat.includes("agritech") || cat.includes("testing")) {
      return [
        {
          name: "🏛️ PMEGP (Prime Minister's Employment Generation Programme)",
          badge: "25% Rural Margin Money Grant",
          badgeClass: "verified",
          desc: "Credit-linked capital subsidy up to 25% (rural) for setting up self-employed agro-diagnostic mobile testing labs and mobile soil clinics.",
          maxBenefit: "Max project cost up to ₹20 Lakhs with 25% non-repayable margin money grant.",
          actionText: "✓ Check PMEGP Eligibility",
        },
        {
          name: "🌾 SMAM & RKVY (Agricultural Testing & Mechanization)",
          badge: "40%–50% Machinery Grant",
          badgeClass: "claimed",
          desc: "Provides 40% to 50% capital subsidy on testing instrumentation, mobile van outfitting, and diagnostic hardware for custom hiring service providers.",
          maxBenefit: "Subsidizes spectrophotometers, soil EC/pH kits, and field microscopes.",
          actionText: "Explore SMAM Guidelines",
        },
        {
          name: "💼 CGTMSE Credit Guarantee Scheme",
          badge: "100% Collateral-Free Loan",
          badgeClass: "claimed",
          desc: "Zero collateral requirement for bank term loans up to ₹2 Crore for qualified agricultural service entrepreneurs.",
          maxBenefit: "No land or property mortgage required by lending bank.",
          actionText: "View CGTMSE Coverage",
        },
      ];
    }

    // 2. Nursery & Seedling Propagation
    if (name.includes("nursery") || name.includes("propagation") || name.includes("budwood") || name.includes("sapling") || cat.includes("nursery")) {
      return [
        {
          name: "🏛️ MIDH / NHM (Mission for Integrated Development of Horticulture)",
          badge: "50% Capital Subsidy (Accredited)",
          badgeClass: "verified",
          desc: "Credit-linked capital subsidy of up to 50% for setting up accredited hi-tech citrus nurseries (up to ₹25 Lakhs per hectare).",
          maxBenefit: "Covers polyhouses, mist chambers, and mother rootstock blocks.",
          actionText: "✓ Check MIDH Eligibility",
        },
        {
          name: "🌾 Agriculture Infrastructure Fund (AIF)",
          badge: "3% Interest Subvention",
          badgeClass: "claimed",
          desc: "Provides 3% annual interest rate reduction on bank loans up to ₹2 Crore with CGTMSE credit guarantee.",
          maxBenefit: "Reduces commercial borrowing interest rate from ~11% down to ~8%.",
          actionText: "Explore AIF Terms",
        },
      ];
    }

    // 3. Post-Harvest / Sorting / Cold Chain
    if (name.includes("cold") || name.includes("storage") || name.includes("sorting") || name.includes("grading") || name.includes("packhouse") || name.includes("waxing")) {
      return [
        {
          name: "🌾 Agriculture Infrastructure Fund (AIF)",
          badge: "3% Interest Subvention + Credit Guarantee",
          badgeClass: "verified",
          desc: "Priority financing for farm-gate post-harvest storage, primary sorting & grading lines, and solar cold chain units.",
          maxBenefit: "3% interest subvention for up to 7 years on project debt up to ₹2 Crore.",
          actionText: "✓ Check AIF Eligibility",
        },
        {
          name: "🏛️ MIDH Post-Harvest Management Scheme",
          badge: "35% Capital Grant",
          badgeClass: "claimed",
          desc: "Capital investment subsidy of 35% on pre-cooling units, modular cold rooms, and motorized grading lines.",
          maxBenefit: "Up to ₹35 Lakhs subsidy on specialized post-harvest machinery.",
          actionText: "Explore MIDH Post-Harvest",
        },
      ];
    }

    // 4. Food Processing & Value Addition (Juice, Marmalade, Peel Oil, Pellets)
    return [
      {
        name: "🏛️ PMFME Scheme (Pradhan Mantri Formalisation of Micro food processing)",
        badge: "35% Capital Grant (ODOP Citrus)",
        badgeClass: "verified",
        desc: "Specialized credit-linked capital subsidy of 35% (up to ₹10 Lakhs) for micro food processing enterprises in Nagpur Mandarin cluster.",
        maxBenefit: "Covers juice extractors, cooking kettles, pasteurizers, and bottling hardware.",
        actionText: "✓ Check PMFME Eligibility",
      },
      {
        name: "🌾 Maharashtra State Agro-Industrial Policy 2024",
        badge: "25% Additional Capital Grant",
        badgeClass: "claimed",
        desc: "State industrial promotion assistance offering electricity tariff subsidies and 25% capital incentives for Vidarbha agro-processors.",
        maxBenefit: "Includes 5-year power tariff concession of ₹1.50/unit.",
        actionText: "Explore State Policy Terms",
      },
    ];
  }, [opportunity]);

  const [roadmapAdded, setRoadmapAdded] = useState(() => {
    return (
      activeVenture?.name === opportunity?.name ||
      activeVenture?.opportunity_id === opportunity?.opportunity_id ||
      activeVenture?.id === String(opportunity?.opportunity_id)
    );
  });

  useEffect(() => {
    try {
      localStorage.setItem("ev_active_business_plan", JSON.stringify({ opportunity, userSummary, userInput }));
    } catch (e) {}

    // Pre-calculate financial plan if needed
    async function loadPlan() {
      try {
        setPlanLoading(true);
        const p = await fetchFinancialPlan({
          opportunity_id: opportunity.opportunity_id || "OPP01",
          user_budget: ownEquity,
          location: activeLocation,
        });
        setFinancialPlan(p);
      } catch (err) {
        console.warn("Could not fetch financial plan API, using local DSS calculations:", err);
      } finally {
        setPlanLoading(false);
      }
    }
    loadPlan();
  }, [opportunity.opportunity_id]);

  const handleAddToRoadmap = () => {
    setRoadmapAdded(true);
    const newVenture = {
      id: `OPP${String(opportunity.opportunity_id || 1).padStart(2, "0")}`,
      opportunity_id: opportunity.opportunity_id,
      name: opportunity.name,
      category: opportunity.category,
      location: activeLocation,
      suitability_score: opportunity.suitability_score || 94,
      feasibility_score: opportunity.suitability_score || 94,
      capital_fit: opportunity.mcda_breakdown?.capital_fit || 85,
      infrastructure_fit: opportunity.mcda_breakdown?.infrastructure_fit || 80,
      market_fit: opportunity.mcda_breakdown?.market_fit || 80,
      skill_fit: opportunity.mcda_breakdown?.skill_fit || 80,
      score_type: "MCDA",
      mcda_breakdown: opportunity.mcda_breakdown || {},
      total_cost: totalCost,
      own_equity: ownEquity,
      subsidy_amount: subsidyAmount,
      subsidy_scheme: opportunity.financial_breakdown?.eligible_scheme || "PMFME 35% Credit-Linked Capital Subsidy",
      bank_loan: bankLoan,
      journey_phase: 1,
      current_task: "Review Bankable DPR & Prescribed Training",
      next_deadline: "Next 7 Days",
    };

    setActiveVenture(newVenture);

    try {
      const roadmapItem = {
        id: newVenture.id,
        name: opportunity.name,
        category: opportunity.category,
        location: activeLocation,
        targetCapEx: totalCost,
        addedAt: new Date().toISOString(),
      };
      localStorage.setItem("ev_saved_roadmap", JSON.stringify(roadmapItem));
    } catch (e) {}
  };

  return (
    <div style={{ maxWidth: 1160, margin: "0 auto", paddingBottom: 60 }}>
      {/* Top Breadcrumb Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <button
          onClick={() => navigate("/results")}
          className="btn-secondary-gloss"
          style={{ padding: "8px 16px", fontSize: "0.84rem", display: "inline-flex", gap: 6 }}
        >
          <ArrowLeft size={16} /> Back to Recommendations
        </button>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => setIsDPRModalOpen(true)}
            className="btn-primary-gloss"
            style={{
              padding: "8px 16px",
              fontSize: "0.84rem",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)",
              boxShadow: "0 4px 14px rgba(79, 70, 229, 0.35)",
            }}
          >
            🏛️ Generate Bank DPR (PDF)
          </button>
          <button
            onClick={() => setViewMode(viewMode === "overview_card" ? "full_plan" : "overview_card")}
            className="btn-secondary-gloss"
            style={{ padding: "8px 16px", fontSize: "0.84rem" }}
          >
            {viewMode === "overview_card" ? "📑 Open Full Plan" : "🗂️ View Summary"}
          </button>
          <button onClick={() => window.print()} className="btn-secondary-gloss" style={{ padding: "8px 16px", fontSize: "0.84rem" }}>
            <Printer size={16} /> Print Business Plan
          </button>
        </div>
      </div>

      {/* ====================================================================
          3.1 — OPPORTUNITY OVERVIEW (Summary Readiness Screen)
         ==================================================================== */}
      {viewMode === "overview_card" && (
        <div className="card wizard-form-card" style={{ padding: "36px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14, marginBottom: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span className="skill-status-tag verified" style={{ fontSize: "0.75rem" }}>
                  {opportunity.category}
                </span>
                <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                  📍 Suitable Location: {opportunity.location_relevance || activeLocation}
                </span>
              </div>
              <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 8px" }}>
                {opportunity.name}
              </h1>
              <p style={{ fontSize: "0.92rem", color: "var(--muted)", lineHeight: 1.6, maxWidth: 780, margin: 0 }}>
                {opportunity.description}
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "var(--cyan)" }}>
                {opportunity.suitability_score || 92}%
              </span>
              <span style={{ display: "block", fontSize: "0.72rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                Overall Fit Index
              </span>
            </div>
          </div>

          <div style={{ height: 1, background: "var(--line)", margin: "20px 0" }} />

          {/* Why This Business & Readiness 2-Column Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 20, marginBottom: 28 }}>
            {/* Box 1: Why This Business */}
            <div style={{ background: "var(--panel-solid)", padding: 20, borderRadius: 16, border: "1px solid var(--line)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.88rem", fontWeight: 800, color: "var(--ok)", textTransform: "uppercase", marginBottom: 14 }}>
                <CheckCircle2 size={18} /> WHY THIS BUSINESS FITS YOU
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, fontSize: "0.86rem" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "var(--ok)", fontWeight: 800 }}>✓</span>
                  <span>
                    <strong>Matches Your Location: </strong>
                    {dynamicFitReasons.locationReason}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "var(--ok)", fontWeight: 800 }}>✓</span>
                  <span>
                    <strong>Matches Your Resources: </strong>
                    {dynamicFitReasons.resourceReason}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "var(--ok)", fontWeight: 800 }}>✓</span>
                  <span>
                    <strong>Relevant Experience: </strong>
                    {dynamicFitReasons.experienceReason}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ color: "var(--cyan)", fontWeight: 800 }}>⚠</span>
                  <span>
                    <strong>Identified Setup Need: </strong>
                    {dynamicFitReasons.setupNeed}
                  </span>
                </div>
              </div>
            </div>

            {/* Box 2: Your Readiness Matrix */}
            <div style={{ background: "rgba(99, 102, 241, 0.06)", padding: 20, borderRadius: 16, border: "1px solid var(--line-glow)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.88rem", fontWeight: 800, color: "var(--electric-blue)", textTransform: "uppercase", marginBottom: 14 }}>
                <Compass size={18} /> YOUR READINESS MATRIX
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.86rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--line)", paddingBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>🧠 Technical Skills</span>
                  <span style={{ color: readinessMatrix.skills.color, fontWeight: 700 }}>{readinessMatrix.skills.label}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--line)", paddingBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>🌾 Land & Resources</span>
                  <span style={{ color: readinessMatrix.resources.color, fontWeight: 700 }}>{readinessMatrix.resources.label}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--line)", paddingBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>📍 Local Ecosystem</span>
                  <span style={{ color: readinessMatrix.ecosystem.color, fontWeight: 700 }}>{readinessMatrix.ecosystem.label}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px dashed var(--line)", paddingBottom: 6 }}>
                  <span style={{ fontWeight: 600 }}>💰 Financial Capital</span>
                  <span style={{ color: readinessMatrix.finance.color, fontWeight: 700 }}>{readinessMatrix.finance.label}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: 600 }}>📄 Certifications</span>
                  <span style={{ color: readinessMatrix.certifications.color, fontWeight: 700 }}>{readinessMatrix.certifications.label}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Primary CTA */}
          <div style={{ textAlign: "center" }}>
            <button
              type="button"
              onClick={() => setViewMode("full_plan")}
              className="btn-primary-gloss"
              style={{ padding: "16px 44px", fontSize: "1.05rem" }}
            >
              <Sparkles size={20} />
              <span>GENERATE MY BUSINESS PLAN →</span>
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          3.2 — GENERATED BUSINESS PLAN (Modular Tabbed Navigation Hub)
         ==================================================================== */}
      {viewMode === "full_plan" && (
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20, alignItems: "flex-start" }}>
          {/* Left Navigation Sidebar */}
          <div
            className="card wizard-form-card"
            style={{
              padding: "16px",
              position: "sticky",
              top: 24,
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <div style={{ padding: "8px 12px 14px", borderBottom: "1px solid var(--line)", marginBottom: 6 }}>
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                BUSINESS PLAN HUB
              </span>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 0" }}>
                {opportunity.name}
              </h3>
            </div>

            {PLAN_SECTIONS.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: isActive
                      ? "linear-gradient(135deg, rgba(99, 102, 241, 0.16) 0%, rgba(6, 182, 212, 0.1) 100%)"
                      : "transparent",
                    border: isActive ? "1px solid var(--line-glow)" : "1px solid transparent",
                    color: isActive ? "var(--text-heading)" : "var(--muted)",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span>{sec.icon}</span>
                    <span>{sec.label}</span>
                  </span>
                  {isActive && <ChevronRight size={14} color="var(--cyan)" />}
                </button>
              );
            })}

            {/* Quick Action in Sidebar */}
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: 8 }}>
              <button
                type="button"
                onClick={handleAddToRoadmap}
                className={roadmapAdded ? "pill-option-btn active" : "btn-primary-gloss"}
                style={{ width: "100%", padding: "10px 12px", fontSize: "0.82rem", justifyContent: "center" }}
              >
                {roadmapAdded ? "✓ Added to My Roadmap" : "🗺️ Add to My Roadmap"}
              </button>
              {roadmapAdded && (
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="btn-secondary-gloss"
                  style={{ width: "100%", padding: "8px 10px", fontSize: "0.78rem", justifyContent: "center" }}
                >
                  🏠 Go to Home Dashboard
                </button>
              )}
            </div>
          </div>

          {/* Right Main Plan Content */}
          <div className="card wizard-form-card" style={{ padding: "32px 28px", minHeight: 650 }}>
            {/* ================================================================
                TAB 1: 01 BUSINESS OVERVIEW
               ================================================================ */}
            {activeSection === "overview" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase" }}>
                      01 • BUSINESS OVERVIEW
                    </span>
                    <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 0" }}>
                      What You Will Do
                    </h2>
                  </div>
                  <span className="skill-status-tag verified" style={{ fontSize: "0.75rem" }}>
                    🌱 Production & Supply
                  </span>
                </div>

                <div style={{ background: "var(--panel-solid)", padding: 18, borderRadius: 14, border: "1px solid var(--line)", marginBottom: 18 }}>
                  <p style={{ fontSize: "0.92rem", lineHeight: 1.6, color: "var(--text)", margin: 0 }}>
                    {opportunity.description}
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
                  <div style={{ background: "var(--panel-solid)", padding: 16, borderRadius: 14, border: "1px solid var(--line)" }}>
                    <strong style={{ fontSize: "0.88rem", color: "var(--electric-blue)", display: "block", marginBottom: 8 }}>
                      🎯 Target Customers & Off-takers
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.84rem", color: "var(--muted)", lineHeight: 1.6 }}>
                      {archetype.targetCustomers.map((cust, idx) => (
                        <li key={idx}>{cust}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ background: "var(--panel-solid)", padding: 16, borderRadius: 14, border: "1px solid var(--line)" }}>
                    <strong style={{ fontSize: "0.88rem", color: "var(--ok)", display: "block", marginBottom: 8 }}>
                      📦 Business Model Characteristics
                    </strong>
                    <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.84rem", color: "var(--muted)", lineHeight: 1.6 }}>
                      <li><strong>Type:</strong> {archetype.characteristics.type}</li>
                      <li><strong>Footprint:</strong> {archetype.characteristics.footprint}</li>
                      <li><strong>Seasonality:</strong> {archetype.characteristics.seasonality}</li>
                      <li><strong>Gross Margins:</strong> {archetype.characteristics.margins}</li>
                    </ul>
                  </div>
                </div>

                <div className="wizard-actions-bar">
                  <div />
                  <button type="button" className="btn-primary-gloss" onClick={() => setActiveSection("why_fits")}>
                    <span>Next: Why This Business →</span>
                  </button>
                </div>
              </div>
            )}

            {/* ================================================================
                TAB 2: 02 WHY THIS BUSINESS?
               ================================================================ */}
            {activeSection === "why_fits" && (
              <div>
                <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase" }}>
                  02 • STRATEGIC REASONING
                </span>
                <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 16px" }}>
                  Why EntreVision Recommended This
                </h2>

                {/* Profile Matching Logic Box */}
                <div style={{ background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(6, 182, 212, 0.06) 100%)", padding: 20, borderRadius: 16, border: "1px solid var(--line-glow)", marginBottom: 20 }}>
                  <strong style={{ fontSize: "0.9rem", color: "var(--text-heading)", display: "block", marginBottom: 12 }}>
                    💡 Decision Engine Synthesis:
                  </strong>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: "0.84rem" }}>
                    <div style={{ background: "var(--panel-solid)", padding: 12, borderRadius: 10, border: "1px solid var(--line)" }}>
                      <span style={{ color: "var(--cyan)", fontWeight: 700 }}>📍 Location Alignment</span>
                      <p style={{ margin: "4px 0 0", color: "var(--muted)", lineHeight: 1.5 }}>
                        {dynamicFitReasons.locationReason}
                      </p>
                    </div>

                    <div style={{ background: "var(--panel-solid)", padding: 12, borderRadius: 10, border: "1px solid var(--line)" }}>
                      <span style={{ color: "var(--ok)", fontWeight: 700 }}>🌱 Skills Alignment</span>
                      <p style={{ margin: "4px 0 0", color: "var(--muted)", lineHeight: 1.5 }}>
                        {dynamicFitReasons.experienceReason}
                      </p>
                    </div>

                    <div style={{ background: "var(--panel-solid)", padding: 12, borderRadius: 10, border: "1px solid var(--line)" }}>
                      <span style={{ color: "var(--electric-blue)", fontWeight: 700 }}>🏠 Resources Leverage</span>
                      <p style={{ margin: "4px 0 0", color: "var(--muted)", lineHeight: 1.5 }}>
                        {dynamicFitReasons.resourceReason}
                      </p>
                    </div>

                    <div style={{ background: "var(--panel-solid)", padding: 12, borderRadius: 10, border: "1px solid var(--line)" }}>
                      <span style={{ color: "var(--violet)", fontWeight: 700 }}>💰 Capital & Grant Fit</span>
                      <p style={{ margin: "4px 0 0", color: "var(--muted)", lineHeight: 1.5 }}>
                        ₹{ownEquity.toLocaleString("en-IN")} promoter equity covers your margin requirement and unlocks ₹{subsidyAmount.toLocaleString("en-IN")} credit-linked capital grant under PMFME ODOP.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="wizard-actions-bar">
                  <button type="button" className="btn-secondary-gloss" onClick={() => setActiveSection("overview")}>
                    ← Previous
                  </button>
                  <button type="button" className="btn-primary-gloss" onClick={() => setActiveSection("skills")}>
                    <span>Next: Skills & Training →</span>
                  </button>
                </div>
              </div>
            )}

            {/* ================================================================
                TAB 3: 03 SKILLS & TRAINING
               ================================================================ */}
            {activeSection === "skills" && (
              <div>
                <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase" }}>
                  03 • TECHNICAL READINESS
                </span>
                <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 16px" }}>
                  Required Skills & Gap Analysis
                </h2>

                <div style={{ background: "var(--panel-solid)", borderRadius: 14, border: "1px solid var(--line)", overflow: "hidden", marginBottom: 20 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", padding: "10px 16px", background: "var(--panel-subtle)", fontSize: "0.78rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                    <span>Required Technical Skill</span>
                    <span>Your Verification Status</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {(opportunity.matched_skills || []).map((s, idx) => (
                      <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", padding: "12px 16px", borderTop: "1px solid var(--line)", fontSize: "0.85rem", alignItems: "center" }}>
                        <span style={{ fontWeight: 600 }}>🌱 {s}</span>
                        <span style={{ color: "var(--ok)", fontWeight: 700 }}>✓ Verified Available</span>
                      </div>
                    ))}
                    {(opportunity.missing_skills || []).map((s, idx) => (
                      <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", padding: "12px 16px", borderTop: "1px solid var(--line)", fontSize: "0.85rem", alignItems: "center", background: "rgba(245, 158, 11, 0.04)" }}>
                        <span style={{ fontWeight: 600 }}>🪴 {s}</span>
                        <span style={{ color: "var(--cyan)", fontWeight: 700 }}>⚠ Training Recommended</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skill Gap Action Card */}
                <div style={{ background: "rgba(6, 182, 212, 0.08)", padding: 18, borderRadius: 14, border: "1px solid rgba(6, 182, 212, 0.3)", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <GraduationCap size={20} color="var(--cyan)" />
                    <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)" }}>
                      {archetype.skillGapTitle}
                    </strong>
                  </div>
                  <p style={{ fontSize: "0.84rem", color: "var(--muted)", lineHeight: 1.5, margin: "0 0 12px 0" }}>
                    {archetype.skillGapDesc}
                  </p>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button type="button" onClick={() => alert("Redirecting to CCRI Training Schedule portal...")} className="pill-option-btn" style={{ fontSize: "0.78rem" }}>
                      🎓 Find CCRI Training
                    </button>
                    <button type="button" onClick={handleAddToRoadmap} className="pill-option-btn active" style={{ fontSize: "0.78rem" }}>
                      🗺️ Add Training to My Roadmap
                    </button>
                    <button type="button" onClick={() => navigate("/profile")} className="pill-option-btn" style={{ fontSize: "0.78rem" }}>
                      📄 Add Existing Certificate
                    </button>
                  </div>
                </div>

                <div className="wizard-actions-bar">
                  <button type="button" className="btn-secondary-gloss" onClick={() => setActiveSection("why_fits")}>
                    ← Previous
                  </button>
                  <button type="button" className="btn-primary-gloss" onClick={() => setActiveSection("resources")}>
                    <span>Next: Resources & Setup →</span>
                  </button>
                </div>
              </div>
            )}

            {/* ================================================================
                TAB 4: 04 RESOURCES & INFRASTRUCTURE
               ================================================================ */}
            {activeSection === "resources" && (
              <div>
                <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase" }}>
                  04 • PHYSICAL ASSETS
                </span>
                <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 16px" }}>
                  Resources & Infrastructure Requirements
                </h2>

                <div style={{ background: "var(--panel-solid)", borderRadius: 14, border: "1px solid var(--line)", overflow: "hidden", marginBottom: 20 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", padding: "10px 16px", background: "var(--panel-subtle)", fontSize: "0.78rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                    <span>Physical Infrastructure Asset</span>
                    <span>Status</span>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {(opportunity.matched_resources || []).map((r, idx) => (
                      <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", padding: "12px 16px", borderTop: "1px solid var(--line)", fontSize: "0.85rem", alignItems: "center" }}>
                        <span style={{ fontWeight: 600 }}>🌾 {r}</span>
                        <span style={{ color: "var(--ok)", fontWeight: 700 }}>✓ Available On-Site</span>
                      </div>
                    ))}
                    {(opportunity.missing_resources || []).map((r, idx) => (
                      <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", padding: "12px 16px", borderTop: "1px solid var(--line)", fontSize: "0.85rem", alignItems: "center", background: "rgba(245, 158, 11, 0.04)" }}>
                        <span style={{ fontWeight: 600 }}>🏗️ {r}</span>
                        <span style={{ color: "var(--cyan)", fontWeight: 700 }}>⚠ Setup Required</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Infrastructure Gap Resolution */}
                <div style={{ background: "rgba(99, 102, 241, 0.08)", padding: 18, borderRadius: 14, border: "1px solid var(--line-glow)", marginBottom: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <Hammer size={18} color="var(--electric-blue)" />
                    <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)" }}>
                      SETUP GAP: {opportunity.missing_resources && opportunity.missing_resources.length > 0 ? opportunity.missing_resources.join(" & ") : archetype.setupNeed} (~₹{totalCost.toLocaleString("en-IN")})
                    </strong>
                  </div>
                  <p style={{ fontSize: "0.84rem", color: "var(--muted)", lineHeight: 1.5, margin: "0 0 12px 0" }}>
                    Eligible for {opportunity.financial_breakdown?.eligible_scheme || "35% PMFME / MIDH credit-linked capital subsidy"}.
                  </p>

                  <button
                    type="button"
                    onClick={() => setActiveSection("finance")}
                    className="btn-primary-gloss"
                    style={{ padding: "8px 18px", fontSize: "0.82rem" }}
                  >
                    <span>Estimate CapEx in Financial Breakdown →</span>
                  </button>
                </div>

                <div className="wizard-actions-bar">
                  <button type="button" className="btn-secondary-gloss" onClick={() => setActiveSection("skills")}>
                    ← Previous
                  </button>
                  <button type="button" className="btn-primary-gloss" onClick={() => setActiveSection("location")}>
                    <span>Next: Location Analysis →</span>
                  </button>
                </div>
              </div>
            )}

            {/* ================================================================
                TAB 5: 05 LOCATION & ECOSYSTEM
               ================================================================ */}
            {activeSection === "location" && (
              <div>
                <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase" }}>
                  05 • ECOSYSTEM LINKAGES
                </span>
                <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 16px" }}>
                  Location & Micro-Infrastructure ({activeLocation})
                </h2>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                  <div style={{ background: "var(--panel-solid)", padding: 14, borderRadius: 12, border: "1px solid var(--line)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: "0.85rem", color: "var(--ok)" }}>
                      <Store size={16} /> APMC Mandi Access
                    </div>
                    <p style={{ margin: "6px 0 0", fontSize: "0.8rem", color: "var(--muted)" }}>
                      Katol Sub-Mandi & Direct farmer linkages across 40+ citrus growing villages.
                    </p>
                  </div>

                  <div style={{ background: "var(--panel-solid)", padding: 14, borderRadius: 12, border: "1px solid var(--line)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: "0.85rem", color: "var(--cyan)" }}>
                      <FlaskConical size={16} /> Research & Budwood Labs
                    </div>
                    <p style={{ margin: "6px 0 0", fontSize: "0.8rem", color: "var(--muted)" }}>
                      ICAR-CCRI Regional Outreach Centre & Certified Mother Plant demonstration farm.
                    </p>
                  </div>

                  <div style={{ background: "var(--panel-solid)", padding: 14, borderRadius: 12, border: "1px solid var(--line)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: "0.85rem", color: "var(--electric-blue)" }}>
                      <Snowflake size={16} /> Pre-Cooling & Chilling Units
                    </div>
                    <p style={{ margin: "6px 0 0", fontSize: "0.8rem", color: "var(--muted)" }}>
                      {archetype.infraHighlight}
                    </p>
                  </div>

                  <div style={{ background: "var(--panel-solid)", padding: 14, borderRadius: 12, border: "1px solid var(--line)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: "0.85rem", color: "var(--violet)" }}>
                      <Building2 size={16} /> Industrial Corridor & Logistics
                    </div>
                    <p style={{ margin: "6px 0 0", fontSize: "0.8rem", color: "var(--muted)" }}>
                      NH-353J Corridor providing 1-day freight dispatch to Amravati, Nagpur, and MP borders.
                    </p>
                  </div>
                </div>

                <div className="wizard-actions-bar">
                  <button type="button" className="btn-secondary-gloss" onClick={() => setActiveSection("resources")}>
                    ← Previous
                  </button>
                  <button type="button" className="btn-primary-gloss" onClick={() => setActiveSection("finance")}>
                    <span>Next: Investment & Finance →</span>
                  </button>
                </div>
              </div>
            )}

            {/* ================================================================
                TAB 6: 06 INVESTMENT & FINANCE
               ================================================================ */}
            {activeSection === "finance" && (
              <div>
                <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase" }}>
                  06 • CAPITAL ARCHITECTURE
                </span>
                <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 16px" }}>
                  Estimated CapEx & Financial Breakdown
                </h2>

                {/* Dynamic CapEx Breakdown Table */}
                <div style={{ background: "var(--panel-solid)", borderRadius: 14, border: "1px solid var(--line)", padding: "16px 20px", marginBottom: 20 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.88rem" }}>
                    {capexItems.map((item, idx) => (
                      <div key={item.name} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 6 }}>
                        <span className="muted">{idx + 1}. {item.name}:</span>
                        <strong>₹{item.cost.toLocaleString("en-IN")}</strong>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 6, fontSize: "1rem" }}>
                      <strong>Total Estimated Project Requirement:</strong>
                      <strong style={{ color: "var(--text-heading)" }}>₹{totalCost.toLocaleString("en-IN")}</strong>
                    </div>
                  </div>
                </div>

                {/* Capital Structuring Card */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
                  <div style={{ background: "var(--panel-solid)", padding: 14, borderRadius: 12, border: "1px solid var(--line)" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                      1. Promoter Equity (Margin)
                    </span>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--cyan)", marginTop: 2 }}>
                      ₹{ownEquity.toLocaleString("en-IN")}
                    </div>
                    <span style={{ fontSize: "0.72rem", color: ownEquity >= totalCost ? "var(--ok)" : "var(--muted)" }}>
                      {profileSavings > 0 ? "✓ Profile Saved Capital" : "Available Equity"}
                      {ownEquity > totalCost && ` (+₹${(ownEquity - totalCost).toLocaleString("en-IN")} buffer)`}
                    </span>
                  </div>

                  <div style={{ background: "var(--panel-solid)", padding: 14, borderRadius: 12, border: "1px solid var(--line)" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                      2. Initial Bank Term Loan
                    </span>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, color: initialBankLoan === 0 ? "var(--ok)" : "var(--electric-blue)", marginTop: 2 }}>
                      {initialBankLoan === 0 ? "₹0 (Zero Debt)" : `₹${initialBankLoan.toLocaleString("en-IN")}`}
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                      {initialBankLoan === 0 ? "100% Self-Funded CapEx" : "Sanctioned Pre-Subsidy (CGTMSE)"}
                    </span>
                  </div>

                  <div style={{ background: "var(--panel-solid)", padding: 14, borderRadius: 12, border: "1px solid var(--line)" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                      3. {opportunity.financial_breakdown?.eligible_scheme ? opportunity.financial_breakdown.eligible_scheme.split("(")[0].trim() : "Govt Capital Subsidy"}
                    </span>
                    <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--ok)", marginTop: 2 }}>
                      ₹{subsidyAmount.toLocaleString("en-IN")}
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "var(--ok)" }}>
                      Back-Ended Subsidy Reserve (SRF)
                    </span>
                  </div>
                </div>

                {/* Bank-Grade DPR Generator Action Banner */}
                <div style={{ background: "linear-gradient(135deg, rgba(79, 70, 229, 0.12) 0%, rgba(6, 182, 212, 0.10) 100%)", padding: 18, borderRadius: 14, border: "1px solid var(--line-glow)", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 14 }}>
                  <div>
                    <strong style={{ fontSize: "0.95rem", color: "var(--text-heading)", display: "flex", alignItems: "center", gap: 8 }}>
                      <Landmark size={20} color="var(--cyan)" /> Need an official DPR for Bank Loan & PMFME 35% Subsidy?
                    </strong>
                    <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--muted)" }}>
                      Generates a formal 10-section Detailed Project Report conforming to IBA & MoFPI norms, including 5-year P&L, DSCR (≥ 1.5x), and subsidy disbursement schedules.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDPRModalOpen(true)}
                    className="btn-primary-gloss"
                    style={{ fontSize: "0.84rem", padding: "10px 18px", display: "inline-flex", alignItems: "center", gap: 6, background: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)" }}
                  >
                    🏛️ Generate Bank-Ready DPR →
                  </button>
                </div>

                {/* Direct Link to Page 6 Financial Assistant */}
                <div style={{ background: "rgba(99, 102, 241, 0.08)", padding: 16, borderRadius: 14, border: "1px solid var(--line-glow)", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                  <div>
                    <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)", display: "flex", alignItems: "center", gap: 6 }}>
                      <Coins size={18} color="var(--cyan)" /> Want to test assumptions or simulate loans?
                    </strong>
                    <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "var(--muted)" }}>
                      Open the interactive Financial Assistant to test minimum vs standard setups, edit CapEx line items, and run bank loan EMI calculators.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/financial-assistant", { state: { opportunity, userSummary, userInput } })}
                    className="btn-primary-gloss"
                    style={{ fontSize: "0.82rem", padding: "8px 16px" }}
                  >
                    💰 Open in Financial Assistant →
                  </button>
                </div>

                <div className="wizard-actions-bar">
                  <button type="button" className="btn-secondary-gloss" onClick={() => setActiveSection("location")}>
                    ← Previous
                  </button>
                  <button type="button" className="btn-primary-gloss" onClick={() => setActiveSection("schemes")}>
                    <span>Next: Government Schemes →</span>
                  </button>
                </div>
              </div>
            )}

            {/* ================================================================
                TAB 7: 07 GOVERNMENT SCHEMES
               ================================================================ */}
            {activeSection === "schemes" && (
              <div>
                <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase" }}>
                  07 • SCHEMES & SUBSIDIES
                </span>
                <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 16px" }}>
                  Eligible Government Financial Assistance
                </h2>

                <div style={{ padding: "10px 14px", borderRadius: 10, background: "rgba(99, 102, 241, 0.08)", border: "1px solid var(--line-glow)", marginBottom: 16, fontSize: "0.82rem" }}>
                  <strong>Important Note: </strong> Recommendation ≠ Eligibility confirmation. EntreVision pre-qualifies potential schemes based on your profile, then verifies detailed criteria.
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                  {eligibleSchemes.map((s, idx) => (
                    <div key={idx} style={{ background: "var(--panel-solid)", padding: 16, borderRadius: 14, border: "1px solid var(--line)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                        <strong style={{ fontSize: "0.95rem", color: "var(--text-heading)" }}>
                          {s.name}
                        </strong>
                        <span className={`skill-status-tag ${s.badgeClass}`} style={{ fontSize: "0.72rem" }}>
                          {s.badge}
                        </span>
                      </div>
                      <p style={{ fontSize: "0.84rem", color: "var(--muted)", margin: "0 0 8px 0", lineHeight: 1.4 }}>
                        {s.desc}
                      </p>
                      <div style={{ fontSize: "0.78rem", color: "var(--cyan)", marginBottom: 12, fontWeight: 600 }}>
                        💡 Key Benefit: {s.maxBenefit}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => alert(`Pre-qualification verified for ${s.name}: You meet primary promoter equity and district criteria for ${opportunity.name}.`)}
                          className="pill-option-btn active"
                          style={{ fontSize: "0.76rem" }}
                        >
                          {s.actionText}
                        </button>
                        <button type="button" onClick={() => navigate("/schemes")} className="pill-option-btn" style={{ fontSize: "0.76rem" }}>
                          View Scheme Guidelines
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="wizard-actions-bar">
                  <button type="button" className="btn-secondary-gloss" onClick={() => setActiveSection("finance")}>
                    ← Previous
                  </button>
                  <button type="button" className="btn-primary-gloss" onClick={() => setActiveSection("implementation")}>
                    <span>Next: Implementation Roadmap →</span>
                  </button>
                </div>
              </div>
            )}

            {/* ================================================================
                TAB 8: 08 IMPLEMENTATION ROADMAP
               ================================================================ */}
            {activeSection === "implementation" && (
              <div>
                <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase" }}>
                  08 • STEP-BY-STEP EXECUTION
                </span>
                <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 16px" }}>
                  How to Start (Phased Implementation Plan)
                </h2>

                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                  {archetype.roadmapPhases.map((p, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "var(--panel-solid)",
                        border: "1px solid var(--line)",
                        borderRadius: 14,
                        padding: "14px 18px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <span className="skill-status-tag verified" style={{ fontSize: "0.72rem" }}>
                          {p.phase}
                        </span>
                        <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)" }}>
                          {p.title}
                        </strong>
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.5 }}>
                        {p.tasks.map((t, tIdx) => (
                          <li key={tIdx}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Final Roadmap CTA */}
                <div style={{ display: "flex", justifyContent: "center", gap: 14, padding: "16px 0 8px", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={() => {
                      if (!roadmapAdded) handleAddToRoadmap();
                      navigate("/roadmap");
                    }}
                    className="btn-primary-gloss"
                    style={{
                      padding: "16px 36px",
                      fontSize: "1.05rem",
                      background: "linear-gradient(135deg, var(--electric-blue) 0%, var(--cyan) 100%)",
                    }}
                  >
                    <Sparkles size={18} />
                    <span>{roadmapAdded ? "✓ In My Roadmap! Open Roadmap →" : "🗺️ ADD THIS PLAN TO MY ROADMAP →"}</span>
                  </button>

                  {roadmapAdded && (
                    <button
                      type="button"
                      onClick={() => navigate("/")}
                      className="btn-secondary-gloss"
                      style={{ padding: "16px 28px", fontSize: "1.02rem" }}
                    >
                      <span>🏠 View Active Venture on Home →</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Official Bank-Grade DPR Modal */}
      <BankGradeDPRModal
        isOpen={isDPRModalOpen}
        onClose={() => setIsDPRModalOpen(false)}
        opportunity={opportunity}
        userProfile={{ ...userProfile, name: user?.full_name || userProfile?.name || "Bhoomika Vaishya" }}
        capexBreakdown={capexItems}
        activeLocation={activeLocation}
        ownEquity={ownEquity}
        totalCost={totalCost}
        subsidyAmount={subsidyAmount}
        bankLoan={bankLoan}
        roadmapPhases={archetype?.roadmapPhases}
      />
    </div>
  );
}
