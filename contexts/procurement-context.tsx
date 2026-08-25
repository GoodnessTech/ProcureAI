'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  ProcurementRecommendation,
  ProcurementRecord,
  ProcurementStatus,
} from '@/lib/types';
import {
  analyzeProcurementRequest,
  approveProcurement,
  rejectProcurement,
  getProcurementHistory,
} from '@/lib/procurement-service';
import { useWallet } from './wallet-context';

type AnalysisPhase = 'idle' | 'analyzing' | 'result' | 'approved' | 'rejected';

interface ProcurementContextValue {
  phase: AnalysisPhase;
  isAnalyzing: boolean;
  isApproving: boolean;
  currentStep: number;
  recommendation: ProcurementRecommendation | null;
  approvedTxHash: string | null;
  history: ProcurementRecord[];
  submitRequest: (prompt: string) => Promise<void>;
  approve: () => Promise<void>;
  reject: () => Promise<void>;
  reset: () => void;
}

const ProcurementContext = createContext<ProcurementContextValue | undefined>(
  undefined
);

export function ProcurementProvider({ children }: { children: ReactNode }) {
  const { address } = useWallet();
  const [phase, setPhase] = useState<AnalysisPhase>('idle');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [recommendation, setRecommendation] =
    useState<ProcurementRecommendation | null>(null);
  const [approvedTxHash, setApprovedTxHash] = useState<string | null>(null);
  const [history, setHistory] = useState<ProcurementRecord[]>(
    getProcurementHistory()
  );

  const submitRequest = useCallback(async (prompt: string) => {
    setIsAnalyzing(true);
    setPhase('analyzing');
    setCurrentStep(0);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 600);

    try {
      const result = await analyzeProcurementRequest(prompt);
      clearInterval(stepInterval);
      setCurrentStep(4);
      setRecommendation(result);
      await new Promise((resolve) => setTimeout(resolve, 400));
      setPhase('result');
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const approve = useCallback(async () => {
    if (!recommendation) return;
    setIsApproving(true);
    try {
      const { txHash, record } = await approveProcurement(
        recommendation,
        address
      );
      setApprovedTxHash(txHash);
      setHistory((prev) => [record, ...prev]);
      setPhase('approved');
    } finally {
      setIsApproving(false);
    }
  }, [recommendation, address]);

  const reject = useCallback(async () => {
    if (!recommendation) return;
    const record = await rejectProcurement(recommendation);
    setHistory((prev) =>
      prev.map((r) =>
        r.id === record.id ? { ...record, status: 'rejected' as ProcurementStatus } : r
      )
    );
    setPhase('rejected');
  }, [recommendation]);

  const reset = useCallback(() => {
    setPhase('idle');
    setRecommendation(null);
    setApprovedTxHash(null);
    setCurrentStep(0);
  }, []);

  const value: ProcurementContextValue = {
    phase,
    isAnalyzing,
    isApproving,
    currentStep,
    recommendation,
    approvedTxHash,
    history,
    submitRequest,
    approve,
    reject,
    reset,
  };

  return (
    <ProcurementContext.Provider value={value}>
      {children}
    </ProcurementContext.Provider>
  );
}

export function useProcurement() {
  const ctx = useContext(ProcurementContext);
  if (!ctx)
    throw new Error('useProcurement must be used within ProcurementProvider');
  return ctx;
}
