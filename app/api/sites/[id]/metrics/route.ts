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
        deletedAt: null,
      },
      include: {
        audits: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    })

    if (!site) {
      return new NextResponse("Not Found", { status: 404 })
    }

    // Aggregated stats for the last 30 days (current)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Previous period (31-60 days ago)
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    const allPerformance = await prisma.sitePerformance.findMany({
      where: { siteId: id, date: { gte: sixtyDaysAgo } },
      orderBy: { date: "asc" },
    })

    const currentPerformance = allPerformance.filter(
      (p) => p.date >= thirtyDaysAgo
    )
    const previousPerformance = allPerformance.filter(
      (p) => p.date >= sixtyDaysAgo && p.date < thirtyDaysAgo
    )

    const calculateStats = (perf: typeof allPerformance) => {
      const totalClicks = perf.reduce((sum, p) => sum + p.clicks, 0)
      const totalImpressions = perf.reduce((sum, p) => sum + p.impressions, 0)
      const avgPosition =
        perf.length > 0
          ? perf.reduce((sum, p) => sum + (p.position || 0), 0) / perf.length
          : 0
      return { totalClicks, totalImpressions, avgPosition }
    }

    const currentStats = calculateStats(currentPerformance)
    const previousStats = calculateStats(previousPerformance)

    const calculateDelta = (current: number, previous: number) => {
      if (previous === 0) return 0
      return ((current - previous) / previous) * 100
    }

    // For position, Down is Good (Lower rank is better)
    const calculatePositionDelta = (current: number, previous: number) => {
      if (previous === 0) return 0
      return previous - current // Positive means improvement
    }

    return NextResponse.json({
      site,
      stats: {
        totalClicks: currentStats.totalClicks,
        totalImpressions: currentStats.totalImpressions,
        avgPosition: currentStats.avgPosition.toFixed(1),
        clicksDelta: calculateDelta(
          currentStats.totalClicks,
          previousStats.totalClicks
        ),
        impressionsDelta: calculateDelta(
          currentStats.totalImpressions,
          previousStats.totalImpressions
        ),
        positionDelta: calculatePositionDelta(
          currentStats.avgPosition,
          previousStats.avgPosition
        ),
      },
    })
  } catch (error) {
    console.error("[METRICS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
