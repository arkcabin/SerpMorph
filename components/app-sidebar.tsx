"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { GalleryVerticalEndIcon, AudioLinesIcon, TerminalIcon, TerminalSquareIcon, BotIcon, BookOpenIcon, Settings2Icon, FrameIcon, PieChartIcon, MapIcon } from "lucide-react"

const data = {
  teams: [
    {
      name: "SerpMorph",
      logo: (
        <GalleryVerticalEndIcon
        />
      ),
      plan: "Growth",
    },
    {
      name: "Search Team",
      logo: (
        <AudioLinesIcon
        />
      ),
      plan: "Pro",
    },
    {
      name: "Client Workspace",
      logo: (
        <TerminalIcon
        />
      ),
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Overview",
      url: "/dashboard",
      icon: (
        <TerminalSquareIcon
        />
      ),
      isActive: true,
      items: [
        {
          title: "Performance",
          url: "/dashboard",
        },
        {
          title: "Queries",
          url: "/dashboard",
        },
        {
          title: "Pages",
          url: "/dashboard",
        },
      ],
    },
    {
      title: "AI Insights",
      url: "/dashboard",
      icon: (
        <BotIcon
        />
      ),
      items: [
        {
          title: "Summary",
          url: "/dashboard",
        },
        {
          title: "Suggestions",
          url: "/dashboard",
        },
        {
          title: "Tracking",
          url: "/dashboard",
        },
      ],
    },
    {
      title: "Resources",
      url: "/dashboard",
      icon: (
        <BookOpenIcon
        />
      ),
      items: [
        {
          title: "Introduction",
          url: "/dashboard",
        },
        {
          title: "Get Started",
          url: "/dashboard",
        },
        {
          title: "SEO Guide",
          url: "/dashboard",
        },
        {
          title: "Changelog",
          url: "/dashboard",
        },
      ],
    },
    {
      title: "Settings",
      url: "/dashboard",
      icon: (
        <Settings2Icon
        />
      ),
      items: [
        {
          title: "General",
          url: "/dashboard",
        },
        {
          title: "Integrations",
          url: "/dashboard",
        },
        {
          title: "Billing",
          url: "/dashboard",
        },
        {
          title: "Usage",
          url: "/dashboard",
        },
      ],
    },
  ],
  projects: [
    {
      name: "SEO Analyzer",
      url: "/dashboard",
      icon: (
        <FrameIcon
        />
      ),
    },
    {
      name: "GSC Sync",
      url: "/dashboard",
      icon: (
        <PieChartIcon
        />
      ),
    },
    {
      name: "Rank Tracker",
      url: "/dashboard",
      icon: (
        <MapIcon
        />
      ),
    },
  ],
}

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string
    email: string
    avatar: string
  }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
