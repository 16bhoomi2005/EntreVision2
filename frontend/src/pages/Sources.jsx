import React from "react";
import { FileText, ExternalLink, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function Sources() {
  const sources = [
    {
      code: "SRC001",
      title: "ICAR-CCRI Annual Technical Report & Technology Transfer Repository",
      authority: "ICAR - Central Citrus Research Institute, Nagpur",
      scope: "Disease-free high-density nursery propagation, Nagpur mandarin debudding, citrus juice processing, peel oil extraction.",
      status: "VERIFIED",
      url: "https://ccri.icar.gov.in"
    },
    {
      code: "SRC002",
      title: "NHB Commercial Horticulture 1-Acre & 1-Hectare Model Financials",
      authority: "National Horticulture Board (NHB), Ministry of Agriculture",
      scope: "Capital expenditure schedules, high-density drip irrigation costs, gestation periods, and multi-year cash flow projections.",
      status: "VERIFIED",
      url: "https://nhb.gov.in"
    },
    {
      code: "SRC003",
      title: "MoFPI PMFME Scheme Guidelines & ODOP District Matrix",
      authority: "Ministry of Food Processing Industries (MoFPI)",
      scope: "Credit-linked capital subsidy (35% up to ₹10 Lakhs), ODOP product notifications for Nagpur Mandarin.",
      status: "VERIFIED",
      url: "https://mofpi.gov.in/pmfme"
    },
    {
      code: "SRC004",
      title: "APEDA Citrus Export Advisory & Cold Chain Protocols",
      authority: "Agricultural and Processed Food Products Export Development Authority",
      scope: "Pre-cooling temperatures (5°C–7°C), relative humidity (90–95%), MRL pesticide standards for Gulf & EU markets.",
      status: "VERIFIED",
      url: "https://apeda.gov.in"
    },
    {
      code: "SRC005",
      title: "KVIC Prime Minister's Employment Generation Programme (PMEGP) Norms",
      authority: "Khadi and Village Industries Commission / Ministry of MSME",
      scope: "Margin money assistance for rural micro-enterprises, agro-custom hiring centres, and packaging units.",
      status: "VERIFIED",
      url: "https://www.kviconline.gov.in"
    },
    {
      code: "SRC006",
      title: "Maharashtra Energy Development Agency (MEDA) Solar Pump Schemes",
      authority: "Government of Maharashtra / MNRE",
      scope: "Subsidized solar pump installations for off-grid irrigation and post-harvest cooling resilience.",
      status: "VERIFIED",
      url: "https://www.mahaurja.com"
    }
  ];

  return (
    <div>
      <div className="card" style={{ marginBottom: 24 }}>
        <span className="pill">Research Grounding & Integrity</span>
        <h2 style={{ margin: "8px 0 4px", fontSize: "1.5rem" }}>
          Sources & Evidence Base
        </h2>
        <p className="muted" style={{ margin: 0 }}>
          Every enterprise opportunity, financial breakdown, and infrastructure metric in EntreVision is grounded in verified government publications and institutional research.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {sources.map((s) => (
          <div key={s.code} className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div>
                <span className="tag" style={{ fontSize: "0.75rem", marginBottom: 6, display: "inline-block" }}>
                  {s.code} • {s.status}
                </span>
                <h3 style={{ margin: "2px 0 6px", fontSize: "1.2rem", fontWeight: 800 }}>
                  {s.title}
                </h3>
                <div style={{ fontSize: "0.85rem", color: "var(--accent-2)", fontWeight: 600 }}>
                  {s.authority}
                </div>
              </div>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="btn-secondary"
                style={{ padding: "6px 14px", fontSize: "0.85rem" }}
              >
                Official Portal <ExternalLink size={14} />
              </a>
            </div>

            <p className="muted" style={{ fontSize: "0.88rem", lineHeight: 1.5, marginTop: 12, marginBottom: 0 }}>
              {s.scope}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
