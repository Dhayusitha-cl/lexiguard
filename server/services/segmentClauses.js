import { callGeminiJSON } from "./geminiService.js";
import { SEGMENT_PROMPT } from "../prompts/geminiPrompts.js";

/**
 * Two-step clause segmentation:
 * 1. Regex splitter for clearly numbered sections (fast, free)
 * 2. Gemini for semantic segmentation of the result
 * Merge + dedupe.
 */
export const segmentClauses = async (rawText) => {
  // Step 1: quick regex pre-split
  const regexClauses = regexSplit(rawText);

  // Step 2: Gemini semantic segmentation
  let geminiClauses = [];
  try {
    const result = await callGeminiJSON(SEGMENT_PROMPT(rawText));
    if (result?.clauses?.length) {
      geminiClauses = result.clauses.map((c, i) => ({
        id: c.id || `c${i + 1}`,
        text: (c.text || "").trim(),
      }));
    }
  } catch (err) {
    console.warn("Gemini segmentation failed, using regex only:", err.message);
  }

  // Choose the richer result
  const clauses =
    geminiClauses.length >= regexClauses.length
      ? geminiClauses
      : regexClauses;

  // Dedupe + clean
  const seen = new Set();
  const cleaned = [];
  clauses.forEach((c, idx) => {
    const t = c.text.replace(/\s+/g, " ").trim();
    if (t.length < 20) return; // skip garbage
    if (seen.has(t)) return;
    seen.add(t);
    cleaned.push({ id: `c${cleaned.length + 1}`, text: t });
  });

  return cleaned.slice(0, 40); // cap
};

function regexSplit(text) {
  // Split by numbered sections like "1.", "1.1", "Article 3", "Section 4"
  const pattern =
    /(?=\n\s*(?:\d+\.\d*|\d+\)|Article\s+\d+|Section\s+\d+|Clause\s+\d+)[\s.):])/gi;
  const parts = text.split(pattern).map((p) => p.trim()).filter(Boolean);
  return parts.map((p, i) => ({ id: `c${i + 1}`, text: p }));
}