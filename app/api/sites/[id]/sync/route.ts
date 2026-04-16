import { NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { syncAllSiteData } from "@/lib/gsc"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerAuthSession()

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    // Basic verification that the site belongs to the user
    const site = await prisma.site.findUnique({
      where: { id, userId: session.user.id }
    })

    if (!site) {
      return new NextResponse("Not Found", { status: 404 })
    }

    await syncAllSiteData(id)

    return new NextResponse("OK", { status: 200 })
  } catch (error) {
    console.error("[SITE_SYNC_POST]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
