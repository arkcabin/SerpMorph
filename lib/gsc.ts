import { google } from "googleapis";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/encryption";

const oauth2Client = new google.auth.OAuth2(
	process.env.GOOGLE_CLIENT_ID,
	process.env.GOOGLE_CLIENT_SECRET,
	`${process.env.BETTER_AUTH_URL}/api/gsc/auth/callback`
);

const SCOPES = [
	"https://www.googleapis.com/auth/webmasters.readonly",
	"https://www.googleapis.com/auth/userinfo.email",
	"https://www.googleapis.com/auth/userinfo.profile",
];

/**
 * Helper to get a configured GSC client with decrypted tokens
 */
export function getGscClient(encryptedAccessToken: string, encryptedRefreshToken: string) {
  const accessToken = decrypt(encryptedAccessToken);
  const refreshToken = decrypt(encryptedRefreshToken);

  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.BETTER_AUTH_URL}/api/gsc/auth/callback`
  );

  client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return client;
}

export function getGscAuthUrl() {
	return oauth2Client.generateAuthUrl({
		access_type: "offline",
		scope: SCOPES,
		prompt: "consent",
	});
}

export async function getGscTokens(code: string) {
	const { tokens } = await oauth2Client.getToken(code);
	return tokens;
}

export async function getGscUserInfo(tokens: any) {
	oauth2Client.setCredentials(tokens);
	const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
	const { data } = await oauth2.userinfo.get();
	return data;
}

export async function syncGscProperties(userId: string, gscAccountId: string) {
	const gscAccount = await prisma.gscAccount.findUnique({
		where: { id: gscAccountId },
	});

	if (!gscAccount) throw new Error("GSC Account not found");

	// Decrypt tokens before using them with Google API
	const accessToken = decrypt(gscAccount.accessToken);
	const refreshToken = decrypt(gscAccount.refreshToken);

	oauth2Client.setCredentials({
		access_token: accessToken,
		refresh_token: refreshToken,
	});

	const searchconsole = google.searchconsole({ version: "v1", auth: oauth2Client });
	const response = await searchconsole.sites.list();

	const properties = response.data.siteEntry || [];

	const sites = await Promise.all(
		properties.map(async (prop) => {
			if (!prop.siteUrl) return null;
			
			return prisma.site.upsert({
				where: {
					domain_userId: {
						domain: prop.siteUrl,
						userId: userId,
					},
				},
				update: {
					gscAccountId: gscAccountId,
				},
				create: {
					domain: prop.siteUrl,
					userId: userId,
					gscAccountId: gscAccountId,
				},
			});
		})
	);

	return sites.filter(Boolean);
}

export async function syncSitePerformance(siteId: string, days: number = 30) {
	const site = await prisma.site.findUnique({
		where: { id: siteId },
		include: { gscAccount: true },
	});

	if (!site || !site.gscAccount) throw new Error("Site or associated GSC account not found");

	const accessToken = decrypt(site.gscAccount.accessToken);
	const refreshToken = decrypt(site.gscAccount.refreshToken);

	oauth2Client.setCredentials({
		access_token: accessToken,
		refresh_token: refreshToken,
	});

	const searchconsole = google.searchconsole({ version: "v1", auth: oauth2Client });

	// GSC data usually has a 2-3 day lag. We fetch up to today, but expect results to be delayed.
	const endDate = new Date().toISOString().split("T")[0];
	const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

	const res = await searchconsole.searchanalytics.query({
		siteUrl: site.domain,
		requestBody: {
			startDate,
			endDate,
			dimensions: ["date"],
		},
	});

	const rows = res.data.rows || [];

	for (const row of rows) {
		if (!row.keys || !row.keys[0]) continue;
		const date = new Date(row.keys[0]);

		await prisma.sitePerformance.upsert({
			where: {
				siteId_date: { siteId, date },
			},
			update: {
				clicks: Math.floor(row.clicks || 0),
				impressions: Math.floor(row.impressions || 0),
				ctr: row.ctr || 0,
				position: row.position || 0,
			},
			create: {
				siteId,
				date,
				clicks: Math.floor(row.clicks || 0),
				impressions: Math.floor(row.impressions || 0),
				ctr: row.ctr || 0,
				position: row.position || 0,
			},
		});
	}
}

export async function syncKeywordPerformance(siteId: string, days: number = 7) {
	const site = await prisma.site.findUnique({
		where: { id: siteId },
		include: { gscAccount: true },
	});

	if (!site || !site.gscAccount) throw new Error("Site or associated GSC account not found");

	const accessToken = decrypt(site.gscAccount.accessToken);
	const refreshToken = decrypt(site.gscAccount.refreshToken);

	oauth2Client.setCredentials({
		access_token: accessToken,
		refresh_token: refreshToken,
	});

	const searchconsole = google.searchconsole({ version: "v1", auth: oauth2Client });

	const endDate = new Date().toISOString().split("T")[0];
	const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

	const res = await searchconsole.searchanalytics.query({
		siteUrl: site.domain,
		requestBody: {
			startDate,
			endDate,
			dimensions: ["query", "date"],
			rowLimit: 100, // Sync top 100 keywords for the period
		},
	});

	const rows = res.data.rows || [];

	for (const row of rows) {
		if (!row.keys || row.keys.length < 2) continue;
		const keyword = row.keys[0];
		const date = new Date(row.keys[1]);

		await prisma.keywordPerformance.upsert({
			where: {
				siteId_date_keyword: { siteId, date, keyword },
			},
			update: {
				clicks: Math.floor(row.clicks || 0),
				impressions: Math.floor(row.impressions || 0),
				ctr: row.ctr || 0,
				position: row.position || 0,
			},
			create: {
				siteId,
				date,
				keyword,
				clicks: Math.floor(row.clicks || 0),
				impressions: Math.floor(row.impressions || 0),
				ctr: row.ctr || 0,
				position: row.position || 0,
			},
		});
	}
}

export async function syncAllSiteData(siteId: string) {
	await syncSitePerformance(siteId, 30);
	await syncKeywordPerformance(siteId, 30);
}

export async function inspectUrl(siteId: string, url: string) {
	const site = await prisma.site.findUnique({
		where: { id: siteId },
		include: { gscAccount: true },
	});

	if (!site || !site.gscAccount) throw new Error("Site or associated GSC account not found");

	const accessToken = decrypt(site.gscAccount.accessToken);
	const refreshToken = decrypt(site.gscAccount.refreshToken);

	oauth2Client.setCredentials({
		access_token: accessToken,
		refresh_token: refreshToken,
	});

	const searchconsole = google.searchconsole({ version: "v1", auth: oauth2Client });

	// Use the URL Inspection API to get real-time indexing data from Google
	const res = await searchconsole.urlInspection.index.inspect({
		requestBody: {
			inspectionUrl: url,
			siteUrl: site.domain,
		},
	});

	const result = res.data.inspectionResult;
	if (!result) throw new Error("No inspection results returned from Google");

	const indexStatus = result.indexStatusResult;

	// Upsert the audit result
	return prisma.urlAudit.upsert({
		where: {
			// Note: ensure we have a unique constraint or use a composite find logic.
			// Currently using find-then-update logic for safety if unique is missing.
			id: `audit-${siteId}-${Buffer.from(url).toString("base64")}` 
		},
		update: {
			inspectionStatus: indexStatus?.verdict || "UNKNOWN",
			lastCrawlTime: indexStatus?.lastCrawlTime ? new Date(indexStatus.lastCrawlTime) : null,
			isMobileFriendly: result.mobileUsabilityResult?.verdict === "PASS",
			sitemap: indexStatus?.sitemap?.join(", ") || null,
		},
		create: {
			id: `audit-${siteId}-${Buffer.from(url).toString("base64")}`,
			siteId,
			url,
			inspectionStatus: indexStatus?.verdict || "UNKNOWN",
			lastCrawlTime: indexStatus?.lastCrawlTime ? new Date(indexStatus.lastCrawlTime) : null,
			isMobileFriendly: result.mobileUsabilityResult?.verdict === "PASS",
			sitemap: indexStatus?.sitemap?.join(", ") || null,
		},
	});
}

export async function runSiteAudit(siteId: string) {
	const site = await prisma.site.findUnique({ where: { id: siteId } });
	if (!site) throw new Error("Site not found");

	// Start by inspecting the homepage (the root domain)
	return inspectUrl(siteId, site.domain);
}

export async function getGrowthInsights(siteId: string) {
	// 1. Fetch current keyword performance (last 7 days average)
	const now = new Date();
	const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
	const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

	const currentKeywords = await prisma.keywordPerformance.findMany({
		where: { siteId, date: { gte: sevenDaysAgo } },
	});

	const previousKeywords = await prisma.keywordPerformance.findMany({
		where: { siteId, date: { gte: fourteenDaysAgo, lt: sevenDaysAgo } },
	});

	const winners: any[] = [];
	const losers: any[] = [];
	const pageOneRadar: any[] = [];

	// Simple comparison logic
	currentKeywords.forEach((curr) => {
		const prev = previousKeywords.find((p) => p.keyword === curr.keyword);
		if (prev) {
			const delta = prev.position - curr.position;
			if (delta >= 3) winners.push({ ...curr, delta });
			if (delta <= -3) losers.push({ ...curr, delta });
		}

		// Edge of Page 1 Radar (Position 11-15)
		if (curr.position > 10 && curr.position < 16) {
			pageOneRadar.push(curr);
		}
	});

	return {
		winners: winners.sort((a, b) => b.delta - a.delta).slice(0, 5),
		losers: losers.sort((a, b) => a.delta - b.delta).slice(0, 5),
		pageOneRadar: pageOneRadar.sort((a, b) => a.position - b.position).slice(0, 5),
	};
}

export async function getVolatilityScore(siteId: string) {
	const performance = await prisma.sitePerformance.findMany({
		where: { siteId },
		orderBy: { date: "desc" },
		take: 14,
	});

	if (performance.length < 2) return 0;

	// Calculate standard deviation of position movements
	const movements = performance.slice(0, -1).map((p, i) => Math.abs(p.position - performance[i + 1].position));
	const avgMovement = movements.reduce((a, b) => a + b, 0) / movements.length;

	return avgMovement.toFixed(2);
}

export async function getCTROpportunities(siteId: string) {
	const currentKeywords = await prisma.keywordPerformance.findMany({
		where: { 
			siteId, 
			date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
		},
	});

	// Find keywords with > 300 impressions but < 2% CTR
	const opportunities = currentKeywords.filter(kw => {
		return kw.impressions > 300 && kw.ctr < 0.02;
	});

	return opportunities.sort((a, b) => b.impressions - a.impressions).slice(0, 5);
}

/**
 * Fetches sitemaps for the property and analyzes their health
 */
export async function getSitemapStatus(siteId: string) {
  const account = await prisma.site.findUnique({
    where: { id: siteId },
    include: { gscAccount: true }
  })

  if (!account?.gscAccount || !account.domain) return []

  const auth = getGscClient(account.gscAccount.accessToken, account.gscAccount.refreshToken)
  const gsc = google.searchconsole({ version: "v1", auth })

  try {
    const response = await gsc.sitemaps.list({
      siteUrl: account.domain
    })

    return response.data.sitemaps || []
  } catch (error) {
    console.error("Error fetching sitemaps:", error)
    return []
  }
}

/**
 * Computes a technical health score based on sitemaps and recent audits
 */
export async function getTechnicalHealth(siteId: string) {
  const sitemaps = await getSitemapStatus(siteId)
  const audits = await prisma.urlAudit.findMany({
    where: { siteId },
    orderBy: { updatedAt: "desc" },
    take: 10
  })

  let score = 100
  const issues: string[] = []

  // Sitemap Checks
  if (sitemaps.length === 0) {
    score -= 20
    issues.push("No sitemaps detected")
  } else {
    for (const s of sitemaps) {
      if (s.errors && parseInt(s.errors as string) > 0) {
        score -= 15
        issues.push(`Errors in sitemap: ${s.path}`)
      }
      if (s.warnings && parseInt(s.warnings as string) > 0) {
        score -= 5
      }
    }
  }

  // Audit Checks
  const failedAudits = audits.filter(a => a.inspectionStatus !== "INDEXED")
  if (failedAudits.length > 0) {
    score -= (failedAudits.length * 5)
    issues.push(`${failedAudits.length} recently scanned URLs are not indexed`)
  }

  return {
    score: Math.max(0, score),
    issues,
    sitemapCount: sitemaps.length,
    lastScanned: audits[0]?.updatedAt || null
  }
}
