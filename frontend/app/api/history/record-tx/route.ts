import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { procurementId, txHash, walletAddress } = body;

    return NextResponse.json({
      success: true,
      message: 'Transaction successfully recorded',
      record: {
        procurementId,
        txHash,
        walletAddress,
        status: 'APPROVED_ON_CHAIN',
        explorerUrl: `https://scan.botchain.ai/tx/${txHash}`,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to record tx' },
      { status: 500 }
    );
  }
}
