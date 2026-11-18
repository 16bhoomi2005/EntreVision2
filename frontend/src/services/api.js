const API_BASE_URL = "http://localhost:8000";

export async function fetchSkills() {
  const res = await fetch(`${API_BASE_URL}/api/skills`);
  if (!res.ok) throw new Error("Failed to load skills");
  return res.json();
}

export async function fetchResources() {
  const res = await fetch(`${API_BASE_URL}/api/resources`);
  if (!res.ok) throw new Error("Failed to load resources");
  return res.json();
}

export async function fetchLocations() {
  const res = await fetch(`${API_BASE_URL}/api/locations`);
  if (!res.ok) throw new Error("Failed to load locations");
  return res.json();
}

export async function fetchIndustries() {
  const res = await fetch(`${API_BASE_URL}/industries`);
  if (!res.ok) throw new Error("Failed to load industries");
  return res.json();
}

export async function fetchIndustryOpportunities(industryId = 1) {
  const res = await fetch(`${API_BASE_URL}/industries/${industryId}/opportunities`);
  if (!res.ok) throw new Error("Failed to load opportunities");
  return res.json();
}

export async function getRecommendations(payload) {
  const res = await fetch(`${API_BASE_URL}/api/recommendations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to generate recommendations");
  return res.json();
}

export async function fetchFinancialPlan(payload) {
  const res = await fetch(`${API_BASE_URL}/api/financial-plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to generate financial plan");
  return res.json();
}

export async function fetchMarketIntelligence(location = "Katol") {
  const res = await fetch(`${API_BASE_URL}/api/market-intelligence?location=${encodeURIComponent(location)}`);
  if (!res.ok) throw new Error("Failed to load market intelligence");
  return res.json();
}

export async function fetchMlMetrics() {
  const res = await fetch(`${API_BASE_URL}/api/ml/metrics`);
  if (!res.ok) throw new Error("Failed to load ML model metrics");
  return res.json();
}

export async function predictMlFeasibility(payload) {
  const res = await fetch(`${API_BASE_URL}/api/ml/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to execute ML inference");
  return res.json();
}

export async function fetchPriceForecast() {
  const res = await fetch(`${API_BASE_URL}/api/forecast`);
  if (!res.ok) throw new Error("Failed to load price forecast");
  return res.json();
}

export async function fetchGovernmentSchemes() {
  const res = await fetch(`${API_BASE_URL}/api/schemes`);
  if (!res.ok) throw new Error("Failed to load government schemes");
  return res.json();
}

export async function fetchSchemeDetail(schemeCode) {
  const res = await fetch(`${API_BASE_URL}/api/schemes/${encodeURIComponent(schemeCode)}`);
  if (!res.ok) throw new Error(`Failed to load scheme details for ${schemeCode}`);
  return res.json();
}

export async function checkSchemeEligibility(payload) {
  const res = await fetch(`${API_BASE_URL}/api/schemes/check-eligibility`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to evaluate scheme eligibility");
  return res.json();
}

function getAuthHeaders() {
  const token = localStorage.getItem("ev_auth_token");
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiLogin(credentials) {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Invalid login credentials");
  }
  return res.json();
}

export async function apiRegister(userData) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Registration failed");
  }
  return res.json();
}

export async function apiGetMe() {
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to verify authenticated session");
  return res.json();
}

export async function fetchDemoUsers() {
  const res = await fetch(`${API_BASE_URL}/api/auth/demo-users`);
  if (!res.ok) throw new Error("Failed to load demo accounts");
  return res.json();
}

export async function fetchUserProfile(userId) {
  const res = await fetch(`${API_BASE_URL}/api/user/profile?user_id=${encodeURIComponent(userId)}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load user profile");
  return res.json();
}

export async function saveUserProfile(payload) {
  const res = await fetch(`${API_BASE_URL}/api/user/profile`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to save user profile");
  return res.json();
}

export async function saveActiveVenture(payload) {
  const res = await fetch(`${API_BASE_URL}/api/user/active-venture`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update active venture");
  return res.json();
}

export async function fetchCollaborationNetwork(userId = "") {
  const url = userId
    ? `${API_BASE_URL}/api/collaboration/network?user_id=${encodeURIComponent(userId)}`
    : `${API_BASE_URL}/api/collaboration/network`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error("Failed to load collaboration network");
  return res.json();
}

export async function sendCollaborationConnect(payload) {
  const res = await fetch(`${API_BASE_URL}/api/collaboration/connect`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to send collaboration request");
  return res.json();
}

export async function fetchCollaborationRequests(userId) {
  const res = await fetch(`${API_BASE_URL}/api/collaboration/my-requests?user_id=${encodeURIComponent(userId)}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to load collaboration requests");
  return res.json();
}

// ============================================================================
// PHASE 10: DOCUMENT UPLOAD & VERIFICATION WORKFLOW API
// ============================================================================

export async function uploadDocument(file, { userId, category = "other", title = "" } = {}) {
  const formData = new FormData();
  formData.append("file", file);
  if (userId) formData.append("user_id", userId);
  if (category) formData.append("category", category);
  if (title) formData.append("title", title);

  const res = await fetch(`${API_BASE_URL}/api/documents/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Upload failed with status ${res.status}`);
  }
  return res.json();
}

export async function fetchUserDocuments(userId = "", category = "") {
  const params = new URLSearchParams();
  if (userId) params.append("user_id", userId);
  if (category) params.append("category", category);
  const queryStr = params.toString() ? `?${params.toString()}` : "";

  const res = await fetch(`${API_BASE_URL}/api/documents${queryStr}`);
  if (!res.ok) throw new Error("Failed to load user documents");
  return res.json();
}

export async function updateDocumentStatus(documentId, verificationStatus, { reviewerNotes, rejectionReason } = {}) {
  const res = await fetch(`${API_BASE_URL}/api/documents/${documentId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      verification_status: verificationStatus,
      reviewer_notes: reviewerNotes,
      rejection_reason: rejectionReason,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to update document status");
  }
  return res.json();
}

export async function deleteDocument(documentId) {
  const res = await fetch(`${API_BASE_URL}/api/documents/${documentId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete document");
  return res.json();
}

export function getDocumentDownloadUrl(documentId) {
  return `${API_BASE_URL}/api/documents/${documentId}/download`;
}




