"use client"

import Link from "next/link"
import { ArrowUpRightIcon, GlobeIcon, SearchIcon, SparklesIcon } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useDashboardSummary } from "@/hooks/use-dashboard"
import { formatGscDomain, isDomainProperty } from "@/lib/utils"
import { useSite } from "@/context/site-context"

interface DashboardClientProps {
  userName: string
}

export function DashboardClient({ userName }: DashboardClientProps) {
  const { activeSiteId } = useSite()
  const { data, isLoading } = useDashboardSummary(activeSiteId)

  const sites = data?.sites || []
  const stats = data?.stats
  const performance = data?.performance || []

  const metrics = [
    { label: "Connected Properties", value: sites.length.toString(), helper: "Google Search Console" },
    { label: "Total Clicks", value: stats?.totalClicks.toLocaleString() ?? "...", helper: "Last 30 days" },
    { label: "Avg. Position", value: stats?.avgPosition ?? "...", helper: "Across all properties" },
    { label: "Total Impressions", value: stats ? (stats.totalImpressions / 1000).toFixed(1) + "k" : "...", helper: "Visibility trend" },
  ]

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-5">
      <Card className="border-border">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">Welcome back, {userName}</CardTitle>
            <CardDescription>
              {isLoading ? (
                <Skeleton className="h-4 w-64" />
              ) : sites.length > 0 
                ? `You have ${sites.length} properties connected via Google Search Console.`
                : "Connect your Search Console property to unlock domain performance and SEO diagnostics."}
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="gap-1.5 shadow-sm" asChild>
              <Link href="/api/gsc/auth">
                <GlobeIcon className="size-4" />
                Connect GSC
              </Link>
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 shadow-sm">
              <SearchIcon className="size-4" />
              Analyze URL
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="space-y-1">
              <CardDescription className="text-muted-foreground/80">{metric.label}</CardDescription>
              <CardTitle className="text-2xl">
                {isLoading ? <Skeleton className="h-8 w-16" /> : metric.value}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground/60">{metric.helper}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>Daily clicks for all properties (Last 15 entries)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56 w-full">
              {isLoading ? (
                <div className="flex h-full w-full items-end justify-center px-2 pb-6">
                  <Skeleton className="h-[80%] w-full rounded-xl opacity-40" />
                </div>
              ) : performance.length > 0 ? (
                <ChartContainer
                  config={{
                    clicks: {
                      label: "Daily Clicks",
                      color: "var(--chart-1)",
                    },
                  }}
                  className="h-full w-full"
                >
                  <AreaChart
                    data={performance.slice(-15).map((p: any) => ({
                      ...p,
                      formattedDate: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                    }))}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="fillClicksDash" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-clicks)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="var(--color-clicks)" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
                    <XAxis
                      dataKey="formattedDate"
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    />
                    <ChartTooltip 
                      cursor={{ stroke: "var(--color-clicks)", strokeWidth: 1, strokeDasharray: "4 4" }}
                      content={<ChartTooltipContent indicator="line" />} 
                    />
                    <Area
                      dataKey="clicks"
                      type="monotone"
                      fill="url(#fillClicksDash)"
                      stroke="var(--color-clicks)"
                      strokeWidth={2.5}
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/5">
                  <p className="text-xs italic">No performance data synced yet.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common SEO operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-between" variant="outline">
              Start first sync
              <ArrowUpRightIcon className="size-4" />
            </Button>
            <Button className="w-full justify-between" variant="outline">
              Run URL audit
              <ArrowUpRightIcon className="size-4" />
            </Button>
            <Button className="w-full justify-between" variant="outline">
              Open recommendations
              <SparklesIcon className="size-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Connected Properties</CardTitle>
            <CardDescription>Select a site to see detailed analytics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))
            ) : sites.length > 0 ? (
              sites.map((site: any) => (
                <Link 
                  key={site.id} 
                  href={`/dashboard/sites/${site.id}`}
                  className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <GlobeIcon className={`size-4 ${isDomainProperty(site.domain) ? "text-blue-500" : "text-muted-foreground"} group-hover:text-primary transition-colors`} />
                    <div className="flex flex-col">
                      <p className="font-medium truncate max-w-[200px]">{formatGscDomain(site.domain)}</p>
                      {isDomainProperty(site.domain) && (
                        <span className="text-[10px] text-blue-500 font-bold uppercase tracking-tight">Domain Property</span>
                      )}
                    </div>
                  </div>
                  <ArrowUpRightIcon className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0" />
                </Link>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4 italic">No properties connected yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SEO Checklist</CardTitle>
            <CardDescription>Recommended next steps to activate your workspace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {["Connect Google Search Console", "Select a primary domain", "Run your first URL audit"].map(
              (item) => (
                <div key={item} className="rounded-md border p-3 text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
                  {item}
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
