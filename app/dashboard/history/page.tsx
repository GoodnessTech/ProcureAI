'use client';

import { useState } from 'react';
import { ExternalLink, Shield } from 'lucide-react';
import { Header } from '@/components/dashboard/header';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useProcurement } from '@/contexts/procurement-context';
import {
  getProcurementStatusBadge,
  formatCurrency,
} from '@/lib/procurement-service';
import type { ProcurementRecord } from '@/lib/types';

export default function HistoryPage() {
  const { history } = useProcurement();
  const [selected, setSelected] = useState<ProcurementRecord | null>(null);

  return (
    <>
      <Header title="Procurement History" />
      <main className="p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold tracking-tight">
              Procurement History
            </h2>
            <p className="mt-1 text-muted-foreground">
              All your procurement requests and their current status.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/30">
                  <TableHead>Request</TableHead>
                  <TableHead>Recommended Supplier</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((record) => {
                  const badge = getProcurementStatusBadge(record.status);
                  return (
                    <TableRow
                      key={record.id}
                      onClick={() => setSelected(record)}
                      className="cursor-pointer"
                    >
                      <TableCell className="font-medium">
                        {record.request}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.supplier}
                      </TableCell>
                      <TableCell>{formatCurrency(record.amount)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={badge.className}
                        >
                          {badge.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {record.date}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      {/* Detail Modal */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Procurement Details</DialogTitle>
                <DialogDescription>
                  {selected.id}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                <DetailRow label="Request" value={selected.request} />
                <DetailRow
                  label="Recommended Supplier"
                  value={selected.supplier}
                />
                <DetailRow
                  label="Amount"
                  value={formatCurrency(selected.amount)}
                />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge
                    variant="outline"
                    className={getProcurementStatusBadge(selected.status).className}
                  >
                    {getProcurementStatusBadge(selected.status).label}
                  </Badge>
                </div>
                <DetailRow label="Date" value={selected.date} />
              </div>

              {selected.txHash && (
                <div className="space-y-2 rounded-lg border border-accent/20 bg-accent/5 p-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">
                      Verified on BOT Chain
                    </span>
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {selected.txHash.slice(0, 20)}...
                    {selected.txHash.slice(-12)}
                  </div>
                  <a
                    href={`https://scan.botchain.ai/tx/${selected.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-1 gap-2 transition-transform hover:scale-95 active:scale-90"
                    >
                      View Transaction
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </a>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSelected(null)}
                  className="transition-transform hover:scale-95 active:scale-90"
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
