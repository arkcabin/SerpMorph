import { redirect } from "next/navigation"

import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { getServerAuthSession } from "@/lib/session"

export default async function DashboardPage() {
  const session = await getServerAuthSession()

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard")
  }

  const userName = session.user.name ?? "User"

  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          name: userName,
          email: session.user.email,
          avatar: session.user.image ?? "",
        }}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ms-1" />
            <Separator
              orientation="vertical"
              className="me-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    SerpMorph
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="rounded-xl border bg-card p-4">
              <p className="text-sm text-muted-foreground">Properties</p>
              <p className="mt-1 text-2xl font-semibold">0</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-sm text-muted-foreground">Tracked URLs</p>
              <p className="mt-1 text-2xl font-semibold">0</p>
            </div>
            <div className="rounded-xl border bg-card p-4">
              <p className="text-sm text-muted-foreground">Welcome</p>
              <p className="mt-1 truncate text-lg font-semibold">{userName}</p>
            </div>
          </div>
          <div className="min-h-[50svh] flex-1 rounded-xl border bg-card p-6 md:min-h-min">
            <h2 className="text-lg font-semibold">Connect Google Search Console</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Your dashboard is protected and ready. Next step is connecting your Google account and syncing
              domain data.
            </p>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
