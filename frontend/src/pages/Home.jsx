import React from "react";
import HeroSection from "../components/home/HeroSection";
import TrustStats from "../components/home/TrustStats";
import HowItWorks from "../components/home/HowItWorks";
import FeatureSection from "../components/home/FeatureSection";
import CTASection from "../components/home/CTASection";
import Footer from "../components/home/Footer";

export default function Home() {
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
