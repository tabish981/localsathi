require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const result = await genAI.getGenerativeModel({ model: "gemini-pro" }).generateContent("ping");
    console.log("Gemini Pro is available");
  } catch (e) {
    console.log("Gemini Pro check failed:", e.message);
  }

  try {
    const result = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).generateContent("ping");
    console.log("Gemini 1.5 Flash is available");
  } catch (e) {
    console.log("Gemini 1.5 Flash check failed:", e.message);
  }
}

listModels();
