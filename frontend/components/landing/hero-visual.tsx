'use client';

import { Check, Star, TrendingUp, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function HeroVisual() {
  return (
    <div className="relative h-full w-full min-h-[480px]">
      {/* Background grid */}
      <div className="absolute inset-0 rounded-2xl bg-grid opacity-40" />

      {/* Main supplier recommendation card */}
      <div className="absolute left-4 top-6 w-[280px] rounded-xl border bg-card p-4 shadow-lg animate-slide-up stagger-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Recommended Supplier
          </span>
          <Badge className="bg-accent text-accent-foreground">BEST MATCH</Badge>
        </div>
        <div className="mt-3 text-base font-semibold">
          TechSource Enterprise
        </div>
        <div className="mt-3 space-y-2">
          {[
            { label: 'Total Cost', value: '$28,750' },
            { label: 'Delivery', value: '7 days' },
            { label: 'Reputation', value: '4.8 / 5' },
          ].map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-medium">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* AI Score card */}
      <div className="absolute right-2 top-32 w-[200px] rounded-xl border bg-card p-4 shadow-lg animate-slide-up stagger-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
            <TrendingUp className="h-4 w-4 text-accent" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            AI Score
          </span>
        </div>
        <div className="mt-2 flex items-end gap-1">
          <span className="text-3xl font-bold tracking-tight">94</span>
          <span className="mb-1 text-sm text-muted-foreground">/ 100</span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-[94%] rounded-full bg-accent" />
        </div>
      </div>

      {/* Comparison row card */}
      <div className="absolute bottom-6 left-8 w-[300px] rounded-xl border bg-card p-4 shadow-lg animate-slide-up stagger-3">
        <div className="mb-3 text-xs font-medium text-muted-foreground">
          Supplier Comparison
        </div>
        <div className="space-y-2.5">
          {[
            { name: 'TechSource Enterprise', score: 94, recommended: true },
            { name: 'GlobalTech Supplies', score: 88, recommended: false },
            { name: 'Business Hardware Co.', score: 85, recommended: false },
          ].map((s) => (
            <div key={s.name} className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center rounded-full border-2">
                {s.recommended && (
                  <Check className="h-3 w-3 text-accent" strokeWidth={3} />
                )}
              </div>
              <span className="flex-1 text-xs font-medium">{s.name}</span>
              <span className="text-xs font-semibold text-muted-foreground">
                {s.score}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Verification badge */}
      <div className="absolute right-6 bottom-20 flex items-center gap-2 rounded-full border bg-card px-3 py-2 shadow-lg animate-fade-in-scale stagger-4">
        <Shield className="h-4 w-4 text-success" />
        <span className="text-xs font-medium">Verified on BOT Chain</span>
      </div>

      {/* Floating star */}
      <div className="absolute right-12 top-8 flex items-center gap-1 rounded-full border bg-card px-2.5 py-1 shadow-md animate-float">
        <Star className="h-3 w-3 fill-warning text-warning" />
        <span className="text-xs font-semibold">4.8</span>
      </div>
    </div>
  );
}
