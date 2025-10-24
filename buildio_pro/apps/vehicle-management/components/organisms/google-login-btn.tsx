"use client"

import { useSignInSocial } from "@/lib/auth-client";
import { Button } from "@workspace/ui/components/button";

export const GoogleLoginBtn = ({ isLoading }: { isLoading?: boolean }) => {
  const signIn = useSignInSocial("google");

  return (
    <Button onClick={signIn} disabled={isLoading}>
      Google SignIn
    </Button>
  );
};
