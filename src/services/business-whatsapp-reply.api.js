async function parseResponse(response) {
  const text = await response.text();

  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(
        `WhatsApp Reply API returned invalid response. Status: ${response.status}`
      );
    }
  }

  if (!response.ok) {
    throw new Error(
      data.message ||
        data.error ||
        "WhatsApp reply request failed."
    );
  }

  return data;
}

export async function generateBusinessWhatsappReply(
  payload
) {
  const response = await fetch(
    "/api/ai/business/whatsapp-reply",
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  return parseResponse(response);
}