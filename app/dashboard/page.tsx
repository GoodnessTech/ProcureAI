'use client';

import { Header } from '@/components/dashboard/header';
import { ProcurementInput } from '@/components/dashboard/procurement-input';
import { AnalysisLoader } from '@/components/dashboard/analysis-loader';
import { RecommendationView } from '@/components/dashboard/recommendation-view';
import { useProcurement } from '@/contexts/procurement-context';

export default function DashboardHome() {
  const { phase } = useProcurement();

  return (
    <>
      <Header title="Dashboard" />
      <main className="p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          {phase === 'analyzing' ? (
            <AnalysisLoader />
          ) : phase === 'result' ||
            phase === 'approved' ||
            phase === 'rejected' ? (
            <RecommendationView />
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-semibold tracking-tight">
                  Good morning. What does your company need?
                </h2>
                <p className="mt-1 text-muted-foreground">
                  Describe your procurement request and let ProcureAI find the
                  best supplier.
                </p>
              </div>
              <ProcurementInput />
            </>
          )}
        </div>
      </main>
    </>
  );
}
