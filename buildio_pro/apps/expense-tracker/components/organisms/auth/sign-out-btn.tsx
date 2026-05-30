"use client";

import { Button } from "@workspace/ui/components/button";

import { useSignOut } from "@/lib/auth-client";

export default function SignOutBtn() {
  const signOut = useSignOut();

  return (
    <Button onClick={signOut} className="cursor-pointer" size={"sm"}>
      Log out
    </Button>
  );
}
