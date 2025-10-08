import { createAuthClient } from "better-auth/react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const authClient = createAuthClient({});

export const useSession = authClient.useSession;

export const getSession = authClient.getSession; // fetch call, can be used with Tanstack Query as well

export const useSignOut = (redirectURL = "/") => {
  const router = useRouter();

  return async () =>
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push(redirectURL);
          toast.success("Logged out successfully");
        },
        onError: () => {
          toast.error("Something went wrong, cannot logout!!");
        },
      },
    });
};

export const useSignInSocial = () => {
  return async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard", 
      fetchOptions: {
        onError: () => {
          toast.error("Something went wrong, cannot login!!");
        },
      },
    });
  };
};
