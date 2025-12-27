"use client";

import React from "react";

import { Button } from "@workspace/ui/components/button";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import SignOutBtn from "./sign-out-btn";

export function LoginBtn() {
  const { data } = useSession();

  if (data?.user) {
    return (
      <>
        <Link href={"/dashboard"}>
          <Button size={"sm"}>Dashboard</Button>
        </Link>
        <SignOutBtn />
      </>
    );
  }

  return (
    <Link href={"/login"}>
      <Button size={"sm"}>Login</Button>
    </Link>
  );
}
