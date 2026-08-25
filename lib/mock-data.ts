import type { Supplier, ProcurementRecord } from './types';

export const EXAMPLE_CHIPS = [
  '50 laptops under $30,000',
  'Office chairs for 100 employees',
  '20 monitors under $8,000',
];

export const ANALYSIS_STEPS = [
  { id: 1, label: 'Understanding requirements' },
  { id: 2, label: 'Checking approved suppliers' },
  { id: 3, label: 'Comparing commercial terms' },
  { id: 4, label: 'Ranking procurement options' },
];

export const DEMO_SUPPLIERS: Supplier[] = [
  {
    id: 'techsource',
    name: 'TechSource Enterprise',
    cost: 28750,
    deliveryDays: 7,
    reputation: 4.8,
    warrantyYears: 3,
    paymentTerms: 'Net 30',
    score: 94,
    recommended: true,
  },
  {
    id: 'globaltech',
    name: 'GlobalTech Supplies',
    cost: 27900,
    deliveryDays: 14,
    reputation: 4.5,
    warrantyYears: 2,
    paymentTerms: 'Net 45',
    score: 88,
    recommended: false,
  },
  {
    id: 'businesshw',
    name: 'Business Hardware Co.',
    cost: 29500,
    deliveryDays: 5,
    reputation: 4.7,
    warrantyYears: 1,
    paymentTerms: 'Net 15',
    score: 85,
    recommended: false,
  },
];

export const DEMO_REASONING =
  'TechSource Enterprise offers the strongest overall balance of price, delivery speed, supplier reputation, and warranty coverage while remaining $1,250 below your maximum budget.';

export const DEMO_HISTORY: ProcurementRecord[] = [
  {
    id: 'PRC-2024-0042',
    request: 'Buy 50 laptops under $30,000',
    supplier: 'TechSource Enterprise',
    amount: 28750,
    status: 'approved',
    date: '2024-08-22',
    txHash: '0x7a3f9b2c4e8d1a6f5c3b9e2d7a4f1c8b6e3d9a2f5c7b4e1d8a3f6c9b2e5d7a1f',
  },
  {
    id: 'PRC-2024-0041',
    request: 'Office chairs for 100 employees',
    supplier: 'ErgoSpace Solutions',
    amount: 42000,
    status: 'pending',
    date: '2024-08-20',
  },
  {
    id: 'PRC-2024-0040',
    request: '20 monitors under $8,000',
    supplier: 'DisplayPro Inc.',
    amount: 7600,
    status: 'rejected',
    date: '2024-08-18',
  },
];

export const BOT_CHAIN_EXPLORER_URL = 'https://scan.botchain.ai/tx/';
