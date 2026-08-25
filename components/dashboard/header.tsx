'use client';

import { useState } from 'react';
import { Wallet, Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWallet } from '@/contexts/wallet-context';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { connected, connecting, shortAddress, connect, disconnect } =
    useWallet();

  if (!connected) {
    return (
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md">
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        <Button
          onClick={connect}
          disabled={connecting}
          className="gap-2 transition-transform hover:scale-95 active:scale-90"
        >
          {connecting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Wallet className="h-4 w-4" />
          )}
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-md">
      <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 transition-transform hover:scale-95 active:scale-90"
          >
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="font-mono text-sm">{shortAddress}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <p className="text-xs text-muted-foreground">Connected wallet</p>
            <p className="font-mono text-sm">{shortAddress}</p>
          </div>
          <DropdownMenuItem
            onClick={disconnect}
            className="gap-2 text-destructive focus:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
