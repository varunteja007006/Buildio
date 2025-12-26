import React from "react";

import { GoogleLoginBtn } from "@/components/organisms/auth/google-login-btn";
import { getAuthSession } from "@/lib/auth-server";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getAuthSession();

  if (session) {
    redirect("/dashboard");
  }


  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <GoogleLoginBtn size={"lg"}>Continue with Google</GoogleLoginBtn>
    </div>
  );
}
