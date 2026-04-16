import { redirect } from "next/navigation"
import { getServerAuthSession } from "@/lib/session"
import { AppShell } from "@/components/app-shell"
import { SiteDetailClient } from "./site-detail-client"

export default async function SiteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerAuthSession()

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard/sites/" + id)
  }

  return (
    <AppShell
      user={{
        name: session.user.name ?? "User",
        email: session.user.email,
        avatar: session.user.image ?? "",
      }}
    >
      <SiteDetailClient id={id} user={{
        name: session.user.name ?? "User",
        email: session.user.email,
        avatar: session.user.image ?? "",
      }} />
    </AppShell>
  )
}
