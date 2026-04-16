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
