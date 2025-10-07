"use client";

import React from "react";

import { authClient, useSession } from "@/lib/auth-client"; //import the auth client
import { Button } from "@workspace/ui/components/button";
import { useRouter } from "next/navigation";

// const { data, error } = await authClient.signUp.email(
//   {
//     email, // user email address
//     password, // user password -> min 8 characters by default
//     name, // user display name
//     image, // User image URL (optional)
//     callbackURL: "/dashboard", // A URL to redirect to after the user verifies their email (optional)
//   },
//   {
//     onRequest: (ctx) => {
//       //show loading
//     },
//     onSuccess: (ctx) => {
//       //redirect to the dashboard or sign in page
//     },
//     onError: (ctx) => {
//       // display the error message
//       alert(ctx.error.message);
//     },
//   }
// );

// const { data, error } = await authClient.signIn.email(
//   {
//     /**
//      * The user email
//      */
//     email,
//     /**
//      * The user password
//      */
//     password,
//     /**
//      * A URL to redirect to after the user verifies their email (optional)
//      */
//     callbackURL: "/dashboard",
//     /**
//      * remember the user session after the browser is closed.
//      * @default true
//      */
//     rememberMe: false,
//   },
//   {
//     //callbacks
//   }
// );

const signIn = async () => {
  await authClient.signIn.social({
    provider: "google",
  });
};

export default function Page() {
  const { data, isPending } = useSession();
  const router = useRouter();

  const redirectToDashboard = () => {
    if (!data) {
      return;
    }

    router.push("/dashboard");
  };

  React.useEffect(() => {
    redirectToDashboard();
  }, []);

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
