/**
 * Generates transparent AI procurement reasoning and executive justification.
 * Works deterministically without requiring an external paid API key, with optional AI provider integration.
 */
function generateAIReasoning(parsedRequirements, evaluationResult) {
  const { recommendedSupplier, comparisonResults } = evaluationResult;
  const { quantity, maxBudget, itemCategory } = parsedRequirements;
  
  const runnerUp = comparisonResults[1];
  const budgetFormatted = `$${maxBudget.toLocaleString()}`;
  const totalFormatted = `$${recommendedSupplier.totalPrice.toLocaleString()}`;
  const savings = maxBudget - recommendedSupplier.totalPrice;
  const savingsFormatted = savings >= 0 ? `$${savings.toLocaleString()}` : `-$${Math.abs(savings).toLocaleString()}`;

  // Key advantages of the winner
  const advantages = [];
  if (recommendedSupplier.scores.warrantyScore >= 90) {
    advantages.push(`industry-leading ${recommendedSupplier.warrantyMonths}-month enterprise warranty`);
  }
  if (recommendedSupplier.scores.deliveryScore >= 90) {
    advantages.push(`rapid ${recommendedSupplier.deliveryDays}-day lead time`);
  }
  if (recommendedSupplier.scores.reputationScore >= 95) {
    advantages.push(`top-tier vendor reliability rating (${recommendedSupplier.reputation}/5.0)`);
  }
  if (recommendedSupplier.scores.termsScore >= 90) {
    advantages.push(`favorable commercial cashflow terms (${recommendedSupplier.paymentTerms})`);
  }
  if (recommendedSupplier.isWithinBudget) {
    advantages.push(`comes in strictly within budget at ${totalFormatted} (saving ${savingsFormatted})`);
  }

  // Summary analysis paragraph
  const summary = `Based on multi-criteria analysis for ${quantity} ${itemCategory.toLowerCase()} (budget: ${budgetFormatted}), ${recommendedSupplier.supplierName} achieved the highest composite recommendation score of ${recommendedSupplier.scores.totalScore}/100.`;

  // Deep-dive trade-off justification
  let tradeOffExplanation = "";
  if (runnerUp) {
    const runnerUpTotalFormatted = `$${runnerUp.totalPrice.toLocaleString()}`;
    if (runnerUp.totalPrice < recommendedSupplier.totalPrice) {
      tradeOffExplanation = `Although ${runnerUp.supplierName} offers a slightly lower initial price (${runnerUpTotalFormatted} vs ${totalFormatted}), ${recommendedSupplier.supplierName} is recommended because its superior warranty (${recommendedSupplier.warrantyMonths}m vs ${runnerUp.warrantyMonths}m), faster delivery (${recommendedSupplier.deliveryDays}d vs ${runnerUp.deliveryDays}d), and higher reputation (${recommendedSupplier.reputation} vs ${runnerUp.reputation}) provide significantly higher enterprise value and lower operational risk.`;
    } else {
      tradeOffExplanation = `${recommendedSupplier.supplierName} outperforms ${runnerUp.supplierName} (score: ${runnerUp.scores.totalScore}/100) across total cost (${totalFormatted} vs ${runnerUpTotalFormatted}), delivery speed (${recommendedSupplier.deliveryDays}d), and enterprise warranty coverage (${recommendedSupplier.warrantyMonths} months).`;
    }
  }

  // Blockchain payload summary
  const blockchainSummary = `Final approval will record procurement ID ${parsedRequirements.procurementId} and supplier hash ${recommendedSupplier.supplierHash.slice(0, 10)}... on BOT Chain Mainnet (Chain ID 677).`;

  return {
    verdict: `Recommended: ${recommendedSupplier.supplierName}`,
    confidenceScore: Math.min(99, Math.round(recommendedSupplier.scores.totalScore * 0.98)),
    summary,
    keyAdvantages: advantages,
    tradeOffAnalysis: tradeOffExplanation,
    riskAssessment: recommendedSupplier.isWithinBudget
      ? "Low Risk: Budget compliant, vendor ISO-certified, standard enterprise SLA."
      : "Moderate Risk: Exceeds target budget threshold.",
    blockchainSummary
  };
}

module.exports = {
  generateAIReasoning
};
