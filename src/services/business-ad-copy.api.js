async function parseResponse(response) {
  const text = await response.text();

  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        `Ad Copy API returned an invalid response. Status: ${response.status}`
      );
    }
  }

  if (!response.ok) {
    const error = new Error(
      data.message ||
        data.error ||
        "Ad-copy request failed."
    );

    error.status = response.status;

    error.upgradeRequired = Boolean(
      data.upgradeRequired
    );

    error.dailyLimit = data.dailyLimit;
    error.usedToday = data.usedToday;

    error.remainingFreeAdCopies =
      data.remainingFreeAdCopies;

    error.data = data;

    throw error;
  }

  return data;
}

export async function generateBusinessAdCopy(
  payload
) {
  const response = await fetch(
    "/api/ai/business/ad-copy",
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