import Image from "next/image"
import Link from "next/link"
import {
  CheckCircle2Icon,
  ChevronRightIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TargetIcon,
  TrendingUpIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const highlights = [
  "Google Search Console sync",
  "URL-level SEO analyzer",
  "Clean dashboard with ranking trends",
]

const features = [
  {
    title: "Search Console Sync",
    description:
      "Pull verified properties, clicks, impressions, and position from one trusted source.",
    icon: <TrendingUpIcon className="size-5" />,
  },
  {
    title: "Performance Insights",
    description:
      "Track growth and drops across domains, pages, and keyword clusters in one view.",
    icon: <TargetIcon className="size-5" />,
  },
  {
    title: "SEO Analyzer",
    description:
      "Run checks for titles, meta descriptions, headings, sitemap, and robots.txt health.",
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
    items: [
      "10 connected domains",
      "Full SEO analysis",
      "Daily sync and alerts",
    ],
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
        <div className="ambient-layer ambient-hero opacity-20" />
        <div className="bg-grain pointer-events-none absolute inset-0" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 md:py-10">
          <header className="animate-in fade-in slide-in-from-top-4 flex items-center justify-between duration-1000">
            <div className="group flex items-center gap-3">
            <div className="relative flex size-9 items-center justify-center transition-all group-hover:scale-105">
                <div className="absolute inset-0 bg-linear-to-tr from-primary/10 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <Image
                  src="/logo-dark.png"
                  alt="Seomo Icon"
                  width={24}
                  height={24}
                  className="block dark:hidden"
                />
                <Image
                  src="/logo-light.png"
                  alt="Seomo Icon"
                  width={24}
                  height={24}
                  className="hidden dark:block"
                />
              </div>
              <div className="relative h-6 w-20">
                <Image
                  src="/Seomo-dark.png"
                  alt="Seomo Text"
                  fill
                  className="block object-contain dark:hidden"
                />
                <Image
                  src="/Seomo-light.png"
                  alt="Seomo Text"
                  fill
                  className="hidden object-contain dark:block"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="font-medium hover:bg-primary/5"
              >
                <Link href="/pricing">Pricing</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="hover:shadow-glow font-semibold shadow-xs transition-all hover:scale-105"
              >
                <Link href="/auth/signin">Sign in</Link>
              </Button>
            </div>
          </header>

          <div className="grid items-center gap-12 py-12 md:grid-cols-2 md:py-20">
            <div className="animate-in fade-in slide-in-from-left-8 space-y-8 delay-200 duration-1000">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[11px] font-bold tracking-widest text-primary uppercase shadow-xs">
                <SparklesIcon className="size-3" />
                Next-Gen SEO Intelligence
              </div>
              <h1 className="text-5xl leading-[1.1] font-bold tracking-tight md:text-7xl">
                Master search performance with{" "}
                <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  precision.
                </span>
              </h1>
              <p className="max-w-[500px] text-lg leading-relaxed text-muted-foreground md:text-xl">
                Seomo transforms raw Search Console data into prioritized SEO
                actions, helping teams focus on what moves the needle.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="hover:shadow-glow shadow-lg transition-all hover:scale-105"
                >
                  <Link href="/auth/signup">
                    Start free
                    <ChevronRightIcon className="size-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="transition-all hover:bg-primary/5"
                >
                  <Link href="/dashboard">View dashboard preview</Link>
                </Button>
              </div>

              <div className="grid gap-2 text-sm text-muted-foreground">
                {highlights.map((item, i) => (
                  <p
                    key={item}
                    className="animate-in fade-in slide-in-from-left-4 flex items-center gap-2 duration-500"
                    style={{ transitionDelay: `${400 + i * 100}ms` }}
                  >
                    <CheckCircle2Icon className="size-4 text-primary" />
                    {item}
                  </p>
                ))}
              </div>
            </div>

            <Card className="hover:shadow-glow animate-in fade-in zoom-in-95 border-border/80 bg-card/90 shadow-xl backdrop-blur transition-all delay-300 duration-1000 hover:scale-[1.01]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUpIcon className="size-5 text-primary" />
                  Live SEO Signal
                </CardTitle>
                <CardDescription>Snapshot from your workspace</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-primary/10 bg-primary/5 p-4 transition-colors hover:bg-primary/10">
                  <p className="text-sm font-medium text-muted-foreground">
                    Top query momentum
                  </p>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-primary">
                    +18.4%
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                    <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                      Clicks
                    </p>
                    <p className="mt-1 text-xl font-bold">12.4k</p>
                  </div>
                  <div className="rounded-xl border bg-muted/20 p-4 transition-colors hover:bg-muted/40">
                    <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                      Impressions
                    </p>
                    <p className="mt-1 text-xl font-bold">408k</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {outcomes.map((item, i) => (
              <Card
                key={item.label}
                className="group animate-in fade-in slide-in-from-bottom-4 transition-all duration-1000 hover:shadow-md"
                style={{ transitionDelay: `${600 + i * 100}ms` }}
              >
                <CardHeader className="gap-2">
                  <CardDescription className="text-[10px] font-bold tracking-widest uppercase">
                    {item.label}
                  </CardDescription>
                  <CardTitle className="text-4xl font-bold transition-colors group-hover:text-primary">
                    {item.value}
                  </CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-20 md:grid-cols-3">
        {features.map((feature, i) => (
          <Card
            key={feature.title}
            className="hover:shadow-glow animate-in fade-in slide-in-from-bottom-8 h-full border-border/60 transition-all duration-1000 hover:border-primary/40"
            style={{ transitionDelay: `${100 * i}ms` }}
          >
            <CardHeader className="space-y-4">
              <div className="flex size-11 items-center justify-center rounded-xl border bg-primary/5 text-primary shadow-sm transition-transform group-hover:scale-110">
                {feature.icon}
              </div>
              <div className="space-y-2">
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="leading-relaxed">
                  {feature.description}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-12">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">
              Simple, transparent pricing
            </h2>
            <p className="text-muted-foreground">
              Scale from solo properties to full agencies.
            </p>
          </div>
          <Button asChild variant="ghost" className="gap-2 font-medium">
            <Link href="/pricing">
              Compare all features
              <ChevronRightIcon className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <Card
              key={plan.name}
              className={cn(
                "h-full transition-all hover:scale-[1.02]",
                plan.highlighted
                  ? "border-primary shadow-lg"
                  : "border-border/60 shadow-sm"
              )}
            >
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold">
                    {plan.name}
                  </CardTitle>
                  {plan.highlighted && (
                    <Badge className="bg-primary text-[10px] uppercase">
                      Popular
                    </Badge>
                  )}
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <CardDescription className="text-xs">
                  {plan.detail}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="mb-4 h-px w-full bg-border/50" />
                {plan.items.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-sm text-foreground/80"
                  >
                    <CheckCircle2Icon className="size-3.5 shrink-0 text-primary" />
                    {item}
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <Card className="group animate-in zoom-in-95 relative overflow-hidden border-primary/20 bg-card/50 shadow-2xl backdrop-blur-xl duration-1000">
          <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-primary/20 via-primary to-primary/20 opacity-50" />
          <CardContent className="flex flex-col items-start justify-between gap-8 py-12 md:flex-row md:items-center">
            <div className="space-y-3">
              <h3 className="text-4xl font-bold tracking-tight">
                Ready to improve search performance?
              </h3>
              <p className="max-w-[500px] text-lg text-muted-foreground">
                Create your workspace and connect Google Search Console in
                minutes. Start your growth journey today.
              </p>
            </div>
            <div className="flex gap-4">
              <Button
                asChild
                size="lg"
                className="hover:shadow-glow px-10 font-bold shadow-lg transition-all hover:scale-105"
              >
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
