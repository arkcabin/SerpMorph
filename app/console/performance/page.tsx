import { redirect } from "next/navigation"
import { getServerAuthSession } from "@/lib/session"
import { AppShell } from "@/components/app-shell"
import { PerformanceClient } from "./performance-client"

export default async function PerformancePage() {
  const session = await getServerAuthSession()

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/console/performance")
  }

  return (
    <AppShell
      user={{
        name: session.user.name ?? "User",
        email: session.user.email,
        avatar: session.user.image ?? "",
      }}
    >
      <PerformanceClient
        user={{
          name: session.user.name ?? "User",
          email: session.user.email,
          avatar: session.user.image ?? "",
        }}
      />
    </AppShell>
  )
}
