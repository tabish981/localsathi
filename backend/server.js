require("dotenv").config(); // MUST be at the very top
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require("path");

const app = express();

/* ================= MIDDLEWARE ================= */
// Fixed CORS: This is the most common cause of "Server Error" on Login
app.use(cors()); 
app.use(express.json()); 

app.get("/", (req, res) => {
  res.send("Localsathi Backend is Running Successfully!");
});

/* ================= DATABASE CONNECTION ================= */
mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/localsathi")
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch(err => console.error("MongoDB Connection Error:", err));

/* ================= GEMINI AI SETUP ================= */
// Check for API Key to prevent runtime crashes
if (!process.env.GEMINI_API_KEY) {
  console.error("FATAL ERROR: GEMINI_API_KEY is not defined in .env");
}
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/* ================= LOCALSATHI AI (ENGLISH REBUILT) ================= */
app.post("/api/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: "Please provide a message." });

  const tryGenerate = async (modelName) => {
    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      }
    });

    const prompt = `
      Act as "LocalSathi AI", a professional and helpful Mumbai travel guide. 
      Your personality: Knowledgeable, polite, and eager to help tourists explore Mumbai.
      Language: Respond ONLY in clear, helpful English.
      
      Tasks:
      1. Suggest top attractions (Gateway of India, Marine Drive, etc.).
      2. Provide information about local food (Vada Pav, Pav Bhaji).
      3. Help with transport options (Local trains, Taxis, Rickshaws).
      
      Rules:
      - Be concise (max 3-4 sentences).
      - Always offer a relevant travel tip.
      - Do not use slang.
      
      User Question: ${message}
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  };

  try {
    // Primary: gemini-1.5-flash-latest (most efficient)
    const responseText = await tryGenerate("gemini-1.5-flash-latest");
    res.json({ reply: responseText });

  } catch (error) {
    console.warn(`Primary model failed (${error.message}). Trying fallback...`);
    
    try {
      // Fallback: gemini-pro (more widely available)
      const fallbackText = await tryGenerate("gemini-pro");
      res.json({ reply: fallbackText });
    } catch (fallbackError) {
      console.error("Critical Failure:", fallbackError.message);
      
      let errorMsg = "I'm sorry, I'm having trouble connecting right now. Please try again soon.";
      if (fallbackError.message.includes("429")) {
        errorMsg = "We are receiving too many requests. Please wait a moment before trying again.";
      } else if (fallbackError.message.includes("404")) {
        errorMsg = "The AI service is currently unavailable. We're working on a fix!";
      }
      
      res.status(500).json({ reply: errorMsg });
    }
  }
});

/* ================= AUTH & USER ROUTES ================= */
// These routes handle the "Username" and "Profile" logic
app.use("/api/auth", require("./routes/auth"));
app.use("/api/user", require("./routes/user"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/feedback", require("./routes/feedback"));
app.use("/api/contact", require("./routes/contact"));
app.use("/api/trips", require("./routes/trips"));

/* ================= STATIC SERVE (PRODUCTION) ================= */
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../frontend/dist/index.html"));
  });
}

/* ================= SERVER INITIALIZATION ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Localsathi Backend running on port ${PORT}`);
});