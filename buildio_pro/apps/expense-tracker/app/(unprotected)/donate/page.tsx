import React from "react";

import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

const DONATION_AMOUNTS = [5, 10, 20, 25, 50, 100, 250, 500, 750, 1000];

export default function Page() {
  return (
    <div className="space-y-5">
      <h1 className="font-bold text-4xl">Donate 💓</h1>
      <p className="text-lg">Your donations will help us do more...</p>

      <div className="max-w-lg space-y-5">
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Select a frequency</SelectLabel>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Input placeholder="Enter name" />

        <Input placeholder="Custom amount to donate" />

        <div className="flex items-center gap-4 flex-wrap">
          {DONATION_AMOUNTS.map((item) => {
            return (
              <div className="border-primary/80 border-2 min-w-20 text-center hover:cursor-pointer hover:bg-green-500/20 rounded-full p-2">
                {item}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
