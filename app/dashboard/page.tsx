import { redirect } from "next/navigation"
import { getServerAuthSession } from "@/lib/session"
import { AppShell } from "@/components/app-shell"
import { DashboardClient } from "./dashboard-client"

export default async function DashboardPage() {
  const session = await getServerAuthSession()

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard")
  }

  const userName = session.user.name ?? "User"

  return (
    <AppShell
      user={{
        name: userName,
        email: session.user.email,
        avatar: session.user.image ?? "",
      }}
    >
      <DashboardClient userName={userName} />
    </AppShell>
  )
}
