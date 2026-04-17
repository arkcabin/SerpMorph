import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { inspectUrl } from "@/lib/gsc"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Verify site ownership
    const site = await prisma.site.findFirst({
        where: { id, userId: session.user.id }
    })

    if (!site) {
        return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    // Perform inspection
    const result = await inspectUrl(id, url)

    // Update database
    await prisma.urlAudit.update({
        where: { 
            siteId_url: { siteId: id, url: result.url } 
        },
        data: {
            inspectionStatus: result.inspectionStatus,
            lastCrawlTime: result.lastCrawlTime,
            isMobileFriendly: result.isMobileFriendly,
            updatedAt: new Date()
        }
    })

    return NextResponse.json({ message: "URL inspected successfully", data: result })
  } catch (error: any) {
    console.error(`[INSPECT_SINGLE_ERROR]:`, error)
    return NextResponse.json(
        { error: error.message || "Failed to inspect URL" }, 
        { status: 500 }
    )
  }
}
