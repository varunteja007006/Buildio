"use client";

import * as React from "react";
import {
  Bot,
  Frame,
  HeartPlus,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  Wallet,
  Zap,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { appConfig } from "@/app/appConfig";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: PieChart,
    },
    {
      title: "Budgets",
      url: "/budgets",
      icon: SquareTerminal,
    },
    {
      title: "Expenses",
      url: "/expenses",
      icon: Frame,
    },
    {
      title: "Income",
      url: "/income",
      icon: HeartPlus,
    },
    {
      title: "Categories",
      url: "/expense-categories",
      icon: Map,
    },
    {
      title: "Income Sources",
      url: "/income-sources",
      icon: Bot,
    },
    {
      title: "Events",
      url: "/events",
      icon: Zap,
      isActive: false,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
    },
  ],
  navSecondary: [
    {
      title: "Support",
      url: "/support",
      icon: LifeBuoy,
    },
    {
      title: "Feedback",
      url: "/feedback",
      icon: Send,
    },
    {
      url: "/donate",
      title: "Donate",
      icon: HeartPlus,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const session = useSession();

  if (!session || !session.data) {
    return null;
  }

  const user = session.data.user;
  const href = user ? "/dashboard" : "/";

  const userName = user?.name?.split(" ")[0] || "User";

  const userData = {
    name: userName,
    email: user.email || "",
    avatar: user.image || "",
  };

  console.log(user.image);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={href}>
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Wallet className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{appConfig.name}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
