"use client"

import * as React from "react"
import { ChevronsUpDown, Globe, Check, Loader2 } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useDashboardSummary } from "@/hooks/use-dashboard"
import { useSite } from "@/context/site-context"
import { formatGscDomain } from "@/lib/utils"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export function ProjectSwitcher() {
  const { isMobile } = useSidebar()
  const [mounted, setMounted] = React.useState(false)
  const { activeSiteId, setActiveSiteId } = useSite()
  const queryClient = useQueryClient()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const { data, isLoading } = useDashboardSummary(activeSiteId)
  const projects = data?.sites || []
  const activeProject = projects.find((p: any) => p.id === activeSiteId) || projects[0]

  const syncMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/sites/${id}/sync`, { method: "POST" })
      if (!res.ok) throw new Error("Sync failed")
      return res
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] })
    },
  })

  const handleSelect = (id: string) => {
    setActiveSiteId(id)
    syncMutation.mutate(id)
  }

  if (!mounted || isLoading || !projects.length) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton className="animate-pulse text-muted-foreground/50">
            <Globe className="size-4" />
            <span>{!mounted ? "Initializing..." : "Loading domains..."}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border border-border/40 shadow-sm transition-all hover:border-primary/20"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary/10 text-primary group-data-[collapsible=icon]:size-6">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${activeProject?.domain}&sz=32`}
                  alt=""
                  className="size-5 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                    e.currentTarget.nextElementSibling?.classList.remove("hidden")
                  }}
                />
                <Globe className="hidden size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold tracking-tight">
                  {formatGscDomain(activeProject?.domain || "Select Domain")}
                </span>
                <span className="truncate text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Primary Domain
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-muted-foreground/50 group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-xl p-2"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="px-2 py-1.5 text-xs text-muted-foreground font-medium">
              Switch Property
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="mx-2 my-1" />
            <div className="max-h-[300px] overflow-y-auto pr-1">
              {projects.map((project: any) => (
                <DropdownMenuItem
                  key={project.id}
                  onClick={() => handleSelect(project.id)}
                  className="flex items-center gap-3 rounded-lg p-2 focus:bg-primary/10 focus:text-primary-foreground group"
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border/50 bg-background group-focus:border-primary/30">
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${project.domain}&sz=32`}
                      alt=""
                      className="size-4 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none"
                        e.currentTarget.nextElementSibling?.classList.remove("hidden")
                      }}
                    />
                    <Globe className="hidden size-4 text-muted-foreground" />
                  </div>
                  <div className="flex flex-1 flex-col overflow-hidden">
                    <span className="truncate text-sm font-medium">
                      {formatGscDomain(project.domain)}
                    </span>
                  </div>
                  {activeSiteId === project.id ? (
                    <Check className="size-4 text-primary" />
                  ) : syncMutation.isPending && syncMutation.variables === project.id ? (
                    <Loader2 className="size-3 animate-spin text-muted-foreground" />
                  ) : null}
                </DropdownMenuItem>
              ))}
            </div>
            {projects.length === 0 && (
              <div className="px-2 py-4 text-center text-xs text-muted-foreground italic">
                No properties found
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
