"use client"

import { use } from "react"
import Link from "next/link"
import { 
  AlertTriangleIcon, 
  ArrowLeftIcon, 
  CalendarIcon, 
  ChevronRightIcon, 
  GlobeIcon, 
  MousePointer2Icon, 
  RefreshCwIcon, 
  SearchIcon, 
  SparklesIcon 
} from "lucide-react"

import { 
  Area, 
  AreaChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  ResponsiveContainer 
} from "recharts"

import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent, 
  ChartLegend, 
  ChartLegendContent 
} from "@/components/ui/chart"
import { AuditPanel } from "@/components/audit-panel"
import { formatGscDomain, isDomainProperty } from "@/lib/utils"
import { 
  useSiteMetrics, 
  useSitePerformance, 
  useSiteKeywords, 
  useSiteInsights,
  useSiteSync
} from "@/hooks/use-site-data"

interface SiteDetailClientProps {
  id: string
  user: {
    name: string
    email: string
    avatar: string
  }
}

export function SiteDetailClient({ id, user }: SiteDetailClientProps) {
  const { data: metrics, isLoading: loadingMetrics } = useSiteMetrics(id)
  const { data: performance, isLoading: loadingPerformance } = useSitePerformance(id)
  const { data: keywords, isLoading: loadingKeywords } = useSiteKeywords(id)
  const { data: insights, isLoading: loadingInsights } = useSiteInsights(id)
  const syncMutation = useSiteSync(id)

  const site = metrics?.site
  const stats = metrics?.stats
  const lastAudit = site?.audits?.[0]

  const statItems = [
    { label: "30d Clicks", value: stats?.totalClicks.toLocaleString() ?? "...", icon: MousePointer2Icon, color: "text-blue-500" },
    { label: "30d Impressions", value: stats ? (stats.totalImpressions / 1000).toFixed(1) + "k" : "...", icon: SearchIcon, color: "text-purple-500" },
    { label: "Technical Health", value: insights?.techHealth?.score !== undefined ? `${insights.techHealth.score}%` : "...", icon: SparklesIcon, color: (insights?.techHealth?.score ?? 0) > 80 ? "text-emerald-500" : "text-orange-500" },
    { label: "Ranking Stability", value: insights?.volatility ? (parseFloat(insights.volatility) > 1.5 ? "Volatile" : "Stable") : "...", icon: RefreshCwIcon, color: parseFloat(insights?.volatility ?? "0") > 1.5 ? "text-rose-500" : "text-emerald-500" },
  ]

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard" className="transition-colors hover:text-foreground">Dashboard</Link>
          <ChevronRightIcon className="size-3" />
          <span className="text-foreground font-medium">Site Detail</span>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full" asChild>
              <Link href="/dashboard">
                <ArrowLeftIcon className="size-5" />
              </Link>
            </Button>
            <div className="space-y-0.5">
              {loadingMetrics ? (
                <Skeleton className="h-8 w-48" />
              ) : (
                <div className="flex items-center gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">{formatGscDomain(site?.domain)}</h1>
                    {isDomainProperty(site?.domain) && (
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-500 border-blue-500/20 text-[10px] uppercase font-bold py-0 h-5">
                            Domain
                        </Badge>
                    )}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <GlobeIcon className="size-3.5" />
                <span>{isDomainProperty(site?.domain) ? "Domain-wide Property" : "URL-prefix Property"}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
                size="sm" 
                className="gap-2" 
                onClick={() => syncMutation.mutate()}
                disabled={syncMutation.isPending}
            >
              <RefreshCwIcon className={`size-4 ${syncMutation.isPending ? "animate-spin" : ""}`} />
              {syncMutation.isPending ? "Syncing..." : "Sync Now"}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((item) => (
          <Card key={item.label} className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription className="text-xs font-medium uppercase tracking-wider">{item.label}</CardDescription>
              <item.icon className={`size-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              {loadingMetrics || loadingInsights ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{item.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Live Audit Panel */}
      {loadingMetrics ? (
        <Skeleton className="h-[200px] w-full rounded-xl" />
      ) : (
        <AuditPanel siteId={id} lastAudit={lastAudit} />
      )}

      <Card className="border-border/50 shadow-sm overflow-hidden bg-card/30 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle className="text-xl font-bold tracking-tight">Performance Overview</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Clicks and visibility trend for {formatGscDomain(site?.domain) || "your site"}
            </CardDescription>
          </div>
          {!loadingPerformance && performance && performance.length > 0 && (
            <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground/50 border-muted-foreground/20">
              30D DATA
            </Badge>
          )}
        </CardHeader>
        <CardContent className="pt-4 px-2 sm:px-6">
          <div className="h-[350px] w-full">
            {loadingPerformance ? (
              <div className="flex h-full w-full items-end gap-2 px-2 pb-8">
                {Array.from({ length: 15 }).map((_, i) => (
                  <Skeleton key={i} className="flex-1 rounded-t-lg" style={{ height: `${Math.random() * 60 + 20}%` }} />
                ))}
              </div>
            ) : performance && performance.length > 0 ? (
              <ChartContainer
                config={{
                  clicks: {
                    label: "Clicks",
                    theme: {
                        light: "#ec4899", // Vibrant Pink
                        dark: "#f472b6",  // Softer Pink for dark mode glow
                    }
                  },
                  impressions: {
                    label: "Impressions",
                    theme: {
                        light: "#6366f1", // Indigo
                        dark: "#818cf8",  // Lighter Indigo for visibility
                    }
                  },
                }}
                className="h-full w-full"
              >
                <AreaChart
                  data={performance.map((p: any) => ({
                    ...p,
                    formattedDate: new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
                  }))}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="fillClicks" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-clicks)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-clicks)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="fillImpressions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-impressions)" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="var(--color-impressions)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/30" />
                  <XAxis
                    dataKey="formattedDate"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={12}
                    minTickGap={32}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
                  />
                  <YAxis 
                    yId="left"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                    tick={{ fill: "var(--color-clicks)", fontSize: 10, fontWeight: 600 }}
                  />
                  <YAxis 
                    yId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                    tick={{ fill: "var(--color-impressions)", fontSize: 10 }}
                  />
                  <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                  <Area
                    yId="left"
                    dataKey="clicks"
                    type="monotone"
                    fill="url(#fillClicks)"
                    stroke="var(--color-clicks)"
                    strokeWidth={2.5}
                    stackId="a"
                    animationDuration={1500}
                  />
                  <Area
                    yId="right"
                    dataKey="impressions"
                    type="monotone"
                    fill="url(#fillImpressions)"
                    stroke="var(--color-impressions)"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    animationDuration={2000}
                  />
                  <ChartLegend content={<ChartLegendContent />} />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground border-2 border-dashed rounded-xl bg-muted/5">
                <div className="rounded-full bg-muted/20 p-3">
                    <MousePointer2Icon className="size-6 opacity-20" />
                </div>
                <p className="text-sm font-medium">No performance data synced yet.</p>
                <Button variant="outline" size="sm" className="mt-2 text-xs" onClick={() => syncMutation.mutate()} disabled={syncMutation.isPending}>
                    Trigger First Sync
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Table & Side Panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-muted/20">
            <CardTitle className="text-lg">Top Performing Keywords</CardTitle>
            <CardDescription>Queries driving the most traffic</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-muted-foreground">
                    <th className="px-4 py-3 font-semibold">Keyword</th>
                    <th className="px-4 py-3 font-semibold text-right">Clicks</th>
                    <th className="px-4 py-3 font-semibold text-right">Pos</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-b">
                  {loadingKeywords ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
                        <td className="px-4 py-3 text-right"><Skeleton className="h-4 w-8 ml-auto" /></td>
                      </tr>
                    ))
                  ) : keywords?.slice(0, 10).map((kw: any) => (
                    <tr key={kw.id} className="transition-colors hover:bg-muted/40">
                      <td className="px-4 py-3 font-medium truncate max-w-[150px]">{kw.keyword}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{kw.clicks}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{kw.position.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Keyword Winners & Losers</CardTitle>
              <CardDescription className="text-xs">Significant movement in the last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingInsights ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold uppercase text-emerald-600">Top Winners</p>
                    {insights?.growth.winners.length > 0 ? insights.growth.winners.map((w: any) => (
                      <div key={w.id} className="flex items-center justify-between text-xs">
                        <span className="truncate max-w-[140px]">{w.keyword}</span>
                        <span className="text-emerald-600 font-bold">+{w.delta.toFixed(1)} ↑</span>
                      </div>
                    )) : <p className="text-[10px] text-muted-foreground italic">No big winners this week.</p>}
                  </div>
                  <div className="space-y-2 border-t pt-2">
                    <p className="text-[10px] font-bold uppercase text-rose-600">Target Losers</p>
                    {insights?.growth.losers.length > 0 ? insights.growth.losers.map((l: any) => (
                      <div key={l.id} className="flex items-center justify-between text-xs">
                        <span className="truncate max-w-[140px]">{l.keyword}</span>
                        <span className="text-rose-600 font-bold">{l.delta.toFixed(1)} ↓</span>
                      </div>
                    )) : <p className="text-[10px] text-muted-foreground italic">Rankings are stable.</p>}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <SparklesIcon className="size-4 text-primary" />
                <CardTitle className="text-sm">Page 1 Radar</CardTitle>
              </div>
              <CardDescription className="text-xs">Stuck at pos 11-15. These need a push!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {loadingInsights ? (
                <Skeleton className="h-20 w-full" />
              ) : insights?.growth.pageOneRadar.length > 0 ? insights.growth.pageOneRadar.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between text-xs rounded border border-primary/10 bg-background/50 p-2">
                  <span className="font-medium">{r.keyword}</span>
                  <span className="text-primary font-bold">Pos {r.position.toFixed(1)}</span>
                </div>
              )) : <p className="text-[10px] text-muted-foreground italic">No keywords on the edge yet.</p>}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTR Opportunity Finder */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-sm">CTR Optimization Targets (Easy Wins)</CardTitle>
          <CardDescription className="text-xs">High Impressions but Low Clicks. Improve these titles!</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {loadingInsights ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))
            ) : insights?.ctrOpportunities.length > 0 ? insights.ctrOpportunities.map((o: any) => (
              <div key={o.id} className="rounded-lg border p-3 bg-muted/20">
                <p className="text-xs font-bold truncate mb-1">{o.keyword}</p>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-muted-foreground">{o.impressions} Views</span>
                  <span className="text-rose-600 font-bold">{(o.ctr * 100).toFixed(1)}% CTR</span>
                </div>
              </div>
            )) : <p className="text-xs text-muted-foreground italic col-span-full text-center py-4">No low-CTR opportunities found.</p>}
          </div>
        </CardContent>
      </Card>

      {/* Technical Pulse & Diagnostics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border/50 md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Technical SEO Health</CardTitle>
            <CardDescription className="text-xs">Based on indexing and sitemap status</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            {loadingInsights ? (
              <Skeleton className="size-16 rounded-full" />
            ) : (
              <>
                <div className={`text-5xl font-bold mb-2 ${insights?.techHealth.score > 80 ? "text-emerald-500" : insights?.techHealth.score > 50 ? "text-orange-500" : "text-rose-500"}`}>
                  {insights?.techHealth.score}%
                </div>
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Property Health Score</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Critical Diagnostics</CardTitle>
            <CardDescription className="text-xs">High-priority technical issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingInsights ? (
                <div className="space-y-3">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : insights?.techHealth.issues.length > 0 ? insights.techHealth.issues.map((issue: string, index: number) => (
                <div 
                  key={index} 
                  className="group relative flex items-start gap-4 p-4 rounded-xl border border-rose-500/20 bg-rose-500/5 backdrop-blur-md transition-all hover:bg-rose-500/10"
                >
                  <div className="absolute inset-y-0 left-0 w-1 bg-rose-500 rounded-l-xl opacity-70" />
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-500">
                    <AlertTriangleIcon className="size-4 animate-pulse" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-rose-500">Critical Priority</span>
                    <span className="text-sm font-medium leading-relaxed text-foreground/90">{issue}</span>
                  </div>
                </div>
              )) : (
                <div className="flex items-center gap-4 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                    <SparklesIcon className="size-5" />
                  </div>
                  <span className="text-sm font-medium text-foreground/90 tracking-tight">No critical technical issues detected. You're in great shape!</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
