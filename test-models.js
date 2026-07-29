const { GoogleGenAI } = require('@google/genai');
const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.list();
  const models = Object.values(response).filter(m => m && m.name).map(m => m.name)
    .concat(Array.isArray(response) ? response.map(m => m.name) : [])
    .concat(response.data ? response.data.map(m => m.name) : []);
  console.log(JSON.stringify(response, null, 2));
}
run();
