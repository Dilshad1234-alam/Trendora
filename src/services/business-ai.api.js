export const generateBusinessPost = async (formData) => {
  const response = await fetch("/api/ai/business/post", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error ||
        data.message ||
        "Business post generation failed."
    );
  }

  return data;
};