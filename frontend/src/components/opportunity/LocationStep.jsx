import React, { useState } from "react";
import {
  MapPin,
  Search,
  Navigation,
  Sparkles,
  Building2,
  Store,
  Snowflake,
  FlaskConical,
  Truck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Compass,
  Layers,
  Wheat,
  ExternalLink,
  ShieldCheck,
  Check,
  Info,
} from "lucide-react";

export const DEFAULT_LOCATION_STATE = {
  residenceLocation: "Nagpur Urban",
  residencePinCode: "440001",
  operatingLocationMode: "same", // "same" | "specific_cluster"
  selectedCluster: "Katol",
  customSpecificLocation: "",
  locationFlexibility: "preferred_cluster", // "fixed_site" | "preferred_cluster" | "district_wide" | "vidarbha_belt" | "anywhere_relocate"
  locationPriorities: [
    "raw_material",
    "mandi_access",
    "cold_storage",
    "logistics_highway",
  ],
};

export const CLUSTER_INTELLIGENCE = {
  Katol: {
    clusterName: "Katol Citrus Production & Incubation Cluster",
    district: "Nagpur District (West)",
    tag: "Primary Production & CCRI Outreach",
    rating: "A+ High Raw Material Density",
    badgeColor: "var(--ok)",
    coordinates: "21.27° N, 78.58° E",
    mapX: "32%",
    mapY: "44%",
    research: "Regional Citrus Nursery & ICAR-CCRI Outreach Centre",
    market: "Katol APMC Orange Sub-Market Yard & Local Mandi",
    storage: "Katol Farm-Gate Pre-Cooling & Chilling Units (350 MT)",
    industrial: "Katol Agro-Processing Cluster & MIDC Zone",
    keyAdvantage:
      "Ranked #1 in Nagpur for nursery propagation, fresh fruit sorting, and peel processing with ~40% lower farm-gate procurement costs.",
    distanceText: "60 km from Nagpur City • NH-353J Corridor",
    topSuitability: ["Citrus Nursery", "Waxing & Grading Line", "Peel Oil Extraction"],
  },
  "Kalamna APMC": {
    clusterName: "Central Kalamna APMC Fruit & Terminal Yard",
    district: "Nagpur Urban / East",
    tag: "Asia's Top Wholesale Mandi & Terminal",
    rating: "A+ Highest Trading Volume",
    badgeColor: "var(--cyan)",
    coordinates: "21.17° N, 79.14° E",
    mapX: "68%",
    mapY: "48%",
    research: "APEDA Export Certification & Quality Lab",
    market: "Central Kalamna APMC Fruit & Veg Yard (Asia's Top Mandi)",
    storage: "Kailasya Agro & Multi-Chamber Controlled Atmosphere (5,000 MT)",
    industrial: "Nagpur Central Logistics & Inter-State Freight Corridor",
    keyAdvantage:
      "Instant access to pan-India commission agents, bulk cash buyers, and heavy inter-state fruit trucks departing nightly for North & South India.",
    distanceText: "Central Nagpur • Rail & Direct Highway Link",
    topSuitability: ["Fresh Fruit Trading", "Commercial Cold Storage", "Inter-State Logistics"],
  },
  "Butibori MIDC": {
    clusterName: "Butibori 5-Star Mega Agro-Industrial Zone",
    district: "Nagpur District (South)",
    tag: "5-Star Industrial Estate & Food Processing",
    rating: "A+ Maximum Scalability & Power",
    badgeColor: "var(--electric-blue)",
    coordinates: "20.93° N, 78.98° E",
    mapX: "58%",
    mapY: "78%",
    research: "Central Food Technological Testing & Quality Labs",
    market: "National Highway FMCG Freight Network & Pan-India Dispatch",
    storage: "Ras Frozen Foods IQF & Cold Chain (3,500 MT)",
    industrial: "Butibori 5-Star Industrial Estate (Continuous 3-Phase Power)",
    keyAdvantage:
      "Ideal for heavy industrial capex, high-voltage bottling plants, pectin extraction, and ready industrial effluent treatment facilities.",
    distanceText: "28 km South of Nagpur • NH-44 Highway",
    topSuitability: ["Juice & Beverage Bottling", "Pectin Extraction", "Frozen Fruit Segments"],
  },
  "Warud-Morshi": {
    clusterName: "Warud-Morshi High-Density Citrus Belt",
    district: "Amravati District (Nagpur Border)",
    tag: "Highest Mandarin Harvest Density",
    rating: "A+ Premier Grade Fruit Harvest",
    badgeColor: "var(--ok)",
    coordinates: "21.46° N, 78.26° E",
    mapX: "18%",
    mapY: "26%",
    research: "Horticulture Training Institute & CCRI Demonstration Plots",
    market: "Warud APMC Mandi (High-volume Mandarin Trading)",
    storage: "Warud Regional Packhouse & Shellac Waxing Line (2,000 MT)",
    industrial: "Warud Food Processing Industrial Cluster",
    keyAdvantage:
      "Known as the 'California of India' for mandarin yield. Direct farm-gate sourcing at lowest per-crate rates with dedicated waxing lines.",
    distanceText: "110 km West of Nagpur • SH-243 State Highway",
    topSuitability: ["Shellac Waxing Unit", "FPO Aggregation", "Organic Fertilizer"],
  },
  Narkhed: {
    clusterName: "Narkhed Rail-Linked Transit & Agro Mandi",
    district: "Nagpur District (North-West)",
    tag: "Rail Freight Loading Hub & Transit",
    rating: "A Direct Rail Siding Node",
    badgeColor: "var(--violet)",
    coordinates: "21.50° N, 78.53° E",
    mapX: "28%",
    mapY: "20%",
    research: "Citrus Disease Surveillance Cell (CCRI Network)",
    market: "Narkhed APMC Fruit Market (Direct Rail Siding Loading)",
    storage: "Narkhed Cold Chain Staging Yard (1,200 MT)",
    industrial: "Amravati-Nagpur Border Agro Highway Corridor",
    keyAdvantage:
      "Strategic railway junction with dedicated parcel cargo rakes for cost-efficient long-distance transport to Delhi, Bihar, and Kolkata.",
    distanceText: "85 km from Nagpur • Junction Railway Hub",
    topSuitability: ["Bulk Rail Trading", "Pre-Cooling Staging", "Farm Packaging"],
  },
  Kalmeshwar: {
    clusterName: "Kalmeshwar MIDC & Agro Cluster",
    district: "Nagpur District (Central-West)",
    tag: "Agro Testing Labs & Intermediate MIDC",
    rating: "A Strategic Near-City Hub",
    badgeColor: "var(--cyan)",
    coordinates: "21.23° N, 78.91° E",
    mapX: "48%",
    mapY: "46%",
    research: "MIDC Agro Testing & Soil Chemistry Lab",
    market: "Kalmeshwar APMC & Direct Wholesale Stalls",
    storage: "Kalmeshwar Multi-Commodity Cold Room (800 MT)",
    industrial: "Kalmeshwar MIDC Industrial Zone",
    keyAdvantage:
      "Optimal balance between agricultural farm proximity and urban Nagpur city connectivity (only 22 km) with lower industrial rental costs.",
    distanceText: "22 km West of Nagpur • NH-353J Corridor",
    topSuitability: ["Micro Juice Extractor", "Agro Equipment Rental", "Soil Testing Lab"],
  },
  "Hingna MIDC": {
    clusterName: "Hingna Industrial & MSME Incubation Zone",
    district: "Nagpur District (South-West)",
    tag: "MSME Incubator & Urban Consumer FMCG",
    rating: "A High Urban Market Reach",
    badgeColor: "var(--violet)",
    coordinates: "21.09° N, 78.96° E",
    mapX: "52%",
    mapY: "60%",
    research: "VNIT & MSME Technology Incubation Centre",
    market: "Direct Nagpur Urban FMCG & Modern Trade Retail",
    storage: "B.K. Spices & Flowers Cold Storage (733 MT)",
    industrial: "Five Star Industrial Area, MIDC Hingna",
    keyAdvantage:
      "Direct rapid delivery to Nagpur city supermarkets, hotels, and retail outlets. Proximity to VNIT engineering support and machine fabricators.",
    distanceText: "12 km from Nagpur Center • Metro Line Link",
    topSuitability: ["Ready-to-Drink Retail Juice", "Peel Candies & Marmalades", "Cosmetic Extracts"],
  },
  MIHAN: {
    clusterName: "MIHAN SEZ & Multimodal Cargo Terminal",
    district: "Nagpur Urban / South",
    tag: "International Air Cargo & APEDA Export Hub",
    rating: "A+ International Export Gateway",
    badgeColor: "var(--cyan)",
    coordinates: "21.05° N, 79.04° E",
    mapX: "62%",
    mapY: "68%",
    research: "APEDA & Export Inspection Council Facility",
    market: "Air Cargo & Multimodal International Freight Hub",
    storage: "MIHAN Air-Cargo Perishable Handling Center (1,500 MT)",
    industrial: "Special Economic Zone (SEZ) & Global Logistics",
    keyAdvantage:
      "Equipped with APEDA export certification, international phytosanitary inspection, and rapid customs clearance for direct Middle East & EU air exports.",
    distanceText: "15 km South of Nagpur • Airport & SEZ",
    topSuitability: ["Premium Air Export", "IQF Cryogenic Freezing", "Contract Food Packaging"],
  },
  Mohpa: {
    clusterName: "Mohpa Rural Micro-Enterprise Belt",
    district: "Nagpur District",
    tag: "Farm-Gate Aggregation & Value Add",
    rating: "B+ Low Cost Land & Labor",
    badgeColor: "var(--ok)",
    coordinates: "21.32° N, 78.82° E",
    mapX: "42%",
    mapY: "38%",
    research: "Katol-Mohpa Agro Advisory Centre",
    market: "Mohpa Primary Farm-Gate Collection Center",
    storage: "Farm-Level Zero Energy Cool Chambers (ZECC)",
    industrial: "Mohpa Rural Micro-Enterprise Belt",
    keyAdvantage:
      "Lowest land lease and labor rates in the region, ideal for localized artisanal value addition, compost manufacturing, and solar drying units.",
    distanceText: "45 km from Nagpur",
    topSuitability: ["Solar Dried Orange Slices", "Organic Bio-Fertilizer", "Village Aggregation"],
  },
  Ramtek: {
    clusterName: "Ramtek Horticulture & KVK Agro Node",
    district: "Nagpur District (North)",
    tag: "KVK Training & Horticulture Packhouse",
    rating: "A Eco-Tourism & Specialty Agro",
    badgeColor: "var(--electric-blue)",
    coordinates: "21.39° N, 79.33° E",
    mapX: "82%",
    mapY: "28%",
    research: "Krishi Vigyan Kendra (KVK) Ramtek",
    market: "Ramtek Agro Mandi & Pilgrim Tourism Market",
    storage: "Ramtek Horticulture Packhouse (500 MT)",
    industrial: "Ramtek-Mansar Industrial Link",
    keyAdvantage:
      "Backed by Krishi Vigyan Kendra agronomic scientists, abundant irrigation from Totladoh/Ramtek reservoirs, and high pilgrim tourism footfall.",
    distanceText: "48 km North of Nagpur • NH-7 Corridor",
    topSuitability: ["Agri-Tourism & Farm Visits", "KVK Certified Nursery", "Specialty Honey & Jams"],
  },
};

const FLEXIBILITY_OPTIONS = [
  {
    id: "fixed_site",
    title: "📌 Fixed to this exact site",
    desc: "I own / lease land or a facility here and must operate on this specific plot",
  },
  {
    id: "preferred_cluster",
    title: "🎯 Preferred cluster, flexible within 20–30 km",
    desc: "I prefer this hub but can source or operate within neighboring talukas",
  },
  {
    id: "district_wide",
    title: "🏙️ Anywhere in the District (Nagpur / Amravati)",
    desc: "Open to any high-potential industrial cluster or APMC within the district",
  },
  {
    id: "vidarbha_belt",
    title: "🌾 Anywhere in the Vidarbha Citrus Belt",
    desc: "Match me with the highest raw-material density and subsidy benefits across Vidarbha",
  },
  {
    id: "anywhere_relocate",
    title: "🚀 Willing to relocate anywhere with highest ROI",
    desc: "Completely mobile entrepreneur seeking maximum commercial viability",
  },
];

export default function LocationStep({
  locationData = DEFAULT_LOCATION_STATE,
  locationsList = [],
  onChange,
  onNext,
  onBack,
}) {
  const data = { ...DEFAULT_LOCATION_STATE, ...locationData };
  const [searchQuery, setSearchQuery] = useState("");
  const [mapHoveredCluster, setMapHoveredCluster] = useState(null);

  const selectedClusterKey = data.selectedCluster || "Katol";
  const currentEco = CLUSTER_INTELLIGENCE[selectedClusterKey] || CLUSTER_INTELLIGENCE["Katol"];

  const handleClusterSelect = (clusterKey) => {
    onChange({
      locationData: {
        ...data,
        selectedCluster: clusterKey,
      },
    });
  };

  const filteredClusters = Object.keys(CLUSTER_INTELLIGENCE).filter((key) => {
    const info = CLUSTER_INTELLIGENCE[key];
    const q = searchQuery.toLowerCase();
    return (
      key.toLowerCase().includes(q) ||
      info.district.toLowerCase().includes(q) ||
      info.tag.toLowerCase().includes(q) ||
      info.keyAdvantage.toLowerCase().includes(q)
    );
  });

  const handleContinue = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleContinue} className="about-me-container">
      {/* Intro Header */}
      <div className="wizard-intro-header">
        <h2 className="wizard-main-title">WHERE DO YOU WANT TO BUILD?</h2>
        <p className="wizard-main-subtitle">
          User tells us <strong>WHERE</strong> they want to operate. EntreVision analyzes <strong>WHAT EXISTS THERE</strong> — mandis, cold chains, research labs, and industrial corridors.
        </p>
      </div>

      {/* Main Glass Container */}
      <div className="card wizard-form-card">
        {/* ====================================================================
            1. 🏠 LIVING LOCATION VS OPERATING LOCATION
           ==================================================================== */}
        <div className="doc-category-box">
          <div className="doc-category-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Compass size={20} color="var(--cyan)" />
              <div>
                <strong style={{ fontSize: "1.05rem", color: "var(--text-heading)" }}>
                  🏠 RESIDENTIAL VS BUSINESS LOCATION
                </strong>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                  Separate where you live from where your business operations will take place
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 12 }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="field-sublabel">Where do you currently live?</label>
              <input
                type="text"
                className="glass-input-field"
                placeholder="e.g. Nagpur City, Katol, Amravati, Wardha"
                value={data.residenceLocation}
                onChange={(e) =>
                  onChange({
                    locationData: { ...data, residenceLocation: e.target.value },
                  })
                }
              />
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="field-sublabel">PIN Code (Optional)</label>
              <input
                type="text"
                className="glass-input-field"
                placeholder="e.g. 440001"
                value={data.residencePinCode}
                onChange={(e) =>
                  onChange({
                    locationData: { ...data, residencePinCode: e.target.value },
                  })
                }
              />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label className="wizard-field-label">Where do you plan to locate your business?</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div
                className={`situation-card ${data.operatingLocationMode === "same" ? "selected" : ""}`}
                style={{ padding: "12px 16px" }}
                onClick={() =>
                  onChange({
                    locationData: { ...data, operatingLocationMode: "same" },
                  })
                }
              >
                <div>
                  <strong style={{ fontSize: "0.9rem", color: "var(--text-heading)", display: "block" }}>
                    🏠 In / Near My Home Town
                  </strong>
                  <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                    Operate locally within {data.residenceLocation || "current area"}
                  </span>
                </div>
                <div className="situation-radio-circle">
                  {data.operatingLocationMode === "same" && <div className="radio-inner-dot" />}
                </div>
              </div>

              <div
                className={`situation-card ${data.operatingLocationMode === "specific_cluster" ? "selected" : ""}`}
                style={{ padding: "12px 16px" }}
                onClick={() =>
                  onChange({
                    locationData: { ...data, operatingLocationMode: "specific_cluster" },
                  })
                }
              >
                <div>
                  <strong style={{ fontSize: "0.9rem", color: "var(--text-heading)", display: "block" }}>
                    📍 A Dedicated Agricultural / MIDC Cluster
                  </strong>
                  <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                    Target a high-yield mandi or industrial zone
                  </span>
                </div>
                <div className="situation-radio-circle">
                  {data.operatingLocationMode === "specific_cluster" && <div className="radio-inner-dot" />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ====================================================================
            2. 🗺️ INTERACTIVE CLUSTER SELECTION & REGIONAL MAP
           ==================================================================== */}
        <div className="doc-category-box">
          <div className="doc-category-header" style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <MapPin size={20} color="var(--ok)" />
              <div>
                <strong style={{ fontSize: "1.05rem", color: "var(--text-heading)" }}>
                  📍 SELECT YOUR OPERATING CLUSTER
                </strong>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                  Pick a strategic node in the Nagpur / Vidarbha Citrus Belt
                </span>
              </div>
            </div>

            {/* Quick Search */}
            <div style={{ position: "relative", minWidth: 260 }}>
              <Search
                size={15}
                color="var(--muted)"
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                placeholder="Search cluster, APMC, or MIDC..."
                className="glass-input-field"
                style={{ paddingLeft: 34, fontSize: "0.82rem", height: 36 }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Cluster Pills Cloud */}
          <div className="skills-pill-cloud" style={{ marginBottom: 16 }}>
            {filteredClusters.map((key) => {
              const item = CLUSTER_INTELLIGENCE[key];
              const isSelected = data.selectedCluster === key;
              return (
                <button
                  type="button"
                  key={key}
                  className={`skill-chip-btn ${isSelected ? "selected" : ""}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 14px",
                  }}
                  onClick={() => handleClusterSelect(key)}
                  onMouseEnter={() => setMapHoveredCluster(key)}
                  onMouseLeave={() => setMapHoveredCluster(null)}
                >
                  <MapPin size={14} color={isSelected ? "var(--cyan)" : "var(--muted)"} />
                  <span style={{ fontWeight: isSelected ? 700 : 600 }}>{key}</span>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      padding: "2px 6px",
                      borderRadius: 6,
                      background: isSelected ? "rgba(255,255,255,0.2)" : "var(--panel-subtle)",
                      color: isSelected ? "#fff" : "var(--muted)",
                    }}
                  >
                    {item.tag.split("&")[0]}
                  </span>
                  {isSelected && <Check size={14} color="var(--cyan)" />}
                </button>
              );
            })}
          </div>

          {/* Glassmorphic Interactive Map Representation */}
          <div
            className="interactive-map-frame"
            style={{
              position: "relative",
              height: 230,
              borderRadius: 16,
              background: "linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%)",
              border: "1px solid var(--line-glass)",
              overflow: "hidden",
              padding: 16,
              boxShadow: "inset 0 0 30px rgba(0, 0, 0, 0.4)",
            }}
          >
            {/* Map Grid and Contour Background */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage:
                  "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 60%), linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)",
                backgroundSize: "100% 100%, 28px 28px, 28px 28px",
                pointerEvents: "none",
              }}
            />

            {/* Map Header Overlay */}
            <div style={{ position: "relative", zIndex: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: "var(--ok)", boxShadow: "0 0 8px var(--ok)" }} />
                <span style={{ fontSize: "0.74rem", fontWeight: 700, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  VIDARBHA CITRUS ECOSYSTEM MAP • ACTIVE NODE: <span style={{ color: "var(--cyan)" }}>{data.selectedCluster}</span>
                </span>
              </div>
              <span style={{ fontSize: "0.72rem", color: "var(--muted)", fontFamily: "monospace" }}>
                {currentEco.coordinates}
              </span>
            </div>

            {/* Interactive Pins on Map */}
            {Object.keys(CLUSTER_INTELLIGENCE).map((clusterKey) => {
              const c = CLUSTER_INTELLIGENCE[clusterKey];
              const isSelected = data.selectedCluster === clusterKey;
              const isHovered = mapHoveredCluster === clusterKey;

              return (
                <div
                  key={clusterKey}
                  onClick={() => handleClusterSelect(clusterKey)}
                  onMouseEnter={() => setMapHoveredCluster(clusterKey)}
                  onMouseLeave={() => setMapHoveredCluster(null)}
                  style={{
                    position: "absolute",
                    left: c.mapX,
                    top: c.mapY,
                    transform: "translate(-50%, -50%)",
                    zIndex: isSelected ? 10 : 5,
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                  }}
                >
                  {/* Pin Dot with Glow */}
                  <div
                    className={isSelected ? "map-active-pin-glow" : ""}
                    style={{
                      width: isSelected ? 18 : 12,
                      height: isSelected ? 18 : 12,
                      borderRadius: "50%",
                      background: isSelected
                        ? "linear-gradient(135deg, var(--cyan), var(--electric-blue))"
                        : isHovered
                        ? "var(--violet)"
                        : "rgba(255, 255, 255, 0.4)",
                      boxShadow: isSelected
                        ? "0 0 16px var(--cyan), 0 0 0 4px rgba(6, 182, 212, 0.25)"
                        : isHovered
                        ? "0 0 10px var(--violet)"
                        : "none",
                      border: "2px solid #fff",
                      transition: "all 0.2s ease",
                    }}
                  />

                  {/* Pin Label */}
                  <span
                    style={{
                      marginTop: 4,
                      fontSize: isSelected ? "0.75rem" : "0.68rem",
                      fontWeight: isSelected ? 800 : 600,
                      color: isSelected ? "var(--cyan)" : isHovered ? "#fff" : "rgba(255, 255, 255, 0.65)",
                      background: isSelected
                        ? "rgba(15, 23, 42, 0.88)"
                        : "rgba(15, 23, 42, 0.65)",
                      padding: "2px 6px",
                      borderRadius: 6,
                      border: `1px solid ${isSelected ? "var(--cyan)" : "rgba(255,255,255,0.1)"}`,
                      whiteSpace: "nowrap",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    {clusterKey}
                  </span>
                </div>
              );
            })}

            {/* Bottom Quick Metric strip */}
            <div
              style={{
                position: "absolute",
                bottom: 12,
                left: 16,
                right: 16,
                zIndex: 3,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgba(15, 23, 42, 0.75)",
                backdropFilter: "blur(8px)",
                padding: "6px 14px",
                borderRadius: 10,
                border: "1px solid var(--line-glass)",
                fontSize: "0.75rem",
              }}
            >
              <span style={{ color: "var(--muted)" }}>
                📍 <strong style={{ color: "var(--text-heading)" }}>{currentEco.clusterName}</strong>
              </span>
              <span style={{ color: "var(--cyan)", fontWeight: 600 }}>{currentEco.distanceText}</span>
            </div>
          </div>
        </div>

        {/* ====================================================================
            3. 🎯 LOCATION FLEXIBILITY & OPERATING RADIUS
           ==================================================================== */}
        <div className="doc-category-box">
          <div className="doc-category-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Layers size={20} color="var(--violet)" />
              <div>
                <strong style={{ fontSize: "1.05rem", color: "var(--text-heading)" }}>
                  🎯 OPERATING RADIUS & LOCATION FLEXIBILITY
                </strong>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                  How constrained is your venture to this exact location?
                </span>
              </div>
            </div>
          </div>

          <div className="situation-grid">
            {FLEXIBILITY_OPTIONS.map((opt) => {
              const isSelected = data.locationFlexibility === opt.id;
              return (
                <div
                  key={opt.id}
                  className={`situation-card ${isSelected ? "selected" : ""}`}
                  style={{ padding: "12px 16px" }}
                  onClick={() =>
                    onChange({
                      locationData: { ...data, locationFlexibility: opt.id },
                    })
                  }
                >
                  <div>
                    <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)", display: "block" }}>
                      {opt.title}
                    </strong>
                    <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>{opt.desc}</span>
                  </div>
                  <div className="situation-radio-circle">
                    {isSelected && <div className="radio-inner-dot" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>


        {/* ====================================================================
            5. 💡 LIVE HYPER-LOCAL ECOSYSTEM INTELLIGENCE CARD
           ==================================================================== */}
        <div
          className="doc-center-highlight-box"
          style={{
            background: "linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)",
            borderColor: "rgba(6, 182, 212, 0.35)",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Sparkles size={18} color="var(--cyan)" />
                <strong style={{ fontSize: "1rem", color: "var(--text-heading)" }}>
                  LIVE ECOSYSTEM INTELLIGENCE: {currentEco.clusterName.toUpperCase()}
                </strong>
              </div>
              <span style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginTop: 2 }}>
                {currentEco.district} • {currentEco.distanceText}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  padding: "4px 10px",
                  borderRadius: 999,
                  background: "rgba(6, 182, 212, 0.18)",
                  color: "var(--cyan)",
                  border: "1px solid rgba(6, 182, 212, 0.4)",
                }}
              >
                {currentEco.rating}
              </span>
            </div>
          </div>

          {/* Key Advantage Banner */}
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 12,
              background: "var(--panel-solid)",
              border: "1px solid var(--line)",
              marginBottom: 14,
              fontSize: "0.84rem",
              lineHeight: 1.5,
            }}
          >
            <strong style={{ color: "var(--cyan)" }}>📍 Strategic DSS Assessment: </strong>
            <span style={{ color: "var(--text)" }}>{currentEco.keyAdvantage}</span>
          </div>

          {/* Micro-Infrastructure Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ background: "var(--panel-solid)", padding: 12, borderRadius: 12, border: "1px solid var(--line)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: "0.84rem", color: "var(--electric-blue)" }}>
                <FlaskConical size={15} /> Research & Certification
              </div>
              <p className="muted" style={{ fontSize: "0.8rem", margin: "4px 0 0" }}>
                {currentEco.research}
              </p>
            </div>

            <div style={{ background: "var(--panel-solid)", padding: 12, borderRadius: 12, border: "1px solid var(--line)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: "0.84rem", color: "var(--ok)" }}>
                <Store size={15} /> Mandis & Wholesale Yard
              </div>
              <p className="muted" style={{ fontSize: "0.8rem", margin: "4px 0 0" }}>
                {currentEco.market}
              </p>
            </div>

            <div style={{ background: "var(--panel-solid)", padding: 12, borderRadius: 12, border: "1px solid var(--line)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: "0.84rem", color: "var(--cyan)" }}>
                <Snowflake size={15} /> Cold Chain & Pre-Cooling
              </div>
              <p className="muted" style={{ fontSize: "0.8rem", margin: "4px 0 0" }}>
                {currentEco.storage}
              </p>
            </div>

            <div style={{ background: "var(--panel-solid)", padding: 12, borderRadius: 12, border: "1px solid var(--line)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: "0.84rem", color: "var(--violet)" }}>
                <Building2 size={15} /> Industrial Corridor & Power
              </div>
              <p className="muted" style={{ fontSize: "0.8rem", margin: "4px 0 0" }}>
                {currentEco.industrial}
              </p>
            </div>
          </div>

          {/* Top Recommended Venture Archetypes for this Location */}
          <div style={{ marginTop: 14, display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              Highest Potential in {data.selectedCluster}:
            </span>
            {(currentEco.topSuitability || []).map((suit, idx) => (
              <span key={idx} className="skill-status-tag verified" style={{ fontSize: "0.75rem" }}>
                ⭐ {suit}
              </span>
            ))}
          </div>
        </div>

        {/* Navigation Action Bar */}
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
