require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testOne(modelName) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Say 'ready'");
    console.log(`Model ${modelName}: OK`);
  } catch (e) {
    console.log(`Model ${modelName}: FAILED - ${e.message}`);
  }
}

async function runTests() {
  await testOne("gemini-1.5-flash");
  await testOne("gemini-1.5-flash-latest");
  await testOne("gemini-1.5-pro");
  await testOne("gemini-2.0-flash-exp");
  await testOne("gemini-pro");
}

runTests();
