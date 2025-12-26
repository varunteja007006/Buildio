"use client";

import React from "react";

import { CircleCheck, CircleX } from "lucide-react";

import Image from "next/image";

import { MainCard } from "./main-card";
import { useSession } from "@/lib/auth-client";
// import { UserProfileFormComponent } from "../organisms/user";

export default function ProfileSection() {
  const session = useSession();

  if (!session || !session.data) {
    return null;
  }

  const { data } = session;
  const { user } = data;

  return (
    <MainCard description="Manage your profile settings">
      <>
        <div className="bg-primary/20 max-w-lg rounded-lg p-4 flex flex-row items-center gap-1">
          <div className="shrink-0">
            {user.image && (
              <Image
                src={user.image}
                alt={user.name || "User profile image"}
                className="rounded-full"
                width={80}
                height={80}
                quality={100}
              />
            )}
          </div>
          <div className="flex-1 p-2 space-y-1">
            {user?.name && (
              <p className="text-base font-semibold text-foreground">
                {user.name}
              </p>
            )}
            {user?.email && (
              <p className="text-sm text-muted-foreground">{user.email}</p>
            )}
            <p className="text-sm flex flex-row items-center gap-1 text-muted-foreground">
              Verified:{" "}
              <span>
                {user.emailVerified ? (
                  <CircleCheck className="text-primary size-4" />
                ) : (
                  <CircleX className="text-destructive size-4" />
                )}
              </span>
            </p>
          </div>
        </div>
        {/* <UserProfileFormComponent /> */}
      </>
    </MainCard>
  );
}
