const { test, before, after } = require("node:test");
const assert = require("node:assert");
const server = require("../src/index");

let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => {
    server.close(() => resolve());
  });
});

test("GET /health should return 200 OK with BOT Chain info", async () => {
  const res = await fetch(`${baseUrl}/health`);
  const data = await res.json();

  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.status, "ok");
  assert.ok(data.network.includes("BOT Chain"));
});

test("GET /api/suppliers should return 3 demo suppliers", async () => {
  const res = await fetch(`${baseUrl}/api/suppliers`);
  const data = await res.json();

  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.suppliers.length, 3);
  assert.ok(data.suppliers.some((s) => s.name === "TechSource Enterprise"));
  assert.ok(data.suppliers.some((s) => s.name === "GlobalTech Supplies"));
  assert.ok(data.suppliers.some((s) => s.name === "Business Hardware Co."));
});

test("POST /api/analyze with 'Buy 50 laptops under $30,000.'", async () => {
  const res = await fetch(`${baseUrl}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      procurementRequest: "Buy 50 laptops under $30,000."
    })
  });

  const data = await res.json();

  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.parsedRequirements.quantity, 50);
  assert.strictEqual(data.parsedRequirements.maxBudget, 30000);
  assert.ok(data.recommendedSupplier);
  assert.strictEqual(data.recommendedSupplier.supplierName, "TechSource Enterprise");
  assert.strictEqual(data.comparisonResults.length, 3);
  assert.ok(data.aiReasoning.summary.length > 0);
  assert.ok(data.contractCallData.params.procurementId.startsWith("0x"));
  assert.ok(data.contractCallData.params.supplierHash.startsWith("0x"));
  assert.strictEqual(data.contractCallData.params.amount, 28500);
});

test("GET /api/history and POST /api/history/record-tx", async () => {
  // 1. Fetch history
  const res1 = await fetch(`${baseUrl}/api/history`);
  const data1 = await res1.json();
  assert.strictEqual(res1.status, 200);
  assert.ok(data1.history.length > 0);

  const firstItem = data1.history[0];

  // 2. Record on-chain TX
  const fakeTxHash = "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
  const res2 = await fetch(`${baseUrl}/api/history/record-tx`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      procurementId: firstItem.procurementId,
      txHash: fakeTxHash,
      walletAddress: "0x1111111111111111111111111111111111111111"
    })
  });

  const data2 = await res2.json();
  assert.strictEqual(res2.status, 200);
  assert.strictEqual(data2.success, true);
  assert.strictEqual(data2.record.status, "APPROVED_ON_CHAIN");
  assert.strictEqual(data2.record.onChainApproval.txHash, fakeTxHash);
  assert.ok(data2.explorerUrl.includes("scan.botchain.ai"));
});

test("GET /api/config returns BOT Chain network info", async () => {
  const res = await fetch(`${baseUrl}/api/config`);
  const data = await res.json();

  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.network.chainId, 677);
  assert.strictEqual(data.network.rpcUrl, "https://rpc.botchain.ai");
  assert.strictEqual(data.network.explorerUrl, "https://scan.botchain.ai");
});
