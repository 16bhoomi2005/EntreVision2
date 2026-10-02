import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  Sprout,
  Home,
  Search,
  MapPin,
  Briefcase,
  CircleDollarSign,
  Landmark,
  Users,
  Map,
  User,
  Settings,
  Sun,
  Moon,
  Menu,
} from "lucide-react";
import ChatbotWidget from "./ChatbotWidget";
import "../styles/theme.css";

const NAV_EXPLORE = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/find-opportunity", label: "Find Opportunity", icon: Search },
  { to: "/locations", label: "Explore by Location", icon: MapPin },
  { to: "/opportunities", label: "Business Models", icon: Sprout },
  { to: "/financial-assistant", label: "Financial Assistant", icon: CircleDollarSign },
  { to: "/schemes", label: "Government Schemes", icon: Landmark },
  { to: "/collaboration", label: "Collaboration", icon: Users },
  { to: "/roadmap", label: "My Roadmap", icon: Map },
];

const NAV_BOTTOM = [
  { to: "/profile", label: "My Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem("ev-theme");
      if (saved) return saved;
    } catch {}
    return "dark"; // Default to premium dark navy
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("ev-theme", theme);
    } catch {}
  }, [theme]);

  return [theme, () => setTheme((t) => (t === "dark" ? "light" : "dark"))];
}

export default function Layout() {
  const [theme, toggleTheme] = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="shell">
      {/* Fixed Glassy HeroUI Sidebar */}
      <aside className={`side ${mobileOpen ? "open" : ""}`}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Logo */}
          <NavLink to="/" className="brand" style={{ textDecoration: "none" }}>
            <span className="brand-mark">
              <Sprout size={22} />
            </span>
            <span>ENTRE VISION</span>
          </NavLink>

          {/* Explore Nav Section */}
          <div>
            <div className="nav-label">EXPLORE</div>
            <nav className="nav" onClick={() => setMobileOpen(false)}>
              {NAV_EXPLORE.map(({ to, label, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end}>
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom Area: Profile & Settings */}
        <div className="sidebar-footer">
          <nav className="nav" onClick={() => setMobileOpen(false)}>
            {NAV_BOTTOM.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to}>
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div>
        {/* Top Header */}
        <header className="top">
          <div className="top-brand-wrapper">
            <button
              className="icon-btn"
              aria-label="Open menu"
              onClick={() => setMobileOpen((o) => !o)}
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="top-brand-title">EntreVision</h1>
              <p className="top-brand-subtitle">
                AI-powered entrepreneurial decision support
              </p>
            </div>
          </div>

          <div className="top-actions">
            <NavLink
              to="/business-plan"
              className="glass-btn active-venture-pill"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(249, 115, 22, 0.12)",
                borderColor: "rgba(249, 115, 22, 0.35)",
                color: "var(--text-heading)",
                fontSize: "0.82rem",
                padding: "6px 12px",
              }}
              title="Current Active Business Model & Location"
            >
              <span style={{ fontSize: "1rem" }}>🍊</span>
              <div>
                <span style={{ color: "var(--citrus-orange)", fontWeight: 800, marginRight: 4 }}>Active Venture:</span>
                <span style={{ fontWeight: 600 }}>Citrus Nursery • Katol</span>
              </div>
            </NavLink>

            <div className="tag-badge">
              <span className="glowing-dot" style={{ width: 6, height: 6 }} />
              <span>Vidarbha Focus</span>
            </div>

            <NavLink
              to="/profile"
              className={({ isActive }) => `glass-btn ${isActive ? "active-glow" : ""}`}
              style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <User size={16} color="var(--cyan)" />
              <span style={{ fontWeight: 600 }}>Profile</span>
            </NavLink>

            <button
              className="glass-btn"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun size={15} color="var(--cyan)" />
              ) : (
                <Moon size={15} color="var(--electric-blue)" />
              )}
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="content">
          <Outlet />
        </main>
      </div>

      {/* Floating AI Agro Advisor Chatbot */}
      <ChatbotWidget />
    </div>
  );
}
