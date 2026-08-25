'use client';

import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ANALYSIS_STEPS } from '@/lib/mock-data';
import { useProcurement } from '@/contexts/procurement-context';

export function AnalysisLoader() {
  const { currentStep } = useProcurement();

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative mb-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-accent/10">
          <Sparkles className="h-9 w-9 text-accent" />
        </div>
        <div className="absolute -right-1 -top-1 h-5 w-5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/40" />
          <span className="relative inline-flex h-5 w-5 rounded-full bg-accent" />
        </div>
      </div>

      <h2 className="mb-2 text-2xl font-semibold tracking-tight">
        Analyzing your procurement request
      </h2>
      <p className="mb-10 text-muted-foreground">
        ProcureAI is evaluating approved suppliers in real time.
      </p>

      <div className="w-full max-w-md space-y-4">
        {ANALYSIS_STEPS.map((step, i) => {
          const isComplete = currentStep > i;
          const isActive = currentStep === i;
          return (
            <div
              key={step.id}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-4 transition-all duration-500',
                isComplete && 'border-success/30 bg-success/5',
                isActive && 'border-accent/30 bg-accent/5',
                !isComplete && !isActive && 'border-border opacity-50'
              )}
            >
              <div className="flex h-8 w-8 items-center justify-center">
                {isComplete ? (
                  <CheckCircle2 className="h-6 w-6 text-success" />
                ) : isActive ? (
                  <Loader2 className="h-6 w-6 animate-spin text-accent" />
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30" />
                )}
              </div>
              <span
                className={cn(
                  'text-sm font-medium transition-colors',
                  isComplete && 'text-foreground',
                  isActive && 'text-foreground',
                  !isComplete && !isActive && 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
