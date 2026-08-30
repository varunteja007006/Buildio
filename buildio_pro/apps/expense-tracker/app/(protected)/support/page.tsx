import { Button } from "@workspace/ui/components/button";
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
import { Textarea } from "@workspace/ui/components/textarea";
import React from "react";

export default function Page() {
  return (
    <div className="max-w-lg space-y-5">
      <h1 className="font-bold text-4xl">Support 🤝</h1>
      <p className="text-lg">
        Need help? Submit a ticket and we&apos;ll get back to you soon.
      </p>

      <div className="space-y-5">
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a topic" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Select a topic</SelectLabel>
              <SelectItem value="billing">Billing</SelectItem>
              <SelectItem value="technical">Technical issue</SelectItem>
              <SelectItem value="feedback">Feedback</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Input placeholder="Enter your email" />

        <Input placeholder="Subject" />

        <Textarea placeholder="Describe your issue..." />

        <Button className="w-full">Submit ticket</Button>
      </div>
    </div>
  );
}
