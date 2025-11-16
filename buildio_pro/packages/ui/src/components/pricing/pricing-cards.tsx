"use client";

import { CircleCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { Switch } from "@workspace/ui/components/switch";

interface PricingFeature {
  text: string;
}

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: string;
  yearlyPrice: string;
  features: PricingFeature[];
  button: {
    text: string;
    url: string;
  };
}

interface PricingCardsProps {
  plans?: PricingPlan[];
}

const PricingCards = ({
  plans = [
    {
      id: "plus",
      name: "Plus",
      description: "For personal use",
      monthlyPrice: "$19",
      yearlyPrice: "$179",
      features: [
        { text: "Up to 5 team members" },
        { text: "Basic components library" },
        { text: "Community support" },
        { text: "1GB storage space" },
      ],
      button: {
        text: "Purchase",
        url: "https://shadcnblocks.com",
      },
    },
    {
      id: "pro",
      name: "Pro",
      description: "For professionals",
      monthlyPrice: "$49",
      yearlyPrice: "$359",
      features: [
        { text: "Unlimited team members" },
        { text: "Advanced components" },
        { text: "Priority support" },
        { text: "Unlimited storage" },
      ],
      button: {
        text: "Purchase",
        url: "https://shadcnblocks.com",
      },
    },
  ],
}: PricingCardsProps) => {
  const [isYearly, setIsYearly] = useState(false);
  return (
    <div className="container">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-3 text-lg">
          Monthly
          <Switch
            checked={isYearly}
            onCheckedChange={() => setIsYearly(!isYearly)}
          />
          Yearly
        </div>
        <div className="flex flex-col items-stretch gap-6 md:flex-row">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className="flex w-80 flex-col justify-between text-left"
            >
              <CardHeader>
                <CardTitle>
                  <p>{plan.name}</p>
                </CardTitle>
                <p className="text-muted-foreground text-sm">
                  {plan.description}
                </p>
                <div className="flex items-end">
                  <span className="text-4xl font-semibold">
                    {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-muted-foreground text-2xl font-semibold">
                    {isYearly ? "/yr" : "/mo"}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <Separator className="mb-6" />
                {plan.id === "pro" && (
                  <p className="mb-3 font-semibold">Everything in Plus, and:</p>
                )}
                <ul className="space-y-4">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <CircleCheck className="size-4" />
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="mt-auto">
                <Button asChild className="w-full">
                  <a href={plan.button.url} target="_blank">
                    {plan.button.text}
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export { PricingCards };
