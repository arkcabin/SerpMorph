import { NextRequest, NextResponse } from "next/server";
import { getServerAuthSession } from "@/lib/session";
import { runSiteAudit } from "@/lib/gsc";

/**
 * API Endpoint to trigger a real-time URL inspection/audit for a site.
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerAuthSession();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { siteId } = await req.json();
        if (!siteId) {
            return NextResponse.json({ error: "siteId is required" }, { status: 400 });
        }

        // Run the Google URL Inspection for the site's homepage
        const audit = await runSiteAudit(siteId);

        return NextResponse.json({ success: true, audit });
    } catch (error: any) {
        console.error("Audit API Error:", error);
        return NextResponse.json({ 
            error: error.message || "Failed to run audit" 
        }, { status: 500 });
    }
}
