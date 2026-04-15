import Link from "next/link"
import { CheckCircle2Icon, ChevronRightIcon, ShieldCheckIcon, SparklesIcon, TargetIcon, TrendingUpIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const highlights = [
  "Google Search Console sync",
  "URL-level SEO analyzer",
  "Clean dashboard with ranking trends",
]

const features = [
  {
    title: "Search Console Sync",
    description: "Pull verified properties, clicks, impressions, and position from one trusted source.",
    icon: <TrendingUpIcon className="size-5" />,
  },
  {
    title: "Performance Insights",
    description: "Track growth and drops across domains, pages, and keyword clusters in one view.",
    icon: <TargetIcon className="size-5" />,
  },
  {
    title: "SEO Analyzer",
    description: "Run checks for titles, meta descriptions, headings, sitemap, and robots.txt health.",
    icon: <ShieldCheckIcon className="size-5" />,
  },
]

const outcomes = [
  {
    label: "Average setup time",
    value: "7 min",
  },
  {
    label: "Insights saved weekly",
    value: "30+",
  },
  {
    label: "Reporting clarity",
    value: "High",
  },
]

const plans = [
  {
    name: "Starter",
    price: "$0",
    detail: "For solo site owners",
    items: ["1 connected domain", "Basic SEO checks", "Weekly sync"],
  },
  {
    name: "Growth",
    price: "$29",
    detail: "Per month",
    items: ["10 connected domains", "Full SEO analysis", "Daily sync and alerts"],
    highlighted: true,
  },
  {
    name: "Agency",
    price: "$99",
    detail: "Per month",
    items: ["Unlimited domains", "Team workspaces", "Priority support"],
  },
]

export default function HomePage() {
  return (
    <main className="min-h-svh bg-background">
      <section className="relative overflow-hidden border-b">
        <div className="ambient-layer ambient-hero" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 md:py-10">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-md border bg-card">
                <SparklesIcon className="size-4" />
              </div>
              <span className="text-sm font-semibold tracking-wide">SerpMorph</span>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/pricing">Pricing</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/auth/signin">Sign in</Link>
              </Button>
            </div>
          </header>

          <div className="grid items-center gap-8 py-12 md:grid-cols-2 md:py-16">
            <div className="space-y-6">
              <p className="w-fit rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                SEO intelligence for modern teams
              </p>
              <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
                See what changed in search, and know what to fix next.
              </h1>
              <p className="text-base text-muted-foreground md:text-lg">
                SerpMorph combines Search Console data and page-level SEO audits so teams can move from raw
                numbers to action in minutes.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href="/auth/signup">
                    Start free
                    <ChevronRightIcon className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/dashboard">View dashboard preview</Link>
                </Button>
              </div>

              <div className="grid gap-2 text-sm text-muted-foreground">
                {highlights.map((item) => (
                  <p key={item} className="flex items-center gap-2">
                    <CheckCircle2Icon className="size-4 text-foreground" />
                    {item}
                  </p>
                ))}
              </div>
            </div>

            <Card className="border-border/80 bg-card/90 backdrop-blur">
              <CardHeader>
                <CardTitle>Live SEO Signal</CardTitle>
                <CardDescription>Snapshot from your workspace</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground">Top query momentum</p>
                  <p className="mt-1 text-2xl font-semibold">+18.4%</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Clicks</p>
                    <p className="mt-1 font-semibold">12,430</p>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">Impressions</p>
                    <p className="mt-1 font-semibold">408,122</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {outcomes.map((item) => (
              <Card key={item.label}>
                <CardHeader className="gap-2">
                  <CardDescription>{item.label}</CardDescription>
                  <CardTitle className="text-3xl">{item.value}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-6 py-14 md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} className="h-full border-border/80">
            <CardHeader>
              <div className="mb-2 flex size-9 items-center justify-center rounded-md border bg-card">
                {feature.icon}
              </div>
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold">Simple pricing</h2>
          <Button asChild variant="ghost">
            <Link href="/pricing">See full comparison</Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className={plan.highlighted ? "h-full border-foreground/30 shadow-sm" : "h-full"}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.detail}</CardDescription>
                <p className="text-3xl font-semibold">{plan.price}</p>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {plan.items.map((item) => (
                  <p key={item}>- {item}</p>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-16">
        <Card className="border-border/80 bg-card/80">
          <CardContent className="flex flex-col items-start justify-between gap-4 py-8 md:flex-row md:items-center">
            <div>
              <h3 className="text-2xl font-semibold">Ready to improve search performance?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your workspace and connect Google Search Console in minutes.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/auth/signin">Go to dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
