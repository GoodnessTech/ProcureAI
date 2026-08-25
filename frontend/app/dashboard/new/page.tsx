'use client';

import { Header } from '@/components/dashboard/header';
import { ProcurementInput } from '@/components/dashboard/procurement-input';
import { AnalysisLoader } from '@/components/dashboard/analysis-loader';
import { RecommendationView } from '@/components/dashboard/recommendation-view';
import { useProcurement } from '@/contexts/procurement-context';

export default function NewRequestPage() {
  const { phase } = useProcurement();

  return (
    <>
      <Header title="New Request" />
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
                  New Procurement Request
                </h2>
                <p className="mt-1 text-muted-foreground">
                  Tell ProcureAI what your company needs to buy.
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
