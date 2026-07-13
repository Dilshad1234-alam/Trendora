//  Hook Creator

export const generateHooks = async (formData) => {
  const response = await fetch("/api/ai/hook", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Hook generation failed.");
  }

  return data;
};

//  Scripts Creator

export const generateScript = async (formData) => {
  const response = await fetch("/api/ai/script", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Script generation failed.");
  }

  return data;
};