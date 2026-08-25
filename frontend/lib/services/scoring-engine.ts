import { DEMO_SUPPLIER_CATALOG, type SupplierProfile } from './suppliers';
import type { ParsedProcurementRequest } from './parser';

export interface EvaluatedSupplier {
  supplierId: string;
  supplierName: string;
  supplierHash: string;
  unitPrice: number;
  totalPrice: number;
  deliveryDays: number;
  reputation: number;
  warrantyMonths: number;
  paymentTerms: string;
  scores: {
    priceScore: number;
    deliveryScore: number;
    reputationScore: number;
    warrantyScore: number;
    termsScore: number;
    totalScore: number;
  };
  withinBudget: boolean;
  budgetDelta: number;
}

export interface ScoringWeights {
  price: number;
  delivery: number;
  reputation: number;
  warranty: number;
  paymentTerms: number;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  price: 0.35,
  delivery: 0.20,
  reputation: 0.20,
  warranty: 0.15,
  paymentTerms: 0.10,
};

export function evaluateSuppliers(
  parsedRequest: ParsedProcurementRequest,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
  suppliers: SupplierProfile[] = DEMO_SUPPLIER_CATALOG
): { recommendedSupplier: EvaluatedSupplier; allEvaluations: EvaluatedSupplier[] } {
  const { quantity, maxBudget } = parsedRequest;

  // 1. Calculate pricing for all suppliers
  const rawEvaluations = suppliers.map((supplier) => {
    let effectiveUnitPrice = supplier.baseUnitPrice;
    if (quantity >= supplier.bulkDiscountThreshold) {
      effectiveUnitPrice =
        supplier.baseUnitPrice * (1 - supplier.bulkDiscountPercent / 100);
    }
    const totalPrice = effectiveUnitPrice * quantity;
    const withinBudget = totalPrice <= maxBudget;
    const budgetDelta = maxBudget - totalPrice;

    return {
      supplier,
      effectiveUnitPrice,
      totalPrice,
      withinBudget,
      budgetDelta,
    };
  });

  // 2. Identify min/max boundaries for normalized scoring
  const prices = rawEvaluations.map((e) => e.totalPrice);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const deliveries = rawEvaluations.map((e) => e.supplier.deliveryDays);
  const minDelivery = Math.min(...deliveries);
  const maxDelivery = Math.max(...deliveries);

  const warranties = rawEvaluations.map((e) => e.supplier.warrantyMonths);
  const minWarranty = Math.min(...warranties);
  const maxWarranty = Math.max(...warranties);

  // 3. Compute normalized scores (0 to 100)
  const evaluatedList: EvaluatedSupplier[] = rawEvaluations.map((item) => {
    const s = item.supplier;

    // Price Score (Cheaper is higher score)
    let priceScore = 100;
    if (maxPrice !== minPrice) {
      priceScore = 70 + 30 * ((maxPrice - item.totalPrice) / (maxPrice - minPrice));
    }
    if (!item.withinBudget) {
      priceScore = Math.max(0, priceScore - 40);
    }

    // Delivery Score (Faster is higher score)
    let deliveryScore = 100;
    if (maxDelivery !== minDelivery) {
      deliveryScore = 70 + 30 * ((maxDelivery - s.deliveryDays) / (maxDelivery - minDelivery));
    }

    // Reputation Score
    const reputationScore = s.reputation;

    // Warranty Score (Longer warranty is higher score)
    let warrantyScore = 100;
    if (maxWarranty !== minWarranty) {
      warrantyScore = 60 + 40 * ((s.warrantyMonths - minWarranty) / (maxWarranty - minWarranty));
    }

    // Payment Terms Score
    const termsScore = s.paymentTermsScore;

    // Weighted Total Score
    const totalScore =
      priceScore * weights.price +
      deliveryScore * weights.delivery +
      reputationScore * weights.reputation +
      warrantyScore * weights.warranty +
      termsScore * weights.paymentTerms;

    return {
      supplierId: s.id,
      supplierName: s.name,
      supplierHash: s.supplierHash,
      unitPrice: Math.round(item.effectiveUnitPrice * 100) / 100,
      totalPrice: Math.round(item.totalPrice * 100) / 100,
      deliveryDays: s.deliveryDays,
      reputation: s.reputation,
      warrantyMonths: s.warrantyMonths,
      paymentTerms: s.paymentTerms,
      scores: {
        priceScore: Math.round(priceScore * 10) / 10,
        deliveryScore: Math.round(deliveryScore * 10) / 10,
        reputationScore: Math.round(reputationScore * 10) / 10,
        warrantyScore: Math.round(warrantyScore * 10) / 10,
        termsScore: Math.round(termsScore * 10) / 10,
        totalScore: Math.round(totalScore * 10) / 10,
      },
      withinBudget: item.withinBudget,
      budgetDelta: Math.round(item.budgetDelta * 100) / 100,
    };
  });

  // Sort descending by total score
  evaluatedList.sort((a, b) => b.scores.totalScore - a.scores.totalScore);

  const recommendedSupplier = evaluatedList[0];

  return {
    recommendedSupplier,
    allEvaluations: evaluatedList,
  };
}
