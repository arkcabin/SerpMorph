import { createAuthClient } from "better-auth/react"

const runtimeOrigin =
  typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? runtimeOrigin,
})
