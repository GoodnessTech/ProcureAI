/**
 * ProcureAI Multi-Criteria Scoring Engine
 * Weights:
 * - Price: 35%
 * - Delivery: 20%
 * - Supplier Reputation: 20%
 * - Warranty: 15%
 * - Commercial / Payment Terms: 10%
 * Total = 100%
 */

const SCORING_WEIGHTS = {
  price: 0.35,
  delivery: 0.20,
  reputation: 0.20,
  warranty: 0.15,
  terms: 0.10
};

/**
 * Calculates individual criteria subscores (0 - 100 scale) and weighted composite score
 */
function evaluateSuppliers(suppliers, parsedRequirements) {
  const { quantity, maxBudget } = parsedRequirements;

  // Find min and max cost in candidate pool for relative normalization
  const supplierCosts = suppliers.map((s) => s.baseUnitPrice * quantity);
  const minCost = Math.min(...supplierCosts);
  const maxCost = Math.max(...supplierCosts);

  const evaluated = suppliers.map((supplier) => {
    const totalCost = supplier.baseUnitPrice * quantity;
    const isWithinBudget = totalCost <= maxBudget;

    // 1. Price Score (35%)
    let priceScore = 50;
    if (totalCost > maxBudget) {
      // Over budget penalty
      const overageRatio = (totalCost - maxBudget) / maxBudget;
      priceScore = Math.max(0, 40 - overageRatio * 100);
    } else {
      // Within budget: lowest cost gets 100, others scaled smoothly
      if (maxCost === minCost) {
        priceScore = 100;
      } else {
        const relativePosition = (maxCost - totalCost) / (maxCost - minCost);
        priceScore = 75 + relativePosition * 25; // 75 - 100 scale
      }
    }

    // 2. Delivery Score (20%)
    // 2 days = 100, 3 days = 95, 8 days = 60
    const deliveryScore = Math.max(10, Math.min(100, 100 - (supplier.deliveryDays - 2) * 6.5));

    // 3. Reputation Score (20%)
    // 5.0 rating = 100, 4.9 = 98, 4.5 = 90
    const reputationScore = Math.min(100, (supplier.reputation / 5.0) * 100);

    // 4. Warranty Score (15%)
    // 36 months = 100, 24 months = 75, 12 months = 50
    const warrantyScore = Math.min(100, Math.max(20, (supplier.warrantyMonths / 36) * 100));

    // 5. Payment Terms Score (10%)
    const termsScore = supplier.paymentTermsScore || 70;

    // Calculate total weighted score
    const totalScore =
      priceScore * SCORING_WEIGHTS.price +
      deliveryScore * SCORING_WEIGHTS.delivery +
      reputationScore * SCORING_WEIGHTS.reputation +
      warrantyScore * SCORING_WEIGHTS.warranty +
      termsScore * SCORING_WEIGHTS.terms;

    return {
      supplierId: supplier.id,
      supplierName: supplier.name,
      supplierHash: supplier.supplierHash,
      productCategory: supplier.productCategory,
      unitPrice: supplier.baseUnitPrice,
      totalPrice: totalCost,
      isWithinBudget,
      deliveryDays: supplier.deliveryDays,
      reputation: supplier.reputation,
      warrantyMonths: supplier.warrantyMonths,
      paymentTerms: supplier.paymentTerms,
      complianceStatus: supplier.complianceStatus,
      scores: {
        priceScore: Math.round(priceScore * 10) / 10,
        deliveryScore: Math.round(deliveryScore * 10) / 10,
        reputationScore: Math.round(reputationScore * 10) / 10,
        warrantyScore: Math.round(warrantyScore * 10) / 10,
        termsScore: Math.round(termsScore * 10) / 10,
        totalScore: Math.round(totalScore * 10) / 10
      },
      weightsApplied: SCORING_WEIGHTS
    };
  });

  // Sort descending by total score
  evaluated.sort((a, b) => b.scores.totalScore - a.scores.totalScore);

  const recommendedSupplier = evaluated[0];

  return {
    recommendedSupplier,
    comparisonResults: evaluated,
    scoringWeights: SCORING_WEIGHTS
  };
}

module.exports = {
  SCORING_WEIGHTS,
  evaluateSuppliers
};
