"use client"

import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  ChevronRightIcon,
  GlobeIcon,
  MousePointer2Icon,
  RefreshCwIcon,
  SearchIcon,
  SparklesIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  ChevronDownIcon,
  CheckIcon,
} from "lucide-react"

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { AuditPanel } from "@/components/audit-panel"
import { cn, formatGscDomain, isDomainProperty } from "@/lib/utils"
import {
  useSiteMetrics,
  useSitePerformance,
  useSiteKeywords,
  useSiteInsights,
  useSiteSync,
} from "@/hooks/use-site-data"
import { useDashboardSummary } from "@/hooks/use-dashboard"
import { useRouter } from "next/navigation"

interface SiteDetailClientProps {
  id: string
  user: {
    name: string
    email: string
    avatar: string
  }
}

export function SiteDetailClient({ id, user }: SiteDetailClientProps) {
  // SiteDetailClient is using hooks that handle data fetching for site ID.
  console.debug("Loading site detail for:", id, "as user:", user?.email)
  const { data: metrics, isLoading: loadingMetrics } = useSiteMetrics(id)
  const { data: performance, isLoading: loadingPerformance } =
    useSitePerformance(id)
  const { data: keywords, isLoading: loadingKeywords } = useSiteKeywords(id)
  const { data: insights, isLoading: loadingInsights } = useSiteInsights(id)
  const { data: summary } = useDashboardSummary()
  const syncMutation = useSiteSync(id)
  const router = useRouter()

  const site = metrics?.site
  const stats = metrics?.stats
  const lastAudit = site?.audits?.[0]
  const sites = summary?.sites || []

  const statItems = [
    {
      label: "30d Clicks",
      value: stats?.totalClicks.toLocaleString() ?? "0",
      delta: stats?.clicksDelta,
      icon: MousePointer2Icon,
      color: "text-blue-500",
    },
    {
      label: "30d Impressions",
      value: stats ? (stats.totalImpressions / 1000).toFixed(1) + "k" : "0",
      delta: stats?.impressionsDelta,
      icon: SearchIcon,
      color: "text-purple-500",
    },
    {
      label: "Avg Position",
      value: stats?.avgPosition ?? "0",
      delta: stats?.positionDelta,
      isInverseDelta: true, // For position, lower is better
      icon: AreaChart,
      color: "text-orange-500",
    },
    {
      label: "Technical Health",
      value:
        insights?.techHealth?.score !== undefined
          ? `${insights.techHealth.score}%`
          : "...",
      icon: SparklesIcon,
      color:
        (insights?.techHealth?.score ?? 0) > 80
          ? "text-emerald-500"
          : "text-orange-500",
    },
  ]

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href="/dashboard"
            className="transition-colors hover:text-foreground"
          >
            Dashboard
          </Link>
          <ChevronRightIcon className="size-3" />
          <span className="font-medium text-foreground">Site Detail</span>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              asChild
            >
              <Link href="/dashboard">
                <ArrowLeftIcon className="size-5" />
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="group cursor-pointer space-y-0.5">
                  {loadingMetrics ? (
                    <Skeleton className="h-8 w-48" />
                  ) : (
                    <div className="flex items-center gap-2">
                      <h1 className="text-3xl font-bold tracking-tight transition-colors group-hover:text-primary">
                        {formatGscDomain(site?.domain)}
                      </h1>
                      <ChevronDownIcon className="size-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                      {isDomainProperty(site?.domain) && (
                        <Badge
                          variant="secondary"
                          className="h-5 border-blue-500/20 bg-blue-500/10 py-0 text-[10px] font-bold text-blue-500 uppercase"
                        >
                          Domain
                        </Badge>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-muted-foreground/80">
                    <GlobeIcon className="size-3.5" />
                    <span>
                      {isDomainProperty(site?.domain)
                        ? "Domain-wide Property"
                        : "URL-prefix Property"}
                    </span>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[300px] p-2">
                <DropdownMenuLabel className="px-2 pb-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  Switch Active Property
                </DropdownMenuLabel>
                {sites.map((s: { id: string; domain: string }) => (
                  <DropdownMenuItem
                    key={s.id}
                    onClick={() => router.push(`/dashboard/sites/${s.id}`)}
                    className="flex cursor-pointer flex-col items-start gap-0.5 rounded-lg py-2 focus:bg-primary/5 focus:text-primary"
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="text-sm font-semibold">
                        {formatGscDomain(s.domain)}
                      </span>
                      {s.id === id && <CheckIcon className="size-4" />}
                    </div>
                    <span className="w-full truncate text-[10px] text-muted-foreground italic">
                      {s.domain}
                    </span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="gap-2"
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
            >
              <RefreshCwIcon
                className={`size-4 ${syncMutation.isPending ? "animate-spin" : ""}`}
              />
              {syncMutation.isPending ? "Syncing..." : "Sync Now"}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statItems.map((item) => (
          <Card
            key={item.label}
            className="group relative overflow-hidden border-border/50 bg-card/60 backdrop-blur-md transition-all hover:bg-card hover:shadow-lg"
          >
            <div
              className={`absolute top-0 left-0 h-1 w-full opacity-10 transition-opacity group-hover:opacity-100 ${item.color.replace("text-", "bg-")}`}
            />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription className="text-xs font-medium tracking-wider uppercase">
                {item.label}
              </CardDescription>
              <item.icon className={`size-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              {loadingMetrics || loadingInsights ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="flex flex-col gap-1">
                  <div className="text-2xl font-bold tracking-tight">
                    {item.value}
                  </div>
                  {item.delta !== undefined && item.delta !== 0 && (
                    <div
                      className={cn(
                        "flex items-center gap-1 text-[10px] font-bold",
                        (item.isInverseDelta ? -item.delta : item.delta) > 0
                          ? "text-emerald-500"
                          : "text-rose-500"
                      )}
                    >
                      {(item.isInverseDelta ? -item.delta : item.delta) > 0 ? (
                        <TrendingUpIcon className="size-3" />
                      ) : (
                        <TrendingDownIcon className="size-3" />
                      )}
                      {Math.abs(item.delta).toFixed(1)}%
                      <span className="ml-0.5 font-normal tracking-normal text-muted-foreground">
                        vs prev period
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Insight "Command Center" */}
      <Card className="relative overflow-hidden border-primary/20 bg-primary/5 shadow-inner">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <SparklesIcon className="size-24 text-primary" />
        </div>
        <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative z-10 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs font-bold tracking-widest text-primary uppercase">
              <SparklesIcon className="size-3" />
              Intelligence Pulse
            </div>
            <h2 className="text-lg font-semibold tracking-tight">
              {loadingInsights ? (
                <Skeleton className="h-6 w-64" />
              ) : (insights?.techHealth.score ?? 0) > 90 ? (
                "Your site is in peak technical condition. Focus on CTR optimization."
              ) : (
                `Action required: You have ${insights?.techHealth.issues.length ?? 0} critical issues impacting your search visibility.`
              )}
            </h2>
            <p className="text-sm text-muted-foreground">
              {loadingInsights ? (
                <Skeleton className="h-4 w-48" />
              ) : (insights?.growth.winners.length ?? 0) > 0 ? (
                `You have ${insights.growth.winners.length} rising keywords! Expand content for these topics.`
              ) : (
                "No significant movement in rankings detected this week."
              )}
            </p>
          </div>
          <Button
            variant="default"
            className="relative z-10 shadow-lg shadow-primary/20"
          >
            View Roadmap
            <ChevronRightIcon className="ml-2 size-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Live Audit Panel */}
      {loadingMetrics ? (
        <Skeleton className="h-[200px] w-full rounded-xl" />
      ) : (
        <AuditPanel siteId={id} lastAudit={lastAudit} />
      )}

      {/* Table & Bento Insights */}
      <div className="grid gap-6 lg:grid-cols-12 lg:grid-rows-2">
        {/* Performance Chart - Bento Large */}
        <Card className="overflow-hidden border-border/50 bg-card/40 shadow-sm backdrop-blur-sm lg:col-span-8 lg:row-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold tracking-tight">
                Visibility Trend
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                30-day click and impression performance
              </CardDescription>
            </div>
            {!loadingPerformance && performance && performance.length > 0 && (
              <Badge
                variant="outline"
                className="border-muted-foreground/20 font-mono text-[10px]"
              >
                ACTIVE
              </Badge>
            )}
          </CardHeader>
          <CardContent className="px-2 pt-4 sm:px-6">
            <div className="h-[430px] w-full">
              {loadingPerformance ? (
                <div className="flex h-full w-full items-end gap-2 px-2 pb-8">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <Skeleton key={i} className="h-32 flex-1 rounded-t-lg" />
                  ))}
                </div>
              ) : performance && performance.length > 0 ? (
                <ChartContainer
                  config={{
                    clicks: { label: "Clicks", color: "var(--chart-1)" },
                    impressions: {
                      label: "Impressions",
                      color: "var(--chart-2)",
                    },
                  }}
                  className="h-full w-full"
                >
                  <AreaChart
                    data={performance.map(
                      (p: {
                        date: string | number | Date
                        clicks: number
                        impressions: number
                      }) => ({
                        ...p,
                        formattedDate: new Date(p.date).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        ),
                      })
                    )}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient
                        id="fillClicks"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="var(--color-clicks)"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="var(--color-clicks)"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      vertical={false}
                      strokeDasharray="3 3"
                      className="stroke-muted/30"
                    />
                    <XAxis
                      dataKey="formattedDate"
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    />
                    <YAxis
                      yAxisId="left"
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      axisLine={false}
                      tickLine={false}
                      tickMargin={10}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    />
                    <ChartTooltip
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Area
                      yAxisId="left"
                      dataKey="clicks"
                      type="monotone"
                      fill="url(#fillClicks)"
                      stroke="var(--color-clicks)"
                      strokeWidth={2.5}
                      stackId="a"
                      animationDuration={1500}
                    />
                    <Area
                      yAxisId="right"
                      dataKey="impressions"
                      type="monotone"
                      fill="transparent"
                      stroke="var(--color-impressions)"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                      animationDuration={2000}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed bg-muted/5 text-muted-foreground">
                  <p className="text-sm font-medium">
                    No performance data synced yet.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Keywords - Bento Right Top */}
        <Card className="overflow-hidden border-border/50 shadow-sm lg:col-span-4">
          <CardHeader className="bg-muted/10 py-3">
            <CardTitle className="text-sm font-bold">
              Top Performing Keywords
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b bg-muted/20 text-[10px] tracking-wider text-muted-foreground uppercase">
                    <th className="px-4 py-2 font-bold">Keyword</th>
                    <th className="px-4 py-2 text-right font-bold">Clicks</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loadingKeywords
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <tr key={i}>
                          <td className="px-4 py-3">
                            <Skeleton className="h-4 w-24" />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <Skeleton className="ml-auto h-4 w-8" />
                          </td>
                        </tr>
                      ))
                    : (
                        keywords as {
                          id: string
                          keyword: string
                          clicks: number
                          position: number
                        }[]
                      )
                        ?.slice(0, 5)
                        .map((kw) => (
                          <tr
                            key={kw.id}
                            className="transition-colors hover:bg-primary/5"
                          >
                            <td className="max-w-[140px] truncate px-4 py-2 font-medium">
                              {kw.keyword}
                            </td>
                            <td className="px-4 py-2 text-right tabular-nums">
                              {kw.clicks}
                            </td>
                          </tr>
                        ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Winners & Losers - Bento Right Bottom */}
        <Card className="border-border/50 lg:col-span-4">
          <CardHeader className="py-3">
            <CardTitle className="text-sm font-bold">Keyword Pulse</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pb-4">
            {loadingInsights ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <p className="text-[9px] font-black tracking-tighter text-emerald-600 uppercase">
                    Rising
                  </p>
                  {insights?.growth.winners
                    .slice(0, 3)
                    .map(
                      (w: { id: string; keyword: string; delta: number }) => (
                        <div
                          key={w.id}
                          className="flex flex-col border-l-2 border-emerald-500/30 pl-1.5 text-[10px] leading-tight"
                        >
                          <span className="truncate font-medium">
                            {w.keyword}
                          </span>
                          <span className="font-bold text-emerald-500">
                            +{w.delta.toFixed(0)} pos
                          </span>
                        </div>
                      )
                    )}
                </div>
                <div className="space-y-1.5 border-l pl-4">
                  <p className="text-[9px] font-black tracking-tighter text-rose-600 uppercase">
                    Falling
                  </p>
                  {insights?.growth.losers
                    .slice(0, 3)
                    .map(
                      (l: { id: string; keyword: string; delta: number }) => (
                        <div
                          key={l.id}
                          className="flex flex-col border-l-2 border-rose-500/30 pl-1.5 text-[10px] leading-tight"
                        >
                          <span className="truncate font-medium">
                            {l.keyword}
                          </span>
                          <span className="font-bold text-rose-500">
                            {l.delta.toFixed(0)} pos
                          </span>
                        </div>
                      )
                    )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* CTR Opportunity Finder */}
        <Card className="border-border/50 md:col-span-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-sm font-bold">
                CTR Optimization Targets
              </CardTitle>
              <CardDescription className="text-xs">
                High Impressions but Low Clicks. Improve these titles!
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {loadingInsights
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                  ))
                : insights?.ctrOpportunities
                    .slice(0, 4)
                    .map(
                      (o: {
                        id: string
                        keyword: string
                        impressions: number
                        ctr: number
                      }) => (
                        <div
                          key={o.id}
                          className="group relative rounded-xl border border-border/50 bg-muted/10 p-3 transition-all hover:bg-muted/20"
                        >
                          <p className="mb-1 truncate text-xs font-bold">
                            {o.keyword}
                          </p>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">
                              {o.impressions.toLocaleString()} views
                            </span>
                            <span className="font-bold text-rose-500">
                              {(o.ctr * 100).toFixed(1)}% CTR
                            </span>
                          </div>
                        </div>
                      )
                    )}
            </div>
          </CardContent>
        </Card>

        {/* Page 1 Radar */}
        <Card className="border-primary/20 bg-primary/5 md:col-span-4">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <SparklesIcon className="size-4 text-primary" />
              <CardTitle className="text-sm font-bold">Page 1 Radar</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {loadingInsights ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              insights?.growth.pageOneRadar
                .slice(0, 3)
                .map((r: { id: string; keyword: string; position: number }) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between rounded-lg border border-primary/10 bg-background/60 p-2 text-xs shadow-sm transition-all hover:scale-105"
                  >
                    <span className="max-w-[120px] truncate font-medium">
                      {r.keyword}
                    </span>
                    <Badge
                      variant="outline"
                      className="border-primary/20 bg-primary/5 text-[9px] font-bold text-primary"
                    >
                      POS {r.position.toFixed(1)}
                    </Badge>
                  </div>
                ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Technical Pulse & Diagnostics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border/50 md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Technical SEO Health</CardTitle>
            <CardDescription className="text-xs">
              Based on indexing and sitemap status
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            {loadingInsights ? (
              <Skeleton className="size-16 rounded-full" />
            ) : (
              <>
                <div
                  className={`mb-2 text-5xl font-bold ${insights?.techHealth.score > 80 ? "text-emerald-500" : insights?.techHealth.score > 50 ? "text-orange-500" : "text-rose-500"}`}
                >
                  {insights?.techHealth.score}%
                </div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">
                  Property Health Score
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Critical Diagnostics</CardTitle>
            <CardDescription className="text-xs">
              High-priority technical issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loadingInsights ? (
                <div className="space-y-3">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : insights?.techHealth.issues.length > 0 ? (
                insights.techHealth.issues.map(
                  (issue: string, index: number) => (
                    <div
                      key={index}
                      className="group relative flex items-start gap-4 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 backdrop-blur-md transition-all hover:bg-rose-500/10"
                    >
                      <div className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-rose-500 opacity-70" />
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-500">
                        <AlertTriangleIcon className="size-4 animate-pulse" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold tracking-widest text-rose-500 uppercase">
                          Critical Priority
                        </span>
                        <span className="text-sm leading-relaxed font-medium text-foreground/90">
                          {issue}
                        </span>
                      </div>
                    </div>
                  )
                )
              ) : (
                <div className="flex items-center gap-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 backdrop-blur-md">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                    <SparklesIcon className="size-5" />
                  </div>
                  <span className="text-sm font-medium tracking-tight text-foreground/90">
                    No critical technical issues detected. You&apos;re in great
                    shape!
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
