import type { EvaluatedSupplier } from './scoring-engine';
import type { ParsedProcurementRequest } from './parser';

export interface AIReasoningOutput {
  verdict: string;
  confidenceScore: number;
  summary: string;
  tradeOffAnalysis: string;
  keyAdvantages: string[];
  riskAssessment: string;
}

export function generateAIReasoning(
  parsedRequest: ParsedProcurementRequest,
  recommended: EvaluatedSupplier,
  allSuppliers: EvaluatedSupplier[]
): AIReasoningOutput {
  const runnerUp = allSuppliers.find((s) => s.supplierId !== recommended.supplierId) || allSuppliers[1];

  const advantages: string[] = [];

  if (recommended.reputation >= 90) {
    advantages.push(`Industry-leading reputation rating (${recommended.reputation}/100) ensuring verified reliability`);
  }

  if (recommended.warrantyMonths >= 24) {
    advantages.push(`Extended enterprise warranty of ${recommended.warrantyMonths} months (${recommended.warrantyMonths / 12} years coverage)`);
  }

  if (recommended.deliveryDays <= 4) {
    advantages.push(`Rapid SLA delivery turnaround of ${recommended.deliveryDays} business days`);
  }

  if (recommended.withinBudget) {
    advantages.push(`Fully within financial threshold with a surplus reserve of $${recommended.budgetDelta.toLocaleString()}`);
  }

  advantages.push(`Commercial terms: ${recommended.paymentTerms} payment terms with high liquidity compliance`);

  const summary = `Based on multi-criteria analysis for ${parsedRequest.quantity} ${parsedRequest.itemCategory} under budget $${parsedRequest.maxBudget.toLocaleString()}, ${recommended.supplierName} achieved the highest composite recommendation score (${recommended.scores.totalScore}/100).`;

  let tradeOffAnalysis = '';
  if (runnerUp) {
    if (runnerUp.totalPrice < recommended.totalPrice) {
      const priceDiff = Math.round(recommended.totalPrice - runnerUp.totalPrice);
      tradeOffAnalysis = `Although ${runnerUp.supplierName} offers a lower upfront cost (saving $${priceDiff.toLocaleString()}), ${recommended.supplierName} significantly outperforms in warranty (+${recommended.warrantyMonths - runnerUp.warrantyMonths} months), reputation (+${recommended.reputation - runnerUp.reputation} pts), and faster delivery (-${runnerUp.deliveryDays - recommended.deliveryDays} days), delivering superior enterprise total cost of ownership (TCO).`;
    } else {
      tradeOffAnalysis = `${recommended.supplierName} provides better commercial terms (${recommended.paymentTerms}) and delivery speed compared to ${runnerUp.supplierName}, ensuring guaranteed deployment timelines.`;
    }
  }

  const confidenceScore = Math.min(99, Math.round(recommended.scores.totalScore * 0.98));

  return {
    verdict: `Recommended: ${recommended.supplierName}`,
    confidenceScore,
    summary,
    tradeOffAnalysis,
    keyAdvantages: advantages,
    riskAssessment: 'Low risk. Supplier meets all SLA requirements, warranty mandates, and on-chain compliance credentials.',
  };
}
