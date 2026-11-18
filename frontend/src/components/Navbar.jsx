import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, hasCompletedAssessment, activeVenture } = useAuth();

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="brand-logo">
          <span>🍊 EntreVision</span>
          <span className="brand-badge">Nagpur Agro DSS</span>
        </Link>
        <nav className="nav-links">
          {hasCompletedAssessment ? (
            <>
              <Link
                to="/"
                className={`nav-link ${location.pathname === "/" ? "active" : ""}`}
              >
                🚀 My Active Venture
              </Link>
              <Link
                to="/roadmap"
                className={`nav-link ${location.pathname === "/roadmap" ? "active" : ""}`}
              >
                🗺️ Implementation Roadmap
              </Link>
              <Link
                to="/business-plan"
                className={`nav-link ${location.pathname === "/business-plan" ? "active" : ""}`}
              >
                📄 Bankable DPR
              </Link>
            </>
          ) : (
            <Link
              to="/assess"
              className={`nav-link ${location.pathname === "/assess" ? "active" : ""}`}
            >
              🌱 Discover Opportunities
            </Link>
          )}
          <Link
            to="/opportunities"
            className={`nav-link ${location.pathname === "/opportunities" ? "active" : ""}`}
          >
            📋 Browse All (25)
          </Link>
          <Link
            to="/schemes"
            className={`nav-link ${location.pathname === "/schemes" ? "active" : ""}`}
          >
            🏛️ Subsidies & Schemes
          </Link>
          <Link
            to="/market-rates"
            className={`nav-link ${location.pathname === "/market-rates" ? "active" : ""}`}
          >
            Mandi Rates
          </Link>
          <Link
            to="/ai-diagnostics"
            className={`nav-link ${location.pathname === "/ai-diagnostics" ? "active" : ""}`}
            style={{ color: "#f97316", fontWeight: 600 }}
          >
            AI Architecture & ML
          </Link>
          {isAuthenticated ? (
            <Link to="/profile" className="nav-btn" style={{ background: "rgba(6, 182, 212, 0.2)", border: "1px solid var(--cyan)", color: "var(--cyan)" }}>
              <span>{user?.avatar || "👤"}</span> {user?.full_name?.split(" ")[0]}
            </Link>
          ) : (
            <Link to="/login" className="nav-btn">
              Sign In →
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
