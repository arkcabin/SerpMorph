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
