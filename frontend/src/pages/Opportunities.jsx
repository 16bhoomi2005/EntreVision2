import React, { useState, useEffect } from "react";
import { fetchIndustryOpportunities } from "../services/api";
import { Link } from "react-router-dom";

export default function Opportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOpp, setSelectedOpp] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchIndustryOpportunities(1);
        setOpportunities(data);
      } catch (err) {
        console.error("Failed to load opportunities:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const categories = ["All", ...new Set(opportunities.map((o) => o.category).filter(Boolean))];

  const filtered = opportunities.filter((o) => {
    const matchesCat = filterCategory === "All" || o.category === filterCategory;
    const matchesSearch =
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.description && o.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.target_market && o.target_market.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div>
      <div style={{ marginBottom: "2rem", textAlign: "left" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.25rem" }}>
              Nagpur Orange Industry Opportunities 🍊
            </h1>
            <p style={{ color: "var(--text-muted)" }}>
              Explore 25+ evidence-backed commercial models spanning cultivation, processing, cold chain, and by-product valorization.
            </p>
          </div>
          <Link to="/assess" className="btn-primary-large" style={{ fontSize: "0.95rem", padding: "0.65rem 1.5rem" }}>
            ✨ Match My Profile
          </Link>
        </div>

        {/* Filter Controls */}
        <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
          <input
            type="text"
            placeholder="🔍 Search business models, markets, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: "1",
              minWidth: "260px",
              padding: "0.65rem 1rem",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-color)",
              fontSize: "0.95rem",
            }}
          />

          <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", maxWidth: "100%", paddingBottom: "4px" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                style={{
                  background: filterCategory === cat ? "var(--primary)" : "#ffffff",
                  color: filterCategory === cat ? "#ffffff" : "var(--text-main)",
                  border: "1px solid",
                  borderColor: filterCategory === cat ? "var(--primary)" : "var(--border-color)",
                  padding: "0.45rem 0.9rem",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <p style={{ color: "var(--text-muted)" }}>Loading opportunities...</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem", textAlign: "left" }}>
          {filtered.map((opp) => (
            <div
              key={opp.id}
              style={{
                background: "#ffffff",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-lg)",
                padding: "1.5rem",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "1rem",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <span style={{ background: "#ffedd5", color: "#c2410c", fontSize: "0.75rem", padding: "0.2rem 0.6rem", borderRadius: "var(--radius-full)", fontWeight: 700 }}>
                    {opp.category}
                  </span>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600 }}>
                    {opp.investment_level || "Medium"} CapEx
                  </span>
                </div>

                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a", marginBottom: "0.5rem" }}>
                  {opp.name}
                </h3>

                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.5, marginBottom: "0.75rem" }}>
                  {opp.description && opp.description.length > 140
                    ? `${opp.description.slice(0, 140)}...`
                    : opp.description}
                </p>
              </div>

              <div>
                <div style={{ fontSize: "0.8rem", color: "#475569", marginBottom: "0.75rem", background: "#f8fafc", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)" }}>
                  <div>🎯 <strong>Market:</strong> {opp.target_market || "Domestic FMCG & Regional"}</div>
                  <div>📍 <strong>Hub:</strong> {opp.location_relevance || "Nagpur District"}</div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button
                    onClick={() => setSelectedOpp(opp)}
                    style={{
                      background: "transparent",
                      color: "var(--primary)",
                      border: "none",
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    View Details & Financials →
                  </button>
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                    ID: #{opp.id}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedOpp && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 100,
          padding: "1rem"
        }}>
          <div style={{
            background: "#ffffff",
            borderRadius: "var(--radius-lg)",
            padding: "2rem",
            maxWidth: "650px",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
            textAlign: "left",
            position: "relative"
          }}>
            <button
              onClick={() => setSelectedOpp(null)}
              style={{
                position: "absolute",
                top: "1.25rem",
                right: "1.25rem",
                background: "#f1f5f9",
                border: "none",
                borderRadius: "var(--radius-full)",
                width: "32px",
                height: "32px",
                cursor: "pointer",
                fontWeight: 700
              }}
            >
              ✕
            </button>

            <span style={{ background: "#ffedd5", color: "#c2410c", fontSize: "0.75rem", padding: "0.2rem 0.6rem", borderRadius: "var(--radius-full)", fontWeight: 700 }}>
              {selectedOpp.category}
            </span>

            <h2 style={{ fontSize: "1.6rem", fontWeight: 800, marginTop: "0.5rem", marginBottom: "0.75rem", color: "#0f172a" }}>
              {selectedOpp.name}
            </h2>

            <p style={{ fontSize: "0.95rem", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "1.25rem" }}>
              {selectedOpp.description}
            </p>

            <div style={{ background: "#f8fafc", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", marginBottom: "1.25rem" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.75rem", color: "#1e293b" }}>
                Operational & Technical Specifications
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.88rem" }}>
                <div><strong>Investment Level:</strong> {selectedOpp.investment_level}</div>
                <div><strong>Technology Complexity:</strong> {selectedOpp.technology_level}</div>
                <div><strong>Target Market:</strong> {selectedOpp.target_market}</div>
                <div><strong>Optimal Geography:</strong> {selectedOpp.location_relevance}</div>
              </div>
            </div>

            <div style={{ background: "#fffbeb", padding: "1.25rem", borderRadius: "var(--radius-md)", border: "1px solid #fde68a", marginBottom: "1.5rem" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "0.5rem", color: "#92400e" }}>
                🏛️ Applicable Scheme Eligibility
              </h4>
              <p style={{ fontSize: "0.88rem", color: "#78350f" }}>
                Eligible under <strong>PMFME (One District One Product - Nagpur Mandarin)</strong> or <strong>MIDH / NHM Horticulture Mission</strong> with up to 35% to 50% credit-linked capital assistance.
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Source: {selectedOpp.source || "ICAR-CCRI Technical Records"}
              </span>
              <Link to="/assess" className="btn-primary-large" style={{ fontSize: "0.9rem", padding: "0.5rem 1.25rem" }}>
                Check Your Suitability →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
