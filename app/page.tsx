'use client';

import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Search,
  CheckCircle2,
  Shield,
  Brain,
  Eye,
  Boxes,
  Link2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { HeroVisual } from '@/components/landing/hero-visual';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Logo />
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              How It Works
            </a>
            <a
              href="#why"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Why ProcureAI
            </a>
          </nav>
          <Link href="/dashboard">
            <Button className="transition-transform hover:scale-95 active:scale-90">
              Launch Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:py-28">
          <div className="flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              AI PROCUREMENT AGENT
            </div>
            <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Stop comparing suppliers. Start making better buying decisions.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
              ProcureAI analyzes approved suppliers across price, delivery,
              reputation, warranty, and commercial terms — then recommends the
              best option for your business.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="w-full gap-2 transition-transform hover:scale-95 active:scale-90 sm:w-auto"
                >
                  Launch Dashboard
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href="#how-it-works">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full transition-transform hover:scale-95 active:scale-90 sm:w-auto"
                >
                  How It Works
                </Button>
              </a>
            </div>
            <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-success" />
                No setup required
              </div>
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-success" />
                On-chain verification
              </div>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative hidden h-[500px] lg:block">
            <HeroVisual />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-t bg-secondary/30">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
          <div className="mb-14 text-center">
            <Badge variant="outline" className="mb-3">
              HOW IT WORKS
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Three steps to smarter procurement
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                num: '01',
                icon: Search,
                title: 'Tell ProcureAI what you need',
                desc: 'Submit a natural-language request like "Buy 50 laptops under $30,000." No forms, no spreadsheets.',
              },
              {
                num: '02',
                icon: Brain,
                title: 'AI evaluates suppliers',
                desc: 'ProcureAI compares price, delivery, reputation, warranty, and commercial terms across approved suppliers.',
              },
              {
                num: '03',
                icon: CheckCircle2,
                title: 'Approve with confidence',
                desc: 'Review the AI recommendation and approve the procurement decision. A verification record is created on BOT Chain.',
              },
            ].map((step, i) => (
              <div
                key={step.num}
                className="animate-slide-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="text-sm font-semibold text-muted-foreground">
                    {step.num}
                  </span>
                </div>
                <h3 className="mb-2 text-xl font-semibold">{step.title}</h3>
                <p className="leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why ProcureAI */}
      <section id="why" className="border-t">
        <div className="mx-auto max-w-6xl px-6 py-20 lg:py-24">
          <div className="mb-14 text-center">
            <Badge variant="outline" className="mb-3">
              WHY PROCUREAI
            </Badge>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Built for better buying decisions
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Boxes,
                title: 'AI Supplier Analysis',
                desc: 'Automatically evaluate multiple suppliers using business-relevant criteria.',
              },
              {
                icon: Eye,
                title: 'Transparent Decisions',
                desc: 'Understand exactly why one supplier was recommended over another.',
              },
              {
                icon: Link2,
                title: 'On-Chain Verification',
                desc: 'Approved procurement decisions can be recorded and verified on BOT Chain.',
              },
            ].map((card, i) => (
              <Card
                key={card.title}
                className="animate-slide-up border-border/60 shadow-sm transition-shadow hover:shadow-md"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10">
                    <card.icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{card.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {card.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-primary">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center lg:py-24">
          <h2 className="mb-4 text-3xl font-semibold tracking-tight text-primary-foreground sm:text-4xl">
            Ready to make better buying decisions?
          </h2>
          <p className="mb-8 text-lg text-primary-foreground/70">
            Launch the ProcureAI dashboard and submit your first procurement
            request in seconds.
          </p>
          <Link href="/dashboard">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 transition-transform hover:scale-95 active:scale-90"
            >
              Launch Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex flex-col items-center gap-3 sm:items-start">
              <Logo />
              <p className="max-w-xs text-sm text-muted-foreground">
                AI-powered procurement intelligence built on BOT Chain.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-sm font-medium shadow-sm">
              <Shield className="h-4 w-4 text-accent" />
              Built on BOT Chain
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
