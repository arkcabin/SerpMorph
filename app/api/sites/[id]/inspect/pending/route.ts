import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    
    // Get all pending URLs for this site
    const pendingUrls = await prisma.urlAudit.findMany({
      where: { 
        siteId: id,
        inspectionStatus: "Pending"
      },
      select: {
        url: true
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ 
      urls: pendingUrls.map(p => p.url),
      count: pendingUrls.length
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
