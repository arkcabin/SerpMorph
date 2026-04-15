"use client"

import { authClient } from "@/lib/auth-client"

import { Button } from "@/components/ui/button"

type GoogleAuthButtonProps = {
  callbackUrl?: string
  label?: string
}

export function GoogleAuthButton({
  callbackUrl = "/dashboard",
  label = "Continue with Google",
}: GoogleAuthButtonProps) {
  async function handleGoogleAuth() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: callbackUrl,
    })
  }

  return (
    <Button
      className="w-full"
      onClick={handleGoogleAuth}
      type="button"
    >
      {label}
    </Button>
  )
}
