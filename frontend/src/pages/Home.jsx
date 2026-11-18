import React from "react";
import HeroSection from "../components/home/HeroSection";
import TrustStats from "../components/home/TrustStats";
import HowItWorks from "../components/home/HowItWorks";
import FeatureSection from "../components/home/FeatureSection";
import CTASection from "../components/home/CTASection";
import Footer from "../components/home/Footer";
import VentureDashboard from "../components/home/VentureDashboard";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { isAuthenticated, activeVenture, user } = useAuth();

  const venture = activeVenture || (() => {
    try {
      if (user?.id) {
        const uSaved = localStorage.getItem(`ev_${user.id}_active_venture`);
        if (uSaved) return JSON.parse(uSaved);
      }
      const savedPlan = localStorage.getItem("ev_active_business_plan");
      if (savedPlan) {
        const p = JSON.parse(savedPlan);
        return p.opportunity || p;
      }
    } catch (e) {}
    return null;
  })();

  // If the entrepreneur has an active venture plan, show their personal command center
  if (isAuthenticated && venture) {
    return <VentureDashboard activeVenture={venture} />;
  }

  // Otherwise, show the welcoming onboarding and introduction experience
  return (
    <div>
      <HeroSection />
      <TrustStats />
      <HowItWorks />
      <FeatureSection />
      <CTASection />
      <Footer />
    </div>
  );
}

