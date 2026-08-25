const fs = require("fs");
const path = require("path");

class HistoryStore {
  constructor() {
    this.records = new Map();
    this.storageFile = path.join(__dirname, "../../data/procurement-history.json");
    this.init();
  }

  init() {
    try {
      const dataDir = path.dirname(this.storageFile);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      if (fs.existsSync(this.storageFile)) {
        const raw = fs.readFileSync(this.storageFile, "utf8");
        const list = JSON.parse(raw);
        for (const item of list) {
          this.records.set(item.procurementId, item);
        }
      }
    } catch (err) {
      console.warn("History storage init warning:", err.message);
    }
  }

  persist() {
    try {
      const list = Array.from(this.records.values());
      fs.writeFileSync(this.storageFile, JSON.stringify(list, null, 2));
    } catch (err) {
      console.error("Failed to persist history to disk:", err.message);
    }
  }

  saveAnalysis(analysis) {
    const record = {
      procurementId: analysis.procurementId,
      procurementIdBytes32: analysis.procurementIdBytes32,
      rawRequest: analysis.rawRequest,
      itemCategory: analysis.itemCategory,
      quantity: analysis.quantity,
      maxBudget: analysis.maxBudget,
      recommendedSupplier: {
        id: analysis.recommendedSupplier.supplierId,
        name: analysis.recommendedSupplier.supplierName,
        supplierHash: analysis.recommendedSupplier.supplierHash,
        unitPrice: analysis.recommendedSupplier.unitPrice,
        totalPrice: analysis.recommendedSupplier.totalPrice,
        deliveryDays: analysis.recommendedSupplier.deliveryDays,
        warrantyMonths: analysis.recommendedSupplier.warrantyMonths,
        paymentTerms: analysis.recommendedSupplier.paymentTerms,
        score: analysis.recommendedSupplier.scores.totalScore
      },
      status: "ANALYZED", // ANALYZED -> APPROVED_ON_CHAIN
      createdAt: new Date().toISOString(),
      onChainApproval: null
    };

    this.records.set(record.procurementId, record);
    this.persist();
    return record;
  }

  recordOnChainTx(procurementId, { txHash, walletAddress, contractAddress, blockNumber, timestamp }) {
    let record = this.records.get(procurementId);
    if (!record) {
      record = {
        procurementId,
        status: "APPROVED_ON_CHAIN",
        createdAt: new Date().toISOString()
      };
      this.records.set(procurementId, record);
    }

    record.status = "APPROVED_ON_CHAIN";
    record.onChainApproval = {
      txHash,
      walletAddress,
      contractAddress,
      blockNumber: blockNumber || null,
      timestamp: timestamp || new Date().toISOString(),
      explorerUrl: `https://scan.botchain.ai/tx/${txHash}`,
      chainId: 677
    };

    this.persist();
    return record;
  }

  getAll() {
    return Array.from(this.records.values()).reverse();
  }

  getById(procurementId) {
    return this.records.get(procurementId) || null;
  }
}

const historyStore = new HistoryStore();

module.exports = historyStore;
