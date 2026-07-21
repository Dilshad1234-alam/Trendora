const parseResponse = async (response) => {
  const responseText = await response.text();

  let data = {};

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Business daily-plan API returned an invalid response. Status: ${response.status}`
      );
    }
  }

  if (!response.ok) {
    const error = new Error(
      data?.message ||
        data?.error ||
        "Business daily-plan request failed."
    );

    error.status = response.status;
    error.upgradeRequired =
      Boolean(data?.upgradeRequired);

    throw error;
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
  if (!stepId) {
    throw new Error(
      "Business action step ID is required."
    );
  }

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
  if (typeof completed !== "boolean") {
    throw new Error(
      "Completed value must be true or false."
    );
  }

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

export const regenerateBusinessDailyPlan =
  async () => {
    const response = await fetch(
      "/api/business/daily-plan",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          action: "regenerate",
        }),
      }
    );

    return parseResponse(response);
  };