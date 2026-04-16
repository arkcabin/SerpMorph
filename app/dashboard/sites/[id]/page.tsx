import { redirect, notFound } from "next/navigation" 
import { AlertTriangleIcon, ArrowLeftIcon, CalendarIcon, ChevronRightIcon, GlobeIcon, MousePointer2Icon, RefreshCwIcon, SearchIcon, SparklesIcon, TrendingUpIcon } from "lucide-react"
import Link from "next/link"

import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getServerAuthSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { AuditPanel } from "@/components/audit-panel"
import { getGrowthInsights, getVolatilityScore, getCTROpportunities, getTechnicalHealth } from "@/lib/gsc"

export default async function SiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerAuthSession()

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard/sites/" + id)
  }

  const site = await prisma.site.findUnique({
    where: { id, userId: session.user.id },
    include: {
      audits: {
        orderBy: { updatedAt: "desc" },
        take: 1
      }
    }
  })

  if (!site) {
    notFound()
  }

  const lastAudit = site.audits[0]
  
  const [growth, volatility, ctrOpportunities, techHealth] = await Promise.all([
    getGrowthInsights(id),
    getVolatilityScore(id),
    getCTROpportunities(id),
    getTechnicalHealth(id)
  ])

  const performance = await prisma.sitePerformance.findMany({
    where: { siteId: id },
    orderBy: { date: "asc" },
  })

  const keywords = await prisma.keywordPerformance.findMany({
    where: { siteId: id },
    orderBy: { clicks: "desc" },
    take: 50,
  })

  const totalClicks = performance.reduce((sum, p) => sum + p.clicks, 0)
  const totalImpressions = performance.reduce((sum, p) => sum + p.impressions, 0)

  const volNum = parseFloat(volatility as string) || 0

  const stats = [
    { label: "30d Clicks", value: totalClicks.toLocaleString(), icon: MousePointer2Icon, color: "text-blue-500" },
    { label: "30d Impressions", value: (totalImpressions / 1000).toFixed(1) + "k", icon: SearchIcon, color: "text-purple-500" },
    { label: "Technical Health", value: `${techHealth.score}%`, icon: SparklesIcon, color: techHealth.score > 80 ? "text-emerald-500" : "text-orange-500" },
    { label: "Ranking Stability", value: volNum > 1.5 ? "Volatile" : "Stable", icon: RefreshCwIcon, color: volNum > 1.5 ? "text-rose-500" : "text-emerald-500" },
  ]

  return (
    <AppShell
      user={{
        name: session.user.name ?? "User",
        email: session.user.email,
        avatar: session.user.image ?? "",
      }}
    >
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
                <h1 className="text-3xl font-bold tracking-tight">{site.domain}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GlobeIcon className="size-3.5" />
                    <span>Google Search Console Property</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
                <Button size="sm" variant="outline" className="gap-2">
                    <CalendarIcon className="size-4" />
                    Last 30 Days
                </Button>
                <Button size="sm" className="gap-2">
                    Sync Now
                </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <Card key={item.label} className="overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardDescription className="text-xs font-medium uppercase tracking-wider">{item.label}</CardDescription>
                <item.icon className={`size-4 ${item.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{item.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Live Audit Panel (Phase 1) */}
        <AuditPanel siteId={id} lastAudit={lastAudit} />

        {/* Performance Chart Detail */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>Clicks and visibility trend for {site.domain}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative h-[300px] w-full mt-4">
               {/* Premium Chart Visualization */}
               <div className="absolute inset-x-0 bottom-0 h-[200px] bg-gradient-to-t from-primary/5 to-transparent rounded-lg" />
               <div className="absolute inset-0 flex items-end gap-1.5 px-2 pb-2">
                  {performance.length > 0 ? (
                    performance.map((p, index) => {
                      const maxClicks = Math.max(...performance.map(x => x.clicks), 1);
                      const height = (p.clicks / maxClicks) * 100;
                      return (
                        <div 
                          key={index} 
                          className="group relative flex-1"
                        >
                            <div 
                                className="w-full rounded-t-md bg-primary/20 hover:bg-primary/40 transition-all duration-300 ease-out cursor-help" 
                                style={{ height: `${Math.max(height, 8)}%` }} 
                            />
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded border shadow-xl z-10 whitespace-nowrap">
                                {new Date(p.date).toLocaleDateString()}: {p.clicks} clicks
                            </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground italic">
                      Insufficient historical data to render chart.
                    </div>
                  )}
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Keywords Table */}
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
                                {keywords.slice(0, 10).map((kw) => (
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
                {/* Winners & Losers (Phase 2) */}
                <Card className="border-border/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Keyword Winners & Losers</CardTitle>
                        <CardDescription className="text-xs">Significant movement in the last 7 days</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold uppercase text-emerald-600">Top Winners</p>
                            {growth.winners.length > 0 ? growth.winners.map(w => (
                                <div key={w.id} className="flex items-center justify-between text-xs">
                                    <span className="truncate max-w-[140px]">{w.keyword}</span>
                                    <span className="text-emerald-600 font-bold">+{w.delta.toFixed(1)} ↑</span>
                                </div>
                            )) : <p className="text-[10px] text-muted-foreground italic">No big winners this week.</p>}
                        </div>
                        <div className="space-y-2 border-t pt-2">
                            <p className="text-[10px] font-bold uppercase text-rose-600">Target Losers</p>
                            {growth.losers.length > 0 ? growth.losers.map(l => (
                                <div key={l.id} className="flex items-center justify-between text-xs">
                                    <span className="truncate max-w-[140px]">{l.keyword}</span>
                                    <span className="text-rose-600 font-bold">{l.delta.toFixed(1)} ↓</span>
                                </div>
                            )) : <p className="text-[10px] text-muted-foreground italic">Rankings are stable.</p>}
                        </div>
                    </CardContent>
                </Card>

                {/* Edge of Page 1 Radar */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <SparklesIcon className="size-4 text-primary" />
                            <CardTitle className="text-sm">Page 1 Radar</CardTitle>
                        </div>
                        <CardDescription className="text-xs">Stuck at pos 11-15. These need a push!</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {growth.pageOneRadar.length > 0 ? growth.pageOneRadar.map(r => (
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
                    {ctrOpportunities.length > 0 ? ctrOpportunities.map(o => (
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
        {/* Technical Pulse & Diagnostics (Phase 3) */}
        <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-border/50 md:col-span-1">
                <CardHeader>
                    <CardTitle className="text-sm">Technical SEO Health</CardTitle>
                    <CardDescription className="text-xs">Based on indexing and sitemap status</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6">
                    <div className={`text-5xl font-bold mb-2 ${techHealth.score > 80 ? "text-emerald-500" : techHealth.score > 50 ? "text-orange-500" : "text-rose-500"}`}>
                        {techHealth.score}%
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Property Health Score</p>
                </CardContent>
            </Card>

            <Card className="border-border/50 md:col-span-2">
                <CardHeader>
                    <CardTitle className="text-sm">Critical Diagnostics</CardTitle>
                    <CardDescription className="text-xs">High-priority technical issues</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {techHealth.issues.length > 0 ? techHealth.issues.map((issue: string, index: number) => (
                            <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-rose-100 bg-rose-50/30 text-rose-900">
                                <AlertTriangleIcon className="size-4 mt-0.5 flex-shrink-0 text-rose-500" />
                                <span className="text-xs font-medium">{issue}</span>
                            </div>
                        )) : (
                            <div className="flex items-center gap-3 p-3 rounded-lg border border-emerald-100 bg-emerald-50/30 text-emerald-900">
                                <SparklesIcon className="size-4 text-emerald-500" />
                                <span className="text-xs font-medium">No critical technical issues detected. You're in great shape!</span>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </AppShell>
  )
}
