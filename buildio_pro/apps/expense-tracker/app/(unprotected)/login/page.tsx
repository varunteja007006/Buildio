import React from "react";

import { GoogleLoginBtn } from "@/components/organisms/auth/google-login-btn";

export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <GoogleLoginBtn size={"lg"}>Continue with Google</GoogleLoginBtn>
    </div>
  );
}
