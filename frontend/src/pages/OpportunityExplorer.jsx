import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Sparkles,
  Store,
  MapPin,
  Layers,
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Coins,
  Snowflake,
  FlaskConical,
  GraduationCap,
  Hammer,
  Truck,
  ShieldCheck,
  ChevronRight,
  Sprout,
  TrendingUp,
  Package,
  Wrench,
  Cpu,
  Droplets,
  Zap,
} from "lucide-react";
import { fetchIndustryOpportunities } from "../services/api";

const CATEGORY_TABS = [
  { id: "All", label: "🌟 All Models" },
  { id: "Agriculture", label: "🌱 Agriculture & Nursery" },
  { id: "Processing", label: "🥤 Food Processing & Beverages" },
  { id: "By-Products", label: "🧪 By-Products & Bio-Value" },
  { id: "Services", label: "📦 Services & Packhouse" },
  { id: "Storage", label: "❄️ Storage & Cold Chain" },
  { id: "Trading", label: "💰 Trading & Mandis" },
];

const COMPREHENSIVE_MODELS = [
  // 1. Agriculture
  {
    id: "MOD01",
    name: "Disease-Free Certified Citrus Nursery",
    category: "Agriculture",
    icon: "🪴",
    tagline: "Produce and supply quality, certified planting material using CCRI budwood.",
    whatToBuild: [
      "Certified Nagpur mandarin budded rootstocks (Rangpur lime / Rough lemon)",
      "Polyhouse containerized saplings for high-density planting",
      "Disease-free mother plant budwood supply to secondary nurseries",
    ],
    skills: "Nursery management • Budding & grafting • Disease surveillance",
    infrastructure: "1,000 sq. m shade-net polyhouse • Micro-sprinklers • Potting shed",
    resources: "0.5–2 Acres land • Reliable borewell water • 3-phase power",
    investment: "₹4.5 – 8 Lakh (Eligible for 35% PMFME / MIDH subsidy)",
    locationSuitability: "Katol, Narkhed, Warud-Morshi, Ramtek (Orchard clusters)",
    market: "Commercial orchard growers, MahaAgro state procurement, FPOs",
    margins: "35–45% gross margin per sapling",
  },
  {
    id: "MOD02",
    name: "High-Density Commercial Citrus Cultivation",
    category: "Agriculture",
    icon: "🌱",
    tagline: "Grow and sell premium export-grade Nagpur mandarins with drip fertigation.",
    whatToBuild: [
      "Orchard yields of 18–25 MT/hectare using CCRI agronomic spacing",
      "Organic certified and residue-free table oranges for modern retail",
      "Farm-gate direct crate sales to pan-India commission agents",
    ],
    skills: "Orchard management • Drip fertigation • Pest & flowering regulation",
    infrastructure: "Drip irrigation network • Farm pack shed • Soil moisture sensors",
    resources: "2–10 Acres agricultural land • Reliable water reservoir",
    investment: "₹3.5 – 7 Lakh per hectare (AIF 3% interest subvention)",
    locationSuitability: "Katol, Morshi, Warud, Kalmeshwar, Saoner",
    market: "APMC Mandis (Kalamna, Warud), Retail supermarkets, Exporters",
    margins: "40–55% Net farm income on bearing crop",
  },

  // 2. Processing
  {
    id: "MOD03",
    name: "Citrus Ready-to-Serve (RTS) Beverages & Squashes",
    category: "Processing",
    icon: "🥤",
    tagline: "Turn fresh Nagpur mandarins into branded bottled juices, squashes, and concentrates.",
    whatToBuild: [
      "Debittered bottled fresh Nagpur mandarin juice (pasteurized & cold-fill)",
      "Citrus squashes, cordials, and fruit syrups for beverage dispensers",
      "Carbonated citrus spritzers and RTD beverages for regional retail",
    ],
    skills: "Food processing & debittering • Food safety (FSSAI) • Bottling operations",
    infrastructure: "1,200 sq. ft food-grade shed • Pulper & Pasteurizer • Bottling line",
    resources: "Fresh orange crates • Glass/PET bottles • FSSAI packaging labels",
    investment: "₹6.5 – 15 Lakh (35% PMFME Subsidy up to ₹10L)",
    locationSuitability: "Hingna MIDC, Kalmeshwar MIDC, Katol Agro Cluster",
    market: "Regional grocery stores, supermarkets, hotels, railway kiosks",
    margins: "28–38% Net operating margin",
  },
  {
    id: "MOD04",
    name: "Citrus Marmalade, Jams & Fruit Spreads",
    category: "Processing",
    icon: "🥫",
    tagline: "Artisanal and commercial fruit spreads utilizing peel shreds and orange pulp.",
    whatToBuild: [
      "Classic bitter-sweet orange marmalade with candied peel shreds",
      "Citrus-ginger blended fruit preserves for breakfast buffet supply",
      "Bulk fruit pulps for bakeries, confectionery, and ice-cream manufacturers",
    ],
    skills: "Steam jacketed cooking • Brix testing & gelling • Vacuum jar packaging",
    infrastructure: "Steam kettle • Semi-automatic filling line • Storage godown",
    resources: "Peel and pulp supply • Sugar/pectin • Glass jars and vacuum caps",
    investment: "₹4.0 – 9 Lakh (35% PMFME Subsidy)",
    locationSuitability: "Nagpur Urban, Hingna, Butibori",
    market: "Hotels, bakeries, e-commerce direct-to-consumer, gourmet stores",
    margins: "32–42% Net margin",
  },

  // 3. By-Products & Bio-Value
  {
    id: "MOD05",
    name: "Cold-Pressed Citrus Peel Essential Oil Extraction",
    category: "By-Products",
    icon: "🧪",
    tagline: "Extract high-value d-limonene and aromatic essential oils from processing peel waste.",
    whatToBuild: [
      "Pure cold-pressed Nagpur mandarin essential oil for cosmetics & perfumery",
      "Technical grade d-Limonene industrial solvent and degreaser",
      "Aromatherapy and skincare botanical extracts",
    ],
    skills: "Essential oil extraction • Distillation • QC purity testing",
    infrastructure: "Scraper/Centrifugal extractor • Vacuum filter • Chilled storage",
    resources: "Citrus peel waste from juice units • Aluminum airtight drums",
    investment: "₹8.0 – 20 Lakh (35% PMFME Subsidy + MSME Scheme)",
    locationSuitability: "Butibori MIDC, Hingna MIDC, Kalmeshwar",
    market: "Cosmetic companies, flavor & fragrance houses, export brokers",
    margins: "45–60% High-value export margin",
  },
  {
    id: "MOD06",
    name: "Citrus Waste Bio-Compost & Organic Soil Enricher",
    category: "By-Products",
    icon: "🍂",
    tagline: "Monetize rind and pomace waste into premium microbial organic compost.",
    whatToBuild: [
      "Enriched citrus bio-compost with beneficial Trichoderma microbes",
      "Pelletized organic orchard fertilizer for soil conditioning",
      "Liquid fermented bio-enzymes for foliar spray",
    ],
    skills: "Composting & aerobic fermentation • Moisture management • Packaging",
    infrastructure: "Concrete composting yard • Shredder/crusher • Bagging unit",
    resources: "Juice processing residue • Cow dung/microbial cultures • 50kg bags",
    investment: "₹2.5 – 6 Lakh (Eligible for Organic Farming & KVIC grants)",
    locationSuitability: "Katol, Mohpa, Warud (Close to orchards and juice units)",
    market: "Orchard farmers, organic vegetable growers, landscaping nurseries",
    margins: "30–40% Low capex operating return",
  },

  // 4. Services & Packhouses
  {
    id: "MOD07",
    name: "Mechanized Sorting, Grading & Shellac Waxing Line",
    category: "Services",
    icon: "📦",
    tagline: "Commercial post-harvest washing, size grading, waxing, and telescopic carton packing.",
    whatToBuild: [
      "Multi-tier electronic weight & diameter grading service (10 MT/hour)",
      "Food-grade shellac waxing line extending fruit shelf-life to 30 days",
      "Branded corrugated box packing for Delhi & South India dispatches",
    ],
    skills: "Packing line operation • Fruit sizing & quality sorting • Customer relations",
    infrastructure: "3,000 sq. ft covered pack shed • 3-phase high power • Loading dock",
    resources: "Grading machine • Shellac wax drums • Packing boxes & trays",
    investment: "₹12 – 28 Lakh (35% PMFME / APEDA Assistance)",
    locationSuitability: "Warud APMC, Katol Sub-Mandi, Kalamna Terminal",
    market: "Local citrus farmers, mandi traders, retail fruit aggregators",
    margins: "₹1.5 – ₹2.5 per kg custom packing service fee",
  },
  {
    id: "MOD08",
    name: "Agro Machinery Custom Hiring & Precision Sprayer Hub",
    category: "Services",
    icon: "🚜",
    tagline: "Hourly rental service of orchard boom sprayers, inter-row tillers, and shredders.",
    whatToBuild: [
      "Tractor-mounted orchard air-blast mist sprayers rental service",
      "Pruning wood shredders and inter-cultivation mini-tillers",
      "Drone-assisted pest mapping and precision foliar nutrition spraying",
    ],
    skills: "Tractor operation • Sprayer calibration • Equipment maintenance",
    infrastructure: "Equipment shelter / garage • Workshop tools • Fuel storage",
    resources: "Mini tractor • Orchard air-blast sprayer • Flail shredder",
    investment: "₹5.0 – 12 Lakh (Sub-Mission on Agricultural Mechanization 40% subsidy)",
    locationSuitability: "Katol, Saoner, Morshi, Narkhed",
    market: "Small and marginal citrus orchard owners within 20 km radius",
    margins: "35–45% Predictable seasonal rental income",
  },

  // 5. Storage & Logistics
  {
    id: "MOD09",
    name: "Farm-Gate Controlled Atmosphere Cold Storage (100–300 MT)",
    category: "Storage",
    icon: "❄️",
    tagline: "Modular pre-cooling and chilled rooms to avoid distress sales during peak harvest glut.",
    whatToBuild: [
      "Farm-gate pre-cooling chamber (Rapid core cooling to 6°C in 4 hours)",
      "Controlled atmosphere cold room storing fruit for 60–90 days",
      "Refrigerated staging for long-haul reefer loading",
    ],
    skills: "Refrigeration system management • Relative humidity control • Inventory",
    infrastructure: "Insulated PUF panel cold room • Freon cooling compressor • Backup generator",
    resources: "1,500 sq. ft space • Heavy 3-phase power connection",
    investment: "₹15 – 35 Lakh (35% PMFME / MIDH 35–50% Subsidy)",
    locationSuitability: "Katol, Kalmeshwar, Warud, Butibori",
    market: "Citrus growers, FPOs, wholesale mandi merchants",
    margins: "₹1.20 – ₹1.80 per kg/month storage rental",
  },

  // 6. Trading & Mandis
  {
    id: "MOD10",
    name: "APMC Wholesale Mandi Fruit Trading & Interstate Aggregation",
    category: "Trading",
    icon: "💰",
    tagline: "Direct orchard procurement, mandi commission trading, and full truckload dispatches.",
    whatToBuild: [
      "Direct orchard contract harvesting & sorting",
      "Daily wholesale auction trading at Kalamna APMC & Warud Mandi",
      "Full truckload (15–20 MT) dispatches to Azadpur (Delhi) and Vashi (Mumbai)",
    ],
    skills: "Crop estimation • Price negotiation • Mandi commission licensing • Logistics",
    infrastructure: "APMC trade stall or leased pack yard • Weighbridge link",
    resources: "Working capital for farmer cash advances • Wooden/Plastic crates",
    investment: "₹3.0 – 10 Lakh (Fast working capital turnover)",
    locationSuitability: "Kalamna APMC (Nagpur), Warud Mandi, Katol Sub-Yard",
    market: "Metro city wholesalers, institutional supermarkets, processing plants",
    margins: "6–12% High-velocity trading margin on rapid cycle",
  },
];

export default function OpportunityExplorer() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState(null);

  const filteredModels = COMPREHENSIVE_MODELS.filter((m) => {
    const matchesCategory = activeCategory === "All" || m.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      m.name.toLowerCase().includes(q) ||
      m.tagline.toLowerCase().includes(q) ||
      m.category.toLowerCase().includes(q) ||
      m.skills.toLowerCase().includes(q) ||
      m.locationSuitability.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const handleStartFitAssessment = (model) => {
    // Carries the selected model context into the assessment flow
    try {
      localStorage.setItem("ev_target_model", JSON.stringify(model));
    } catch (e) {}
    navigate("/start");
  };

  const handleViewBusinessPlan = (model) => {
    // Maps model into Page 3 Business Plan format
    const oppFormat = {
      opportunity_id: model.id,
      name: model.name,
      category: model.category,
      description: model.tagline,
      location_relevance: model.locationSuitability,
      suitability_score: 88,
      matched_skills: model.skills.split("•").map((s) => s.trim()),
      missing_skills: ["Quality & Compliance Certification"],
      matched_resources: model.resources.split("•").map((r) => r.trim()),
      missing_resources: ["Dedicated Machinery"],
      financial_breakdown: {
        total_project_cost: 650000,
        user_budget: 300000,
        funding_gap: 0,
        eligible_scheme: "PMFME 35% Capital Subsidy",
        subsidy_amount: 227500,
        subsidy_percentage: "35%",
      },
    };
    navigate("/business-plan", { state: { opportunity: oppFormat } });
  };

  return (
    <div style={{ maxWidth: 1160, margin: "0 auto", paddingBottom: 60 }}>
      {/* Top Banner */}
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
              🌱 AGRIBUSINESS CATALOG
            </span>
            <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
              Vidarbha Citrus Ecosystem (10+ Commercial Archetypes)
            </span>
          </div>

          <h1 style={{ fontSize: "1.85rem", fontWeight: 800, color: "var(--text-heading)", margin: "6px 0 6px", letterSpacing: "-0.02em" }}>
            BUSINESS MODELS
          </h1>
          <p className="muted" style={{ margin: 0, fontSize: "0.92rem", maxWidth: 680 }}>
            Explore different ways to build a viable business around cultivation, processing, cold chain, and by-products — even without completing an assessment.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/start" className="btn-primary-gloss" style={{ padding: "10px 22px", fontSize: "0.88rem", textDecoration: "none" }}>
            <Sparkles size={16} />
            <span>Match With My Profile →</span>
          </Link>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
        {/* Search Input */}
        <div style={{ position: "relative" }}>
          <Search
            size={18}
            color="var(--muted)"
            style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }}
          />
          <input
            type="text"
            placeholder="Search business models (e.g. Nursery, Peel oil, Juice bottling, Cold chain, Waxing, Trading)..."
            className="glass-input-field"
            style={{ paddingLeft: 46, fontSize: "0.92rem", height: 48 }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {CATEGORY_TABS.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`pill-option-btn ${activeCategory === cat.id ? "active" : ""}`}
              style={{ padding: "8px 16px", fontSize: "0.84rem", whiteSpace: "nowrap", borderRadius: 999 }}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categorized Models Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 20 }}>
        {filteredModels.map((model) => (
          <div
            key={model.id}
            className="card wizard-form-card"
            style={{
              padding: "22px 24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "all 0.25s ease",
            }}
          >
            <div>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <span
                  style={{
                    fontSize: "0.72rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    padding: "3px 8px",
                    borderRadius: 6,
                    background: "rgba(99, 102, 241, 0.12)",
                    color: "var(--electric-blue)",
                    border: "1px solid rgba(99, 102, 241, 0.25)",
                  }}
                >
                  {model.category}
                </span>
                <span style={{ fontSize: "1.4rem" }}>{model.icon}</span>
              </div>

              <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--text-heading)", margin: "0 0 8px" }}>
                {model.name}
              </h2>

              <p style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.5, margin: "0 0 16px" }}>
                {model.tagline}
              </p>

              {/* Specs Pill Strip */}
              <div
                style={{
                  background: "var(--panel-solid)",
                  padding: "10px 12px",
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  fontSize: "0.78rem",
                  marginBottom: 16,
                }}
              >
                <div>
                  <strong style={{ color: "var(--cyan)" }}>💰 Investment: </strong>
                  <span>{model.investment.split("(")[0]}</span>
                </div>
                <div>
                  <strong style={{ color: "var(--ok)" }}>📍 Cluster: </strong>
                  <span>{model.locationSuitability.split(",")[0]} Cluster</span>
                </div>
                <div>
                  <strong style={{ color: "var(--electric-blue)" }}>📈 Economics: </strong>
                  <span>{model.margins}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--line)" }}>
              <button
                type="button"
                onClick={() => setSelectedModel(model)}
                className="btn-secondary-gloss"
                style={{ padding: "6px 14px", fontSize: "0.82rem" }}
              >
                Explore Model →
              </button>

              <button
                type="button"
                onClick={() => handleStartFitAssessment(model)}
                className="btn-primary-gloss"
                style={{ padding: "6px 14px", fontSize: "0.82rem" }}
              >
                <Sparkles size={14} />
                <span>Can I do this?</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ====================================================================
          MODEL DETAIL VIEW (Slide-over / Modal)
         ==================================================================== */}
      {selectedModel && (
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
              maxWidth: 720,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              position: "relative",
              padding: "32px 28px",
            }}
          >
            <button
              onClick={() => setSelectedModel(null)}
              className="close-subform-btn"
              style={{ position: "absolute", top: 20, right: 20, width: 32, height: 32 }}
            >
              ✕
            </button>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span style={{ fontSize: "1.8rem" }}>{selectedModel.icon}</span>
              <div>
                <span className="skill-status-tag verified" style={{ fontSize: "0.75rem" }}>
                  {selectedModel.category}
                </span>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 0" }}>
                  {selectedModel.name}
                </h2>
              </div>
            </div>

            <p style={{ color: "var(--muted)", fontSize: "0.9rem", lineHeight: 1.6, margin: "12px 0 16px" }}>
              {selectedModel.tagline}
            </p>

            <div style={{ height: 1, background: "var(--line)", margin: "16px 0" }} />

            {/* 1. WHAT CAN YOU BUILD? */}
            <div style={{ marginBottom: 18 }}>
              <strong style={{ fontSize: "0.92rem", color: "var(--cyan)", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                📦 WHAT CAN YOU BUILD?
              </strong>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {selectedModel.whatToBuild.map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.86rem" }}>
                    <span style={{ color: "var(--ok)", fontWeight: 700 }}>•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ height: 1, background: "var(--line)", margin: "16px 0" }} />

            {/* 2. TYPICAL REQUIREMENTS */}
            <div style={{ marginBottom: 20 }}>
              <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
                📋 TYPICAL REQUIREMENTS
              </strong>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: "0.85rem" }}>
                <div style={{ background: "var(--panel-solid)", padding: 12, borderRadius: 12, border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "var(--electric-blue)", marginBottom: 4 }}>
                    <GraduationCap size={15} /> 👤 Skills
                  </div>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)" }}>{selectedModel.skills}</p>
                </div>

                <div style={{ background: "var(--panel-solid)", padding: 12, borderRadius: 12, border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "var(--ok)", marginBottom: 4 }}>
                    <Building2 size={15} /> 🏭 Infrastructure
                  </div>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)" }}>{selectedModel.infrastructure}</p>
                </div>

                <div style={{ background: "var(--panel-solid)", padding: 12, borderRadius: 12, border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "var(--cyan)", marginBottom: 4 }}>
                    <Package size={15} /> 📦 Resources
                  </div>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)" }}>{selectedModel.resources}</p>
                </div>

                <div style={{ background: "var(--panel-solid)", padding: 12, borderRadius: 12, border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "var(--violet)", marginBottom: 4 }}>
                    <Coins size={15} /> 💰 Investment
                  </div>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--muted)" }}>{selectedModel.investment}</p>
                </div>
              </div>

              {/* Location Note */}
              <div style={{ marginTop: 10, background: "var(--panel-solid)", padding: 12, borderRadius: 12, border: "1px solid var(--line)", fontSize: "0.82rem" }}>
                <strong style={{ color: "var(--text-heading)" }}>📍 Location & Ecosystem: </strong>
                <span style={{ color: "var(--muted)" }}>{selectedModel.locationSuitability}</span>
              </div>
            </div>

            {/* 3. "CAN I DO THIS?" MENTOR BRIDGE BANNER */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)",
                border: "1px solid rgba(6, 182, 212, 0.35)",
                borderRadius: 14,
                padding: "16px 20px",
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <Sparkles size={18} color="var(--cyan)" />
                <strong style={{ fontSize: "0.95rem", color: "var(--text-heading)" }}>
                  SEE IF THIS BUSINESS FITS YOU
                </strong>
              </div>
              <p style={{ fontSize: "0.84rem", color: "var(--muted)", margin: "0 0 12px 0", lineHeight: 1.5 }}>
                EntreVision will match your skills, land, liquid capital, and preferred cluster against this exact business model to calculate your readiness and 35% PMFME subsidies.
              </p>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => handleStartFitAssessment(selectedModel)}
                  className="btn-primary-gloss"
                  style={{ padding: "10px 20px", fontSize: "0.86rem" }}
                >
                  <Sparkles size={16} />
                  <span>Assess My Fit for This Model →</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleViewBusinessPlan(selectedModel)}
                  className="btn-secondary-gloss"
                  style={{ padding: "10px 18px", fontSize: "0.86rem" }}
                >
                  <FileText size={16} />
                  <span>View Sample Business Plan</span>
                </button>
              </div>
            </div>

            {/* Close Button */}
            <div style={{ textAlign: "right" }}>
              <button
                type="button"
                onClick={() => setSelectedModel(null)}
                className="btn-secondary-gloss"
                style={{ padding: "6px 16px", fontSize: "0.82rem" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
