const parseResponse = async (response) => {
  const text = await response.text();

  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        `Business caption API returned invalid response. Status: ${response.status}`
      );
    }
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        "Business caption request failed."
    );
  }

  return data;
};

export const generateBusinessCaption = async (
  payload
) => {
  const response = await fetch(
    "/api/ai/business/caption",
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
};