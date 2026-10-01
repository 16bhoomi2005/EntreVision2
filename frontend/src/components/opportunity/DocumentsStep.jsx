import React, { useState } from "react";
import {
  FileText,
  Award,
  Briefcase,
  ShieldCheck,
  Paperclip,
  Plus,
  Trash2,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  X,
  FileCheck,
  Landmark,
  Building,
  Info,
} from "lucide-react";

export const DEFAULT_DOCUMENTS = {
  certificates: [
    {
      id: "cert-1",
      name: "ICAR-CCRI Food Processing & Debittering Certificate",
      org: "ICAR-Central Citrus Research Institute, Nagpur",
      year: "2023",
      skill: "Food Processing",
      fileName: "ccri_debittering_cert.pdf",
      status: "added",
    },
    {
      id: "cert-2",
      name: "Horticulture Propagation & Budwood Training",
      org: "Krishi Vigyan Kendra (KVK)",
      year: "2022",
      skill: "Nursery",
      fileName: "kvk_horticulture_training.pdf",
      status: "added",
    },
  ],
  experience: [
    {
      id: "exp-1",
      org: "Vidarbha Agro Packhouse & Cold Store",
      role: "Quality Sorting & Shellac Line Supervisor",
      duration: "2 years",
      type: "Post-Harvest Handling & Cold Chain",
      fileName: "experience_letter_vidarbha_agro.pdf",
      status: "added",
    },
  ],
  licenses: [
    {
      id: "lic-1",
      name: "FSSAI Food Safety Registration",
      regNo: "21523089000123",
      authority: "Food Safety and Standards Authority of India",
      fileName: "fssai_registration_cert.pdf",
      status: "added",
    },
    {
      id: "lic-2",
      name: "Udyam MSME Registration",
      regNo: "UDYAM-MH-20-0019283",
      authority: "Ministry of MSME, Govt of India",
      fileName: "udyam_registration.pdf",
      status: "added",
    },
  ],
  otherDocs: [
    {
      id: "oth-1",
      title: "Land Ownership Document (7/12 Extract)",
      desc: "Katol Taluka, 2.5 Acres Agricultural Land",
      fileName: "satbara_extract_katol.pdf",
      status: "needs_verification",
    },
  ],
};

export default function DocumentsStep({
  documents = DEFAULT_DOCUMENTS,
  onChange,
  onNext,
  onBack,
}) {
  // Modal / Form state for adding items
  const [activeModal, setActiveModal] = useState(null); // 'certificate' | 'experience' | 'license' | 'other' | null

  // Temporary form states
  const [certForm, setCertForm] = useState({
    name: "",
    org: "",
    year: "2024",
    skill: "",
    fileName: "",
  });

  const [expForm, setExpForm] = useState({
    org: "",
    role: "",
    duration: "1 year",
    type: "",
    fileName: "",
  });

  const [licForm, setLicForm] = useState({
    name: "FSSAI Basic Registration",
    regNo: "",
    authority: "FSSAI / State Licensing Authority",
    fileName: "",
  });

  const [othForm, setOthForm] = useState({
    title: "",
    desc: "",
    fileName: "",
  });

  // Helpers to add documents
  const handleAddCertificate = (e) => {
    e.preventDefault();
    if (!certForm.name.trim()) return;
    const newCert = {
      id: `cert-${Date.now()}`,
      ...certForm,
      fileName: certForm.fileName || "certificate_uploaded.pdf",
      status: "added",
    };
    onChange({
      documents: {
        ...documents,
        certificates: [...(documents.certificates || []), newCert],
      },
    });
    setCertForm({ name: "", org: "", year: "2024", skill: "", fileName: "" });
    setActiveModal(null);
  };

  const handleAddExperience = (e) => {
    e.preventDefault();
    if (!expForm.org.trim()) return;
    const newExp = {
      id: `exp-${Date.now()}`,
      ...expForm,
      fileName: expForm.fileName || "experience_letter.pdf",
      status: "added",
    };
    onChange({
      documents: {
        ...documents,
        experience: [...(documents.experience || []), newExp],
      },
    });
    setExpForm({ org: "", role: "", duration: "1 year", type: "", fileName: "" });
    setActiveModal(null);
  };

  const handleAddLicense = (e) => {
    e.preventDefault();
    if (!licForm.name.trim()) return;
    const newLic = {
      id: `lic-${Date.now()}`,
      ...licForm,
      fileName: licForm.fileName || "license_doc.pdf",
      status: "added",
    };
    onChange({
      documents: {
        ...documents,
        licenses: [...(documents.licenses || []), newLic],
      },
    });
    setLicForm({ name: "FSSAI Basic Registration", regNo: "", authority: "", fileName: "" });
    setActiveModal(null);
  };

  const handleAddOtherDoc = (e) => {
    e.preventDefault();
    if (!othForm.title.trim()) return;
    const newDoc = {
      id: `oth-${Date.now()}`,
      ...othForm,
      fileName: othForm.fileName || "supporting_doc.pdf",
      status: "needs_verification",
    };
    onChange({
      documents: {
        ...documents,
        otherDocs: [...(documents.otherDocs || []), newDoc],
      },
    });
    setOthForm({ title: "", desc: "", fileName: "" });
    setActiveModal(null);
  };

  const handleRemoveDoc = (category, id) => {
    onChange({
      documents: {
        ...documents,
        [category]: (documents[category] || []).filter((item) => item.id !== id),
      },
    });
  };

  const renderStatusBadge = (status) => {
    if (status === "added") {
      return <span className="doc-status-pill added">✓ Added</span>;
    }
    if (status === "needs_verification") {
      return (
        <span className="doc-status-pill pending">
          <Clock size={11} /> Uploaded — Needs Verification
        </span>
      );
    }
    return <span className="doc-status-pill not-provided">○ Not Provided</span>;
  };

  const handleContinue = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleContinue} className="about-me-container">
      {/* Intro Header */}
      <div className="wizard-intro-header">
        <h2 className="wizard-main-title">YOUR DOCUMENTS & PROOF</h2>
        <p className="wizard-main-subtitle">
          Your documents help us understand your qualifications, experience, and government subsidy eligibility.
        </p>
      </div>

      {/* Non-Mandatory / Mentorship Friendly Banner */}
      <div className="mentor-notice-banner">
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Info size={20} color="var(--cyan)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong style={{ fontSize: "0.92rem", color: "var(--cyan)", display: "block", marginBottom: 2 }}>
              Uploads are 100% Optional
            </strong>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.5 }}>
              You can continue without uploading documents now. You can add them later when they become relevant to a specific opportunity, DPR, or PMFME/MIDH government scheme.
            </p>
          </div>
        </div>
      </div>

      {/* Main Glass Form Card */}
      <div className="card wizard-form-card">
        {/* ====================================================================
            CATEGORY 1: 📜 CERTIFICATES
           ==================================================================== */}
        <div className="doc-category-box">
          <div className="doc-category-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Award size={20} color="var(--violet)" />
              <div>
                <strong style={{ fontSize: "1.05rem", color: "var(--text-heading)" }}>
                  📜 CERTIFICATES
                </strong>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                  Skill certifications, educational diplomas, training certificates
                </span>
              </div>
            </div>

            <button
              type="button"
              className="glass-btn"
              style={{ fontSize: "0.8rem", padding: "6px 14px" }}
              onClick={() => setActiveModal("certificate")}
            >
              <Plus size={15} /> Add Certificate
            </button>
          </div>

          <div className="doc-items-stack">
            {(documents.certificates || []).map((cert) => (
              <div key={cert.id} className="doc-item-card">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <FileText size={18} color="var(--violet)" />
                  <div>
                    <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)", display: "block" }}>
                      {cert.name}
                    </strong>
                    <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                      {cert.org} {cert.year && `• ${cert.year}`} {cert.fileName && `• 📎 ${cert.fileName}`}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {renderStatusBadge(cert.status)}
                  <button
                    type="button"
                    className="icon-btn-danger mini"
                    onClick={() => handleRemoveDoc("certificates", cert.id)}
                    title="Remove document"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal / Subform: Add Certificate */}
          {activeModal === "certificate" && (
            <div className="inline-add-modal">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <strong style={{ fontSize: "0.95rem", color: "var(--violet)" }}>
                  Add Skill / Educational Certificate
                </strong>
                <button type="button" className="close-subform-btn" onClick={() => setActiveModal(null)}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.2fr 0.8fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label className="field-sublabel">Certificate Name</label>
                  <input
                    type="text"
                    className="glass-input-field mini"
                    placeholder="e.g. Citrus Nursery Training"
                    value={certForm.name}
                    onChange={(e) => setCertForm({ ...certForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="field-sublabel">Issuing Organization</label>
                  <input
                    type="text"
                    className="glass-input-field mini"
                    placeholder="e.g. ICAR-CCRI / KVK"
                    value={certForm.org}
                    onChange={(e) => setCertForm({ ...certForm, org: e.target.value })}
                  />
                </div>
                <div>
                  <label className="field-sublabel">Year</label>
                  <input
                    type="text"
                    className="glass-input-field mini"
                    placeholder="e.g. 2023"
                    value={certForm.year}
                    onChange={(e) => setCertForm({ ...certForm, year: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <label className="upload-glass-btn">
                  <Upload size={14} />
                  <span>{certForm.fileName ? certForm.fileName : "📎 Upload Document (PDF/JPG)"}</span>
                  <input
                    type="file"
                    style={{ display: "none" }}
                    onChange={(e) => setCertForm({ ...certForm, fileName: e.target.files[0]?.name || "" })}
                  />
                </label>
                <button
                  type="button"
                  className="btn-primary-gloss"
                  style={{ padding: "8px 20px", fontSize: "0.85rem" }}
                  onClick={handleAddCertificate}
                >
                  Save Certificate
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ====================================================================
            CATEGORY 2: 💼 EXPERIENCE
           ==================================================================== */}
        <div className="doc-category-box">
          <div className="doc-category-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Briefcase size={20} color="var(--cyan)" />
              <div>
                <strong style={{ fontSize: "1.05rem", color: "var(--text-heading)" }}>
                  💼 EXPERIENCE PROOF
                </strong>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                  Prior work experience, packhouse supervision, farm management records
                </span>
              </div>
            </div>

            <button
              type="button"
              className="glass-btn"
              style={{ fontSize: "0.8rem", padding: "6px 14px" }}
              onClick={() => setActiveModal("experience")}
            >
              <Plus size={15} /> Add Experience
            </button>
          </div>

          <div className="doc-items-stack">
            {(documents.experience || []).map((exp) => (
              <div key={exp.id} className="doc-item-card">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Building size={18} color="var(--cyan)" />
                  <div>
                    <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)", display: "block" }}>
                      {exp.org}
                    </strong>
                    <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                      {exp.role} • {exp.duration} {exp.fileName && `• 📎 ${exp.fileName}`}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {renderStatusBadge(exp.status)}
                  <button
                    type="button"
                    className="icon-btn-danger mini"
                    onClick={() => handleRemoveDoc("experience", exp.id)}
                    title="Remove item"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal / Subform: Add Experience */}
          {activeModal === "experience" && (
            <div className="inline-add-modal">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <strong style={{ fontSize: "0.95rem", color: "var(--cyan)" }}>
                  Add Work Experience Record
                </strong>
                <button type="button" className="close-subform-btn" onClick={() => setActiveModal(null)}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.2fr 0.8fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label className="field-sublabel">Organization / Business</label>
                  <input
                    type="text"
                    className="glass-input-field mini"
                    placeholder="e.g. ABC Foods / Kalamna Mandi Unit"
                    value={expForm.org}
                    onChange={(e) => setExpForm({ ...expForm, org: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="field-sublabel">Role / Responsibility</label>
                  <input
                    type="text"
                    className="glass-input-field mini"
                    placeholder="e.g. Sorting Lead / Machine Operator"
                    value={expForm.role}
                    onChange={(e) => setExpForm({ ...expForm, role: e.target.value })}
                  />
                </div>
                <div>
                  <label className="field-sublabel">Duration</label>
                  <input
                    type="text"
                    className="glass-input-field mini"
                    placeholder="e.g. 2 years"
                    value={expForm.duration}
                    onChange={(e) => setExpForm({ ...expForm, duration: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <label className="upload-glass-btn">
                  <Upload size={14} />
                  <span>{expForm.fileName ? expForm.fileName : "📎 Upload Experience Letter (Optional)"}</span>
                  <input
                    type="file"
                    style={{ display: "none" }}
                    onChange={(e) => setExpForm({ ...expForm, fileName: e.target.files[0]?.name || "" })}
                  />
                </label>
                <button
                  type="button"
                  className="btn-primary-gloss"
                  style={{ padding: "8px 20px", fontSize: "0.85rem" }}
                  onClick={handleAddExperience}
                >
                  Save Experience
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ====================================================================
            CATEGORY 3: 🪪 LICENSES / REGISTRATIONS
           ==================================================================== */}
        <div className="doc-category-box">
          <div className="doc-category-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ShieldCheck size={20} color="var(--ok)" />
              <div>
                <strong style={{ fontSize: "1.05rem", color: "var(--text-heading)" }}>
                  🪪 LICENSES & REGISTRATIONS
                </strong>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                  FSSAI, Udyam MSME, APMC trader license, Shop Act (checked during DPR matching)
                </span>
              </div>
            </div>

            <button
              type="button"
              className="glass-btn"
              style={{ fontSize: "0.8rem", padding: "6px 14px" }}
              onClick={() => setActiveModal("license")}
            >
              <Plus size={15} /> Add License / Registration
            </button>
          </div>

          <div className="doc-items-stack">
            {(documents.licenses || []).map((lic) => (
              <div key={lic.id} className="doc-item-card">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <ShieldCheck size={18} color="var(--ok)" />
                  <div>
                    <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)", display: "block" }}>
                      {lic.name}
                    </strong>
                    <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                      {lic.regNo ? `Reg: ${lic.regNo}` : lic.authority} {lic.fileName && `• 📎 ${lic.fileName}`}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {renderStatusBadge(lic.status)}
                  <button
                    type="button"
                    className="icon-btn-danger mini"
                    onClick={() => handleRemoveDoc("licenses", lic.id)}
                    title="Remove license"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal / Subform: Add License */}
          {activeModal === "license" && (
            <div className="inline-add-modal">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <strong style={{ fontSize: "0.95rem", color: "var(--ok)" }}>
                  Add License or Statutory Registration
                </strong>
                <button type="button" className="close-subform-btn" onClick={() => setActiveModal(null)}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.2fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label className="field-sublabel">License / Registration Type</label>
                  <select
                    className="glass-select-field mini"
                    value={licForm.name}
                    onChange={(e) => setLicForm({ ...licForm, name: e.target.value })}
                  >
                    <option value="FSSAI Basic / State License">FSSAI Basic / State License</option>
                    <option value="Udyam MSME Registration">Udyam MSME Registration</option>
                    <option value="APMC Mandi Trader License">APMC Mandi Trader License</option>
                    <option value="GSTIN Registration">GSTIN Registration</option>
                    <option value="Panchayat / Municipal Trade NOC">Panchayat / Municipal Trade NOC</option>
                    <option value="Other Regulatory Registration">Other Regulatory Registration</option>
                  </select>
                </div>
                <div>
                  <label className="field-sublabel">Registration / Certificate Number (Optional)</label>
                  <input
                    type="text"
                    className="glass-input-field mini"
                    placeholder="e.g. 21523089000123"
                    value={licForm.regNo}
                    onChange={(e) => setLicForm({ ...licForm, regNo: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <label className="upload-glass-btn">
                  <Upload size={14} />
                  <span>{licForm.fileName ? licForm.fileName : "📎 Upload Certificate Copy"}</span>
                  <input
                    type="file"
                    style={{ display: "none" }}
                    onChange={(e) => setLicForm({ ...licForm, fileName: e.target.files[0]?.name || "" })}
                  />
                </label>
                <button
                  type="button"
                  className="btn-primary-gloss"
                  style={{ padding: "8px 20px", fontSize: "0.85rem" }}
                  onClick={handleAddLicense}
                >
                  Save License
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ====================================================================
            CATEGORY 4: 📎 OTHER SUPPORTING DOCUMENTS
           ==================================================================== */}
        <div className="doc-category-box">
          <div className="doc-category-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Paperclip size={20} color="var(--electric-blue)" />
              <div>
                <strong style={{ fontSize: "1.05rem", color: "var(--text-heading)" }}>
                  📎 OTHER SUPPORTING DOCUMENTS
                </strong>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                  Land records (7/12 extract), existing machinery invoices, water test certificates
                </span>
              </div>
            </div>

            <button
              type="button"
              className="glass-btn"
              style={{ fontSize: "0.8rem", padding: "6px 14px" }}
              onClick={() => setActiveModal("other")}
            >
              <Plus size={15} /> Upload Document
            </button>
          </div>

          <div className="doc-items-stack">
            {(documents.otherDocs || []).map((doc) => (
              <div key={doc.id} className="doc-item-card">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Paperclip size={18} color="var(--electric-blue)" />
                  <div>
                    <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)", display: "block" }}>
                      {doc.title}
                    </strong>
                    <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>
                      {doc.desc} {doc.fileName && `• 📎 ${doc.fileName}`}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  {renderStatusBadge(doc.status)}
                  <button
                    type="button"
                    className="icon-btn-danger mini"
                    onClick={() => handleRemoveDoc("otherDocs", doc.id)}
                    title="Remove document"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Modal / Subform: Add Other Doc */}
          {activeModal === "other" && (
            <div className="inline-add-modal">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <strong style={{ fontSize: "0.95rem", color: "var(--electric-blue)" }}>
                  Upload Land / Asset / Infrastructure Document
                </strong>
                <button type="button" className="close-subform-btn" onClick={() => setActiveModal(null)}>
                  <X size={16} />
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.4fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label className="field-sublabel">Document Title</label>
                  <input
                    type="text"
                    className="glass-input-field mini"
                    placeholder="e.g. 7/12 Land Record / Soil Lab Report"
                    value={othForm.title}
                    onChange={(e) => setOthForm({ ...othForm, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="field-sublabel">Description / Location Context</label>
                  <input
                    type="text"
                    className="glass-input-field mini"
                    placeholder="e.g. 2 Acres orchard in Katol"
                    value={othForm.desc}
                    onChange={(e) => setOthForm({ ...othForm, desc: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <label className="upload-glass-btn">
                  <Upload size={14} />
                  <span>{othForm.fileName ? othForm.fileName : "📎 Upload File"}</span>
                  <input
                    type="file"
                    style={{ display: "none" }}
                    onChange={(e) => setOthForm({ ...othForm, fileName: e.target.files[0]?.name || "" })}
                  />
                </label>
                <button
                  type="button"
                  className="btn-primary-gloss"
                  style={{ padding: "8px 20px", fontSize: "0.85rem" }}
                  onClick={handleAddOtherDoc}
                >
                  Save Document
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ====================================================================
            DOCUMENT CENTER EXPLANATORY VALUE PROP CARD
           ==================================================================== */}
        <div className="doc-center-highlight-box">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Sparkles size={18} color="var(--cyan)" />
            <strong style={{ fontSize: "0.92rem", color: "var(--text-heading)", textTransform: "uppercase" }}>
              💡 YOUR DOCUMENTS CAN BE USED THROUGHOUT ENTREVISION
            </strong>
          </div>

          <p style={{ fontSize: "0.82rem", color: "var(--muted)", margin: "0 0 12px 0" }}>
            Documents automatically feed into your downstream entrepreneurial workflow:
          </p>

          <div className="doc-benefits-grid">
            <div className="doc-benefit-item">
              <CheckCircle2 size={15} color="var(--ok)" />
              <span>Opportunity Assessment</span>
            </div>
            <div className="doc-benefit-item">
              <CheckCircle2 size={15} color="var(--ok)" />
              <span>Automated Business Plan</span>
            </div>
            <div className="doc-benefit-item">
              <CheckCircle2 size={15} color="var(--ok)" />
              <span>Skill-Gap Identification</span>
            </div>
            <div className="doc-benefit-item">
              <CheckCircle2 size={15} color="var(--ok)" />
              <span>Government Scheme Eligibility</span>
            </div>
            <div className="doc-benefit-item">
              <CheckCircle2 size={15} color="var(--ok)" />
              <span>Bank Funding Applications</span>
            </div>
            <div className="doc-benefit-item">
              <CheckCircle2 size={15} color="var(--ok)" />
              <span>Phased Business Roadmap</span>
            </div>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="wizard-actions-bar">
          <button type="button" className="btn-secondary-gloss" onClick={onBack}>
            <ArrowLeft size={16} /> Back
          </button>
          <button type="submit" className="btn-primary-gloss" style={{ padding: "16px 36px" }}>
            <span>Continue</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </form>
  );
}
