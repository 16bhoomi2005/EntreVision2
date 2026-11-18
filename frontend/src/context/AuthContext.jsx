import React, { createContext, useContext, useState, useEffect } from "react";
import { apiLogin, apiRegister, fetchDemoUsers, apiGetMe, saveActiveVenture, saveUserProfile } from "../services/api";

const AuthContext = createContext(null);

export const DEFAULT_DEMO_USERS = [
  {
    id: "usr_bhoomi",
    email: "bhoomika@entrevision.in",
    full_name: "Bhoomika Vaishya",
    role: "Agro-Entrepreneur",
    tehsil: "Katol",
    district: "Nagpur",
    phone: "+91 98765 43210",
    avatar: "🍊",
    activeVenture: {
      id: "OPP01",
      name: "Disease-Free Certified Citrus Nursery",
      category: "Agri-Business & Nursery",
      location: "Katol, Nagpur District",
      suitability_score: 92,
      feasibility_score: 92,
      capital_fit: 90,
      infrastructure_fit: 94,
      market_fit: 90,
      skill_fit: 95,
      score_type: "MCDA",
      total_cost: 480000,
      own_equity: 250000,
      subsidy_amount: 168000,
      subsidy_scheme: "PMFME 35% Credit-Linked Capital Subsidy",
      bank_loan: 62000,
      journey_phase: 2,
      current_task: "CCRI Mother Plant Certification & Registration",
      next_deadline: "Next 14 Days",
    },
  },
  {
    id: "usr_ramesh",
    email: "ramesh.patil@vidarbhaagro.org",
    full_name: "Ramesh Patil",
    role: "Citrus Grower & Aggregator",
    tehsil: "Warud",
    district: "Amravati / Nagpur Border",
    phone: "+91 94221 88321",
    avatar: "🌾",
    activeVenture: {
      id: "OPP04",
      name: "Farm-Gate Sorting, Grading & Cold Aggregation Hub",
      category: "Post-Harvest Aggregation",
      location: "Warud, Amravati/Nagpur Border",
      suitability_score: 88,
      feasibility_score: 88,
      capital_fit: 86,
      infrastructure_fit: 90,
      market_fit: 88,
      skill_fit: 90,
      score_type: "MCDA",
      total_cost: 320000,
      own_equity: 120000,
      subsidy_amount: 112000,
      subsidy_scheme: "MIDH 35% Post-Harvest Infrastructure Grant",
      bank_loan: 88000,
      journey_phase: 3,
      current_task: "APMC Grading Line Procurement & Electricity Sanction",
      next_deadline: "Next 10 Days",
    },
  },
  {
    id: "usr_pooja",
    email: "pooja.deshmukh@nagpuragro.com",
    full_name: "Pooja Deshmukh",
    role: "Agri-Business Founder",
    tehsil: "Kalmeshwar",
    district: "Nagpur",
    phone: "+91 98230 11234",
    avatar: "🏭",
    activeVenture: {
      id: "OPP08",
      name: "Integrated Citrus Waxing, Cold Storage & RTS Juice Plant",
      category: "Agro-Processing & Value Addition",
      location: "Kalmeshwar MIDC, Nagpur",
      suitability_score: 94,
      feasibility_score: 94,
      capital_fit: 92,
      infrastructure_fit: 95,
      market_fit: 96,
      skill_fit: 92,
      score_type: "MCDA",
      total_cost: 1850000,
      own_equity: 600000,
      subsidy_amount: 647500,
      subsidy_scheme: "PMFME 35% Capital Subsidy + MIDH Top-up",
      bank_loan: 602500,
      journey_phase: 2,
      current_task: "FSSAI Commercial Processing License & MIDC Shed Lease",
      next_deadline: "Next 20 Days",
    },
  },
];

export function persistUserAssessmentToStorage(userId, assessmentData, activeVenture) {
  if (!userId) return;
  try {
    if (assessmentData) {
      if (assessmentData.about_me) {
        localStorage.setItem(`ev_${userId}_about_me`, JSON.stringify(assessmentData.about_me));
      }
      if (assessmentData.skills_detailed || assessmentData.skills) {
        const skills = assessmentData.skills_detailed || assessmentData.skills;
        localStorage.setItem(`ev_${userId}_skills_data`, JSON.stringify(skills));
      }
      if (assessmentData.documents) {
        localStorage.setItem(`ev_${userId}_user_documents`, JSON.stringify(assessmentData.documents));
      }
      if (assessmentData.resources_detailed) {
        localStorage.setItem(`ev_${userId}_user_resources`, JSON.stringify(assessmentData.resources_detailed));
      }
      if (assessmentData.finance_detailed) {
        localStorage.setItem(`ev_${userId}_user_finances`, JSON.stringify(assessmentData.finance_detailed));
      }
      if (assessmentData.location_detailed) {
        localStorage.setItem(`ev_${userId}_user_location`, JSON.stringify(assessmentData.location_detailed));
      }
      if (assessmentData.business_preferences) {
        localStorage.setItem(`ev_${userId}_user_preferences`, JSON.stringify(assessmentData.business_preferences));
      }
      if (assessmentData.latest_recommendations) {
        const payload = {
          results: assessmentData.latest_recommendations,
          userInput: {
            about_me: assessmentData.about_me,
            location: assessmentData.location_detailed?.selectedCluster || "Katol",
          },
        };
        localStorage.setItem(`ev_${userId}_assessment_results`, JSON.stringify(payload));
      }
    }
    if (activeVenture) {
      localStorage.setItem(`ev_${userId}_active_venture`, JSON.stringify(activeVenture));
    }
  } catch (err) {
    console.warn("Error persisting user assessment to storage:", err);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("ev_auth_user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("ev_auth_token") || null;
  });

  const [demoProfiles, setDemoProfiles] = useState(DEFAULT_DEMO_USERS);
  const [loading, setLoading] = useState(false);

  const [activeVenture, setActiveVentureState] = useState(() => {
    try {
      const savedUser = localStorage.getItem("ev_auth_user");
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u?.id) {
          const userVenture = localStorage.getItem(`ev_${u.id}_active_venture`);
          if (userVenture) return JSON.parse(userVenture);
        }
      }
      const saved = localStorage.getItem("ev_active_business_plan");
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.opportunity || parsed;
      }
    } catch {}
    return null;
  });

  const setActiveVenture = (venture) => {
    setActiveVentureState(venture);
    try {
      if (venture) {
        localStorage.setItem("ev_active_business_plan", JSON.stringify({ opportunity: venture }));
        localStorage.setItem("ev_saved_roadmap", JSON.stringify({
          id: venture.id || venture.opportunity_id,
          name: venture.name,
          category: venture.category,
          location: venture.location,
          targetCapEx: venture.total_cost,
          addedAt: new Date().toISOString(),
        }));
        if (user?.id) {
          localStorage.setItem(`ev_${user.id}_active_venture`, JSON.stringify(venture));
          saveActiveVenture({ user_id: user.id, active_venture: venture }).catch((err) => {
            console.warn("Failed to persist active venture to backend:", err);
          });
        }
      } else {
        localStorage.removeItem("ev_active_business_plan");
        localStorage.removeItem("ev_saved_roadmap");
        if (user?.id) {
          localStorage.removeItem(`ev_${user.id}_active_venture`);
        }
      }
    } catch (e) {
      console.warn("Error setting active venture:", e);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setActiveVentureState(null);
    // Clear all EntreVision keys to completely prevent cross-user data bleeding
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("ev_") || key.startsWith("entrevision_"))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {}
  };

  useEffect(() => {
    // Attempt to verify session with PostgreSQL database
    const savedToken = localStorage.getItem("ev_auth_token");
    if (savedToken) {
      apiGetMe()
        .then((res) => {
          if (res?.user) {
            setUser(res.user);
            localStorage.setItem("ev_auth_user", JSON.stringify(res.user));
            if (res.assessment_data || res.activeVenture) {
              persistUserAssessmentToStorage(res.user.id, res.assessment_data, res.activeVenture);
            }
            if (res.activeVenture) {
              setActiveVentureState(res.activeVenture);
              localStorage.setItem("ev_active_business_plan", JSON.stringify({ opportunity: res.activeVenture }));
            }
          }
        })
        .catch(() => {
          // Token expired or invalid
          logout();
        });
    }

    // Refresh demo users from backend PostgreSQL
    fetchDemoUsers()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDemoProfiles(data);
        }
      })
      .catch(() => {});
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await apiLogin({ email, password });
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem("ev_auth_user", JSON.stringify(res.user));
      localStorage.setItem("ev_auth_token", res.token);
      if (res.assessment_data || res.activeVenture) {
        persistUserAssessmentToStorage(res.user.id, res.assessment_data, res.activeVenture);
      }
      if (res.activeVenture) {
        setActiveVenture(res.activeVenture);
      } else {
        setActiveVentureState(null);
        localStorage.removeItem("ev_active_business_plan");
      }
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await apiRegister(userData);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem("ev_auth_user", JSON.stringify(res.user));
      localStorage.setItem("ev_auth_token", res.token);

      // Check if user filled in assessment wizard prior to registering as a guest
      let guestAbout = null;
      let guestSkills = null;
      let guestDocs = null;
      let guestRes = null;
      let guestFin = null;
      let guestLoc = null;
      let guestPref = null;
      try {
        const rawAbout = localStorage.getItem("ev_guest_about_me");
        if (rawAbout) guestAbout = JSON.parse(rawAbout);
        const rawSkills = localStorage.getItem("ev_guest_skills_data");
        if (rawSkills) guestSkills = JSON.parse(rawSkills);
        const rawDocs = localStorage.getItem("ev_guest_user_documents");
        if (rawDocs) guestDocs = JSON.parse(rawDocs);
        const rawRes = localStorage.getItem("ev_guest_user_resources");
        if (rawRes) guestRes = JSON.parse(rawRes);
        const rawFin = localStorage.getItem("ev_guest_user_finances");
        if (rawFin) guestFin = JSON.parse(rawFin);
        const rawLoc = localStorage.getItem("ev_guest_user_location");
        if (rawLoc) guestLoc = JSON.parse(rawLoc);
        const rawPref = localStorage.getItem("ev_guest_user_preferences");
        if (rawPref) guestPref = JSON.parse(rawPref);
      } catch {}

      if (guestAbout || guestSkills || guestRes || guestLoc) {
        const guestAssessment = {
          about_me: guestAbout || { fullName: res.user.full_name },
          skills_detailed: guestSkills || [],
          documents: guestDocs || [],
          resources_detailed: guestRes || {},
          finance_detailed: guestFin || {},
          location_detailed: guestLoc || {},
          business_preferences: guestPref || {},
        };
        persistUserAssessmentToStorage(res.user.id, guestAssessment, null);
        saveUserProfile({
          user_id: res.user.id,
          profile: {
            full_name: res.user.full_name,
            tehsil: res.user.tehsil,
            district: res.user.district,
          },
          assessment_data: guestAssessment,
        }).catch((err) => console.warn("Could not sync guest assessment on register:", err));

        // Clean up guest keys so subsequent registrations don't inherit this data
        try {
          const guestKeys = ["about_me", "skills_data", "user_documents", "user_resources", "user_finances", "user_location", "user_preferences", "assessment_results"];
          guestKeys.forEach((k) => localStorage.removeItem(`ev_guest_${k}`));
        } catch {}
      } else if (res.assessment_data) {
        persistUserAssessmentToStorage(res.user.id, res.assessment_data, null);
      }

      setActiveVentureState(null);
      localStorage.removeItem("ev_active_business_plan");
      return res.user;
    } finally {
      setLoading(false);
    }
  };

  const DEMO_PASSWORDS = {
    "bhoomika@entrevision.in": "entrevision123",
    "ramesh.patil@vidarbhaagro.org": "farmer123",
    "pooja.deshmukh@nagpuragro.com": "pooja123",
  };

  const quickLogin = async (selectedUser) => {
    const password = DEMO_PASSWORDS[selectedUser.email] || "farmer123";
    try {
      return await login(selectedUser.email, password);
    } catch {
      // Fallback
      setUser(selectedUser);
      localStorage.setItem("ev_auth_user", JSON.stringify(selectedUser));
      if (selectedUser.activeVenture) {
        setActiveVenture(selectedUser.activeVenture);
      }
      return selectedUser;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        activeVenture,
        hasCompletedAssessment: !!activeVenture,
        setActiveVenture,
        loading,
        demoProfiles,
        login,
        register,
        quickLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
