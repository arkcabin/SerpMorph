"use client"

import * as React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryProvider } from "@/components/providers/query-provider"
import { SiteProvider } from "@/context/site-context"
import { Toaster } from "sonner"

export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <TooltipProvider>
        <QueryProvider>
          <SiteProvider>
            {children}
            <Toaster
              position="bottom-right"
              theme="system"
              richColors
              closeButton
            />
          </SiteProvider>
        </QueryProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}
