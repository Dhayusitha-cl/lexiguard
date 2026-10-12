import "dotenv/config";
import { analyzeContract } from "./services/analyzePipeline.js";

const sampleContract = `
1. The Freelancer agrees to assign all intellectual property created during the term to the Client, including all future work, in perpetuity and irrevocably.
2. The Client shall pay the Freelancer within 90 days of invoice receipt.
3. The Freelancer agrees not to compete with the Client's business anywhere in India for 5 years after termination.
4. Either party may terminate this agreement with 30 days written notice.
5. All confidential information shall remain confidential indefinitely.
`;

try {
  console.log("🚀 Running full AI pipeline...\n");
  const result = await analyzeContract(sampleContract, "freelancer");

  console.log(`\n📊 RESULTS:`);
  console.log(`Clauses analyzed: ${result.clauses.length}`);
  console.log(`Red flags: ${result.redFlags.length}`);
  console.log(`\nClause breakdown:`);
  result.clauses.forEach((c) => {
    console.log(`  [${c.risk}] ${c.text.slice(0, 60)}...`);
    console.log(`    Reason: ${c.reason}`);
    if (c.suggestion) console.log(`    Suggestion: ${c.suggestion}`);
  });
  console.log(`\n📝 Summary: ${result.summary}`);
  console.log(`\n🚩 Red flags:`);
  result.redFlags.forEach((f) => console.log(`  - ${f}`));
} catch (err) {
  console.error("❌ Pipeline failed:", err.message);
  console.error(err);
}