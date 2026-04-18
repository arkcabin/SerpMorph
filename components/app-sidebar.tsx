"use client"

import * as React from "react"
import {
  LayoutDashboard,
  ShieldCheck,
  Hash,
  Settings2,
  Plus,
  BarChart3,
  Command,
  AudioWaveform,
  Rocket,
} from "lucide-react"

import Image from "next/image"
import { usePathname } from "next/navigation"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { ProjectSwitcher } from "@/components/project-switcher"
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
      title: "Performance",
      url: "/console/performance",
      icon: <BarChart3 />,
    },
    {
      title: "Instant Indexing",
      url: "/console/inspection",
      icon: <Rocket />,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar } = useSidebar()
  const pathname = usePathname()

  // Dynamic nav items based on current path
  const navMain = dataSidebar.navMain.map((item) => ({
    ...item,
    isActive:
      pathname === item.url || item.items?.some((sub) => pathname === sub.url),
    items: item.items?.map((sub) => ({
      ...sub,
      isActive: pathname === sub.url,
    })),
  }))

  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader className="gap-0 pb-0">
        <TeamSwitcher teams={dataSidebar.teams} />
        <ProjectSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between px-1 py-1 group-data-[collapsible=icon]:justify-center">
          <div className="group-data-[collapsible=icon]:hidden">
            <NavUser user={dataSidebar.user} />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary md:flex"
            onClick={toggleSidebar}
          >
            <PanelLeft className="size-4" />
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
