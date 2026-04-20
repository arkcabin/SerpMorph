"use client"

import * as React from "react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppHeader } from "@/components/app-header"
import { AppSidebar } from "@/components/app-sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

type AppShellProps = {
  children: React.ReactNode
  user: {
    name: string
    email?: string
    avatar?: string
  }
}

export function AppShell({ children, user }: AppShellProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-svh w-full flex-col overflow-hidden bg-background">
        <div className="flex h-full w-full">
          <div className="w-[280px] shrink-0 border-r bg-sidebar/50" />
          <div className="flex flex-1 flex-col">
            <div className="m-4 h-14 rounded-xl border-b bg-background/50" />
            <div className="flex-1 p-6">
              <div className="h-full w-full animate-pulse rounded-2xl bg-muted/10" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex h-svh flex-col overflow-hidden">
          <AppHeader user={user} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
              {children}
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
