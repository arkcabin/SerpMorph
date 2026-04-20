"use client"

import * as React from "react"
import { useSite } from "@/context/site-context"
import { SiteDetailClient } from "@/components/site-detail/site-detail-client"
import { useDashboardSummary } from "@/hooks/use-dashboard"
import {
  BarChart3Icon,
  GlobeIcon,
  MousePointer2Icon,
  PlusIcon,
  ArrowRightIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

interface PerformanceClientProps {
  user: {
    name: string
    email: string
    avatar: string
  }
}

export function PerformanceClient({ user }: PerformanceClientProps) {
  const { activeSiteId, setActiveSiteId } = useSite()
  const { data: summary, isLoading: loadingSummary } = useDashboardSummary()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // If we have an active site, show the detailed performance view
  if (activeSiteId) {
    return <SiteDetailClient id={activeSiteId} user={user} />
  }

  // If no active site, show selection state
  const sites = summary?.sites || []

  return (
    <div className="flex min-h-[80vh] flex-1 flex-col items-center justify-center p-4 text-center">
      <div className="w-full max-w-2xl space-y-8">
        <div className="space-y-3">
          <div className="mx-auto mb-2 flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <BarChart3Icon className="size-8" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            Select a Property to Begin
          </h1>
          <p className="mx-auto max-w-[500px] text-xl text-muted-foreground">
            Choose a domain from your connected Google Search Console properties
            to visualize your site&apos;s performance data.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {loadingSummary ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))
          ) : sites.length > 0 ? (
            sites.map((site: { id: string; domain: string }) => (
              <button
                key={site.id}
                onClick={() => setActiveSiteId(site.id)}
                className="group relative flex flex-col items-start gap-2 rounded-2xl border border-border/50 bg-card/50 p-5 text-left transition-all hover:border-primary/20 hover:bg-card hover:shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <GlobeIcon className="size-5" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold tracking-tight">
                      {site.domain.replace("sc-domain:", "")}
                    </span>
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                      Property ID: {site.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex w-full items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <MousePointer2Icon className="size-3" />
                      <span>Analysis Ready</span>
                    </div>
                  </div>
                  <ArrowRightIcon className="size-4 text-muted-foreground/30 transition-all group-hover:translate-x-1 group-hover:text-primary" />
                </div>
              </button>
            ))
          ) : (
            <Card className="col-span-full border-2 border-dashed bg-muted/5">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="mb-4 text-muted-foreground">
                  You haven&apos;t connected any sites yet.
                </p>
                <Button asChild>
                  <Link href="/dashboard">
                    <PlusIcon className="mr-2 size-4" />
                    Connect Your First Site
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
