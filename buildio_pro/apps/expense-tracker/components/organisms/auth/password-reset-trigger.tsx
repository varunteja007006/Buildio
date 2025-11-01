"use client";

import { Button } from "@workspace/ui/components/button";

import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const appURL = process.env.NEXT_PUBLIC_APP_URL;

export default function PasswordResetTrigger({
  email,
}: Readonly<{ email: string }>) {
  const resetPassword = async () => {
    await authClient.requestPasswordReset(
      {
        email: email, // required
        redirectTo: `/reset-password`,
      },
      {
        onSuccess: () => {
          toast.success("Email sent with password reset link.");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    );
  };

  return (
    <Button variant={"outline"} onClick={resetPassword}>
      Reset Password
    </Button>
  );
}
