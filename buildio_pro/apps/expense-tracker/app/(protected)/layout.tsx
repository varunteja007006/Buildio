import { Separator } from "@workspace/ui/components/separator";
import {
	SidebarInset,
	SidebarProvider,
	SidebarTrigger,
} from "@workspace/ui/components/sidebar";

import { AppSideBarClient } from "./dashboard/app-sidebar.client";
import { BreadCrumbsClient } from "./dashboard/breadCrumbs.client";
import { ModeToggle } from "@/components/mode-toggle";

export default async function Layout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<SidebarProvider>
			<AppSideBarClient />
			<SidebarInset>
				<header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
					<div className="flex flex-1 items-center gap-2 px-4">
						<SidebarTrigger className="-ml-1" />
						<Separator
							orientation="vertical"
							className="mr-2 data-[orientation=vertical]:h-4"
						/>
						<BreadCrumbsClient />
					</div>
					<div className="pr-2">
						<ModeToggle />
					</div>
				</header>
				<div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
