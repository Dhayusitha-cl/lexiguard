import { callGeminiJSON } from "./geminiService.js";
import { RISK_PROMPT } from "../prompts/geminiPrompts.js";

/**
 * Rule-based keyword detection as fallback / enrichment.
 */
const HIGH_RISK_KEYWORDS = [
  "non-compete",
  "noncompete",
  "non compete",
  "perpetual",
  "irrevocable",
  "all intellectual property",
  "assigns all",
  "sole discretion",
  "waive all rights",
  "indemnify and hold harmless",
  "unlimited liability",
  "liquidated damages",
];

const MEDIUM_RISK_KEYWORDS = [
  "auto-renew",
  "automatically renew",
  "exclusive",
  "confidentiality",
  "arbitration",
  "jurisdiction",
  "notice period",
  "termination for convenience",
];

export const scoreRisk = async (clauses, role = "freelancer") => {
  try {
    const result = await callGeminiJSON(RISK_PROMPT(clauses, role));
    if (result?.clauses?.length) {
      return {
        clauses: result.clauses.map((c) => ({
          clauseId: c.id,
          text: c.text,
          risk: c.risk || "Low",
          reason: c.reason || "",
        })),
        redFlags: result.redFlags || [],
        summary: result.summary || "",
      };
    }
  } catch (err) {
    console.warn("Gemini risk scoring failed, using rule-based:", err.message);
  }

  // Fallback: rule-based
  const scored = clauses.map((c) => {
    const lower = c.text.toLowerCase();
    let risk = "Low";
    let reason = "Standard boilerplate language.";

    if (HIGH_RISK_KEYWORDS.some((k) => lower.includes(k))) {
      risk = "High";
      reason = "Contains high-risk keyword indicating one-sided obligation.";
    } else if (MEDIUM_RISK_KEYWORDS.some((k) => lower.includes(k))) {
      risk = "Medium";
      reason = "Requires attention — common clause with potential pitfalls.";
    }

    return { clauseId: c.id, text: c.text, risk, reason };
  });

  const redFlags = scored
    .filter((c) => c.risk === "High")
    .slice(0, 6)
    .map((c) => c.text.slice(0, 100) + "...");

  return {
    clauses: scored,
    redFlags,
    summary: `Rule-based fallback analysis found ${redFlags.length} high-risk clauses for a ${role}. Manual review recommended.`,
  };
};