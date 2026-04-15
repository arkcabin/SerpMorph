import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/app-header";
import { AppSidebar } from "@/components/app-sidebar";

type AppShellProps = {
	children: React.ReactNode;
	user: {
		name: string;
		email?: string;
		avatar?: string;
	};
};

export function AppShell({ children, user }: AppShellProps) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className="p-4 md:p-6">
				<AppHeader user={user} />
				<div className="flex flex-1 flex-col gap-4 overflow-y-auto">
					{children}
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
