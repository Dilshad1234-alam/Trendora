async function parseResponse(response) {
  const text = await response.text();

  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        `Local SEO API returned an invalid response. Status: ${response.status}`
      );
    }
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        "Local SEO request failed."
    );
  }

  return data;
}

export async function generateBusinessLocalSeo(
  payload = {}
) {
  const response = await fetch(
    "/api/ai/business/local-seo",
    {
      method: "POST",
      credentials: "include",

      headers: {
        "Content-Type":
          "application/json",
      },

      body: JSON.stringify(payload),
    }
  );

  return parseResponse(response);
}