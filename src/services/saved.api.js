export const saveContent = async (payload) => {
  console.log("Save content payload:", payload);

  const response = await fetch("/api/saved", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();

  let data = {};

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Saved API returned invalid response. Status: ${response.status}`
      );
    }
  }

  if (!response.ok) {
    console.error("Save content response:", data);

    throw new Error(
      data.message ||
        data.error ||
        `Unable to save content. Status: ${response.status}`
    );
  }

  return data;
};

export const getSavedContents = async ({
  type = "all",
  search = "",
} = {}) => {
  const params = new URLSearchParams();

  params.set("type", type);

  if (search.trim()) {
    params.set("search", search.trim());
  }

  const response = await fetch(
    `/api/saved?${params.toString()}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    }
  );

  const responseText = await response.text();

  let data = {};

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Saved content API returned invalid response. Status: ${response.status}`
      );
    }
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        `Unable to fetch saved content. Status: ${response.status}`
    );
  }

  return data;
};

export const deleteSavedContent = async (id) => {
  const response = await fetch(`/api/saved/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to delete saved content.");
  }

  return data;
};