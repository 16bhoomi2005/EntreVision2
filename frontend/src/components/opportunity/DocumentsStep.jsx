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
  Download,
  AlertTriangle,
} from "lucide-react";
import {
  uploadDocument,
  updateDocumentStatus,
  deleteDocument,
  getDocumentDownloadUrl,
} from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export const DEFAULT_DOCUMENTS = {
  certificates: [],
  experience: [],
  licenses: [],
  otherDocs: [],
};

const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export default function DocumentsStep({
  documents = DEFAULT_DOCUMENTS,
  onChange,
  onNext,
  onBack,
}) {
  const { user } = useAuth();
  const [activeModal, setActiveModal] = useState(null); // 'certificate' | 'experience' | 'license' | 'other' | null
  const [uploadLoading, setUploadLoading] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [uploadSuccessMsg, setUploadSuccessMsg] = useState(null);

  // Temporary form states
  const [certForm, setCertForm] = useState({
    name: "",
    org: "",
    year: "2024",
    skill: "",
    selectedFile: null,
  });

  const [expForm, setExpForm] = useState({
    org: "",
    role: "",
    duration: "1 year",
    type: "",
    selectedFile: null,
  });

  const [licForm, setLicForm] = useState({
    name: "FSSAI Basic / State License",
    regNo: "",
    authority: "FSSAI / State Licensing Authority",
    selectedFile: null,
  });

  const [othForm, setOthForm] = useState({
    title: "",
    desc: "",
    selectedFile: null,
  });

  // Client-side file validation (Step 2)
  const validateFile = (file) => {
    if (!file) return "No file selected.";
    if (file.size === 0) return "Empty file selected (0 bytes). Please select a valid document.";
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return `File exceeds maximum 5 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB). Please compress or choose a smaller file.`;
    }
    const name = file.name || "";
    const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Unsupported file format '${ext}'. Only PDF, JPG, and PNG files are accepted.`;
    }
    return null;
  };

  // Perform secure upload to backend
  const executeUpload = async (file, category, title) => {
    const err = validateFile(file);
    if (err) {
      setValidationError(err);
      return null;
    }
    setUploadLoading(true);
    setValidationError(null);
    try {
      const res = await uploadDocument(file, {
        userId: user?.id,
        category,
        title: title || file.name,
      });
      setUploadSuccessMsg(`✓ "${file.name}" uploaded securely and queued for review.`);
      setTimeout(() => setUploadSuccessMsg(null), 4000);
      return res.document;
    } catch (e) {
      setValidationError(e.message || "Upload failed. Please try again.");
      return null;
    } finally {
      setUploadLoading(false);
    }
  };

  // Helpers to add documents
  const handleAddCertificate = async (e) => {
    e.preventDefault();
    if (!certForm.name.trim()) return;

    let serverDoc = null;
    if (certForm.selectedFile) {
      serverDoc = await executeUpload(certForm.selectedFile, "certificate", certForm.name);
      if (!serverDoc) return; // validation or upload failed
    }

    const newCert = {
      id: serverDoc?.id || `cert-${Date.now()}`,
      serverDocId: serverDoc?.id,
      name: certForm.name,
      org: certForm.org,
      year: certForm.year,
      skill: certForm.skill,
      fileName: serverDoc?.original_filename || certForm.selectedFile?.name || "Certificate Record",
      fileType: serverDoc?.file_type,
      fileSize: serverDoc?.file_size_formatted,
      status: serverDoc?.verification_status || "Uploaded",
    };

    onChange({
      documents: {
        ...documents,
        certificates: [...(documents.certificates || []), newCert],
      },
    });
    setCertForm({ name: "", org: "", year: "2024", skill: "", selectedFile: null });
    setActiveModal(null);
  };

  const handleAddExperience = async (e) => {
    e.preventDefault();
    if (!expForm.org.trim()) return;

    let serverDoc = null;
    if (expForm.selectedFile) {
      serverDoc = await executeUpload(expForm.selectedFile, "experience", `${expForm.org} - ${expForm.role}`);
      if (!serverDoc) return;
    }

    const newExp = {
      id: serverDoc?.id || `exp-${Date.now()}`,
      serverDocId: serverDoc?.id,
      org: expForm.org,
      role: expForm.role,
      duration: expForm.duration,
      type: expForm.type,
      fileName: serverDoc?.original_filename || expForm.selectedFile?.name || "Experience Record",
      fileType: serverDoc?.file_type,
      fileSize: serverDoc?.file_size_formatted,
      status: serverDoc?.verification_status || "Uploaded",
    };

    onChange({
      documents: {
        ...documents,
        experience: [...(documents.experience || []), newExp],
      },
    });
    setExpForm({ org: "", role: "", duration: "1 year", type: "", selectedFile: null });
    setActiveModal(null);
  };

  const handleAddLicense = async (e) => {
    e.preventDefault();
    if (!licForm.name.trim()) return;

    let serverDoc = null;
    if (licForm.selectedFile) {
      serverDoc = await executeUpload(licForm.selectedFile, "license", `${licForm.name} ${licForm.regNo || ""}`);
      if (!serverDoc) return;
    }

    const newLic = {
      id: serverDoc?.id || `lic-${Date.now()}`,
      serverDocId: serverDoc?.id,
      name: licForm.name,
      regNo: licForm.regNo,
      authority: licForm.authority,
      fileName: serverDoc?.original_filename || licForm.selectedFile?.name || "License Record",
      fileType: serverDoc?.file_type,
      fileSize: serverDoc?.file_size_formatted,
      status: serverDoc?.verification_status || "Uploaded",
    };

    onChange({
      documents: {
        ...documents,
        licenses: [...(documents.licenses || []), newLic],
      },
    });
    setLicForm({ name: "FSSAI Basic / State License", regNo: "", authority: "", selectedFile: null });
    setActiveModal(null);
  };

  const handleAddOtherDoc = async (e) => {
    e.preventDefault();
    if (!othForm.title.trim()) return;

    let serverDoc = null;
    if (othForm.selectedFile) {
      serverDoc = await executeUpload(othForm.selectedFile, "other", othForm.title);
      if (!serverDoc) return;
    }

    const newDoc = {
      id: serverDoc?.id || `oth-${Date.now()}`,
      serverDocId: serverDoc?.id,
      title: othForm.title,
      desc: othForm.desc,
      fileName: serverDoc?.original_filename || othForm.selectedFile?.name || "Supporting Record",
      fileType: serverDoc?.file_type,
      fileSize: serverDoc?.file_size_formatted,
      status: serverDoc?.verification_status || "Uploaded",
    };

    onChange({
      documents: {
        ...documents,
        otherDocs: [...(documents.otherDocs || []), newDoc],
      },
    });
    setOthForm({ title: "", desc: "", selectedFile: null });
    setActiveModal(null);
  };

  // Direct quick upload via dropzone
  const handleQuickDropUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const serverDoc = await executeUpload(file, "other", file.name);
    if (!serverDoc) return;

    const newDoc = {
      id: serverDoc.id,
      serverDocId: serverDoc.id,
      title: serverDoc.title || file.name,
      desc: `Direct Upload (${serverDoc.file_size_formatted})`,
      fileName: serverDoc.original_filename,
      fileType: serverDoc.file_type,
      fileSize: serverDoc.file_size_formatted,
      status: serverDoc.verification_status,
    };

    onChange({
      documents: {
        ...documents,
        otherDocs: [...(documents.otherDocs || []), newDoc],
      },
    });
    e.target.value = "";
  };

  const handleRemoveDoc = async (category, id, serverDocId) => {
    if (serverDocId) {
      try {
        await deleteDocument(serverDocId);
      } catch (err) {
        console.warn("Could not delete document from server:", err);
      }
    }
    onChange({
      documents: {
        ...documents,
        [category]: (documents[category] || []).filter((item) => item.id !== id),
      },
    });
  };

  // Step 5: Update document verification status
  const handleStatusChange = async (category, docId, serverDocId, newStatus) => {
    if (serverDocId) {
      try {
        await updateDocumentStatus(serverDocId, newStatus);
      } catch (err) {
        console.warn("Could not update status on server:", err);
      }
    }
    const updatedCategory = (documents[category] || []).map((item) => {
      if (item.id === docId) {
        return { ...item, status: newStatus };
      }
      return item;
    });
    onChange({
      documents: {
        ...documents,
        [category]: updatedCategory,
      },
    });
  };

  // Step 5: Render 4 Document Review Statuses
  const renderStatusBadge = (status = "Uploaded", category, docId, serverDocId) => {
    const s = (status || "").toLowerCase();
    let badgeClass = "uploaded";
    let icon = <Upload size={11} />;
    let label = "Uploaded";

    if (s.includes("pending")) {
      badgeClass = "pending";
      icon = <Clock size={11} />;
      label = "Pending review";
    } else if (s.includes("verifi") || s === "added") {
      badgeClass = "verified";
      icon = <CheckCircle2 size={11} />;
      label = "Verified by reviewer";
    } else if (s.includes("reject")) {
      badgeClass = "rejected";
      icon = <AlertCircle size={11} />;
      label = "Rejected";
    }

    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <span className={`doc-status-pill ${badgeClass}`} title={`Status: ${label}`}>
          {icon} {label}
        </span>
        {/* Interactive reviewer test control */}
        <select
          value={label}
          onChange={(e) => handleStatusChange(category, docId, serverDocId, e.target.value)}
          title="Reviewer status test selector"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--line)",
            color: "var(--muted)",
            fontSize: "0.68rem",
            borderRadius: 4,
            padding: "2px 4px",
            cursor: "pointer",
          }}
        >
          <option value="Uploaded">Status: Uploaded</option>
          <option value="Pending review">Status: Pending review</option>
          <option value="Verified by reviewer">Status: Verified by reviewer</option>
          <option value="Rejected">Status: Rejected</option>
        </select>
      </div>
    );
  };

  const handleContinue = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form onSubmit={handleContinue} className="about-me-container">
      {/* Intro Header */}
      <div className="wizard-intro-header">
        <h2 className="wizard-main-title">YOUR DOCUMENTS & VERIFICATION PROOF</h2>
        <p className="wizard-main-subtitle">
          Upload certificates, land records, and licenses to verify eligibility for PMFME/MIDH capital subsidies and bank DPR financing.
        </p>
      </div>

      {/* Validation Error Banner */}
      {validationError && (
        <div style={{
          background: "rgba(239, 68, 68, 0.12)",
          border: "1px solid rgba(239, 68, 68, 0.35)",
          borderRadius: 12,
          padding: "12px 16px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "#f87171",
          fontSize: "0.85rem"
        }}>
          <AlertTriangle size={18} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>{validationError}</div>
          <button
            type="button"
            onClick={() => setValidationError(null)}
            style={{ background: "none", border: "none", color: "#f87171", cursor: "pointer" }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Success Notification Banner */}
      {uploadSuccessMsg && (
        <div style={{
          background: "rgba(34, 197, 94, 0.12)",
          border: "1px solid rgba(34, 197, 94, 0.35)",
          borderRadius: 12,
          padding: "12px 16px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "var(--ok)",
          fontSize: "0.85rem"
        }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1 }}>{uploadSuccessMsg}</div>
        </div>
      )}

      {/* Quick Upload Dropzone (Step 1 & Step 2) */}
      <div style={{
        background: "rgba(255, 255, 255, 0.03)",
        border: "2px dashed var(--line)",
        borderRadius: 16,
        padding: "24px 20px",
        textAlign: "center",
        marginBottom: 24,
        position: "relative",
        transition: "border-color 0.2s ease"
      }}>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleQuickDropUpload}
          disabled={uploadLoading}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0,
            cursor: uploadLoading ? "not-allowed" : "pointer"
          }}
        />
        <div style={{
          width: 44,
          height: 44,
          borderRadius: "50%",
          background: "rgba(6, 182, 212, 0.15)",
          color: "var(--cyan)",
          display: "grid",
          placeItems: "center",
          margin: "0 auto 12px"
        }}>
          <Upload size={22} />
        </div>
        <strong style={{ fontSize: "0.95rem", color: "var(--text-heading)", display: "block", marginBottom: 4 }}>
          {uploadLoading ? "Uploading & Validating Document..." : "Quick File Upload (Click or Drag & Drop)"}
        </strong>
        <p style={{ margin: "0 auto 8px", fontSize: "0.8rem", color: "var(--muted)", maxWidth: 440 }}>
          Accepts <strong>PDF, JPG, PNG</strong> up to <strong>5 MB</strong>. Documents are stored securely outside the web root with unique UUID hashing.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, fontSize: "0.72rem", color: "var(--cyan)", fontWeight: 600 }}>
          <span>✓ Type Verified</span>
          <span>✓ Size Inspected</span>
          <span>✓ Stored Securely</span>
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
                  Skill certifications, educational diplomas, ICAR-CCRI training certificates
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
                      {cert.org} {cert.year && `• ${cert.year}`} {cert.fileName && `• 📎 ${cert.fileName}`} {cert.fileSize && `(${cert.fileSize})`}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {renderStatusBadge(cert.status, "certificates", cert.id, cert.serverDocId)}
                  {cert.serverDocId && (
                    <a
                      href={getDocumentDownloadUrl(cert.serverDocId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="icon-btn-secondary mini"
                      title="Download uploaded file"
                      style={{ display: "grid", placeItems: "center", color: "var(--cyan)", padding: "4px 6px" }}
                    >
                      <Download size={14} />
                    </a>
                  )}
                  <button
                    type="button"
                    className="icon-btn-danger mini"
                    onClick={() => handleRemoveDoc("certificates", cert.id, cert.serverDocId)}
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
                    placeholder="e.g. Citrus Nursery Propagation"
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
                    placeholder="e.g. ICAR-CCRI / KVK Nagpur"
                    value={certForm.org}
                    onChange={(e) => setCertForm({ ...certForm, org: e.target.value })}
                  />
                </div>
                <div>
                  <label className="field-sublabel">Year</label>
                  <input
                    type="text"
                    className="glass-input-field mini"
                    placeholder="e.g. 2024"
                    value={certForm.year}
                    onChange={(e) => setCertForm({ ...certForm, year: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <label className="upload-glass-btn" style={{ cursor: "pointer" }}>
                  <Upload size={14} />
                  <span>{certForm.selectedFile ? `📎 ${certForm.selectedFile.name} (${(certForm.selectedFile.size / 1024).toFixed(1)} KB)` : "📎 Choose File (PDF/JPG/PNG - Max 5MB)"}</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: "none" }}
                    onChange={(e) => setCertForm({ ...certForm, selectedFile: e.target.files[0] })}
                  />
                </label>
                <button
                  type="button"
                  className="btn-primary-gloss"
                  style={{ padding: "8px 20px", fontSize: "0.85rem" }}
                  onClick={handleAddCertificate}
                  disabled={uploadLoading}
                >
                  {uploadLoading ? "Uploading..." : "Save & Upload Certificate"}
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
                      {exp.role} • {exp.duration} {exp.fileName && `• 📎 ${exp.fileName}`} {exp.fileSize && `(${exp.fileSize})`}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {renderStatusBadge(exp.status, "experience", exp.id, exp.serverDocId)}
                  {exp.serverDocId && (
                    <a
                      href={getDocumentDownloadUrl(exp.serverDocId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="icon-btn-secondary mini"
                      title="Download uploaded file"
                      style={{ display: "grid", placeItems: "center", color: "var(--cyan)", padding: "4px 6px" }}
                    >
                      <Download size={14} />
                    </a>
                  )}
                  <button
                    type="button"
                    className="icon-btn-danger mini"
                    onClick={() => handleRemoveDoc("experience", exp.id, exp.serverDocId)}
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
                    placeholder="e.g. Nagpur Citrus Growers FPO"
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
                    placeholder="e.g. Packhouse Quality Supervisor"
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
                <label className="upload-glass-btn" style={{ cursor: "pointer" }}>
                  <Upload size={14} />
                  <span>{expForm.selectedFile ? `📎 ${expForm.selectedFile.name} (${(expForm.selectedFile.size / 1024).toFixed(1)} KB)` : "📎 Upload Experience Letter (PDF/JPG)"}</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: "none" }}
                    onChange={(e) => setExpForm({ ...expForm, selectedFile: e.target.files[0] })}
                  />
                </label>
                <button
                  type="button"
                  className="btn-primary-gloss"
                  style={{ padding: "8px 20px", fontSize: "0.85rem" }}
                  onClick={handleAddExperience}
                  disabled={uploadLoading}
                >
                  {uploadLoading ? "Uploading..." : "Save Experience"}
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
                      {lic.regNo ? `Reg: ${lic.regNo}` : lic.authority} {lic.fileName && `• 📎 ${lic.fileName}`} {lic.fileSize && `(${lic.fileSize})`}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {renderStatusBadge(lic.status, "licenses", lic.id, lic.serverDocId)}
                  {lic.serverDocId && (
                    <a
                      href={getDocumentDownloadUrl(lic.serverDocId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="icon-btn-secondary mini"
                      title="Download uploaded file"
                      style={{ display: "grid", placeItems: "center", color: "var(--cyan)", padding: "4px 6px" }}
                    >
                      <Download size={14} />
                    </a>
                  )}
                  <button
                    type="button"
                    className="icon-btn-danger mini"
                    onClick={() => handleRemoveDoc("licenses", lic.id, lic.serverDocId)}
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
                  <label className="field-sublabel">Registration Number (Optional)</label>
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
                <label className="upload-glass-btn" style={{ cursor: "pointer" }}>
                  <Upload size={14} />
                  <span>{licForm.selectedFile ? `📎 ${licForm.selectedFile.name} (${(licForm.selectedFile.size / 1024).toFixed(1)} KB)` : "📎 Upload Certificate Copy (PDF/JPG)"}</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: "none" }}
                    onChange={(e) => setLicForm({ ...licForm, selectedFile: e.target.files[0] })}
                  />
                </label>
                <button
                  type="button"
                  className="btn-primary-gloss"
                  style={{ padding: "8px 20px", fontSize: "0.85rem" }}
                  onClick={handleAddLicense}
                  disabled={uploadLoading}
                >
                  {uploadLoading ? "Uploading..." : "Save License"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ====================================================================
            CATEGORY 4: 📎 OTHER SUPPORTING DOCUMENTS (7/12 LAND & ASSETS)
           ==================================================================== */}
        <div className="doc-category-box">
          <div className="doc-category-header">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Paperclip size={20} color="var(--electric-blue)" />
              <div>
                <strong style={{ fontSize: "1.05rem", color: "var(--text-heading)" }}>
                  📎 OTHER SUPPORTING DOCUMENTS (7/12 LAND & ASSETS)
                </strong>
                <span style={{ fontSize: "0.78rem", color: "var(--muted)", display: "block" }}>
                  Land 7/12 extract, registered lease deed, machinery quotations, water test reports
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
                      {doc.desc} {doc.fileName && `• 📎 ${doc.fileName}`} {doc.fileSize && `(${doc.fileSize})`}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {renderStatusBadge(doc.status, "otherDocs", doc.id, doc.serverDocId)}
                  {doc.serverDocId && (
                    <a
                      href={getDocumentDownloadUrl(doc.serverDocId)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="icon-btn-secondary mini"
                      title="Download uploaded file"
                      style={{ display: "grid", placeItems: "center", color: "var(--cyan)", padding: "4px 6px" }}
                    >
                      <Download size={14} />
                    </a>
                  )}
                  <button
                    type="button"
                    className="icon-btn-danger mini"
                    onClick={() => handleRemoveDoc("otherDocs", doc.id, doc.serverDocId)}
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
                    placeholder="e.g. 7/12 Land Record / Machinery Quote"
                    value={othForm.title}
                    onChange={(e) => setOthForm({ ...othForm, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="field-sublabel">Description / Context</label>
                  <input
                    type="text"
                    className="glass-input-field mini"
                    placeholder="e.g. 2 Acres orchard land in Katol"
                    value={othForm.desc}
                    onChange={(e) => setOthForm({ ...othForm, desc: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
                <label className="upload-glass-btn" style={{ cursor: "pointer" }}>
                  <Upload size={14} />
                  <span>{othForm.selectedFile ? `📎 ${othForm.selectedFile.name} (${(othForm.selectedFile.size / 1024).toFixed(1)} KB)` : "📎 Upload File (PDF/JPG/PNG)"}</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: "none" }}
                    onChange={(e) => setOthForm({ ...othForm, selectedFile: e.target.files[0] })}
                  />
                </label>
                <button
                  type="button"
                  className="btn-primary-gloss"
                  style={{ padding: "8px 20px", fontSize: "0.85rem" }}
                  onClick={handleAddOtherDoc}
                  disabled={uploadLoading}
                >
                  {uploadLoading ? "Uploading..." : "Save Document"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ====================================================================
            DOCUMENT STATUS WORKFLOW LEGEND (STEP 5)
           ==================================================================== */}
        <div style={{
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid var(--line)",
          borderRadius: 14,
          padding: "16px 18px",
          marginTop: 18,
          marginBottom: 18
        }}>
          <strong style={{ fontSize: "0.82rem", color: "var(--text-heading)", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
            📋 Document Verification Workflow (4 Lifecycle Stages)
          </strong>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10, fontSize: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="doc-status-pill uploaded"><Upload size={11} /> Uploaded</span>
              <span style={{ color: "var(--muted)" }}>Queued & secured in system</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="doc-status-pill pending"><Clock size={11} /> Pending review</span>
              <span style={{ color: "var(--muted)" }}>Officer appraisal underway</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="doc-status-pill verified"><CheckCircle2 size={11} /> Verified by reviewer</span>
              <span style={{ color: "var(--muted)" }}>Validated for subsidy / loan</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="doc-status-pill rejected"><AlertCircle size={11} /> Rejected</span>
              <span style={{ color: "var(--muted)" }}>Illegible or re-upload required</span>
            </div>
          </div>
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
