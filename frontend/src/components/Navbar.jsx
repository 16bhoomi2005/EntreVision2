import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link to="/" className="brand-logo">
          <span>🍊 EntreVision</span>
          <span className="brand-badge">Nagpur Agro DSS</span>
        </Link>
        <nav className="nav-links">
          <Link
            to="/assess"
            className={`nav-link ${location.pathname === "/assess" ? "active" : ""}`}
          >
            🌱 Discover Opportunities
          </Link>
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
          <Link to="/assess" className="nav-btn">
            Get Started →
          </Link>
        </nav>
      </div>
    </header>
  );
}
