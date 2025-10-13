"use client";

import React from "react";

import { useSession, useSignInSocial } from "@/lib/auth-client"; //import the auth client
import { Button } from "@workspace/ui/components/button";
import { useRouter } from "next/navigation";

export default function Page() {
  const { data, isPending } = useSession();
  const signIn = useSignInSocial();
  const router = useRouter();

  const hasId = !!data?.user.id;

  const redirectToDashboard = () => {
    if (!hasId) {
      return;
    }

    router.push("/dashboard");
  };

  React.useEffect(() => {
    redirectToDashboard();
  }, [hasId]);

  if (data) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <Button onClick={signIn} disabled={isPending}>
        Google SignIn
      </Button>
    </div>
  );
}
