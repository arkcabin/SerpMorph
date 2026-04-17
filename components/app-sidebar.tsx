"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Search,
  ShieldCheck,
  Hash,
  Globe,
  Settings2,
  History,
  Plus,
  BarChart3,
  FileSearch,
  Command,
  AudioWaveform,
  GalleryVerticalEnd,
} from "lucide-react"

import Image from "next/image"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { ProjectSwitcher } from "@/components/project-switcher"
import { useDashboardSummary } from "@/hooks/use-dashboard"
import { formatGscDomain, isDomainProperty } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { PanelLeft } from "lucide-react"

const dataSidebar = {
  user: {
    name: "Admin User",
    email: "admin@seomo.io",
    avatar: "/avatars/admin.jpg",
  },
  teams: [
    {
      name: "Seomo Main",
      logo: (
        <div className="relative flex size-6 items-center justify-center">
          <Image
            src="/logo-dark.png"
            alt="Seomo"
            width={24}
            height={24}
            className="block object-contain dark:hidden"
          />
          <Image
            src="/logo-light.png"
            alt="Seomo"
            width={24}
            height={24}
            className="hidden object-contain dark:block"
          />
        </div>
      ),
      plan: "Pro Plan",
    },
    {
      name: "Client Agency",
      logo: <AudioWaveform />,
      plan: "Agency Plan",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboard />,
      isActive: true,
    },
    {
      title: "SEO Audits",
      url: "/audits",
      icon: <ShieldCheck />,
      items: [
        {
          title: "Audit History",
          url: "/audits/history",
        },
        {
          title: "New Audit",
          url: "/audits/new",
        },
      ],
    },
    {
      title: "Search Console",
      url: "/console",
      icon: <Search />,
      items: [
        {
          title: "Performance",
          url: "/console/performance",
        },
        {
          title: "URL Inspection",
          url: "/console/inspection",
        },
      ],
    },
    {
      title: "Keywords",
      url: "/keywords",
      icon: <Hash />,
      items: [
        {
          title: "Rank Tracker",
          url: "/keywords/tracker",
        },
        {
          title: "Keyword Research",
          url: "/keywords/research",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: <Settings2 />,
      items: [
        {
          title: "General",
          url: "/settings/general",
        },
        {
          title: "Team",
          url: "/settings/team",
        },
        {
          title: "Billing",
          url: "/settings/billing",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar } = useSidebar()

  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader className="gap-0 pb-0">
        <TeamSwitcher teams={dataSidebar.teams} />
        <ProjectSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={dataSidebar.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between px-1 py-1 group-data-[collapsible=icon]:justify-center">
          <div className="group-data-[collapsible=icon]:hidden">
            <NavUser user={dataSidebar.user} />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 md:flex"
            onClick={toggleSidebar}
          >
            <PanelLeft className="size-4 text-muted-foreground" />
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
