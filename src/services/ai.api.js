//  Hook Creator

export const generateHooks = async (formData) => {
  const response = await fetch("/api/ai/creator/hook", {
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

//  Scripts Creator

export const generateScript = async (formData) => {
  const response = await fetch("/api/ai/creator/script", {
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

// Caption Creator

export const generateCaption = async (formData) => {
  const response = await fetch("/api/ai/creator/caption", {
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

export const generateHashtags = async (formData) => {
  const response = await fetch("/api/ai/creator/hashtag", {
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

export const generateThumbnailTitles = async (formData) => {
  const response = await fetch("/api/ai/creator/thumbnail-title", {
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

export const generateVideoDescription = async (formData) => {
  const response = await fetch("/api/ai/creator/video-description", {
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
