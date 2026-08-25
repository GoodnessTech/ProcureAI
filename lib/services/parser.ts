export interface ParsedProcurementRequest {
  rawRequest: string;
  quantity: number;
  maxBudget: number;
  itemCategory: string;
  unitBudgetCap: number;
  preferredDeliveryDays?: number;
  notes?: string;
}

export function parseProcurementRequest(text: string | any): ParsedProcurementRequest {
  if (!text || typeof text !== 'string') {
    throw new Error('Procurement request text is required.');
  }

  const cleanText = text.trim();

  // 1. Extract Quantity (e.g. "50 laptops", "100 units", "qty: 25")
  let quantity = 1;
  const qtyMatch = cleanText.match(/(?:buy|procure|need|order|purchase)?\s*(\d+)\s*(?:x\s*)?(?:laptops?|units?|items?|pcs?|pieces?|macbooks?|servers?|monitors?)?/i);
  const explicitNumberMatch = cleanText.match(/\b(\d+)\b/);

  if (qtyMatch && qtyMatch[1]) {
    quantity = parseInt(qtyMatch[1], 10);
  } else if (explicitNumberMatch && explicitNumberMatch[1]) {
    quantity = parseInt(explicitNumberMatch[1], 10);
  }

  // 2. Extract Budget (e.g. "$30,000", "under $30k", "budget 30000 USD")
  let maxBudget = 50000;
  const budgetMatchK = cleanText.match(/\$?\s*(\d+(?:\.\d+)?)\s*[kK]\b/);
  const budgetMatchStandard = cleanText.match(/(?:\$|USD|budget|under|below|max)?\s*\$?\s*([\d,]+(?:\.\d+)?)\s*(?:USD|\$|dollars)?/i);

  if (budgetMatchK && budgetMatchK[1]) {
    maxBudget = parseFloat(budgetMatchK[1]) * 1000;
  } else {
    const moneyMatches = cleanText.match(/\$\s*([\d,]+(?:\.\d+)?)/g);
    if (moneyMatches && moneyMatches.length > 0) {
      const numericPart = moneyMatches[0].replace(/[\$,]/g, '');
      maxBudget = parseFloat(numericPart);
    } else {
      const underMatch = cleanText.match(/(?:under|below|less than|max|budget of)\s*\$?([\d,]+)/i);
      if (underMatch && underMatch[1]) {
        maxBudget = parseFloat(underMatch[1].replace(/,/g, ''));
      }
    }
  }

  // 3. Extract Item / Category
  let itemCategory = 'Enterprise Hardware';
  if (/laptop|notebook|macbook|thinkpad/i.test(cleanText)) {
    itemCategory = 'Laptops';
  } else if (/server|rack|blade/i.test(cleanText)) {
    itemCategory = 'Servers';
  } else if (/monitor|screen|display/i.test(cleanText)) {
    itemCategory = 'Monitors';
  } else if (/phone|mobile/i.test(cleanText)) {
    itemCategory = 'Mobile Devices';
  }

  const unitBudgetCap = Math.round((maxBudget / quantity) * 100) / 100;

  return {
    rawRequest: cleanText,
    quantity,
    maxBudget,
    itemCategory,
    unitBudgetCap,
  };
}
