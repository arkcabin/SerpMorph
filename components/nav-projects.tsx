"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { MoreHorizontalIcon, FolderIcon, ArrowRightIcon, Trash2Icon, Globe } from "lucide-react"
import { useDashboardSummary } from "@/hooks/use-dashboard"
import { formatGscDomain, isDomainProperty } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { useSite } from "@/context/site-context"

export function NavProjects() {
  const { data, isLoading } = useDashboardSummary()
  const { activeSiteId, setActiveSiteId } = useSite()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { isMobile } = useSidebar()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const syncMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/sites/${id}/sync`, { method: "POST" })
      if (!res.ok) throw new Error("Sync failed")
      return res
    },
    onSuccess: () => {
      // Refresh dashboard summary silently
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/sites/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete project")
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] })
      toast.success("Project deleted successfully")
    },
    onError: () => {
      toast.error("Failed to delete project")
    }
  })

  // Placeholder while loading or not mounted
  if (!mounted || isLoading) {
    return (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Projects</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="animate-pulse text-muted-foreground/50">
              <Globe className="size-4" />
              <span>Loading sites...</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    )
  }

  const projects = data?.sites || []

  const handleSelect = (id: string) => {
    setActiveSiteId(id)
    syncMutation.mutate(id)
    // Optionally stay on dashboard if already there, or redirect
    router.push("/dashboard")
  }

  const handleShare = (domain: string) => {
    const url = `${window.location.origin}/dashboard/sites/${domain}`
    navigator.clipboard.writeText(url)
    toast.success("Project link copied to clipboard")
  }

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this project? It will be moved to trash.")) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item: any) => {
          const displayDomain = formatGscDomain(item.domain)
          const isActive = activeSiteId === item.id

          return (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton 
                isActive={isActive}
                onClick={() => handleSelect(item.id)}
                tooltip={`Select ${displayDomain}`}
              >
                <div className="flex size-4 shrink-0 items-center justify-center overflow-hidden rounded-sm">
                  <img
                    src={`https://www.google.com/s2/favicons?domain=${displayDomain}&sz=32`}
                    alt=""
                    className="size-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                      e.currentTarget.nextElementSibling?.classList.remove('hidden')
                    }}
                  />
                  <Globe className="hidden size-4 text-muted-foreground" />
                </div>
                <span>{displayDomain}</span>
                {syncMutation.isPending && syncMutation.variables === item.id && (
                  <div className="ml-auto size-2 animate-pulse rounded-full bg-primary" />
                )}
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction
                    showOnHover
                    className="aria-expanded:bg-muted"
                  >
                    <MoreHorizontalIcon />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem onClick={() => router.push(`/dashboard/sites/${item.id}`)}>
                    <FolderIcon className="text-muted-foreground" />
                    <span>View Project</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare(item.id)}>
                    <ArrowRightIcon className="text-muted-foreground" />
                    <span>Share Project</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-destructive focus:text-destructive">
                    <Trash2Icon />
                    <span>Delete Project</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          )
        })}
        {projects.length === 0 && (
           <SidebarMenuItem>
            <SidebarMenuButton disabled className="text-muted-foreground">
              <Globe />
              <span>No properties yet</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
