import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTASection() {
  return (
    <section className="cta-banner-card">
      <div className="glowing-pill" style={{ margin: "0 auto", borderColor: "var(--line-glow)" }}>
        <Sparkles size={14} color="var(--cyan)" />
        <span style={{ color: "#fff", fontWeight: 800 }}>READY TO BUILD?</span>
      </div>

      <h2 className="cta-banner-title">
        Your next business could already be around you.
      </h2>

      <p className="cta-banner-desc">
        Tell EntreVision what you have. We'll help you explore what you can build.
      </p>

      <Link
        to="/find-opportunity"
        className="btn-primary-gloss"
        style={{ padding: "18px 40px", fontSize: "1.05rem" }}
      >
        <span>Start Exploring</span>
        <ArrowRight size={20} />
      </Link>
    </section>
  );
}
