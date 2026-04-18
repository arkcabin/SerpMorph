import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { formatGscDomain } from "@/lib/utils"
import { getTodaysUsage } from "@/lib/indexing"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(req.url)

  const limit = parseInt(searchParams.get("limit") || "1000")
  const offset = parseInt(searchParams.get("offset") || "0")
  const search = searchParams.get("search") || ""

  try {
    const [urls, total, dailyQuotaCount] = await Promise.all([
      prisma.urlAudit.findMany({
        where: {
          siteId: id,
          url: { contains: search, mode: "insensitive" },
        },
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.urlAudit.count({
        where: {
          siteId: id,
          url: { contains: search, mode: "insensitive" },
        },
      }),
      getTodaysUsage(id),
    ])

    return NextResponse.json({
      data: urls,
      total,
      limit,
      offset,
      quotaUsage: dailyQuotaCount,
    })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  try {
    const site = await prisma.site.findUnique({
      where: { id },
    })

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    const domain = formatGscDomain(site.domain)
    const sitemapUrl = `https://${domain}/sitemap.xml`

    console.log(`[Sitemap] Primary fetch from ${sitemapUrl}`)

    async function fetchSitemapUrls(url: string, depth = 0): Promise<string[]> {
      if (depth > 2) return [] // Safety limit

      try {
        const res = await fetch(url, {
          headers: { "User-Agent": "SeomoBot/1.0" },
        })
        if (!res.ok) return []

        const xml = await res.text()
        const urlRegex = /<loc>\s*(.*?)\s*<\/loc>/g
        const foundUrls: string[] = []
        let match

        while ((match = urlRegex.exec(xml)) !== null) {
          foundUrls.push(match[1].trim())
        }

        const pageUrls: string[] = []
        const subSitemaps: string[] = []

        for (const foundUrl of foundUrls) {
          if (foundUrl.endsWith(".xml") || foundUrl.includes("/sitemap")) {
            subSitemaps.push(foundUrl)
          } else {
            pageUrls.push(foundUrl)
          }
        }

        // Recursively fetch sub-sitemaps
        const subResults = await Promise.all(
          subSitemaps.map((subUrl) => fetchSitemapUrls(subUrl, depth + 1))
        )

        return [...pageUrls, ...subResults.flat()]
      } catch (err) {
        console.error(`[Sitemap] Error fetching ${url}:`, err)
        return []
      }
    }

    const allUrls = await fetchSitemapUrls(sitemapUrl)
    const domainPart = domain
      .replace("sc-domain:", "")
      .replace("https://", "")
      .replace("http://", "")
      .replace(/\/$/, "")

    const uniqueUrls = Array.from(new Set(allUrls))
      .filter((u) => u.startsWith("http"))
      .filter((u) => {
        // Ensure the URL belongs to the property domain
        try {
          const urlObj = new URL(u)
          return urlObj.hostname.includes(domainPart)
        } catch {
          return false
        }
      })

    const skippedCount = allUrls.length - uniqueUrls.length

    if (uniqueUrls.length === 0) {
      return NextResponse.json({
        message: `No page URLs matching ${domainPart} found in sitemap. ${skippedCount > 0 ? `Skipped ${skippedCount} foreign URLs.` : ""}`,
      })
    }

    console.log(
      `[Sitemap] Found ${uniqueUrls.length} valid page URLs. Skipped ${skippedCount} foreign URLs. Syncing...`
    )

    // Sync URLs to Database
    const results = await Promise.all(
      uniqueUrls.map((url) =>
        prisma.urlAudit.upsert({
          where: {
            siteId_url: {
              siteId: id,
              url: url,
            },
          },
          update: { updatedAt: new Date() },
          create: {
            siteId: id,
            url: url,
            inspectionStatus: "Pending",
          },
        })
      )
    )

    return NextResponse.json({
      success: true,
      count: results.length,
      message: `Successfully synced ${results.length} URLs from sitemap.`,
    })
  } catch (error: unknown) {
    console.error("[Sitemap Error]", error)
    const message =
      error instanceof Error
        ? error.message
        : "Internal server error during sitemap scan."
    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    )
  }
}
