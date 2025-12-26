"use client";

import { createAuthClient } from "better-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const authClient = createAuthClient();

export const useSession = authClient.useSession;

export const getSession = authClient.getSession; // fetch call, can be used with Tanstack Query as well

export const useSignOut = (redirectURL = "/") => {
  const router = useRouter();

  return async () =>
    await authClient.signOut({
      fetchOptions: {
        onSuccess: async () => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          router.push(redirectURL);
          toast.success("Logged out successfully");
        },
        onError: () => {
          toast.error("Something went wrong, cannot logout!!");
        },
      },
    });
};

export const useSignInSocial = (
  provider: "google" | "github",
  callbackURL = "/dashboard",
) => {
  return async () => {
    await authClient.signIn.social({
      provider,
      callbackURL,
      fetchOptions: {
        onError: () => {
          toast.error("Something went wrong, cannot login!!");
        },
      },
    });
  };
};
