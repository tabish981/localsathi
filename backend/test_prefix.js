require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testPrefix() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" });
    const result = await model.generateContent("test");
    console.log("models/gemini-1.5-flash: OK");
  } catch (e) {
    console.log("models/gemini-1.5-flash: FAILED:", e.message);
  }
}

testPrefix();
