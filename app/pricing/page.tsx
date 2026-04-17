import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

const pricingPlans = [
  {
    name: "Starter",
    price: "$0",
    subtitle: "Perfect for testing Seomo",
    features: ["1 domain", "Basic SEO analyzer", "Weekly Search Console sync"],
  },
  {
    name: "Growth",
    price: "$29/mo",
    subtitle: "For active websites and content teams",
    features: [
      "10 domains",
      "Daily sync",
      "Advanced page insights",
      "Email alerts",
    ],
  },
  {
    name: "Agency",
    price: "$99/mo",
    subtitle: "For agencies and large SEO operations",
    features: [
      "Unlimited domains",
      "Multi-user team access",
      "Priority support",
      "Custom reporting",
    ],
  },
]

export default function PricingPage() {
  return (
    <main className="mx-auto min-h-svh w-full max-w-6xl px-6 py-16">
      <div className="max-w-2xl space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">Pricing</h1>
        <p className="text-muted-foreground">
          Choose the plan that matches your SEO workflow. Start free and upgrade
          as your data needs grow.
        </p>
      </div>

      <section className="mt-10 grid gap-4 md:grid-cols-3">
        {pricingPlans.map((plan) => (
          <Card key={plan.name} className="h-full">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <p className="text-3xl font-semibold">{plan.price}</p>
              <CardDescription>{plan.subtitle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {plan.features.map((feature) => (
                <p key={feature}>- {feature}</p>
              ))}
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="mt-12 flex flex-wrap gap-3">
        <Button asChild size="lg">
          <Link href="/auth/signup">Start with Google</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/">Back to home</Link>
        </Button>
      </section>
    </main>
  )
}
