"use client";

import * as React from "react";

import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarRail,
} from "@workspace/ui/components/sidebar";
import {
	NavUser,
	NavUserProps,
} from "@workspace/ui/components/side-bar/nav-user";

export type SidebarProps = {
	header: React.ReactNode;
	middleContent: React.ReactNode;
};

export function AppSidebar({
	header,
	user,
	signOut,
	userNavConfig,
	middleContent,
	...props
}: React.ComponentProps<typeof Sidebar> & NavUserProps & SidebarProps) {
	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>{header}</SidebarHeader>
			<SidebarContent>{middleContent}</SidebarContent>
			<SidebarFooter>
				<NavUser user={user} signOut={signOut} userNavConfig={userNavConfig} />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
}
