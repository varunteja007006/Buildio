"use client";

import { useEffect } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@workspace/ui/components/button";

import { UserRegistration } from "@/components/user-registration";
import { useUserStore } from "@/lib/store/user.store";

export default function Page() {
  const { userToken } = useUserStore();
  const router = useRouter();

  useEffect(() => {
    if (userToken) {
      router.push("/rooms");
    }
  }, [userToken, router]);

  return (
    <div className="flex flex-col items-center gap-5 justify-center min-h-[calc(100vh-10rem)]">
      {/* Hero */}
      <div>
        <h1 className="text-primary text-center text-5xl">
          Welcome to Scribble
        </h1>
        {userToken && (
          <div className="mt-4">
            <Button asChild>
              <Link href="/rooms">Go to Rooms</Link>
            </Button>
          </div>
        )}
      </div>
      <div>
        {!userToken && (
          <UserRegistration onSuccess={() => router.push("/rooms")} />
        )}
      </div>
    </div>
  );
}
