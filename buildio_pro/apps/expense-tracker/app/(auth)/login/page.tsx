import Link from "next/link";
import { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  ArrowLeft,
  ArrowUpRight,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";

import { appConfig } from "@/app/appConfig";

import { Donut } from "@/components/landing/donut";
import { ModeToggle } from "@/components/mode-toggle";
import { GoogleLoginBtn } from "@/components/organisms/auth/google-login-btn";
import { getAuthSession } from "@/lib/auth-server";

const DONUT_LABELS = [
  { label: "Food", color: "var(--chart-1)", value: "$312" },
  { label: "Transport", color: "var(--chart-2)", value: "$188" },
  { label: "Rent", color: "var(--chart-3)", value: "$850" },
  { label: "Fun", color: "var(--chart-4)", value: "$120" },
];

function LoginPanel() {
  return (
    <aside className="relative hidden overflow-hidden lg:flex lg:w-[45%] lg:flex-col lg:justify-between">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[oklch(0.34_0.10_150)] via-[oklch(0.28_0.08_260)] to-[oklch(0.20_0.05_285)]" />
      <div className="pointer-events-none absolute -left-24 -top-24 size-96 animate-drift rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 size-[28rem] animate-drift-slow rounded-full bg-white/10 blur-3xl" />

      <div className="relative flex flex-1 flex-col justify-center px-12 xl:px-16">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">
          Sign in to your ledger
        </p>
        <h2 className="mt-4 max-w-md text-4xl font-extrabold leading-tight tracking-tight text-white xl:text-5xl">
          Money in, money out.{" "}
          <span className="bg-gradient-to-r from-emerald-300 to-sky-300 bg-clip-text text-transparent">
            Know both.
          </span>
        </h2>
        <p className="mt-4 max-w-sm text-base leading-relaxed text-white/70">
          One quiet place for every rupee you spend, save, and plan — with
          insights that actually feel like help.
        </p>

        <div className="mt-12 flex items-center gap-8">
          <Donut />
          <div className="space-y-2.5">
            {DONUT_LABELS.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-6 text-sm"
              >
                <span className="flex items-center gap-2 text-white/80">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.label}
                </span>
                <span className="font-bold text-white">{item.value}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-emerald-300">
              <ArrowUpRight className="size-3.5" />
              You saved 32% this month
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex items-center gap-3 px-12 pb-10 xl:px-16">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-emerald-300">
          <Sparkles className="size-4.5" />
        </div>
        <p className="text-sm leading-relaxed text-white/75">
          &ldquo;I finally stopped guessing where my salary goes. The budget
          nudges alone paid for themselves.&rdquo;
          <span className="mt-1 block text-xs text-white/50">
            — Priya, tracking for 8 months
          </span>
        </p>
      </div>
    </aside>
  );
}

export const metadata: Metadata = {
  title: `Log In | ${appConfig.name}`,
  description:
    "Sign in to your Expense Tracker account to track your expenses, income, and budgets.",
};

export default async function Page() {
  const session = await getAuthSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      <LoginPanel />

      <div className="flex flex-1 flex-col px-4 py-6 md:px-8">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Link>
          <ModeToggle />
        </header>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Wallet className="size-5" />
              </span>
              <span className="text-lg font-bold tracking-tight">
                Expense Tracker
              </span>
            </div>

            <h1 className="mt-8 text-3xl font-extrabold tracking-tight">
              Welcome back
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Sign in with Google to open your ledger. It takes one click.
            </p>

            <div className="mt-8">
              <GoogleLoginBtn size="lg">Continue with Google</GoogleLoginBtn>
            </div>

            <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>

            <Link
              href="/demo"
              className="block w-full rounded-md border bg-card px-4 py-2.5 text-center text-sm font-medium text-foreground/80 shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              Explore the live demo
            </Link>

            <ul className="mt-8 space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                Free forever — no credit card required
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                Your data stays yours, encrypted end to end
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                Works on every device, dark mode included
              </li>
            </ul>
          </div>
        </div>

        <p className="pb-2 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Expense Tracker. All rights reserved.
        </p>
      </div>
    </div>
  );
}
