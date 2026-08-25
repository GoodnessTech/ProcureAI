import { NextResponse } from 'next/server';
import { parseProcurementRequest } from '@/lib/services/parser';
import { evaluateSuppliers } from '@/lib/services/scoring-engine';
import { generateAIReasoning } from '@/lib/services/ai-reasoning';
import { keccak256String } from '@/lib/services/crypto-helper';
import { CONTRACT_ADDRESS, BOT_CHAIN_NETWORK } from '@/lib/contract-config';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { procurementRequest } = body;

    if (!procurementRequest) {
      return NextResponse.json(
        { success: false, error: 'Missing procurementRequest in request body.' },
        { status: 400 }
      );
    }

    const parsedRequirements = parseProcurementRequest(procurementRequest);
    const { recommendedSupplier, allEvaluations } = evaluateSuppliers(parsedRequirements);
    const aiReasoning = generateAIReasoning(parsedRequirements, recommendedSupplier, allEvaluations);

    const procurementId = `PROC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const procurementIdBytes32 = keccak256String(procurementId);

    const contractCallData = {
      targetContract: CONTRACT_ADDRESS,
      chainId: BOT_CHAIN_NETWORK.chainId,
      functionName: 'approveProcurement',
      params: {
        procurementId: procurementIdBytes32,
        supplierHash: recommendedSupplier.supplierHash,
        amount: Math.round(recommendedSupplier.totalPrice),
      },
    };

    return NextResponse.json({
      success: true,
      procurementId,
      procurementIdBytes32,
      parsedRequirements,
      recommendedSupplier,
      supplierScore: recommendedSupplier.scores.totalScore,
      comparisonResults: allEvaluations,
      aiReasoning,
      contractCallData,
      network: BOT_CHAIN_NETWORK,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
