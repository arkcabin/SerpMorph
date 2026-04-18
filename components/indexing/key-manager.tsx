"use client"

import * as React from "react"
import { useIndexingKeys } from "@/hooks/use-indexing-keys"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Key,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  HelpCircle,
  Settings2,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface KeyManagerProps {
  siteId: string
}

export function KeyManager({ siteId }: KeyManagerProps) {
  const { key, uploadKey, unlinkKey } = useIndexingKeys(siteId)
  const [jsonInput, setJsonInput] = React.useState("")
  const [keyName, setKeyName] = React.useState("")

  const handleUpload = async () => {
    if (!jsonInput || !keyName) {
      toast.error("Please provide both a name and the JSON content.")
      return
    }
    try {
      await uploadKey({ name: keyName, json: jsonInput })
      setJsonInput("")
      setKeyName("")
    } catch {
      // Error handled by hook
    }
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 border-border/50 bg-background/50 font-semibold shadow-xs"
        >
          <Settings2 className="size-3.5" />
          Configure Indexing
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Key className="size-5 text-primary" />
            Google Indexing Setup
          </SheetTitle>
          <SheetDescription>
            Configure your Google Service Account to enable high-speed bulk
            indexing (200 URLs/day per key).
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Status Card */}
          <div
            className={cn(
              "rounded-xl border p-4 transition-all",
              key
                ? "border-emerald-500/20 bg-emerald-500/5"
                : "border-dashed border-muted-foreground/20 bg-muted/30"
            )}
          >
            {key ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500/10">
                      <CheckCircle2 className="size-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-600">
                        {key.name}
                      </p>
                      <p className="text-[10px] font-black tracking-widest text-emerald-600/60 uppercase">
                        Active Indexing Key
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-red-500 hover:bg-red-500/10 hover:text-red-600"
                    onClick={() => unlinkKey()}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <AlertCircle className="mx-auto mb-2 size-8 text-muted-foreground/30" />
                <p className="text-sm font-semibold text-muted-foreground">
                  No Indexing Key Active
                </p>
                <p className="mx-auto mt-1 max-w-[200px] text-[11px] text-muted-foreground/60">
                  Upload a Service Account JSON to start indexing your pages.
                </p>
              </div>
            )}
          </div>

          {!key && (
            <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4">
              <div className="space-y-2">
                <label className="px-1 text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
                  Key Nickname
                </label>
                <Input
                  placeholder="e.g. My Portfolio Indexer"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <label className="px-1 text-[11px] font-bold tracking-widest text-muted-foreground uppercase">
                  Service Account JSON
                </label>
                <textarea
                  className="flex min-h-[160px] w-full rounded-md border border-input bg-background/50 px-3 py-2 font-mono text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder='{ "type": "service_account", ... }'
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                />
              </div>
              <Button
                className="h-10 w-full gap-2 font-bold"
                onClick={handleUpload}
                disabled={!jsonInput || !keyName}
              >
                <Upload className="size-4" />
                Activate Indexer
              </Button>
            </div>
          )}

          {/* How-to Guide */}
          <div className="space-y-3 pt-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="size-4 text-primary" />
              <h3 className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
                Setup Instructions
              </h3>
            </div>
            <div className="space-y-2 text-[12px] leading-relaxed text-muted-foreground">
              <p>
                1. Go to{" "}
                <a
                  href="https://console.cloud.google.com"
                  target="_blank"
                  className="inline-flex items-center gap-1 text-primary hover:underline"
                >
                  Magic Console <ExternalLink className="size-2.5" />
                </a>{" "}
                and enable the <b>Indexing API</b>.
              </p>
              <p>
                2. Create a <b>Service Account</b> and generate a new{" "}
                <b>JSON Key</b>.
              </p>
              <p>
                3.{" "}
                <span className="rounded border-amber-500/20 bg-amber-500/5 px-1 py-0.5 font-bold text-foreground italic underline">
                  CRITICAL:
                </span>{" "}
                Add the service account email as an <b>Owner</b> in Google
                Search Console.
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
