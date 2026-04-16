import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/session";
import { getGscAuthUrl } from "@/lib/gsc";

export async function GET() {
	const session = await getServerAuthSession();

	if (!session?.user) {
		return new Response("Unauthorized", { status: 401 });
	}

	const authUrl = getGscAuthUrl();
	redirect(authUrl);
}
