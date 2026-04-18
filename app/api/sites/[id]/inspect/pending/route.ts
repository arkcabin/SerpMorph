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

    // Get all pending URLs for this site
    const pendingUrls = await prisma.urlAudit.findMany({
      where: {
        siteId: id,
        inspectionStatus: "Pending",
      },
      select: {
        url: true,
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      urls: pendingUrls.map((p) => p.url),
      count: pendingUrls.length,
    })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
