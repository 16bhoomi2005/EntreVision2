import React from "react";

export default function Footer() {
  return (
    <footer className="footer-minimal">
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <span className="footer-brand">EntreVision</span>
        <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
          Location-aware entrepreneurial decision support.
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.82rem" }}>
        <span>Nagpur</span>
        <span>•</span>
        <span>Vidarbha</span>
        <span>•</span>
        <span>India</span>
      </div>
    </footer>
  );
}
