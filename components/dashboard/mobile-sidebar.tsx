'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, FilePlus2, History, Shield, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/logo';
import { useWallet } from '@/contexts/wallet-context';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/new', label: 'New Request', icon: FilePlus2 },
  { href: '/dashboard/history', label: 'Procurement History', icon: History },
];

export function MobileSidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { connected, shortAddress } = useWallet();

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed left-4 top-3 z-50 lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col bg-sidebar text-sidebar-foreground">
            <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-6">
              <Logo
                textClassName="text-sidebar-foreground"
                iconClassName="bg-accent"
              />
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5 text-sidebar-muted" />
              </button>
            </div>
            <nav className="flex flex-1 flex-col gap-1 p-4">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-sidebar-border text-sidebar-foreground'
                        : 'text-sidebar-muted hover:bg-sidebar-border/50 hover:text-sidebar-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-sidebar-border p-4">
              <div className="flex items-center gap-2 rounded-lg bg-sidebar-border/50 px-3 py-2.5">
                <Shield className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium">BOT Chain</span>
              </div>
              <div className="mt-3 flex items-center gap-2 px-3">
                <div
                  className={cn(
                    'h-2 w-2 rounded-full',
                    connected ? 'bg-success' : 'bg-muted-foreground/40'
                  )}
                />
                <span className="text-xs text-sidebar-muted">
                  {connected
                    ? `Connected: ${shortAddress}`
                    : 'Wallet not connected'}
                </span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
