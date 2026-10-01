import React from "react";
import { Check } from "lucide-react";

export const WIZARD_STEPS = [
  { id: 1, label: "ABOUT YOU", short: "About You" },
  { id: 2, label: "SKILLS", short: "Skills" },
  { id: 3, label: "PROOF", short: "Proof" },
  { id: 4, label: "RESOURCES", short: "Resources" },
  { id: 5, label: "LOCATION", short: "Location" },
  { id: 6, label: "FINANCE", short: "Finance" },
  { id: 7, label: "PREFERENCES", short: "Preferences" },
];

export default function OpportunityWizardTracker({ currentStep = 1, onStepClick }) {
  return (
    <div className="wizard-tracker-container">
      {/* Top Meta Bar */}
      <div className="wizard-tracker-header">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="glowing-pill" style={{ margin: 0, padding: "5px 12px", fontSize: "0.75rem" }}>
            🔎 FIND YOUR OPPORTUNITY
          </span>
        </div>
        <span className="wizard-step-counter">
          STEP {currentStep} OF {WIZARD_STEPS.length}
        </span>
      </div>

      {/* Progress Bar & Steps Trail */}
      <div className="wizard-steps-trail">
        {WIZARD_STEPS.map((s, idx) => {
          const isActive = currentStep === s.id;
          const isCompleted = currentStep > s.id;

          return (
            <div
              key={s.id}
              className={`wizard-step-item ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
              onClick={() => isCompleted && onStepClick && onStepClick(s.id)}
              style={{ cursor: isCompleted ? "pointer" : "default" }}
            >
              <div className="wizard-step-dot">
                {isCompleted ? <Check size={12} strokeWidth={3} /> : s.id}
              </div>
              <span className="wizard-step-label">{s.label}</span>
              {idx < WIZARD_STEPS.length - 1 && <div className="wizard-step-line" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
