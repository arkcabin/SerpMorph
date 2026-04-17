import type { Metadata } from "next"
import { Geist_Mono, Outfit } from "next/font/google"

import "./globals.css"
import { RootProvider } from "@/components/providers/root-provider"
import { cn } from "@/lib/utils"

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: "Seomo | Modern SEO Intelligence",
    template: "%s | Seomo",
  },
  description:
    "Turn Google Search Console data into clear SEO actions. Seomo helps teams spot issues, prioritize fixes, and track progress.",
  icons: {
    icon: [
      {
        url: "/logo-dark.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/logo-light.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        outfit.variable
      )}
    >
      <body suppressHydrationWarning>
        <RootProvider>
          {children}
        </RootProvider>
      </body>
    </html>
  )
}
