import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { inspectUrl } from "@/lib/gsc"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  try {
    // 1. Fetch the oldest 5 "Pending" URLs for this site
    // This allows drip-feeding the inspection to avoid hitting GSC rate limits
    const pendingUrls = await prisma.urlAudit.findMany({
      where: { 
        siteId: id,
        inspectionStatus: "Pending" 
      },
      orderBy: { createdAt: "asc" },
      take: 10
    })

    if (pendingUrls.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "All URLs have been inspected.",
        count: 0 
      })
    }

    console.log(`[Inspection] Processing batch of ${pendingUrls.length} URLs for site ${id}`)

    // 2. Run inspections in parallel with detailed error tracking
    const results = await Promise.allSettled(
      pendingUrls.map(async (audit) => {
        try {
          return await inspectUrl(id, audit.url)
        } catch (err: any) {
          console.error(`[Inspection] Failed for URL ${audit.url}:`, err.response?.data || err.message)
          throw err
        }
      })
    )

    const successCount = results.filter(r => r.status === "fulfilled").length
    const errorCount = results.length - successCount
    const firstError = results.find(r => r.status === "rejected") as PromiseRejectedResult | undefined

    return NextResponse.json({ 
      success: true, 
      count: results.length,
      successCount,
      errorCount,
      message: `Processed ${successCount} URLs successfully. ${errorCount > 0 ? `${errorCount} failed.` : ""}`,
      firstError: firstError?.reason?.message || firstError?.reason || null
    })

  } catch (error: any) {
    console.error("[Inspection Process Error]", error)
    return NextResponse.json({ 
      error: "Failed to process inspection batch.",
      details: error.message 
    }, { status: 500 })
  }
}
