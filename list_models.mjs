import fs from 'fs';
import path from 'path';

async function run() {
  try {
    let apiKey = '';
    const envPath = path.join(process.cwd(), '.env');
    const envLocalPath = path.join(process.cwd(), '.env.local');
    
    if (fs.existsSync(envLocalPath)) {
      const content = fs.readFileSync(envLocalPath, 'utf8');
      const match = content.match(/GEMINI_API_KEY=(.*)/);
      if (match) apiKey = match[1].trim();
    }
    if (!apiKey && fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/GEMINI_API_KEY=(.*)/);
      if (match) apiKey = match[1].trim();
    }
    
    if (!apiKey) {
      console.error("API Key not found!");
      return;
    }
    
    // Some keys might have quotes around them
    apiKey = apiKey.replace(/^["']|["']$/g, '');

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    console.log(JSON.stringify(data.models.map(m => m.name), null, 2));
  } catch (error) {
    console.error("Error fetching models:", error);
  }
}
run();
