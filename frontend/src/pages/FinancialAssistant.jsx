import React, { useState, useEffect, useMemo } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  CircleDollarSign,
  Calculator,
  PieChart,
  Sliders,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Building2,
  Landmark,
  ShieldCheck,
  Users,
  Layers,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Percent,
  Check,
  Calendar,
  Zap,
  Tag,
  ArrowUpRight,
  FileSpreadsheet,
  Download,
  Share2
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import BankGradeDPRModal from "../components/BankGradeDPRModal";

// ============================================================================
// 1. COMPREHENSIVE BUSINESS MODEL FINANCIAL DATABASE (NAGPUR CITRUS DSS)
// ============================================================================
const BUSINESS_MODELS = [
  {
    id: "citrus_nursery",
    name: "Disease-Free Certified Citrus Nursery",
    icon: "🍊",
    category: "Nursery & Propagation",
    tagline: "Certified high-health budwood & Rangpur lime rootstock propagation",
    defaultLocation: "Katol / Warud-Morshi Cluster",
    baseProjectCost: 480000,
    subsidyScheme: "PMFME 35% Credit-Linked Capital Subsidy",
    subsidyRate: 0.35,
    maxSubsidyLimit: 1000000,
    costCategories: {
      land_site: {
        title: "Land & Site Preparation",
        icon: "🌱",
        description: "Site clearance, boundary grading, and shade fencing for biosecurity.",
        items: [
          { name: "Existing Agri Land (1 Acre)", unitRate: "Owned by Founder / Leased", cost: 0, defaultAvailable: true, editable: true },
          { name: "Site Levelling, Pathway & Drainage Grading", unitRate: "Civil earthwork (1 Acre)", cost: 25000, defaultAvailable: false, editable: true },
          { name: "Biosecurity Perimeter Chain-link & Shade Fencing", unitRate: "450 Running Metres", cost: 35000, defaultAvailable: false, editable: true },
        ],
      },
      infrastructure: {
        title: "Infrastructure & Civil Structures",
        icon: "🏗️",
        description: "Polyhouse structures, micro-irrigation, and misting systems.",
        items: [
          { name: "UV-Stabilized 50% Shade-Net Polyhouse (1,000 sq. m)", unitRate: "₹180 / sq. m (GI Pipe Structure)", cost: 180000, defaultAvailable: false, editable: true },
          { name: "Micro-Sprinklers & Automated Drip Fertigation Unit", unitRate: "High-density nursery grid", cost: 65000, defaultAvailable: false, editable: true },
          { name: "Polyhouse Fogging / Misting Temperature Controller", unitRate: "RH & Temp auto-sensor", cost: 25000, defaultAvailable: false, editable: true },
        ],
      },
      equipment: {
        title: "Equipment & Technical Tools",
        icon: "⚙️",
        description: "Grafting kits, media blenders, and sprayers.",
        items: [
          { name: "Citrus Budding Knives & Grafting Shears (5 Master Kits)", unitRate: "Imported carbon-steel", cost: 15000, defaultAvailable: false, editable: true },
          { name: "Motorized Soil & Potting Media Blender Machine", unitRate: "2 HP Single-phase unit", cost: 35000, defaultAvailable: false, editable: true },
          { name: "CCRI-Approved Motorized Backpack Sprayer (2 Units)", unitRate: "Battery-cum-petrol operated", cost: 18000, defaultAvailable: false, editable: true },
          { name: "Nursery Handling Trolleys, Crates & Trays", unitRate: "50 Heavy-duty trays & 2 carts", cost: 12000, defaultAvailable: false, editable: true },
        ],
      },
      raw_materials: {
        title: "Raw Materials & Initial Stock",
        icon: "📦",
        description: "Certified rootstocks, scion budwood, soil media, and polybags.",
        items: [
          { name: "Rangpur Lime Certified Rootstock Seedlings (5,000 units)", unitRate: "₹12 / healthy seedling", cost: 60000, defaultAvailable: false, editable: true },
          { name: "ICAR-CCRI Certified Nagpur Mandarin Mother Budsticks", unitRate: "Virus-free certified budwood", cost: 25000, defaultAvailable: false, editable: true },
          { name: "Sterilized Potting Media (Soil + Vermicompost + Perlite)", unitRate: "12 Tonnes blended media", cost: 30000, defaultAvailable: false, editable: true },
          { name: "UV Treated Poly-Grow Bags (10,000 bags)", unitRate: "₹1.00 / bag (250 gauge)", cost: 10000, defaultAvailable: false, editable: true },
        ],
      },
      compliance: {
        title: "Licenses, Certification & Setup",
        icon: "📋",
        description: "State nursery accreditation, GST, Udyam MSME, and testing.",
        items: [
          { name: "Maharashtra State Nursery Licensing & Inspection Fee", unitRate: "Dept of Agriculture registration", cost: 12000, defaultAvailable: false, editable: true },
          { name: "ICAR-CCRI Technical Quality Accreditation Audit", unitRate: "Field audit & indexing assay", cost: 8000, defaultAvailable: false, editable: true },
          { name: "Udyam MSME, GST Registration & Bank Project DPR", unitRate: "Chartered filing fee", cost: 5000, defaultAvailable: false, editable: true },
          { name: "Branded QR-Code Identification Tags & Weatherproof Care Labels", unitRate: "10,000 RFID/QR tags", cost: 5000, defaultAvailable: false, editable: true },
        ],
      },
      working_capital: {
        title: "Working Capital Reserve (3 Months)",
        icon: "👷",
        description: "Wages, electricity, bio-nutrients, and operational buffer.",
        items: [
          { name: "2 Skilled Grafters & Nursery Workers (3 Months)", unitRate: "₹12,000/mo per person", cost: 72000, defaultAvailable: false, editable: true },
          { name: "Water Pumping, Electricity & Farm Utilities", unitRate: "₹6,000/month", cost: 18000, defaultAvailable: false, editable: true },
          { name: "Bio-Fungicides, Micronutrients & Unforeseen Contingency", unitRate: "Emergency buffer", cost: 15000, defaultAvailable: false, editable: true },
        ],
      },
    },
    scenarios: {
      minimum: {
        name: "Minimum Setup (Pilot / Micro)",
        tag: "Low Capital Entry",
        investment: 210000,
        ownEquity: 70000,
        subsidy: 73500,
        equipment: "Manual Tools & Basic Shade Net",
        capacity: "2,500 Saplings / Batch",
        workspace: "0.25 Acre (Farm Corner)",
        workers: "1 Operator + Founder",
        monthlyOpex: 18000,
        monthlyRevenue: 45000,
        netMargin: "38%",
        breakevenMonths: 6,
        description: "Ideal for bootstrap founders starting on existing farmland with zero debt pressure.",
      },
      standard: {
        name: "Standard Setup (Commercial)",
        tag: "Recommended Sweet Spot",
        investment: 480000,
        ownEquity: 150000,
        subsidy: 168000,
        equipment: "GI Polyhouse + Drip & Misting Grid",
        capacity: "10,000 Saplings / Batch",
        workspace: "1.0 Acre Shade-Net Facility",
        workers: "3 Staff (2 Grafters + 1 Caretaker)",
        monthlyOpex: 35000,
        monthlyRevenue: 110000,
        netMargin: "45%",
        breakevenMonths: 8,
        description: "Fully eligible for 35% PMFME grant; high-demand supply contract readiness with farmer FPOs.",
      },
      expanded: {
        name: "Expanded Setup (High-Tech Cluster)",
        tag: "Maximum Scale & Reach",
        investment: 1250000,
        ownEquity: 350000,
        subsidy: 437500,
        equipment: "Automated Climate Chamber + Mother Block",
        capacity: "35,000 Saplings / Batch",
        workspace: "2.5 Acres Hi-Tech Compound",
        workers: "6 Full-time Technical Staff",
        monthlyOpex: 85000,
        monthlyRevenue: 290000,
        netMargin: "52%",
        breakevenMonths: 11,
        description: "Institutional mother-nursery supplying interstate citrus orchards across Maharashtra & MP.",
      },
    },
  },
  {
    id: "juice_processing",
    name: "Cold-Pressed Citrus Juice & RTS Beverages",
    icon: "🧃",
    category: "Agro-Processing & Value Addition",
    tagline: "Automated juice extraction, pasteurization, and aseptic packaging",
    defaultLocation: "Katol / Kalmeshwar MIDC",
    baseProjectCost: 1280000,
    subsidyScheme: "PMFME ODOP 35% Grant (MoFPI)",
    subsidyRate: 0.35,
    maxSubsidyLimit: 1000000,
    costCategories: {
      land_site: {
        title: "Factory Shed & Industrial Premises",
        icon: "🌱",
        description: "Industrial shed lease or construction with food-grade epoxy floors.",
        items: [
          { name: "Industrial Shed Lease Deposit / Setup (1,200 sq.ft)", unitRate: "Commercial shed security + 3 mos", cost: 80000, defaultAvailable: false, editable: true },
          { name: "Epoxy Hygienic Flooring & Drainage Channels", unitRate: "FSSAI compliant wash-down floor", cost: 60000, defaultAvailable: false, editable: true },
        ],
      },
      infrastructure: {
        title: "Cold Chain & Utilities",
        icon: "🏗️",
        description: "Walk-in cold room and dedicated 3-phase industrial power sanction.",
        items: [
          { name: "Modular Walk-In Cold Room (5 MT, 2°C–4°C)", unitRate: "PUF panel with Emerson compressor", cost: 280000, defaultAvailable: false, editable: true },
          { name: "3-Phase Commercial Power Sanction & DG Set Backup", unitRate: "15 kW load + 10 kVA generator", cost: 110000, defaultAvailable: false, editable: true },
          { name: "RO Water Purification & Softening Plant (1,000 LPH)", unitRate: "Industrial SS-304 RO system", cost: 75000, defaultAvailable: false, editable: true },
        ],
      },
      equipment: {
        title: "Processing Machinery & Packaging Line",
        icon: "⚙️",
        description: "Fruit washer, continuous extractor, pasteurizer, and bottle filler.",
        items: [
          { name: "Citrus Roller Washer & Sanitization Sorting Conveyor", unitRate: "Food grade SS-304 conveyor", cost: 85000, defaultAvailable: false, editable: true },
          { name: "Industrial Continuous Citrus Extractor & De-Oiler", unitRate: "500 kg/hr fruit crushing unit", cost: 240000, defaultAvailable: false, editable: true },
          { name: "Inline Tubular Flash Pasteurizer & Homogenizer", unitRate: "300 LPH electric heat exchanger", cost: 145000, defaultAvailable: false, editable: true },
          { name: "Semi-Automatic 4-Head Bottling, Capping & Labeler", unitRate: "20-30 BPM liquid filling machine", cost: 95000, defaultAvailable: false, editable: true },
        ],
      },
      raw_materials: {
        title: "Raw Citrus & Packaging Buffer",
        icon: "📦",
        description: "Farm-gate orange procurement, bottles, tamper-evident seals.",
        items: [
          { name: "Direct Mandi/Farm Gate Orange Procurement (15 Tonnes)", unitRate: "₹18 / kg seasonal purchase", cost: 270000, defaultAvailable: false, editable: true },
          { name: "Food-Grade Recyclable PET/Glass Bottles & Caps (15,000 units)", unitRate: "₹4.50 / bottle + label", cost: 67500, defaultAvailable: false, editable: true },
          { name: "Natural Preservatives, Pectin & Bio-Sanitizers", unitRate: "Initial 2-month consumables", cost: 18000, defaultAvailable: false, editable: true },
        ],
      },
      compliance: {
        title: "Food Safety Licenses & Brand Setup",
        icon: "📋",
        description: "FSSAI State Manufacturing, Lab Nutritional Testing, GST.",
        items: [
          { name: "FSSAI State Manufacturing License & NABL Lab Testing", unitRate: "Nutritional assay & shelf-life test", cost: 28000, defaultAvailable: false, editable: true },
          { name: "Trademark Registration, Barcodes & Packaging Artwork", unitRate: "GS1 Barcodes + IP filing", cost: 15000, defaultAvailable: false, editable: true },
          { name: "Project DPR & Financial Audit Certification", unitRate: "Bank appraisal dossier", cost: 12000, defaultAvailable: false, editable: true },
        ],
      },
      working_capital: {
        title: "Working Capital Reserve (3 Months)",
        icon: "👷",
        description: "Salaries for machine operators, electric bills, and distribution buffer.",
        items: [
          { name: "1 Food Technologist + 2 Operators + 2 Helpers (3 Mos)", unitRate: "₹45,000 / month payroll", cost: 135000, defaultAvailable: false, editable: true },
          { name: "Factory Power, Fuel & Freight Transport Buffer", unitRate: "₹25,000 / month", cost: 75000, defaultAvailable: false, editable: true },
        ],
      },
    },
    scenarios: {
      minimum: {
        name: "Minimum Setup (Batch Juicing Unit)",
        tag: "Semi-Manual Boutique",
        investment: 450000,
        ownEquity: 150000,
        subsidy: 157500,
        equipment: "Semi-Auto Juicer + Manual Capper + Chiller",
        capacity: "250 Litres / Day",
        workspace: "400 sq.ft Commercial Kitchen",
        workers: "2 Staff + Founder",
        monthlyOpex: 42000,
        monthlyRevenue: 120000,
        netMargin: "32%",
        breakevenMonths: 7,
        description: "Supplies local cafes, fitness centres, and weekend farmers markets in Nagpur & Wardha.",
      },
      standard: {
        name: "Standard Setup (Automated Processing)",
        tag: "Commercial ODOP Unit",
        investment: 1280000,
        ownEquity: 350000,
        subsidy: 448000,
        equipment: "Continuous Line + 5 MT Cold Room + Pasteurizer",
        capacity: "1,200 Litres / Day",
        workspace: "1,200 sq.ft Industrial Shed",
        workers: "5 Staff (1 Technologist + 4 Operators)",
        monthlyOpex: 95000,
        monthlyRevenue: 340000,
        netMargin: "42%",
        breakevenMonths: 9,
        description: "High-margin retail distribution across Vidarbha supermarket chains & direct-to-consumer online.",
      },
      expanded: {
        name: "Expanded Setup (Export & Multi-Product)",
        tag: "Industrial Scale",
        investment: 2850000,
        ownEquity: 800000,
        subsidy: 997500,
        equipment: "Fully Automated Aseptic Tetra/Can Line",
        capacity: "4,000 Litres / Day",
        workspace: "3,500 sq.ft MIDC Plot",
        workers: "10 Full-time Staff",
        monthlyOpex: 210000,
        monthlyRevenue: 850000,
        netMargin: "48%",
        breakevenMonths: 12,
        description: "Enterprise processing unit supplying institutional beverage companies and national retail networks.",
      },
    },
  },
  {
    id: "essential_oil",
    name: "Citrus Peel Essential Oil & Pectin Extraction",
    icon: "🧪",
    category: "Waste-to-Wealth & Nutraceuticals",
    tagline: "Value extraction of d-limonene, cold-pressed peel oil, and dry pectin",
    defaultLocation: "Morshi / Katol Agro Park",
    baseProjectCost: 860000,
    subsidyScheme: "PMFME 35% + PMEGP 25% Rural Subsidy",
    subsidyRate: 0.35,
    maxSubsidyLimit: 1000000,
    costCategories: {
      land_site: {
        title: "Site & Extraction Space",
        icon: "🌱",
        description: "Well-ventilated extraction plant shed with effluent drainage.",
        items: [
          { name: "Ventilated Shed & Boiler Platform (800 sq.ft)", unitRate: "Industrial masonry shed", cost: 95000, defaultAvailable: false, editable: true },
          { name: "Effluent Neutralization & Zero-Discharge Pit", unitRate: "Environmental safety tank", cost: 35000, defaultAvailable: false, editable: true },
        ],
      },
      infrastructure: {
        title: "Steam & Power Setup",
        icon: "🏗️",
        description: "Biomass steam boiler and condensing water circulation.",
        items: [
          { name: "Biomass/Electric Mini Steam Boiler (100 kg/hr)", unitRate: "IBR compliant low-pressure boiler", cost: 160000, defaultAvailable: false, editable: true },
          { name: "Cooling Tower & Closed-Loop Chilled Water Line", unitRate: "5 TR chiller unit", cost: 65000, defaultAvailable: false, editable: true },
        ],
      },
      equipment: {
        title: "Distillation & Extraction Machinery",
        icon: "⚙️",
        description: "SS-316 distillation column, centrifuge separator, and drying tray.",
        items: [
          { name: "SS-316 Hydro-Steam Distillation Plant (500 Kg/batch)", unitRate: "Pharma-grade stainless vessel", cost: 230000, defaultAvailable: false, editable: true },
          { name: "High-Speed Essential Oil Centrifuge Separator", unitRate: "3,000 RPM disc bowl separator", cost: 85000, defaultAvailable: false, editable: true },
          { name: "Peel Shredder & Solar-Assisted Tray Dryer", unitRate: "Continuous fruit peel shredder", cost: 45000, defaultAvailable: false, editable: true },
        ],
      },
      raw_materials: {
        title: "Peel Feedstock & Packaging",
        icon: "📦",
        description: "Procurement of citrus peels from juice vendors, amber glass vials.",
        items: [
          { name: "Wet Citrus Peels from Juice Units (30 Tonnes)", unitRate: "₹3 / kg raw waste collection", cost: 90000, defaultAvailable: false, editable: true },
          { name: "Amber Glass Dropper Bottles & Aluminum Canisters", unitRate: "UV protected aroma packaging", cost: 32000, defaultAvailable: false, editable: true },
        ],
      },
      compliance: {
        title: "Quality & Regulatory Setup",
        icon: "📋",
        description: "GC-MS Purity Certification, Cosmetic/Pharma compliance.",
        items: [
          { name: "GC-MS Purity Testing & Certificate of Analysis (CoA)", unitRate: "NABL certified essential oil assay", cost: 18000, defaultAvailable: false, editable: true },
          { name: "MSME Udyam, GST & Pollution Control Consent", unitRate: "State PCB green category", cost: 15000, defaultAvailable: false, editable: true },
        ],
      },
      working_capital: {
        title: "Operating Working Capital (3 Mos)",
        icon: "👷",
        description: "Boiler biomass briquettes, operator wages, transport.",
        items: [
          { name: "1 Plant Operator + 2 Plant Helpers (3 Mos)", unitRate: "₹30,000/mo team payroll", cost: 90000, defaultAvailable: false, editable: true },
        ],
      },
    },
    scenarios: {
      minimum: {
        name: "Minimum Setup (Micro Steam Distillation)",
        tag: "Low Capital Entry",
        investment: 380000,
        ownEquity: 120000,
        subsidy: 133000,
        equipment: "150 Kg SS Still + Manual Filtration",
        capacity: "4 Litres Oil / Day",
        workspace: "400 sq.ft Shed",
        workers: "1 Operator + Founder",
        monthlyOpex: 28000,
        monthlyRevenue: 85000,
        netMargin: "44%",
        breakevenMonths: 6,
        description: "Extract pure therapeutic-grade aromatherapy oil for direct retail & boutique soap makers.",
      },
      standard: {
        name: "Standard Setup (Commercial Oil + Pectin)",
        tag: "Recommended Sweet Spot",
        investment: 860000,
        ownEquity: 250000,
        subsidy: 301000,
        equipment: "500 Kg Automated Plant + Centrifuge + Dryer",
        capacity: "15 Litres Oil + 100 Kg Pectin / Day",
        workspace: "1,000 sq.ft Agro Shed",
        workers: "3 Staff",
        monthlyOpex: 65000,
        monthlyRevenue: 240000,
        netMargin: "50%",
        breakevenMonths: 8,
        description: "B2B supply contracts with fragrance, confectionery, and cosmetic companies in Mumbai & Pune.",
      },
      expanded: {
        name: "Expanded Setup (Industrial Solvent Extraction)",
        tag: "Industrial Scale",
        investment: 2100000,
        ownEquity: 600000,
        subsidy: 735000,
        equipment: "Supercritical CO2 / Continuous Distillation Unit",
        capacity: "50 Litres Oil / Day",
        workspace: "2,500 sq.ft MIDC Facility",
        workers: "7 Staff",
        monthlyOpex: 160000,
        monthlyRevenue: 620000,
        netMargin: "55%",
        breakevenMonths: 10,
        description: "High-value export-grade d-limonene and pharmaceutical pectin for international buyers.",
      },
    },
  },
  {
    id: "sorting_grading",
    name: "Farm-Gate Sorting, Grading & Waxing Facility",
    icon: "📦",
    category: "Post-Harvest Infrastructure",
    tagline: "Mechanized 2-stage optical size grader, fungicidal wash, and food-grade shine waxing",
    defaultLocation: "Kalamna / Warud Mandi Node",
    baseProjectCost: 1650000,
    subsidyScheme: "Agriculture Infrastructure Fund (AIF) + MIDH Post-Harvest Grant",
    subsidyRate: 0.35,
    maxSubsidyLimit: 2500000,
    costCategories: {
      land_site: {
        title: "Logistics Yard & Covered Canopy",
        icon: "🌱",
        description: "Heavy truck turning bay, concrete loading dock, and covered canopy.",
        items: [
          { name: "Truck Loading Bay & Concrete Dock Yard (3,000 sq.ft)", unitRate: "Heavy truck vehicular ramp", cost: 180000, defaultAvailable: false, editable: true },
          { name: "Pre-Engineered Covered Shed Structure (2,000 sq.ft)", unitRate: "₹250/sq.ft PEB Shed", cost: 500000, defaultAvailable: false, editable: true },
        ],
      },
      infrastructure: {
        title: "Electrification & Water System",
        icon: "🏗️",
        description: "Continuous water filtration and 3-phase connection.",
        items: [
          { name: "High-Volume Fruit Wash Water Filtration & Recirculation", unitRate: "Sand & carbon dual filter", cost: 85000, defaultAvailable: false, editable: true },
          { name: "Dedicated 20 HP Commercial Electrical Transformer Sanction", unitRate: "MSEDCL industrial meter", cost: 125000, defaultAvailable: false, editable: true },
        ],
      },
      equipment: {
        title: "Grading & Waxing Line",
        icon: "⚙️",
        description: "Roller conveyor, fungicide applicator, hot-air drying tunnel, size sorter.",
        items: [
          { name: "Motorized Roller Conveyor & Pre-Washing Dip Tank", unitRate: "5 Tonne/hr continuous feed", cost: 140000, defaultAvailable: false, editable: true },
          { name: "Food-Grade Carnauba Wax Applicator & Hot Air Dryer", unitRate: "Automatic nozzle waxing line", cost: 260000, defaultAvailable: false, editable: true },
          { name: "4-Stage Weight / Diameter Mechanical Size Grader", unitRate: "Accurate citrus grading deck", cost: 190000, defaultAvailable: false, editable: true },
        ],
      },
      raw_materials: {
        title: "Consumables & Plastic Crates",
        icon: "📦",
        description: "Stackable harvest bins, carnauba wax drums, corrugated export cartons.",
        items: [
          { name: "Reusable Stackable Plastic Harvest Crates (500 units)", unitRate: "₹380 / heavy-duty crate", cost: 190000, defaultAvailable: false, editable: true },
          { name: "Food-Grade Carnauba Fruit Wax & Bio-Fungicide (3-Month Stock)", unitRate: "Approved export grade wax", cost: 45000, defaultAvailable: false, editable: true },
          { name: "Printed 10 kg / 20 kg 5-Ply Corrugated Citrus Boxes (2,000 units)", unitRate: "₹28 / export carton", cost: 56000, defaultAvailable: false, editable: true },
        ],
      },
      compliance: {
        title: "APMC / Mandi Trade Clearances",
        icon: "📋",
        description: "APMC trader license, AGMARK certification, GST.",
        items: [
          { name: "APMC Market Trader / Processor Clearance & AGMARK grading", unitRate: "Govt standard certificate", cost: 18000, defaultAvailable: false, editable: true },
          { name: "Weights & Measures Department Digital Scale Calibration", unitRate: "Legal metrology stamp", cost: 6000, defaultAvailable: false, editable: true },
        ],
      },
      working_capital: {
        title: "Seasonal Operating Reserve (3 Mos)",
        icon: "👷",
        description: "Grading team wages, electricity, and local freight fuel buffer.",
        items: [
          { name: "1 Supervisor + 4 Sorting Staff (Peak 3 Months)", unitRate: "₹45,000/mo staff cost", cost: 135000, defaultAvailable: false, editable: true },
        ],
      },
    },
    scenarios: {
      minimum: {
        name: "Minimum Setup (Manual Roller Table)",
        tag: "Mandi Service Point",
        investment: 520000,
        ownEquity: 160000,
        subsidy: 182000,
        equipment: "Manual Sorter + Sponge Waxing Table",
        capacity: "1.5 MT / Hour",
        workspace: "800 sq.ft Shed",
        workers: "3 Staff",
        monthlyOpex: 38000,
        monthlyRevenue: 130000,
        netMargin: "35%",
        breakevenMonths: 6,
        description: "Provides on-demand grading service to smallholder farmers right outside Katol mandi.",
      },
      standard: {
        name: "Standard Setup (Automated Washing & Waxing Line)",
        tag: "Commercial Hub",
        investment: 1650000,
        ownEquity: 450000,
        subsidy: 577500,
        equipment: "5 MT/hr Motorized Line + Hot Air Dryer",
        capacity: "5.0 MT / Hour",
        workspace: "2,000 sq.ft Yard",
        workers: "6 Staff",
        monthlyOpex: 92000,
        monthlyRevenue: 380000,
        netMargin: "45%",
        breakevenMonths: 8,
        description: "Prepares export-quality crates for North Indian mandis (Delhi Azadpur, Kolkata) with premium pricing.",
      },
      expanded: {
        name: "Expanded Setup (Optical AI Grader & Palletizer)",
        tag: "Corporate Packhouse",
        investment: 3800000,
        ownEquity: 1100000,
        subsidy: 1330000,
        equipment: "Computer-Vision Defect Sorter + Automatic Pallet Wrapper",
        capacity: "15 MT / Hour",
        workspace: "6,000 sq.ft Logistical Complex",
        workers: "12 Staff",
        monthlyOpex: 240000,
        monthlyRevenue: 980000,
        netMargin: "50%",
        breakevenMonths: 11,
        description: "Direct retail packing partner for national hypermarkets (Reliance Fresh, Blinkit, Zepto, BigBasket).",
      },
    },
  },
  {
    id: "cold_storage",
    name: "Micro Cold Storage & Ripening Unit (15–25 MT)",
    icon: "❄️",
    category: "Cold Chain Logistics",
    tagline: "Solar-assisted farm-gate pre-cooling & ethylene-controlled ripening rooms",
    defaultLocation: "Narkhed / Warud-Morshi Road",
    baseProjectCost: 1420000,
    subsidyScheme: "MIDH / NHB Cold Chain Capital Grant (35-50%) + MahaUrja Solar Subsidy",
    subsidyRate: 0.40,
    maxSubsidyLimit: 1500000,
    costCategories: {
      land_site: {
        title: "Insulated Foundation & Yard",
        icon: "🌱",
        description: "Reinforced concrete plinth with anti-thermal bridge isolation.",
        items: [
          { name: "Thermal Insulated RCC Plinth Foundation (800 sq.ft)", unitRate: "Civil engineering plinth", cost: 110000, defaultAvailable: false, editable: true },
        ],
      },
      infrastructure: {
        title: "Cold Room Chamber & Solar Power",
        icon: "🏗️",
        description: "100mm PUF modular panel enclosure and off-grid solar array.",
        items: [
          { name: "Modular 100mm High-Density PUF Enclosure (25 MT Chamber)", unitRate: "CFC-free thermal insulation panels", cost: 420000, defaultAvailable: false, editable: true },
          { name: "10 kVA Hybrid Solar PV System with Battery Bank Buffer", unitRate: "MahaUrja subsidized solar array", cost: 310000, defaultAvailable: false, editable: true },
        ],
      },
      equipment: {
        title: "Refrigeration Unit & Ethylene Generator",
        icon: "⚙️",
        description: "Copeland scroll condensing unit, evaporators, digital sensors.",
        items: [
          { name: "Heavy-Duty Low-Temp Condensing Unit & Evaporator Coil", unitRate: "Copeland 5 HP scroll refrigeration", cost: 290000, defaultAvailable: false, editable: true },
          { name: "Automated Ethylene Gas Generator & Degreening Sensor", unitRate: "Controlled ripening system", cost: 95000, defaultAvailable: false, editable: true },
          { name: "Digital Humidity & Temperature IoT Telemetry Logger", unitRate: "Cloud-connected mobile app monitoring", cost: 25000, defaultAvailable: false, editable: true },
        ],
      },
      raw_materials: {
        title: "Storage Accessories & Gas Cylinders",
        icon: "📦",
        description: "Heavy racking, ethylene concentrate, bio-cleansers.",
        items: [
          { name: "Galvanized Steel Storage Racking & Pallet System", unitRate: "3-tier storage racks", cost: 85000, defaultAvailable: false, editable: true },
          { name: "Ethylene Concentrate & Refrigerant Gas Top-Up Reserve", unitRate: "6-month chemical supplies", cost: 25000, defaultAvailable: false, editable: true },
        ],
      },
      compliance: {
        title: "Safety & Electrical Clearances",
        icon: "📋",
        description: "Electrical inspectorate approval, NHB technical audit.",
        items: [
          { name: "Electrical Inspectorate Clearance & Fire Safety NOC", unitRate: "State DISCOM safety approval", cost: 18000, defaultAvailable: false, editable: true },
          { name: "NHB National Horticulture Board Technical Inspection DPR", unitRate: "Empanelled architect audit", cost: 15000, defaultAvailable: false, editable: true },
        ],
      },
      working_capital: {
        title: "Utility & Operations Reserve (3 Mos)",
        icon: "👷",
        description: "Technician retainer, grid top-up bills, maintenance buffer.",
        items: [
          { name: "1 Plant Technician / Cold Chain Operator (3 Mos)", unitRate: "₹18,000/mo payroll", cost: 54000, defaultAvailable: false, editable: true },
        ],
      },
    },
    scenarios: {
      minimum: {
        name: "Minimum Setup (10 MT Pre-Cooling Chamber)",
        tag: "Micro Farm Unit",
        investment: 750000,
        ownEquity: 220000,
        subsidy: 300000,
        equipment: "10 MT PUF Unit + Single Condenser",
        capacity: "10 Metric Tonnes",
        workspace: "400 sq.ft Shed",
        workers: "1 Operator",
        monthlyOpex: 22000,
        monthlyRevenue: 75000,
        netMargin: "48%",
        breakevenMonths: 7,
        description: "Cuts post-harvest citrus rotting from 30% down to under 3% for nearby orchard owners.",
      },
      standard: {
        name: "Standard Setup (25 MT Solar Cold Room + Ripening)",
        tag: "Recommended Sweet Spot",
        investment: 1420000,
        ownEquity: 400000,
        subsidy: 568000,
        equipment: "25 MT Chamber + 10 kVA Solar + Ethylene Generator",
        capacity: "25 Metric Tonnes",
        workspace: "800 sq.ft Compound",
        workers: "2 Staff",
        monthlyOpex: 38000,
        monthlyRevenue: 165000,
        netMargin: "55%",
        breakevenMonths: 9,
        description: "High recurring revenue through degreening and cold-holding fees during off-season price surges.",
      },
      expanded: {
        name: "Expanded Setup (100 MT Commercial Multi-Chamber)",
        tag: "Cluster Facility",
        investment: 3600000,
        ownEquity: 1000000,
        subsidy: 1440000,
        equipment: "Multi-Chamber CA (Controlled Atmosphere) System",
        capacity: "100 Metric Tonnes",
        workspace: "2,500 sq.ft Commercial Node",
        workers: "4 Full-time Staff",
        monthlyOpex: 95000,
        monthlyRevenue: 420000,
        netMargin: "60%",
        breakevenMonths: 11,
        description: "Integrated cold-storage hub serving entire tehsils with multi-commodity preservation capabilities.",
      },
    },
  },
  {
    id: "marmalade_candied",
    name: "Citrus Marmalade, Jam & Peel Candy Processing",
    icon: "🍯",
    category: "Food Processing & Beverages",
    tagline: "Artisan fruit preserves, citrus marmalade, and candied peel confectionery",
    defaultLocation: "Saoner / Katol Processing Node",
    baseProjectCost: 520000,
    subsidyScheme: "PMFME 35% Credit-Linked Capital Subsidy",
    subsidyRate: 0.35,
    maxSubsidyLimit: 1000000,
    costCategories: {
      land_site: {
        title: "Workspace & Food Cleanroom Prep",
        icon: "🌱",
        description: "Hygiene flooring, stainless wash basins, and insect netting.",
        items: [
          { name: "Existing Commercial Shed / Kitchen Setup", unitRate: "Owned by Founder / Leased", cost: 0, defaultAvailable: true, editable: true },
          { name: "Food-Grade Washable Wall & Floor Epoxy Work", unitRate: "500 sq.ft processing floor", cost: 25000, defaultAvailable: false, editable: true },
          { name: "Sanitary Drainage, Exhaust & Air Curtain", unitRate: "Dual industrial exhaust", cost: 20000, defaultAvailable: false, editable: true },
        ],
      },
      infrastructure: {
        title: "Civil & Utility Structures",
        icon: "🏗️",
        description: "LPG manifold, commercial water RO, and packaging racks.",
        items: [
          { name: "Commercial 250 LPH RO Drinking Water Filtration", unitRate: "Multi-stage with UV/TDS control", cost: 45000, defaultAvailable: false, editable: true },
          { name: "Industrial LPG 4-Burner Manifold Line", unitRate: "High-pressure commercial pipes", cost: 28000, defaultAvailable: false, editable: true },
          { name: "Stainless Steel 304 Storage Racks & Clean Curing Tables", unitRate: "4 Heavy-duty tables & racks", cost: 38000, defaultAvailable: false, editable: true },
        ],
      },
      equipment: {
        title: "Processing & Packaging Equipment",
        icon: "⚙️",
        description: "Steam cooking kettles, candy slicers, and vacuum sealers.",
        items: [
          { name: "SS-304 Steam-Jacketed Tilting Cooking Kettle (50L)", unitRate: "LPG/Electric heating with agitator", cost: 110000, defaultAvailable: false, editable: true },
          { name: "Motorized Fruit Pulper & Peel Dicing Machine (2 HP)", unitRate: "Food-grade stainless rotary cutter", cost: 65000, defaultAvailable: false, editable: true },
          { name: "Digital Brix Refractometer & Food Testing Kit", unitRate: "0-90% Brix range & pH sensor", cost: 18000, defaultAvailable: false, editable: true },
          { name: "Semi-Automatic Glass Jar Lug-Capper & Induction Sealer", unitRate: "Benchtop bottle sealer", cost: 35000, defaultAvailable: false, editable: true },
        ],
      },
      raw_materials: {
        title: "Raw Materials & Packaging Inventory",
        icon: "📦",
        description: "Fresh oranges, fruit pectin, sugar, and branded jars.",
        items: [
          { name: "Direct Mandi Citrus Fruit Stock (3 Tonnes)", unitRate: "₹22/kg orchard procurement", cost: 66000, defaultAvailable: false, editable: true },
          { name: "Food-Grade Pectin, Citric Acid & Refined Cane Sugar", unitRate: "First 60-day batch additives", cost: 30000, defaultAvailable: false, editable: true },
          { name: "Hexagonal Glass Jars (250g) with Gold Metal Lids (3,000 units)", unitRate: "₹9.50 / jar with seal", cost: 28500, defaultAvailable: false, editable: true },
        ],
      },
      compliance: {
        title: "Licenses & Brand Identity",
        icon: "📋",
        description: "FSSAI state license, nutrition laboratory test, and Udyam.",
        items: [
          { name: "FSSAI State Manufacturing License & Water Test", unitRate: "Statutory filing fee", cost: 12000, defaultAvailable: false, editable: true },
          { name: "NABL-Accredited Nutritional Testing & Shelf-Life Assay", unitRate: "Full 14-parameter assay", cost: 15000, defaultAvailable: false, editable: true },
          { name: "Udyam MSME, GST Registration & Barcode Allotment", unitRate: "GS1 India barcode 100 GTINs", cost: 14000, defaultAvailable: false, editable: true },
        ],
      },
      working_capital: {
        title: "Working Capital Reserve (3 Months)",
        icon: "👷",
        description: "Master food technologist, packaging labor, and utility bills.",
        items: [
          { name: "1 Master Food Processor & 2 Packing Assistants (3 Mos)", unitRate: "Monthly combined wages", cost: 72000, defaultAvailable: false, editable: true },
          { name: "LPG Commercial Cylinders & Electricity Bills", unitRate: "₹8,000/month", cost: 24000, defaultAvailable: false, editable: true },
        ],
      },
    },
    scenarios: {
      minimum: {
        name: "Artisan Kitchen Setup (50 kg/day)",
        tag: "Low Capital Pilot",
        investment: 350000,
        ownEquity: 105000,
        subsidy: 122500,
        equipment: "Manual Dicer + 30L Cooking Kettle",
        capacity: "50 kg/day",
        workspace: "300 sq.ft Home/Unit",
        workers: "2 Workers",
        monthlyOpex: 24000,
        monthlyRevenue: 85000,
        netMargin: "45%",
        breakevenMonths: 6,
        description: "Focuses on premium D2C artisanal citrus marmalades and gift packs.",
      },
      standard: {
        name: "Semi-Automated Unit (200 kg/day)",
        tag: "Commercial Sweet Spot",
        investment: 520000,
        ownEquity: 156000,
        subsidy: 182000,
        equipment: "50L Steam Kettle + Lug Capper + Dicer",
        capacity: "200 kg/day",
        workspace: "600 sq.ft Unit",
        workers: "3 Staff",
        monthlyOpex: 48000,
        monthlyRevenue: 195000,
        netMargin: "50%",
        breakevenMonths: 8,
        description: "Distributes through retail bakeries, supermarkets, and national e-commerce.",
      },
      expanded: {
        name: "Industrial Preserve Line (1 MT/day)",
        tag: "Cluster Processing Plant",
        investment: 1450000,
        ownEquity: 435000,
        subsidy: 507500,
        equipment: "Continuous Vacuum Cooker + Automatic Jar Line",
        capacity: "1,000 kg/day",
        workspace: "2,000 sq.ft Shed",
        workers: "6 Staff",
        monthlyOpex: 120000,
        monthlyRevenue: 520000,
        netMargin: "54%",
        breakevenMonths: 10,
        description: "Institutional contract manufacturing for airline catering and FMCG brands.",
      },
    },
  },
  {
    id: "cattle_feed_pellet",
    name: "Citrus Waste Cattle Feed & Silage Pelleting",
    icon: "🐄",
    category: "By-Products & Bio-Value",
    tagline: "Valorization of citrus bagasse and wet peels into nutrient-dense dairy cattle feed pellets",
    defaultLocation: "Kalmeshwar / Hingna MIDC",
    baseProjectCost: 680000,
    subsidyScheme: "PMFME 35% Credit-Linked Capital Subsidy",
    subsidyRate: 0.35,
    maxSubsidyLimit: 1000000,
    costCategories: {
      land_site: {
        title: "Site Footprint & Raw Waste Yard",
        icon: "🌱",
        description: "Covered unloading yard and concrete pad for bagasse aeration.",
        items: [
          { name: "Agri Land / Rural Shed Compound (0.5 Acre)", unitRate: "Owned / Long Lease", cost: 0, defaultAvailable: true, editable: true },
          { name: "Concrete Apron for Wet Pulp Unloading", unitRate: "Heavy civil floor", cost: 35000, defaultAvailable: false, editable: true },
          { name: "Perimeter Drainage & Effluent Collection Pit", unitRate: "Environmental compliance", cost: 25000, defaultAvailable: false, editable: true },
        ],
      },
      infrastructure: {
        title: "Shed & Power Substation",
        icon: "🏗️",
        description: "Semi-open industrial shed with 3-phase 15 HP industrial wiring.",
        items: [
          { name: "Galvanized Tin Roof Shed (1,200 sq.ft)", unitRate: "Pre-engineered structure", cost: 160000, defaultAvailable: false, editable: true },
          { name: "Industrial 3-Phase 15 HP Electric Connection & Switchgear", unitRate: "MSEDCL industrial meter", cost: 65000, defaultAvailable: false, editable: true },
        ],
      },
      equipment: {
        title: "Milling, Drying & Pelleting Machinery",
        icon: "⚙️",
        description: "Heavy-duty wet hammer mill, flat-die pelletizer, and bagger.",
        items: [
          { name: "Heavy-Duty Citrus Bagasse Shredder & Hammer Mill (5 HP)", unitRate: "High-torque stainless blades", cost: 85000, defaultAvailable: false, editable: true },
          { name: "Rotary Drum Biomass Pellet Press (7.5 HP)", unitRate: "200 kg/hr ring-die pellet mill", cost: 180000, defaultAvailable: false, editable: true },
          { name: "Hot-Air Counterflow Pellet Cooler & Vibrating Screener", unitRate: "Rapid moisture removal", cost: 45000, defaultAvailable: false, editable: true },
          { name: "Digital Bag Stitcher & Electronic Platform Scale", unitRate: "50kg sack packaging line", cost: 22000, defaultAvailable: false, editable: true },
        ],
      },
      raw_materials: {
        title: "Raw Material & Binder Inventory",
        icon: "📦",
        description: "Wet peel waste, sugarcane molasses, mineral premix, and sacks.",
        items: [
          { name: "Wet Citrus Peel Procurement (50 MT from juice units)", unitRate: "Nominal collection transport fee", cost: 35000, defaultAvailable: false, editable: true },
          { name: "Cattle Mineral Mixture & Sugarcane Molasses Binder", unitRate: "Nutritional feed additive", cost: 25000, defaultAvailable: false, editable: true },
          { name: "Heavy-Duty HDPE Woven Sacks 50kg (2,000 sacks)", unitRate: "₹18/sack branded", cost: 36000, defaultAvailable: false, editable: true },
        ],
      },
      compliance: {
        title: "Statutory Approvals & Feed Analysis",
        icon: "📋",
        description: "Pollution Control Board consent, BIS feed testing, and Udyam.",
        items: [
          { name: "State Pollution Control Board (MPCB) Green Category Consent", unitRate: "Consent to Establish & Operate", cost: 15000, defaultAvailable: false, editable: true },
          { name: "BIS Nutritional Analysis (Crude Protein, Fiber, TDN Assay)", unitRate: "Veterinary college laboratory assay", cost: 12000, defaultAvailable: false, editable: true },
          { name: "Udyam MSME, GST & Local Gram Panchayat Trade NOC", unitRate: "Statutory paperwork", cost: 8000, defaultAvailable: false, editable: true },
        ],
      },
      working_capital: {
        title: "Working Capital Reserve (3 Months)",
        icon: "👷",
        description: "Mill operators, truck diesel, and power bill reserve.",
        items: [
          { name: "2 Machine Operators (3 Months Payroll)", unitRate: "₹14,000/mo per operator", cost: 84000, defaultAvailable: false, editable: true },
          { name: "Industrial Electricity & Raw Waste Transport Fuel", unitRate: "₹15,000/month", cost: 45000, defaultAvailable: false, editable: true },
        ],
      },
    },
    scenarios: {
      minimum: {
        name: "Micro Silage & Pellet Unit (500 kg/day)",
        tag: "Low CapEx Entry",
        investment: 420000,
        ownEquity: 126000,
        subsidy: 147000,
        equipment: "Small Hammer Mill + 3 HP Pelletizer",
        capacity: "500 kg/day",
        workspace: "600 sq.ft Shed",
        workers: "2 Workers",
        monthlyOpex: 32000,
        monthlyRevenue: 110000,
        netMargin: "42%",
        breakevenMonths: 7,
        description: "Supplies local dairy cooperatives and buffalo farms in the Katol tehsil.",
      },
      standard: {
        name: "Commercial Agro-Pellet Plant (2 MT/day)",
        tag: "Sweet Spot",
        investment: 680000,
        ownEquity: 204000,
        subsidy: 238000,
        equipment: "Hammer Mill + 7.5 HP Pellet Mill + Cooler",
        capacity: "2 Metric Tonnes / day",
        workspace: "1,200 sq.ft Shed",
        workers: "3 Staff",
        monthlyOpex: 65000,
        monthlyRevenue: 240000,
        netMargin: "48%",
        breakevenMonths: 8,
        description: "High recurring B2B demand with annual supply contracts to dairy clusters.",
      },
      expanded: {
        name: "Industrial Feed Complex (8 MT/day)",
        tag: "Commercial Plant",
        investment: 1850000,
        ownEquity: 555000,
        subsidy: 647500,
        equipment: "Full Automated Pelleting Line with Silo",
        capacity: "8 Metric Tonnes / day",
        workspace: "4,000 sq.ft Compound",
        workers: "6 Staff",
        monthlyOpex: 160000,
        monthlyRevenue: 680000,
        netMargin: "52%",
        breakevenMonths: 11,
        description: "Aggregates waste from 50 juice vendors and supplies regional cattle feed distributors.",
      },
    },
  },
  {
    id: "diagnostic_clinic",
    name: "Mobile Soil & Plant Health Diagnostic Clinic",
    icon: "🔬",
    category: "Agritech & Testing Services",
    tagline: "Doorstep rapid soil nutrient assay, leaf tissue analysis, and citrus disease diagnostic van",
    defaultLocation: "Katol / Narkhed Rural Belt",
    baseProjectCost: 740000,
    subsidyScheme: "Agriculture Infrastructure Fund (AIF) / PMFME",
    subsidyRate: 0.35,
    maxSubsidyLimit: 1000000,
    costCategories: {
      land_site: {
        title: "Base Office & Parking Station",
        icon: "🌱",
        description: "Home base parking and reagent storage desk.",
        items: [
          { name: "Existing Home Office / Village Workspace", unitRate: "Founder owned", cost: 0, defaultAvailable: true, editable: true },
          { name: "Secure Chemical Reagent Storage Cabinet & Workstation", unitRate: "Fire-rated lab cabinet", cost: 18000, defaultAvailable: false, editable: true },
        ],
      },
      infrastructure: {
        title: "Vehicle Outfitting & Solar Inverter",
        icon: "🏗️",
        description: "Utility van modification with vibration-damped test benches and solar power.",
        items: [
          { name: "Utility Vehicle Custom Shelving & Damped Shock Mounts", unitRate: "Anti-vibration aluminum racks", cost: 65000, defaultAvailable: false, editable: true },
          { name: "1.5 kVA Pure Sine Wave Solar Inverter + Lithium Battery", unitRate: "Continuous mobile power", cost: 75000, defaultAvailable: false, editable: true },
        ],
      },
      equipment: {
        title: "Diagnostic Equipment & Precision Sensors",
        icon: "⚙️",
        description: "Soil spectrophotometer, EC/pH meters, and leaf tissue analyzers.",
        items: [
          { name: "Digital Soil Testing Spectrophotometer (14 Parameters)", unitRate: "Measures N, P, K, Zn, Fe, B, pH, EC, OC", cost: 165000, defaultAvailable: false, editable: true },
          { name: "Digital Micro-Centrifuge, Vortex Mixer & Precision Balance", unitRate: "Benchtop analytical equipment", cost: 55000, defaultAvailable: false, editable: true },
          { name: "Leaf Chlorophyll Meter & Digital Plant Microscope", unitRate: "Field pest & disease inspection", cost: 42000, defaultAvailable: false, editable: true },
          { name: "GPS Tablet & Bluetooth Field Thermal Report Printer", unitRate: "Instant printed prescription card", cost: 35000, defaultAvailable: false, editable: true },
        ],
      },
      raw_materials: {
        title: "Testing Reagents & Consumables (1,000 Tests)",
        icon: "📦",
        description: "Analytical grade chemical reagents, test tubes, and sample bags.",
        items: [
          { name: "Analytical Soil Testing Reagent Kits (1,000 Samples)", unitRate: "₹65 / complete soil profile", cost: 65000, defaultAvailable: false, editable: true },
          { name: "Filter Papers, Pipettes, Micro-Tubes & Chemical Vials", unitRate: "Lab consumables stock", cost: 25000, defaultAvailable: false, editable: true },
          { name: "Branded Farmer Soil Health Card Stationery (2,000 cards)", unitRate: "Professional printed booklets", cost: 20000, defaultAvailable: false, editable: true },
        ],
      },
      compliance: {
        title: "Accreditation & Quality Calibration",
        icon: "📋",
        description: "ICAR-CCRI calibration accreditation, GST, and Udyam.",
        items: [
          { name: "ICAR-CCRI Diagnostic Protocol Calibration & Technical Training", unitRate: "Official training certificate", cost: 25000, defaultAvailable: false, editable: true },
          { name: "Udyam MSME, GST Registration & Commercial Vehicle Permit", unitRate: "Filing and permits", cost: 15000, defaultAvailable: false, editable: true },
        ],
      },
      working_capital: {
        title: "Working Capital Reserve (3 Months)",
        icon: "👷",
        description: "Agri-graduate technician stipend, vehicle fuel, and maintenance buffer.",
        items: [
          { name: "1 Agri-Graduate Technician Stipend (3 Months)", unitRate: "₹18,000/mo salary", cost: 54000, defaultAvailable: false, editable: true },
          { name: "Vehicle Diesel & Village Travel Fuel (3 Months)", unitRate: "₹15,000/month", cost: 45000, defaultAvailable: false, editable: true },
        ],
      },
    },
    scenarios: {
      minimum: {
        name: "Backpack Diagnostic Kit (10 tests/day)",
        tag: "Low Capital Entry",
        investment: 280000,
        ownEquity: 84000,
        subsidy: 98000,
        equipment: "Portable Colorimeter + pH/EC Pens",
        capacity: "10 Soil Tests / day",
        workspace: "Home Base + Two-Wheeler",
        workers: "1 Entrepreneur",
        monthlyOpex: 18000,
        monthlyRevenue: 75000,
        netMargin: "58%",
        breakevenMonths: 5,
        description: "Low-overhead diagnostic service for village clusters on a motorbike.",
      },
      standard: {
        name: "Dedicated Mobile Diagnostic Van (30 tests/day)",
        tag: "Recommended Model",
        investment: 740000,
        ownEquity: 222000,
        subsidy: 259000,
        equipment: "Automated Spectrophotometer + Solar Van Unit",
        capacity: "30 Soil & Leaf Tests / day",
        workspace: "Outfitted Utility Van",
        workers: "2 Technical Staff",
        monthlyOpex: 48000,
        monthlyRevenue: 195000,
        netMargin: "62%",
        breakevenMonths: 7,
        description: "High margin business providing door-to-door soil cards and fertigation prescriptions.",
      },
      expanded: {
        name: "Regional Agri-Diagnostics Hub (100 tests/day)",
        tag: "Commercial Lab",
        investment: 1650000,
        ownEquity: 495000,
        subsidy: 577500,
        equipment: "AAS (Atomic Absorption) + PCR Diagnostic Setup",
        capacity: "100 Tests / day",
        workspace: "1,000 sq.ft Lab Center",
        workers: "4 Lab Technicians",
        monthlyOpex: 110000,
        monthlyRevenue: 450000,
        netMargin: "65%",
        breakevenMonths: 9,
        description: "Accredited testing partner for regional FPOs and corporate pesticide distributors.",
      },
    },
  },
  {
    id: "solar_dried_chips",
    name: "Solar Dehydrated Citrus Slices & Confectionery",
    icon: "☀️",
    category: "Food Processing & Beverages",
    tagline: "High-margin dehydrated mandarin slices for bakeries, tea infusions, and confectionery",
    defaultLocation: "Ramtek / Katol Agro Zone",
    baseProjectCost: 390000,
    subsidyScheme: "PMFME 35% Capital Subsidy / MEDA Solar",
    subsidyRate: 0.35,
    maxSubsidyLimit: 1000000,
    costCategories: {
      land_site: {
        title: "Clean Yard / Rooftop Preparation",
        icon: "🌱",
        description: "Dust-free open space with unshaded sunlight access.",
        items: [
          { name: "Existing Open Rooftop / Rural Compound", unitRate: "Founder owned", cost: 0, defaultAvailable: true, editable: true },
          { name: "Insect-Proof Boundary & Anti-Dust Windbreak Netting", unitRate: "Clean perimeter", cost: 18000, defaultAvailable: false, editable: true },
        ],
      },
      infrastructure: {
        title: "Cleanroom Packaging Cubicle",
        icon: "🏗️",
        description: "Hygienic dehumidified packing room and solar stands.",
        items: [
          { name: "Aluminium Composite Panel Cleanroom (200 sq.ft)", unitRate: "Airlock packing station", cost: 65000, defaultAvailable: false, editable: true },
          { name: "Room Dehumidifier & UV Sterilization Lamps", unitRate: "Maintains <40% relative humidity", cost: 35000, defaultAvailable: false, editable: true },
        ],
      },
      equipment: {
        title: "Drying & Slicing Machinery",
        icon: "⚙️",
        description: "Polycarbonate solar tunnel dryer, precision slicer, and vacuum packager.",
        items: [
          { name: "Polycarbonate Multi-Shelf Solar Tunnel Dryer (50 kg/batch)", unitRate: "Forced convection solar fans", cost: 95000, defaultAvailable: false, editable: true },
          { name: "Commercial Precision Rotary Fruit Slicer Machine", unitRate: "Uniform 3mm cross-cut stainless blades", cost: 42000, defaultAvailable: false, editable: true },
          { name: "Impulse Nitrogen Gas-Flushed Vacuum Sealer", unitRate: "Preserves crispness & vitamin C", cost: 32000, defaultAvailable: false, editable: true },
        ],
      },
      raw_materials: {
        title: "Fruit & Barrier Packaging Inventory",
        icon: "📦",
        description: "Firm fresh mandarins, organic citric wash, and foil pouches.",
        items: [
          { name: "Grade-A Firm Mandarin Oranges (2,000 kg)", unitRate: "₹24/kg selected fruit", cost: 48000, defaultAvailable: false, editable: true },
          { name: "Food-Grade Citric Acid Dip & Potassium Sorbate", unitRate: "Prevents browning", cost: 12000, defaultAvailable: false, editable: true },
          { name: "Multi-Layer Matte Finish Barrier Standup Pouches (5,000 units)", unitRate: "₹6.50/pouch with zipper", cost: 32500, defaultAvailable: false, editable: true },
        ],
      },
      compliance: {
        title: "Licenses & Brand Registration",
        icon: "📋",
        description: "FSSAI basic/state license, barcode, and GST.",
        items: [
          { name: "FSSAI Food License & Water Chemistry Certificate", unitRate: "Registration fee", cost: 10000, defaultAvailable: false, editable: true },
          { name: "Udyam MSME, GST Registration & Barcode Assignment", unitRate: "GS1 barcodes", cost: 12000, defaultAvailable: false, editable: true },
        ],
      },
      working_capital: {
        title: "Working Capital Reserve (3 Months)",
        icon: "👷",
        description: "Slicing and packaging labor, utility power, and local courier buffer.",
        items: [
          { name: "2 Packaging & Slicing Assistants (3 Months)", unitRate: "₹10,000/mo per worker", cost: 60000, defaultAvailable: false, editable: true },
          { name: "Power Bill & Logistics Courier Reserve", unitRate: "Operational buffer", cost: 18000, defaultAvailable: false, editable: true },
        ],
      },
    },
    scenarios: {
      minimum: {
        name: "Micro Solar Dryer (20 kg/batch)",
        tag: "Low Capital Entry",
        investment: 240000,
        ownEquity: 72000,
        subsidy: 84000,
        equipment: "Small Solar Cabinet + Hand Slicer",
        capacity: "20 kg / batch",
        workspace: "150 sq.ft Rooftop",
        workers: "1 Operator",
        monthlyOpex: 16000,
        monthlyRevenue: 65000,
        netMargin: "52%",
        breakevenMonths: 5,
        description: "Niche production of gourmet dried orange cocktail garnishes and baker supply.",
      },
      standard: {
        name: "Commercial Solar Tunnel Unit (100 kg/batch)",
        tag: "Sweet Spot",
        investment: 390000,
        ownEquity: 117000,
        subsidy: 136500,
        equipment: "50 kg Tunnel Dryer + Electric Slicer + Nitrogen Sealer",
        capacity: "100 kg / batch",
        workspace: "400 sq.ft Area",
        workers: "2 Workers",
        monthlyOpex: 38000,
        monthlyRevenue: 155000,
        netMargin: "58%",
        breakevenMonths: 7,
        description: "Direct sales to herbal tea blending companies, craft breweries, and e-commerce.",
      },
      expanded: {
        name: "Hybrid Solar-Electric Dehydration Plant (500 kg/day)",
        tag: "Commercial Plant",
        investment: 1150000,
        ownEquity: 345000,
        subsidy: 402500,
        equipment: "Continuous Hybrid Heat-Pump Dehydrator",
        capacity: "500 kg / day",
        workspace: "1,500 sq.ft Unit",
        workers: "5 Staff",
        monthlyOpex: 95000,
        monthlyRevenue: 410000,
        netMargin: "62%",
        breakevenMonths: 9,
        description: "Year-round dehydration facility processing diverse seasonal Vidarbha fruits.",
      },
    },
  },
  {
    id: "optical_packhouse",
    name: "Mechanized Optical Sorting & CFB Packaging Line",
    icon: "🏭",
    category: "Post-Harvest & Packaging",
    tagline: "Commercial optical camera grading, washing, fungicide waxing, and CFB packaging line",
    defaultLocation: "Warud / Kalmeshwar APMC Mandi Node",
    baseProjectCost: 1950000,
    subsidyScheme: "MIDH / NHB 35% Capital Grant & PMFME",
    subsidyRate: 0.35,
    maxSubsidyLimit: 1000000,
    costCategories: {
      land_site: {
        title: "Industrial Yard & Dock Prep",
        icon: "🌱",
        description: "Truck turnaround area, loading docks, and weighbridge pad.",
        items: [
          { name: "Industrial / APMC Yard Space (0.5 Acre)", unitRate: "Lease / Owned footprint", cost: 0, defaultAvailable: true, editable: true },
          { name: "Heavy Vehicle Concrete Pavement & Unloading Ramp", unitRate: "10-wheel truck dock", cost: 60000, defaultAvailable: false, editable: true },
        ],
      },
      infrastructure: {
        title: "Packhouse Civil Structure & 3-Phase Grid",
        icon: "🏗️",
        description: "Pre-engineered steel shed, epoxy flooring, and 25 HP power line.",
        items: [
          { name: "Industrial Insulated Packhouse Shed (2,500 sq.ft)", unitRate: "Food-grade PEB structure", cost: 380000, defaultAvailable: false, editable: true },
          { name: "3-Phase 25 HP Power Transformer & Switchgear Panel", unitRate: "Dedicated industrial line", cost: 140000, defaultAvailable: false, editable: true },
          { name: "Clean Borewell Water Reservoir & Chlorination Plant", unitRate: "High-volume washing supply", cost: 85000, defaultAvailable: false, editable: true },
        ],
      },
      equipment: {
        title: "Optical Grading & Waxing Machinery",
        icon: "⚙️",
        description: "4 MT/hour roller conveyor, fruit washer, dryer, and optical sorter.",
        items: [
          { name: "Mechanized Roller Conveyor Fruit Washer & High-Pressure Sprayer", unitRate: "Soft-bristle rotary washer", cost: 280000, defaultAvailable: false, editable: true },
          { name: "Hot-Air Forced Drying & Antifungal Waxing Tunnel", unitRate: "Food-grade wax mist applicator", cost: 320000, defaultAvailable: false, editable: true },
          { name: "Optical Camera Weight & Color Grading Unit (3-Tier Sort)", unitRate: "High-speed camera sensor with 6 drop gates", cost: 480000, defaultAvailable: false, editable: true },
          { name: "Automated Roller Packing Tables & Carton Strapping Machines (2 units)", unitRate: "Semi-automatic carton sealer", cost: 75000, defaultAvailable: false, editable: true },
        ],
      },
      raw_materials: {
        title: "Wax & Corrugated Packaging Stock",
        icon: "📦",
        description: "Citrus stayfresh wax, 5-ply CFB boxes, and corner boards.",
        items: [
          { name: "Food-Grade Carnauba / Polyethylene Citrus Wax (1,000 Litres)", unitRate: "₹180/Litre import grade", cost: 180000, defaultAvailable: false, editable: true },
          { name: "5-Ply Corrugated CFB Master Boxes (10kg capacity, 10,000 boxes)", unitRate: "₹38/box printed", cost: 380000, defaultAvailable: false, editable: true },
          { name: "Carton Strapping Rolls, Foam Net Sleeves & Pallet Wrap", unitRate: "Packing accessories stock", cost: 45000, defaultAvailable: false, editable: true },
        ],
      },
      compliance: {
        title: "Accreditation & Approvals",
        icon: "📋",
        description: "NHB packhouse audit, APMC license, and APEDA export registration.",
        items: [
          { name: "NHB / APEDA Packhouse Technical Accreditation Fee", unitRate: "Official inspection audit", cost: 40000, defaultAvailable: false, editable: true },
          { name: "APMC Mandi Commission Agent / Aggregator Trade License", unitRate: "District market committee license", cost: 25000, defaultAvailable: false, editable: true },
          { name: "Fire Safety NOC, Factory Inspector Approval & GST", unitRate: "Statutory clearances", cost: 25000, defaultAvailable: false, editable: true },
        ],
      },
      working_capital: {
        title: "Working Capital Reserve (3 Months)",
        icon: "👷",
        description: "Packhouse supervisor, 6 sorting operators, and high-voltage power bill.",
        items: [
          { name: "1 Supervisor & 6 Sorting Laborers (3 Months Payroll)", unitRate: "Combined packhouse wages", cost: 216000, defaultAvailable: false, editable: true },
          { name: "Electricity Utility Bill Buffer & Machine Maintenance", unitRate: "₹25,000/month", cost: 75000, defaultAvailable: false, editable: true },
        ],
      },
    },
    scenarios: {
      minimum: {
        name: "Farm-Gate Mechanical Grader (1 MT/hr)",
        tag: "Low CapEx Pilot",
        investment: 950000,
        ownEquity: 285000,
        subsidy: 332500,
        equipment: "Mechanical Sizing Drums + Manual Waxing",
        capacity: "1 Metric Tonne / hour",
        workspace: "1,000 sq.ft Shed",
        workers: "4 Staff",
        monthlyOpex: 55000,
        monthlyRevenue: 185000,
        netMargin: "45%",
        breakevenMonths: 7,
        description: "Local farm-gate grading unit eliminating middleman price cuts.",
      },
      standard: {
        name: "Optical Sizing & Waxing Packhouse (4 MT/hr)",
        tag: "Sweet Spot",
        investment: 1950000,
        ownEquity: 585000,
        subsidy: 682500,
        equipment: "Optical Camera Sorter + Automated Wax Tunnel",
        capacity: "4 Metric Tonnes / hour",
        workspace: "2,500 sq.ft Hub",
        workers: "7 Staff",
        monthlyOpex: 110000,
        monthlyRevenue: 420000,
        netMargin: "55%",
        breakevenMonths: 9,
        description: "Caters to commercial supermarket contracts and long-distance Delhi/Bengaluru dispatches.",
      },
      expanded: {
        name: "Integrated Cold Chain Packhouse (10 MT/hr)",
        tag: "Export Hub",
        investment: 4500000,
        ownEquity: 1350000,
        subsidy: 1575000,
        equipment: "Dual Optical Lines + Hydro-Cooler + Pre-Cooling Rooms",
        capacity: "10 Metric Tonnes / hour",
        workspace: "6,000 sq.ft Node",
        workers: "14 Staff",
        monthlyOpex: 280000,
        monthlyRevenue: 1150000,
        netMargin: "60%",
        breakevenMonths: 11,
        description: "Flagship export packaging terminal certified for Bangladesh and Gulf container shipments.",
      },
    },
  },
];

// ============================================================================
// DYNAMIC ACTIVE RECOMMENDATION MODEL FACTORY
// Guarantees 100% financial consistency between Business Plan and Financial Assistant
// ============================================================================
function buildCustomModelFromOpportunity(opportunity, ownCapital = 200000) {
  if (!opportunity) return null;

  const name = opportunity.name || "Citrus Agro-Enterprise";
  const nLower = name.toLowerCase();
  const baseCost = Number(
    opportunity.financial_breakdown?.total_project_cost ||
    opportunity.total_project_cost ||
    opportunity.total_cost ||
    opportunity.capex_inr ||
    opportunity.capex ||
    180000
  );

  const subsidyRate = 0.35;
  const subsidyAmount = opportunity.financial_breakdown?.subsidy_amount || Math.round(baseCost * subsidyRate);
  const subsidyScheme =
    opportunity.financial_breakdown?.eligible_scheme ||
    (nLower.includes("diagnostic") || nLower.includes("clinic")
      ? "PMEGP / SMAM Agritech Scheme (MoA&FW)"
      : nLower.includes("nursery")
      ? "MIDH / NHM Commercial Horticulture Grant"
      : "PMFME ODOP 35% Credit-Linked Grant (MoFPI)");

  let icon = "🍊";
  let catTitle = opportunity.category || "Agro-Processing & Value Addition";
  let itemsBreakdown = null;

  if (
    nLower.includes("peel") ||
    nLower.includes("candied") ||
    nLower.includes("candy") ||
    nLower.includes("waste") ||
    nLower.includes("enzyme") ||
    nLower.includes("byproduct")
  ) {
    icon = "🍬";
    itemsBreakdown = {
      land_site: [
        { name: "Existing Covered Space / Shed Setup", unitRate: "Owned by Founder / Leased", cost: 0, defaultAvailable: true, editable: true },
        { name: "Food-Grade Washable Epoxy Floor & Prep Work", unitRate: "FSSAI hygienic sanitary flooring", cost: Math.round(baseCost * 0.05), defaultAvailable: false, editable: true },
      ],
      infrastructure: [
        { name: "Solar Dehydrator Cabinet & Stainless Curing Racks", unitRate: "50 kg batch dehydrator setup", cost: Math.round(baseCost * 0.20), defaultAvailable: false, editable: true },
      ],
      equipment: [
        { name: "SS-316 Steam Blanching & Sugar Syruping Kettles", unitRate: "Double-jacketed cooking kettle", cost: Math.round(baseCost * 0.25), defaultAvailable: false, editable: true },
        { name: "Citrus Peel Shredder, Dicer & Vacuum Packaging Unit", unitRate: "High-speed precision dicer", cost: Math.round(baseCost * 0.18), defaultAvailable: false, editable: true },
      ],
      raw_materials: [
        { name: "Initial Mandi Peel Procurement & Organic Sucrose Buffer", unitRate: "Seasonal raw material stock", cost: Math.round(baseCost * 0.14), defaultAvailable: false, editable: true },
        { name: "Food-Grade Barrier Pouches & Packaging Consumables", unitRate: "5,000 retail pouches", cost: Math.round(baseCost * 0.05), defaultAvailable: false, editable: true },
      ],
      compliance: [
        { name: "FSSAI Cottage/State License, GST & Lab Testing", unitRate: "Statutory filings & quality assay", cost: Math.round(baseCost * 0.04), defaultAvailable: false, editable: true },
      ],
      working_capital: [
        { name: "3 Months Operating Electricity, Utility & Emergency Buffer", unitRate: "3-month operational runway", cost: 0, defaultAvailable: false, editable: true },
      ],
    };
  } else if (
    nLower.includes("diagnostic") ||
    nLower.includes("clinic") ||
    nLower.includes("leaf") ||
    nLower.includes("testing") ||
    nLower.includes("soil")
  ) {
    icon = "🔬";
    itemsBreakdown = {
      land_site: [
        { name: "Zero Land Footprint (Mobile Field Kit)", unitRate: "Operates directly in orchards", cost: 0, defaultAvailable: true, editable: true },
      ],
      infrastructure: [
        { name: "Shockproof Field Kit Casing & Portable Battery Bank", unitRate: "Rugged all-weather transit case", cost: Math.round(baseCost * 0.08), defaultAvailable: false, editable: true },
      ],
      equipment: [
        { name: "Portable Spectrophotometer & Digital pH/EC/NPK Probes", unitRate: "Calibrated optical assay unit", cost: Math.round(baseCost * 0.35), defaultAvailable: false, editable: true },
        { name: "Digital Handheld Microscope & Diagnostic Tablet", unitRate: "400x digital field scope", cost: Math.round(baseCost * 0.18), defaultAvailable: false, editable: true },
      ],
      raw_materials: [
        { name: "Rapid Phytophthora & HLB Diagnostic Test Strips", unitRate: "500 lateral flow test kits", cost: Math.round(baseCost * 0.20), defaultAvailable: false, editable: true },
      ],
      compliance: [
        { name: "ICAR-CCRI Technical Quality Accreditation & GST", unitRate: "Institutional testing accreditation", cost: Math.round(baseCost * 0.06), defaultAvailable: false, editable: true },
      ],
      working_capital: [
        { name: "3 Months Mobility, Vehicle Fuel & Buffer", unitRate: "Field transit & operating runway", cost: 0, defaultAvailable: false, editable: true },
      ],
    };
  } else if (
    nLower.includes("juice") ||
    nLower.includes("shake") ||
    nLower.includes("kiosk")
  ) {
    icon = "🧃";
    itemsBreakdown = {
      land_site: [
        { name: "Zero Land Footprint (Mobile Cart / Kiosk)", unitRate: "High-footfall urban placement", cost: 0, defaultAvailable: true, editable: true },
      ],
      infrastructure: [
        { name: "Insulated Stainless Steel Mobile Kiosk Cart", unitRate: "Custom all-weather food cart", cost: Math.round(baseCost * 0.30), defaultAvailable: false, editable: true },
      ],
      equipment: [
        { name: "Commercial SS-304 Cold-Press Citrus Extractor", unitRate: "Automatic fruit feeder press", cost: Math.round(baseCost * 0.28), defaultAvailable: false, editable: true },
        { name: "Under-Counter Deep Chiller & Blending Station", unitRate: "Commercial refrigeration unit", cost: Math.round(baseCost * 0.14), defaultAvailable: false, editable: true },
      ],
      raw_materials: [
        { name: "Initial Mandi Fruit Crates & Biodegradable Cups", unitRate: "1-month procurement stock", cost: Math.round(baseCost * 0.12), defaultAvailable: false, editable: true },
      ],
      compliance: [
        { name: "FSSAI Basic Food Business Registration & QR Branding", unitRate: "Municipal vendor fee & signage", cost: Math.round(baseCost * 0.05), defaultAvailable: false, editable: true },
      ],
      working_capital: [
        { name: "3 Months Operating Electricity & Working Capital", unitRate: "Runway & emergency buffer", cost: 0, defaultAvailable: false, editable: true },
      ],
    };
  } else if (
    nLower.includes("marmalade") ||
    nLower.includes("jam") ||
    nLower.includes("jelly") ||
    nLower.includes("preserve")
  ) {
    icon = "🍯";
    itemsBreakdown = {
      land_site: [
        { name: "Existing Kitchen / Food Cleanroom Space", unitRate: "Owned / Leased commercial room", cost: 0, defaultAvailable: true, editable: true },
        { name: "Food-Grade Epoxy Washdown Floor Preparation", unitRate: "Sanitary cleanroom surfaces", cost: Math.round(baseCost * 0.05), defaultAvailable: false, editable: true },
      ],
      infrastructure: [
        { name: "Stainless Steel Prep Tables & Utility Manifold", unitRate: "SS-304 food-grade wash basins", cost: Math.round(baseCost * 0.15), defaultAvailable: false, editable: true },
      ],
      equipment: [
        { name: "Steam-Jacketed SS Cooking Kettle & Fruit Pulper", unitRate: "Tilting steam kettle 50L", cost: Math.round(baseCost * 0.35), defaultAvailable: false, editable: true },
        { name: "Semi-Automatic Jar Capper & Induction Foil Sealer", unitRate: "Hermetic sealing machine", cost: Math.round(baseCost * 0.15), defaultAvailable: false, editable: true },
      ],
      raw_materials: [
        { name: "Nagpur Mandarin Pulp, Pectin, Sugar & Glass Jars", unitRate: "2,000 jar initial inventory", cost: Math.round(baseCost * 0.15), defaultAvailable: false, editable: true },
      ],
      compliance: [
        { name: "FSSAI Manufacturing License & Agmark Quality Testing", unitRate: "Shelf-life & nutritional assays", cost: Math.round(baseCost * 0.05), defaultAvailable: false, editable: true },
      ],
      working_capital: [
        { name: "3 Months Operating Electricity, Utility & Buffer", unitRate: "3-month working runway", cost: 0, defaultAvailable: false, editable: true },
      ],
    };
  } else if (
    nLower.includes("nursery") ||
    nLower.includes("budding") ||
    nLower.includes("rootstock")
  ) {
    icon = "🌱";
    itemsBreakdown = {
      land_site: [
        { name: "Existing Agri Land (0.5 – 1.0 Acre)", unitRate: "Owned by Founder / Leased", cost: 0, defaultAvailable: true, editable: true },
        { name: "Site Levelling, Pathway & Drainage Grading", unitRate: "Civil earthwork", cost: Math.round(baseCost * 0.05), defaultAvailable: false, editable: true },
      ],
      infrastructure: [
        { name: "UV-Stabilized 50% Shade-Net Polyhouse (1,000 sq. m)", unitRate: "GI pipe frame structure", cost: Math.round(baseCost * 0.38), defaultAvailable: false, editable: true },
        { name: "Micro-Sprinklers & Automated Drip Fertigation Unit", unitRate: "High-density nursery grid", cost: Math.round(baseCost * 0.14), defaultAvailable: false, editable: true },
      ],
      equipment: [
        { name: "Budding Knives, Grafting Shears & Media Mixer", unitRate: "Professional propagation kits", cost: Math.round(baseCost * 0.10), defaultAvailable: false, editable: true },
      ],
      raw_materials: [
        { name: "Rangpur Lime Rootstocks & CCRI Certified Budwood", unitRate: "Disease-free scion budwood", cost: Math.round(baseCost * 0.16), defaultAvailable: false, editable: true },
      ],
      compliance: [
        { name: "State Nursery License & CCRI Quality Audit", unitRate: "Horticulture accreditation", cost: Math.round(baseCost * 0.04), defaultAvailable: false, editable: true },
      ],
      working_capital: [
        { name: "3 Months Nursery Labor & Operating Buffer", unitRate: "Operational runway", cost: 0, defaultAvailable: false, editable: true },
      ],
    };
  } else {
    itemsBreakdown = {
      land_site: [
        { name: "Existing Facility / Land Footprint", unitRate: "Owned by Founder / Leased", cost: 0, defaultAvailable: true, editable: true },
        { name: "Site Prep & Safety Layout Preparation", unitRate: "Civil preparation", cost: Math.round(baseCost * 0.05), defaultAvailable: false, editable: true },
      ],
      infrastructure: [
        { name: "Facility Workstations & Power/Water Utilities", unitRate: "Dedicated work zone", cost: Math.round(baseCost * 0.20), defaultAvailable: false, editable: true },
      ],
      equipment: [
        { name: "Core Technical Machinery & Processing Tools", unitRate: "Primary operational hardware", cost: Math.round(baseCost * 0.40), defaultAvailable: false, editable: true },
      ],
      raw_materials: [
        { name: "Initial Raw Materials & Packaging Supplies Buffer", unitRate: "Batch procurement stock", cost: Math.round(baseCost * 0.18), defaultAvailable: false, editable: true },
      ],
      compliance: [
        { name: "Statutory Licenses, GST, MSME & Quality Assays", unitRate: "Certifications & registrations", cost: Math.round(baseCost * 0.05), defaultAvailable: false, editable: true },
      ],
      working_capital: [
        { name: "3 Months Operating Expenses & Reserve Buffer", unitRate: "3-month operational runway", cost: 0, defaultAvailable: false, editable: true },
      ],
    };
  }

  // Ensure working capital closes the gap EXACTLY to equal baseCost without any rounding discrepancy
  let allocatedSoFar = 0;
  ["land_site", "infrastructure", "equipment", "raw_materials", "compliance"].forEach((catKey) => {
    itemsBreakdown[catKey]?.forEach((item) => {
      allocatedSoFar += item.cost;
    });
  });
  const remainingForWorkingCapital = Math.max(0, baseCost - allocatedSoFar);
  if (itemsBreakdown.working_capital && itemsBreakdown.working_capital[0]) {
    itemsBreakdown.working_capital[0].cost = remainingForWorkingCapital;
  }

  const costCategories = {
    land_site: {
      title: "Land & Site Preparation",
      icon: "🌱",
      description: "Premises preparation, hygienic washdown surfaces, and drainage.",
      items: itemsBreakdown.land_site,
    },
    infrastructure: {
      title: "Infrastructure & Civil Structures",
      icon: "🏗️",
      description: "Structures, dehydrator cabinets, utilities, and shelving.",
      items: itemsBreakdown.infrastructure,
    },
    equipment: {
      title: "Core Machinery & Equipment",
      icon: "⚙️",
      description: "Specialized processing hardware, tooling, and containment units.",
      items: itemsBreakdown.equipment,
    },
    raw_materials: {
      title: "Raw Materials & Initial Stock",
      icon: "📦",
      description: "Farm-gate citrus procurement, ingredients, and packaging buffer.",
      items: itemsBreakdown.raw_materials,
    },
    compliance: {
      title: "Licenses, Testing & Compliance",
      icon: "📋",
      description: "FSSAI, MSME Udyam, laboratory certification, and GST setup.",
      items: itemsBreakdown.compliance,
    },
    working_capital: {
      title: "Working Capital Reserve (3 Months)",
      icon: "👷",
      description: "Operating runway for labor, electricity, utilities, and emergency buffer.",
      items: itemsBreakdown.working_capital,
    },
  };

  const minInvest = Math.round(baseCost * 0.55);
  const expInvest = Math.round(baseCost * 2.2);

  return {
    id: "active_recommendation",
    name: name,
    icon: icon,
    category: catTitle,
    tagline: opportunity.tagline || opportunity.description || "Custom AI-Recommended Citrus Venture",
    defaultLocation: opportunity.location_relevance || "Katol / Nagpur District",
    baseProjectCost: baseCost,
    subsidyScheme: subsidyScheme,
    subsidyRate: subsidyRate,
    maxSubsidyLimit: 1000000,
    costCategories: costCategories,
    scenarios: {
      minimum: {
        name: "Minimum Setup (Pilot / Micro)",
        tag: "Low Capital Entry",
        investment: minInvest,
        ownEquity: Math.round(minInvest * 0.4),
        subsidy: Math.round(minInvest * subsidyRate),
        equipment: "Essential Core Setup Kit",
        capacity: "Micro / Pilot Capacity",
        workspace: "Semi-Covered Workspace / Farm Corner",
        workers: "1 Operator + Founder",
        monthlyOpex: Math.round(minInvest * 0.08),
        monthlyRevenue: Math.round(minInvest * 0.22),
        netMargin: "38%",
        breakevenMonths: 6,
        description: "Ideal for bootstrap entry with minimal financial exposure and zero debt stress.",
      },
      standard: {
        name: "Standard Setup (Recommended Sweet Spot)",
        tag: "Recommended Sweet Spot",
        investment: baseCost,
        ownEquity: Math.min(baseCost, ownCapital),
        subsidy: subsidyAmount,
        equipment: "Full Commercial Processing Line",
        capacity: "Standard Commercial Batch",
        workspace: "Dedicated Processing Facility",
        workers: "2 Staff + Founder",
        monthlyOpex: Math.round(baseCost * 0.12),
        monthlyRevenue: Math.round(baseCost * 0.35),
        netMargin: "45%",
        breakevenMonths: 8,
        description: `Fully pre-qualified for ${subsidyScheme} with strong market off-take potential.`,
      },
      expanded: {
        name: "Expanded Setup (High-Capacity)",
        tag: "Maximum Scale & Reach",
        investment: expInvest,
        ownEquity: Math.round(expInvest * 0.35),
        subsidy: Math.min(1000000, Math.round(expInvest * subsidyRate)),
        equipment: "High-Throughput Continuous Line",
        capacity: "High-Capacity Regional Output",
        workspace: "Industrial MIDC Hub",
        workers: "5+ Technical Staff",
        monthlyOpex: Math.round(expInvest * 0.12),
        monthlyRevenue: Math.round(expInvest * 0.30),
        netMargin: "50%",
        breakevenMonths: 11,
        description: "Institutional scale supplying regional commercial distributors and corporate buyers.",
      },
    },
  };
}

// ============================================================================
// 2. MAIN FINANCIAL ASSISTANT COMPONENT
// ============================================================================
export default function FinancialAssistant() {
  const locationState = useLocation();
  const navigate = useNavigate();
  const { user, activeVenture } = useAuth();

  // Active inner tab: "cost_breakdown" (6.1) | "funding_gap" (6.2 & 6.3) | "scenario_planner" (6.4)
  const [activeTab, setActiveTab] = useState("cost_breakdown");

  // Active recommended venture from context or storage
  const activeRecommendation = useMemo(() => {
    if (locationState.state?.opportunity) return locationState.state.opportunity;
    if (activeVenture?.name) return activeVenture;
    try {
      const savedPlan = localStorage.getItem("ev_active_business_plan");
      if (savedPlan) {
        const parsed = JSON.parse(savedPlan);
        if (parsed.opportunity) return parsed.opportunity;
      }
    } catch (e) {}
    return null;
  }, [locationState.state, activeVenture]);

  // User's own available capital from active venture, user profile, or localStorage
  const [ownCapital, setOwnCapital] = useState(() => {
    if (activeVenture?.own_equity) return Number(activeVenture.own_equity);
    try {
      const uId = user?.id;
      const fKey = uId ? `ev_${uId}_user_finances` : "ev_user_finances";
      const savedFin = localStorage.getItem(fKey) || localStorage.getItem("ev_user_finances");
      if (savedFin) {
        const parsed = JSON.parse(savedFin);
        if (parsed.personalSavings) return Number(parsed.personalSavings);
        if (parsed.availableCapitalINR) return Number(parsed.availableCapitalINR);
      }
      const savedPlan = localStorage.getItem("ev_active_business_plan");
      if (savedPlan) {
        const parsed = JSON.parse(savedPlan);
        if (parsed.opportunity?.financial_breakdown?.user_budget) {
          return Number(parsed.opportunity.financial_breakdown.user_budget);
        }
        if (parsed.userInput?.budget_inr) return Number(parsed.userInput.budget_inr);
      }
    } catch (e) {}
    return 200000; // Baseline ₹2.0 Lakhs
  });

  // Dynamic custom model built from active recommendation to guarantee zero discrepancy
  const activeRecommendationModel = useMemo(() => {
    if (!activeRecommendation?.name) return null;
    return buildCustomModelFromOpportunity(activeRecommendation, ownCapital);
  }, [activeRecommendation, ownCapital]);

  // Selected Business Model state
  const [selectedModelId, setSelectedModelId] = useState(() => {
    // 0. Check URL param
    const params = new URLSearchParams(window.location.search);
    const modelParam = params.get("model");
    if (modelParam && BUSINESS_MODELS.some((m) => m.id === modelParam)) return modelParam;

    // 1. If active recommendation exists, default to active_recommendation
    if (locationState.state?.opportunity || activeVenture?.name || localStorage.getItem("ev_active_business_plan")) {
      return "active_recommendation";
    }

    return "citrus_nursery";
  });

  // Keep selectedModelId synced if activeRecommendationModel becomes available
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modelParam = params.get("model");
    if (!modelParam && activeRecommendationModel && selectedModelId !== "active_recommendation") {
      setSelectedModelId("active_recommendation");
    }
  }, [activeRecommendationModel]);

  // Current active model object
  const currentModel = useMemo(() => {
    if (selectedModelId === "active_recommendation" && activeRecommendationModel) {
      return activeRecommendationModel;
    }
    return BUSINESS_MODELS.find((m) => m.id === selectedModelId) || activeRecommendationModel || BUSINESS_MODELS[0];
  }, [selectedModelId, activeRecommendationModel]);

  // Context awareness metadata
  const hasPlanContext = Boolean(
    activeRecommendationModel || activeVenture || locationState.state?.opportunity || localStorage.getItem("ev_active_business_plan")
  );

  const [isDPRModalOpen, setIsDPRModalOpen] = useState(false);

  // Interactive Assumption Modifiers for 6.1 Drill-Down
  const [scaleMultiplier, setScaleMultiplier] = useState(1.0); // 0.5x to 2.0x
  const [reserveMonths, setReserveMonths] = useState(3); // 1, 3, 6 months
  const [landStatus, setLandStatus] = useState("owned"); // "owned" | "leased" | "purchase"
  const [activeScenarioKey, setActiveScenarioKey] = useState("standard"); // "minimum" | "standard" | "expanded"

  // Expandable sections in 6.1 drill-down
  const [expandedCategories, setExpandedCategories] = useState({
    land_site: true,
    infrastructure: true,
    equipment: true,
    raw_materials: false,
    compliance: false,
    working_capital: true,
  });

  const toggleCategory = (key) => {
    setExpandedCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Bank Loan Calculator interactive parameters in 6.2 & 6.3
  const [loanInterestRate, setLoanInterestRate] = useState(8.5); // %
  const [loanTenureYears, setLoanTenureYears] = useState(5); // years

  // Track item overrides in cost breakdown
  const [itemCosts, setItemCosts] = useState({});

  // Reset custom item overrides when model changes
  useEffect(() => {
    setItemCosts({});
  }, [selectedModelId]);

  // Calculate dynamic line items and totals
  const calculatedCostSummary = useMemo(() => {
    let infrastructureSum = 0;
    let equipmentSum = 0;
    let rawMaterialsSum = 0;
    let complianceSum = 0;
    let workingCapitalSum = 0;
    let landSiteSum = 0;

    const categories = currentModel.costCategories;

    // Helper to compute line item cost with scale & overrides
    const getItemCost = (catKey, itemIdx, defaultCost) => {
      const overrideKey = `${catKey}_${itemIdx}`;
      if (itemCosts[overrideKey] !== undefined) return itemCosts[overrideKey];

      let computed = defaultCost * scaleMultiplier;
      // Adjust working capital by reserve months
      if (catKey === "working_capital") {
        computed = (defaultCost / 3) * reserveMonths * scaleMultiplier;
      }
      // Adjust land if leased
      if (catKey === "land_site" && itemIdx === 0) {
        if (landStatus === "leased") computed = 45000 * scaleMultiplier;
        else if (landStatus === "purchase") computed = 250000 * scaleMultiplier;
        else computed = 0; // owned
      }
      return Math.round(computed);
    };

    categories.land_site?.items.forEach((item, idx) => {
      landSiteSum += getItemCost("land_site", idx, item.cost);
    });
    categories.infrastructure?.items.forEach((item, idx) => {
      infrastructureSum += getItemCost("infrastructure", idx, item.cost);
    });
    categories.equipment?.items.forEach((item, idx) => {
      equipmentSum += getItemCost("equipment", idx, item.cost);
    });
    categories.raw_materials?.items.forEach((item, idx) => {
      rawMaterialsSum += getItemCost("raw_materials", idx, item.cost);
    });
    categories.compliance?.items.forEach((item, idx) => {
      complianceSum += getItemCost("compliance", idx, item.cost);
    });
    categories.working_capital?.items.forEach((item, idx) => {
      workingCapitalSum += getItemCost("working_capital", idx, item.cost);
    });

    const totalProjectCost =
      landSiteSum +
      infrastructureSum +
      equipmentSum +
      rawMaterialsSum +
      complianceSum +
      workingCapitalSum;

    // Subsidy calculation
    const potentialSubsidy = Math.min(
      Math.round(totalProjectCost * currentModel.subsidyRate),
      currentModel.maxSubsidyLimit
    );

    // Funding Gap
    const fundingGap = Math.max(0, totalProjectCost - ownCapital);
    const gapAfterSubsidy = Math.max(0, totalProjectCost - ownCapital - potentialSubsidy);

    return {
      landSiteSum,
      infrastructureSum,
      equipmentSum,
      rawMaterialsSum,
      complianceSum,
      workingCapitalSum,
      totalProjectCost,
      potentialSubsidy,
      fundingGap,
      gapAfterSubsidy,
      getItemCost,
    };
  }, [currentModel, scaleMultiplier, reserveMonths, landStatus, itemCosts, ownCapital]);

  // Bank Loan EMI calculation formula: P * r * (1+r)^n / ((1+r)^n - 1)
  const bankEmiDetails = useMemo(() => {
    const loanPrincipal = Math.max(0, calculatedCostSummary.fundingGap);
    if (loanPrincipal <= 0) {
      return { monthlyEmi: 0, totalInterest: 0, totalPayment: 0 };
    }
    const monthlyRate = loanInterestRate / 12 / 100;
    const totalMonths = loanTenureYears * 12;

    const emi =
      (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
      (Math.pow(1 + monthlyRate, totalMonths) - 1);

    const totalPayment = emi * totalMonths;
    const totalInterest = totalPayment - loanPrincipal;

    return {
      loanPrincipal,
      monthlyEmi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment),
    };
  }, [calculatedCostSummary.fundingGap, loanInterestRate, loanTenureYears]);

  // Handle manual inline line-item edit
  const handleItemCostChange = (catKey, itemIdx, newVal) => {
    const overrideKey = `${catKey}_${itemIdx}`;
    const val = Number(newVal) || 0;
    setItemCosts((prev) => ({ ...prev, [overrideKey]: val }));
  };

  // Reset assumptions
  const handleResetAssumptions = () => {
    setScaleMultiplier(1.0);
    setReserveMonths(3);
    setLandStatus("owned");
    setItemCosts({});
  };

  // Apply scenario to active planner
  const handleApplyScenario = (scenarioKey) => {
    setActiveScenarioKey(scenarioKey);
    const sc = currentModel.scenarios[scenarioKey];
    if (sc) {
      if (scenarioKey === "minimum") setScaleMultiplier(0.55);
      else if (scenarioKey === "standard") setScaleMultiplier(1.0);
      else if (scenarioKey === "expanded") setScaleMultiplier(2.2);

      setOwnCapital(sc.ownEquity);
      setActiveTab("funding_gap");
    }
  };

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", paddingBottom: 60 }}>
      {/* ====================================================================
          PAGE 6.5 CONTEXT BANNER (IF NAVIGATED FROM BUSINESS PLAN)
         ==================================================================== */}
      {hasPlanContext && (
        <div
          style={{
            background: "rgba(99, 102, 241, 0.08)",
            border: "1px solid var(--line-glow)",
            borderRadius: 16,
            padding: "14px 20px",
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: "1.8rem" }}>{currentModel.icon}</span>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase" }}>
                  {selectedModelId === "active_recommendation" ? "⭐ Active Recommended Venture" : "Exploring Alternative Model"}
                </span>
                <span className="badge-verified" style={{ fontSize: "0.72rem" }}>
                  {selectedModelId === "active_recommendation" ? "✓ Plan Loaded" : "Catalog Blueprint"}
                </span>
              </div>
              <h3 style={{ margin: "2px 0 0", fontSize: "1.1rem", fontWeight: 800, color: "var(--text-heading)" }}>
                {currentModel.name}
              </h3>
              <div style={{ display: "flex", gap: 14, marginTop: 4, fontSize: "0.78rem", color: "var(--muted)" }}>
                <span>📍 Location: <strong>{currentModel.defaultLocation}</strong></span>
                <span>🌾 Land: <strong>{landStatus === "owned" ? "Self-Owned Available" : "Leased"}</strong></span>
                <span>📋 Framework: <strong>{currentModel.subsidyScheme}</strong></span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Link
              to="/business-plan"
              className="btn-secondary-gloss"
              style={{ fontSize: "0.82rem", padding: "8px 14px", textDecoration: "none" }}
            >
              ← Back to Business Plan
            </Link>
          </div>
        </div>
      )}

      {/* ====================================================================
          PAGE HEADER & BUSINESS SELECTOR
         ==================================================================== */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="pill" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <CircleDollarSign size={14} /> Decision-Support System
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>PAGE 6</span>
            </div>
            <h1 style={{ fontSize: "1.85rem", fontWeight: 800, margin: "6px 0 4px", color: "var(--text-heading)" }}>
              💰 Financial Assistant
            </h1>
            <p className="muted" style={{ margin: 0, fontSize: "0.95rem" }}>
              Understand the true financial requirements, CapEx breakdowns, funding gap, and financing routes for your citrus agro-enterprise.
            </p>
          </div>

          {/* Business Model Switcher Dropdown */}
          <div style={{ minWidth: 280, flex: 1, maxWidth: 360 }}>
            <label
              htmlFor="model-select"
              style={{
                display: "block",
                fontSize: "0.76rem",
                fontWeight: 800,
                color: "var(--muted)",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              What business are you planning?
            </label>
            <div style={{ position: "relative" }}>
              <select
                id="model-select"
                value={selectedModelId}
                onChange={(e) => setSelectedModelId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 16px",
                  borderRadius: 12,
                  background: "var(--panel-subtle)",
                  border: "1px solid var(--line-glow)",
                  color: "var(--text-heading)",
                  fontSize: "0.88rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  outline: "none",
                  appearance: "none",
                }}
              >
                {activeRecommendationModel && (
                  <optgroup label="⭐ Your Active Recommendation">
                    <option value="active_recommendation">
                      ⭐ {activeRecommendationModel.name} (Plan Benchmark: ₹{activeRecommendationModel.baseProjectCost.toLocaleString("en-IN")})
                    </option>
                  </optgroup>
                )}
                <optgroup label="🧃 Food Processing & Value-Addition">
                  {BUSINESS_MODELS.filter((m) => m.category.includes("Food") || m.category.includes("Beverages")).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.icon} {m.name}
                    </option>
                  ))}
                </optgroup>

                <optgroup label="🌱 Nursery & Propagation Infrastructure">
                  {BUSINESS_MODELS.filter((m) => m.category.includes("Nursery") || m.category.includes("Propagation")).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.icon} {m.name}
                    </option>
                  ))}
                </optgroup>

                <optgroup label="🧪 By-Products & Circular Bio-Economy">
                  {BUSINESS_MODELS.filter((m) => m.category.includes("By-Products") || m.category.includes("Bio")).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.icon} {m.name}
                    </option>
                  ))}
                </optgroup>

                <optgroup label="📦 Post-Harvest, Packaging & Testing Services">
                  {BUSINESS_MODELS.filter((m) => m.category.includes("Post-Harvest") || m.category.includes("Packaging") || m.category.includes("Agritech")).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.icon} {m.name}
                    </option>
                  ))}
                </optgroup>

                <optgroup label="❄️ Cold Chain & Climate-Controlled Storage">
                  {BUSINESS_MODELS.filter((m) => m.category.includes("Cold") || m.category.includes("Storage")).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.icon} {m.name}
                    </option>
                  ))}
                </optgroup>
              </select>
              <ChevronDown
                size={18}
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                  color: "var(--muted)",
                }}
              />
            </div>
          </div>
        </div>

        {/* 3 INNER SEGMENTED TABS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 10,
            marginTop: 20,
            paddingTop: 16,
            borderTop: "1px solid var(--line)",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("cost_breakdown")}
            className={`pill-option-btn ${activeTab === "cost_breakdown" ? "active" : ""}`}
            style={{
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: "0.88rem",
              fontWeight: 800,
            }}
          >
            <span>🏗️</span>
            <span>6.1 Project Cost Breakdown</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("funding_gap")}
            className={`pill-option-btn ${activeTab === "funding_gap" ? "active" : ""}`}
            style={{
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: "0.88rem",
              fontWeight: 800,
            }}
          >
            <span>💰</span>
            <span>6.2 & 6.3 Funding Gap & Options</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("scenario_planner")}
            className={`pill-option-btn ${activeTab === "scenario_planner" ? "active" : ""}`}
            style={{
              padding: "12px 14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: "0.88rem",
              fontWeight: 800,
            }}
          >
            <span>📊</span>
            <span>6.4 Scenario Planner</span>
          </button>
        </div>
      </div>

      {/* ====================================================================
          TAB 1: PAGE 6.1 — PROJECT COST BREAKDOWN (DRILL-DOWN & ASSUMPTIONS)
         ==================================================================== */}
      {activeTab === "cost_breakdown" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Top High-Level Summary Card */}
          <div
            className="card"
            style={{
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%), var(--panel)",
              border: "1px solid var(--line-glow)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
              <div>
                <span style={{ fontSize: "0.76rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase" }}>
                  Estimated CapEx & Initial Capital Required
                </span>
                <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0" }}>
                  {currentModel.name}
                </h2>
                <p style={{ margin: 0, fontSize: "0.86rem", color: "var(--muted)" }}>
                  {currentModel.tagline} • Scale: <strong>{scaleMultiplier}x</strong>
                </p>
              </div>

              {/* Total Glowing Metric */}
              <div
                style={{
                  background: "var(--panel-solid)",
                  padding: "14px 22px",
                  borderRadius: 16,
                  border: "1px solid var(--line-glow)",
                  boxShadow: "var(--shadow-glow)",
                  textAlign: "right",
                }}
              >
                <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                  TOTAL PROJECT COST
                </span>
                <div style={{ fontSize: "2rem", fontWeight: 900, color: "var(--cyan)", lineHeight: 1.1, marginTop: 2 }}>
                  ₹{calculatedCostSummary.totalProjectCost.toLocaleString("en-IN")}
                </div>
                <span style={{ fontSize: "0.72rem", color: "var(--ok)", fontWeight: 700 }}>
                  ✓ Transparent & Drill-downable
                </span>
              </div>
            </div>

            {/* Quick Category Summary Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                gap: 10,
                marginTop: 18,
                paddingTop: 16,
                borderTop: "1px solid var(--line)",
              }}
            >
              <div style={{ background: "var(--panel-subtle)", padding: "10px 14px", borderRadius: 12 }}>
                <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>🌱 Land / Site</span>
                <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-heading)", marginTop: 2 }}>
                  ₹{calculatedCostSummary.landSiteSum.toLocaleString("en-IN")}
                </div>
              </div>

              <div style={{ background: "var(--panel-subtle)", padding: "10px 14px", borderRadius: 12 }}>
                <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>🏗️ Infrastructure</span>
                <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-heading)", marginTop: 2 }}>
                  ₹{calculatedCostSummary.infrastructureSum.toLocaleString("en-IN")}
                </div>
              </div>

              <div style={{ background: "var(--panel-subtle)", padding: "10px 14px", borderRadius: 12 }}>
                <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>⚙️ Equipment</span>
                <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-heading)", marginTop: 2 }}>
                  ₹{calculatedCostSummary.equipmentSum.toLocaleString("en-IN")}
                </div>
              </div>

              <div style={{ background: "var(--panel-subtle)", padding: "10px 14px", borderRadius: 12 }}>
                <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>📦 Raw Materials</span>
                <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-heading)", marginTop: 2 }}>
                  ₹{calculatedCostSummary.rawMaterialsSum.toLocaleString("en-IN")}
                </div>
              </div>

              <div style={{ background: "var(--panel-subtle)", padding: "10px 14px", borderRadius: 12 }}>
                <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>📋 Licenses & Setup</span>
                <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--text-heading)", marginTop: 2 }}>
                  ₹{calculatedCostSummary.complianceSum.toLocaleString("en-IN")}
                </div>
              </div>

              <div style={{ background: "var(--panel-subtle)", padding: "10px 14px", borderRadius: 12 }}>
                <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>👷 Working Capital</span>
                <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--cyan)", marginTop: 2 }}>
                  ₹{calculatedCostSummary.workingCapitalSum.toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Assumption Controls Bar */}
          <div className="card" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Sliders size={18} color="var(--cyan)" />
                <h3 style={{ margin: 0, fontSize: "1.02rem", fontWeight: 800, color: "var(--text-heading)" }}>
                  Interactive Cost Assumptions
                </h3>
              </div>
              <button
                type="button"
                onClick={handleResetAssumptions}
                className="btn-secondary-gloss"
                style={{ fontSize: "0.76rem", padding: "6px 12px", display: "flex", alignItems: "center", gap: 6 }}
              >
                <RefreshCw size={12} /> Reset to Defaults
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
              {/* Scale Slider */}
              <div style={{ background: "var(--panel-subtle)", padding: 12, borderRadius: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: 6 }}>
                  <span style={{ color: "var(--muted)", fontWeight: 700 }}>Production Scale:</span>
                  <strong style={{ color: "var(--cyan)" }}>{scaleMultiplier}x Capacity</strong>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={scaleMultiplier}
                  onChange={(e) => setScaleMultiplier(parseFloat(e.target.value))}
                  style={{ width: "100%", accentColor: "var(--cyan)", cursor: "pointer" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--muted)", marginTop: 4 }}>
                  <span>0.5x (Micro/Pilot)</span>
                  <span>1.0x (Standard)</span>
                  <span>2.5x (High-Capacity)</span>
                </div>
              </div>

              {/* Working Capital Buffer */}
              <div style={{ background: "var(--panel-subtle)", padding: 12, borderRadius: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: 6 }}>
                  <span style={{ color: "var(--muted)", fontWeight: 700 }}>Working Capital Runway:</span>
                  <strong style={{ color: "var(--electric-blue)" }}>{reserveMonths} Months</strong>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                  {[1, 3, 6].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setReserveMonths(m)}
                      className={`pill-option-btn ${reserveMonths === m ? "active" : ""}`}
                      style={{ fontSize: "0.76rem", padding: "6px" }}
                    >
                      {m} Month{m > 1 ? "s" : ""}
                    </button>
                  ))}
                </div>
              </div>

              {/* Land / Premises Status */}
              <div style={{ background: "var(--panel-subtle)", padding: 12, borderRadius: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: 6 }}>
                  <span style={{ color: "var(--muted)", fontWeight: 700 }}>Land / Premises Status:</span>
                  <strong style={{ color: "var(--ok)" }}>
                    {landStatus === "owned" ? "Self-Owned (₹0)" : landStatus === "leased" ? "Leased" : "Purchased"}
                  </strong>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                  {[
                    { id: "owned", label: "Owned" },
                    { id: "leased", label: "Leased" },
                    { id: "purchase", label: "Purchase" },
                  ].map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLandStatus(l.id)}
                      className={`pill-option-btn ${landStatus === l.id ? "active" : ""}`}
                      style={{ fontSize: "0.76rem", padding: "6px" }}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Drill-down Line Items Categories */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "var(--text-heading)" }}>
                Itemized CapEx & OpEx Drill-Down
              </h3>
              <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                Click any category to expand/collapse • Edit numbers directly
              </span>
            </div>

            {Object.entries(currentModel.costCategories).map(([catKey, category]) => {
              const isExpanded = Boolean(expandedCategories[catKey]);
              let categoryTotal = 0;
              if (catKey === "land_site") categoryTotal = calculatedCostSummary.landSiteSum;
              else if (catKey === "infrastructure") categoryTotal = calculatedCostSummary.infrastructureSum;
              else if (catKey === "equipment") categoryTotal = calculatedCostSummary.equipmentSum;
              else if (catKey === "raw_materials") categoryTotal = calculatedCostSummary.rawMaterialsSum;
              else if (catKey === "compliance") categoryTotal = calculatedCostSummary.complianceSum;
              else if (catKey === "working_capital") categoryTotal = calculatedCostSummary.workingCapitalSum;

              return (
                <div
                  key={catKey}
                  style={{
                    background: "var(--panel-solid)",
                    borderRadius: 14,
                    border: isExpanded ? "1px solid var(--line-glow)" : "1px solid var(--line)",
                    overflow: "hidden",
                    transition: "all 0.2s ease",
                  }}
                >
                  {/* Category Header */}
                  <div
                    onClick={() => toggleCategory(catKey)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "14px 18px",
                      cursor: "pointer",
                      background: isExpanded ? "var(--panel-subtle)" : "transparent",
                      borderBottom: isExpanded ? "1px solid var(--line)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: "1.3rem" }}>{category.icon}</span>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <strong style={{ fontSize: "0.95rem", color: "var(--text-heading)" }}>
                            {category.title}
                          </strong>
                          <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                            ({category.items.length} line items)
                          </span>
                        </div>
                        <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "var(--muted)" }}>
                          {category.description}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                          Subtotal
                        </span>
                        <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--cyan)" }}>
                          ₹{categoryTotal.toLocaleString("en-IN")}
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {/* Category Table Line Items */}
                  {isExpanded && (
                    <div style={{ padding: "0 18px 12px 18px" }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "2fr 1.5fr 1fr",
                          padding: "10px 0",
                          fontSize: "0.74rem",
                          fontWeight: 800,
                          color: "var(--muted)",
                          textTransform: "uppercase",
                          borderBottom: "1px solid var(--line)",
                        }}
                      >
                        <span>Line Item & Description</span>
                        <span>Unit Rate / Basis</span>
                        <span style={{ textAlign: "right" }}>Estimated Cost (₹)</span>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column" }}>
                        {category.items.map((item, idx) => {
                          const computedCost = calculatedCostSummary.getItemCost(catKey, idx, item.cost);
                          const isCustom = itemCosts[`${catKey}_${idx}`] !== undefined;

                          return (
                            <div
                              key={idx}
                              style={{
                                display: "grid",
                                gridTemplateColumns: "2fr 1.5fr 1fr",
                                padding: "10px 0",
                                borderBottom: idx === category.items.length - 1 ? "none" : "1px dashed var(--line)",
                                fontSize: "0.84rem",
                                alignItems: "center",
                              }}
                            >
                              <div>
                                <strong style={{ color: "var(--text-heading)" }}>{item.name}</strong>
                                {item.defaultAvailable && landStatus === "owned" && (
                                  <span
                                    style={{
                                      marginLeft: 8,
                                      fontSize: "0.7rem",
                                      color: "var(--ok)",
                                      background: "var(--ok-bg)",
                                      padding: "2px 6px",
                                      borderRadius: 4,
                                      fontWeight: 700,
                                    }}
                                  >
                                    ✓ Available
                                  </span>
                                )}
                              </div>

                              <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                                {item.unitRate}
                              </span>

                              <div style={{ textAlign: "right" }}>
                                <input
                                  type="number"
                                  value={computedCost}
                                  onChange={(e) => handleItemCostChange(catKey, idx, e.target.value)}
                                  style={{
                                    width: 110,
                                    padding: "4px 8px",
                                    borderRadius: 8,
                                    background: isCustom ? "rgba(99, 102, 241, 0.12)" : "var(--panel-subtle)",
                                    border: isCustom ? "1px solid var(--electric-blue)" : "1px solid var(--line)",
                                    color: "var(--text-heading)",
                                    fontSize: "0.84rem",
                                    fontWeight: 700,
                                    textAlign: "right",
                                    outline: "none",
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Bar to Move to Funding Gap */}
          <div className="wizard-actions-bar" style={{ marginTop: 10 }}>
            <button
              type="button"
              className="btn-secondary-gloss"
              onClick={() => setActiveTab("scenario_planner")}
            >
              <span>📊 View Scenario Comparison →</span>
            </button>

            <button
              type="button"
              className="btn-primary-gloss"
              onClick={() => setActiveTab("funding_gap")}
            >
              <span>Explore Funding Options & Gap Analysis →</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 2: PAGE 6.2 & 6.3 — FUNDING GAP & FINANCING OPTIONS
         ==================================================================== */}
      {activeTab === "funding_gap" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Funding Position Hero Card */}
          <div
            className="card"
            style={{
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(99, 102, 241, 0.10) 100%), var(--panel)",
              border: "1px solid var(--line-glow)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="pill" style={{ color: "var(--ok)", borderColor: "var(--ok-border)" }}>
                CapEx vs Available Capital
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>PAGE 6.2</span>
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 16px" }}>
              Your Funding Position
            </h2>

            {/* 3 Pillars: Total Cost vs Own Capital vs Funding Gap */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
              <div style={{ background: "var(--panel-solid)", padding: 16, borderRadius: 14, border: "1px solid var(--line)" }}>
                <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                  1. Total Project Requirement
                </span>
                <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--text-heading)", marginTop: 4 }}>
                  ₹{calculatedCostSummary.totalProjectCost.toLocaleString("en-IN")}
                </div>
                <span style={{ fontSize: "0.74rem", color: "var(--muted)" }}>
                  Calculated from CapEx + 3-Mo OpEx
                </span>
              </div>

              <div style={{ background: "var(--panel-solid)", padding: 16, borderRadius: 14, border: "1px solid var(--line)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--ok)", textTransform: "uppercase" }}>
                    2. Available Own Capital
                  </span>
                  <span style={{ fontSize: "0.72rem", color: "var(--ok)", fontWeight: 700 }}>
                    {Math.min(100, Math.round((ownCapital / calculatedCostSummary.totalProjectCost) * 100))}% Equity
                  </span>
                </div>
                <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--ok)", marginTop: 4 }}>
                  ₹{ownCapital.toLocaleString("en-IN")}
                </div>
                <div style={{ marginTop: 8 }}>
                  <label htmlFor="own-cap-slider" style={{ fontSize: "0.7rem", color: "var(--muted)" }}>Adjust your savings:</label>
                  <input
                    id="own-cap-slider"
                    type="range"
                    min="0"
                    max={calculatedCostSummary.totalProjectCost}
                    step="25000"
                    value={Math.min(ownCapital, calculatedCostSummary.totalProjectCost)}
                    onChange={(e) => setOwnCapital(Number(e.target.value))}
                    style={{ width: "100%", accentColor: "var(--ok)", cursor: "pointer" }}
                  />
                </div>
              </div>

              <div
                style={{
                  background: calculatedCostSummary.fundingGap > 0 ? "rgba(245, 158, 11, 0.08)" : "var(--ok-bg)",
                  padding: 16,
                  borderRadius: 14,
                  border: calculatedCostSummary.fundingGap > 0 ? "1px solid rgba(245, 158, 11, 0.4)" : "1px solid var(--ok)",
                  boxShadow: calculatedCostSummary.fundingGap > 0 ? "0 4px 16px rgba(245, 158, 11, 0.15)" : "none",
                }}
              >
                <span
                  style={{
                    fontSize: "0.74rem",
                    fontWeight: 800,
                    color: calculatedCostSummary.fundingGap > 0 ? "#f59e0b" : "var(--ok)",
                    textTransform: "uppercase",
                  }}
                >
                  3. FUNDING GAP
                </span>
                <div
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 900,
                    color: calculatedCostSummary.fundingGap > 0 ? "#f59e0b" : "var(--ok)",
                    marginTop: 4,
                  }}
                >
                  ₹{calculatedCostSummary.fundingGap.toLocaleString("en-IN")}
                </div>
                <span style={{ fontSize: "0.74rem", color: "var(--muted)" }}>
                  {calculatedCostSummary.fundingGap > 0
                    ? `Additional capital required to launch`
                    : `✓ 100% Self-Funded! No debt required.`}
                </span>
              </div>
            </div>

            {/* Visual Capital Stack Bar */}
            <div style={{ marginTop: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.76rem", color: "var(--muted)", marginBottom: 6 }}>
                <span>Capital Architecture Stack</span>
                <span>Total: 100% (₹{calculatedCostSummary.totalProjectCost.toLocaleString("en-IN")})</span>
              </div>

              <div
                style={{
                  height: 18,
                  borderRadius: 9,
                  background: "var(--panel-subtle)",
                  overflow: "hidden",
                  display: "flex",
                  border: "1px solid var(--line)",
                }}
              >
                {/* Own Equity */}
                <div
                  style={{
                    width: `${Math.min(100, (ownCapital / calculatedCostSummary.totalProjectCost) * 100)}%`,
                    background: "var(--ok)",
                    transition: "width 0.3s ease",
                  }}
                  title={`Own Equity: ₹${ownCapital.toLocaleString("en-IN")}`}
                />
                {/* Potential Subsidy */}
                <div
                  style={{
                    width: `${Math.min(
                      100 - (ownCapital / calculatedCostSummary.totalProjectCost) * 100,
                      (calculatedCostSummary.potentialSubsidy / calculatedCostSummary.totalProjectCost) * 100
                    )}%`,
                    background: "var(--cyan)",
                    transition: "width 0.3s ease",
                  }}
                  title={`Subsidy: ₹${calculatedCostSummary.potentialSubsidy.toLocaleString("en-IN")}`}
                />
                {/* Remaining Bank Loan / Gap */}
                <div
                  style={{
                    width: `${Math.max(
                      0,
                      100 -
                        (ownCapital / calculatedCostSummary.totalProjectCost) * 100 -
                        (calculatedCostSummary.potentialSubsidy / calculatedCostSummary.totalProjectCost) * 100
                    )}%`,
                    background: "#f59e0b",
                    transition: "width 0.3s ease",
                  }}
                  title={`Bank Loan / Debt Gap: ₹${calculatedCostSummary.gapAfterSubsidy.toLocaleString("en-IN")}`}
                />
              </div>

              <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: "0.74rem", color: "var(--muted)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--ok)" }} /> Own Equity (₹{ownCapital.toLocaleString("en-IN")})
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--cyan)" }} /> Govt Subsidy (₹{calculatedCostSummary.potentialSubsidy.toLocaleString("en-IN")})
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} /> Bank Debt / Remaining (₹{calculatedCostSummary.gapAfterSubsidy.toLocaleString("en-IN")})
                </span>
              </div>
            </div>
          </div>

          {/* PAGE 6.3 — 4 DECISION-SUPPORT FINANCING ROUTES */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="pill">Financing Options</span>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>PAGE 6.3</span>
            </div>
            <h3 style={{ margin: "4px 0 16px", fontSize: "1.3rem", fontWeight: 800, color: "var(--text-heading)" }}>
              How Can You Cover the Gap?
            </h3>
            <p style={{ margin: "0 0 16px 0", fontSize: "0.88rem", color: "var(--muted)" }}>
              EntreVision presents multiple financing routes so you make informed choices instead of blindly taking high-interest loans.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 }}>
              {/* ==============================================================
                  ROUTE 1: 🏦 BANK FINANCE & LOAN EMI SIMULATOR
                 ============================================================== */}
              <div
                className="card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  border: "1px solid var(--line)",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "1.4rem" }}>🏦</span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "var(--text-heading)" }}>
                          Bank Term Loan & MUDRA
                        </h4>
                        <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                          MUDRA Tarun / CGTMSE Collateral-Free / SBI Agri Loan
                        </span>
                      </div>
                    </div>
                    <span className="badge-verified" style={{ fontSize: "0.7rem" }}>
                      Debt Route
                    </span>
                  </div>

                  <p style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.5, margin: "0 0 14px 0" }}>
                    Suitable for funding capital machinery and shed infrastructure. Priority sector lending applies to Vidarbha citrus agro-enterprises.
                  </p>

                  {/* Interactive EMI Simulator */}
                  <div style={{ background: "var(--panel-subtle)", padding: 14, borderRadius: 12, marginBottom: 14 }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--electric-blue)", textTransform: "uppercase", marginBottom: 8 }}>
                      Interactive EMI Simulator
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: 4 }}>
                      <span style={{ color: "var(--muted)" }}>Interest Rate:</span>
                      <strong>{loanInterestRate}% p.a.</strong>
                    </div>
                    <input
                      type="range"
                      min="7.0"
                      max="13.0"
                      step="0.25"
                      value={loanInterestRate}
                      onChange={(e) => setLoanInterestRate(parseFloat(e.target.value))}
                      style={{ width: "100%", accentColor: "var(--electric-blue)", marginBottom: 10 }}
                    />

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: 4 }}>
                      <span style={{ color: "var(--muted)" }}>Repayment Tenure:</span>
                      <strong>{loanTenureYears} Years ({loanTenureYears * 12} EMIs)</strong>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="7"
                      step="1"
                      value={loanTenureYears}
                      onChange={(e) => setLoanTenureYears(parseInt(e.target.value))}
                      style={{ width: "100%", accentColor: "var(--electric-blue)" }}
                    />

                    {/* Calculated EMI Display */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 8,
                        marginTop: 12,
                        paddingTop: 10,
                        borderTop: "1px dashed var(--line)",
                      }}
                    >
                      <div>
                        <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>Monthly EMI:</span>
                        <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-heading)" }}>
                          ₹{bankEmiDetails.monthlyEmi.toLocaleString("en-IN")} / mo
                        </div>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>Total Repayment:</span>
                        <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--muted)" }}>
                          ₹{bankEmiDetails.totalPayment.toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => setIsDPRModalOpen(true)}
                    className="btn-primary-gloss"
                    style={{ flex: 1, fontSize: "0.82rem", padding: "10px", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, background: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)" }}
                  >
                    🏛️ Generate Official Bank DPR (PDF)
                  </button>
                </div>
              </div>

              {/* ==============================================================
                  ROUTE 2: 🏛️ GOVERNMENT ASSISTANCE & CAPITAL SUBSIDIES
                 ============================================================== */}
              <div
                className="card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  border: "1px solid var(--line)",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "1.4rem" }}>🏛️</span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "var(--text-heading)" }}>
                          Government Schemes & Grants
                        </h4>
                        <span style={{ fontSize: "0.72rem", color: "var(--ok)", fontWeight: 700 }}>
                          Non-repayable Capital Assistance
                        </span>
                      </div>
                    </div>
                    <span className="badge-verified" style={{ fontSize: "0.7rem", background: "var(--ok-bg)", color: "var(--ok)" }}>
                      Grant
                    </span>
                  </div>

                  <p style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.5, margin: "0 0 14px 0" }}>
                    Primary matching scheme for this business archetype in Nagpur/Vidarbha citrus cluster:
                  </p>

                  <div style={{ background: "rgba(16, 185, 129, 0.08)", padding: 14, borderRadius: 12, border: "1px solid var(--ok-border)", marginBottom: 14 }}>
                    <div style={{ fontWeight: 800, fontSize: "0.92rem", color: "var(--text-heading)", marginBottom: 4 }}>
                      {currentModel.subsidyScheme}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--muted)" }}>
                      <span>Subsidy Rate: <strong>{currentModel.subsidyRate * 100}%</strong></span>
                      <span>Max Cap: <strong>₹{(currentModel.maxSubsidyLimit / 100000).toFixed(1)} Lakhs</strong></span>
                    </div>

                    <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px dashed var(--ok-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "0.74rem", color: "var(--muted)" }}>Estimated Grant Amount:</span>
                      <strong style={{ fontSize: "1.15rem", color: "var(--ok)" }}>
                        ₹{calculatedCostSummary.potentialSubsidy.toLocaleString("en-IN")}
                      </strong>
                    </div>
                  </div>

                  <div style={{ fontSize: "0.76rem", color: "var(--muted)", lineHeight: 1.4 }}>
                    • Linked to bank loan account after commercial commissioning.<br />
                    • Requires Aadhaar, Udyam MSME, and FSSAI / Nursery Board registration.
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <Link
                    to="/schemes"
                    className="btn-primary-gloss"
                    style={{ flex: 1, fontSize: "0.78rem", padding: "8px", textDecoration: "none", textAlign: "center" }}
                  >
                    🏛️ Check Detailed Eligibility →
                  </Link>
                </div>
              </div>

              {/* ==============================================================
                  ROUTE 3: 🤝 BUSINESS PARTNER / CO-FOUNDER COLLABORATION
                 ============================================================== */}
              <div
                className="card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  border: "1px solid var(--line)",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "1.4rem" }}>🤝</span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "var(--text-heading)" }}>
                          Partner & Co-Founder Equity
                        </h4>
                        <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                          Resource & Capital Pooling
                        </span>
                      </div>
                    </div>
                    <span className="badge-verified" style={{ fontSize: "0.7rem" }}>
                      Equity / Resource
                    </span>
                  </div>

                  <p style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.5, margin: "0 0 14px 0" }}>
                    Bring in a co-founder with complementary physical resources (e.g. land, processing shed) or matching capital to avoid bank debt.
                  </p>

                  <div style={{ background: "var(--panel-subtle)", padding: 14, borderRadius: 12, marginBottom: 14 }}>
                    <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--violet)", textTransform: "uppercase" }}>
                      Ecosystem Match Opportunities
                    </span>
                    <ul style={{ margin: "8px 0 0 16px", padding: 0, fontSize: "0.78rem", color: "var(--muted)", lineHeight: 1.5 }}>
                      <li>Partner with local FPO for guaranteed raw citrus supply.</li>
                      <li>Find a partner with unutilized 1-acre farmland in Katol.</li>
                      <li>Share cold chain storage with Ras Frozen / Kailasya Packhouse.</li>
                    </ul>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <Link
                    to="/collaboration"
                    className="btn-secondary-gloss"
                    style={{ flex: 1, fontSize: "0.78rem", padding: "8px", textDecoration: "none", textAlign: "center" }}
                  >
                    🤝 Find Co-Founders & Partners →
                  </Link>
                </div>
              </div>

              {/* ==============================================================
                  ROUTE 4: 🔄 PHASED SETUP / BOOTSTRAP STRATEGY
                 ============================================================== */}
              <div
                className="card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  border: "1px solid var(--line)",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: "1.4rem" }}>🔄</span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "var(--text-heading)" }}>
                          Phased Setup & Bootstrap
                        </h4>
                        <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                          Start Smaller, Expand from Profits
                        </span>
                      </div>
                    </div>
                    <span className="badge-verified" style={{ fontSize: "0.7rem" }}>
                      Zero Debt
                    </span>
                  </div>

                  <p style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.5, margin: "0 0 14px 0" }}>
                    If your available capital is below the standard requirement, start with the <strong>Minimum Viable Setup (Pilot)</strong> and scale organically.
                  </p>

                  <div style={{ background: "var(--panel-subtle)", padding: 14, borderRadius: 12, marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: 4 }}>
                      <span style={{ color: "var(--muted)" }}>Minimum Pilot CapEx:</span>
                      <strong style={{ color: "var(--ok)" }}>
                        ₹{currentModel.scenarios.minimum.investment.toLocaleString("en-IN")}
                      </strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem" }}>
                      <span style={{ color: "var(--muted)" }}>Projected Break-even:</span>
                      <strong>{currentModel.scenarios.minimum.breakevenMonths} Months</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => handleApplyScenario("minimum")}
                    className="pill-option-btn active"
                    style={{ flex: 1, fontSize: "0.78rem", padding: "8px" }}
                  >
                    🔄 Switch to Minimum Setup Scenario →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Navigation Bar */}
          <div className="wizard-actions-bar">
            <button
              type="button"
              className="btn-secondary-gloss"
              onClick={() => setActiveTab("cost_breakdown")}
            >
              ← Back to Cost Breakdown
            </button>

            <button
              type="button"
              className="btn-primary-gloss"
              onClick={() => setActiveTab("scenario_planner")}
            >
              <span>Explore Financial Scenarios (Min / Std / Exp) →</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 3: PAGE 6.4 — FINANCIAL SCENARIO PLANNER (MIN / STD / EXP)
         ==================================================================== */}
      {activeTab === "scenario_planner" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Top Intro Card */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="pill">Scenario Planner</span>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>PAGE 6.4</span>
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 6px" }}>
              Can I start smaller and expand later?
            </h2>
            <p className="muted" style={{ margin: 0, fontSize: "0.9rem" }}>
              Compare 3 operational configurations for <strong>{currentModel.name}</strong>. Choose the path that matches your current risk tolerance and available equity.
            </p>
          </div>

          {/* 3 Interactive Scenario Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
            {/* SCENARIO 1: MINIMUM */}
            {(() => {
              const sc = currentModel.scenarios.minimum;
              const isSelected = activeScenarioKey === "minimum";
              return (
                <div
                  className="card"
                  style={{
                    border: isSelected ? "2px solid var(--ok)" : "1px solid var(--line)",
                    background: isSelected ? "rgba(16, 185, 129, 0.05)" : "var(--panel)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span className="tag" style={{ background: "var(--ok-bg)", color: "var(--ok)", fontWeight: 800 }}>
                        {sc.tag}
                      </span>
                      {isSelected && (
                        <span style={{ fontSize: "0.72rem", color: "var(--ok)", fontWeight: 800 }}>
                          ● ACTIVE SCENARIO
                        </span>
                      )}
                    </div>

                    <h3 style={{ margin: "0 0 4px", fontSize: "1.2rem", fontWeight: 800, color: "var(--text-heading)" }}>
                      {sc.name}
                    </h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.4, margin: "0 0 14px 0" }}>
                      {sc.description}
                    </p>

                    <div style={{ background: "var(--panel-subtle)", padding: 14, borderRadius: 12, marginBottom: 14 }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                        Initial Capital Needed
                      </span>
                      <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--ok)", marginTop: 2 }}>
                        ₹{sc.investment.toLocaleString("en-IN")}
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "var(--muted)", marginTop: 4 }}>
                        Founder Equity: <strong>₹{sc.ownEquity.toLocaleString("en-IN")}</strong> • Subsidy: <strong>₹{sc.subsidy.toLocaleString("en-IN")}</strong>
                      </div>
                    </div>

                    {/* Metric Highlights */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.8rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 4 }}>
                        <span className="muted">⚙️ Equipment Level:</span>
                        <strong style={{ textAlign: "right" }}>{sc.equipment}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 4 }}>
                        <span className="muted">📦 Production Capacity:</span>
                        <strong>{sc.capacity}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 4 }}>
                        <span className="muted">🌱 Workspace Required:</span>
                        <strong>{sc.workspace}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 4 }}>
                        <span className="muted">👷 Team Size:</span>
                        <strong>{sc.workers}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 4 }}>
                        <span className="muted">💵 Monthly OpEx:</span>
                        <strong>₹{sc.monthlyOpex.toLocaleString("en-IN")}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 4 }}>
                        <span className="muted">📈 Net Margin / ROI:</span>
                        <strong style={{ color: "var(--ok)" }}>{sc.netMargin}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span className="muted">⏱️ Break-even Horizon:</span>
                        <strong>{sc.breakevenMonths} Months</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplyScenario("minimum")}
                    className={`pill-option-btn ${isSelected ? "active" : ""}`}
                    style={{ width: "100%", marginTop: 18, padding: "10px", fontSize: "0.84rem", fontWeight: 800 }}
                  >
                    {isSelected ? "✓ Applied to Plan" : "Apply Minimum Setup"}
                  </button>
                </div>
              );
            })()}

            {/* SCENARIO 2: STANDARD (RECOMMENDED) */}
            {(() => {
              const sc = currentModel.scenarios.standard;
              const isSelected = activeScenarioKey === "standard";
              return (
                <div
                  className="card"
                  style={{
                    border: isSelected ? "2px solid var(--cyan)" : "1px solid var(--line-glow)",
                    background: isSelected ? "rgba(6, 182, 212, 0.06)" : "var(--panel)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                    boxShadow: "var(--shadow-card)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: -12,
                      right: 20,
                      background: "linear-gradient(135deg, var(--electric-blue), var(--cyan))",
                      color: "#fff",
                      fontSize: "0.7rem",
                      fontWeight: 900,
                      padding: "3px 12px",
                      borderRadius: 10,
                      letterSpacing: "0.5px",
                    }}
                  >
                    RECOMMENDED
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span className="tag" style={{ background: "rgba(6, 182, 212, 0.15)", color: "var(--cyan)", fontWeight: 800 }}>
                        {sc.tag}
                      </span>
                      {isSelected && (
                        <span style={{ fontSize: "0.72rem", color: "var(--cyan)", fontWeight: 800 }}>
                          ● ACTIVE SCENARIO
                        </span>
                      )}
                    </div>

                    <h3 style={{ margin: "0 0 4px", fontSize: "1.2rem", fontWeight: 800, color: "var(--text-heading)" }}>
                      {sc.name}
                    </h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.4, margin: "0 0 14px 0" }}>
                      {sc.description}
                    </p>

                    <div style={{ background: "var(--panel-subtle)", padding: 14, borderRadius: 12, marginBottom: 14 }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                        Initial Capital Needed
                      </span>
                      <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--cyan)", marginTop: 2 }}>
                        ₹{sc.investment.toLocaleString("en-IN")}
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "var(--muted)", marginTop: 4 }}>
                        Founder Equity: <strong>₹{sc.ownEquity.toLocaleString("en-IN")}</strong> • Subsidy: <strong>₹{sc.subsidy.toLocaleString("en-IN")}</strong>
                      </div>
                    </div>

                    {/* Metric Highlights */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.8rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 4 }}>
                        <span className="muted">⚙️ Equipment Level:</span>
                        <strong style={{ textAlign: "right" }}>{sc.equipment}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 4 }}>
                        <span className="muted">📦 Production Capacity:</span>
                        <strong>{sc.capacity}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 4 }}>
                        <span className="muted">🌱 Workspace Required:</span>
                        <strong>{sc.workspace}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 4 }}>
                        <span className="muted">👷 Team Size:</span>
                        <strong>{sc.workers}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 4 }}>
                        <span className="muted">💵 Monthly OpEx:</span>
                        <strong>₹{sc.monthlyOpex.toLocaleString("en-IN")}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 4 }}>
                        <span className="muted">📈 Net Margin / ROI:</span>
                        <strong style={{ color: "var(--ok)" }}>{sc.netMargin}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span className="muted">⏱️ Break-even Horizon:</span>
                        <strong>{sc.breakevenMonths} Months</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplyScenario("standard")}
                    className={`btn-primary-gloss ${isSelected ? "active" : ""}`}
                    style={{ width: "100%", marginTop: 18, padding: "10px", fontSize: "0.84rem", fontWeight: 800, justifyContent: "center" }}
                  >
                    {isSelected ? "✓ Applied to Plan" : "Apply Standard Setup"}
                  </button>
                </div>
              );
            })()}

            {/* SCENARIO 3: EXPANDED */}
            {(() => {
              const sc = currentModel.scenarios.expanded;
              const isSelected = activeScenarioKey === "expanded";
              return (
                <div
                  className="card"
                  style={{
                    border: isSelected ? "2px solid var(--violet)" : "1px solid var(--line)",
                    background: isSelected ? "rgba(168, 85, 247, 0.05)" : "var(--panel)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span className="tag" style={{ background: "rgba(168, 85, 247, 0.15)", color: "var(--violet)", fontWeight: 800 }}>
                        {sc.tag}
                      </span>
                      {isSelected && (
                        <span style={{ fontSize: "0.72rem", color: "var(--violet)", fontWeight: 800 }}>
                          ● ACTIVE SCENARIO
                        </span>
                      )}
                    </div>

                    <h3 style={{ margin: "0 0 4px", fontSize: "1.2rem", fontWeight: 800, color: "var(--text-heading)" }}>
                      {sc.name}
                    </h3>
                    <p style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.4, margin: "0 0 14px 0" }}>
                      {sc.description}
                    </p>

                    <div style={{ background: "var(--panel-subtle)", padding: 14, borderRadius: 12, marginBottom: 14 }}>
                      <span style={{ fontSize: "0.72rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 700 }}>
                        Initial Capital Needed
                      </span>
                      <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "var(--violet)", marginTop: 2 }}>
                        ₹{sc.investment.toLocaleString("en-IN")}
                      </div>
                      <div style={{ fontSize: "0.74rem", color: "var(--muted)", marginTop: 4 }}>
                        Founder Equity: <strong>₹{sc.ownEquity.toLocaleString("en-IN")}</strong> • Subsidy: <strong>₹{sc.subsidy.toLocaleString("en-IN")}</strong>
                      </div>
                    </div>

                    {/* Metric Highlights */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.8rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 4 }}>
                        <span className="muted">⚙️ Equipment Level:</span>
                        <strong style={{ textAlign: "right" }}>{sc.equipment}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 4 }}>
                        <span className="muted">📦 Production Capacity:</span>
                        <strong>{sc.capacity}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 4 }}>
                        <span className="muted">🌱 Workspace Required:</span>
                        <strong>{sc.workspace}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 4 }}>
                        <span className="muted">👷 Team Size:</span>
                        <strong>{sc.workers}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 4 }}>
                        <span className="muted">💵 Monthly OpEx:</span>
                        <strong>₹{sc.monthlyOpex.toLocaleString("en-IN")}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px dashed var(--line)", paddingBottom: 4 }}>
                        <span className="muted">📈 Net Margin / ROI:</span>
                        <strong style={{ color: "var(--ok)" }}>{sc.netMargin}</strong>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span className="muted">⏱️ Break-even Horizon:</span>
                        <strong>{sc.breakevenMonths} Months</strong>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApplyScenario("expanded")}
                    className={`pill-option-btn ${isSelected ? "active" : ""}`}
                    style={{ width: "100%", marginTop: 18, padding: "10px", fontSize: "0.84rem", fontWeight: 800 }}
                  >
                    {isSelected ? "✓ Applied to Plan" : "Apply Expanded Setup"}
                  </button>
                </div>
              );
            })()}
          </div>

          {/* Direct Comparative Matrix Table */}
          <div className="card" style={{ marginTop: 10 }}>
            <h3 style={{ margin: "0 0 14px", fontSize: "1.1rem", fontWeight: 800, color: "var(--text-heading)" }}>
              Side-by-Side Configuration Matrix
            </h3>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
                <thead>
                  <tr style={{ background: "var(--panel-subtle)", textAlign: "left" }}>
                    <th style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>Attribute</th>
                    <th style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)", color: "var(--ok)" }}>Minimum Setup</th>
                    <th style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)", color: "var(--cyan)" }}>Standard Setup</th>
                    <th style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)", color: "var(--violet)" }}>Expanded Setup</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)", fontWeight: 700 }}>Total CapEx</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)", fontWeight: 800 }}>₹{currentModel.scenarios.minimum.investment.toLocaleString("en-IN")}</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)", fontWeight: 800 }}>₹{currentModel.scenarios.standard.investment.toLocaleString("en-IN")}</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)", fontWeight: 800 }}>₹{currentModel.scenarios.expanded.investment.toLocaleString("en-IN")}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)", fontWeight: 700 }}>Min Founder Equity</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)" }}>₹{currentModel.scenarios.minimum.ownEquity.toLocaleString("en-IN")}</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)" }}>₹{currentModel.scenarios.standard.ownEquity.toLocaleString("en-IN")}</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)" }}>₹{currentModel.scenarios.expanded.ownEquity.toLocaleString("en-IN")}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)", fontWeight: 700 }}>Machinery Tech</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)" }}>Basic / Manual</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)" }}>Semi-Automated</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)" }}>Fully Automated Line</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)", fontWeight: 700 }}>Target Market</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)" }}>Local Farmers & Weekly Mandis</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)" }}>FPO Contracts & District Retail</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)" }}>Interstate Supply & Corporate Buyers</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Footer */}
          <div className="wizard-actions-bar">
            <button
              type="button"
              className="btn-secondary-gloss"
              onClick={() => setActiveTab("funding_gap")}
            >
              ← Back to Funding Gap Analysis
            </button>

            <Link
              to="/roadmap"
              className="btn-primary-gloss"
              style={{ textDecoration: "none" }}
            >
              <span>Proceed to Implementation Roadmap →</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      )}
      {/* Bank-Grade Detailed Project Report Modal */}
      <BankGradeDPRModal
        isOpen={isDPRModalOpen}
        onClose={() => setIsDPRModalOpen(false)}
        opportunity={currentModel}
        userProfile={{ name: user?.full_name || "Bhoomika Vaishya" }}
        capexBreakdown={[
          { name: "Core Production Machinery & Processing Tools", cost: calculatedCostSummary.equipmentSum },
          { name: "Facility Structures & Utility Installations", cost: calculatedCostSummary.infrastructureSum },
          { name: "Initial Raw Materials & Packaging Consumables Buffer", cost: calculatedCostSummary.rawMaterialsSum },
          { name: "Site Preparation & Hygienic Washdown Setup", cost: calculatedCostSummary.landSiteSum },
          { name: "Statutory Food Licenses, Testing Assays & MSME Udyam", cost: calculatedCostSummary.complianceSum },
          { name: "3-Month Operating Reserve & Working Capital", cost: calculatedCostSummary.workingCapitalSum },
        ].filter(i => i.cost > 0)}
        activeLocation={currentModel.defaultLocation}
        ownEquity={ownCapital}
        totalCost={calculatedCostSummary.totalProjectCost}
        subsidyAmount={calculatedCostSummary.potentialSubsidy}
        bankLoan={calculatedCostSummary.fundingGap}
      />
    </div>
  );
}
