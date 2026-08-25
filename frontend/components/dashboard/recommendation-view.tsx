'use client';

import {
  CheckCircle2,
  XCircle,
  Star,
  Truck,
  Shield,
  CreditCard,
  TrendingUp,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useProcurement } from '@/contexts/procurement-context';
import { formatCurrency } from '@/lib/procurement-service';
import { useState } from 'react';
import {
  ApprovalModal,
  SuccessModal,
  RejectedState,
} from '@/components/dashboard/approval-modal';

export function RecommendationView() {
  const { recommendation, phase, reject } = useProcurement();
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  if (!recommendation) return null;

  if (phase === 'rejected') {
    return <RejectedState />;
  }

  if (phase === 'approved') {
    return (
      <>
        <RecommendationContent />
        <SuccessModal open={successOpen} onOpenChange={setSuccessOpen} />
      </>
    );
  }

  return (
    <>
      <RecommendationContent
        onApprove={() => setApprovalOpen(true)}
        onReject={reject}
      />
      <ApprovalModal open={approvalOpen} onOpenChange={setApprovalOpen} />
    </>
  );
}

function RecommendationContent({
  onApprove,
  onReject,
}: {
  onApprove?: () => void;
  onReject?: () => void;
}) {
  const { recommendation, phase } = useProcurement();

  if (!recommendation) return null;

  const { recommendedSupplier, suppliers, reasoning, request } =
    recommendation;
  const isApproved = phase === 'approved';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">
          Procurement Recommendation
        </h2>
        <p className="mt-1 text-muted-foreground">
          AI analysis completed based on your procurement requirements.
        </p>
      </div>

      {/* Original request */}
      <div className="rounded-lg border bg-secondary/30 p-4">
        <span className="text-sm text-muted-foreground">Your request</span>
        <p className="mt-1 font-medium">{request.prompt}</p>
      </div>

      {/* Recommended Supplier */}
      <div>
        <h3 className="mb-3 text-lg font-semibold">Recommended Supplier</h3>
        <Card className="overflow-hidden border-accent/30 shadow-md">
          <CardContent className="p-0">
            <div className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xl font-semibold">
                      {recommendedSupplier.name}
                    </h4>
                    <Badge className="bg-accent text-accent-foreground">
                      BEST MATCH
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-3xl font-bold tracking-tight">
                      {recommendedSupplier.score}
                    </span>
                    <span className="mb-1 text-sm text-muted-foreground">
                      / 100 AI Recommendation Score
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-px border-t bg-border lg:grid-cols-5">
              <DetailItem
                icon={CreditCard}
                label="Total Cost"
                value={formatCurrency(recommendedSupplier.cost)}
              />
              <DetailItem
                icon={Truck}
                label="Delivery"
                value={`${recommendedSupplier.deliveryDays} days`}
              />
              <DetailItem
                icon={Star}
                label="Reputation"
                value={`${recommendedSupplier.reputation} / 5`}
              />
              <DetailItem
                icon={Shield}
                label="Warranty"
                value={`${recommendedSupplier.warrantyYears} years`}
              />
              <DetailItem
                icon={CreditCard}
                label="Payment Terms"
                value={recommendedSupplier.paymentTerms}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Why this supplier */}
      <div>
        <h3 className="mb-3 text-lg font-semibold">Why this supplier</h3>
        <Card className="border-border/60">
          <CardContent className="p-5">
            <p className="leading-relaxed text-muted-foreground">
              {reasoning}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Supplier Comparison */}
      <div>
        <h3 className="mb-3 text-lg font-semibold">Supplier Comparison</h3>
        <Card className="border-border/60">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left font-medium text-muted-foreground">
                      Supplier
                    </th>
                    <th className="p-4 text-left font-medium text-muted-foreground">
                      Cost
                    </th>
                    <th className="p-4 text-left font-medium text-muted-foreground">
                      Delivery
                    </th>
                    <th className="p-4 text-left font-medium text-muted-foreground">
                      Rating
                    </th>
                    <th className="p-4 text-left font-medium text-muted-foreground">
                      Warranty
                    </th>
                    <th className="p-4 text-left font-medium text-muted-foreground">
                      Score
                    </th>
                    <th className="p-4 text-left font-medium text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s) => (
                    <tr
                      key={s.id}
                      className={
                        s.recommended
                          ? 'border-b bg-accent/5 last:border-0'
                          : 'border-b last:border-0'
                      }
                    >
                      <td className="p-4 font-medium">{s.name}</td>
                      <td className="p-4">{formatCurrency(s.cost)}</td>
                      <td className="p-4">{s.deliveryDays} days</td>
                      <td className="p-4">{s.reputation} / 5</td>
                      <td className="p-4">{s.warrantyYears} years</td>
                      <td className="p-4 font-semibold">{s.score}/100</td>
                      <td className="p-4">
                        {s.recommended ? (
                          <Badge className="bg-accent text-accent-foreground">
                            Recommended
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approval Actions */}
      {!isApproved && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            onClick={onApprove}
            className="gap-2 transition-transform hover:scale-95 active:scale-90 sm:flex-1"
            size="lg"
          >
            <CheckCircle2 className="h-5 w-5" />
            Approve Procurement
          </Button>
          <Button
            onClick={onReject}
            variant="outline"
            className="gap-2 transition-transform hover:scale-95 active:scale-90 sm:flex-1"
            size="lg"
          >
            <XCircle className="h-5 w-5" />
            Reject Recommendation
          </Button>
        </div>
      )}
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-card p-4">
      <div className="mb-1.5 flex items-center gap-1.5 text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs">{label}</span>
      </div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
