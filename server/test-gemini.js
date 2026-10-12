import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

try {
  const interaction = await ai.interactions.create({
    model: "gemini-3.8-flash",
    input: "Reply with exactly: OK",
  });
  console.log("✅ Gemini works:", interaction.output_text.trim());
} catch (err) {
  console.log("❌ Failed:", err.message);
}