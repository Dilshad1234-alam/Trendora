import gemini from "@/lib/gemini";
import SavedContent from "@/models/SavedContent";
import GeneratedContent from "@/models/GeneratedContent";
import AgencyUsage from "@/models/AgencyUsage";

const CREATOR_TYPES = [
  "hook", "script", "caption", "hashtag", "thumbnail-title",
  "video-description", "creator-caption", "creator-hashtag", "reel-idea", "creator-planner"
];

const BUSINESS_TYPES = [
  "business-post", "business-caption", "business-hashtag",
  "ad-copy", "product-description", "local-seo",
  "review-reply", "whatsapp-reply", "business-planner"
];

async function updateUsage(agencyId, clientId, contentType, success, inputTokens = 0, outputTokens = 0) {
  try {
    const now = new Date();
    const dateKey = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const monthKey = dateKey.substring(0, 7); // YYYY-MM

    const incQuery = {
      generations: 1,
      [`contentTypeBreakdown.${contentType}`]: 1,
      [`clientBreakdown.${clientId}`]: 1,
      inputTokens,
      outputTokens
    };

    if (success) incQuery.successfulGenerations = 1;
    else incQuery.failedGenerations = 1;

    await AgencyUsage.findOneAndUpdate(
      { agencyId, dateKey, monthKey },
      { 
        $inc: incQuery,
        $set: { lastRequestAt: now }
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );
  } catch (err) {
    console.error("Usage Tracking Error:", err);
  }
}

export async function generateAgencyClientContent({ agencyUser, client, contentType, formData, idempotencyKey = null }) {
  try {
    // 1. Validation
    if (!agencyUser || !client || !contentType) {
      return { success: false, status: 400, error: "Missing required fields for generation." };
    }

    if (client.agencyId.toString() !== agencyUser._id.toString()) {
      return { success: false, status: 403, error: "Unauthorized access to client." };
    }

    const clientType = client.clientType === "creator" ? "creator" : "business";

    // Validate content type against client type
    if (clientType === "creator" && !CREATOR_TYPES.includes(contentType)) {
      return { success: false, status: 400, error: `Invalid content type for Creator client. Allowed: ${CREATOR_TYPES.join(", ")}` };
    }

    if (clientType === "business" && !BUSINESS_TYPES.includes(contentType)) {
      return { success: false, status: 400, error: `Invalid content type for Business client. Allowed: ${BUSINESS_TYPES.join(", ")}` };
    }

    // 2. Cooldown & Idempotency Check
    if (idempotencyKey) {
      const existing = await SavedContent.findOne({ "metadata.idempotencyKey": idempotencyKey, agencyId: agencyUser._id });
      if (existing) {
        return {
          success: true,
          status: 200,
          data: {
            id: existing._id.toString(),
            generatedContentId: null,
            type: existing.type,
            title: existing.title,
            output: existing.content,
            createdAt: existing.createdAt,
            cached: true
          },
        };
      }
    } else {
      // Basic cooldown for non-idempotent (UI) requests to prevent accidental double clicks (3 seconds)
      const now = new Date();
      const dateKey = now.toISOString().split("T")[0];
      const monthKey = dateKey.substring(0, 7);
      
      const usage = await AgencyUsage.findOne({ agencyId: agencyUser._id, dateKey, monthKey });
      if (usage && usage.lastRequestAt) {
        const timeDiff = now.getTime() - new Date(usage.lastRequestAt).getTime();
        if (timeDiff < 3000) {
          return { success: false, status: 429, error: "Please wait a moment before generating again." };
        }
      }
    }

    // 3. Build Context Prompt
    const clientName = client.creatorName || client.businessName || client.name || "the client";
    let contextPrompt = `Client Name: ${clientName}\nClient Type: ${clientType}\n`;
    if (client.niche || client.industry) contextPrompt += `Industry/Niche: ${client.niche || client.industry}\n`;
    if (client.brandVoice) contextPrompt += `Brand Voice: ${client.brandVoice}\n`;
    if (client.targetAudience) contextPrompt += `Target Audience: ${client.targetAudience}\n`;
    if (client.tone) contextPrompt += `Tone: ${client.tone}\n`;
    if (client.preferredLanguage) contextPrompt += `Language: ${client.preferredLanguage}\n`;
    if (client.platforms && client.platforms.length > 0) contextPrompt += `Platforms: ${client.platforms.join(", ")}\n`;
    if (client.products && client.products.length > 0) contextPrompt += `Products: ${client.products.join(", ")}\n`;
    if (client.services && client.services.length > 0) contextPrompt += `Services: ${client.services.join(", ")}\n`;
    if (client.requiredPhrases && client.requiredPhrases.length > 0) contextPrompt += `Required Phrases: ${client.requiredPhrases.join(", ")}\n`;
    if (client.bannedWords && client.bannedWords.length > 0) contextPrompt += `Banned Words: ${client.bannedWords.join(", ")}\n`;
    if (client.customRules) contextPrompt += `Custom Rules: ${client.customRules}\n`;

    // 4. Routing & Specific Prompts
    let taskPrompt = "";
    const topic = formData.topic || formData.productName || "General content";
    const platform = formData.platform || "Social Media";
    const title = topic.substring(0, 100);

    switch (contentType) {
      case "hook":
        taskPrompt = `Generate 5 highly engaging short-form video hooks about: "${topic}".\nMake them: 1. Curiosity, 2. Emotional, 3. Relatable, 4. Authority, 5. Contrarian. Keep them short, punchy, and ready to film.`;
        break;
      case "script":
        taskPrompt = `Write a compelling 60-second video script about: "${topic}".\nStructure it with a Hook, Body (3 main points), and Call to Action.`;
        break;
      case "caption":
      case "creator-caption":
      case "business-caption":
        taskPrompt = `Write an engaging caption for a social media post about: "${topic}" for platform: ${platform}.\nInclude formatting and emojis.`;
        break;
      case "hashtag":
      case "creator-hashtag":
      case "business-hashtag":
        taskPrompt = `Generate a list of 20 highly relevant, trending hashtags for: "${topic}".\nOrganize them by Broad, Niche, and Specific.`;
        break;
      case "reel-idea":
        taskPrompt = `Brainstorm 3 viral Reel/TikTok video ideas about: "${topic}".\nFor each, provide: Title, Visual Hook, Audio Suggestion, and Brief Description.`;
        break;
      case "thumbnail-title":
      case "business-thumbnail-title":
        taskPrompt = `Generate 5 click-worthy YouTube thumbnail titles for a video about: "${topic}".\nKeep them under 50 characters, high curiosity, and impossible to ignore.`;
        break;
      case "video-description":
      case "business-video-description":
        taskPrompt = `Write a search-optimized YouTube video description for a video about: "${topic}".\nInclude an intro, timestamp placeholders, and call to action.`;
        break;
      case "business-post":
        taskPrompt = `Write a professional business post about: "${topic}" for ${platform}.\nFocus on value proposition and engagement.`;
        break;
      case "ad-copy":
        const objective = formData.objective || "Generate Leads";
        const cta = formData.cta || "Learn More";
        taskPrompt = `Write a high-converting advertisement copy for ${platform} about: "${topic}".\nObjective: ${objective}.\nCall to Action: ${cta}.\nProvide Headline, Primary Text, and Description.`;
        break;
      case "product-description":
        taskPrompt = `Write a persuasive product description for: "${topic}".\nHighlight benefits, features, and why the customer needs it now.`;
        break;
      case "local-seo":
        taskPrompt = `Write a Local SEO optimized Google Business Profile update about: "${topic}".\nKeep it under 300 words and include a call to action.`;
        break;
      case "review-reply":
        const reviewText = formData.reviewText || "";
        const rating = formData.rating || "5";
        taskPrompt = `Write a professional reply to a ${rating}-star customer review.\nCustomer Review: "${reviewText}".\nBe polite, appreciative, and address any concerns if the rating is low.`;
        break;
      case "whatsapp-reply":
        const message = formData.message || "";
        taskPrompt = `Write a polite and professional WhatsApp business reply to a customer message.\nCustomer Message: "${message}".\nKeep it conversational but professional.`;
        break;
      default:
        taskPrompt = `Generate high-quality content about: "${topic}".`;
        break;
    }

    const fullPrompt = `You are an elite agency copywriter and AI strategist.\n\nClient Context:\n${contextPrompt}\n\nTask:\n${taskPrompt}\n\nEnsure the output perfectly matches the client's Brand Voice, Tone, and Rules. Do NOT include markdown code blocks (like \`\`\`json) or meta-commentary. Output the final content directly.`;

    // 5. Execution (With Retry & Timeout)
    let output = null;
    let inputTokens = 0;
    let outputTokens = 0;
    let attempt = 0;
    const MAX_RETRIES = 2;
    let successGeneration = false;
    let aiErrorToReport = null;

    while (attempt <= MAX_RETRIES && !successGeneration) {
      attempt++;
      try {
        const generationPromise = gemini.models.generateContent({
          model: "gemini-1.5-flash",
          contents: fullPrompt,
        });

        // 15 seconds timeout
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), 15000));
        
        const interaction = await Promise.race([generationPromise, timeoutPromise]);
        
        output = interaction?.text?.trim();

        if (!output) throw new Error("AI returned empty response");

        // Try to parse tokens if available, else approximate
        try {
          if (interaction.usageMetadata) {
            inputTokens = interaction.usageMetadata.promptTokenCount || 0;
            outputTokens = interaction.usageMetadata.candidatesTokenCount || 0;
          } else {
            inputTokens = Math.ceil(fullPrompt.length / 4);
            outputTokens = Math.ceil(output.length / 4);
          }
        } catch (e) {
          inputTokens = Math.ceil(fullPrompt.length / 4);
          outputTokens = Math.ceil(output.length / 4);
        }

        successGeneration = true;
      } catch (aiError) {
        console.error(`Gemini Generation Error (Attempt ${attempt}):`, aiError.message || aiError);
        aiErrorToReport = aiError;

        // If it's a 429, don't retry, just break out immediately
        if (aiError.status === 429 || aiError.message?.includes("429")) {
          break;
        }
        
        // If it's a timeout or 503, maybe retry
        if (attempt <= MAX_RETRIES) {
          // Exponential backoff
          await new Promise(r => setTimeout(r, 2000 * Math.pow(2, attempt - 1)));
        }
      }
    }

    if (!successGeneration) {
      await updateUsage(agencyUser._id, client._id, contentType, false);
      
      if (aiErrorToReport && (aiErrorToReport.status === 429 || aiErrorToReport.message?.includes("429"))) {
        return { success: false, status: 429, error: "AI rate limit exceeded. Please try again later." };
      }
      return { success: false, status: 503, error: "AI generation failed or timed out." };
    }

    // Success, update usage
    await updateUsage(agencyUser._id, client._id, contentType, true, inputTokens, outputTokens);

    // 6. Persistence
    const savedMetadata = { formData };
    if (idempotencyKey) {
      savedMetadata.idempotencyKey = idempotencyKey;
    }

    const savedItem = await SavedContent.create({
      user: agencyUser._id,
      ownerType: "agency",
      agencyId: agencyUser._id,
      clientId: client._id,
      clientType,
      generatedBy: agencyUser._id,
      type: contentType,
      title: title,
      content: output,
      contentStatus: "draft",
      platform: platform,
      metadata: savedMetadata,
    });

    let generatedItem = null;
    try {
      generatedItem = await GeneratedContent.create({
        user: agencyUser._id,
        agencyId: agencyUser._id,
        clientId: client._id,
        clientType,
        generatedBy: agencyUser._id,
        type: contentType,
        prompt: fullPrompt,
        output: output,
      });
    } catch (gcError) {
      console.warn("Could not save to GeneratedContent (enum mismatch likely):", gcError.message);
    }

    return {
      success: true,
      status: 201,
      data: {
        id: savedItem._id.toString(),
        generatedContentId: generatedItem ? generatedItem._id.toString() : null,
        type: contentType,
        title: title,
        output: output,
        createdAt: savedItem.createdAt,
      },
    };

  } catch (error) {
    console.error("generateAgencyClientContent utility error:", error);
    return { success: false, status: 500, error: "Internal server error during content generation." };
  }
}
