import { NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { 
  getGrowthInsights, 
  getVolatilityScore, 
  getCTROpportunities, 
  getTechnicalHealth 
} from "@/lib/gsc"

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
    // Verify ownership
    const site = await prisma.site.findUnique({
      where: { id, userId: session.user.id }
    })

    if (!site) {
      return new NextResponse("Not Found", { status: 404 })
    }

    const [growth, volatility, ctrOpportunities, techHealth] = await Promise.all([
      getGrowthInsights(id),
      getVolatilityScore(id),
      getCTROpportunities(id),
      getTechnicalHealth(id)
    ])

    return NextResponse.json({
      growth,
      volatility,
      ctrOpportunities,
      techHealth
    })
  } catch (error) {
    console.error("[INSIGHTS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
