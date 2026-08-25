const express = require("express");
const fs = require("fs");
const path = require("path");
const { getSuppliers, getSupplierById } = require("../services/suppliers");
const { parseProcurementRequest } = require("../services/parser");
const { evaluateSuppliers } = require("../services/scoringEngine");
const { generateAIReasoning } = require("../services/aiReasoning");
const historyStore = require("../services/historyStore");

const router = express.Router();

/**
 * Helper to get active contract configuration
 */
function getContractConfig() {
  try {
    const configPath = path.join(__dirname, "../../../frontend-integration/contract-config.json");
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
  } catch (err) {
    console.warn("Could not read contract-config.json:", err.message);
  }

  return {
    contractName: "ProcureAIRegistry",
    address: process.env.PROCUREAI_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
    chainId: 677,
    network: "botchain",
    rpcUrl: "https://rpc.botchain.ai",
    explorerUrl: "https://scan.botchain.ai"
  };
}

/**
 * POST /api/analyze
 * Evaluates demo suppliers against procurement request using multi-criteria deterministic scoring and AI reasoning.
 */
router.post("/analyze", (req, res) => {
  try {
    const rawInput = req.body.procurementRequest || req.body.request || req.body.text || req.body.prompt;
    
    if (!rawInput || typeof rawInput !== "string" || !rawInput.trim()) {
      return res.status(400).json({
        success: false,
        error: "Missing required field 'procurementRequest'. Example: 'Buy 50 laptops under $30,000.'"
      });
    }

    // 1. Parse natural language request
    const parsedRequirements = parseProcurementRequest(rawInput);

    // 2. Load demo suppliers
    const suppliers = getSuppliers();

    // 3. Multi-criteria deterministic evaluation
    const evaluation = evaluateSuppliers(suppliers, parsedRequirements);

    // 4. Generate AI reasoning and trade-off justification
    const aiReasoning = generateAIReasoning(parsedRequirements, evaluation);

    // 5. Precompute Web3 contract call parameters for single-tx wallet execution
    const contractConfig = getContractConfig();
    const contractCallData = {
      targetContract: contractConfig.address,
      chainId: contractConfig.chainId || 677,
      rpcUrl: contractConfig.rpcUrl || "https://rpc.botchain.ai",
      functionName: "approveProcurement",
      params: {
        procurementId: parsedRequirements.procurementIdBytes32,
        supplierHash: evaluation.recommendedSupplier.supplierHash,
        amount: evaluation.recommendedSupplier.totalPrice
      },
      readableParams: {
        procurementIdString: parsedRequirements.procurementId,
        supplierName: evaluation.recommendedSupplier.supplierName,
        totalAmountUSD: evaluation.recommendedSupplier.totalPrice
      }
    };

    const responsePayload = {
      success: true,
      procurementId: parsedRequirements.procurementId,
      procurementIdBytes32: parsedRequirements.procurementIdBytes32,
      parsedRequirements,
      recommendedSupplier: evaluation.recommendedSupplier,
      supplierScore: evaluation.recommendedSupplier.scores.totalScore,
      comparisonResults: evaluation.comparisonResults,
      scoringWeights: evaluation.scoringWeights,
      aiReasoning,
      contractCallData,
      network: {
        chainId: 677,
        chainName: "BOT Chain Mainnet",
        rpcUrl: "https://rpc.botchain.ai",
        explorerUrl: "https://scan.botchain.ai",
        nativeToken: "BOT"
      }
    };

    // 6. Save in history store
    historyStore.saveAnalysis({
      ...parsedRequirements,
      recommendedSupplier: evaluation.recommendedSupplier
    });

    return res.status(200).json(responsePayload);
  } catch (error) {
    console.error("Error in /api/analyze:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze procurement request."
    });
  }
});

/**
 * GET /api/suppliers
 * Returns the demo supplier catalog
 */
router.get("/suppliers", (req, res) => {
  res.json({
    success: true,
    suppliers: getSuppliers()
  });
});

/**
 * GET /api/history
 * Returns the recorded procurement history
 */
router.get("/history", (req, res) => {
  res.json({
    success: true,
    history: historyStore.getAll()
  });
});

/**
 * GET /api/history/:id
 */
router.get("/history/:id", (req, res) => {
  const item = historyStore.getById(req.params.id);
  if (!item) {
    return res.status(404).json({ success: false, error: "Procurement record not found" });
  }
  res.json({ success: true, item });
});

/**
 * POST /api/history/record-tx
 * Updates local history with the user wallet's on-chain transaction hash
 */
router.post("/history/record-tx", (req, res) => {
  const { procurementId, txHash, walletAddress, blockNumber, timestamp } = req.body;
  if (!procurementId || !txHash) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields: procurementId, txHash"
    });
  }

  const contractConfig = getContractConfig();
  const updated = historyStore.recordOnChainTx(procurementId, {
    txHash,
    walletAddress,
    contractAddress: contractConfig.address,
    blockNumber,
    timestamp
  });

  res.json({
    success: true,
    message: "On-chain approval transaction recorded successfully.",
    record: updated,
    explorerUrl: `https://scan.botchain.ai/tx/${txHash}`
  });
});

/**
 * GET /api/config
 * Returns active network and smart contract configuration
 */
router.get("/config", (req, res) => {
  const contractConfig = getContractConfig();
  res.json({
    success: true,
    network: {
      chainId: 677,
      name: "BOT Chain Mainnet",
      rpcUrl: "https://rpc.botchain.ai",
      explorerUrl: "https://scan.botchain.ai",
      nativeCurrency: {
        name: "BOT",
        symbol: "BOT",
        decimals: 18
      }
    },
    contract: {
      name: "ProcureAIRegistry",
      address: contractConfig.address,
      abi: contractConfig.abi || []
    }
  });
});

module.exports = router;
