"use client";

import { useSignInSocial } from "@/lib/auth-client";
import { Button } from "@workspace/ui/components/button";
import { FaGoogle } from "react-icons/fa6";

export const GoogleLoginBtn = ({ isLoading }: { isLoading?: boolean }) => {
  const signIn = useSignInSocial("google");

  return (
    <Button size={"icon-lg"} onClick={signIn} disabled={isLoading}>
      <FaGoogle />
    </Button>
  );
};
