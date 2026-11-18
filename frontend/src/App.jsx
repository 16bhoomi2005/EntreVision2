import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

import Home from "./pages/Home";
import Login from "./pages/Login";
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
import AiDiagnostics from "./pages/AiDiagnostics";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />

            {/* Authentication Gateway */}
            <Route path="login" element={<Login />} />
            
            {/* AI & ML Diagnostics */}
            <Route path="ai-diagnostics" element={<AiDiagnostics />} />
            <Route path="ml" element={<AiDiagnostics />} />
            
            {/* Find Opportunity & Assessment routes (STRICTLY PROTECTED) */}
            <Route
              path="find-opportunity"
              element={
                <ProtectedRoute>
                  <VentureKhoj />
                </ProtectedRoute>
              }
            />
            <Route
              path="start"
              element={
                <ProtectedRoute>
                  <VentureKhoj />
                </ProtectedRoute>
              }
            />
            <Route
              path="assess"
              element={
                <ProtectedRoute>
                  <VentureKhoj />
                </ProtectedRoute>
              }
            />
            <Route
              path="results"
              element={
                <ProtectedRoute>
                  <Results />
                </ProtectedRoute>
              }
            />
            <Route
              path="business-plan"
              element={
                <ProtectedRoute>
                  <BusinessPlan />
                </ProtectedRoute>
              }
            />
            <Route
              path="opportunity/:id/plan"
              element={
                <ProtectedRoute>
                  <BusinessPlan />
                </ProtectedRoute>
              }
            />
            
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
            
            {/* Roadmap (PROTECTED) */}
            <Route
              path="roadmap"
              element={
                <ProtectedRoute>
                  <Roadmap />
                </ProtectedRoute>
              }
            />
            
            {/* Profile & Settings (PROTECTED) */}
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="settings" element={<Settings />} />
            
            {/* Market & Sources */}
            <Route path="market" element={<MarketRates />} />
            <Route path="market-rates" element={<MarketRates />} />
            <Route path="sources" element={<Sources />} />
            
            {/* Fallback to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
export default App;