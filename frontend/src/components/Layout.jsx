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
  TrendingUp,
  Cpu,
  LogIn,
  LogOut,
} from "lucide-react";
import ChatbotWidget from "./ChatbotWidget";
import { useAuth } from "../context/AuthContext";
import "../styles/theme.css";

const NAV_EXPLORE = [
  { to: "/", label: "Home", icon: Home, end: true },
  { to: "/find-opportunity", label: "Find Opportunity", icon: Search },
  { to: "/locations", label: "Explore by Location", icon: MapPin },
  { to: "/opportunities", label: "Business Models", icon: Sprout },
  { to: "/market-rates", label: "Mandi Rates & Forecast", icon: TrendingUp },
  { to: "/financial-assistant", label: "Financial Assistant", icon: CircleDollarSign },
  { to: "/schemes", label: "Government Schemes", icon: Landmark },
  { to: "/ai-diagnostics", label: "AI & ML Diagnostics", icon: Cpu },
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
  const { user, isAuthenticated, logout, activeVenture } = useAuth();
  const [theme, toggleTheme] = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="shell">
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-label="Close sidebar"
        />
      )}

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

        {/* Bottom Area: Profile, Settings & Auth */}
        <div className="sidebar-footer">
          <nav className="nav" onClick={() => setMobileOpen(false)}>
            {NAV_BOTTOM.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to}>
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={logout}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "none",
                  background: "transparent",
                  color: "#f87171",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                  width: "100%",
                  textAlign: "left",
                }}
              >
                <LogOut size={18} />
                <span>Sign Out ({user?.full_name?.split(" ")[0]})</span>
              </button>
            ) : (
              <NavLink to="/login" style={{ color: "var(--citrus-orange)", fontWeight: 600 }}>
                <LogIn size={18} />
                <span>Sign In / Register</span>
              </NavLink>
            )}
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="main-pane">
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
              to={activeVenture ? "/business-plan" : "/assess"}
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
              title={activeVenture ? `Active: ${activeVenture.name}` : "Click to find your venture"}
            >
              <span style={{ fontSize: "1rem" }}>{activeVenture ? "🍊" : "🌱"}</span>
              <div className="active-venture-text">
                <span style={{ color: "var(--citrus-orange)", fontWeight: 800, marginRight: 4 }}>
                  {activeVenture ? "Active Venture:" : "New Venture:"}
                </span>
                <span style={{ fontWeight: 600 }}>
                  {activeVenture ? `${activeVenture.name?.substring(0, 22)}...` : "Start Assessment →"}
                </span>
              </div>
            </NavLink>

            <div className="tag-badge">
              <span className="glowing-dot" style={{ width: 6, height: 6 }} />
              <span>Vidarbha Focus</span>
            </div>

            {isAuthenticated ? (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <NavLink
                  to="/profile"
                  className={({ isActive }) => `glass-btn user-profile-btn ${isActive ? "active-glow" : ""}`}
                  style={{
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(6, 182, 212, 0.1)",
                    borderColor: "rgba(6, 182, 212, 0.3)",
                  }}
                  title={`Logged in as ${user?.full_name} (${user?.role})`}
                >
                  <span style={{ fontSize: "1rem" }}>{user?.avatar || "👤"}</span>
                  <span className="user-profile-name" style={{ fontWeight: 600, color: "var(--cyan)" }}>
                    {user?.full_name?.split(" ")[0]}
                  </span>
                </NavLink>

                <button
                  className="glass-btn"
                  onClick={logout}
                  title="Sign Out"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#f87171",
                    padding: "6px 10px",
                  }}
                >
                  <LogOut size={15} />
                  <span className="logout-text" style={{ fontSize: "0.8rem" }}>Logout</span>
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="glass-btn active-glow"
                style={{
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  borderColor: "var(--citrus-orange)",
                  color: "var(--citrus-orange)",
                  background: "rgba(249, 115, 22, 0.12)",
                  fontWeight: 700,
                  padding: "6px 14px",
                }}
              >
                <LogIn size={15} />
                <span>Sign In</span>
              </NavLink>
            )}

            <button
              className="glass-btn theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? (
                <Sun size={15} color="var(--cyan)" />
              ) : (
                <Moon size={15} color="var(--electric-blue)" />
              )}
              <span className="theme-toggle-label">{theme === "dark" ? "Light" : "Dark"}</span>
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
