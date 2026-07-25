const parseProResponse = async (response, errorMsg) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || errorMsg);
  }
  return data;
};

// Dashboard & Daily Plan

export const getBusinessProDashboard = async () => {
  const response = await fetch("/api/business-pro/dashboard", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  return parseProResponse(response, "Failed to fetch business pro dashboard.");
};

export const getBusinessProDailyPlan = async () => {
  const response = await fetch("/api/business-pro/daily-plan", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  return parseProResponse(response, "Failed to load business pro daily plan.");
};

export const toggleBusinessProPlanStep = async (stepId) => {
  const response = await fetch("/api/business-pro/daily-plan", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ action: "toggle-step", stepId }),
  });
  return parseProResponse(response, "Failed to update business step.");
};

export const updateBusinessProPlanStatus = async (completed) => {
  const response = await fetch("/api/business-pro/daily-plan", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ action: "complete", completed }),
  });
  return parseProResponse(response, "Failed to update business plan status.");
};

export const regenerateBusinessProDailyPlan = async () => {
  const response = await fetch("/api/business-pro/daily-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ action: "regenerate" }),
  });
  return parseProResponse(response, "Failed to regenerate business pro daily plan.");
};

// AI Generators

export const generateBusinessProAdCopy = async (formData) => {
  const response = await fetch("/api/ai/business-pro/ad-copy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(formData),
  });
  return parseProResponse(response, "Business Ad Copy generation failed.");
};

export const generateBusinessProCaption = async (formData) => {
  const response = await fetch("/api/ai/business-pro/caption", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(formData),
  });
  return parseProResponse(response, "Business Caption generation failed.");
};

export const generateBusinessProHashtag = async (formData) => {
  const response = await fetch("/api/ai/business-pro/hashtag", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(formData),
  });
  return parseProResponse(response, "Business Hashtag generation failed.");
};

export const generateBusinessProLocalSeo = async (formData) => {
  const response = await fetch("/api/ai/business-pro/local-seo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(formData),
  });
  return parseProResponse(response, "Business Local SEO generation failed.");
};

export const generateBusinessProPost = async (formData) => {
  const response = await fetch("/api/ai/business-pro/post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(formData),
  });
  return parseProResponse(response, "Business Post generation failed.");
};

export const generateBusinessProReviewReply = async (formData) => {
  const response = await fetch("/api/ai/business-pro/review-reply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(formData),
  });
  return parseProResponse(response, "Business Review Reply generation failed.");
};

export const generateBusinessProWhatsappReply = async (formData) => {
  const response = await fetch("/api/ai/business-pro/whatsapp-reply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(formData),
  });
  return parseProResponse(response, "Business WhatsApp Reply generation failed.");
};
