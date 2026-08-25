'use client';

import { CheckCircle2, XCircle, Loader2, Wallet, Shield, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useProcurement } from '@/contexts/procurement-context';
import { useWallet } from '@/contexts/wallet-context';
import { formatCurrency, getExplorerUrl } from '@/lib/procurement-service';

export function ApprovalModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { recommendation, approve, isApproving } = useProcurement();
  const { connected, connect, connecting } = useWallet();

  if (!recommendation) return null;

  const supplier = recommendation.recommendedSupplier;

  const handleApprove = async () => {
    if (!connected) {
      await connect();
    }
    await approve();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Approve Procurement Decision?</DialogTitle>
          <DialogDescription>
            You are approving {supplier.name} as the recommended supplier.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 rounded-lg border bg-secondary/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Supplier</span>
            <span className="text-sm font-medium">{supplier.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Total procurement value
            </span>
            <span className="text-sm font-semibold">
              {formatCurrency(supplier.cost)}
            </span>
          </div>
        </div>

        {!connected && (
          <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3">
            <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
            <div className="text-sm">
              <p className="font-medium text-warning">Wallet not connected</p>
              <p className="text-muted-foreground">
                Connect your wallet to record this decision on BOT Chain.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isApproving}
            className="transition-transform hover:scale-95 active:scale-90"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isApproving || connecting}
            className="gap-2 transition-transform hover:scale-95 active:scale-90"
          >
            {isApproving || connecting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            {connecting
              ? 'Connecting...'
              : isApproving
                ? 'Approving...'
                : connected
                  ? 'Confirm Approval'
                  : 'Connect & Approve'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SuccessModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { recommendation, approvedTxHash, reset } = useProcurement();

  if (!recommendation || !approvedTxHash) return null;

  const supplier = recommendation.recommendedSupplier;
  const explorerUrl = getExplorerUrl(approvedTxHash);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center py-4 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <CheckCircle2 className="h-9 w-9 text-success" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">Procurement Approved</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Your procurement decision has been approved and recorded for
            verification on BOT Chain.
          </p>

          <div className="w-full space-y-3 rounded-lg border bg-secondary/30 p-4 text-left">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Supplier</span>
              <span className="text-sm font-medium">{supplier.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="text-sm font-semibold">
                {formatCurrency(supplier.cost)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <span className="inline-flex items-center gap-1 text-sm font-medium text-success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Approved
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-muted-foreground">Transaction</span>
              <span className="font-mono text-xs text-accent">
                {approvedTxHash.slice(0, 10)}...{approvedTxHash.slice(-6)}
              </span>
            </div>
          </div>

          <div className="mt-4 flex w-full items-center gap-2 rounded-lg border border-accent/20 bg-accent/5 p-3">
            <Shield className="h-4 w-4 shrink-0 text-accent" />
            <span className="text-xs text-muted-foreground">
              Recorded on BOT Chain for verification
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              reset();
            }}
            className="transition-transform hover:scale-95 active:scale-90"
          >
            New Request
          </Button>
          <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
            <Button className="gap-2 transition-transform hover:scale-95 active:scale-90">
              View Transaction
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RejectedState() {
  const { reset } = useProcurement();

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <XCircle className="h-9 w-9 text-destructive" />
      </div>
      <h2 className="mb-2 text-xl font-semibold">Recommendation Rejected</h2>
      <p className="mb-6 text-muted-foreground">
        You have rejected this procurement recommendation. You can submit a new
        request at any time.
      </p>
      <Button
        onClick={reset}
        className="transition-transform hover:scale-95 active:scale-90"
      >
        New Request
      </Button>
    </div>
  );
}
