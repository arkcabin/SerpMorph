import { prisma } from "@/lib/prisma"
import { formatGscDomain } from "@/lib/utils"

const OPENPAGERANK_API_KEY = process.env.OPENPAGERANK_API_KEY

/**
 * Fetches authority metrics from OpenPageRank (free API)
 */
async function fetchOpenPageRank(domain: string) {
  if (!OPENPAGERANK_API_KEY) {
    console.warn("OPENPAGERANK_API_KEY is not set. Skipping Rank sync.")
    return null
  }

  try {
    const cleanDomain = formatGscDomain(domain)
    const response = await fetch(
      `https://openpagerank.com/api/v1.0/getPageRank?domains[]=${cleanDomain}`,
      {
        headers: {
          "API-OPR": OPENPAGERANK_API_KEY,
        },
      }
    )

    if (!response.ok) return null
    const data = await response.json()
    const result = data?.response?.[0]

    return {
      rank: result?.page_rank_decimal
        ? parseFloat(result.page_rank_decimal)
        : null,
      position: result?.rank ? parseInt(result.rank) : null,
    }
  } catch (error) {
    console.error("OpenPageRank fetch failed:", error)
    return null
  }
}

/**
 * Fetches SSL and Security metrics from HackerTarget (Free tier)
 */
async function fetchSslStatus(domain: string) {
  try {
    const cleanDomain = formatGscDomain(domain)
    const response = await fetch(
      `https://api.hackertarget.com/sslcheck/?q=${cleanDomain}`
    )

    if (!response.ok) return null
    const text = await response.text()

    // Parse common line from HackerTarget SSL check
    // Format is usually: "Subject: CN=... \n Issuer: ... \n ... \n Expiry Date: ..."
    const lines = text.split("\n")
    const expiryLine = lines.find((l) =>
      l.toLowerCase().includes("expiry date:")
    )

    if (expiryLine) {
      const dateStr = expiryLine.split(":")[1]?.trim()
      return {
        status: "Valid",
        expiry: dateStr ? new Date(dateStr) : null,
      }
    }

    return { status: "Unknown", expiry: null }
  } catch (error) {
    console.error("SSL status fetch failed:", error)
    return null
  }
}

/**
 * Lightweight technology discovery via homepage crawl
 */
async function discoverTechStack(domain: string) {
  try {
    const cleanDomain = formatGscDomain(domain)
    const url = `https://${cleanDomain}`
    const response = await fetch(url, {
      headers: { "User-Agent": "SerpMorph-Intel-Bot/1.0" },
    })

    if (!response.ok) return null
    const html = await response.text()

    const techs: {
      frameworks: string[]
      cms: string[]
      clouds: string[]
      analytics: string[]
    } = {
      frameworks: [],
      cms: [],
      clouds: [],
      analytics: [],
    }

    // Frameworks & UI
    if (html.includes("next-head-count") || html.includes("__NEXT_DATA__"))
      techs.frameworks.push("Next.js")
    if (html.includes("react-root") || html.includes("/_next/static"))
      techs.frameworks.push("React")
    if (html.includes("tailwind") || html.includes("tw-"))
      techs.frameworks.push("Tailwind CSS")

    // CMS/E-commerce
    if (html.includes("wp-content") || html.includes("wp-includes"))
      techs.cms.push("WordPress")
    if (html.includes("ghost-head")) techs.cms.push("Ghost")
    if (html.includes("shopify-checkout") || html.includes("cdn.shopify.com"))
      techs.cms.push("Shopify")
    if (html.includes("wix-style") || html.includes("wix.com"))
      techs.cms.push("Wix")

    // Cloud & Infrastructure
    if (html.includes("cloudflare-static") || html.includes("ray-id:"))
      techs.clouds.push("Cloudflare")
    if (html.includes("vercel-") || html.includes("v0-"))
      techs.clouds.push("Vercel")

    // Analytics & Tracking
    if (html.includes("googletagmanager.com/gtm.js"))
      techs.analytics.push("GTM")
    if (html.includes("analytics.js") || html.includes("ga.js"))
      techs.analytics.push("Google Analytics")
    if (html.includes("static.hotjar.com")) techs.analytics.push("Hotjar")

    return techs
  } catch (error) {
    console.error("Tech stack discovery failed:", error)
    return null
  }
}

interface TechStack {
  frameworks: string[]
  cms: string[]
  clouds: string[]
  analytics: string[]
}

/**
 * Orchestrates the full intelligence sync for a site
 */
export async function syncSiteIntelligence(siteId: string) {
  const site = await prisma.site.findUnique({
    where: { id: siteId },
  })

  if (!site) throw new Error("Site not found")

  const domain = site.domain

  // Fetch in parallel
  const [authority, ssl, tech] = await Promise.all([
    fetchOpenPageRank(domain),
    fetchSslStatus(domain),
    discoverTechStack(domain),
  ])

  // Upsert intelligence record
  return prisma.siteIntelligence.upsert({
    where: { siteId },
    update: {
      rank: authority?.rank,
      position: authority?.position,
      sslStatus: ssl?.status,
      sslExpiry: ssl?.expiry,
      techStack: tech as TechStack | null,
      lastSync: new Date(),
    },
    create: {
      siteId,
      rank: authority?.rank,
      position: authority?.position,
      sslStatus: ssl?.status,
      sslExpiry: ssl?.expiry,
      techStack: tech as TechStack | null,
      lastSync: new Date(),
    },
  })
}
