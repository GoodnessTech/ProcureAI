'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { WalletState } from '@/lib/types';
import {
  connectWallet as connectWalletApi,
  disconnectWallet as disconnectWalletApi,
  shortenAddress,
} from '@/lib/wallet-service';

interface WalletContextValue extends WalletState {
  connecting: boolean;
  shortAddress: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<WalletState>({
    connected: false,
    address: null,
    chainId: null,
  });
  const [connecting, setConnecting] = useState(false);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      const wallet = await connectWalletApi();
      setState(wallet);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    const wallet = await disconnectWalletApi();
    setState(wallet);
  }, []);

  const value: WalletContextValue = {
    ...state,
    connecting,
    shortAddress: state.address ? shortenAddress(state.address) : null,
    connect,
    disconnect,
  };

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
