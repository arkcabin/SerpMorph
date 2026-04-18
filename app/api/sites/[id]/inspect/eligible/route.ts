import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerAuthSession } from "@/lib/session"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Get all URLs eligible for indexing (not indexed, not queued)
    const eligibleUrls = await prisma.urlAudit.findMany({
      where: {
        siteId: id,
        inspectionStatus: {
          notIn: ["PASS", "Submitted"],
        },
      },
      select: {
        id: true,
        url: true,
        inspectionStatus: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 500, // Reasonable limit for the drawer pool
    })

    return NextResponse.json({
      urls: eligibleUrls,
      count: eligibleUrls.length,
    })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
