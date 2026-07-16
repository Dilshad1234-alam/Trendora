const parseResponse = async (response) => {
  const text = await response.text();

  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        `Invalid daily-plan API response. Status: ${response.status}`
      );
    }
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        "Daily-plan request failed."
    );
  }

  return data;
};

export const getDailyPlan = async () => {
  const response = await fetch(
    "/api/creator/daily-plan",
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    }
  );

  return parseResponse(response);
};

export const toggleDailyPlanStep = async (
  stepId
) => {
  const response = await fetch(
    "/api/creator/daily-plan",
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

export const updateDailyPlan = async (
  formData
) => {
  const response = await fetch(
    "/api/creator/daily-plan",
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        action: "edit",
        ...formData,
      }),
    }
  );

  return parseResponse(response);
};

export const updateDailyPlanStatus = async (
  completed
) => {
  const response = await fetch(
    "/api/creator/daily-plan",
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

export const regenerateDailyPlan = async () => {
  const response = await fetch(
    "/api/creator/daily-plan",
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