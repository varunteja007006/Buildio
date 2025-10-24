import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";

import SignOutBtn from "@/components/organisms/sign-out-btn";
import { SignUpForm } from "@/components/organisms/sign-up-form";
import { SignInForm } from "@/components/organisms/sign-in-form";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { GoogleLoginBtn } from "@/components/organisms/google-login-btn";

export const SignUp = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return (
      <Tabs defaultValue="sign-up" className="w-[400px]">
        <TabsList>
          <TabsTrigger value="sign-up">Sign Up</TabsTrigger>
          <TabsTrigger value="sign-in">Sign In</TabsTrigger>
        </TabsList>
        <TabsContent value="sign-up">
          <div className="p-4">
            <SignUpForm />
            <GoogleLoginBtn />
          </div>
        </TabsContent>
        <TabsContent value="sign-in">
          <div className="p-4">
            <SignInForm />
            <GoogleLoginBtn />
          </div>
        </TabsContent>
      </Tabs>
    );
  }

  return (
    <div
      className="bg-card rounded-lg shadow border flex flex-col items-center justify-center
    gap-4 p-4"
    >
      <h1>Welcome {session.user.name}</h1>
      <SignOutBtn />
    </div>
  );
};
