"use client";

import { motion } from "motion/react";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";

import { PiggyBank, Wallet, TrendingUp, TrendingDown } from "lucide-react";

import Link from "next/link";
import { ContactUsForm } from "@/components/organisms/contact-us/form";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <HeroSection />
      <FeaturesSection />
      <ContactSection />
    </div>
  );
}

function HeroSection() {
  return (
    <section className="flex flex-col items-center justify-center text-center py-24 px-6">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl md:text-6xl font-bold mb-4"
      >
        Take Control of Your Money
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="max-w-xl mb-8 text-lg"
      >
        Track expenses, visualize spending, and grow your savings — all in one
        clean dashboard built for everyday people.
      </motion.p>
      <div className="flex gap-4">
        <Link href="/auth/signup">
          <Button size="lg" className="px-8 rounded-full cursor-pointer">
            Get Started
          </Button>
        </Link>
        <Link href="/auth/signin">
          <Button size="lg" variant="outline" className="px-8 rounded-full cursor-pointer">
            Sign In
          </Button>
        </Link>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: TrendingDown,
      title: "Smart Categorization",
      desc: "Automatically group expenses into categories that make sense.",
    },
    {
      icon: Wallet,
      title: "Unified Dashboard",
      desc: "Track all your accounts and wallets in one clean interface.",
    },
    {
      icon: PiggyBank,
      title: "Goal Tracking",
      desc: "Set savings goals and watch your progress in real time.",
    },
    {
      icon: TrendingUp,
      title: "Visual Insights",
      desc: "Get spending analytics and monthly breakdowns instantly.",
    },
  ];

  return (
    <section className="py-20">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
        Features Built to Simplify Finance
      </h2>
      <div className="max-w-6xl mx-auto grid sm:grid-cols-2 md:grid-cols-4 gap-6 px-6">
        {features.map((f) => (
          <Card
            key={f.title}
            className="rounded-2xl shadow-sm hover:shadow-lg transition-all"
          >
            <CardContent className="flex flex-col items-center p-6 text-center">
              <f.icon className="h-10 w-10 mb-4 text-emerald-600" />
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section className="py-24 px-6 text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-6">Contact Us</h2>
      <p className="mb-8 max-w-xl mx-auto">
        {`Have questions or feature requests? We'd love to hear from you.`}
      </p>
      <div className="max-w-sm mx-auto border px-4 py-6 rounded-lg bg-card shadow">
        <ContactUsForm />
      </div>
    </section>
  );
}
