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
