require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    console.log("Available Models:");
    if (data.models) {
      data.models.forEach(m => {
        console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods})`);
      });
    } else {
      console.log("No models found. Response:", JSON.stringify(data));
    }
  } catch (e) {
    console.log("ListModels failed:", e.message);
  }
}

listModels();
