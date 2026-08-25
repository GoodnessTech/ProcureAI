import { keccak256String } from './crypto-helper';

export interface SupplierProfile {
  id: string;
  name: string;
  supplierHash: string;
  baseUnitPrice: number;
  bulkDiscountThreshold: number;
  bulkDiscountPercent: number;
  deliveryDays: number;
  reputation: number; // 0 to 100
  warrantyMonths: number;
  paymentTerms: string; // e.g. "Net 30", "Net 60"
  paymentTermsScore: number; // 0 to 100
  reliabilityScore: number;
}

export const DEMO_SUPPLIER_CATALOG: SupplierProfile[] = [
  {
    id: 'supp_techsource',
    name: 'TechSource Enterprise',
    supplierHash: keccak256String('TechSource Enterprise'),
    baseUnitPrice: 600,
    bulkDiscountThreshold: 30,
    bulkDiscountPercent: 5,
    deliveryDays: 3,
    reputation: 98,
    warrantyMonths: 36,
    paymentTerms: 'Net 60',
    paymentTermsScore: 95,
    reliabilityScore: 99,
  },
  {
    id: 'supp_globaltech',
    name: 'GlobalTech Supplies',
    supplierHash: keccak256String('GlobalTech Supplies'),
    baseUnitPrice: 550,
    bulkDiscountThreshold: 50,
    bulkDiscountPercent: 8,
    deliveryDays: 7,
    reputation: 84,
    warrantyMonths: 12,
    paymentTerms: 'Net 30',
    paymentTermsScore: 80,
    reliabilityScore: 86,
  },
  {
    id: 'supp_primeprocure',
    name: 'PrimeProcure Direct',
    supplierHash: keccak256String('PrimeProcure Direct'),
    baseUnitPrice: 580,
    bulkDiscountThreshold: 25,
    bulkDiscountPercent: 4,
    deliveryDays: 4,
    reputation: 92,
    warrantyMonths: 24,
    paymentTerms: 'Net 45',
    paymentTermsScore: 88,
    reliabilityScore: 94,
  },
];
