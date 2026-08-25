import { NextResponse } from 'next/server';
import { DEMO_SUPPLIER_CATALOG } from '@/lib/services/suppliers';

export async function GET() {
  return NextResponse.json({
    success: true,
    count: DEMO_SUPPLIER_CATALOG.length,
    suppliers: DEMO_SUPPLIER_CATALOG,
  });
}
