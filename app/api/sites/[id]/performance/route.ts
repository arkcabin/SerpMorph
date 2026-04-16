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
    // Verify ownership
    const site = await prisma.site.findUnique({
      where: { 
        id, 
        userId: session.user.id,
        deletedAt: null
      }
    })

    if (!site) {
      return new NextResponse("Not Found", { status: 404 })
    }

    const performance = await prisma.sitePerformance.findMany({
      where: { siteId: id },
      orderBy: { date: "asc" },
    })

    return NextResponse.json(performance)
  } catch (error) {
    console.error("[PERFORMANCE_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
