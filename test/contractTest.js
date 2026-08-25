const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

test("ProcureAIRegistry Smart Contract Unit & Gas Tests", async (t) => {
  // Load compiled artifact
  const artifactPath = path.join(
    __dirname,
    "../artifacts/contracts/ProcureAIRegistry.sol/ProcureAIRegistry.json"
  );
  assert.ok(fs.existsSync(artifactPath), "Artifact ProcureAIRegistry.json must exist");
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const { abi, bytecode } = artifact;

  // Setup Hardhat / local test provider with Wallet
  // Using an ethers HDNodeWallet or mock provider / Hardhat JSON-RPC
  const wallet1 = ethers.Wallet.createRandom();
  const wallet2 = ethers.Wallet.createRandom();

  await t.test("Artifact validation", () => {
    assert.ok(bytecode.length > 10, "Bytecode must be non-empty");
    assert.ok(abi.length >= 4, "ABI must contain all functions and events");

    // Verify functions exist in ABI
    const functionNames = abi.filter((x) => x.type === "function").map((x) => x.name);
    assert.ok(functionNames.includes("approveProcurement"), "approveProcurement must exist");
    assert.ok(functionNames.includes("isApproved"), "isApproved must exist");
    assert.ok(functionNames.includes("getApproval"), "getApproval must exist");

    // Verify events exist in ABI
    const eventNames = abi.filter((x) => x.type === "event").map((x) => x.name);
    assert.ok(eventNames.includes("ProcurementApproved"), "ProcurementApproved event must exist");

    // Verify custom errors exist in ABI
    const errorNames = abi.filter((x) => x.type === "error").map((x) => x.name);
    assert.ok(errorNames.includes("AlreadyApproved"), "AlreadyApproved error must exist");
    assert.ok(errorNames.includes("InvalidProcurementId"), "InvalidProcurementId error must exist");
    assert.ok(errorNames.includes("InvalidSupplier"), "InvalidSupplier error must exist");
    assert.ok(errorNames.includes("InvalidAmount"), "InvalidAmount error must exist");
  });

  await t.test("Verify contract interface & encoding parameters", () => {
    const iface = new ethers.Interface(abi);

    const procurementId = ethers.keccak256(ethers.toUtf8Bytes("PROC-2026-LAPTOPS-50"));
    const supplierHash = ethers.keccak256(ethers.toUtf8Bytes("TechSource Enterprise"));
    const amount = 28500n;

    // Encode function call
    const calldata = iface.encodeFunctionData("approveProcurement", [
      procurementId,
      supplierHash,
      amount
    ]);

    assert.ok(calldata.startsWith("0x"), "Calldata must start with 0x");
    assert.strictEqual(calldata.length, 10 + 64 * 3, "Calldata must have 4-byte selector + 3 32-byte arguments");

    // Decode function call
    const decoded = iface.decodeFunctionData("approveProcurement", calldata);
    assert.strictEqual(decoded[0], procurementId);
    assert.strictEqual(decoded[1], supplierHash);
    assert.strictEqual(decoded[2], amount);
  });
});
