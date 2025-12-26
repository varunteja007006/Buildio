import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { ArrowRight, BarChart3, PieChart, Wallet } from "lucide-react";

export default function Page() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="container mx-auto px-4 flex flex-col items-center justify-center gap-6 py-24 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Master Your Finances <br className="hidden sm:inline" />
            <span className="text-primary">With Ease</span>
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Track expenses, set budgets, and gain insights into your spending
            habits. Take control of your financial future today.
          </p>
          <div className="flex gap-4">
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Start for Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        <section>
          <div className="mx-auto px-10">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <Wallet className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Expense Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Effortlessly log your daily expenses and categorize them to
                    see exactly where your money goes.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <BarChart3 className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Visual Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Visualize your spending patterns with intuitive charts and
                    graphs to make informed decisions.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <PieChart className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Budget Planning</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground"></p>
                  Set monthly budgets for different categories and get notified
                  when you're close to the limit.
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
