"use client";

import { LoaderCircle } from "lucide-react";
import { useLinkStatus } from "next/link";
import React from "react";



export function LinkStatus() {
  const { pending } = useLinkStatus();

  if (!pending) {
    return null;
  }

  return (
    <span>
      <LoaderCircle className="size-4 animate-spin" />
    </span>
  );
}
