// API service wrappers for Agency Tools

// Clients
export const getAgencyClients = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`/api/agency/clients?${query}`, {
    method: "GET",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || "Failed to fetch clients");
  }
  return response.json();
};

export const getAgencyClient = async (clientId) => {
  const response = await fetch(`/api/agency/clients/${clientId}`, {
    method: "GET",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || "Failed to fetch client");
  }
  return response.json();
};

export const getAgencyClientStats = async (clientId) => {
  const response = await fetch(`/api/agency/clients/${clientId}/stats`, {
    method: "GET",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || "Failed to fetch client stats");
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
    throw new Error(errorData.message || errorData.error || "Failed to add client");
  }
  return response.json();
};

export const updateAgencyClient = async (clientId, clientData) => {
  const response = await fetch(`/api/agency/clients/${clientId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(clientData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || "Failed to update client");
  }
  return response.json();
};

export const archiveAgencyClient = async (clientId) => {
  const response = await fetch(`/api/agency/clients/${clientId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || "Failed to archive client");
  }
  return response.json();
};

export const restoreAgencyClient = async (clientId) => {
  const response = await fetch(`/api/agency/clients/${clientId}/restore`, {
    method: "POST",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || "Failed to restore client");
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
  const response = await fetch("/api/agency/team/invite", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(teamData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to add team member");
  }
  return response.json();
};

export const updateAgencyTeamMember = async (memberId, updateData) => {
  const response = await fetch(`/api/agency/team/${memberId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to update team member");
  }
  return response.json();
};

export const removeAgencyTeamMember = async (memberId) => {
  const response = await fetch(`/api/agency/team/${memberId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to remove team member");
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

// Pipeline
export const getAgencyPipeline = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`/api/agency/pipeline?${query}`, {
    method: "GET",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to fetch pipeline");
  }
  return response.json();
};

export const updateAgencyPipelineStage = async (itemId, newStage, note = "") => {
  const response = await fetch(`/api/agency/pipeline/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStage, note }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to update stage");
  }
  return response.json();
};

// Reports
export const generateAgencyReport = async (reportData) => {
  const response = await fetch("/api/agency/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reportData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to generate report");
  }
  return response.json();
};

export const getAgencyReportPreview = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`/api/agency/reports/preview?${query}`, {
    method: "GET",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to fetch report preview");
  }
  return response.json();
};

// Tasks
export const getAgencyTasks = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`/api/agency/tasks?${query}`, {
    method: "GET",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to fetch tasks");
  }
  return response.json();
};

export const createAgencyTask = async (taskData) => {
  const response = await fetch("/api/agency/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to create task");
  }
  return response.json();
};

export const getAgencyTask = async (taskId) => {
  const response = await fetch(`/api/agency/tasks/${taskId}`, {
    method: "GET",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to fetch task");
  }
  return response.json();
};

export const updateAgencyTask = async (taskId, taskData) => {
  const response = await fetch(`/api/agency/tasks/${taskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(taskData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to update task");
  }
  return response.json();
};

export const deleteAgencyTask = async (taskId) => {
  const response = await fetch(`/api/agency/tasks/${taskId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to delete task");
  }
  return response.json();
};

// Calendar
export const getAgencyCalendar = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`/api/agency/calendar?${query}`, {
    method: "GET",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to fetch calendar");
  }
  return response.json();
};

export const scheduleAgencyContent = async (contentId, scheduledFor) => {
  const response = await fetch("/api/agency/calendar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentId, scheduledFor }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to schedule content");
  }
  return response.json();
};

export const updateAgencyCalendarContent = async (contentId, updateData) => {
  const response = await fetch(`/api/agency/calendar/${contentId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updateData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to update calendar content");
  }
  return response.json();
};

// Notifications
export const getAgencyNotifications = async () => {
  const response = await fetch("/api/agency/notifications", {
    method: "GET",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch notifications");
  }
  return response.json();
};

export const markNotificationRead = async (notificationId) => {
  const response = await fetch(`/api/agency/notifications/${notificationId}/read`, {
    method: "PATCH",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to mark notification read");
  }
  return response.json();
};

export const markAllNotificationsRead = async () => {
  const response = await fetch("/api/agency/notifications/read-all", {
    method: "PATCH",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to mark all notifications read");
  }
  return response.json();
};


