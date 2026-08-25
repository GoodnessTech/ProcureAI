import { NextResponse } from 'next/server';
import { DEMO_HISTORY } from '@/lib/mock-data';

// In-memory persistent history during session / serverless lifetime
const sessionHistory: any[] = [
  {
    procurementId: 'PROC-2026-08-01',
    rawRequest: 'Buy 50 Dell XPS Laptops with 3-year warranty',
    quantity: 50,
    maxBudget: 35000,
    itemCategory: 'Laptops',
    recommendedSupplier: {
      name: 'TechSource Enterprise',
      totalPrice: 28500,
    },
    status: 'APPROVED_ON_CHAIN',
    createdAt: '2026-08-20T10:30:00Z',
    onChainApproval: {
      txHash: '0xb1aebda5ac17d992438141f5c756b87361d5184ac0b2753a0c2911a21fbd5018',
      explorerUrl: 'https://scan.botchain.ai/tx/0xb1aebda5ac17d992438141f5c756b87361d5184ac0b2753a0c2911a21fbd5018',
    },
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    count: sessionHistory.length,
    history: sessionHistory,
  });
}
