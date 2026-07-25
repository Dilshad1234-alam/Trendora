export const getAgencyDashboard = async () => {
  const response = await fetch("/api/agency/dashboard", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || data.error || "Dashboard error.");
  return data;
};

export const getAgencyDailyPlan = async () => {
  const response = await fetch("/api/agency/daily-plan", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || data.error || "Plan error.");
  return data;
};

export const toggleAgencyPlanStep = async (stepId) => {
  const response = await fetch("/api/agency/daily-plan", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ action: "toggle-step", stepId }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || data.error || "Toggle error.");
  return data;
};

export const updateAgencyPlanStatus = async (completed) => {
  const response = await fetch("/api/agency/daily-plan", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ action: "complete", completed }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || data.error || "Status error.");
  return data;
};

export const regenerateAgencyDailyPlan = async () => {
  const response = await fetch("/api/agency/daily-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ action: "regenerate" }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || data.error || "Regenerate error.");
  return data;
};
