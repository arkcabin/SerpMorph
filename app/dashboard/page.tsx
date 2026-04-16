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

  const userName = session.user.name ?? "User"
  const metrics = [
    { label: "Connected Properties", value: sites.length.toString(), helper: "Google Search Console" },
    { label: "Tracked URLs", value: "0", helper: "Ready for auditing" },
    { label: "Avg. Position", value: "-", helper: "No synced keywords yet" },
    { label: "Last Sync", value: sites.length > 0 ? "Just now" : "Never", helper: "Connect account to start" },
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
                <CardDescription>Clicks and impressions will appear here after your first sync.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative h-56 overflow-hidden rounded-lg border bg-muted/5">
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-primary/5 to-transparent" />
                  <div className="absolute inset-0 grid grid-cols-6 items-end gap-2 p-4">
                    {[22, 44, 38, 61, 49, 74].map((value, index) => (
                      <div key={index} className="rounded-sm bg-primary/20" style={{ height: `${value}%` }} />
                    ))}
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
                <CardDescription>Domains synced from Search Console data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {sites.length > 0 ? (
                  sites.slice(0, 5).map((site) => (
                    <div key={site.id} className="flex items-center justify-between rounded-md border p-3">
                      <p className="font-medium truncate max-w-[200px]">{site.domain}</p>
                      <p className="text-muted-foreground">connected</p>
                    </div>
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
