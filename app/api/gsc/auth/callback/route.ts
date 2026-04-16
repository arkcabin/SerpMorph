import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/session";
import { getGscTokens, getGscUserInfo, syncGscProperties, syncAllSiteData } from "@/lib/gsc";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/encryption";

export async function GET(req: NextRequest) {
	const session = await getServerAuthSession();

	if (!session?.user) {
		return new Response("Unauthorized", { status: 401 });
	}

	const searchParams = req.nextUrl.searchParams;
	const code = searchParams.get("code");

	if (!code) {
		return new Response("Missing code", { status: 400 });
	}

	try {
		const tokens = await getGscTokens(code);
		const userInfo = await getGscUserInfo(tokens);

		if (!userInfo.email) {
			return new Response("Could not retrieve Google account email", { status: 400 });
		}

		// Save the GSC account (linked to the user)
		// We use upsert to update tokens if the account is already connected
		const gscAccount = await prisma.gscAccount.upsert({
			where: {
				id: `gsc-${session.user.id}-${userInfo.email}`, // Simple unique ID for the link
			},
			update: {
				accessToken: encrypt(tokens.access_token!),
				...(tokens.refresh_token && { refreshToken: encrypt(tokens.refresh_token) }),
				accessTokenExpiresAt: new Date(Date.now() + (tokens.expiry_date ? Math.floor(tokens.expiry_date) : 3600 * 1000)),
			},
			create: {
				id: `gsc-${session.user.id}-${userInfo.email}`,
				userId: session.user.id,
				googleEmail: userInfo.email,
				accessToken: encrypt(tokens.access_token!),
				refreshToken: encrypt(tokens.refresh_token || ""),
				accessTokenExpiresAt: new Date(Date.now() + (tokens.expiry_date ? Math.floor(tokens.expiry_date) : 3600 * 1000)),
			},
		});

		// Start initial property sync
		const syncedSites = await syncGscProperties(session.user.id, gscAccount.id);

		// Sync performance data for each site in the background (or sequential here for initial)
		for (const site of syncedSites) {
			if (site) {
				console.log(`Initial sync for ${site.domain}...`);
				try {
					await syncAllSiteData(site.id);
				} catch (err) {
					console.error(`Failed to sync data for ${site.domain}:`, err);
				}
			}
		}

		return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
	} catch (error) {
		console.error("GSC Auth Callback Error:", error);
		return new Response("Authentication failed", { status: 500 });
	}
}
