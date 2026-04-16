import { redirect, notFound } from "next/navigation"
import { ArrowLeftIcon, CalendarIcon, ChevronRightIcon, GlobeIcon, MousePointer2Icon, SearchIcon, TrendingUpIcon } from "lucide-react"
import Link from "next/link"

import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getServerAuthSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { AuditPanel } from "@/components/audit-panel"

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

  const performance = await prisma.sitePerformance.findMany({
    where: { siteId: id },
    orderBy: { date: "asc" },
  })

  const keywords = await prisma.keywordPerformance.findMany({
    where: { siteId: id },
    orderBy: { clicks: "desc" },
    take: 50,
  })

  const latestStats = performance[performance.length - 1]
  const prevStats = performance[performance.length - 2]
  
  const totalClicks = performance.reduce((sum, p) => sum + p.clicks, 0)
  const totalImpressions = performance.reduce((sum, p) => sum + p.impressions, 0)
  const avgPos = performance.length > 0
    ? (performance.reduce((sum, p) => sum + p.position, 0) / performance.length).toFixed(1)
    : "-"

  const stats = [
    { label: "30d Clicks", value: totalClicks.toLocaleString(), icon: MousePointer2Icon, color: "text-blue-500" },
    { label: "30d Impressions", value: (totalImpressions / 1000).toFixed(1) + "k", icon: SearchIcon, color: "text-purple-500" },
    { label: "Avg. Position", value: avgPos, icon: TrendingUpIcon, color: "text-orange-500" },
    { label: "Last Updated", value: latestStats ? new Date(latestStats.date).toLocaleDateString() : "Pending", icon: CalendarIcon, color: "text-emerald-500" },
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
        <Card className="border-border/50 shadow-sm">
            <CardHeader className="border-b bg-muted/20">
                <CardTitle className="text-lg">Top Performing Keywords</CardTitle>
                <CardDescription>Search queries driving the most traffic to your property</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b bg-muted/30 text-muted-foreground">
                                <th className="px-6 py-4 font-semibold">Keyword</th>
                                <th className="px-6 py-4 font-semibold text-right">Clicks</th>
                                <th className="px-6 py-4 font-semibold text-right">Impressions</th>
                                <th className="px-6 py-4 font-semibold text-right">CTR</th>
                                <th className="px-6 py-4 font-semibold text-right">Avg. Pos</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y border-b">
                            {keywords.length > 0 ? (
                                keywords.map((kw) => (
                                    <tr key={kw.id} className="transition-colors hover:bg-muted/40">
                                        <td className="px-6 py-4 font-medium">{kw.keyword}</td>
                                        <td className="px-6 py-4 text-right tabular-nums">{kw.clicks}</td>
                                        <td className="px-6 py-4 text-right tabular-nums">{(kw.impressions/1000).toFixed(1)}k</td>
                                        <td className="px-6 py-4 text-right tabular-nums">{(kw.ctr * 100).toFixed(2)}%</td>
                                        <td className="px-6 py-4 text-right tabular-nums">
                                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                                                kw.position <= 3 ? "bg-emerald-500/10 text-emerald-600" :
                                                kw.position <= 10 ? "bg-blue-500/10 text-blue-600" :
                                                "bg-muted text-muted-foreground"
                                            }`}>
                                                {kw.position.toFixed(1)}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                                        No keyword data found for this period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}
