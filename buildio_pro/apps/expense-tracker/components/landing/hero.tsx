import { Button } from "@workspace/ui/components/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section>
      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-20 text-center md:py-28 gap-10">
        <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
          Know where your <span className="bg-clip-text">money goes.</span>
        </h1>

        <p className="max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Expense Tracker is a calm, beautiful ledger. Log expenses in seconds,
          keep budgets honest, and let the numbers quietly add up.
        </p>

        <div className="flex flex-col items-center gap-3 sm:flex-row">
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
