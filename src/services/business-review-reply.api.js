async function parseResponse(response) {
  const text = await response.text();

  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        `Review Reply API returned an invalid response. Status: ${response.status}`
      );
    }
  }

  if (!response.ok) {
    const error = new Error(
      data.message ||
      data.error ||
      "Unable to generate review reply."
    );

    error.status = response.status;
    error.upgradeRequired = Boolean(data.upgradeRequired);
    error.dailyLimit = data.dailyLimit;
    error.usedToday = data.usedToday;
    error.remainingFreeReviewReplies = data.remainingFreeReviewReplies;
    error.data = data;

    throw error;
  }

  return data;
}

export async function generateBusinessReviewReply(payload) {
  const response = await fetch(
    "/api/ai/business/review-reply",
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  return parseResponse(response);
}