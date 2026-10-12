export const SEGMENT_PROMPT = (contractText) => `
You are a legal contract parser. Split the following contract into individual clauses.

Rules:
- Each clause = one distinct legal obligation, right, or term.
- Preserve original wording. Do NOT paraphrase.
- Ignore headers, page numbers, signatures, addresses.
- If two clauses are merged in a single paragraph, split them by sentence if they address different topics.
- Return up to 40 clauses maximum.

Return ONLY valid JSON (no markdown fences, no explanation):
{
  "clauses": [
    { "id": "c1", "text": "..." },
    { "id": "c2", "text": "..." }
  ]
}

CONTRACT:
"""
${contractText.slice(0, 15000)}
"""
`;

export const RISK_PROMPT = (clauses, role) => `
You are a senior contract risk analyst in India. Analyze each clause for a ${role.toUpperCase()}.

Risk criteria (consider ALL):
- Non-compete / non-solicit: High if broad scope, long duration, wide geography
- IP assignment: High if assigns all future work, Medium if only project IP
- Auto-renewal / evergreen clauses: Medium unless clear opt-out given
- One-sided termination: High if only client can terminate
- Delayed payment (>45 days): High. 30-45 days: Medium.
- Confidentiality overreach: Medium if perpetual/unlimited
- Indemnification imbalance: High if one-sided
- Arbitration outside India / foreign jurisdiction: Medium
- Penalty/liquidated damages without cap: High

Role context:
- freelancer: prioritize payment terms, IP, non-compete, termination
- employee: prioritize non-compete scope, IP, salary, notice period
- founder: prioritize investor rights, dilution, board control, IP

Return ONLY valid JSON (no markdown fences):
{
  "clauses": [
    {
      "id": "c1",
      "text": "original clause text",
      "risk": "Low" | "Medium" | "High",
      "reason": "1-line plain-English reason under 25 words"
    }
  ],
  "redFlags": [
    "Short red flag #1",
    "Short red flag #2"
  ],
  "summary": "3-4 sentence plain-English summary of overall contract risk for a ${role}."
}

RULES:
- redFlags: only the 3-6 most dangerous items
- summary: mention total risk level (Low/Medium/High overall)
- If clause is boilerplate (definitions, notices), mark Low.

CLAUSES TO ANALYZE:
${JSON.stringify(clauses)}
`;

export const NEGOTIATE_PROMPT = (clauses, role) => {
  const toNegotiate = clauses.filter((c) => c.risk !== "Low");
  return `
You are a contract negotiation coach for Indian ${role}s.

For each clause below (Medium or High risk), suggest what to negotiate.

Rules:
- Be polite, professional, and actionable.
- Under 2 lines (max 30 words).
- Focus on WHAT to change, not generic advice.
- Example: "Ask to limit non-compete to 6 months and only direct competitors in India."

Return ONLY valid JSON (no markdown fences):
{
  "suggestions": [
    { "clauseId": "c1", "suggestion": "..." },
    { "clauseId": "c2", "suggestion": "..." }
  ]
}

CLAUSES:
${JSON.stringify(toNegotiate.map((c) => ({ id: c.id, text: c.text, risk: c.risk, reason: c.reason })))}
`;
};