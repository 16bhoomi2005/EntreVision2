import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  ArrowRight,
  MapPin,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const from = location.state?.from?.pathname || "/assess";

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("Agro-Entrepreneur");
  const [tehsil, setTehsil] = useState("Katol");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register({
        full_name: fullName,
        email,
        password,
        role,
        tehsil,
        phone,
      });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Failed to register. Please check your details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "20px auto 60px", padding: "0 16px" }}>
      {/* Top Banner Notice */}
      <div
        style={{
          textAlign: "center",
          marginBottom: 32,
        }}
      >
        <span
          className="pill"
          style={{
            background: "rgba(249, 115, 22, 0.15)",
            color: "var(--citrus-orange)",
            border: "1px solid rgba(249, 115, 22, 0.3)",
            marginBottom: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <ShieldCheck size={14} /> EntreVision Secure Access Gateway
        </span>
        <h1 style={{ fontSize: "2rem", margin: "8px 0 6px", color: "var(--text-heading)" }}>
          Agro-Entrepreneur Authentication
        </h1>
        <p className="muted" style={{ maxWidth: 600, margin: "0 auto", fontSize: "0.95rem" }}>
          Sign in to access your customized PMFME subsidy assessments, AI-driven opportunity recommendations, and bankable DPR blueprints.
        </p>
      </div>

      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
        }}
      >
        {/* Personalized Login / Register Card */}
        <div
          className="card"
          style={{
            background: "var(--panel)",
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: "32px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
          }}
        >
          {/* Mode Switcher Tabs */}
          <div
            style={{
              display: "flex",
              borderRadius: 10,
              background: "rgba(0, 0, 0, 0.2)",
              padding: 4,
              marginBottom: 24,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              style={{
                flex: 1,
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                background: mode === "login" ? "var(--citrus-orange)" : "transparent",
                color: mode === "login" ? "#fff" : "var(--muted)",
                fontWeight: 600,
                fontSize: "0.88rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError("");
              }}
              style={{
                flex: 1,
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                background: mode === "register" ? "var(--citrus-orange)" : "transparent",
                color: mode === "register" ? "#fff" : "var(--muted)",
                fontWeight: 600,
                fontSize: "0.88rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(239, 68, 68, 0.15)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                color: "#f87171",
                padding: "10px 14px",
                borderRadius: 8,
                fontSize: "0.84rem",
                marginBottom: 20,
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {mode === "login" ? (
            <form onSubmit={handleLoginSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label className="field-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Mail size={14} color="var(--citrus-orange)" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. bhoomika@entrevision.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--border)",
                    color: "var(--text-heading)",
                  }}
                />
              </div>

              <div>
                <label className="field-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Lock size={14} color="var(--citrus-orange)" /> Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 8,
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--border)",
                    color: "var(--text-heading)",
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", color: "var(--muted)" }}>
                <span>🔒 Encrypted session token</span>
                <span style={{ color: "var(--citrus-orange)" }}>Help: support@entrevision.in</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="cta"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  marginTop: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? "Authenticating..." : "Sign In to EntreVision →"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label className="field-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <User size={14} color="var(--citrus-orange)" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patil"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--border)",
                    color: "var(--text-heading)",
                  }}
                />
              </div>

              <div>
                <label className="field-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Mail size={14} color="var(--citrus-orange)" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="ramesh@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--border)",
                    color: "var(--text-heading)",
                  }}
                />
              </div>

              <div>
                <label className="field-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <MapPin size={14} color="var(--citrus-orange)" /> Primary Tehsil / Cluster
                </label>
                <select
                  value={tehsil}
                  onChange={(e) => setTehsil(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    background: "#1e293b",
                    border: "1px solid var(--border)",
                    color: "var(--text-heading)",
                  }}
                >
                  <option value="Katol">Katol (Citrus & Processing Belt)</option>
                  <option value="Warud">Warud (Mandarin Orchard Cluster)</option>
                  <option value="Narkhed">Narkhed (Nursery & Commercial Zone)</option>
                  <option value="Kalmeshwar">Kalmeshwar (MIDC & Cold Chain)</option>
                  <option value="Nagpur Rural">Nagpur Rural (Wholesale APMC Hub)</option>
                  <option value="Saoner">Saoner (Horticultural Aggregation)</option>
                  <option value="Ramtek">Ramtek (Micro-Irrigation & Fruit)</option>
                </select>
              </div>

              <div>
                <label className="field-label" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Lock size={14} color="var(--citrus-orange)" /> Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Create a secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    background: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid var(--border)",
                    color: "var(--text-heading)",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="cta"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 8,
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  marginTop: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  cursor: submitting ? "not-allowed" : "pointer",
                }}
              >
                {submitting ? "Registering..." : "Create Account & Get Started →"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
