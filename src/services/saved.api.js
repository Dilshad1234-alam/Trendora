const parseResponse = async (
  response
) => {
  const text = await response.text();

  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        `Saved-content API returned an invalid response. Status: ${response.status}`
      );
    }
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        "Saved-content request failed."
    );
  }

  return data;
};

export const getSavedContents =
  async ({
    type = "all",
    search = "",
  } = {}) => {
    const params =
      new URLSearchParams();

    if (type) {
      params.set("type", type);
    }

    if (search.trim()) {
      params.set(
        "search",
        search.trim()
      );
    }

    const response = await fetch(
      `/api/saved?${params.toString()}`,
      {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      }
    );

    return parseResponse(response);
  };

export const saveContent = async (payload) => {
  const response = await fetch("/api/saved",
    {
      method: "POST",
      credentials: "include",
      headers: {"Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

  if (!response.ok) {
    console.log("Save API error:", data);
    throw new Error(
      data.message ||
        data.error ||
        "Unable to save content."
    );
  }

  return data;

  // return parseResponse(response);
};

export const deleteSavedContent =
  async (savedContentId) => {
    const response = await fetch(
      `/api/saved/${savedContentId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    return parseResponse(response);
  };