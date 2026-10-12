import { segmentClauses } from "./segmentClauses.js";
import { scoreRisk } from "./scoreRisk.js";
import { negotiate } from "./negotiate.js";

/**
 * Full AI pipeline:
 * rawText -> segments -> risk score -> negotiate -> merged result
 */
export const analyzeContract = async (rawText, role = "freelancer") => {
  console.log("🔍 Step 1: Segmenting clauses...");
  const clauses = await segmentClauses(rawText);
  console.log(`   → ${clauses.length} clauses found`);

  console.log("⚖️ Step 2: Scoring risk...");
  const riskResult = await scoreRisk(clauses, role);

  console.log("💬 Step 3: Generating negotiation suggestions...");
  const suggestionsMap = await negotiate(riskResult.clauses, role);

  // Merge suggestions into clauses
  const merged = riskResult.clauses.map((c) => ({
    ...c,
    suggestion: suggestionsMap[c.clauseId] || "",
  }));

  return {
    clauses: merged,
    redFlags: riskResult.redFlags,
    summary: riskResult.summary,
  };
};