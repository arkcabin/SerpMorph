import { redirect } from "next/navigation"
import { getServerAuthSession } from "@/lib/session"
import { AppShell } from "@/components/app-shell"
import InspectionClient from "./inspection-client"

export default async function InspectionPage() {
  const session = await getServerAuthSession()

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/console/inspection")
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
      <InspectionClient />
    </AppShell>
  )
}
