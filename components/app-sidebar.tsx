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
  GalleryVerticalEnd
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import { useDashboardSummary } from "@/hooks/use-dashboard"
import { formatGscDomain, isDomainProperty } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const dataSidebar = {
  user: {
    name: "Admin User",
    email: "admin@serpmorph.com",
    avatar: "/avatars/admin.jpg",
  },
  teams: [
    {
      name: "SerpMorph Main",
      logo: <GalleryVerticalEnd />,
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
  projects: [
    {
      name: "serpmorph.com",
      url: "https://serpmorph.com",
      icon: <Globe />,
      isActive: false,
    },
    {
      name: "my-blog-site.io",
      url: "https://my-blog-site.io",
      icon: <Globe />,
      isActive: false,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data, isLoading } = useDashboardSummary()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  const sites = data?.sites || []
  const dynamicProjects = sites.map((site: any) => ({
    name: formatGscDomain(site.domain),
    url: `/dashboard/sites/${site.id}`,
    icon: <Globe className={`${isDomainProperty(site.domain) ? "text-blue-500" : "text-muted-foreground"}`} />,
    isActive: false,
  }))

  const projectsToRender = !mounted || dynamicProjects.length === 0 
    ? dataSidebar.projects 
    : dynamicProjects

  return (
    <Sidebar collapsible="icon" variant="floating" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={dataSidebar.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={dataSidebar.navMain} />
        <NavProjects projects={projectsToRender} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={dataSidebar.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
