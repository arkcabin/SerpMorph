import Image from "next/image"
import Link from "next/link"
import { redirect } from "next/navigation"

import { GoogleAuthButton } from "@/components/auth/google-auth-button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getServerAuthSession } from "@/lib/session"

export default async function SignUpPage() {
  const session = await getServerAuthSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <main className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4 py-12">
      <div className="ambient-layer ambient-signup" />
      <Card className="z-10 w-full max-w-md border-border/80 bg-card/95 backdrop-blur">
        <CardHeader className="space-y-4 text-center">
          <div className="mb-2 flex items-center justify-center gap-2">
            <div className="relative size-8">
              <Image
                src="/logo-dark.png"
                alt="Seomo"
                fill
                className="block object-contain dark:hidden"
              />
              <Image
                src="/logo-light.png"
                alt="Seomo"
                fill
                className="hidden object-contain dark:block"
              />
            </div>
            <div className="relative h-6 w-20">
              <Image
                src="/Seomo-dark.png"
                alt="Seomo"
                fill
                className="block object-contain dark:hidden"
              />
              <Image
                src="/Seomo-light.png"
                alt="Seomo"
                fill
                className="hidden object-contain dark:block"
              />
            </div>
          </div>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>
            Join Seomo to connect Google Search Console and monitor SEO growth.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <GoogleAuthButton label="Sign up with Google" />
          <p className="text-center text-sm text-muted-foreground">
            Google sign-up is enabled. Email sign-up will be available in a
            future update.
          </p>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              className="font-medium text-foreground underline underline-offset-4"
              href="/auth/signin"
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
