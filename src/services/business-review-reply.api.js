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
    throw new Error(
      data.message ||
      data.error ||
      "Unable to generate review reply."
    );
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