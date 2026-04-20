import { NextRequest, NextResponse } from "next/server"
import { getServerAuthSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { inspectUrl } from "@/lib/gsc"

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
    const { url } = await req.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Verify site ownership
    const site = await prisma.site.findFirst({
      where: { id, userId: session.user.id },
    })

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    // Perform inspection
    const result = await inspectUrl(id, url)

    if (!result) {
      return NextResponse.json(
        {
          error:
            "Google returned no data for this URL. Ensure it is part of your property.",
        },
        { status: 400 }
      )
    }

    // Update database
    await prisma.urlAudit.update({
      where: {
        siteId_url: { siteId: id, url: result.url },
      },
      data: {
        inspectionStatus: result.inspectionStatus,
        lastCrawlTime: result.lastCrawlTime,
        isMobileFriendly: result.isMobileFriendly,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: "URL inspected successfully",
      data: result,
    })
  } catch (error: unknown) {
    console.error(`[INSPECT_SINGLE_ERROR]:`, error)

    const message =
      error instanceof Error ? error.message : "Failed to inspect URL"

    // Provide a more user-friendly message for common failures
    let status = 500
    let userMessage = message

    if (message.includes("GSC account not found")) {
      status = 403
      userMessage =
        "Google Search Console account not connected. Please go to settings and connect your Google account."
    } else if (
      message.includes("Permission denied") ||
      message.includes("not in property")
    ) {
      status = 403
      userMessage =
        "Access denied by Google. Verify that this URL belongs to your Search Console property."
    } else if (message.includes("quota")) {
      status = 429
      userMessage =
        "Google Search Console quota exceeded. Please try again in 24 hours."
    }

    return NextResponse.json({ error: userMessage, code: message }, { status })
  }
}
