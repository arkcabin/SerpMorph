import { NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { syncSiteIntelligence } from "@/lib/intelligence"

/**
 * GET site intelligence data
 */
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
    const intelligence = await prisma.siteIntelligence.findUnique({
      where: { siteId: id },
    })

    return NextResponse.json(intelligence)
  } catch (error) {
    console.error("[INTELLIGENCE_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}

/**
 * POST trigger intelligence sync
 */
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
    // Verify ownership
    const site = await prisma.site.findUnique({
      where: { id, userId: session.user.id },
    })

    if (!site) {
      return new NextResponse("Not Found", { status: 404 })
    }

    const result = await syncSiteIntelligence(id)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[INTELLIGENCE_POST_SYNC]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
