import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL = "gemini-3.8-flash";

export const callGeminiJSON = async (prompt, retries = 2) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const interaction = await ai.interactions.create({
        model: MODEL,
        input: prompt,
        response_format: {
          type: "text",
          mime_type: "application/json",
        },
      });

      const text = interaction.output_text;
      return parseJSON(text);
    } catch (err) {
      console.warn(`Gemini attempt ${attempt + 1} failed:`, err.message);
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }
};

function parseJSON(raw) {
  if (!raw) throw new Error("Empty Gemini response");

  let text = raw.trim();
  text = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  text = text.replace(/^```\s*/i, "").replace(/```$/i, "").trim();

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("No JSON object found in Gemini response");
  }

  const jsonStr = text.slice(firstBrace, lastBrace + 1);
  return JSON.parse(jsonStr);
}