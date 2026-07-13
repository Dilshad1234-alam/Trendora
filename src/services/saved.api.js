export const saveContent = async (payload) => {
  const response = await fetch("/api/saved", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to save content.");
  }

  return data;
};

export const getSavedContents = async ({
  type = "all",
  search = "",
} = {}) => {
  const params = new URLSearchParams();

  if (type) {
    params.set("type", type);
  }

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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to fetch saved content.");
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