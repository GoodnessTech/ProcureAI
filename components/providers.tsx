'use client';

import React, { type ReactNode } from 'react';
import { WalletProvider } from '@/contexts/wallet-context';
import { ProcurementProvider } from '@/contexts/procurement-context';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WalletProvider>
      <ProcurementProvider>{children}</ProcurementProvider>
    </WalletProvider>
  );
}
