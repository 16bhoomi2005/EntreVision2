import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  Search,
  Filter,
  Sparkles,
  Handshake,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  Send,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MapPin,
  Building2,
  Coins,
  Sprout,
  Truck,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  Layers,
  Flag,
  UserCheck,
  Briefcase,
  Share2,
  Plus
} from "lucide-react";

// ============================================================================
// 1. MASTER COLLABORATION NETWORK DATASET (NAGPUR CITRUS ECOSYSTEM)
// ============================================================================
const ENTREPRENEUR_PROFILES = [
  {
    id: "ENT-001",
    name: "Rajesh Deshmukh",
    handle: "@rajesh_citrus_katol",
    avatarIcon: "👨‍🌾",
    location: "Katol, Nagpur District",
    role: "Citrus Orchardist & FPO Director",
    primaryInterest: "Citrus Juice Processing & Cold-Chain Packing",
    suitabilityScore: 94,
    offers: [
      { type: "land", title: "5 Acres Agri Land with 2 Functional Borewells in Katol", icon: "🌾" },
      { type: "raw_material", title: "80 MT Assured Seasonal Nagpur Mandarin Fruit Supply", icon: "🍊" },
      { type: "equipment", title: "Tractor, Solar Pump & 300 Plastic Harvest Crates", icon: "🚜" },
    ],
    needs: [
      { type: "capital", title: "Co-Founder / Partner Equity (₹4.0 to ₹6.0 Lakhs)", icon: "💰" },
      { type: "equipment", title: "Continuous Juice Extractor & Flash Pasteurizer Machinery", icon: "⚙️" },
      { type: "skills", title: "FSSAI Compliance, Lab Quality Control & Brand Packaging", icon: "🧠" },
    ],
    experience: "15 years family citrus farming; 3 years heading Katol Citrus Growers FPO.",
    matchReasons: [
      "Your capital / marketing expertise can complement his 5-acre land and fruit supply.",
      "His guaranteed farm-gate raw material secures low-cost orange procurement (₹14/kg).",
      "Both are focused on the Katol citrus processing cluster for PMFME 35% grant convergence.",
    ],
    collaborationTypes: ["Business Partner (Equity)", "Joint Venture", "Shared Processing Shed"],
  },
  {
    id: "ENT-002",
    name: "Pooja Thakare",
    handle: "@pooja_foodtech",
    avatarIcon: "👩‍🔬",
    location: "Butibori MIDC / Nagpur City",
    role: "Food Technologist & QA Specialist (M.Tech LIT)",
    primaryInterest: "Cold-Pressed RTS Citrus Beverages & Marmalades",
    suitabilityScore: 96,
    offers: [
      { type: "skills", title: "Certified Beverage Formulation, Pasteurization & Shelf-Life Stabilization", icon: "🧠" },
      { type: "compliance", title: "FSSAI Central License Documentation & NABL Nutritional Testing", icon: "📋" },
      { type: "equipment", title: "Pilot-scale 100 LPH Homogenizer & Vacuum Jar Sealer", icon: "⚙️" },
    ],
    needs: [
      { type: "raw_material", title: "Reliable Farm-Gate Citrus Grower Partner in Nagpur Belt", icon: "🍊" },
      { type: "workspace", title: "Agro-Processing Shed with 3-Phase Power in Katol or Kalmeshwar", icon: "🏗️" },
      { type: "capital", title: "Working Capital Partner for Bottle Inventory & Distribution", icon: "💰" },
    ],
    experience: "7 years QA lead at regional FMCG beverage plant; formulated 4 commercial fruit squashes.",
    matchReasons: [
      "Her formulation and quality lab skills immediately bridge your technical/FSSAI gap.",
      "Complements founders who have land or capital but lack certified food processing degrees.",
      "Enables premium bottled retail margin (₹60/bottle) instead of raw fruit wholesale.",
    ],
    collaborationTypes: ["Technical Co-Founder", "Formulation Retainer", "Joint Venture"],
  },
  {
    id: "ENT-003",
    name: "Anand Kulkarni",
    handle: "@anand_coldchain",
    avatarIcon: "👨‍💼",
    location: "Kalmeshwar / Hingna MIDC",
    role: "Cold Storage Operator & Reefer Logistics Lead",
    primaryInterest: "Micro Cold Storage & Farm-Gate Pre-Cooling",
    suitabilityScore: 91,
    offers: [
      { type: "infrastructure", title: "20 MT Walk-in Pre-Cooling Chamber in Kalmeshwar", icon: "❄️" },
      { type: "logistics", title: "2 Insulated Refrigerated Reefer Trucks (Nagpur-Bhopal-Raipur Route)", icon: "🚚" },
      { type: "power", title: "25 kVA Industrial Grid Sanction with Solar Backup", icon: "⚡" },
    ],
    needs: [
      { type: "business", title: "Citrus Grading & Waxing Partner to Utilize Storage Capacity", icon: "📦" },
      { type: "partner", title: "FPO / Agro-Venture for Seasonal Off-Take Agreements", icon: "🤝" },
    ],
    experience: "Managed 3,500 MT multi-commodity cold store; licensed transport contractor.",
    matchReasons: [
      "Shared cold storage access eliminates ₹14 Lakhs in initial refrigeration CapEx.",
      "Provides ready freight corridor to high-paying central Indian fruit mandis.",
      "Location in Kalmeshwar connects directly to Nagpur-Bhopal National Highway.",
    ],
    collaborationTypes: ["Shared Infrastructure Lease", "Logistics Partnership", "Cold-Chain Alliance"],
  },
  {
    id: "ENT-004",
    name: "Suresh Wankhede",
    handle: "@suresh_grafting_ccri",
    avatarIcon: "👨‍🌾",
    location: "Warud-Morshi Belt, Amravati / Nagpur",
    role: "Master Nursery Propagator & CCRI Alumni",
    primaryInterest: "Disease-Free Certified Citrus Nursery & Mother Block",
    suitabilityScore: 92,
    offers: [
      { type: "skills", title: "ICAR-CCRI Certified T-Budding & Rangpur Rootstock Propagation", icon: "🌱" },
      { type: "raw_material", title: "10,000 Certified Mother Scion Budsticks Stock", icon: "🌿" },
      { type: "contacts", title: "State Nursery Accreditation & Department of Agriculture Network", icon: "🏛️" },
    ],
    needs: [
      { type: "infrastructure", title: "1-Acre Polyhouse / Shade-Net Facility with Micro-Sprinklers", icon: "🏗️" },
      { type: "capital", title: "Seed Capital for 20,000 UV Grow Bags & Media Blender (₹1.8L)", icon: "💰" },
      { type: "marketing", title: "Digital Marketing & Institutional Farmer Order Booking", icon: "📱" },
    ],
    experience: "12 years commercial nursery propagation; certified by ICAR-CCRI Nagpur in 2018.",
    matchReasons: [
      "Instantly resolves technical grafting and certification requirements for nursery setup.",
      "Your capital / polyhouse infrastructure pairs directly with his high-health budwood stock.",
      "Enables immediate nursery license application with Maharashtra Agriculture Dept.",
    ],
    collaborationTypes: ["Nursery Managing Partner", "Profit-Sharing Propagator", "Technical Director"],
  },
  {
    id: "ENT-005",
    name: "Vikramaditya Patil",
    handle: "@vikram_d2c_agro",
    avatarIcon: "👨‍💻",
    location: "MIHAN SEZ / Nagpur",
    role: "D2C Brand Strategist & Growth Marketer",
    primaryInterest: "Premium Farm-to-Consumer Citrus Brand & Online Retailing",
    suitabilityScore: 89,
    offers: [
      { type: "technology", title: "Live Shopify D2C Store, QR Traceability App & Digital Ad Funnels", icon: "💻" },
      { type: "market_access", title: "National Courier Tie-Ups (BlueDart & Delhivery Metro Dispatch)", icon: "📦" },
      { type: "branding", title: "Export Grade 5-Ply Packaging Design & Brand Trademark", icon: "🏷️" },
    ],
    needs: [
      { type: "producer", title: "Reliable Sorting, Grading & Waxing Partner for Grade-A Oranges", icon: "🍊" },
      { type: "quality", title: "Blemish-Free, Sweetness-Tested (Brix ≥ 10°) Citrus Consignments", icon: "🔍" },
    ],
    experience: "Ex-eCommerce Lead; scaled farm-produce D2C brand to ₹45 Lakhs ARR.",
    matchReasons: [
      "Provides direct premium retail realization (₹40–₹60/kg) vs low mandi rates (₹16–₹22/kg).",
      "Handles all customer acquisition, digital marketing, packaging and payment gateways.",
      "Complements producers with packing and waxing lines looking for assured off-take.",
    ],
    collaborationTypes: ["Off-take & Marketing Partner", "Brand Equity Partner", "Joint Venture"],
  },
  {
    id: "ENT-006",
    name: "Shriram Citrus Collective (FPO)",
    handle: "@shriram_fpo_narkhed",
    avatarIcon: "🏢",
    location: "Narkhed Tehsil, Nagpur",
    role: "350-Member Citrus Farmer Producer Company",
    primaryInterest: "Citrus Peel Waste Extraction & Biomass Value Addition",
    suitabilityScore: 88,
    offers: [
      { type: "raw_material", title: "120 Tonnes Seasonal Citrus Peels & Pomace Residue", icon: "🍊" },
      { type: "shed", title: "1,500 sq.ft Covered PEB Industrial Shed in Narkhed", icon: "🏗️" },
      { type: "scheme", title: "Eligible for 50% FPO Capital Grant under PMFME & AIF 3% Subvention", icon: "🏛️" },
    ],
    needs: [
      { type: "technology", title: "Agri-Entrepreneur with Essential Oil & Pectin Distillation Plant", icon: "🧪" },
      { type: "management", title: "Full-Time Technical Plant Operator & Quality Manager", icon: "👷" },
    ],
    experience: "Incorporated FPC under Companies Act; NABARD registered; ₹1.2 Cr annual turnover.",
    matchReasons: [
      "Zero raw material acquisition barrier for peel oil distillation (feedstock supplied free).",
      "Ready shed infrastructure eliminates heavy civil construction lead time and costs.",
      "FPO institutional status unlocks higher 50% subsidy thresholds under MoFPI.",
    ],
    collaborationTypes: ["FPO Joint Venture", "Build-Operate-Transfer (BOT)", "Technical Concessionaire"],
  },
];

// ============================================================================
// 2. MAIN COLLABORATION COMPONENT
// ============================================================================
export default function Collaboration() {
  const navigate = useNavigate();

  // Active view: "explore" | "needs_config" (8.1) | "profile" (8.2) | "my_collabs" (8.6)
  const [activeTab, setActiveTab] = useState("explore");

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "skills" | "funding" | "resources" | "partner"

  // Selected Profile for Modal View (8.4)
  const [selectedProfile, setSelectedProfile] = useState(null);

  // Collaboration Request Modal (8.5)
  const [requestRecipient, setRequestRecipient] = useState(null);
  const [requestTopic, setRequestTopic] = useState("Business Idea & Joint Venture");
  const [requestMessage, setRequestMessage] = useState("");
  const [requestSentNotice, setRequestSentNotice] = useState(false);

  // User's Collaboration Profile & Visibility State (8.2)
  const [myCollabProfile, setMyCollabProfile] = useState(() => {
    let name = "Bhoomika V.";
    let locationStr = "Katol / Nagpur Region";
    let business = "Citrus Value-Added Products & Nursery";
    let capital = "₹2.5 Lakhs";

    try {
      const savedAbout = localStorage.getItem("ev_about_me");
      if (savedAbout) {
        const p = JSON.parse(savedAbout);
        if (p.fullName) name = p.fullName;
        if (p.targetLocation) locationStr = p.targetLocation;
      }
      const savedFin = localStorage.getItem("ev_user_finances");
      if (savedFin) {
        const p = JSON.parse(savedFin);
        if (p.personalSavings) capital = `₹${(Number(p.personalSavings) / 100000).toFixed(1)} Lakhs`;
      }
    } catch (e) {}

    return {
      name,
      location: locationStr,
      businessInterest: business,
      offers: [
        "Capital Contribution (" + capital + ")",
        "Technology & Digital Marketing",
        "Agri Land Access in Katol (2.5 Acres)",
      ],
      lookingFor: [
        "Certified Food Technologist / Nursery Grafter",
        "Commercial Processing Machinery Partner",
        "Business Partner / Joint Venture",
      ],
      visibility: "relevant_matches", // "everyone" | "relevant_matches" | "private"
    };
  });

  // User's Specific Needs Configurator (8.1)
  const [needsConfig, setNeedsConfig] = useState(() => {
    try {
      const saved = localStorage.getItem("ev_collaboration_intent");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      skillsNeeded: ["Food Processing & Preservation", "Citrus Grafting & Propagation"],
      resourcesNeeded: ["Processing Equipment", "Cold Storage Access"],
      fundingNeeded: ["Co-Founder with Capital", "Joint Venture Partner"],
      whatIOffer: ["Capital Contribution", "Agri Land", "Marketing & Technology"],
    };
  });

  // Active & Pending Collaborations (8.6)
  const [myCollaborations, setMyCollaborations] = useState(() => {
    try {
      const saved = localStorage.getItem("ev_active_collaborations");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      pending: [
        {
          id: "COL-REQ-101",
          sender: "Rajesh Deshmukh",
          avatarIcon: "👨‍🌾",
          location: "Katol",
          topic: "Joint Venture for Juice Extractor Unit",
          message:
            "Namaskar! I saw your profile and capital capability. I have 5 acres with borewell on Katol bypass and assured orange fruit harvest. Let's discuss a shared PMFME application.",
          date: "26/09/2026",
          status: "Pending Your Response",
        },
      ],
      sent: [
        {
          id: "COL-SENT-202",
          recipient: "Pooja Thakare",
          avatarIcon: "👩‍🔬",
          topic: "Formulation & FSSAI Collaboration",
          date: "28/09/2026",
          status: "Pending Recipient Review",
        },
      ],
      active: [
        {
          id: "COL-ACT-303",
          partner: "Suresh Wankhede",
          avatarIcon: "👨‍🌾",
          location: "Warud-Morshi",
          role: "Nursery Propagator",
          business: "Disease-Free Certified Citrus Nursery",
          collabType: "Technical Partnership",
          status: "Exploring Joint Venture & Polyhouse Lease",
          establishedDate: "20/09/2026",
          milestone: "Prepare joint ICAR-CCRI accreditation audit dossier",
        },
      ],
    };
  });

  // Sync needs config changes to localStorage
  const toggleNeedItem = (category, item) => {
    setNeedsConfig((prev) => {
      const currentList = prev[category] || [];
      const updated = currentList.includes(item)
        ? currentList.filter((i) => i !== item)
        : [...currentList, item];

      const newConfig = { ...prev, [category]: updated };
      try {
        localStorage.setItem("ev_collaboration_intent", JSON.stringify(newConfig));
      } catch (e) {}
      return newConfig;
    });
  };

  // Filter profiles
  const filteredProfiles = useMemo(() => {
    return ENTREPRENEUR_PROFILES.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.primaryInterest.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (activeFilter === "skills") {
        return p.offers.some((o) => o.type === "skills");
      }
      if (activeFilter === "funding") {
        return p.needs.some((n) => n.type === "capital") || p.offers.some((o) => o.type === "capital");
      }
      if (activeFilter === "resources") {
        return p.offers.some((o) => o.type === "infrastructure" || o.type === "equipment" || o.type === "land");
      }
      if (activeFilter === "partner") {
        return p.collaborationTypes.some((c) => c.toLowerCase().includes("partner") || c.toLowerCase().includes("joint"));
      }
      return true;
    });
  }, [searchQuery, activeFilter]);

  // Handle open request modal
  const handleOpenRequestModal = (profile) => {
    setRequestRecipient(profile);
    setRequestTopic("Business Idea & Joint Venture");
    setRequestMessage(
      `Hi ${profile.name},\n\nI reviewed your profile on EntreVision. I am setting up a citrus agro-enterprise in the Nagpur cluster. Your background in "${profile.role}" and available resources (${profile.offers.map((o) => o.title).slice(0, 2).join(", ")}) strongly complement my project requirements. I would love to explore a potential collaboration.`
    );
  };

  // Handle send request
  const handleSendCollaborationRequest = () => {
    if (!requestRecipient) return;

    const newSent = {
      id: `COL-SENT-${Date.now()}`,
      recipient: requestRecipient.name,
      avatarIcon: requestRecipient.avatarIcon,
      topic: requestTopic,
      date: new Date().toLocaleDateString("en-GB"),
      status: "Pending Recipient Review",
    };

    setMyCollaborations((prev) => {
      const updated = {
        ...prev,
        sent: [newSent, ...prev.sent],
      };
      try {
        localStorage.setItem("ev_active_collaborations", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    setRequestSentNotice(true);
    setTimeout(() => {
      setRequestSentNotice(false);
      setRequestRecipient(null);
      setSelectedProfile(null);
    }, 1800);
  };

  // Accept incoming request
  const handleAcceptRequest = (req) => {
    setMyCollaborations((prev) => {
      const newActive = {
        id: `COL-ACT-${Date.now()}`,
        partner: req.sender,
        avatarIcon: req.avatarIcon,
        location: req.location || "Nagpur Region",
        role: "Collaborating Partner",
        business: "Citrus Processing Venture",
        collabType: "Joint Venture",
        status: "Active Collaboration Established",
        establishedDate: new Date().toLocaleDateString("en-GB"),
        milestone: "Align on shared DPR and equity structure",
      };

      const updated = {
        ...prev,
        pending: prev.pending.filter((p) => p.id !== req.id),
        active: [newActive, ...prev.active],
      };
      try {
        localStorage.setItem("ev_active_collaborations", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    alert(`✓ You accepted collaboration with ${req.sender}! Added to Active Collaborations.`);
  };

  // Add collaboration milestone to Roadmap
  const handleAddCollabToRoadmap = (collab) => {
    try {
      const savedRoadmap = JSON.parse(localStorage.getItem("ev_user_roadmap") || "[]");
      savedRoadmap.push({
        id: `task_${Date.now()}`,
        title: `Partner Milestone: ${collab.milestone} with ${collab.partner}`,
        category: "Ecosystem Collaboration",
        partner: collab.partner,
        status: "In Progress",
        addedAt: new Date().toISOString(),
      });
      localStorage.setItem("ev_user_roadmap", JSON.stringify(savedRoadmap));
      alert(`✓ Added partner milestone to My Roadmap: "${collab.milestone}"`);
    } catch (e) {
      alert(`✓ Task queued for My Roadmap.`);
    }
  };

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", paddingBottom: 60 }}>
      {/* ====================================================================
          PAGE HEADER & TAB SWITCHER
         ==================================================================== */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="pill" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                <Users size={14} /> Ecosystem Network
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>PAGE 8</span>
            </div>
            <h1 style={{ fontSize: "1.85rem", fontWeight: 800, margin: "6px 0 4px", color: "var(--text-heading)" }}>
              🤝 Collaboration Hub
            </h1>
            <p className="muted" style={{ margin: 0, fontSize: "0.95rem" }}>
              You don't need to own everything yourself. Connect with entrepreneurs whose skills, resources, land, machinery, or capital complement yours.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setActiveTab("my_collabs")}
              className={`pill-option-btn ${activeTab === "my_collabs" ? "active" : ""}`}
              style={{ fontSize: "0.82rem", padding: "8px 14px", position: "relative" }}
            >
              <span>🤝 My Collaborations ({myCollaborations.active.length + myCollaborations.pending.length})</span>
              {myCollaborations.pending.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -6,
                    right: -6,
                    background: "var(--ok)",
                    color: "#fff",
                    borderRadius: "50%",
                    width: 18,
                    height: 18,
                    fontSize: "0.7rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 900,
                  }}
                >
                  {myCollaborations.pending.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`pill-option-btn ${activeTab === "profile" ? "active" : ""}`}
              style={{ fontSize: "0.82rem", padding: "8px 14px" }}
            >
              👤 My Collaboration Profile
            </button>
          </div>
        </div>

        {/* 4 Navigation Sub-Tabs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 10,
            marginTop: 20,
            paddingTop: 16,
            borderTop: "1px solid var(--line)",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("explore")}
            className={`pill-option-btn ${activeTab === "explore" ? "active" : ""}`}
            style={{ fontSize: "0.86rem", padding: "10px", fontWeight: 800 }}
          >
            🔍 Explore Matches ({ENTREPRENEUR_PROFILES.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("needs_config")}
            className={`pill-option-btn ${activeTab === "needs_config" ? "active" : ""}`}
            style={{ fontSize: "0.86rem", padding: "10px", fontWeight: 800 }}
          >
            🎯 What Are You Looking For? (8.1)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`pill-option-btn ${activeTab === "profile" ? "active" : ""}`}
            style={{ fontSize: "0.86rem", padding: "10px", fontWeight: 800 }}
          >
            👤 My Collaboration Profile (8.2)
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("my_collabs")}
            className={`pill-option-btn ${activeTab === "my_collabs" ? "active" : ""}`}
            style={{ fontSize: "0.86rem", padding: "10px", fontWeight: 800 }}
          >
            📋 Active & Pending Requests (8.6)
          </button>
        </div>
      </div>

      {/* ====================================================================
          TAB 1: PAGE 8 — EXPLORE COMPLEMENTARY MATCHES
         ==================================================================== */}
      {activeTab === "explore" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Search & Intent Filter Bar */}
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
                  placeholder="Search people, skills, equipment, land, or business ideas..."
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

              {/* Filter Pills */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  { id: "all", label: "All Matches" },
                  { id: "skills", label: "👤 Has Skills" },
                  { id: "funding", label: "💰 Funding / Capital" },
                  { id: "resources", label: "🏭 Has Resources" },
                  { id: "partner", label: "🤝 Joint Venture" },
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

          {/* Complementary Connection Cards Grid */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {filteredProfiles.map((profile) => (
              <div
                key={profile.id}
                className="card"
                style={{
                  border: "1px solid var(--line-glow)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                {/* Profile Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        background: "rgba(99, 102, 241, 0.12)",
                        border: "1px solid var(--line-glow)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.6rem",
                        flexShrink: 0,
                      }}
                    >
                      {profile.avatarIcon}
                    </div>

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "var(--text-heading)" }}>
                          {profile.name}
                        </h3>
                        <span style={{ fontSize: "0.74rem", color: "var(--muted)" }}>
                          {profile.handle}
                        </span>
                        <span className="badge-verified" style={{ fontSize: "0.7rem" }}>
                          ✓ Complementary Match
                        </span>
                      </div>

                      <div style={{ display: "flex", gap: 14, marginTop: 4, fontSize: "0.8rem", color: "var(--muted)", flexWrap: "wrap" }}>
                        <span>💼 {profile.role}</span>
                        <span>📍 {profile.location}</span>
                        <span>🍊 {profile.primaryInterest}</span>
                      </div>
                    </div>
                  </div>

                  {/* Compatibility Score */}
                  <div
                    style={{
                      background: "rgba(16, 185, 129, 0.08)",
                      border: "1px solid var(--ok-border)",
                      padding: "6px 14px",
                      borderRadius: 12,
                      textAlign: "right",
                    }}
                  >
                    <span style={{ fontSize: "0.68rem", color: "var(--muted)", textTransform: "uppercase", fontWeight: 800 }}>
                      Match Score
                    </span>
                    <div style={{ fontSize: "1.2rem", fontWeight: 900, color: "var(--ok)" }}>
                      {profile.suitabilityScore}%
                    </div>
                  </div>
                </div>

                {/* What They Offer vs What They Need Side-by-Side */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
                  <div style={{ background: "var(--panel-subtle)", padding: 12, borderRadius: 12, border: "1px solid var(--line)" }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--ok)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
                      <CheckCircle2 size={12} /> What They Offer:
                    </span>
                    <ul style={{ margin: "6px 0 0 16px", padding: 0, fontSize: "0.78rem", color: "var(--text-heading)", lineHeight: 1.5 }}>
                      {profile.offers.map((o, idx) => (
                        <li key={idx}>
                          {o.icon} {o.title}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ background: "var(--panel-subtle)", padding: 12, borderRadius: 12, border: "1px solid var(--line)" }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
                      <Search size={12} /> Looking For:
                    </span>
                    <ul style={{ margin: "6px 0 0 16px", padding: 0, fontSize: "0.78rem", color: "var(--text-heading)", lineHeight: 1.5 }}>
                      {profile.needs.map((n, idx) => (
                        <li key={idx}>
                          {n.icon} {n.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* PAGE 8.3 — DSS COMPLEMENTARY MATCH EXPLANATION */}
                <div
                  style={{
                    background: "rgba(99, 102, 241, 0.06)",
                    padding: "10px 14px",
                    borderRadius: 12,
                    border: "1px solid var(--line-glow)",
                    fontSize: "0.78rem",
                  }}
                >
                  <strong style={{ color: "var(--electric-blue)", display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <Handshake size={14} /> POTENTIAL COMPLEMENTARY MATCH
                  </strong>
                  <div style={{ color: "var(--muted)", lineHeight: 1.4 }}>
                    {profile.matchReasons.map((r, idx) => (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ color: "var(--ok)" }}>✓</span> {r}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {profile.collaborationTypes.map((t, idx) => (
                      <span key={idx} className="tag" style={{ fontSize: "0.7rem" }}>
                        {t}
                      </span>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setSelectedProfile(profile)}
                      className="btn-secondary-gloss"
                      style={{ fontSize: "0.8rem", padding: "7px 14px" }}
                    >
                      View Profile
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenRequestModal(profile)}
                      className="btn-primary-gloss"
                      style={{ fontSize: "0.8rem", padding: "7px 16px", display: "inline-flex", alignItems: "center", gap: 6 }}
                    >
                      <UserPlus size={14} />
                      <span>Connect</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 2: PAGE 8.1 — WHAT ARE YOU LOOKING FOR? (INTENT CONFIGURATOR)
         ==================================================================== */}
      {activeTab === "needs_config" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="pill">Two-Sided Intent</span>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>PAGE 8.1</span>
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 6px" }}>
              What are you looking for in a collaborator?
            </h2>
            <p className="muted" style={{ margin: 0, fontSize: "0.88rem" }}>
              Configure your specific requirements and what you can offer. EntreVision matches you with complementary partners without exposing private data.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginTop: 20 }}>
              {/* Option 1: I Need Skills */}
              <div style={{ background: "var(--panel-solid)", padding: 18, borderRadius: 14, border: "1px solid var(--line)" }}>
                <strong style={{ fontSize: "0.95rem", color: "var(--text-heading)", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span>🧠</span> 1. I Need Skills & Technical Expertise
                </strong>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    "Farming & Orchard Management",
                    "Food Processing & Preservation",
                    "Citrus Grafting & Propagation",
                    "Marketing & Brand Building",
                    "Accounting & Financial Modeling",
                    "Logistics & Cold-Chain Operations",
                    "Technology, Web & D2C Systems",
                  ].map((skill) => {
                    const isSelected = needsConfig.skillsNeeded.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleNeedItem("skillsNeeded", skill)}
                        className={`pill-option-btn ${isSelected ? "active" : ""}`}
                        style={{ justifyContent: "flex-start", fontSize: "0.8rem", padding: "8px 12px" }}
                      >
                        <span>{isSelected ? "✓" : "□"}</span>
                        <span>{skill}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Option 2: I Need Resources */}
              <div style={{ background: "var(--panel-solid)", padding: 18, borderRadius: 14, border: "1px solid var(--line)" }}>
                <strong style={{ fontSize: "0.95rem", color: "var(--text-heading)", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span>🏭</span> 2. I Need Access to Resources
                </strong>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    "Agricultural Land in Nagpur Cluster",
                    "Processing Equipment & Juicing Lines",
                    "Dry Warehouse & Grading Shed",
                    "Cold Storage & Ripening Chamber",
                    "Farm Transport Vehicle / Reefer",
                    "Commercial Workspace / Kitchen",
                  ].map((resource) => {
                    const isSelected = needsConfig.resourcesNeeded.includes(resource);
                    return (
                      <button
                        key={resource}
                        type="button"
                        onClick={() => toggleNeedItem("resourcesNeeded", resource)}
                        className={`pill-option-btn ${isSelected ? "active" : ""}`}
                        style={{ justifyContent: "flex-start", fontSize: "0.8rem", padding: "8px 12px" }}
                      >
                        <span>{isSelected ? "✓" : "□"}</span>
                        <span>{resource}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Option 3: I Need Funding */}
              <div style={{ background: "var(--panel-solid)", padding: 18, borderRadius: 14, border: "1px solid var(--line)" }}>
                <strong style={{ fontSize: "0.95rem", color: "var(--text-heading)", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span>💰</span> 3. I'm Looking for Funding / Partners
                </strong>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    "Equity Business Partner",
                    "Co-Founder with Capital",
                    "Angel / Seed Investor",
                    "Joint Venture Partnership",
                    "Shared Infrastructure Consortium",
                  ].map((funding) => {
                    const isSelected = needsConfig.fundingNeeded.includes(funding);
                    return (
                      <button
                        key={funding}
                        type="button"
                        onClick={() => toggleNeedItem("fundingNeeded", funding)}
                        className={`pill-option-btn ${isSelected ? "active" : ""}`}
                        style={{ justifyContent: "flex-start", fontSize: "0.8rem", padding: "8px 12px" }}
                      >
                        <span>{isSelected ? "✓" : "□"}</span>
                        <span>{funding}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Option 4: I Have Something to Offer */}
              <div style={{ background: "var(--panel-solid)", padding: 18, borderRadius: 14, border: "1px solid var(--ok-border)" }}>
                <strong style={{ fontSize: "0.95rem", color: "var(--ok)", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span>🤝</span> 4. What I Can Offer to Partners
                </strong>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    "Capital Contribution",
                    "Agri Land",
                    "Processing Equipment",
                    "Marketing & Technology",
                    "Market Access / Buyers",
                    "Business Idea & Prepared DPR",
                    "Existing Agro Enterprise",
                  ].map((offer) => {
                    const isSelected = needsConfig.whatIOffer.includes(offer);
                    return (
                      <button
                        key={offer}
                        type="button"
                        onClick={() => toggleNeedItem("whatIOffer", offer)}
                        className={`pill-option-btn ${isSelected ? "active" : ""}`}
                        style={{ justifyContent: "flex-start", fontSize: "0.8rem", padding: "8px 12px" }}
                      >
                        <span>{isSelected ? "✓" : "□"}</span>
                        <span>{offer}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="wizard-actions-bar" style={{ marginTop: 24 }}>
              <button
                type="button"
                className="btn-primary-gloss"
                onClick={() => {
                  alert("✓ Collaboration intent saved! Refreshing recommended matches...");
                  setActiveTab("explore");
                }}
              >
                <span>Save Intent & View Matches →</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 3: PAGE 8.2 — MY COLLABORATION PROFILE & PRIVACY CONTROLS
         ==================================================================== */}
      {activeTab === "profile" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="pill">Public Card & Privacy</span>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>PAGE 8.2</span>
            </div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 6px" }}>
              My Collaboration Profile
            </h2>
            <p className="muted" style={{ margin: 0, fontSize: "0.88rem" }}>
              Control what information other entrepreneurs can see. Personal contact numbers and sensitive financial accounts remain 100% private.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20, marginTop: 20 }}>
              {/* Profile Card View */}
              <div style={{ background: "var(--panel-solid)", padding: 20, borderRadius: 16, border: "1px solid var(--line-glow)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: "linear-gradient(135deg, var(--electric-blue), var(--cyan))",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.8rem",
                      color: "#fff",
                    }}
                  >
                    👤
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "var(--text-heading)" }}>
                      {myCollabProfile.name}
                    </h3>
                    <div style={{ fontSize: "0.8rem", color: "var(--muted)", marginTop: 2 }}>
                      📍 {myCollabProfile.location} • 🍊 {myCollabProfile.businessInterest}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div>
                    <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--ok)", textTransform: "uppercase" }}>
                      I Can Offer
                    </span>
                    <ul style={{ margin: "4px 0 0 16px", padding: 0, fontSize: "0.84rem", color: "var(--text-heading)", lineHeight: 1.5 }}>
                      {myCollabProfile.offers.map((o, idx) => (
                        <li key={idx}>✓ {o}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase" }}>
                      I Am Looking For
                    </span>
                    <ul style={{ margin: "4px 0 0 16px", padding: 0, fontSize: "0.84rem", color: "var(--text-heading)", lineHeight: 1.5 }}>
                      {myCollabProfile.lookingFor.map((l, idx) => (
                        <li key={idx}>🔍 {l}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Privacy & Visibility Settings */}
              <div style={{ background: "var(--panel-subtle)", padding: 20, borderRadius: 16, border: "1px solid var(--line)" }}>
                <strong style={{ fontSize: "0.95rem", color: "var(--text-heading)", display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <Lock size={16} color="var(--cyan)" /> Profile Visibility Controls
                </strong>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { id: "relevant_matches", label: "● Visible to Relevant Matches Only (Recommended)", desc: "Only founders with complementary needs see your profile card." },
                    { id: "everyone", label: "○ Visible to Everyone in Network", desc: "Open to all registered entrepreneurs." },
                    { id: "private", label: "○ Private (Paused / Hidden)", desc: "Temporarily hide profile from match discovery." },
                  ].map((v) => (
                    <div
                      key={v.id}
                      onClick={() => setMyCollabProfile((prev) => ({ ...prev, visibility: v.id }))}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 10,
                        background: myCollabProfile.visibility === v.id ? "rgba(99, 102, 241, 0.1)" : "var(--panel-solid)",
                        border: myCollabProfile.visibility === v.id ? "1px solid var(--electric-blue)" : "1px solid var(--line)",
                        cursor: "pointer",
                      }}
                    >
                      <strong style={{ fontSize: "0.82rem", color: "var(--text-heading)" }}>{v.label}</strong>
                      <p style={{ margin: "2px 0 0", fontSize: "0.74rem", color: "var(--muted)" }}>{v.desc}</p>
                    </div>
                  ))}
                </div>

                {/* Privacy Shield Notice */}
                <div
                  style={{
                    marginTop: 16,
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: "rgba(16, 185, 129, 0.08)",
                    border: "1px solid var(--ok-border)",
                    fontSize: "0.74rem",
                    color: "var(--muted)",
                    lineHeight: 1.4,
                  }}
                >
                  <strong style={{ color: "var(--ok)", display: "block", marginBottom: 2 }}>
                    🛡️ Privacy Guarantee
                  </strong>
                  Your mobile number, email, address, and uploaded bank documents are never made public. Connections must be mutually accepted first.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 4: PAGE 8.6 — MY COLLABORATIONS (PENDING, SENT & ACTIVE)
         ==================================================================== */}
      {activeTab === "my_collabs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Active Collaborations Section */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="pill" style={{ color: "var(--ok)", borderColor: "var(--ok-border)" }}>
                Active Partnerships
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--muted)" }}>PAGE 8.6</span>
            </div>
            <h2 style={{ fontSize: "1.45rem", fontWeight: 800, color: "var(--text-heading)", margin: "4px 0 6px" }}>
              🤝 Active Collaborations ({myCollaborations.active.length})
            </h2>

            {myCollaborations.active.length === 0 ? (
              <p className="muted" style={{ fontSize: "0.88rem" }}>
                No active collaborations yet. Explore matches to send partnership requests.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
                {myCollaborations.active.map((collab) => (
                  <div
                    key={collab.id}
                    style={{
                      background: "var(--panel-solid)",
                      padding: 18,
                      borderRadius: 14,
                      border: "1px solid var(--ok-border)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: "1.8rem" }}>{collab.avatarIcon}</span>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "var(--text-heading)" }}>
                              {collab.partner}
                            </h3>
                            <span className="badge-verified" style={{ fontSize: "0.7rem" }}>
                              {collab.collabType}
                            </span>
                          </div>
                          <div style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: 2 }}>
                            📍 {collab.location} • Business: <strong>{collab.business}</strong>
                          </div>
                        </div>
                      </div>

                      <span style={{ fontSize: "0.76rem", color: "var(--ok)", background: "var(--ok-bg)", padding: "4px 10px", borderRadius: 8, fontWeight: 700 }}>
                        ● {collab.status}
                      </span>
                    </div>

                    <div style={{ marginTop: 12, padding: "10px 14px", background: "var(--panel-subtle)", borderRadius: 10, fontSize: "0.8rem" }}>
                      <span style={{ color: "var(--muted)" }}>Current Milestone: </span>
                      <strong style={{ color: "var(--text-heading)" }}>{collab.milestone}</strong>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 10, borderTop: "1px dashed var(--line)", flexWrap: "wrap", gap: 8 }}>
                      <span style={{ fontSize: "0.74rem", color: "var(--muted)" }}>
                        Connected since: {collab.establishedDate}
                      </span>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => handleAddCollabToRoadmap(collab)}
                          className="pill-option-btn active"
                          style={{ fontSize: "0.76rem", padding: "6px 12px" }}
                        >
                          🗺️ Add Milestone to Roadmap
                        </button>
                        <button
                          type="button"
                          onClick={() => alert(`Opening secure direct messenger with ${collab.partner}...`)}
                          className="btn-primary-gloss"
                          style={{ fontSize: "0.76rem", padding: "6px 12px" }}
                        >
                          <MessageSquare size={12} /> Message Partner
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Incoming Requests */}
          <div className="card">
            <h3 style={{ margin: "0 0 10px", fontSize: "1.2rem", fontWeight: 800, color: "var(--text-heading)" }}>
              📥 Pending Incoming Requests ({myCollaborations.pending.length})
            </h3>

            {myCollaborations.pending.length === 0 ? (
              <p className="muted" style={{ fontSize: "0.85rem", margin: 0 }}>
                No pending requests from other entrepreneurs.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {myCollaborations.pending.map((req) => (
                  <div
                    key={req.id}
                    style={{
                      background: "rgba(99, 102, 241, 0.04)",
                      padding: 16,
                      borderRadius: 14,
                      border: "1px solid var(--line-glow)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ fontSize: "1.6rem" }}>{req.avatarIcon}</span>
                        <div>
                          <strong style={{ fontSize: "1rem", color: "var(--text-heading)" }}>
                            {req.sender}
                          </strong>
                          <span style={{ marginLeft: 8, fontSize: "0.74rem", color: "var(--cyan)" }}>
                            ({req.topic})
                          </span>
                          <div style={{ fontSize: "0.74rem", color: "var(--muted)" }}>
                            Received: {req.date}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p style={{ margin: "10px 0 14px", fontSize: "0.84rem", color: "var(--text)", lineHeight: 1.5, background: "var(--panel-solid)", padding: 12, borderRadius: 10 }}>
                      "{req.message}"
                    </p>

                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => alert(`Requested more details from ${req.sender}.`)}
                        className="btn-secondary-gloss"
                        style={{ fontSize: "0.78rem", padding: "6px 12px" }}
                      >
                        Ask for Details
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setMyCollaborations((prev) => ({
                            ...prev,
                            pending: prev.pending.filter((p) => p.id !== req.id),
                          }));
                        }}
                        className="btn-secondary-gloss"
                        style={{ fontSize: "0.78rem", padding: "6px 12px", color: "#ef4444" }}
                      >
                        Decline
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAcceptRequest(req)}
                        className="btn-primary-gloss"
                        style={{ fontSize: "0.78rem", padding: "6px 16px" }}
                      >
                        ✓ Accept & Connect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Outgoing Sent Requests */}
          <div className="card">
            <h3 style={{ margin: "0 0 10px", fontSize: "1.1rem", fontWeight: 800, color: "var(--text-heading)" }}>
              📤 Outgoing Requests Sent ({myCollaborations.sent.length})
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {myCollaborations.sent.map((sent) => (
                <div
                  key={sent.id}
                  style={{
                    background: "var(--panel-subtle)",
                    padding: "12px 16px",
                    borderRadius: 12,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "1.3rem" }}>{sent.avatarIcon}</span>
                    <div>
                      <strong style={{ fontSize: "0.88rem", color: "var(--text-heading)" }}>
                        To: {sent.recipient}
                      </strong>
                      <span style={{ fontSize: "0.76rem", color: "var(--muted)", marginLeft: 8 }}>
                        Topic: {sent.topic} • Sent: {sent.date}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "0.74rem", color: "#f59e0b", fontWeight: 700 }}>
                      ● {sent.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMyCollaborations((prev) => ({
                          ...prev,
                          sent: prev.sent.filter((s) => s.id !== sent.id),
                        }));
                      }}
                      className="btn-secondary-gloss"
                      style={{ fontSize: "0.72rem", padding: "4px 8px" }}
                    >
                      Withdraw
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 1: PAGE 8.4 — ENTREPRENEUR DETAILED PROFILE MODAL
         ==================================================================== */}
      {selectedProfile && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(8px)",
            zIndex: 999,
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
              maxWidth: 640,
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: 24,
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: "2.2rem" }}>{selectedProfile.avatarIcon}</span>
                <div>
                  <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 800, color: "var(--text-heading)" }}>
                    {selectedProfile.name}
                  </h2>
                  <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                    {selectedProfile.role} • 📍 {selectedProfile.location}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProfile(null)}
                style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase" }}>
                  Professional Background & Experience
                </span>
                <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "var(--text)", lineHeight: 1.5 }}>
                  {selectedProfile.experience}
                </p>
              </div>

              <div style={{ background: "var(--panel-subtle)", padding: 14, borderRadius: 12 }}>
                <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--ok)", textTransform: "uppercase" }}>
                  Physical & Technical Assets Offered:
                </span>
                <ul style={{ margin: "6px 0 0 16px", padding: 0, fontSize: "0.82rem", color: "var(--text-heading)", lineHeight: 1.5 }}>
                  {selectedProfile.offers.map((o, idx) => (
                    <li key={idx}>
                      {o.icon} <strong>{o.title}</strong>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ background: "var(--panel-subtle)", padding: 14, borderRadius: 12 }}>
                <span style={{ fontSize: "0.74rem", fontWeight: 800, color: "var(--cyan)", textTransform: "uppercase" }}>
                  Requirements / Looking For:
                </span>
                <ul style={{ margin: "6px 0 0 16px", padding: 0, fontSize: "0.82rem", color: "var(--text-heading)", lineHeight: 1.5 }}>
                  {selectedProfile.needs.map((n, idx) => (
                    <li key={idx}>
                      {n.icon} <strong>{n.title}</strong>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
              <button
                type="button"
                onClick={() => {
                  alert("Profile reported for review.");
                  setSelectedProfile(null);
                }}
                className="btn-secondary-gloss"
                style={{ fontSize: "0.74rem", padding: "6px 10px", color: "var(--muted)" }}
              >
                <Flag size={12} /> Report Profile
              </button>

              <button
                type="button"
                onClick={() => {
                  handleOpenRequestModal(selectedProfile);
                  setSelectedProfile(null);
                }}
                className="btn-primary-gloss"
                style={{ fontSize: "0.85rem", padding: "8px 20px" }}
              >
                <span>Send Collaboration Request →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: PAGE 8.5 — SEND COLLABORATION REQUEST MODAL
         ==================================================================== */}
      {requestRecipient && (
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
              maxWidth: 580,
              width: "100%",
              padding: 24,
              boxShadow: "var(--shadow-lg)",
            }}
          >
            {requestSentNotice ? (
              <div style={{ textAlign: "center", padding: "30px 0" }}>
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>🚀</div>
                <h3 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--ok)", margin: "0 0 6px" }}>
                  Collaboration Request Sent!
                </h3>
                <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--muted)" }}>
                  {requestRecipient.name} has been notified. You can track their response in <strong>My Collaborations</strong>.
                </p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div>
                    <span className="pill" style={{ fontSize: "0.72rem" }}>
                      Collaboration Request
                    </span>
                    <h2 style={{ margin: "6px 0 2px", fontSize: "1.3rem", fontWeight: 800, color: "var(--text-heading)" }}>
                      Connect with {requestRecipient.name}
                    </h2>
                    <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                      {requestRecipient.role} • 📍 {requestRecipient.location}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setRequestRecipient(null)}
                    style={{ background: "transparent", border: "none", color: "var(--muted)", cursor: "pointer" }}
                  >
                    <X size={20} />
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
                      Collaboration Interest Area:
                    </label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      {[
                        "Business Idea & Joint Venture",
                        "Skills & Technical Exchange",
                        "Equipment & Shed Sharing",
                        "Capital & Equity Investment",
                      ].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setRequestTopic(t)}
                          className={`pill-option-btn ${requestTopic === t ? "active" : ""}`}
                          style={{ fontSize: "0.76rem", padding: "6px 10px" }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.76rem", fontWeight: 800, color: "var(--muted)", textTransform: "uppercase", marginBottom: 6 }}>
                      Personalized Message:
                    </label>
                    <textarea
                      rows={5}
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: 12,
                        background: "var(--panel-subtle)",
                        border: "1px solid var(--line)",
                        color: "var(--text-heading)",
                        fontSize: "0.84rem",
                        lineHeight: 1.5,
                        outline: "none",
                        fontFamily: "inherit",
                        resize: "vertical",
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
                  <button
                    type="button"
                    onClick={() => setRequestRecipient(null)}
                    className="btn-secondary-gloss"
                    style={{ fontSize: "0.82rem", padding: "8px 16px" }}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSendCollaborationRequest}
                    className="btn-primary-gloss"
                    style={{ fontSize: "0.82rem", padding: "8px 20px" }}
                  >
                    <Send size={14} />
                    <span>Send Collaboration Request →</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
