import { redirect } from "next/navigation"
import { ArrowUpRightIcon, GlobeIcon, SearchIcon, SparklesIcon } from "lucide-react"

import { AppShell } from "@/components/app-shell"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getServerAuthSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getServerAuthSession()

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard")
  }

  const sites = await prisma.site.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  })

  // Fetch latest performance data for all sites
  const performance = await prisma.sitePerformance.findMany({
    where: { siteId: { in: sites.map((s) => s.id) } },
    orderBy: { date: "asc" },
  })

  // Fetch top keywords
  const topKeywords = await prisma.keywordPerformance.findMany({
    where: { siteId: { in: sites.map((s) => s.id) } },
    orderBy: { clicks: "desc" },
    take: 5,
  })

  const totalClicks = performance.reduce((sum, p) => sum + p.clicks, 0)
  const totalImpressions = performance.reduce((sum, p) => sum + p.impressions, 0)
  const avgPosition = performance.length > 0 
    ? (performance.reduce((sum, p) => sum + p.position, 0) / performance.length).toFixed(1)
    : "-"

  const userName = session.user.name ?? "User"
  const metrics = [
    { label: "Connected Properties", value: sites.length.toString(), helper: "Google Search Console" },
    { label: "Total Clicks", value: totalClicks.toLocaleString(), helper: "Last 30 days" },
    { label: "Avg. Position", value: avgPosition, helper: "Across all properties" },
    { label: "Total Impressions", value: (totalImpressions / 1000).toFixed(1) + "k", helper: "Visibility trend" },
  ]

  return (
    <AppShell
      user={{
        name: userName,
        email: session.user.email,
        avatar: session.user.image ?? "",
      }}
    >
      <div className="flex flex-1 flex-col gap-4 md:gap-5">
          <Card className="border-border">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <CardTitle className="text-2xl">Welcome back, {userName}</CardTitle>
                <CardDescription>
                  {sites.length > 0 
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
                  <CardTitle className="text-2xl">{metric.value}</CardTitle>
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
                <CardDescription>Daily clicks for all properties (Last 10 entries)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative h-56 overflow-hidden rounded-lg border bg-muted/5">
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-primary/5 to-transparent" />
                  <div className="absolute inset-0 flex items-end gap-2 p-4">
                    {performance.length > 0 ? (
                      performance.slice(-15).map((p, index) => {
                        const maxClicks = Math.max(...performance.map(x => x.clicks), 1);
                        const height = (p.clicks / maxClicks) * 100;
                        return (
                          <div 
                            key={index} 
                            className="flex-1 rounded-sm bg-primary/20 hover:bg-primary/40 transition-colors" 
                            style={{ height: `${Math.max(height, 5)}%` }} 
                            title={`${p.date.toLocaleDateString()}: ${p.clicks} clicks`}
                          />
                        )
                      })
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground italic">
                        No performance data synced yet.
                      </div>
                    )}
                  </div>
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
                {sites.length > 0 ? (
                  sites.map((site) => (
                    <Link 
                      key={site.id} 
                      href={`/dashboard/sites/${site.id}`}
                      className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50 transition-colors group"
                    >
                      <div className="flex items-center gap-2">
                        <GlobeIcon className="size-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        <p className="font-medium truncate max-w-[200px]">{site.domain}</p>
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
                    <div key={item} className="rounded-md border p-3 text-muted-foreground">
                      {item}
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </div>
        </div>
    </AppShell>
  )
}
