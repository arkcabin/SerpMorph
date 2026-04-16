"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2Icon, AlertCircleIcon, RefreshCwIcon, ShieldCheckIcon, GlobeIcon, FileTextIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface AuditPanelProps {
  siteId: string
  lastAudit?: {
    inspectionStatus: string | null
    lastCrawlTime: Date | null
    isMobileFriendly: boolean | null
    sitemap: string | null
    updatedAt: Date
  }
}

export function AuditPanel({ siteId, lastAudit }: AuditPanelProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleRunAudit() {
    setLoading(true)
    try {
      const res = await fetch("/api/audit/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteId }),
      })
      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to run audit:", error)
    } finally {
      setLoading(false)
    }
  }

  const isIndexed = lastAudit?.inspectionStatus === "INDEXED" || lastAudit?.inspectionStatus === "URL_IS_ON_GOOGLE"

  return (
    <Card className="border-border/50 shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/10 border-b flex flex-row items-center justify-between space-y-0 py-4">
        <div>
          <CardTitle className="text-lg">SEO Health Check</CardTitle>
          <CardDescription>Live URL Inspection from Google</CardDescription>
        </div>
        <Button 
          size="sm" 
          onClick={handleRunAudit} 
          disabled={loading}
          className="gap-2"
        >
          <RefreshCwIcon className={`size-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Inspecting..." : "Scan Now"}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="grid divide-y md:grid-cols-3 md:divide-x md:divide-y-0">
          {/* Indexing Status */}
          <div className="p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              <GlobeIcon className="size-3.5" />
              Index Status
            </div>
            {lastAudit ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {isIndexed ? (
                    <CheckCircle2Icon className="size-5 text-emerald-500" />
                  ) : (
                    <AlertCircleIcon className="size-5 text-amber-500" />
                  )}
                  <span className="font-bold text-sm">
                    {lastAudit.inspectionStatus?.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground italic">
                  Last Crawl: {lastAudit.lastCrawlTime ? new Date(lastAudit.lastCrawlTime).toLocaleString() : "Unknown"}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic py-2">No scan data available.</p>
            )}
          </div>

          {/* Mobile Friendliness */}
          <div className="p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              <ShieldCheckIcon className="size-3.5" />
              Mobile Health
            </div>
            {lastAudit ? (
              <div className="flex items-center gap-2">
                {lastAudit.isMobileFriendly ? (
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full text-xs font-bold">
                    <CheckCircle2Icon className="size-3.5" /> Pass
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-rose-600 bg-rose-500/10 px-2.5 py-1 rounded-full text-xs font-bold">
                    <AlertCircleIcon className="size-3.5" /> Issues
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground italic py-2">Run scan to check mobile health.</p>
            )}
          </div>

          {/* Sitemap Status */}
          <div className="p-6 flex flex-col gap-3">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              <FileTextIcon className="size-3.5" />
              Sitemaps
            </div>
            {lastAudit?.sitemap ? (
               <div className="truncate text-xs font-medium text-muted-foreground max-w-full hover:text-foreground transition-colors cursor-help" title={lastAudit.sitemap}>
                  {lastAudit.sitemap.split(",")[0]}
               </div>
            ) : (
              <p className="text-sm text-muted-foreground italic py-2">No sitemap data found.</p>
            )}
          </div>
        </div>
      </CardContent>
      {lastAudit && (
        <div className="bg-muted/5 border-t px-6 py-3 text-[10px] text-muted-foreground flex justify-between">
          <span>Google Search Console API (v1)</span>
          <span>Last sync: {new Date(lastAudit.updatedAt).toLocaleString()}</span>
        </div>
      )}
    </Card>
  )
}
