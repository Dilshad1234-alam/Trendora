//  Creator user

export const completeCreatorOnboarding = async (formData) => {
  const response = await fetch("/api/onboarding/creator", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Creator onboarding failed.");
  }

  return data;
};

//   Business User 

export const completeBusinessOnboarding = async (formData) => {
  const response = await fetch("/api/onboarding/business", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Business onboarding failed.");
  }

  return data;
};