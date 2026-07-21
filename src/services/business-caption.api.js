export async function generateBusinessCaption(
  payload
) {
  const response = await fetch(
    "/api/ai/business/caption",
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    const error = new Error(
      data.message ||
        "Unable to generate caption."
    );

    error.status = response.status;
    error.upgradeRequired =
      Boolean(data.upgradeRequired);
    error.dailyLimit =
      data.dailyLimit;
    error.usedToday =
      data.usedToday;
    error.remainingFreeCaptions =
      data.remainingFreeCaptions;
    error.data = data;

    throw error;
  }

  return data;
}





// const parseResponse = async (response) => {
//   const text = await response.text();

//   let data = {};

//   if (text) {
//     try {
//       data = JSON.parse(text);
//     } catch {
//       throw new Error(
//         `Business caption API returned invalid response. Status: ${response.status}`
//       );
//     }
//   }

//   if (!response.ok) {
//     throw new Error(
//       data.message ||
//         data.error ||
//         "Business caption request failed."
//     );
//   }

//   return data;
// };

// export const generateBusinessCaption = async (
//   payload
// ) => {
//   const response = await fetch(
//     "/api/ai/business/caption",
//     {
//       method: "POST",
//       credentials: "include",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(payload),
//     }
//   );

//   return parseResponse(response);
// };