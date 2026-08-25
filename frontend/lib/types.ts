export type ProcurementStatus = 'approved' | 'pending' | 'rejected';

export interface Supplier {
  id: string;
  name: string;
  cost: number;
  deliveryDays: number;
  reputation: number;
  warrantyYears: number;
  paymentTerms: string;
  score: number;
  recommended: boolean;
  supplierHash?: string;
}

export interface ProcurementRequest {
  id: string;
  prompt: string;
  budget?: number;
  quantity?: number;
  item?: string;
  procurementIdBytes32?: string;
}

export interface ProcurementRecommendation {
  request: ProcurementRequest;
  recommendedSupplier: Supplier;
  suppliers: Supplier[];
  reasoning: string;
  createdAt: string;
  procurementIdBytes32?: string;
  contractCallData?: {
    targetContract: string;
    chainId: number;
    functionName: string;
    params: {
      procurementId: string;
      supplierHash: string;
      amount: number;
    };
  };
}

export interface ProcurementRecord {
  id: string;
  request: string;
  supplier: string;
  amount: number;
  status: ProcurementStatus;
  date: string;
  txHash?: string;
  explorerUrl?: string;
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  chainId: string | null;
}
