// Pro Hook Creator

export const generateHooks = async (formData) => {
  const response = await fetch("/api/ai/creator-pro/hook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Hook generation failed.");
    error.dailyLimit = data.dailyLimit;
    error.remainingFreeGenerations = data.remainingFreeGenerations;
    error.upgradeRequired = data.upgradeRequired;
    error.data = data;
    throw error;
  }

  return data;
};

// Pro Scripts Creator

export const generateScript = async (formData) => {
  const response = await fetch("/api/ai/creator-pro/script", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Script generation failed.");
    error.dailyLimit = data.dailyLimit;
    error.remainingFreeGenerations = data.remainingFreeGenerations;
    error.upgradeRequired = data.upgradeRequired;
    error.data = data;
    throw error;
  }

  return data;
};

// Pro Caption Creator

export const generateCaption = async (formData) => {
  const response = await fetch("/api/ai/creator-pro/caption", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.message || "Caption generation failed.");
    error.dailyLimit = data.dailyLimit;
    error.remainingFreeGenerations = data.remainingFreeGenerations;
    error.upgradeRequired = data.upgradeRequired;
    error.data = data;
    throw error;
  }

  return data;
};

// Pro Hashtag Creator

export const generateHashtags = async (formData) => {
  const response = await fetch("/api/ai/creator-pro/hashtag", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data.error || data.message || "Hashtag generation failed."
    );
    error.dailyLimit = data.dailyLimit;
    error.remainingFreeGenerations = data.remainingFreeGenerations;
    error.upgradeRequired = data.upgradeRequired;
    error.data = data;
    throw error;
  }

  return data;
};

// Pro Thumbnail Title Creator

export const generateThumbnailTitles = async (formData) => {
  const response = await fetch("/api/ai/creator-pro/thumbnail-title", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data.error || data.message || "Thumbnail-title generation failed."
    );
    error.dailyLimit = data.dailyLimit;
    error.remainingFreeGenerations = data.remainingFreeGenerations;
    error.upgradeRequired = data.upgradeRequired;
    error.data = data;
    throw error;
  }

  return data;
};

// Pro Video Description Creator

export const generateVideoDescription = async (formData) => {
  const response = await fetch("/api/ai/creator-pro/video-description", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data.error || data.message || "Video description generation failed."
    );
    error.dailyLimit = data.dailyLimit;
    error.remainingFreeGenerations = data.remainingFreeGenerations;
    error.upgradeRequired = data.upgradeRequired;
    error.data = data;
    throw error;
  }

  return data;
};

// Pro Dashboard
export const getProDashboard = async () => {
  const response = await fetch("/api/creator-pro/dashboard", {
    method: "GET",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(data.error || data.message || "Failed to fetch pro dashboard.");
    throw error;
  }

  return data;
};

// Pro Daily Plan

const parseProResponse = async (response) => {
  const text = await response.text();
  let data = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Invalid pro daily-plan API response. Status: ${response.status}`);
    }
  }

  if (!response.ok) {
    throw new Error(data.message || data.error || "Pro Daily-plan request failed.");
  }
  return data;
};

export const getProDailyPlan = async () => {
  const response = await fetch("/api/creator-pro/daily-plan", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  return parseProResponse(response);
};

export const toggleProDailyPlanStep = async (stepId) => {
  const response = await fetch("/api/creator-pro/daily-plan", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ action: "toggle-step", stepId }),
  });
  return parseProResponse(response);
};

export const updateProDailyPlan = async (formData) => {
  const response = await fetch("/api/creator-pro/daily-plan", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ action: "edit", ...formData }),
  });
  return parseProResponse(response);
};

export const updateProDailyPlanStatus = async (completed) => {
  const response = await fetch("/api/creator-pro/daily-plan", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ action: "complete", completed }),
  });
  return parseProResponse(response);
};

export const regenerateProDailyPlan = async () => {
  const response = await fetch("/api/creator-pro/daily-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ action: "regenerate" }),
  });
  return parseProResponse(response);
};
