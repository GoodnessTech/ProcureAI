const test = require("node:test");
const assert = require("node:assert");
const { getSuppliers } = require("../src/services/suppliers");
const { evaluateSuppliers, SCORING_WEIGHTS } = require("../src/services/scoringEngine");
const { generateAIReasoning } = require("../src/services/aiReasoning");

test("ProcureAI Multi-Criteria Scoring Engine", async (t) => {
  const suppliers = getSuppliers();

  await t.test("scoring weights must sum exactly to 1.0 (100%)", () => {
    const totalWeight =
      SCORING_WEIGHTS.price +
      SCORING_WEIGHTS.delivery +
      SCORING_WEIGHTS.reputation +
      SCORING_WEIGHTS.warranty +
      SCORING_WEIGHTS.terms;

    assert.strictEqual(Math.round(totalWeight * 100) / 100, 1.0);
    assert.strictEqual(SCORING_WEIGHTS.price, 0.35);
    assert.strictEqual(SCORING_WEIGHTS.delivery, 0.20);
    assert.strictEqual(SCORING_WEIGHTS.reputation, 0.20);
    assert.strictEqual(SCORING_WEIGHTS.warranty, 0.15);
    assert.strictEqual(SCORING_WEIGHTS.terms, 0.10);
  });

  await t.test("should evaluate 3 demo suppliers and recommend the best balanced option", () => {
    const parsedRequirements = {
      quantity: 50,
      maxBudget: 30000,
      itemCategory: "Laptops",
      procurementId: "PROC-2026-LAPTOPS-50-TEST",
      procurementIdBytes32: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef"
    };

    const result = evaluateSuppliers(suppliers, parsedRequirements);

    assert.ok(result.recommendedSupplier);
    assert.strictEqual(result.comparisonResults.length, 3);

    // Winner should be TechSource Enterprise due to strong warranty (36m), fast delivery (3d), top reputation (4.9), and Net 60 terms
    assert.strictEqual(result.recommendedSupplier.supplierName, "TechSource Enterprise");
    assert.ok(result.recommendedSupplier.scores.totalScore > 80);
    assert.ok(result.recommendedSupplier.isWithinBudget);

    // Verify AI reasoning output
    const reasoning = generateAIReasoning(parsedRequirements, result);
    assert.ok(reasoning.verdict.includes("TechSource Enterprise"));
    assert.ok(reasoning.confidenceScore > 0);
    assert.ok(reasoning.summary.length > 20);
    assert.ok(reasoning.tradeOffAnalysis.length > 20);
  });
});
