"use client";

import * as React from "react";
import {
  CalendarDays,
  HandHeart,
  Landmark,
  LifeBuoy,
  LayoutDashboard,
  MessageSquareText,
  PiggyBank,
  Receipt,
  Settings2,
  Wallet,
  Tags,
  TrendingUp,
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
  navMain: [
    {
      title: "Budgets",
      url: "/budgets",
      icon: PiggyBank,
    },
    {
      title: "Categories",
      url: "/expense-categories",
      icon: Tags,
    },
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Events",
      url: "/events",
      icon: CalendarDays,
      isActive: false,
    },
    {
      title: "Expenses",
      url: "/expenses",
      icon: Receipt,
    },
    {
      title: "Income",
      url: "/income",
      icon: TrendingUp,
    },
    {
      title: "Income Sources",
      url: "/income-sources",
      icon: Landmark,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings2,
    },
  ],
  navSecondary: [
    {
      url: "/donate",
      title: "Donate",
      icon: HandHeart,
    },
    {
      title: "Feedback",
      url: "/feedback",
      icon: MessageSquareText,
    },
    {
      title: "Support",
      url: "/support",
      icon: LifeBuoy,
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
