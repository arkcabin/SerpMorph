import { headers } from "next/headers"

import { auth } from "@/lib/auth"

export async function getServerAuthSession() {
  const requestHeaders = await headers()
  return auth.api.getSession({
    headers: requestHeaders,
  })
}
