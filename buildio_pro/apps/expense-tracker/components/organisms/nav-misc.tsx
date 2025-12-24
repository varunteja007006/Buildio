"use client";

import { HeartPlus, MessageCircleQuestionMark, Send } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";

const menuItems = [
  {
    href: "/support",
    label: "Support",
    logo: MessageCircleQuestionMark,
  },
  {
    href: "/feedback",
    label: "Feedback",
    logo: Send,
  },
  {
    href: "/donate",
    label: "Donate",
    logo: HeartPlus,
  },
];

export function NavMisc() {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Miscellaneous</SidebarGroupLabel>
      <SidebarMenu>
        {menuItems.map((item) => {
          return (
            <SidebarMenuItem key={item.href + item.label}>
              <SidebarMenuButton className="text-sidebar-foreground/70">
                <item.logo className="text-sidebar-foreground/70" />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
