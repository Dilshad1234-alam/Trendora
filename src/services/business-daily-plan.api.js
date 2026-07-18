const parseResponse = async (response) => {
  const responseText = await response.text();

  let data = {};

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Business daily-plan API returned invalid response. Status: ${response.status}`
      );
    }
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        "Business daily-plan request failed."
    );
  }

  return data;
};

export const getBusinessDailyPlan = async () => {
  const response = await fetch(
    "/api/business/daily-plan",
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    }
  );

  return parseResponse(response);
};

export const toggleBusinessPlanStep = async (
  stepId
) => {
  const response = await fetch(
    "/api/business/daily-plan",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        action: "toggle-step",
        stepId,
      }),
    }
  );

  return parseResponse(response);
};

export const updateBusinessPlanStatus = async (
  completed
) => {
  const response = await fetch(
    "/api/business/daily-plan",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        action: "complete",
        completed,
      }),
    }
  );

  return parseResponse(response);
};

export const regenerateBusinessDailyPlan = async () => {
    const response = await fetch(
      "/api/business/daily-plan",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          action: "regenerate",
        }),
      }
    );

    return parseResponse(response);
  };