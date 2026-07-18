const parseResponse = async (response) => {
  const responseText = await response.text();

  let data = {};

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Business profile API returned invalid response. Status: ${response.status}`
      );
    }
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        "Business profile request failed."
    );
  }

  return data;
};

export const getBusinessProfile = async () => {
  const response = await fetch("/api/business/profile", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseResponse(response);
};