// API service wrappers for Agency Tools

// Clients
export const getAgencyClients = async () => {
  const response = await fetch("/api/agency/clients", {
    method: "GET",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch clients");
  }
  return response.json();
};

export const addAgencyClient = async (clientData) => {
  const response = await fetch("/api/agency/clients", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(clientData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to add client");
  }
  return response.json();
};

// Team
export const getAgencyTeam = async () => {
  const response = await fetch("/api/agency/team", {
    method: "GET",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch team members");
  }
  return response.json();
};

export const addAgencyTeamMember = async (teamData) => {
  const response = await fetch("/api/agency/team", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(teamData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to add team member");
  }
  return response.json();
};

// Branding
export const getAgencyBranding = async () => {
  const response = await fetch("/api/agency/branding", {
    method: "GET",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch branding");
  }
  return response.json();
};

export const updateAgencyBranding = async (brandingData) => {
  const response = await fetch("/api/agency/branding", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(brandingData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to update branding");
  }
  return response.json();
};

// Bulk Generator
export const generateBulkContent = async (generateData) => {
  const response = await fetch("/api/agency/bulk-generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(generateData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to generate bulk content");
  }
  return response.json();
};

// Saved Content
export const getAgencySavedContent = async () => {
  const response = await fetch("/api/agency/saved", {
    method: "GET",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch saved content");
  }
  return response.json();
};
