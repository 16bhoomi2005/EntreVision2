import React, { useMemo, useState } from "react";
import html2pdf from "html2pdf.js";
import {
  Printer,
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Building2,
  Coins,
  FileText,
  Landmark,
  Scale,
  Award,
  QrCode,
  Download,
  AlertTriangle,
  TrendingUp,
  Clock,
  Users,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { calculateDPRProjections } from "../services/dprEngine";

export default function BankGradeDPRModal({
  isOpen,
  onClose,
  opportunity,
  userProfile,
  capexBreakdown,
  activeLocation,
  ownEquity,
  totalCost,
  subsidyAmount,
  bankLoan,
  roadmapPhases,
}) {
  if (!isOpen) return null;

  // 1. Dynamic Opportunity & Cluster Metadata
  const oppName = opportunity?.name || "Artisanal Candied Citrus Peel & Bakery Inclusions";
  const oppCategory = opportunity?.category || "Food Processing & Value Addition";

  // 2. Financial Figures Resolution
  const resolvedCost = Number(
    totalCost ??
      opportunity?.financial_breakdown?.total_project_cost ??
      opportunity?.total_project_cost ??
      opportunity?.total_cost ??
      opportunity?.capex_inr ??
      180000
  );

  const resolvedEquity = Number(
    ownEquity ??
      userProfile?.finances?.personalSavings ??
      userProfile?.finances?.availableCapitalINR ??
      opportunity?.financial_breakdown?.user_budget ??
      0
  );

  const resolvedSubsidy = Number(
    subsidyAmount ??
      opportunity?.financial_breakdown?.subsidy_amount ??
      Math.round(resolvedCost * 0.35)
  );

  const resolvedLoan = Number(
    bankLoan ?? Math.max(0, resolvedCost - resolvedEquity - resolvedSubsidy)
  );

  const resolvedLocation =
    activeLocation ||
    userProfile?.location ||
    opportunity?.location_relevance ||
    "Katol / Nagpur District, Maharashtra";
  const userName = userProfile?.full_name || userProfile?.name || "Entrepreneur / Promoter";
  const tehsil = resolvedLocation?.split(",")[0]?.trim() || "Katol";

  // 3. Dynamic Archetype Engineering Details matching MoFPI DPR style
  const engineeringSpecs = useMemo(() => {
    const n = oppName.toLowerCase();
    // Benchmark ratio relative to a standard ₹2 Lakh micro-unit
    const scaleFactor = Math.max(0.5, resolvedCost / 200000);

    if (n.includes("diagnostic") || n.includes("clinic") || n.includes("leaf") || n.includes("testing") || n.includes("soil")) {
      const auditsPerDay = Math.max(5, Math.round(15 * Math.min(2.5, scaleFactor)));
      return {
        unitTitle: "MOBILE CITRUS DISEASE DIAGNOSTIC & LEAF HEALTH CLINIC",
        ratedCapacity: `${auditsPerDay} Field Audits / Day (Soil NPK, EC, pH + Phytophthora / HLB Strips)`,
        powerRequirement: "1.5 kVA Solar-Inverter Battery Bank (Zero Industrial Power)",
        waterRequirement: "Zero Industrial Water (Mobile Testing Operation)",
        steps: [
          "Step 1: Receipt of farmer service request & GPS orchard mapping.",
          "Step 2: On-farm core soil sampling and citrus leaf tissue collection.",
          "Step 3: Spectrophotometric optical assay for primary NPK and trace micronutrients.",
          "Step 4: Lateral-flow rapid immunodiagnostic assay for Phytophthora & Greening (HLB).",
          "Step 5: Immediate digital report generation and prescription of remedial bio-fungicides.",
        ],
        equipmentList: Array.isArray(capexBreakdown) && capexBreakdown.length > 0
          ? capexBreakdown.map((item, idx) => ({
              name: item.name || `Field Testing Apparatus - Line ${idx + 1}`,
              qty: "1 Unit",
              cost: Math.round(resolvedCost * (item.pct || 1 / capexBreakdown.length)),
              spec: "Certified testing specification",
            }))
          : [
              { name: "Portable Leaf Spectrophotometer (Visible / NIR calibrated)", qty: "1 No.", cost: Math.round(resolvedCost * 0.38), spec: "Digital multi-wavelength optical assay" },
              { name: "Digital Soil EC / pH & NPK Multiparameter Sensor Kit", qty: "2 Sets", cost: Math.round(resolvedCost * 0.16), spec: "Titanium probe with temperature compensation" },
              { name: "Handheld Digital Field Microscope (400x LCD Display)", qty: "1 No.", cost: Math.round(resolvedCost * 0.12), spec: "High-definition camera with scale calibration" },
              { name: "Phytophthora & HLB Rapid Immunodiagnostic Test Strips", qty: `${Math.round(400 * scaleFactor)} Strips`, cost: Math.round(resolvedCost * 0.18), spec: "Lateral flow antigen-antibody strips" },
              { name: "All-Weather Shockproof Mobile Field Transit Casing", qty: "1 Set", cost: Math.max(0, Math.round(resolvedCost * 0.16)), spec: "Waterproof IP67 ruggedized field case" },
            ],
        civilList: [
          { item: "Office & Sample Preparation Desk (Within Existing Premises)", spec: "Brick masonry with anti-static vinyl table", area: `${Math.round(15 * Math.min(2, scaleFactor))} sq. m`, rate: "2,000", cost: Math.round(resolvedCost * 0.10) },
          { item: "Mobile Van / Two-Wheeler Outfitting & Solar Inverter Frame", spec: "MS bracket framing with vibration dampers", area: "L.S.", rate: "-", cost: Math.round(resolvedCost * 0.12) },
        ],
        dailyRevenueHeads: [
          { head: `Orchard Soil & Plant Diagnostic Audit Fees (${Math.round(auditsPerDay * 0.8)} Audits @ ₹350/audit)`, amount: Math.round(auditsPerDay * 0.8 * 350) },
          { head: `Rapid Phytophthora Specific Assay Strips (${Math.round(auditsPerDay * 0.35)} Tests @ ₹250/test)`, amount: Math.round(auditsPerDay * 0.35 * 250) },
          { head: "Technical Prescription & Micronutrient Schedule Delivery", amount: Math.round(550 * scaleFactor) },
        ],
        dailyExpenditureHeads: [
          { head: "Fuel & Field Mobility Expenses (Two-Wheeler / Field Van)", amount: Math.round(550 * Math.min(2, scaleFactor)) },
          { head: "Chemical Reagents & Test Buffer Consumables", amount: Math.round(650 * scaleFactor) },
          { head: "Technical Agronomist Remuneration (Pro-rated)", amount: Math.round(720 * scaleFactor) },
          { head: "Equipment Maintenance & Sensor Replacement Buffer", amount: Math.round(200 * scaleFactor) },
        ],
      };
    }

    if (n.includes("nursery") || n.includes("budding") || n.includes("propagation") || n.includes("rootstock")) {
      const annualSaplings = Math.round(25000 * scaleFactor);
      const dailyDispatches = Math.max(20, Math.round(80 * scaleFactor));
      return {
        unitTitle: "CERTIFIED DISEASE-FREE CITRUS BUDWOOD & ROOTSTOCK PROPAGATION UNIT",
        ratedCapacity: `${annualSaplings.toLocaleString("en-IN")} Certified Saplings / Annum (Batch size: ~${Math.round(annualSaplings / 3).toLocaleString("en-IN")})`,
        powerRequirement: "5 HP Agricultural Borewell Connection + Automated Timer Grid",
        waterRequirement: `${Math.round(12000 * scaleFactor).toLocaleString("en-IN")} Litres / Day (Micro-Sprinkler & Misting Network)`,
        steps: [
          "Step 1: Sterilization of potting soil, vermicompost, and sand media.",
          "Step 2: Sowing of disease-tolerant Rangpur Lime rootstock seeds in raised beds.",
          "Step 3: Transfer of seedlings to UV-stabilized poly grow bags after 6 months.",
          "Step 4: Certified mother scion budwood procurement from ICAR-CCRI demonstration blocks.",
          "Step 5: T-Budding grafting execution by certified master grafters.",
          "Step 6: Hardening under 50% UV shade-net polyhouse mist chamber.",
          "Step 7: State Horticulture inspection, tagging, and farmer distribution.",
        ],
        equipmentList: Array.isArray(capexBreakdown) && capexBreakdown.length > 0
          ? capexBreakdown.map((item, idx) => ({
              name: item.name || `Nursery Infrastructure - Unit ${idx + 1}`,
              qty: "1 Unit",
              cost: Math.round(resolvedCost * (item.pct || 1 / capexBreakdown.length)),
              spec: "Certified horticultural standard",
            }))
          : [
              { name: "UV-Stabilized 50% Shade-Net Polyhouse (GI Tubular Pipe Structure)", qty: `${Math.round(1000 * Math.min(2.5, scaleFactor))} sq. m`, cost: Math.round(resolvedCost * 0.42), spec: "GI class B pipes with anti-drip UV mesh" },
              { name: "Automated Micro-Sprinkler & Misting Fertigation Grid", qty: "1 Set", cost: Math.round(resolvedCost * 0.18), spec: "High-pressure foggers with digital timer" },
              { name: "Motorized Potting Media & Soil Blender Machine", qty: "1 Unit", cost: Math.round(resolvedCost * 0.12), spec: "2 HP single-phase rotary mixing drum" },
              { name: "Rangpur Lime Rootstocks & CCRI Certified Scion Budsticks", qty: `${Math.round(5000 * scaleFactor).toLocaleString("en-IN")} Nos`, cost: Math.round(resolvedCost * 0.16), spec: "Virus-free certified indexed budwood" },
              { name: "Carbon-Steel Budding Knives, Grafting Shears & Pruners", qty: "5 Kits", cost: Math.max(0, Math.round(resolvedCost * 0.12)), spec: "Imported surgical-grade cutlery" },
            ],
        civilList: [
          { item: "Polyhouse GI Erection & Anchor Base Footings", spec: "PCC 1:2:4 footings with GI ground anchors", area: `${Math.round(1000 * Math.min(2.5, scaleFactor))} sq. m`, rate: "250", cost: Math.round(resolvedCost * 0.35) },
          { item: "Soil Media Mixing & Sterilization Yard", spec: "PCC raised platform with brick perimeter", area: `${Math.round(60 * Math.min(2, scaleFactor))} sq. m`, rate: "1,500", cost: Math.round(resolvedCost * 0.10) },
        ],
        dailyRevenueHeads: [
          { head: `Certified Nagpur Mandarin Sapling Dispatches (${dailyDispatches} saplings/day @ ₹120/plant)`, amount: dailyDispatches * 120 },
          { head: "Mother Scion Budwood Stick Sales to secondary nurseries", amount: Math.round(1400 * scaleFactor) },
          { head: "Sterilized Potting Soil & Bio-Nutrient Bag Sales", amount: Math.round(800 * scaleFactor) },
        ],
        dailyExpenditureHeads: [
          { head: "Master Grafters & Nursery Caretakers Remuneration", amount: Math.round(1120 * scaleFactor) },
          { head: "Water Pumping Electricity & Borewell Utilities", amount: Math.round(350 * scaleFactor) },
          { head: "Bio-Fungicides, Organic Manure & Potting Media Buffer", amount: Math.round(750 * scaleFactor) },
          { head: "Polybag Consumables & Shade Net Maintenance", amount: Math.round(280 * scaleFactor) },
        ],
      };
    }

    if (n.includes("juice") || n.includes("shake") || n.includes("kiosk") || n.includes("beverage")) {
      const dailyBottles = Math.max(150, Math.round(500 * scaleFactor));
      const fruitKg = Math.round(dailyBottles * 1.2);
      return {
        unitTitle: "COLD-PRESSED CITRUS JUICE & READY-TO-SERVE (RTS) BEVERAGES UNIT",
        ratedCapacity: `${Math.round(dailyBottles * 0.6)} Litres / Day (${dailyBottles} Bottles of 500ml Cold-Pressed Juice)`,
        powerRequirement: "10 kW 3-Phase Commercial Power Sanction + 5 kVA Backup DG",
        waterRequirement: `${Math.round(1500 * Math.min(2, scaleFactor))} Litres / Day (RO Purified Food Processing Water)`,
        steps: [
          "Step 1: Receipt of farm-gate sweet orange (Nagpur Mandarin) crates.",
          "Step 2: Fruit washing, surface sanitization, and manual inspection conveyor.",
          "Step 3: Continuous cold-press extraction with automatic peel & seed separation.",
          "Step 4: Enzymatic debittering & inline tubular flash pasteurization (72°C for 15s).",
          "Step 5: Chilling to 4°C and automated bottling in recyclable food-grade PET/Glass.",
          "Step 6: Tamper-evident induction foil sealing, batch coding, and cold dispatch.",
        ],
        equipmentList: Array.isArray(capexBreakdown) && capexBreakdown.length > 0
          ? capexBreakdown.map((item, idx) => ({
              name: item.name || `Beverage Processing Equipment - Unit ${idx + 1}`,
              qty: "1 Unit",
              cost: Math.round(resolvedCost * (item.pct || 1 / capexBreakdown.length)),
              spec: "SS-304 food contact certified",
            }))
          : [
              { name: "Continuous SS-304 Automatic Citrus Extractor & De-Oiler", qty: "1 Unit", cost: Math.round(resolvedCost * 0.35), spec: "300 kg/hr fruit capacity, SS-304 contact parts" },
              { name: "Inline Tubular Flash Pasteurizer & Plate Chiller", qty: "1 Set", cost: Math.round(resolvedCost * 0.22), spec: "Food grade tubular heat exchanger" },
              { name: "Semi-Automatic 4-Head Bottling, Capping & Induction Sealer", qty: "1 Unit", cost: Math.round(resolvedCost * 0.16), spec: "Volumetric liquid filling 20–30 BPM" },
              { name: "Commercial Cold Storage Chiller / Mobile Kiosk Cart", qty: "1 Unit", cost: Math.round(resolvedCost * 0.15), spec: "Emerson compressor PUF insulated body" },
              { name: "Industrial RO Water Purification Unit (500 LPH)", qty: "1 Set", cost: Math.max(0, Math.round(resolvedCost * 0.12)), spec: "Dual membrane SS-304 skid" },
            ],
        civilList: [
          { item: "Processing Hall Epoxy Washdown Flooring", spec: "FSSAI compliant 3mm food-grade epoxy with coving", area: `${Math.round(80 * Math.min(2, scaleFactor))} sq. m`, rate: "2,500", cost: Math.round(resolvedCost * 0.15) },
          { item: "Sanitary Drainage & Wash Station Partitions", spec: "Stainless drain channels with insect screens", area: "L.S.", rate: "-", cost: Math.round(resolvedCost * 0.08) },
        ],
        dailyRevenueHeads: [
          { head: `Cold-Pressed Fresh Mandarin Juice (${dailyBottles} Bottles @ ₹40/bottle)`, amount: dailyBottles * 40 },
          { head: `Fresh Pulp & Citrus Fruit Cups (${Math.round(dailyBottles * 0.16)} Units @ ₹30/unit)`, amount: Math.round(dailyBottles * 0.16 * 30) },
          { head: `Bulk Citrus Rind / Peel Sales to extraction buyers (${Math.round(fruitKg * 0.5)} kg @ ₹2/kg)`, amount: Math.round(fruitKg * 0.5 * 2) },
        ],
        dailyExpenditureHeads: [
          { head: `Farm-Gate Orange Sourcing (${fruitKg} kg @ ₹18/kg Mandi Rate)`, amount: fruitKg * 18 },
          { head: `Food-Grade Recyclable Bottles, Caps & Labels (${dailyBottles} units @ ₹4.50)`, amount: Math.round(dailyBottles * 4.5) },
          { head: "Plant Electricity, RO Water & Cold Storage Power", amount: Math.round(850 * scaleFactor) },
          { head: "Operator & Helper Remuneration (Pro-rated)", amount: Math.round(1440 * scaleFactor) },
        ],
      };
    }

    // Default: Candied Citrus Peel & Bakery Inclusions
    const dailyKg = Math.max(25, Math.round(60 * scaleFactor));
    const rawPeelKg = Math.round(dailyKg * 3.0);
    return {
      unitTitle: "ARTISANAL CANDIED CITRUS PEEL & BAKERY INCLUSIONS PROCESSING UNIT",
      ratedCapacity: `${dailyKg} kg Finished Candied Peel / Day (~${(dailyKg * 25).toLocaleString("en-IN")} kg Monthly Output)`,
      powerRequirement: "12 kW 3-Phase Commercial Power + Hybrid Solar Thermal Drying",
      waterRequirement: `${Math.round(1000 * Math.min(2, scaleFactor))} Litres / Day (Blanching, Curing & Washdown)`,
      steps: [
        "Step 1: Receipt of fresh citrus peels from packing houses and juice units.",
        "Step 2: Food-grade rotary washing to remove dirt and essential oil surface bitterness.",
        "Step 3: Hydro-blanching in SS-316 kettles to soften albedo and open cellular pores.",
        "Step 4: Osmotic slow-sugar syruping over 48 hours to achieve 68° Brix equilibrium.",
        "Step 5: Controlled dehydration in hybrid solar tunnel cabinet dryer at 55°C.",
        "Step 6: Precision shredding, dicing (6mm bakery cubes), and corn-starch dusting.",
        "Step 7: Vacuum nitrogen-flush barrier pouch packaging in 1kg and 5kg catering packs.",
      ],
      equipmentList: Array.isArray(capexBreakdown) && capexBreakdown.length > 0
        ? capexBreakdown.map((item, idx) => ({
            name: item.name || `Peel Processing Machinery - Unit ${idx + 1}`,
            qty: "1 Unit",
            cost: Math.round(resolvedCost * (item.pct || 1 / capexBreakdown.length)),
            spec: "SS-304/316 food contact certified",
          }))
        : [
            { name: "SS-316 Double-Jacketed Steam Blanching & Syruping Kettles", qty: "2 Nos", cost: Math.round(resolvedCost * 0.32), spec: "Tilting type, SS-316 food contact, 100L capacity" },
            { name: "Hybrid Solar Tunnel Dehydrator Cabinet (50 kg batch capacity)", qty: "1 Unit", cost: Math.round(resolvedCost * 0.24), spec: "Polycarbonate glazed cabinet with axial exhaust" },
            { name: "Electric Citrus Peel Slicer, Dicer & Shredder Machine", qty: "1 Unit", cost: Math.round(resolvedCost * 0.18), spec: "High-speed rotary hardened SS blades (0.5 HP)" },
            { name: "Industrial Heavy-Duty Chamber Vacuum Packaging Machine", qty: "1 Unit", cost: Math.round(resolvedCost * 0.14), spec: "Nitrogen gas flush option, dual sealing bars" },
            { name: "Digital Optical Brix Refractometer & Food Testing Toolset", qty: "1 Kit", cost: Math.max(0, Math.round(resolvedCost * 0.12)), spec: "0–90° Brix range with automatic temp compensation" },
          ],
      civilList: [
        { item: "Food-Grade Washable Epoxy Flooring & Wall Coving", spec: "FSSAI compliant 3mm polyurethane epoxy", area: `${Math.round(50 * Math.min(2, scaleFactor))} sq. m`, rate: "2,200", cost: Math.round(resolvedCost * 0.12) },
        { item: "Stainless Steel Prep Tables & Washing Drain Channels", spec: "SS-304 tables with grease trap drains", area: "L.S.", rate: "-", cost: Math.round(resolvedCost * 0.08) },
      ],
      dailyRevenueHeads: [
        { head: `Commercial Candied Peel Cubes (${Math.round(dailyKg * 0.83)} kg @ ₹190/kg to bakeries)`, amount: Math.round(dailyKg * 0.83 * 190) },
        { head: `Retail Packaged Gourmet Candied Peel (${Math.round(dailyKg * 0.17)} kg @ ₹260/kg in retail jars)`, amount: Math.round(dailyKg * 0.17 * 260) },
        { head: `Residual Citrus Flavored Sugar Syrup (${Math.round(dailyKg * 0.41)} L @ ₹40/L to confectionery)`, amount: Math.round(dailyKg * 0.41 * 40) },
      ],
      dailyExpenditureHeads: [
        { head: `Raw Citrus Peel Sourcing (${rawPeelKg} kg raw peels @ ₹4/kg)`, amount: rawPeelKg * 4 },
        { head: `Food-Grade Sucrose & Pectin Consumables (${Math.round(dailyKg * 0.67)} kg @ ₹42/kg)`, amount: Math.round(dailyKg * 0.67 * 42) },
        { head: "Gas/Power for Steam Blanching & Dehydration Blowers", amount: Math.round(650 * scaleFactor) },
        { head: "Operator & Helper Remuneration (Pro-rated)", amount: Math.round(960 * scaleFactor) },
      ],
    };
  }, [oppName, resolvedCost, capexBreakdown]);

  // 4. Financial Model & Cash Flows
  const financialModel = useMemo(() => {
    return calculateDPRProjections({
      totalCost: resolvedCost,
      ownEquity: resolvedEquity,
      subsidyAmount: resolvedSubsidy,
      bankLoan: resolvedLoan,
      opportunityName: oppName,
      category: oppCategory,
      location: resolvedLocation,
    });
  }, [resolvedCost, resolvedEquity, resolvedSubsidy, resolvedLoan, oppName, oppCategory, resolvedLocation]);

  // Daily Totals for Chapter 7 & 8
  const dailyTotalRevenue = engineeringSpecs.dailyRevenueHeads.reduce((sum, h) => sum + h.amount, 0);
  const dailyBaseOpEx = engineeringSpecs.dailyExpenditureHeads.reduce((sum, h) => sum + h.amount, 0);
  const dailyContingency = Math.round(dailyBaseOpEx * 0.10);
  const dailyTotalOpEx = dailyBaseOpEx + dailyContingency;
  const dailyGrossProfit = dailyTotalRevenue - dailyTotalOpEx;
  const monthlyGrossProfit = dailyGrossProfit * 25; // 25 operating days/month

  const dprDocketId = useMemo(() => {
    const hex = Math.random().toString(16).substring(2, 8).toUpperCase();
    return `MH-PMFME-${new Date().getFullYear()}-${hex}`;
  }, []);

  const currentDate = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    const element = document.getElementById("dpr-printable-content");
    if (!element) return;
    setIsExportingPdf(true);

    try {
      const sanitizedName = oppName.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);
      const filename = `DPR_MoFPI_${sanitizedName}_${dprDocketId}.pdf`;

      const opt = {
        margin: [12, 12, 12, 12],
        filename: filename,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          scrollY: 0,
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: {
          mode: ["css", "legacy"],
          before: ".dpr-page-break",
          avoid: [
            "table",
            "tr",
            ".dpr-avoid-break",
            ".dpr-no-break",
            ".dpr-chapter-header",
            ".dpr-section-block",
            "h1",
            "h2",
            "h3",
          ],
        },
      };

      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error("PDF generation failed:", err);
      // Fallback to window.print() if html2pdf runs into DOM issues
      window.print();
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div
      className="dpr-modal-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(10, 15, 30, 0.85)",
        backdropFilter: "blur(8px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        overflowY: "auto",
        padding: "20px 10px",
      }}
    >
      <div
        className="dpr-modal-container"
        style={{
          width: "100%",
          maxWidth: 980,
          background: "var(--panel)",
          border: "1px solid var(--line-glow)",
          borderRadius: 20,
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.45)",
          overflow: "hidden",
          margin: "auto",
        }}
      >
        {/* ====================================================================
            MODAL ACTION BAR (Hidden in Print)
           ==================================================================== */}
        <div
          className="dpr-screen-toolbar"
          style={{
            background: "linear-gradient(90deg, #1e1b4b 0%, #312e81 100%)",
            color: "#ffffff",
            padding: "14px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            borderBottom: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.4rem" }}>🏛️</span>
            <div>
              <div style={{ fontSize: "0.95rem", fontWeight: 800 }}>
                Ministry of Food Processing Industries (MoFPI) Detailed Project Report
              </div>
              <div style={{ fontSize: "0.74rem", opacity: 0.85 }}>
                Conforms to Official MoFPI Techno-Economic Feasibility Standards & Guidelines
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 10,
                background: isExportingPdf ? "#374151" : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#ffffff",
                border: "none",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: isExportingPdf ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(16, 185, 129, 0.35)",
                transition: "all 0.2s ease",
              }}
            >
              {isExportingPdf ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Generating PDF...
                </>
              ) : (
                <>
                  <Download size={16} /> Download .PDF File
                </>
              )}
            </button>

            <button
              onClick={() => window.print()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 16px",
                borderRadius: 10,
                background: "#4f46e5",
                color: "#ffffff",
                border: "none",
                fontWeight: 700,
                fontSize: "0.82rem",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(79, 70, 229, 0.35)",
              }}
            >
              <Printer size={16} /> Print / Save via Browser
            </button>

            <button
              onClick={() => window.open("https://pmfme.mofpi.gov.in", "_blank")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 10,
                background: "rgba(255, 255, 255, 0.12)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                fontWeight: 700,
                fontSize: "0.80rem",
                cursor: "pointer",
              }}
            >
              <ExternalLink size={14} /> PMFME Portal
            </button>

            <button
              onClick={() => window.open("https://www.jansamarth.in", "_blank")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 14px",
                borderRadius: 10,
                background: "rgba(255, 255, 255, 0.12)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                fontWeight: 700,
                fontSize: "0.80rem",
                cursor: "pointer",
              }}
            >
              <ExternalLink size={14} /> JanSamarth Portal
            </button>

            <button
              onClick={onClose}
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "8px",
                borderRadius: 10,
                background: "rgba(255, 255, 255, 0.12)",
                color: "#ffffff",
                border: "none",
                cursor: "pointer",
              }}
              title="Close Modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ====================================================================
            OFFICIAL MOFPI FORMAT DPR DOCUMENT BODY
           ==================================================================== */}
        <div
          id="dpr-printable-content"
          style={{
            padding: "40px 48px",
            background: "var(--panel)",
            color: "var(--text-heading)",
            lineHeight: 1.6,
          }}
        >
          {/* ==================================================================
              PAGE 1: OFFICIAL MOFPI COVER & TITLE PAGE
             ================================================================== */}
          <div
            style={{
              textAlign: "center",
              border: "3px double var(--line-glow)",
              padding: "48px 32px",
              marginBottom: 40,
              background: "var(--panel-subtle)",
              borderRadius: 12,
            }}
          >
            <div style={{ fontSize: "1.45rem", fontWeight: 900, letterSpacing: 2, color: "var(--text-heading)" }}>
              TECHNO-ECONOMIC FEASIBILITY REPORT
            </div>
            <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--cyan)", margin: "10px 0" }}>
              ON
            </div>
            <h1 style={{ fontSize: "1.85rem", fontWeight: 900, color: "var(--accent)", margin: "12px 0 20px" }}>
              ESTABLISHMENT OF {engineeringSpecs.unitTitle}
            </h1>
            <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-heading)", letterSpacing: 1.5 }}>
              FOR
            </div>
            <div style={{ fontSize: "1.35rem", fontWeight: 900, color: "#e11d48", margin: "10px 0 32px" }}>
              MINISTRY OF FOOD PROCESSING INDUSTRIES (MoFPI)
            </div>
            <div style={{ fontSize: "0.86rem", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase" }}>
              GOVERNMENT OF INDIA • PRADHAN MANTRI FORMALISATION OF MICRO FOOD PROCESSING ENTERPRISES (PMFME)
            </div>

            <div style={{ height: 40 }} />

            <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "var(--muted)" }}>
              PREPARED BY
            </div>
            <div style={{ fontSize: "1.15rem", fontWeight: 900, color: "var(--text-heading)", marginTop: 4 }}>
              {userName.toUpperCase()}
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              IN COLLABORATION WITH ENTREVISION DECISION SUPPORT SYSTEM
            </div>
            <div style={{ fontSize: "0.88rem", fontWeight: 700, marginTop: 6 }}>
              {resolvedLocation.toUpperCase()}
            </div>
            <div style={{ fontSize: "0.82rem", color: "var(--cyan)", marginTop: 10 }}>
              DOCKET ID: {dprDocketId} • {currentDate.toUpperCase()}
            </div>
          </div>

          {/* ==================================================================
              PAGE 2: TABLE OF CONTENTS (EXACT MOFPI FORMAT)
             ================================================================== */}
          <div className="dpr-page-break" style={{ marginBottom: 36 }}>
            <h2 style={{ textAlign: "center", fontSize: "1.4rem", fontWeight: 900, letterSpacing: 2, marginBottom: 20 }}>
              CONTENTS
            </h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ background: "var(--panel-solid)", borderBottom: "2px solid var(--line)" }}>
                  <th style={{ padding: "10px 14px", width: "16%", textAlign: "left" }}>Chapter</th>
                  <th style={{ padding: "10px 14px", width: "68%", textAlign: "left" }}>Title</th>
                  <th style={{ padding: "10px 14px", width: "16%", textAlign: "right" }}>Page No.</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "9px 14px", fontWeight: 800 }}>Chapter 1</td>
                  <td style={{ padding: "9px 14px" }}>Introduction & Project Objectives</td>
                  <td style={{ padding: "9px 14px", textAlign: "right", fontWeight: 700 }}>1–2</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "9px 14px", fontWeight: 800 }}>Chapter 2</td>
                  <td style={{ padding: "9px 14px" }}>Plant Description & Technical Flow Process</td>
                  <td style={{ padding: "9px 14px", textAlign: "right", fontWeight: 700 }}>3–4</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "9px 14px", fontWeight: 800 }}>Chapter 3</td>
                  <td style={{ padding: "9px 14px" }}>Brief Technical Specifications of Proposed Equipment</td>
                  <td style={{ padding: "9px 14px", textAlign: "right", fontWeight: 700 }}>5–6</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "9px 14px", fontWeight: 800 }}>Chapter 4</td>
                  <td style={{ padding: "9px 14px" }}>Particulars of Civil Building Works & Their Cost Estimates</td>
                  <td style={{ padding: "9px 14px", textAlign: "right", fontWeight: 700 }}>7–8</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "9px 14px", fontWeight: 800 }}>Chapter 5</td>
                  <td style={{ padding: "9px 14px" }}>Particulars of Plant & Equipment & Their Installed Cost</td>
                  <td style={{ padding: "9px 14px", textAlign: "right", fontWeight: 700 }}>9–10</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "9px 14px", fontWeight: 800 }}>Chapter 6</td>
                  <td style={{ padding: "9px 14px" }}>Manpower Requirement with Estimated Monthly Remuneration</td>
                  <td style={{ padding: "9px 14px", textAlign: "right", fontWeight: 700 }}>11</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "9px 14px", fontWeight: 800 }}>Chapter 7</td>
                  <td style={{ padding: "9px 14px" }}>Estimated Expenditure per Day for Rated Capacity Production</td>
                  <td style={{ padding: "9px 14px", textAlign: "right", fontWeight: 700 }}>12</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "9px 14px", fontWeight: 800 }}>Chapter 8</td>
                  <td style={{ padding: "9px 14px" }}>Expected Revenue Earning & Profitability for Rated Capacity</td>
                  <td style={{ padding: "9px 14px", textAlign: "right", fontWeight: 700 }}>13</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "9px 14px", fontWeight: 800 }}>Chapter 9</td>
                  <td style={{ padding: "9px 14px" }}>Project Funding Classification, Working Capital & Government Subsidy</td>
                  <td style={{ padding: "9px 14px", textAlign: "right", fontWeight: 700 }}>14</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "9px 14px", fontWeight: 800 }}>Chapter 10</td>
                  <td style={{ padding: "9px 14px" }}>Five-Year Financial Statements & Debt Service Coverage Ratio (DSCR)</td>
                  <td style={{ padding: "9px 14px", textAlign: "right", fontWeight: 700 }}>15</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "9px 14px", fontWeight: 800 }}>Chapter 11</td>
                  <td style={{ padding: "9px 14px" }}>Statutory Approvals & Digital Verification Signatures</td>
                  <td style={{ padding: "9px 14px", textAlign: "right", fontWeight: 700 }}>16</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ==================================================================
              CHAPTER 1: INTRODUCTION & PROJECT OBJECTIVES
             ================================================================== */}
          <div className="dpr-page-break" style={{ marginBottom: 36 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 900, textTransform: "uppercase" }}>CHAPTER - 1</div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--cyan)", margin: "4px 0" }}>Introduction</h2>
            </div>
            <p style={{ fontSize: "0.88rem", marginBottom: 12 }}>
              Based on the advice and guidelines of the <strong>Ministry of Food Processing Industries (MoFPI)</strong> under the <em>Pradhan Mantri Formalisation of Micro food processing Enterprises (PMFME) Scheme</em>, this Techno-Economic Feasibility Report has been formulated for the establishment of a modern, low-cost processing unit for <strong>{oppName}</strong> in the {resolvedLocation} cluster.
            </p>
            <div style={{ fontSize: "0.92rem", fontWeight: 800, margin: "14px 0 8px" }}>
              The prime objectives of implementation under the Government of India initiative are as follows:
            </div>
            <ol style={{ paddingLeft: 22, fontSize: "0.86rem", color: "var(--text-base)" }}>
              <li style={{ marginBottom: 6 }}>
                <strong>To arrest post-harvest horticultural wastage</strong> (currently averaging 25%–35% across Vidarbha orchards) by converting seasonal citrus surplus into high-value shelf-stable commodities.
              </li>
              <li style={{ marginBottom: 6 }}>
                <strong>To provide hygienically prepared, wholesome, FSSAI-compliant products</strong> to regional bakery, confectionery, and retail consumer markets without chemical adulteration.
              </li>
              <li style={{ marginBottom: 6 }}>
                <strong>To benefit local citrus growers</strong> to receive remunerative prices for their produce through direct aggregation at Katol and Kalamna APMC mandis, eliminating predatory middlemen.
              </li>
              <li style={{ marginBottom: 6 }}>
                <strong>To maximize rural entrepreneurship and employment generation</strong> through decentralized micro-processing infrastructure.
              </li>
            </ol>

            <div style={{ fontSize: "0.92rem", fontWeight: 800, margin: "16px 0 8px" }}>
              Salient Features of the Proposed Model Unit:
            </div>
            <ul style={{ paddingLeft: 22, fontSize: "0.86rem", color: "var(--muted)" }}>
              <li><strong>Rated Operational Capacity:</strong> {engineeringSpecs.ratedCapacity}.</li>
              <li><strong>Power Requirement:</strong> {engineeringSpecs.powerRequirement}.</li>
              <li><strong>Water Requirement:</strong> {engineeringSpecs.waterRequirement}.</li>
              <li><strong>Food Safety & Hygiene:</strong> Conforms to FSSAI Schedule 4 sanitary guidelines with food-grade SS-304/SS-316 contact surfaces.</li>
            </ul>
          </div>

          {/* ==================================================================
              CHAPTER 2: PLANT DESCRIPTION & PROCESS FLOW DIAGRAM
             ================================================================== */}
          <div className="dpr-page-break" style={{ marginBottom: 36 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 900, textTransform: "uppercase" }}>CHAPTER - 2</div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--cyan)", margin: "4px 0" }}>Plant Description</h2>
            </div>
            <p style={{ fontSize: "0.88rem", marginBottom: 14 }}>
              The manufacturing process of producing finished value-added products from farm-gate citrus takes place in a series of systematic sequential operations:
            </p>
            <div style={{ background: "var(--panel-subtle)", padding: 16, borderRadius: 10, fontSize: "0.85rem", marginBottom: 20 }}>
              {engineeringSpecs.steps.map((st, idx) => (
                <div key={idx} style={{ marginBottom: 8, display: "flex", gap: 8 }}>
                  <span style={{ fontWeight: 800, color: "var(--cyan)" }}>{idx + 1}.</span>
                  <span>{st}</span>
                </div>
              ))}
            </div>

            {/* Block Flow Diagram (Exact MoFPI Style) */}
            <div style={{ fontSize: "0.95rem", fontWeight: 800, textAlign: "center", marginBottom: 12 }}>
              BLOCK MATERIAL FLOW DIAGRAM
            </div>
            <div
              style={{
                border: "1px solid var(--line-glow)",
                padding: "20px 14px",
                borderRadius: 10,
                background: "var(--panel-solid)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div style={{ padding: "8px 24px", border: "1px solid var(--line)", borderRadius: 6, fontWeight: 700, fontSize: "0.82rem" }}>
                Raw Citrus Inflow (Farm-Gate Procurement)
              </div>
              <div style={{ fontSize: "1rem", color: "var(--muted)" }}>↓</div>
              <div style={{ padding: "8px 24px", border: "1px solid var(--line)", borderRadius: 6, fontWeight: 700, fontSize: "0.82rem" }}>
                Sanitized Rotary Washing & Surface Cleaning
              </div>
              <div style={{ fontSize: "1rem", color: "var(--muted)" }}>↓</div>
              <div style={{ padding: "8px 24px", border: "1px solid var(--cyan)", borderRadius: 6, fontWeight: 800, fontSize: "0.82rem", color: "var(--cyan)" }}>
                Core Processing: Hydro-Blanching & Osmotic Sugar Curing (SS-316 Kettles)
              </div>
              <div style={{ fontSize: "1rem", color: "var(--muted)" }}>↓</div>
              <div style={{ padding: "8px 24px", border: "1px solid var(--line)", borderRadius: 6, fontWeight: 700, fontSize: "0.82rem" }}>
                Controlled Dehydration (Hybrid Solar Tunnel Cabinet 55°C)
              </div>
              <div style={{ fontSize: "1rem", color: "var(--muted)" }}>↓</div>
              <div style={{ padding: "8px 24px", border: "1px solid var(--ok)", borderRadius: 6, fontWeight: 800, fontSize: "0.82rem", color: "var(--ok)" }}>
                Precision Dicing & Vacuum Nitrogen Packing → Finished Product Dispatch
              </div>
            </div>
          </div>

          {/* ==================================================================
              CHAPTER 3: BRIEF SPECIFICATIONS OF PROPOSED EQUIPMENT
             ================================================================== */}
          <div className="dpr-page-break" style={{ marginBottom: 36 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 900, textTransform: "uppercase" }}>CHAPTER - 3</div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--cyan)", margin: "4px 0" }}>Brief Specification of Proposed Equipment</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {engineeringSpecs.equipmentList.map((eq, idx) => (
                <div key={idx} style={{ padding: 12, border: "1px solid var(--line)", borderRadius: 8, background: "var(--panel-subtle)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontWeight: 800, fontSize: "0.90rem", color: "var(--text-heading)" }}>
                      {idx + 1}. {eq.name}
                    </div>
                    <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--cyan)" }}>{eq.qty}</span>
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "var(--muted)", marginTop: 4 }}>
                    <strong>Technical Specification:</strong> {eq.spec}. Food-grade metallurgy adhering to FSSAI & BIS industrial norms.
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ==================================================================
              CHAPTER 4: PARTICULARS OF CIVIL BUILDING WORKS
             ================================================================== */}
          <div className="dpr-page-break" style={{ marginBottom: 36 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 900, textTransform: "uppercase" }}>CHAPTER - 4</div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--cyan)", margin: "4px 0" }}>Particulars of Civil Building Works & Their Cost Estimates</h2>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
              <thead>
                <tr style={{ background: "var(--panel-solid)", borderBottom: "2px solid var(--line)" }}>
                  <th style={{ padding: "8px 10px", width: "6%" }}>Sl.</th>
                  <th style={{ padding: "8px 10px", width: "34%" }}>Civil Infrastructure Item</th>
                  <th style={{ padding: "8px 10px", width: "30%" }}>Brief Specification</th>
                  <th style={{ padding: "8px 10px", width: "15%", textAlign: "center" }}>Covered Area</th>
                  <th style={{ padding: "8px 10px", width: "15%", textAlign: "right" }}>Total Cost (₹)</th>
                </tr>
              </thead>
              <tbody>
                {engineeringSpecs.civilList.map((cv, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "8px 10px", fontWeight: 700 }}>{idx + 1}</td>
                    <td style={{ padding: "8px 10px", fontWeight: 700 }}>{cv.item}</td>
                    <td style={{ padding: "8px 10px", color: "var(--muted)" }}>{cv.spec}</td>
                    <td style={{ padding: "8px 10px", textAlign: "center" }}>{cv.area}</td>
                    <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 800 }}>
                      ₹{cv.cost.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
                <tr style={{ background: "var(--panel-solid)", fontWeight: 800 }}>
                  <td colSpan={4} style={{ padding: "10px", textAlign: "left" }}>Estimated Total Civil Building Works</td>
                  <td style={{ padding: "10px", textAlign: "right", color: "var(--cyan)" }}>
                    ₹{engineeringSpecs.civilList.reduce((s, c) => s + c.cost, 0).toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ==================================================================
              CHAPTER 5: PARTICULARS OF PLANT & EQUIPMENT WITH INSTALLED COST
             ================================================================== */}
          <div className="dpr-page-break" style={{ marginBottom: 36 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 900, textTransform: "uppercase" }}>CHAPTER - 5</div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--cyan)", margin: "4px 0" }}>Particulars of Plant & Equipment & Their Installed Cost</h2>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
              <thead>
                <tr style={{ background: "var(--panel-solid)", borderBottom: "2px solid var(--line)" }}>
                  <th style={{ padding: "8px 10px", width: "8%" }}>Sl.</th>
                  <th style={{ padding: "8px 10px", width: "62%" }}>Itemized Plant Machinery / Tooling</th>
                  <th style={{ padding: "8px 10px", width: "12%", textAlign: "center" }}>Quantity</th>
                  <th style={{ padding: "8px 10px", width: "18%", textAlign: "right" }}>Installed Cost (₹)</th>
                </tr>
              </thead>
              <tbody>
                {engineeringSpecs.equipmentList.map((eq, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "8px 10px", fontWeight: 700 }}>{idx + 1}</td>
                    <td style={{ padding: "8px 10px", fontWeight: 700 }}>{eq.name}</td>
                    <td style={{ padding: "8px 10px", textAlign: "center", color: "var(--muted)" }}>{eq.qty}</td>
                    <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 800 }}>
                      ₹{eq.cost.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
                <tr style={{ background: "var(--panel-solid)", fontWeight: 900 }}>
                  <td colSpan={3} style={{ padding: "10px", textAlign: "left" }}>Estimated Total Plant & Equipment Cost</td>
                  <td style={{ padding: "10px", textAlign: "right", color: "var(--cyan)", fontSize: "0.95rem" }}>
                    ₹{engineeringSpecs.equipmentList.reduce((s, e) => s + e.cost, 0).toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ==================================================================
              CHAPTER 6: MANPOWER REQUIREMENT WITH REMUNERATION
             ================================================================== */}
          <div className="dpr-page-break" style={{ marginBottom: 36 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 900, textTransform: "uppercase" }}>CHAPTER - 6</div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--cyan)", margin: "4px 0" }}>Manpower Requirement with Estimated Remuneration</h2>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
              <thead>
                <tr style={{ background: "var(--panel-solid)", borderBottom: "2px solid var(--line)" }}>
                  <th style={{ padding: "8px 10px", width: "8%" }}>Sl.</th>
                  <th style={{ padding: "8px 10px", width: "42%" }}>Manpower Designation</th>
                  <th style={{ padding: "8px 10px", width: "15%", textAlign: "center" }}>No Required</th>
                  <th style={{ padding: "8px 10px", width: "17%", textAlign: "right" }}>Remuneration / Head</th>
                  <th style={{ padding: "8px 10px", width: "18%", textAlign: "right" }}>Total / Month</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "8px 10px" }}>1</td>
                  <td style={{ padding: "8px 10px", fontWeight: 700 }}>Unit Manager cum Quality In-Charge</td>
                  <td style={{ padding: "8px 10px", textAlign: "center" }}>1</td>
                  <td style={{ padding: "8px 10px", textAlign: "right" }}>₹18,000</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 800 }}>₹18,000</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "8px 10px" }}>2</td>
                  <td style={{ padding: "8px 10px", fontWeight: 700 }}>Skilled Machine Operator / Grafter</td>
                  <td style={{ padding: "8px 10px", textAlign: "center" }}>1</td>
                  <td style={{ padding: "8px 10px", textAlign: "right" }}>₹12,000</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 800 }}>₹12,000</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "8px 10px" }}>3</td>
                  <td style={{ padding: "8px 10px", fontWeight: 700 }}>Semi-Skilled Material Handlers</td>
                  <td style={{ padding: "8px 10px", textAlign: "center" }}>2</td>
                  <td style={{ padding: "8px 10px", textAlign: "right" }}>₹8,000</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 800 }}>₹16,000</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "8px 10px" }}>4</td>
                  <td style={{ padding: "8px 10px", fontWeight: 700 }}>Packaging & Sanitation Helper</td>
                  <td style={{ padding: "8px 10px", textAlign: "center" }}>1</td>
                  <td style={{ padding: "8px 10px", textAlign: "right" }}>₹6,000</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 800 }}>₹6,000</td>
                </tr>
                <tr style={{ background: "var(--panel-solid)", fontWeight: 900 }}>
                  <td colSpan={4} style={{ padding: "10px", textAlign: "left" }}>Total Monthly Manpower Expenditure</td>
                  <td style={{ padding: "10px", textAlign: "right", color: "var(--cyan)" }}>₹52,000</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ==================================================================
              CHAPTER 7: DAILY OPERATING EXPENDITURE AT RATED CAPACITY
             ================================================================== */}
          <div className="dpr-page-break" style={{ marginBottom: 36 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 900, textTransform: "uppercase" }}>CHAPTER - 7</div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--cyan)", margin: "4px 0" }}>Estimated Expenditure per Day for Rated Capacity Production</h2>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
              <thead>
                <tr style={{ background: "var(--panel-solid)", borderBottom: "2px solid var(--line)" }}>
                  <th style={{ padding: "8px 12px", width: "10%" }}>Sl.</th>
                  <th style={{ padding: "8px 12px", width: "65%" }}>Details of Daily Expenditure</th>
                  <th style={{ padding: "8px 12px", width: "25%", textAlign: "right" }}>Rs. Per Day</th>
                </tr>
              </thead>
              <tbody>
                {engineeringSpecs.dailyExpenditureHeads.map((ex, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "8px 12px", fontWeight: 700 }}>{idx + 1}</td>
                    <td style={{ padding: "8px 12px" }}>{ex.head}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 800 }}>
                      ₹{ex.amount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
                <tr style={{ borderBottom: "1px solid var(--line)", fontWeight: 700 }}>
                  <td colSpan={2} style={{ padding: "8px 12px" }}>Sub Total Daily Operating Expenditure</td>
                  <td style={{ padding: "8px 12px", textAlign: "right" }}>₹{dailyBaseOpEx.toLocaleString("en-IN")}</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--line)", color: "var(--muted)" }}>
                  <td colSpan={2} style={{ padding: "8px 12px" }}>Add: Operational Contingency @ 10%</td>
                  <td style={{ padding: "8px 12px", textAlign: "right" }}>₹{dailyContingency.toLocaleString("en-IN")}</td>
                </tr>
                <tr style={{ background: "var(--panel-solid)", fontWeight: 900 }}>
                  <td colSpan={2} style={{ padding: "10px 12px" }}>Total Daily Expenditure (Say)</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", color: "var(--cyan)" }}>
                    ₹{dailyTotalOpEx.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ==================================================================
              CHAPTER 8: EXPECTED REVENUE EARNING & PROFITABILITY
             ================================================================== */}
          <div className="dpr-page-break" style={{ marginBottom: 36 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 900, textTransform: "uppercase" }}>CHAPTER - 8</div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--cyan)", margin: "4px 0" }}>Expected Revenue Earning & Profitability for Rated Capacity</h2>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem", marginBottom: 20 }}>
              <thead>
                <tr style={{ background: "var(--panel-solid)", borderBottom: "2px solid var(--line)" }}>
                  <th style={{ padding: "8px 12px", width: "10%" }}>Sl.</th>
                  <th style={{ padding: "8px 12px", width: "65%" }}>Revenue Earning Stream & Commercial Off-Take</th>
                  <th style={{ padding: "8px 12px", width: "25%", textAlign: "right" }}>Rs. Per Day</th>
                </tr>
              </thead>
              <tbody>
                {engineeringSpecs.dailyRevenueHeads.map((rev, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "8px 12px", fontWeight: 700 }}>{idx + 1}</td>
                    <td style={{ padding: "8px 12px" }}>{rev.head}</td>
                    <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 800, color: "var(--ok)" }}>
                      ₹{rev.amount.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
                <tr style={{ background: "var(--panel-solid)", fontWeight: 900 }}>
                  <td colSpan={2} style={{ padding: "10px 12px" }}>Total Expected Daily Revenue Earning</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", color: "var(--ok)", fontSize: "0.95rem" }}>
                    ₹{dailyTotalRevenue.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Profitability Calculation Box (Exact MoFPI Format) */}
            <div
              style={{
                border: "2px solid var(--line-glow)",
                padding: "18px 24px",
                borderRadius: 10,
                background: "var(--panel-subtle)",
                fontSize: "0.92rem",
                lineHeight: 1.8,
              }}
            >
              <div>
                <strong>Estimated Gross Daily Income:</strong> ₹{dailyTotalRevenue.toLocaleString("en-IN")} – ₹{dailyTotalOpEx.toLocaleString("en-IN")} ={" "}
                <span style={{ fontWeight: 900, color: "var(--ok)" }}>₹{dailyGrossProfit.toLocaleString("en-IN")} per day</span>
              </div>
              <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--cyan)", marginTop: 6 }}>
                = Around ₹{monthlyGrossProfit.toLocaleString("en-IN")} per month.{" "}
                <span style={{ fontSize: "0.80rem", color: "var(--muted)", fontWeight: 600 }}>(Considering 25 operating days/month)</span>
              </div>
            </div>
          </div>

          {/* ==================================================================
              CHAPTER 9: MEANS OF FINANCE & PMFME 35% CAPITAL SUBSIDY
             ================================================================== */}
          <div className="dpr-page-break" style={{ marginBottom: 36 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 900, textTransform: "uppercase" }}>CHAPTER - 9</div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--cyan)", margin: "4px 0" }}>Project Funding & Working Capital Requirement</h2>
            </div>

            {/* Table 1: Separate Fixed Asset Investment vs Initial Working Capital */}
            <div style={{ fontSize: "0.86rem", fontWeight: 800, marginBottom: 8, color: "var(--text-heading)" }}>
              A. Project Funding Classification (Establishment vs Operational Outlay)
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem", marginBottom: 20 }}>
              <thead>
                <tr style={{ background: "var(--panel-solid)", borderBottom: "2px solid var(--line)", textAlign: "left" }}>
                  <th style={{ padding: "8px 12px", width: "28%" }}>Funding Category</th>
                  <th style={{ padding: "8px 12px", width: "22%", textAlign: "right" }}>Amount (₹)</th>
                  <th style={{ padding: "8px 12px", width: "15%", textAlign: "center" }}>Share (%)</th>
                  <th style={{ padding: "8px 12px", width: "35%" }}>Statutory Purpose & Scope</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "8px 12px", fontWeight: 700 }}>Fixed Asset Investment</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 800 }}>
                    ₹{(financialModel.fixedAssetInvestment || financialModel.totalCost).toLocaleString("en-IN")}
                  </td>
                  <td style={{ padding: "8px 12px", textAlign: "center" }}>
                    {financialModel.totalProjectFunding > 0
                      ? Math.round(((financialModel.fixedAssetInvestment || financialModel.totalCost) / financialModel.totalProjectFunding) * 100)
                      : 80}%
                  </td>
                  <td style={{ padding: "8px 12px", color: "var(--muted)" }}>
                    Establishment of unit: Plant, machinery, civil works & electrification
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "8px 12px", fontWeight: 700 }}>Initial Working Capital</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 800, color: "var(--amber)" }}>
                    ₹{(financialModel.initialWorkingCapital || 0).toLocaleString("en-IN")}
                  </td>
                  <td style={{ padding: "8px 12px", textAlign: "center" }}>
                    {financialModel.totalProjectFunding > 0
                      ? Math.round(((financialModel.initialWorkingCapital || 0) / financialModel.totalProjectFunding) * 100)
                      : 20}%
                  </td>
                  <td style={{ padding: "8px 12px", color: "var(--muted)" }}>
                    Operating the unit: Inventory, receivables & liquidity buffer
                  </td>
                </tr>
                <tr style={{ background: "var(--panel-solid)", fontWeight: 900 }}>
                  <td style={{ padding: "10px 12px" }}>Total Project Funding Requirement</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", color: "var(--cyan)", fontSize: "0.95rem" }}>
                    ₹{(financialModel.totalProjectFunding || financialModel.totalCost).toLocaleString("en-IN")}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "center" }}>100%</td>
                  <td style={{ padding: "10px 12px", color: "var(--cyan)" }}>
                    Combined establishment + operational capital
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Table 2: Working Capital Cycle & Operating Assessment */}
            {financialModel.workingCapitalDetails && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: "0.86rem", fontWeight: 800, marginBottom: 8, color: "var(--text-heading)" }}>
                  B. Working Capital Cycle & Inventory Assessment (Nayak Committee Norms)
                </div>
                <div
                  style={{
                    background: "var(--panel-subtle)",
                    border: "1px solid var(--line)",
                    borderRadius: 8,
                    padding: "12px 16px",
                    marginBottom: 12,
                    fontSize: "0.82rem",
                    lineHeight: 1.6,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
                    <span>
                      🔄 <strong>Net Operating Cycle:</strong>{" "}
                      <span style={{ color: "var(--cyan)", fontWeight: 800 }}>
                        {financialModel.workingCapitalDetails.operatingCycleDays} Days
                      </span>
                    </span>
                    <span>
                      📊 <strong>Daily Operating Burn Rate:</strong> ₹
                      {financialModel.workingCapitalDetails.dailyFigures.dailyOpEx.toLocaleString("en-IN")} / day
                    </span>
                    <span>
                      📦 <strong>Monthly Operating Expenses:</strong> ₹
                      {financialModel.workingCapitalDetails.dailyFigures.monthlyOpEx.toLocaleString("en-IN")} / month
                    </span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                    <strong>Cycle Days Breakdown:</strong> Raw Material: {financialModel.workingCapitalDetails.cycleDays.rawMaterialDays} days | Packaging: {financialModel.workingCapitalDetails.cycleDays.packagingDays} days | Finished Goods: {financialModel.workingCapitalDetails.cycleDays.finishedGoodsDays} days | Receivables: {financialModel.workingCapitalDetails.cycleDays.receivableDays} days | Supplier Credit: {financialModel.workingCapitalDetails.cycleDays.supplierCreditDays} days
                  </div>
                </div>

                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem", marginBottom: 12 }}>
                  <thead>
                    <tr style={{ background: "var(--panel-solid)", borderBottom: "1px solid var(--line)", textAlign: "left" }}>
                      <th style={{ padding: "7px 10px" }}>Component</th>
                      <th style={{ padding: "7px 10px" }}>Basis / Formula</th>
                      <th style={{ padding: "7px 10px", textAlign: "right" }}>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "7px 10px", fontWeight: 700 }}>Total Inventory (RM + Pkg + FG)</td>
                      <td style={{ padding: "7px 10px", color: "var(--muted)" }}>
                        Raw Material (₹{financialModel.workingCapitalDetails.components.rawMaterialInventory.toLocaleString("en-IN")}) + Pkg (₹{financialModel.workingCapitalDetails.components.packagingInventory.toLocaleString("en-IN")}) + FG (₹{financialModel.workingCapitalDetails.components.finishedGoodsInventory.toLocaleString("en-IN")})
                      </td>
                      <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: 700 }}>
                        ₹{financialModel.workingCapitalDetails.components.totalInventory.toLocaleString("en-IN")}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "7px 10px", fontWeight: 700 }}>Receivables / Book Debts</td>
                      <td style={{ padding: "7px 10px", color: "var(--muted)" }}>
                        {financialModel.workingCapitalDetails.cycleDays.receivableDays} days commercial credit to buyers / mandis
                      </td>
                      <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: 700 }}>
                        ₹{financialModel.workingCapitalDetails.components.receivables.toLocaleString("en-IN")}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "7px 10px", fontWeight: 700 }}>Operational Cash Buffer</td>
                      <td style={{ padding: "7px 10px", color: "var(--muted)" }}>
                        {financialModel.workingCapitalDetails.cycleDays.cashBufferDays} days petty operational contingency
                      </td>
                      <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: 700 }}>
                        ₹{financialModel.workingCapitalDetails.components.cashBuffer.toLocaleString("en-IN")}
                      </td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid var(--line)", color: "var(--amber)" }}>
                      <td style={{ padding: "7px 10px", fontWeight: 700 }}>Less: Supplier Payables (Creditors)</td>
                      <td style={{ padding: "7px 10px" }}>
                        {financialModel.workingCapitalDetails.cycleDays.supplierCreditDays} days procurement credit on raw materials & packaging
                      </td>
                      <td style={{ padding: "7px 10px", textAlign: "right", fontWeight: 700 }}>
                        - ₹{financialModel.workingCapitalDetails.components.payables.toLocaleString("en-IN")}
                      </td>
                    </tr>
                    <tr style={{ background: "var(--panel-solid)", fontWeight: 900 }}>
                      <td style={{ padding: "8px 10px" }}>Net Working Capital Requirement (NWC)</td>
                      <td style={{ padding: "8px 10px", color: "var(--cyan)" }}>
                        Bank Cash Credit (75%): ₹{financialModel.workingCapitalDetails.financing.bankCashCreditLimit.toLocaleString("en-IN")} | Promoter Margin (25%): ₹{financialModel.workingCapitalDetails.financing.promoterMarginMoney.toLocaleString("en-IN")}
                      </td>
                      <td style={{ padding: "8px 10px", textAlign: "right", color: "var(--cyan)" }}>
                        ₹{financialModel.workingCapitalDetails.components.netWorkingCapital.toLocaleString("en-IN")}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Table 3: Initial Means of Finance (Bank Financing + Promoter Equity) */}
            <div style={{ fontSize: "0.86rem", fontWeight: 800, marginBottom: 8, color: "var(--text-heading)" }}>
              C. Sanctioned Banking Structure & Promoter Margin
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem", marginBottom: 16 }}>
              <thead>
                <tr style={{ background: "var(--panel-solid)", borderBottom: "1px solid var(--line)", textAlign: "left" }}>
                  <th style={{ padding: "8px 12px" }}>Financing Source</th>
                  <th style={{ padding: "8px 12px" }}>Percentage (%)</th>
                  <th style={{ padding: "8px 12px", textAlign: "right" }}>Amount (₹)</th>
                  <th style={{ padding: "8px 12px" }}>Appraisal & Sanction Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "8px 12px", fontWeight: 700 }}>Promoter Margin Money (Own Equity)</td>
                  <td style={{ padding: "8px 12px" }}>{financialModel.equityPercentage}%</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 800, color: "var(--ok)" }}>
                    ₹{financialModel.ownEquity.toLocaleString("en-IN")}
                  </td>
                  <td style={{ padding: "8px 12px", color: "var(--ok)" }}>✓ Available Liquid Equity</td>
                </tr>
                <tr style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "8px 12px", fontWeight: 700 }}>Initial Bank Term Loan Sanctioned</td>
                  <td style={{ padding: "8px 12px" }}>{financialModel.loanPercentage}%</td>
                  <td style={{ padding: "8px 12px", textAlign: "right", fontWeight: 800 }}>
                    {financialModel.bankLoan === 0 ? "₹0 (Zero Debt)" : `₹${financialModel.bankLoan.toLocaleString("en-IN")}`}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    {financialModel.bankLoan === 0 ? "100% Self-Funded" : "CGTMSE Covered (Collateral-Free MSME Credit)"}
                  </td>
                </tr>
                <tr style={{ background: "var(--panel-solid)", fontWeight: 900 }}>
                  <td style={{ padding: "10px 12px" }}>Total Eligible Fixed Asset Outlay</td>
                  <td style={{ padding: "10px 12px" }}>100%</td>
                  <td style={{ padding: "10px 12px", textAlign: "right", color: "var(--cyan)" }}>
                    ₹{financialModel.totalCost.toLocaleString("en-IN")}
                  </td>
                  <td style={{ padding: "10px 12px" }}>Appraised Base CapEx</td>
                </tr>
              </tbody>
            </table>

            {/* Table 4: Back-Ended Government Capital Subsidy Record (Tracked Separately) */}
            <div style={{ fontSize: "0.86rem", fontWeight: 800, marginBottom: 8, color: "var(--text-heading)" }}>
              D. Government Subsidy & Capital Grant (Credit-Linked Reserve)
            </div>
            <div
              style={{
                background: "rgba(16, 185, 129, 0.06)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                borderRadius: 10,
                padding: "14px 18px",
                marginBottom: 16,
                fontSize: "0.84rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 8 }}>
                <span style={{ fontWeight: 800, color: "var(--ok)" }}>
                  🏛️ {financialModel.subsidyRecord?.schemeName || "PMFME 35% Credit-Linked Capital Subsidy"}
                </span>
                <span style={{ fontWeight: 900, color: "var(--ok)", fontSize: "1.05rem" }}>
                  ₹{financialModel.subsidyAmount.toLocaleString("en-IN")} ({financialModel.subsidyPercentage}% of CapEx)
                </span>
              </div>
              <p style={{ margin: "4px 0", color: "var(--muted)", lineHeight: 1.5 }}>
                <strong>Subsidy Accounting Mechanism:</strong> In compliance with RBI & MoFPI lending guidelines, the subsidy is not deducted upfront on Day 0 from loan sanction. It is disbursed into the borrower's <em>Subsidy Reserve Fund (SRF) account</em> post-inspection, carries zero interest once credited, and is adjusted against the term loan during final repayment tranches after the mandatory 3-year lock-in period.
              </p>
              {financialModel.monthlyEmi > 0 && (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px dashed rgba(16, 185, 129, 0.25)", display: "flex", gap: 16, flexWrap: "wrap", color: "var(--text-body)" }}>
                  <span>💳 <strong>Equated Monthly Installment (EMI):</strong> ₹{financialModel.monthlyEmi.toLocaleString("en-IN")} / month</span>
                  <span>⏱️ <strong>Loan Tenure:</strong> {financialModel.loanTenureYears} Years</span>
                  <span>📉 <strong>Interest Rate:</strong> {financialModel.loanInterestRate}% p.a. (Reducing Balance)</span>
                </div>
              )}
            </div>
          </div>

          {/* ==================================================================
              CHAPTER 10: 5-YEAR FINANCIALS & DSCR RATIOS
             ================================================================== */}
          <div className="dpr-page-break" style={{ marginBottom: 36 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 900, textTransform: "uppercase" }}>CHAPTER - 10</div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--cyan)", margin: "4px 0" }}>Five-Year Financial Statements & Debt Service Coverage Ratio (DSCR)</h2>
            </div>
            <div style={{ overflowX: "auto", marginBottom: 20 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.80rem", textAlign: "right" }}>
                <thead>
                  <tr style={{ background: "var(--panel-solid)", borderBottom: "2px solid var(--line)" }}>
                    <th style={{ padding: "8px 10px", textAlign: "left" }}>Financial Heads (₹ in Actuals)</th>
                    {financialModel.yearlyProjections.map((p, idx) => (
                      <th key={idx} style={{ padding: "8px 10px", textAlign: "right" }}>
                        {p.year} <br />
                        <span style={{ fontSize: "0.70rem", color: "var(--muted)" }}>({p.capacity})</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid var(--line)", fontWeight: 700 }}>
                    <td style={{ padding: "8px 10px", textAlign: "left" }}>A. Gross Revenue from Sales</td>
                    {financialModel.yearlyProjections.map((p, idx) => (
                      <td key={idx} style={{ padding: "8px 10px", color: "var(--text-heading)" }}>
                        ₹{p.revenue.toLocaleString("en-IN")}
                      </td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--line)", color: "var(--muted)" }}>
                    <td style={{ padding: "6px 10px", textAlign: "left" }}>Less: Raw Material Consumables</td>
                    {financialModel.yearlyProjections.map((p, idx) => (
                      <td key={idx} style={{ padding: "6px 10px" }}>₹{p.rawMaterials.toLocaleString("en-IN")}</td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--line)", color: "var(--muted)" }}>
                    <td style={{ padding: "6px 10px", textAlign: "left" }}>Less: Power, Fuel & Utilities</td>
                    {financialModel.yearlyProjections.map((p, idx) => (
                      <td key={idx} style={{ padding: "6px 10px" }}>₹{p.utilities.toLocaleString("en-IN")}</td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--line)", color: "var(--muted)" }}>
                    <td style={{ padding: "6px 10px", textAlign: "left" }}>Less: Wages & Operational Buffer</td>
                    {financialModel.yearlyProjections.map((p, idx) => (
                      <td key={idx} style={{ padding: "6px 10px" }}>
                        ₹{(p.laborAndWages + p.adminAndSelling).toLocaleString("en-IN")}
                      </td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--line)", fontWeight: 700 }}>
                    <td style={{ padding: "8px 10px", textAlign: "left" }}>B. Operating Profit (EBITDA)</td>
                    {financialModel.yearlyProjections.map((p, idx) => (
                      <td key={idx} style={{ padding: "8px 10px", color: "var(--cyan)" }}>
                        ₹{p.ebitda.toLocaleString("en-IN")}
                      </td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--line)", color: "var(--muted)" }}>
                    <td style={{ padding: "6px 10px", textAlign: "left" }}>Less: Depreciation (15% WDV)</td>
                    {financialModel.yearlyProjections.map((p, idx) => (
                      <td key={idx} style={{ padding: "6px 10px" }}>₹{p.depreciation.toLocaleString("en-IN")}</td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--line)", color: "var(--muted)" }}>
                    <td style={{ padding: "6px 10px", textAlign: "left" }}>Less: Term Loan Interest (@ 8.5%)</td>
                    {financialModel.yearlyProjections.map((p, idx) => (
                      <td key={idx} style={{ padding: "6px 10px" }}>₹{p.interest.toLocaleString("en-IN")}</td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--line)", fontWeight: 700 }}>
                    <td style={{ padding: "8px 10px", textAlign: "left" }}>C. Profit Before Tax (PBT)</td>
                    {financialModel.yearlyProjections.map((p, idx) => (
                      <td key={idx} style={{ padding: "8px 10px" }}>₹{p.pbt.toLocaleString("en-IN")}</td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: "1px solid var(--line)", color: "var(--muted)" }}>
                    <td style={{ padding: "6px 10px", textAlign: "left" }}>Less: Tax Provision (@ 25%)</td>
                    {financialModel.yearlyProjections.map((p, idx) => (
                      <td key={idx} style={{ padding: "6px 10px" }}>₹{p.tax.toLocaleString("en-IN")}</td>
                    ))}
                  </tr>
                  <tr style={{ borderBottom: "2px solid var(--line)", fontWeight: 800, background: "rgba(16, 185, 129, 0.05)" }}>
                    <td style={{ padding: "8px 10px", textAlign: "left", color: "var(--ok)" }}>D. Profit After Tax (PAT)</td>
                    {financialModel.yearlyProjections.map((p, idx) => (
                      <td key={idx} style={{ padding: "8px 10px", color: "var(--ok)" }}>
                        ₹{p.pat.toLocaleString("en-IN")}
                      </td>
                    ))}
                  </tr>
                  <tr style={{ fontWeight: 800 }}>
                    <td style={{ padding: "8px 10px", textAlign: "left" }}>E. Cash Accruals (PAT + Depr.)</td>
                    {financialModel.yearlyProjections.map((p, idx) => (
                      <td key={idx} style={{ padding: "8px 10px", color: "var(--text-heading)" }}>
                        ₹{p.cashAccruals.toLocaleString("en-IN")}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* DSCR Summary Box */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 18px", background: "var(--panel-subtle)", borderRadius: 10, fontSize: "0.86rem" }}>
              <div>
                <strong>Weighted Average Debt Service Coverage Ratio (DSCR):</strong>
                <div style={{ fontSize: "0.76rem", color: "var(--muted)" }}>Standard Banking Hurdle Norm: ≥ 1.50x</div>
              </div>
              <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--ok)" }}>
                {financialModel.avgDSCR === 9.99 ? "∞ (Self-Funded)" : `${financialModel.avgDSCR}x`}
              </div>
            </div>
          </div>

          {/* ==================================================================
              CHAPTER 11: STATUTORY CLEARANCES & DIGITAL VERIFICATION SIGNATURES
             ================================================================== */}
          <div className="dpr-page-break" style={{ marginBottom: 20 }}>
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: "1.1rem", fontWeight: 900, textTransform: "uppercase" }}>CHAPTER - 11</div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 900, color: "var(--cyan)", margin: "4px 0" }}>Statutory Approvals & Digital Verification Signatures</h2>
            </div>
            {/* Regulatory Status Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 20 }}>
              <div style={{ padding: "12px 14px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel-subtle)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: "0.84rem" }}>FSSAI Manufacturing</span>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
                    In-Pipeline (Post-Sanction)
                  </span>
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--muted)", lineHeight: 1.4 }}>
                  Food Safety & Standards Act 2006. Required prior to commercial production & trial run.
                </div>
              </div>

              <div style={{ padding: "12px 14px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel-subtle)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: "0.84rem" }}>Udyam MSME</span>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
                    Self-Declaration Ready
                  </span>
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--muted)", lineHeight: 1.4 }}>
                  Micro Enterprise registration under Ministry of MSME via Aadhaar/PAN integration.
                </div>
              </div>

              <div style={{ padding: "12px 14px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel-subtle)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: "0.84rem" }}>MPCB Consent</span>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
                    White/Green Category
                  </span>
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--muted)", lineHeight: 1.4 }}>
                  Maharashtra Pollution Control Board Consent-to-Establish (CTE) filed post land lease.
                </div>
              </div>

              <div style={{ padding: "12px 14px", borderRadius: 8, border: "1px solid var(--line)", background: "var(--panel-subtle)" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontWeight: 800, fontSize: "0.84rem" }}>GSTIN Registration</span>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, padding: "2px 6px", borderRadius: 4, background: "rgba(59, 130, 246, 0.15)", color: "#60a5fa", border: "1px solid rgba(59, 130, 246, 0.3)" }}>
                    Prerequisite for Bank A/C
                  </span>
                </div>
                <div style={{ fontSize: "0.72rem", color: "var(--muted)", lineHeight: 1.4 }}>
                  State commercial invoicing, inter-state trade, and input tax credit (ITC) enablement.
                </div>
              </div>
            </div>

            {/* Statutory Undertaking Note */}
            <div style={{ padding: "10px 14px", borderRadius: 6, background: "rgba(255,255,255,0.03)", border: "1px dashed var(--line)", marginBottom: 22, fontSize: "0.74rem", color: "var(--muted)", lineHeight: 1.5 }}>
              <strong style={{ color: "var(--text-heading)" }}>Promoter Compliance Undertaking:</strong> The applicant promoter solemnly affirms that all required statutory approvals, municipal trade licenses, and pollution control clearances will be completed in accordance with the MoFPI / PMFME operational guidelines prior to the disbursement of the 2nd loan tranche and commercial commissioning.
            </div>

            {/* Cryptographic Stamp & Signatures */}
            <div
              style={{
                borderTop: "2px solid var(--line)",
                paddingTop: 18,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                flexWrap: "wrap",
                gap: 20,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 58,
                      height: 58,
                      background: "var(--panel-solid)",
                      border: "1px solid var(--line-glow)",
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <QrCode size={44} color="var(--cyan)" />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.76rem", fontWeight: 800, color: "var(--text-heading)" }}>
                      DIGITAL MOFPI AUDIT VERIFICATION STAMP
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "var(--muted)", fontFamily: "monospace" }}>
                      SHA-256: 7F9E-382C-41A0-B772-EV2024
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "var(--ok)", marginTop: 2 }}>
                      ✓ Pre-Qualified for PMFME 35% Credit-Linked Grant
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 32, textAlign: "center" }}>
                <div style={{ width: 160 }}>
                  <div style={{ height: 35 }} />
                  <div style={{ borderTop: "1px solid var(--text-heading)", paddingTop: 4, fontSize: "0.76rem", fontWeight: 700 }}>
                    Signature of Promoter
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--muted)" }}>({userName})</div>
                </div>

                <div style={{ width: 180 }}>
                  <div style={{ height: 35 }} />
                  <div style={{ borderTop: "1px solid var(--text-heading)", paddingTop: 4, fontSize: "0.76rem", fontWeight: 700 }}>
                    District Resource Person (DRP)
                  </div>
                  <div style={{ fontSize: "0.68rem", color: "var(--muted)" }}>DIC / PMFME Cell, Nagpur</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div
          className="dpr-screen-toolbar"
          style={{
            background: "var(--panel-subtle)",
            padding: "14px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid var(--line)",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ fontSize: "0.80rem", color: "var(--muted)" }}>
            Official MoFPI Feasibility Dossier ready for submission to <strong>SBI, Bank of Maharashtra</strong>, and <strong>PMFME Portal</strong>.
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() => window.print()}
              className="btn-primary-gloss"
              style={{ padding: "8px 20px", fontSize: "0.84rem" }}
            >
              <Printer size={16} /> Print Official MoFPI DPR (PDF)
            </button>
            <button
              onClick={onClose}
              className="btn-secondary-gloss"
              style={{ padding: "8px 18px", fontSize: "0.84rem" }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
