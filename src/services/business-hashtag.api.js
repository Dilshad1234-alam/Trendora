async function parseResponse(response) {
  const text = await response.text();

  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        `Hashtag API returned an invalid response. Status: ${response.status}`
      );
    }
  }

  if (!response.ok) {
    const error = new Error(
      data.message ||
        data.error ||
        "Hashtag request failed."
    );

    error.status = response.status;
    error.upgradeRequired = Boolean(
      data.upgradeRequired
    );
    error.dailyLimit = data.dailyLimit;
    error.usedToday = data.usedToday;
    error.remainingFreeHashtags =
      data.remainingFreeHashtags;
    error.data = data;

    throw error;
  }

  return data;
}

export async function generateBusinessHashtags(
  payload
) {
  const response = await fetch(
    "/api/ai/business/hashtag",
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