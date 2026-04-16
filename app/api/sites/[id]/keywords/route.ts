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
      where: { id, userId: session.user.id }
    })

    if (!site) {
      return new NextResponse("Not Found", { status: 404 })
    }

    const keywords = await prisma.keywordPerformance.findMany({
      where: { siteId: id },
      orderBy: { clicks: "desc" },
      take: 50,
    })

    return NextResponse.json(keywords)
  } catch (error) {
    console.error("[KEYWORDS_GET]", error)
    return new NextResponse("Internal Error", { status: 500 })
  }
}
