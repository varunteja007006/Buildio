"use client";

import { Button } from "@workspace/ui/components/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function Unauthorized() {
  return (
    <div className="h-screen flex flex-col gap-10 items-center justify-center">
      <AlertTriangle className="h-14 w-14 text-red-500" />

      <h1 className="text-2xl font-semibold ">You&apos;re not logged in</h1>

      <p className=" max-w-sm text-center leading-relaxed">
        You have to login to access this page. Click the button below to login.
      </p>
      <Link href={"/"}>
        <Button>Login</Button>
      </Link>
    </div>
  );
}
