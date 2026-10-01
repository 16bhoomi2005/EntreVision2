import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import Home from "./pages/Home";
import VentureKhoj from "./pages/VentureKhoj";
import Results from "./pages/Results";
import BusinessPlan from "./pages/BusinessPlan";
import OpportunityExplorer from "./pages/OpportunityExplorer";
import Infrastructure from "./pages/Infrastructure";
import Schemes from "./pages/Schemes";
import FinancialAssistant from "./pages/FinancialAssistant";
import MarketRates from "./pages/MarketRates";
import Sources from "./pages/Sources";
import Collaboration from "./pages/Collaboration";
import Roadmap from "./pages/Roadmap";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          
          {/* Find Opportunity & Assessment routes */}
          <Route path="find-opportunity" element={<VentureKhoj />} />
          <Route path="start" element={<VentureKhoj />} />
          <Route path="assess" element={<VentureKhoj />} />
          <Route path="results" element={<Results />} />
          <Route path="business-plan" element={<BusinessPlan />} />
          <Route path="opportunity/:id/plan" element={<BusinessPlan />} />
          
          {/* Location & Infrastructure */}
          <Route path="locations" element={<Infrastructure />} />
          <Route path="infrastructure" element={<Infrastructure />} />
          
          {/* Business Models & Opportunities */}
          <Route path="opportunities" element={<OpportunityExplorer />} />
          <Route path="industries/1/opportunities" element={<OpportunityExplorer />} />
          <Route path="business-models" element={<OpportunityExplorer />} />
          
          {/* Financial Assistance & Schemes */}
          <Route path="financial-assistant" element={<FinancialAssistant />} />
          <Route path="schemes" element={<Schemes />} />
          
          {/* Collaboration & Ecosystem */}
          <Route path="collaboration" element={<Collaboration />} />
          
          {/* Roadmap */}
          <Route path="roadmap" element={<Roadmap />} />
          
          {/* Profile & Settings */}
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          
          {/* Market & Sources */}
          <Route path="market" element={<MarketRates />} />
          <Route path="sources" element={<Sources />} />
          
          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;