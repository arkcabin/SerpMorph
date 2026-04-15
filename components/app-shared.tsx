import type { ReactNode } from "react";
import { LayoutGridIcon, BarChart3Icon, FileTextIcon, LinkIcon, SettingsIcon, HelpCircleIcon, ActivityIcon, SearchIcon, GlobeIcon } from "lucide-react";

export type SidebarNavItem = {
	title: string;
	path?: string;
	icon?: ReactNode;
	isActive?: boolean;
	subItems?: SidebarNavItem[];
};

export type SidebarNavGroup = {
	label: string;
	items: SidebarNavItem[];
};

export const navGroups: SidebarNavGroup[] = [
	{
		label: "Overview",
		items: [
			{
				title: "Dashboard",
				path: "/dashboard",
				icon: (
					<LayoutGridIcon
					/>
				),
				isActive: true,
			},
			{
				title: "Performance",
				path: "/dashboard",
				icon: (
					<BarChart3Icon
					/>
				),
			},
		],
	},
	{
		label: "SEO Workspace",
		items: [
			{
				title: "URL Analyzer",
				path: "/dashboard",
				icon: (
					<SearchIcon
					/>
				),
				subItems: [
					{ title: "Page checks", path: "/dashboard" },
					{ title: "Meta checks", path: "/dashboard" },
					{ title: "Heading checks", path: "/dashboard" },
				],
			},
			{
				title: "Properties",
				path: "/dashboard",
				icon: (
					<GlobeIcon
					/>
				),
				subItems: [
					{ title: "Connected domains", path: "/dashboard" },
					{ title: "Sync status", path: "/dashboard" },
					{ title: "Verification", path: "/dashboard" },
				],
			},
			{
				title: "Reports",
				path: "/dashboard",
				icon: (
					<FileTextIcon
					/>
				),
			},
			{
				title: "Recommendations",
				path: "/dashboard",
				icon: (
					<LinkIcon
					/>
				),
			},
		],
	},
	{
		label: "Settings",
		items: [
			{
				title: "Workspace settings",
				path: "/dashboard",
				icon: (
					<SettingsIcon
					/>
				),
				subItems: [
					{ title: "General", path: "/dashboard" },
					{ title: "Integrations", path: "/dashboard" },
					{ title: "Team", path: "/dashboard" },
					{ title: "Alerts", path: "/dashboard" },
					{ title: "Billing", path: "/dashboard" },
				],
			},
		],
	},
];

export const footerNavLinks: SidebarNavItem[] = [
	{
		title: "Help center",
		path: "/dashboard",
		icon: (
			<HelpCircleIcon
			/>
		),
	},
	{
		title: "System status",
		path: "/dashboard",
		icon: (
			<ActivityIcon
			/>
		),
	},
];

export const navLinks: SidebarNavItem[] = [
	...navGroups.flatMap((group) =>
		group.items.flatMap((item) =>
			item.subItems?.length ? [item, ...item.subItems] : [item]
		)
	),
	...footerNavLinks,
];
