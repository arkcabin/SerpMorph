import { NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { publishIndexingRequest } from "@/lib/indexing"

/**
 * Endpoint to push URLs to Google Indexing API.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const { url, urls } = await req.json()

    // 1. Resolve URLs to push
    const urlsToPush = urls || (url ? [url] : [])
    if (urlsToPush.length === 0) {
      return NextResponse.json({ error: "No URLs provided" }, { status: 400 })
    }

    // 2. Get Site and its Indexing Key
    const site = await prisma.site.findFirst({
      where: { id, userId: session.user.id },
      include: { indexingKey: true },
    })

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    const serviceAccountJson =
      site.indexingKey?.serviceAccountJson ||
      process.env.MASTER_INDEXING_SERVICE_ACCOUNT ||
      ""
    const keyId = site.indexingKey?.id

    // 3. Process URLs one-by-one (Bulk support)
    const results = []
    const errors = []

    for (const targetUrl of urlsToPush) {
      try {
        const result = await publishIndexingRequest(
          id,
          targetUrl,
          serviceAccountJson,
          keyId
        )
        results.push(result)

        // Update DB status to 'Submitted'
        await prisma.urlAudit.updateMany({
          where: { siteId: id, url: targetUrl },
          data: { inspectionStatus: "Submitted", updatedAt: new Date() },
        })

        // Artificial delay to respect rate limits if bulk
        if (urlsToPush.length > 1) {
          await new Promise((resolve) => setTimeout(resolve, 300))
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Indexing failed"
        errors.push({ url: targetUrl, error: message })
      }
    }

    return NextResponse.json({
      message: "Indexing requests processed",
      successCount: results.length,
      errorCount: errors.length,
      results,
      errors,
    })
  } catch (error: unknown) {
    console.error(`[INDEXING_PUSH_ERROR]:`, error)
    const message =
      error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
