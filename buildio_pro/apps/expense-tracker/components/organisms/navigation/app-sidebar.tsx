"use client";

import * as React from "react";
import { BookOpen, Bot, LayoutDashboard, Wallet2 } from "lucide-react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@workspace/ui/components/sidebar";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";

const data = {
  user: {
    name: "",
    email: "",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: LayoutDashboard,
      isActive: true,
      items: [
        {
          title: "Home",
          url: "/dashboard",
        },
        {
          title: "Split Bill",
          url: "/user/split-bill",
        },
        {
          title: "Wishlist",
          url: "/user/wishlist",
        },
        {
          title: "Catalogue",
          url: "/user/catalogue",
        },
        {
          title: "Planners",
          url: "/user/planners",
        },
        {
          title: "Analytics",
          url: "/user/analytics",
        },
      ],
    },
    {
      title: "AI",
      url: "#",
      icon: Bot,
      items: [
        {
          title: "Assistance",
          url: "#",
        },
        {
          title: "Scout Bills",
          url: "#",
        },
        {
          title: "Budget Podcast",
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: userSession } = useSession();

  if (!userSession) {
    return null;
  } else {
    data["user"]["name"] = userSession.user.name;
    data["user"]["email"] = userSession.user.email;
    data["user"]["avatar"] = userSession.user.image ?? "";
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href={"/dashboard"}>
                <Wallet2 className="size-8" />
                <h1 className="font-bold text-sm">Expense Tracker</h1>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
