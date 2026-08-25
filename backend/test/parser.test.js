const test = require("node:test");
const assert = require("node:assert");
const { parseProcurementRequest } = require("../src/services/parser");

test("Procurement Request Parser", async (t) => {
  await t.test("should parse 'Buy 50 laptops under $30,000.' correctly", () => {
    const input = "Buy 50 laptops under $30,000.";
    const result = parseProcurementRequest(input);

    assert.strictEqual(result.quantity, 50);
    assert.strictEqual(result.maxBudget, 30000);
    assert.strictEqual(result.itemCategory, "Laptops");
    assert.strictEqual(result.unitBudgetCap, 600);
    assert.ok(result.procurementId.startsWith("PROC-"));
    assert.ok(result.procurementIdBytes32.startsWith("0x"));
    assert.strictEqual(result.procurementIdBytes32.length, 66);
  });

  await t.test("should parse 'Need 100 laptops with $55k budget' correctly", () => {
    const input = "Need 100 laptops with $55k budget";
    const result = parseProcurementRequest(input);

    assert.strictEqual(result.quantity, 100);
    assert.strictEqual(result.maxBudget, 55000);
    assert.strictEqual(result.unitBudgetCap, 550);
  });

  await t.test("should handle missing text gracefully by throwing error", () => {
    assert.throws(() => parseProcurementRequest(""), /required/);
    assert.throws(() => parseProcurementRequest(null), /required/);
  });
});
