import { NextResponse } from 'next/server';
import { CONTRACT_ADDRESS, BOT_CHAIN_NETWORK } from '@/lib/contract-config';

export async function GET() {
  return NextResponse.json({
    success: true,
    contractAddress: CONTRACT_ADDRESS,
    network: BOT_CHAIN_NETWORK,
  });
}
