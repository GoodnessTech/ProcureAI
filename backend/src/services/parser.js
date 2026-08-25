const { hashString } = require("../utils/cryptoHelper");

/**
 * Parses a procurement natural language prompt or structured request into standardized parameters.
 * Example inputs:
 * - "Buy 50 laptops under $30,000."
 * - "Procure 25 laptops with a budget of $15000"
 * - "Need 100 enterprise laptops, max price $60,000, 3-day delivery"
 */
function parseProcurementRequest(requestText) {
  if (!requestText || typeof requestText !== "string" || requestText.trim().length === 0) {
    throw new Error("Procurement request text is required.");
  }

  const cleanText = requestText.trim();

  // Extract quantity: matches "50 laptops", "50 units", "quantity: 50", "buy 50", etc.
  let quantity = 50; // Default
  const quantityMatch = cleanText.match(/(?:buy|procure|order|need|purchase|quantity:?)?\s*(\d+)\s*(?:units|laptops|devices|pcs|workstations|items)?/i);
  if (quantityMatch && parseInt(quantityMatch[1], 10) > 0) {
    quantity = parseInt(quantityMatch[1], 10);
  }

  // Extract budget: matches "$30,000", "$30000", "under $30k", "budget: 30000", etc.
  let maxBudget = 30000; // Default
  const budgetMatch = cleanText.match(/\$?\s*([\d,]+(?:\.\d+)?)\s*(?:k|thousand)?(?:\s*budget|\s*max|\s*under|\s*total)?/i);
  
  // More specific regex looking for $ or budget/under
  const dollarMatch = cleanText.match(/(?:under|budget of|max(?:imum)?|for|at|limit|cost of)?\s*\$\s*([\d,]+(?:\.\d+)?)(k)?/i) ||
                      cleanText.match(/(?:under|budget of|max(?:imum)?|limit)\s*([\d,]+(?:\.\d+)?)\s*(?:usd|dollars|\$)?/i);

  if (dollarMatch) {
    let numStr = dollarMatch[1].replace(/,/g, "");
    let val = parseFloat(numStr);
    if (dollarMatch[2] && dollarMatch[2].toLowerCase() === "k") {
      val = val * 1000;
    }
    if (!isNaN(val) && val > 0) {
      maxBudget = val;
    }
  }

  // Extract item category / name
  let itemCategory = "Enterprise Laptops";
  if (/laptop|macbook|notebook/i.test(cleanText)) {
    itemCategory = "Laptops";
  } else if (/server|workstation/i.test(cleanText)) {
    itemCategory = "Servers & Workstations";
  } else if (/monitor|display|screen/i.test(cleanText)) {
    itemCategory = "Monitors & Displays";
  }

  // Calculate unit budget cap
  const unitBudgetCap = maxBudget / quantity;

  // Generate unique human-readable Procurement ID and bytes32 hash
  const timestamp = Date.now();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const procurementId = `PROC-${new Date().getFullYear()}-${itemCategory.toUpperCase().replace(/\s+/g, "")}-${quantity}-${randomSuffix}`;
  const procurementIdBytes32 = hashString(procurementId);

  return {
    procurementId,
    procurementIdBytes32,
    rawRequest: cleanText,
    itemCategory,
    quantity,
    maxBudget,
    unitBudgetCap: Math.round(unitBudgetCap * 100) / 100,
    parsedAt: new Date().toISOString()
  };
}

module.exports = {
  parseProcurementRequest
};
