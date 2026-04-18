"use client"

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
