import Link from "next/link";

import { ArrowRight } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 size-[30rem] -translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 size-[22rem] rounded-full bg-secondary/15 blur-3xl" />
      </div>

      <div className="container mx-auto flex max-w-4xl flex-col items-center px-4 py-20 text-center md:py-28">
        <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
          Know where your{" "}
          <span className="bg-gradient-to-r from-primary via-emerald-500 to-secondary bg-clip-text text-transparent">
            money goes.
          </span>
        </h1>

        <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Expense Tracker is a calm, beautiful ledger. Log expenses in seconds,
          keep budgets honest, and let the numbers quietly add up.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link href="/login">
            <Button size="lg" className="w-full gap-2 sm:w-auto">
              Start tracking free <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link href="/demo">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Take the tour
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
