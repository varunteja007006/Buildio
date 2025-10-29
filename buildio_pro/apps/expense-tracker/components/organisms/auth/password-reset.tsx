"use client";

import React from "react";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";

import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { useRouter, useSearchParams } from "next/navigation";

export const PasswordReset = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [newPassword, setNewPassword] = React.useState("");

  const token = searchParams.get("token");

  if (!token) {
    return null;
  }

  async function callSetNewPassword(e: React.FormEvent) {
    e.preventDefault();

    // if no token do nothing
    if (!token) {
      return;
    }

    await authClient.resetPassword(
      {
        newPassword: "password1234",
        token,
      },
      {
        onSuccess: () => {
          toast.success("Password change successful");
          router.replace("/");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    );
  }

  return (
    <form onSubmit={callSetNewPassword}>
      <Input
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value ?? "")}
        placeholder="Please set your new password"
      />
      <Button type="submit">Save New Password</Button>
    </form>
  );
};
