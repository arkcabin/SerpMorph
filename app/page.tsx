import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const features = [
  {
    title: "Search Console Sync",
    description: "Connect Google Search Console and pull verified properties in one click.",
  },
  {
    title: "Performance Insights",
    description: "Track clicks, impressions, and ranking changes with a focused dashboard.",
  },
  {
    title: "SEO Analyzer",
    description: "Audit title, meta description, headings, sitemap, and robots.txt for any URL.",
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_5%_20%,oklch(0.96_0.03_250)_0%,transparent_35%),radial-gradient(circle_at_95%_80%,oklch(0.95_0.03_160)_0%,transparent_35%)]" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-20 md:py-28">
          <p className="w-fit rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            SEO intelligence for modern teams
          </p>
          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Understand rankings faster with data that actually guides action.
            </h1>
            <p className="text-base text-muted-foreground md:text-lg">
              SerpMorph combines Google Search Console performance with practical page-level SEO checks so you
              can prioritize what to fix next.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/auth/signup">Start with Google</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/pricing">View pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-4 px-6 py-14 md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title}>
            <CardHeader>
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
            <Card key={plan.name} className="h-full">
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
