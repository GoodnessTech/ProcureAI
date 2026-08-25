'use client';

import { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { EXAMPLE_CHIPS } from '@/lib/mock-data';
import { useProcurement } from '@/contexts/procurement-context';

export function ProcurementInput() {
  const [prompt, setPrompt] = useState('');
  const { submitRequest, isAnalyzing } = useProcurement();

  const handleSubmit = () => {
    if (!prompt.trim() || isAnalyzing) return;
    submitRequest(prompt);
  };

  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="p-6 lg:p-8">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent" />
          <h2 className="text-lg font-semibold">What does your company need?</h2>
        </div>
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Example: Buy 50 laptops under $30,000. Delivery required within 14 days."
          className="min-h-[120px] resize-none border-border/60 text-base"
          disabled={isAnalyzing}
        />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-foreground">Try:</span>
          {EXAMPLE_CHIPS.map((chip) => (
            <button
              key={chip}
              onClick={() => setPrompt(chip)}
              disabled={isAnalyzing}
              className="rounded-full border bg-secondary/50 px-3 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary hover:scale-95 active:scale-90 disabled:opacity-50"
            >
              {chip}
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!prompt.trim() || isAnalyzing}
            className="gap-2 transition-transform hover:scale-95 active:scale-90"
          >
            Analyze Request
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
