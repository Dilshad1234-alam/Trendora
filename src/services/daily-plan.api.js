export const getDailyPlan = async () => {
  const response = await fetch("/api/creator/daily-plan", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.message ||
        "Unable to fetch daily plan."
    );
  }

  return data;
};

export const updateDailyPlanStatus = async (completed) => {
  const response = await fetch("/api/creator/daily-plan", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ completed }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.message ||
        "Unable to update daily plan."
    );
  }

  return data;
};