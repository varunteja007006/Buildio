"use client";

import React from "react";

import {
  BookOpen,
  Bot,
  GalleryVerticalEnd,
  SquareTerminal,
} from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";

import { useSession, useSignOut } from "@/lib/auth-client";
import { AppSidebar } from "@workspace/ui/components/side-bar/app-sidebar";
import { NavMain } from "@/components/organisms/nav-main";
import Link from "next/link";
import { NavMisc } from "@/components/organisms/nav-misc";

// This is sample data.
const data = {
  teams: {
    name: "Acme Inc",
    logo: GalleryVerticalEnd,
    plan: "Enterprise",
  },
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: "History",
          url: "#",
        },
        {
          title: "Starred",
          url: "#",
        },
        {
          title: "Settings",
          url: "#",
        },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Genesis",
          url: "#",
        },
        {
          title: "Explorer",
          url: "#",
        },
        {
          title: "Quantum",
          url: "#",
        },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Introduction",
          url: "#",
        },
        {
          title: "Get Started",
          url: "#",
        },
        {
          title: "Tutorials",
          url: "#",
        },
        {
          title: "Changelog",
          url: "#",
        },
      ],
    },
  ],
};

export const AppSideBarClient = () => {
  const signOut = useSignOut();
  const session = useSession();

  if (!session?.data?.user) {
    return null;
  }

  const user = {
    name: session?.data?.user.name,
    email: session?.data?.user.email,
    avatar: session?.data?.user.image ?? "",
  };

  return (
    <AppSidebar
      user={user}
      signOut={signOut}
      header={<Header />}
      middleContent={
        <>
          <NavMain items={data.navMain} />
          <NavMisc />
        </>
      }
    />
  );
};

export function Header() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <Link href={"/dashboard"}>
          <SidebarMenuButton size="lg" className="cursor-pointer">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              <data.teams.logo className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{data.teams.name}</span>
              <span className="truncate text-xs">{data.teams.plan}</span>
            </div>
          </SidebarMenuButton>
        </Link>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
