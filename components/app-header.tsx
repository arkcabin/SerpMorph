"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AppBreadcrumbs } from "@/components/app-breadcrumbs";
import { CustomSidebarTrigger } from "@/components/custom-sidebar-trigger";
import { navLinks } from "@/components/app-shared";
import { NavUser } from "@/components/nav-user";
import { BellIcon } from "lucide-react";

const activeItem = navLinks.find((item) => item.isActive);

type AppHeaderProps = {
	user: {
		name: string;
		email?: string;
		avatar?: string;
	};
};

export function AppHeader({ user }: AppHeaderProps) {
	return (
		<header
			className={cn(
				"sticky top-2 z-20 mx-4 mt-2 flex h-14 shrink-0 items-center justify-between gap-2 rounded-2xl border bg-background/95 px-4 shadow-sm backdrop-blur-md transition-[width,height] ease-linear md:mx-6 md:px-6"
			)}
		>
			<div className="flex items-center gap-3">
				<CustomSidebarTrigger />
				<Separator
					className="me-2 h-4 data-[orientation=vertical]:self-center"
					orientation="vertical"
				/>
				<AppBreadcrumbs page={activeItem} />
			</div>
			<div className="flex items-center gap-3">
				<Button aria-label="Notifications" size="icon" variant="ghost">
					<BellIcon
					/>
				</Button>
				<Separator
					className="h-4 data-[orientation=vertical]:self-center"
					orientation="vertical"
				/>
				<NavUser user={user} />
			</div>
		</header>
	);
}
