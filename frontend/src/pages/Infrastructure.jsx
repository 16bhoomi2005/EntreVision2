import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  Search,
  Sparkles,
  Store,
  Snowflake,
  FlaskConical,
  Building2,
  Truck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Layers,
  ChevronRight,
  Scale,
  Compass,
  FileText,
  ExternalLink,
  Check,
  TrendingUp,
  Info,
} from "lucide-react";

export const LOCATION_ECOSYSTEM_DATA = {
  Katol: {
    name: "Katol",
    district: "Nagpur District (West)",
    taluka: "Katol Taluka",
    coordinates: "21.27° N, 78.58° E",
    tagline: "Citrus Production, Certified Nursery & Agri-Processing Epicenter",
    summary: "High-density citrus orchards, active APMC sub-mandi, and ICAR-CCRI regional nursery demonstration plots.",
    rawMaterials: { status: "Available", desc: "Highest farm-gate mandarin crop density; 40+ citrus-growing villages within 15 km" },
    markets: { status: "Available", desc: "Katol APMC Sub-Market Yard with daily fruit auctions & direct trader aggregation" },
    transport: { status: "Available", desc: "NH-353J highway freight connectivity linking directly to Nagpur & Amravati" },
    processing: { status: "Nearby facilities", desc: "Katol Agro-Industrial Cluster & localized mini-processing units" },
    storage: { status: "Available", desc: "Katol Farm-Gate Pre-Cooling & Chilling Units (350 MT capacity)" },
    research: { status: "Regional support", desc: "Regional Citrus Nursery & ICAR-CCRI Outreach Demonstration Centre" },
    buildableTypes: ["🍊 Cultivation", "🪴 Nursery", "🥤 Beverage Processing", "📦 Packhouse & Waxing", "❄️ Cold Storage", "💻 Agritech"],
    opportunities: [
      {
        id: "OPP_KAT_01",
        name: "Disease-Free Certified Citrus Nursery",
        category: "Agriculture / Nursery",
        whyLocation: "Katol is the premier regional propagation belt with direct access to ICAR-CCRI budwood demonstration plots and nursery certification.",
        investment: "₹4.5 – 8 Lakh",
        suitabilityScore: 94,
      },
      {
        id: "OPP_KAT_02",
        name: "Citrus Ready-to-Serve (RTS) Juice & Squash Unit",
        category: "Food Processing",
        whyLocation: "Direct farm-gate crate procurement with 40% lower transit spoilage and local agro-power infrastructure.",
        investment: "₹6.5 – 15 Lakh",
        suitabilityScore: 90,
      },
      {
        id: "OPP_KAT_03",
        name: "Mechanized Fruit Washing, Sorting & Waxing Line",
        category: "Agro Services",
        whyLocation: "Heavy seasonal demand from local orchardists seeking shellac waxing before inter-state transport.",
        investment: "₹12 – 24 Lakh",
        suitabilityScore: 88,
      },
    ],
  },

  "Kalamna APMC": {
    name: "Kalamna APMC",
    district: "Nagpur Urban / Central",
    taluka: "Nagpur City",
    coordinates: "21.17° N, 79.14° E",
    tagline: "Asia's Top Wholesale Fruit & Vegetable Trading Terminal",
    summary: "Highest volume fruit trading terminal with multi-chamber cold storage and pan-India truck dispatch network.",
    rawMaterials: { status: "Transit Hub", desc: "Central arrival point for 250,000+ MT of citrus per peak season" },
    markets: { status: "Tier-1 Mandi", desc: "Asia's largest orange trading yard with 150+ licensed commission agents" },
    transport: { status: "Direct Freight", desc: "National Highway freight crossing & dedicated rail cargo loading sidings" },
    processing: { status: "Nearby Logistics", desc: "Central packaging, wholesale sorting, and urban distribution" },
    storage: { status: "Extensive (5,000 MT)", desc: "Kailasya Agro Industries & Multi-Chamber Controlled Atmosphere Cold Rooms" },
    research: { status: "Certification Lab", desc: "APEDA Export Inspection & Agmark Quality Certification Labs" },
    buildableTypes: ["💰 Trading & Brokerage", "❄️ Commercial Cold Chain", "📦 Export Packaging", "🚚 Freight Logistics"],
    opportunities: [
      {
        id: "OPP_KAL_01",
        name: "Wholesale APMC Citrus Trading & Inter-State Aggregation",
        category: "Trading & Logistics",
        whyLocation: "Instant access to pan-India commission agents, institutional buyers, and nightly departures to Delhi & Mumbai.",
        investment: "₹3.0 – 10 Lakh",
        suitabilityScore: 95,
      },
      {
        id: "OPP_KAL_02",
        name: "Commercial Palletized Cold Storage & Ripening Service",
        category: "Storage & Logistics",
        whyLocation: "Continuous high occupancy from mandi merchants seeking multi-chamber controlled atmosphere storage.",
        investment: "₹25 – 60 Lakh",
        suitabilityScore: 89,
      },
    ],
  },

  "Butibori MIDC": {
    name: "Butibori MIDC",
    district: "Nagpur District (South)",
    taluka: "Nagpur Rural / Butibori",
    coordinates: "20.93° N, 78.98° E",
    tagline: "5-Star Mega Agro-Industrial Zone & Food Park",
    summary: "Large-scale commercial processing zone with continuous high-voltage power, industrial zoning, and export logistics.",
    rawMaterials: { status: "Bulk Transport", desc: "Direct highway supply from surrounding Nagpur & Wardha orchards" },
    markets: { status: "National FMCG", desc: "Direct freight access to national retail chains & institutional brand off-takers" },
    transport: { status: "NH-44 Corridor", desc: "North-South National Highway corridor & multimodal freight" },
    processing: { status: "5-Star MIDC Zone", desc: "Ready industrial plots with effluent treatment plants (ETP) and 3-phase power" },
    storage: { status: "IQF Frozen (3,500 MT)", desc: "Ras Frozen Foods blast freezing (-18°C) & commercial cold store units" },
    research: { status: "Central Testing", desc: "Central Food Technological Testing & Export Compliance Facilities" },
    buildableTypes: ["🏭 Commercial Bottling", "🧪 Peel Oil Extraction", "🥫 Marmalade & Puree", "❄️ IQF Freezing"],
    opportunities: [
      {
        id: "OPP_BUT_01",
        name: "Cold-Pressed Citrus Peel Essential Oil Plant",
        category: "By-Products / Pharma",
        whyLocation: "Industrial zoning, high power availability, and hazardous solvent handling clearance for d-limonene refining.",
        investment: "₹15 – 35 Lakh",
        suitabilityScore: 92,
      },
      {
        id: "OPP_BUT_02",
        name: "Large-Scale Pasteurized Juice & Concentrate Bottling",
        category: "Food Processing",
        whyLocation: "Ideal for heavy industrial capex, high-speed automated bottling lines, and national highway dispatch.",
        investment: "₹20 – 50 Lakh",
        suitabilityScore: 90,
      },
    ],
  },

  "Warud-Morshi": {
    name: "Warud-Morshi",
    district: "Amravati District (Nagpur Border)",
    taluka: "Warud / Morshi",
    coordinates: "21.46° N, 78.26° E",
    tagline: "California of India — Premier Citrus Harvest & Waxing Hub",
    summary: "Richest mandarin production belt in Central India with dedicated waxing packhouses and direct truck dispatches.",
    rawMaterials: { status: "Premier Yield", desc: "Highest yield per hectare of premium export-grade Nagpur mandarins" },
    markets: { status: "High Volume Mandi", desc: "Warud APMC Mandi with high daily cash volume during harvest (Oct–March)" },
    transport: { status: "State Highway", desc: "SH-243 Highway connecting Amravati, Nagpur, and MP borders" },
    processing: { status: "Farm-Gate Belt", desc: "On-site waxing lines, pulping units, and farmer producer company hubs" },
    storage: { status: "Packhouses (2,000 MT)", desc: "Warud Regional Packhouse & Shellac Waxing Line staging yard" },
    research: { status: "Horticulture Plots", desc: "Horticulture Training Institute & CCRI demonstration field plots" },
    buildableTypes: ["🍊 Commercial Orchard", "📦 Shellac Waxing Line", "🤝 FPO Aggregation", "🍂 Bio-Compost"],
    opportunities: [
      {
        id: "OPP_WAR_01",
        name: "Citrus Shellac Waxing & Export Packhouse",
        category: "Agro Services",
        whyLocation: "Enormous harvest volume right at the farm gate seeking shellac treatment to reach Delhi & Kolkata without decay.",
        investment: "₹10 – 22 Lakh",
        suitabilityScore: 96,
      },
      {
        id: "OPP_WAR_02",
        name: "Orchard Bio-Compost & Microbial Soil Conditioner",
        category: "By-Products",
        whyLocation: "Abundant farm organic biomass and immense local customer base of 5,000+ commercial orchardists.",
        investment: "₹3.0 – 6 Lakh",
        suitabilityScore: 89,
      },
    ],
  },

  Narkhed: {
    name: "Narkhed",
    district: "Nagpur District (North-West)",
    taluka: "Narkhed Taluka",
    coordinates: "21.50° N, 78.53° E",
    tagline: "Rail-Linked Fruit Transit & Aggregation Node",
    summary: "Strategic railway junction with direct parcel cargo rakes for cost-efficient long-distance fruit transport.",
    rawMaterials: { status: "High Density", desc: "Bordering Warud and Katol orchards with heavy farm-gate supply" },
    markets: { status: "Local Mandi", desc: "Narkhed APMC Fruit Market with direct rail siding loading" },
    transport: { status: "Rail Siding", desc: "Junction Railway Station with dedicated fruit rake dispatch facilities" },
    processing: { status: "Transit Processing", desc: "Pre-cooling and staging units for long-haul rail shipments" },
    storage: { status: "Cold Staging (1,200 MT)", desc: "Narkhed Cold Chain Staging Yard & Rail Pre-cooling" },
    research: { status: "Surveillance Cell", desc: "Citrus Disease Surveillance Cell (CCRI Network)" },
    buildableTypes: ["🚆 Rail Freight Trading", "❄️ Pre-Cooling Staging", "📦 Corrugated Box Making", "🌱 Nursery"],
    opportunities: [
      {
        id: "OPP_NAR_01",
        name: "Rail-Linked Bulk Fruit Trading to North India",
        category: "Trading & Logistics",
        whyLocation: "Direct parcel train booking reduces transport cost by 35% compared to road trucks to Delhi & Bihar.",
        investment: "₹4.0 – 12 Lakh",
        suitabilityScore: 91,
      },
    ],
  },

  Kalmeshwar: {
    name: "Kalmeshwar",
    district: "Nagpur District (Central-West)",
    taluka: "Kalmeshwar",
    coordinates: "21.23° N, 78.91° E",
    tagline: "MIDC Agro Cluster & Soil Testing Hub",
    summary: "Ideal midpoint between rural orange orchards and Nagpur city consumer market with lower industrial rentals.",
    rawMaterials: { status: "Proximity Supply", desc: "20 minutes from Katol and Saoner citrus orchards" },
    markets: { status: "Near-City Retail", desc: "Kalmeshwar APMC & direct 22 km transit into Nagpur city retail" },
    transport: { status: "NH-353J Corridor", desc: "Four-lane highway link with swift transport to Nagpur central" },
    processing: { status: "MIDC Agro Zone", desc: "MIDC Industrial Area with ready agro power connections" },
    storage: { status: "Cold Rooms (800 MT)", desc: "Kalmeshwar Multi-Commodity Cold Storage & Pre-Cooling" },
    research: { status: "Testing Lab", desc: "MIDC Agro Testing & Soil Chemistry Laboratory" },
    buildableTypes: ["🥤 Micro Juice Line", "🚜 Machinery Rental", "🔬 Soil & Leaf Lab", "📦 Pack Shed"],
    opportunities: [
      {
        id: "OPP_KALM_01",
        name: "Micro Citrus Juice & Carbonated Beverage Unit",
        category: "Food Processing",
        whyLocation: "Optimal balance between agricultural raw material supply and rapid delivery to Nagpur supermarkets.",
        investment: "₹5.5 – 14 Lakh",
        suitabilityScore: 91,
      },
    ],
  },

  "Hingna MIDC": {
    name: "Hingna MIDC",
    district: "Nagpur District (South-West)",
    taluka: "Hingna",
    coordinates: "21.09° N, 78.96° E",
    tagline: "MSME Incubation & Urban Consumer FMCG",
    summary: "Fast delivery to Nagpur city retail, VNIT MSME incubation support, and light food-grade processing.",
    rawMaterials: { status: "Urban Logistics", desc: "Daily truck arrivals from rural Nagpur and Wardha" },
    markets: { status: "Nagpur Metro FMCG", desc: "Supermarkets, hotels, institutional caterers, and direct retail" },
    transport: { status: "Metro & Highway", desc: "Integrated Nagpur metro network & Outer Ring Road" },
    processing: { status: "Five Star MSME Area", desc: "Light industrial units, food labs, and machine fabricators" },
    storage: { status: "Cold Store (733 MT)", desc: "B.K. Spices & Flowers Cold Storage" },
    research: { status: "VNIT Incubation", desc: "VNIT & MSME Technology Incubation Centre" },
    buildableTypes: ["🥤 RTD Bottled Juice", "🥫 Boutique Jams", "💄 Peel Cosmetics", "💻 Agritech"],
    opportunities: [
      {
        id: "OPP_HIN_01",
        name: "Ready-to-Drink Retail Bottled Juices & Squashes",
        category: "Food Processing",
        whyLocation: "Doorstep access to 3 million urban consumers in Nagpur metro with lower distribution friction.",
        investment: "₹5.0 – 12 Lakh",
        suitabilityScore: 89,
      },
    ],
  },

  MIHAN: {
    name: "MIHAN SEZ",
    district: "Nagpur Urban / South",
    taluka: "Nagpur Urban",
    coordinates: "21.05° N, 79.04° E",
    tagline: "International Air Cargo & APEDA Export Gateway",
    summary: "Fast-track customs, phytosanitary export certification, and perishable air cargo handling.",
    rawMaterials: { status: "Graded Export Fruit", desc: "Consolidated grade-A citrus from regional packhouses" },
    markets: { status: "International Export", desc: "Middle East (Dubai, Doha), SE Asia & European air cargo" },
    transport: { status: "Airport & Multimodal", desc: "Direct international airport cargo runway link" },
    processing: { status: "SEZ Export Park", desc: "Special Economic Zone facilities with zero export duty incentives" },
    storage: { status: "Air Cargo Chill (1,500 MT)", desc: "MIHAN Perishable Handling Centre & Cold Staging" },
    research: { status: "APEDA Export Lab", desc: "APEDA & Export Inspection Council (EIC) on-site testing" },
    buildableTypes: ["✈️ Air Export House", "❄️ Cryogenic IQF Freezing", "📦 Export Carton Manufacturing"],
    opportunities: [
      {
        id: "OPP_MIH_01",
        name: "APEDA-Certified Citrus Export Packing & Air Cargo House",
        category: "Export & Trade",
        whyLocation: "Immediate on-airport perishable staging with direct air freight dispatches to Dubai & Middle East.",
        investment: "₹18 – 40 Lakh",
        suitabilityScore: 93,
      },
    ],
  },

  Mohpa: {
    name: "Mohpa",
    district: "Nagpur District",
    taluka: "Kalmeshwar / Katol Border",
    coordinates: "21.32° N, 78.82° E",
    tagline: "Rural Micro-Enterprise & Farm-Gate Aggregation Belt",
    summary: "Low land lease and labor costs, ideal for localized artisanal processing and organic composting.",
    rawMaterials: { status: "Direct Farm-Gate", desc: "Dense surrounding citrus orchards and smallholder farmers" },
    markets: { status: "Primary Collection", desc: "Mohpa Primary Farm-Gate Collection Center" },
    transport: { status: "Rural Road Link", desc: "Paved district roads linking Saoner and Kalmeshwar" },
    processing: { status: "Micro Enterprise", desc: "Rural cottage processing sheds and solar dryers" },
    storage: { status: "Farm ZECC", desc: "Farm-Level Zero Energy Cool Chambers (ZECC)" },
    research: { status: "Agro Advisory", desc: "Katol-Mohpa Agro Advisory Centre" },
    buildableTypes: ["☀️ Solar Dried Citrus Slices", "🍂 Organic Bio-Compost", "🌱 Village Nursery"],
    opportunities: [
      {
        id: "OPP_MOH_01",
        name: "Solar-Dried Citrus Slices & Fruit Powder",
        category: "Food Processing / Dehydration",
        whyLocation: "Low cost farm-gate procurement and ample open solar drying space for bakery and tea blend supply.",
        investment: "₹2.0 – 5 Lakh",
        suitabilityScore: 88,
      },
    ],
  },

  Ramtek: {
    name: "Ramtek",
    district: "Nagpur District (North)",
    taluka: "Ramtek",
    coordinates: "21.39° N, 79.33° E",
    tagline: "Horticulture Packhouse & KVK Outreach Node",
    summary: "Backed by Krishi Vigyan Kendra agronomic scientists, Totladoh reservoir irrigation, and agro-tourism footfall.",
    rawMaterials: { status: "Horticulture Belt", desc: "Citrus, guava, and vegetable diversified farming" },
    markets: { status: "Tourist & Mandi", desc: "Ramtek Agro Mandi & Pilgrim Tourism Retail Stalls" },
    transport: { status: "NH-7 Corridor", desc: "National Highway 7 connecting Jabalpur and Nagpur" },
    processing: { status: "Ramtek-Mansar Link", desc: "Agro processing and tourism packaging sheds" },
    storage: { status: "Packhouse (500 MT)", desc: "Ramtek Horticulture Packhouse & Pre-Cooling" },
    research: { status: "KVK Ramtek", desc: "Krishi Vigyan Kendra (KVK) Agronomy Training Center" },
    buildableTypes: ["🚜 Agri-Tourism & Orchards", "🪴 KVK Certified Nursery", "🍯 Specialty Jams & Honey"],
    opportunities: [
      {
        id: "OPP_RAM_01",
        name: "Agri-Tourism Citrus Orchard & Farm Visit Experience",
        category: "Agri-Tourism & Retail",
        whyLocation: "High pilgrim and weekend tourist footfall combined with KVK certified model orchard support.",
        investment: "₹4.0 – 10 Lakh",
        suitabilityScore: 90,
      },
    ],
  },
};

export default function Infrastructure() {
  const navigate = useNavigate();

  // State management
  const [selectedLocationKey, setSelectedLocationKey] = useState("Katol");
  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "opportunities"
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState("All");

  const currentLoc = LOCATION_ECOSYSTEM_DATA[selectedLocationKey] || LOCATION_ECOSYSTEM_DATA["Katol"];

  const filteredLocations = Object.keys(LOCATION_ECOSYSTEM_DATA).filter((key) => {
    const loc = LOCATION_ECOSYSTEM_DATA[key];
    const q = searchQuery.toLowerCase();
    return (
      key.toLowerCase().includes(q) ||
      loc.district.toLowerCase().includes(q) ||
      loc.tagline.toLowerCase().includes(q) ||
      loc.summary.toLowerCase().includes(q)
    );
  });

  const handleUseThisLocation = (locationKey) => {
    try {
      const savedLocation = {
        residenceLocation: "Nagpur Urban",
        operatingLocationMode: "specific_cluster",
        selectedCluster: locationKey,
        locationFlexibility: "preferred_cluster",
        locationPriorities: ["raw_material", "mandi_access", "cold_storage"],
      };
      localStorage.setItem("ev_user_location", JSON.stringify(savedLocation));
    } catch (e) {}
    navigate("/start");
  };

  const handleViewBusinessPlanForOpp = (opp) => {
    const planFormat = {
      opportunity_id: opp.id,
      name: opp.name,
      category: opp.category,
      description: opp.whyLocation,
      location_relevance: `${currentLoc.name}, ${currentLoc.district}`,
      suitability_score: opp.suitabilityScore,
      matched_skills: ["Local Agro Experience", "Cluster Operations"],
      missing_skills: ["Technical Quality Certification"],
      matched_resources: ["Cluster Mandi Linkage", "Local Raw Material"],
      missing_resources: ["On-Site Machinery"],
      financial_breakdown: {
        total_project_cost: 650000,
        user_budget: 300000,
        funding_gap: 0,
        eligible_scheme: "PMFME 35% Credit-Linked Subsidy",
        subsidy_amount: 227500,
        subsidy_percentage: "35%",
      },
    };
    navigate("/business-plan", { state: { opportunity: planFormat } });
  };

  return (
    <div style={{ maxWidth: 1160, margin: "0 auto", paddingBottom: 60 }}>
      {/* Top Banner Header */}
      <div
        className="card wizard-form-card"
        style={{
          marginBottom: 24,
          padding: "28px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span className="skill-status-tag verified" style={{ fontSize: "0.75rem", padding: "3px 10px" }}>
              📍 LOCATION-AWARE DECISION SUPPORT
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
              Vidarbha & Nagpur Micro-Clusters
            </span>
          </div>

          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--text-heading)", margin: "6px 0 6px", letterSpacing: "-0.02em" }}>
            EXPLORE BY LOCATION
          </h1>
          <p className="muted" style={{ margin: 0, fontSize: "0.92rem", maxWidth: 680 }}>
            Discover commercial opportunities around a specific location, its agricultural mandis, cold chain capacity, and ICAR-CCRI research links.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setShowCompareModal(true)}
            className="btn-secondary-gloss"
            style={{ padding: "10px 18px", fontSize: "0.88rem" }}
          >
            <Scale size={16} />
            <span>Compare Locations</span>
          </button>

          <button
            type="button"
            onClick={() => handleUseThisLocation(selectedLocationKey)}
            className="btn-primary-gloss"
            style={{ padding: "10px 22px", fontSize: "0.88rem" }}
          >
            <MapPin size={16} />
            <span>Use {selectedLocationKey} in Assessment →</span>
          </button>
        </div>
      </div>

      {/* Search & Location Selector Bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
        <div style={{ position: "relative" }}>
          <Search
            size={18}
            color="var(--muted)"
            style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Search city, taluka, APMC mandi or MIDC cluster (e.g. Katol, Kalamna, Butibori, Warud, Kalmeshwar)..."
            className="glass-input-field"
            style={{ paddingLeft: 46, fontSize: "0.92rem", height: 48 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Popular Locations Horizontal Strip */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {filteredLocations.map((key) => {
            const isSelected = selectedLocationKey === key;
            return (
              <button
                key={key}
                type="button"
                className={`pill-option-btn ${isSelected ? "active" : ""}`}
                style={{ padding: "8px 18px", fontSize: "0.86rem", whiteSpace: "nowrap", borderRadius: 999 }}
                onClick={() => setSelectedLocationKey(key)}
              >
                📍 {key}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Location Content Frame */}
      <div className="card wizard-form-card" style={{ padding: "32px 28px" }}>
        {/* Profile / Opportunities Sub-Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--line)", paddingBottom: 16, marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <MapPin size={22} color="var(--cyan)" />
              <h2 style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text-heading)", margin: 0 }}>
                {currentLoc.name.toUpperCase()}, {currentLoc.district.toUpperCase()}
              </h2>
            </div>
            <p style={{ margin: "4px 0 0", fontSize: "0.88rem", color: "var(--muted)" }}>
              {currentLoc.tagline} • Coordinates: <span style={{ fontFamily: "monospace", color: "var(--cyan)" }}>{currentLoc.coordinates}</span>
            </p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className={`pill-option-btn ${activeTab === "profile" ? "active" : ""}`}
              style={{ padding: "8px 16px", fontSize: "0.84rem" }}
              onClick={() => setActiveTab("profile")}
            >
              📍 Location Snapshot
            </button>
            <button
              type="button"
              className={`pill-option-btn ${activeTab === "opportunities" ? "active" : ""}`}
              style={{ padding: "8px 16px", fontSize: "0.84rem" }}
              onClick={() => setActiveTab("opportunities")}
            >
              🌱 Opportunities ({currentLoc.opportunities.length})
            </button>
          </div>
        </div>

        {/* ====================================================================
            PAGE 5.1 — LOCATION PROFILE & LOCAL ECOSYSTEM SNAPSHOT
           ==================================================================== */}
        {activeTab === "profile" && (
          <div>
            {/* Interactive Location Map Simulation */}
            <div
              className="interactive-map-frame"
              style={{
                height: 180,
                borderRadius: 16,
                background: "linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%)",
                border: "1px solid var(--line-glass)",
                overflow: "hidden",
                padding: 16,
                marginBottom: 24,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0, left: 0, right: 0, bottom: 0,
                  backgroundImage: "radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.15) 0%, transparent 60%), linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
                  backgroundSize: "100% 100%, 28px 28px, 28px 28px",
                  pointerEvents: "none",
                }}
              />

              <div style={{ position: "relative", zIndex: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="skill-status-tag verified" style={{ fontSize: "0.75rem" }}>
                  📍 ACTIVE OPERATIONAL NODE: {currentLoc.name}
                </span>
                <span style={{ fontSize: "0.75rem", color: "var(--muted)", fontFamily: "monospace" }}>
                  GPS: {currentLoc.coordinates}
                </span>
              </div>

              <div style={{ position: "relative", zIndex: 3, textAlign: "center" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(15, 23, 42, 0.85)", padding: "8px 16px", borderRadius: 999, border: "1px solid var(--line-glow)" }}>
                  <span style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--cyan)", boxShadow: "0 0 10px var(--cyan)" }} />
                  <strong style={{ fontSize: "0.92rem", color: "#fff" }}>{currentLoc.name} Agricultural Cluster</strong>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>({currentLoc.taluka})</span>
                </div>
              </div>

              <div style={{ position: "relative", zIndex: 3, display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--muted)" }}>
                <span>🛒 Nearby Mandis & Rail Freight Linked</span>
                <span>❄️ Cold Storage Network Active</span>
              </div>
            </div>

            {/* 6-Pillar Location Snapshot Grid */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <Sparkles size={18} color="var(--cyan)" />
                <strong style={{ fontSize: "0.95rem", color: "var(--text-heading)", textTransform: "uppercase" }}>
                  LOCATION ECOSYSTEM SNAPSHOT
                </strong>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 14 }}>
                {/* 1. Raw Materials */}
                <div style={{ background: "var(--panel-solid)", padding: 14, borderRadius: 14, border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <strong style={{ fontSize: "0.88rem", color: "var(--text-heading)" }}>🍊 Raw Materials</strong>
                    <span className="skill-status-tag verified" style={{ fontSize: "0.7rem" }}>{currentLoc.rawMaterials.status}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.4 }}>
                    {currentLoc.rawMaterials.desc}
                  </p>
                </div>

                {/* 2. Markets */}
                <div style={{ background: "var(--panel-solid)", padding: 14, borderRadius: 14, border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <strong style={{ fontSize: "0.88rem", color: "var(--text-heading)" }}>🛒 Mandis & Markets</strong>
                    <span className="skill-status-tag verified" style={{ fontSize: "0.7rem" }}>{currentLoc.markets.status}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.4 }}>
                    {currentLoc.markets.desc}
                  </p>
                </div>

                {/* 3. Transport */}
                <div style={{ background: "var(--panel-solid)", padding: 14, borderRadius: 14, border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <strong style={{ fontSize: "0.88rem", color: "var(--text-heading)" }}>🚚 Transport & Freight</strong>
                    <span className="skill-status-tag verified" style={{ fontSize: "0.7rem" }}>{currentLoc.transport.status}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.4 }}>
                    {currentLoc.transport.desc}
                  </p>
                </div>

                {/* 4. Processing */}
                <div style={{ background: "var(--panel-solid)", padding: 14, borderRadius: 14, border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <strong style={{ fontSize: "0.88rem", color: "var(--text-heading)" }}>🏭 Processing & MIDC</strong>
                    <span className="skill-status-tag claimed" style={{ fontSize: "0.7rem" }}>{currentLoc.processing.status}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.4 }}>
                    {currentLoc.processing.desc}
                  </p>
                </div>

                {/* 5. Storage */}
                <div style={{ background: "var(--panel-solid)", padding: 14, borderRadius: 14, border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <strong style={{ fontSize: "0.88rem", color: "var(--text-heading)" }}>📦 Cold Storage</strong>
                    <span className="skill-status-tag verified" style={{ fontSize: "0.7rem" }}>{currentLoc.storage.status}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.4 }}>
                    {currentLoc.storage.desc}
                  </p>
                </div>

                {/* 6. Research */}
                <div style={{ background: "var(--panel-solid)", padding: 14, borderRadius: 14, border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <strong style={{ fontSize: "0.88rem", color: "var(--text-heading)" }}>🔬 CCRI / R&D Support</strong>
                    <span className="skill-status-tag verified" style={{ fontSize: "0.7rem" }}>{currentLoc.research.status}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.4 }}>
                    {currentLoc.research.desc}
                  </p>
                </div>
              </div>
            </div>

            {/* Value Chain Flow Banner */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(99, 102, 241, 0.06) 100%)",
                border: "1px solid var(--line-glow)",
                borderRadius: 14,
                padding: "16px 20px",
                marginBottom: 24,
              }}
            >
              <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                🔄 LOCAL VALUE-CHAIN FLOW FOR {currentLoc.name.toUpperCase()}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", fontSize: "0.84rem", fontWeight: 700, color: "var(--text-heading)" }}>
                <span>🍊 Raw Harvest</span>
                <ArrowRight size={14} color="var(--muted)" />
                <span>🛒 Local Mandi Aggregation</span>
                <ArrowRight size={14} color="var(--muted)" />
                <span>❄️ 350 MT Pre-Cooling</span>
                <ArrowRight size={14} color="var(--muted)" />
                <span>🏭 Sorting & Waxing</span>
                <ArrowRight size={14} color="var(--muted)" />
                <span style={{ color: "var(--ok)" }}>🚀 High-Margin Dispatches</span>
              </div>
            </div>

            {/* WHAT CAN YOU BUILD HERE? */}
            <div style={{ marginBottom: 28 }}>
              <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
                WHAT CAN YOU BUILD IN {currentLoc.name.toUpperCase()}?
              </strong>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {currentLoc.buildableTypes.map((type, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 999,
                      background: "var(--panel-solid)",
                      border: "1px solid var(--line)",
                      fontSize: "0.84rem",
                      fontWeight: 600,
                      color: "var(--text-heading)",
                    }}
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
              <button
                type="button"
                onClick={() => setActiveTab("opportunities")}
                className="btn-primary-gloss"
                style={{ padding: "12px 28px", fontSize: "0.9rem" }}
              >
                <span>View {currentLoc.opportunities.length} Opportunities Around {currentLoc.name} →</span>
              </button>

              <button
                type="button"
                onClick={() => handleUseThisLocation(currentLoc.name)}
                className="btn-secondary-gloss"
                style={{ padding: "12px 22px", fontSize: "0.9rem" }}
              >
                <Compass size={16} />
                <span>Use This Location in My Assessment</span>
              </button>
            </div>
          </div>
        )}

        {/* ====================================================================
            PAGE 5.2 — LOCATION OPPORTUNITIES
           ==================================================================== */}
        {activeTab === "opportunities" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
              <div>
                <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--text-heading)", margin: "0 0 4px" }}>
                  Opportunities Around {currentLoc.name}
                </h3>
                <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)" }}>
                  Grounded in the physical mandis, cold stores, and farmer density of {currentLoc.name}.
                </p>
              </div>

              <div style={{ display: "flex", gap: 6 }}>
                {["All", "Agriculture", "Food Processing", "Agro Services"].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`pill-option-btn ${filterCategory === cat ? "active" : ""}`}
                    style={{ padding: "6px 14px", fontSize: "0.78rem" }}
                    onClick={() => setFilterCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
              {currentLoc.opportunities.map((opp) => (
                <div
                  key={opp.id}
                  style={{
                    background: "var(--panel-solid)",
                    border: "1px solid var(--line)",
                    borderRadius: 16,
                    padding: "20px 24px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span className="skill-status-tag verified" style={{ fontSize: "0.72rem" }}>
                          {opp.category}
                        </span>
                        <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                          📍 {currentLoc.name} Match
                        </span>
                      </div>
                      <h4 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-heading)", margin: 0 }}>
                        {opp.name}
                      </h4>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--cyan)" }}>
                        {opp.suitabilityScore}%
                      </span>
                      <span style={{ display: "block", fontSize: "0.7rem", color: "var(--muted)", textTransform: "uppercase" }}>
                        Cluster Fit
                      </span>
                    </div>
                  </div>

                  {/* Why this location box */}
                  <div style={{ background: "rgba(99, 102, 241, 0.06)", padding: "10px 14px", borderRadius: 10, border: "1px solid var(--line-glow)", fontSize: "0.84rem" }}>
                    <strong style={{ color: "var(--cyan)" }}>✓ Why {currentLoc.name}? </strong>
                    <span style={{ color: "var(--text)" }}>{opp.whyLocation}</span>
                  </div>

                  {/* Bottom Action strip */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid var(--line)", flexWrap: "wrap", gap: 10 }}>
                    <span style={{ fontSize: "0.82rem", color: "var(--muted)" }}>
                      💰 <strong>Estimated CapEx:</strong> {opp.investment} (PMFME 35% Eligible)
                    </span>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => handleViewBusinessPlanForOpp(opp)}
                        className="btn-secondary-gloss"
                        style={{ padding: "6px 14px", fontSize: "0.8rem" }}
                      >
                        <FileText size={14} />
                        <span>View Business Blueprint</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUseThisLocation(currentLoc.name)}
                        className="btn-primary-gloss"
                        style={{ padding: "6px 16px", fontSize: "0.8rem" }}
                      >
                        <Sparkles size={14} />
                        <span>Assess My Fit →</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center" }}>
              <button
                type="button"
                onClick={() => setActiveTab("profile")}
                className="btn-secondary-gloss"
                style={{ padding: "8px 20px", fontSize: "0.84rem" }}
              >
                ← Back to Location Snapshot
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ====================================================================
          COMPARE LOCATIONS MODAL
         ==================================================================== */}
      {showCompareModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(12px)",
            display: "grid",
            placeItems: "center",
            zIndex: 100,
            padding: 16,
          }}
        >
          <div
            className="card wizard-form-card"
            style={{
              maxWidth: 900,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
              padding: "32px 28px",
            }}
          >
            <button
              onClick={() => setShowCompareModal(false)}
              className="close-subform-btn"
              style={{ position: "absolute", top: 20, right: 20, width: 32, height: 32 }}
            >
              ✕
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Scale size={20} color="var(--cyan)" />
              <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-heading)", margin: 0 }}>
                VIDARBHA CLUSTER COMPARISON MATRIX
              </h2>
            </div>
            <p style={{ color: "var(--muted)", fontSize: "0.86rem", margin: "0 0 20px 0" }}>
              Side-by-side infrastructure and agro-economic breakdown derived from regional field datasets.
            </p>

            {/* Comparison Table */}
            <div style={{ background: "var(--panel-solid)", borderRadius: 14, border: "1px solid var(--line)", overflow: "hidden", marginBottom: 20 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
                <thead>
                  <tr style={{ background: "var(--panel-subtle)", textAlign: "left" }}>
                    <th style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)" }}>Factor / Metric</th>
                    <th style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)", color: "var(--cyan)" }}>📍 Katol</th>
                    <th style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)", color: "var(--ok)" }}>📍 Warud-Morshi</th>
                    <th style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)", color: "var(--electric-blue)" }}>📍 Kalmeshwar</th>
                    <th style={{ padding: "12px 14px", borderBottom: "1px solid var(--line)", color: "var(--violet)" }}>📍 Butibori MIDC</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: "10px 14px", fontWeight: 700, borderBottom: "1px solid var(--line)" }}>Raw Material Density</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)", color: "var(--ok)" }}>✓ High (Orchards)</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)", color: "var(--ok)" }}>✓ Premier Yield</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)" }}>✓ Moderate</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)", color: "var(--muted)" }}>○ Truck Freight</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "10px 14px", fontWeight: 700, borderBottom: "1px solid var(--line)" }}>Mandi Access</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)" }}>✓ Katol Sub-Yard</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)", color: "var(--ok)" }}>✓ High-Vol APMC</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)" }}>✓ 22km to Kalamna</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)" }}>✓ National Retail</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "10px 14px", fontWeight: 700, borderBottom: "1px solid var(--line)" }}>MIDC Power & Zoning</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)" }}>○ Light Agro Belt</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)" }}>○ Packhouse Zone</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)", color: "var(--ok)" }}>✓ MIDC Agro Park</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)", color: "var(--ok)" }}>✓ 5-Star High Volt</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "10px 14px", fontWeight: 700, borderBottom: "1px solid var(--line)" }}>Cold Chain Storage</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)" }}>✓ 350 MT Pre-cool</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)" }}>✓ 2,000 MT Staging</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)" }}>✓ 800 MT Cold Room</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)", color: "var(--ok)" }}>✓ 3,500 MT IQF</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "10px 14px", fontWeight: 700, borderBottom: "1px solid var(--line)" }}>Research Support</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)", color: "var(--cyan)" }}>✓ ICAR-CCRI Outreach</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)" }}>✓ Hort. Institute</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)" }}>✓ Soil Testing Lab</td>
                    <td style={{ padding: "10px 14px", borderBottom: "1px solid var(--line)" }}>✓ Central Food Lab</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "10px 14px", fontWeight: 700 }}>Top Recommended Model</td>
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--cyan)" }}>Certified Nursery</td>
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--ok)" }}>Waxing & Packhouse</td>
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--electric-blue)" }}>Micro Juice Line</td>
                    <td style={{ padding: "10px 14px", fontWeight: 600, color: "var(--violet)" }}>Peel Oil Extraction</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{ textAlign: "right" }}>
              <button
                type="button"
                onClick={() => setShowCompareModal(false)}
                className="btn-secondary-gloss"
                style={{ padding: "8px 20px", fontSize: "0.84rem" }}
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
