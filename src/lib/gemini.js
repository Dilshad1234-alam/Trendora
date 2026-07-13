import { GoogleGenAI } from "@google/genai";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is missing in .env.local");
}

const gemini = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export default gemini;