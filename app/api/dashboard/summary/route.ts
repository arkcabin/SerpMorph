import { NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await getServerAuthSession()

  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const userId = session.user.id

    // 1. Fetch all sites for the user
    const sites = await prisma.site.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    const siteIds = sites.map((s) => s.id)

    // 2. Fetch performance data for all sites (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const performance = await prisma.sitePerformance.findMany({
      where: { 
        siteId: { in: siteIds },
        date: { gte: thirtyDaysAgo }
      },
      orderBy: { date: "asc" },
    })

    // 3. Fetch top keywords across all properties
    const topKeywords = await prisma.keywordPerformance.findMany({
      where: { 
        siteId: { in: siteIds },
        date: { gte: thirtyDaysAgo }
      },
      orderBy: { clicks: "desc" },
      take: 5,
    })

    // 4. Calculate aggregated metrics
    const totalClicks = performance.reduce((sum, p) => sum + p.clicks, 0)
    const totalImpressions = performance.reduce((sum, p) => sum + p.impressions, 0)
    const avgPosition = performance.length > 0 
      ? (performance.reduce((sum, p) => sum + (p.position || 0), 0) / performance.length)
      : null

    return NextResponse.json({
      sites: sites.map(s => ({
        id: s.id,
        domain: s.domain,
        createdAt: s.createdAt,
      })),
      stats: {
        totalClicks,
        totalImpressions,
        avgPosition: avgPosition ? avgPosition.toFixed(1) : "-",
      },
      performance: performance.map(p => ({
        date: p.date,
        clicks: p.clicks,
        impressions: p.impressions,
      })),
      topKeywords: topKeywords.map(k => ({
        id: k.id,
        keyword: k.keyword,
        clicks: k.clicks,
        siteId: k.siteId,
      }))
    })
  } catch (error) {
    console.error("[DASHBOARD_SUMMARY_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
