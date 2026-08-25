const http = require("http");
const url = require("url");
const path = require("path");
const fs = require("fs");

// Load local .env if available
try {
  const envPath = path.join(__dirname, "../../.env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    for (const line of envContent.split("\n")) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match && !process.env[match[1]]) {
        process.env[match[1]] = (match[2] || "").trim().replace(/^['"]|['"]$/g, "");
      }
    }
  }
} catch (e) {}

const { getSuppliers } = require("./services/suppliers");
const { parseProcurementRequest } = require("./services/parser");
const { evaluateSuppliers } = require("./services/scoringEngine");
const { generateAIReasoning } = require("./services/aiReasoning");
const historyStore = require("./services/historyStore");

const PORT = process.env.PORT || 5000;

function getContractConfig() {
  try {
    const configPath = path.join(__dirname, "../../frontend-integration/contract-config.json");
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, "utf8"));
    }
  } catch (err) {}

  return {
    contractName: "ProcureAIRegistry",
    address: process.env.PROCUREAI_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000",
    chainId: 677,
    network: "botchain",
    rpcUrl: "https://rpc.botchain.ai",
    explorerUrl: "https://scan.botchain.ai"
  };
}

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
}

function sendJson(res, statusCode, data) {
  setCorsHeaders(res);
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data, null, 2));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      if (!body.trim()) {
        return resolve({});
      }
      try {
        const parsed = JSON.parse(body);
        resolve(parsed);
      } catch (err) {
        reject(new Error("Invalid JSON payload"));
      }
    });
    req.on("error", (err) => reject(err));
  });
}

const server = http.createServer(async (req, res) => {
  const reqUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = reqUrl.pathname.replace(/\/+$/, "") || "/";
  const method = req.method.toUpperCase();

  // Handle CORS preflight
  if (method === "OPTIONS") {
    setCorsHeaders(res);
    res.writeHead(204);
    return res.end();
  }

  // Request logger
  console.log(`[${new Date().toISOString()}] ${method} ${pathname}`);

  try {
    // GET /health
    if (method === "GET" && pathname === "/health") {
      return sendJson(res, 200, {
        status: "ok",
        service: "ProcureAI Backend",
        timestamp: new Date().toISOString(),
        network: "BOT Chain Mainnet (Chain ID 677)"
      });
    }

    // GET /
    if (method === "GET" && pathname === "") {
      return sendJson(res, 200, {
        name: "ProcureAI Backend API",
        version: "1.0.0",
        docs: {
          analyze: "POST /api/analyze",
          suppliers: "GET /api/suppliers",
          history: "GET /api/history",
          recordTx: "POST /api/history/record-tx",
          config: "GET /api/config"
        },
        network: {
          chainName: "BOT Chain Mainnet",
          chainId: 677,
          rpcUrl: "https://rpc.botchain.ai",
          explorer: "https://scan.botchain.ai"
        }
      });
    }

    // POST /api/analyze
    if (method === "POST" && pathname === "/api/analyze") {
      const body = await parseJsonBody(req);
      const rawInput = body.procurementRequest || body.request || body.text || body.prompt;

      if (!rawInput || typeof rawInput !== "string" || !rawInput.trim()) {
        return sendJson(res, 400, {
          success: false,
          error: "Missing required field 'procurementRequest'. Example: 'Buy 50 laptops under $30,000.'"
        });
      }

      const parsedRequirements = parseProcurementRequest(rawInput);
      const suppliers = getSuppliers();
      const evaluation = evaluateSuppliers(suppliers, parsedRequirements);
      const aiReasoning = generateAIReasoning(parsedRequirements, evaluation);
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

      historyStore.saveAnalysis({
        ...parsedRequirements,
        recommendedSupplier: evaluation.recommendedSupplier
      });

      return sendJson(res, 200, responsePayload);
    }

    // GET /api/suppliers
    if (method === "GET" && pathname === "/api/suppliers") {
      return sendJson(res, 200, {
        success: true,
        suppliers: getSuppliers()
      });
    }

    // GET /api/history
    if (method === "GET" && pathname === "/api/history") {
      return sendJson(res, 200, {
        success: true,
        history: historyStore.getAll()
      });
    }

    // GET /api/history/:id
    if (method === "GET" && pathname.startsWith("/api/history/")) {
      const id = pathname.replace("/api/history/", "");
      const item = historyStore.getById(id);
      if (!item) {
        return sendJson(res, 404, { success: false, error: "Procurement record not found" });
      }
      return sendJson(res, 200, { success: true, item });
    }

    // POST /api/history/record-tx
    if (method === "POST" && pathname === "/api/history/record-tx") {
      const body = await parseJsonBody(req);
      const { procurementId, txHash, walletAddress, blockNumber, timestamp } = body;

      if (!procurementId || !txHash) {
        return sendJson(res, 400, {
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

      return sendJson(res, 200, {
        success: true,
        message: "On-chain approval transaction recorded successfully.",
        record: updated,
        explorerUrl: `https://scan.botchain.ai/tx/${txHash}`
      });
    }

    // GET /api/config
    if (method === "GET" && pathname === "/api/config") {
      const contractConfig = getContractConfig();
      return sendJson(res, 200, {
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
    }

    // 404 Not Found
    return sendJson(res, 404, {
      success: false,
      error: `Route not found: ${method} ${pathname}`
    });
  } catch (error) {
    console.error("Server error:", error);
    return sendJson(res, 500, {
      success: false,
      error: error.message || "Internal server error"
    });
  }
});

// Start Server if directly invoked
if (require.main === module) {
  server.listen(PORT, () => {
    console.log("==================================================");
    console.log(`🤖 ProcureAI Backend API running on port ${PORT}`);
    console.log(`🌐 Base URL: http://localhost:${PORT}`);
    console.log(`🔗 Target Network: BOT Chain Mainnet (Chain ID 677)`);
    console.log("==================================================");
  });
}

module.exports = server;
