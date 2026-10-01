import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="hero-card hero-centered">
      <div className="hero-content-centered">
        <div className="glowing-pill">
          <span className="glowing-dot" />
          <span>🌱 DECISION SUPPORT SYSTEM</span>
        </div>

        <h1 className="hero-title" style={{ textTransform: "uppercase" }}>
          TURN YOUR SKILLS, RESOURCES AND LOCATION INTO YOUR NEXT{" "}
          <span className="gradient-text">BUSINESS OPPORTUNITY</span>.
        </h1>

        <p className="hero-subtitle">
          EntreVision helps you discover, plan and build businesses based on what you have and what exists around you.
        </p>

        <div className="hero-actions">
          <Link to="/find-opportunity" className="btn-primary-gloss" style={{ padding: "18px 36px", fontSize: "1.05rem" }}>
            <span>Find My Opportunity</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
