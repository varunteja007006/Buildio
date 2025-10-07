"use client";

import { motion } from "motion/react";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { PiggyBank, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import Link from "next/link";

export default function UnauthenticatedLanding() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl"
      >
        <h1 className="text-5xl font-bold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-emerald-500 to-teal-700">
          Track Your Expenses.
          <br />
          Grow Your Savings.
        </h1>
        <p className="text-slate-400 mb-8 text-lg">
          A clean, minimal expense tracker that keeps you accountable,
          visualizes your spending, and helps you take control of your money.
        </p>

        <div className="flex justify-center gap-4">
          <Link href="/auth/signin">
            <Button size="lg" className="rounded-full px-8">
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-8 border-slate-300"
            >
              Create Account
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Feature Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mt-20 grid sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl w-full"
      >
        {features.map((f) => (
          <Card
            key={f.title}
            className="rounded-2xl shadow-md hover:shadow-xl transition-all"
          >
            <CardContent className="flex flex-col items-center p-6 text-center">
              <f.icon className="h-10 w-10 mb-4 text-emerald-600" />
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-slate-600">{f.desc}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </div>
  );
}

const features = [
  {
    title: "Visual Insights",
    desc: "Interactive charts to understand where your money goes.",
    icon: TrendingDown,
  },
  {
    title: "Smart Categories",
    desc: "Auto-tag your expenses into custom categories for easy tracking.",
    icon: Wallet,
  },
  {
    title: "Savings Goals",
    desc: "Set monthly goals and stay motivated as you hit them.",
    icon: PiggyBank,
  },
  {
    title: "Real-time Sync",
    desc: "All your data securely synced across your devices.",
    icon: TrendingUp,
  },
];
