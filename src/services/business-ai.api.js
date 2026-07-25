export const generateBusinessPost = async (formData) => {
  const response = await fetch("/api/ai/business/post", {
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
      data.error ||
        data.message ||
        "Business post generation failed."
    );

    error.status = response.status;
    error.upgradeRequired = Boolean(data.upgradeRequired);
    error.dailyLimit = data.limit || data.dailyLimit;
    error.usedToday = data.used || data.usedToday;
    error.remainingFreePosts = data.remaining || data.remainingFreePosts;
    error.data = data;

    throw error;
  }

  return data;
};