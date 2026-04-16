import { NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getServerAuthSession()

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const userId = session.user.id

    // Verify ownership and fetch site with late-night stats
    const site = await prisma.site.findUnique({
      where: { 
        id, 
        userId,
        deletedAt: null
      },
      include: {
        audits: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    })

    if (!site) {
      return new NextResponse("Not Found", { status: 404 })
    }

    // Aggregated stats for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const performance = await prisma.sitePerformance.findMany({
      where: { siteId: id, date: { gte: thirtyDaysAgo } },
    })

    const totalClicks = performance.reduce((sum, p) => sum + p.clicks, 0)
    const totalImpressions = performance.reduce((sum, p) => sum + p.impressions, 0)
    const avgPosition = performance.length > 0 
      ? performance.reduce((sum, p) => sum + (p.position || 0), 0) / performance.length
      : 0

    return NextResponse.json({
      site,
      stats: {
        totalClicks,
        totalImpressions,
        avgPosition: avgPosition.toFixed(1)
      }
    })
  } catch (error) {
    console.error("[METRICS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
