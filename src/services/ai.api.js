//  Hook Creator

export const generateHooks = async (formData) => {
  const response = await fetch("/api/ai/hook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Hook generation failed.");
  }

  return data;
};

//  Scripts Creator

export const generateScript = async (formData) => {
  const response = await fetch("/api/ai/script", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Script generation failed.");
  }

  return data;
};

// Caption Creator

export const generateCaption = async (formData) => {
  const response = await fetch("/api/ai/caption", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Caption generation failed.");
  }

  return data;
};

export const generateHashtags = async (formData) => {
  const response = await fetch("/api/ai/hashtag", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.message ||
        "Hashtag generation failed."
    );
  }

  return data;
};

export const generateThumbnailTitles = async (formData) => {
  const response = await fetch("/api/ai/thumbnail-title", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.message ||
        "Thumbnail-title generation failed."
    );
  }

  return data;
};

export const generateVideoDescription = async (formData) => {
  const response = await fetch("/api/ai/video-description", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.message ||
        "Video description generation failed."
    );
  }

  return data;
};



