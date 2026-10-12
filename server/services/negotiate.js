import { callGeminiJSON } from "./geminiService.js";
import { NEGOTIATE_PROMPT } from "../prompts/geminiPrompts.js";

export const negotiate = async (clauses, role = "freelancer") => {
  const toNegotiate = clauses.filter((c) => c.risk !== "Low");
  if (toNegotiate.length === 0) return {};

  try {
    const result = await callGeminiJSON(NEGOTIATE_PROMPT(clauses, role));
    const map = {};
    (result.suggestions || []).forEach((s) => {
      map[s.clauseId] = s.suggestion;
    });
    return map;
  } catch (err) {
    console.warn("Gemini negotiation failed, using fallback:", err.message);

    // Fallback suggestions
    const fallback = {};
    toNegotiate.forEach((c) => {
      if (c.risk === "High") {
        fallback[c.clauseId] =
          "Request to remove or significantly narrow this clause. Propose a mutual, time-limited alternative.";
      } else {
        fallback[c.clauseId] =
          "Ask for clarification and a balanced revision that protects both parties.";
      }
    });
    return fallback;
  }
};