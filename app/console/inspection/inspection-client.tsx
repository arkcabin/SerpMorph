"use client"

import { toast } from "sonner"
import * as React from "react"
import { useSite } from "@/context/site-context"
import { useInspection, type UrlAudit } from "@/hooks/use-inspection"
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  SortingState,
  VisibilityState,
} from "@tanstack/react-table"
import { useQueryClient } from "@tanstack/react-query"
import {
  RefreshCcw,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Search,
  FileText,
  Globe,
  AlertCircle,
  Rocket,
  Zap,
  X,
  Check,
  Info,
} from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  DataGrid,
  DataGridContainer,
  DataGridTable,
  DataGridPagination,
  DataGridColumnHeader,
} from "@/components/reui/data-grid"
import { cn } from "@/lib/utils"

function getFixSuggestion(state: string | null): string {
  if (!state) return "Sync status to get more details."

  const s = state.toLowerCase()
  if (s.includes("unknown")) {
    return "Google doesn't know this URL exists. Click the 'Push to Index' rocket to introduce it."
  }
  if (s.includes("robots.txt")) {
    return "Your robots.txt file is blocking crawl. Check your server configuration."
  }
  if (s.includes("noindex")) {
    return "The page has a 'noindex' tag. Remove it if you want the page displayed in search."
  }
  if (s.includes("crawled") && s.includes("not indexed")) {
    return "Google found the page but chose not to index it. Improve content quality or uniqueness."
  }
  if (s.includes("discovered") && s.includes("not indexed")) {
    return "Google knows about the page but hasn't had time to crawl it yet. Boost internal linking."
  }
  if (s.includes("redirect")) {
    return "This URL redirects to another page. Ensure you are indexing the final destination."
  }
  if (s.includes("not found") || s.includes("404")) {
    return "Page returned a 404 error. Ensure the URL is correct and the page is live."
  }

  return "Monitor Search Console for updates or click 'Push to Index' to request a re-crawl."
}

export default function InspectionClient() {
  const { activeSiteId } = useSite()
  const queryClient = useQueryClient()
  const [search, setSearch] = React.useState("")
  const [debouncedSearch, setDebouncedSearch] = React.useState("")

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  })

  // Reset pagination when search changes
  React.useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [debouncedSearch])

  const [isBatchSyncing, setIsBatchSyncing] = React.useState(false)
  const [syncProgress, setSyncProgress] = React.useState({
    current: 0,
    total: 0,
  })
  const [syncingUrls, setSyncingUrls] = React.useState<Set<string>>(new Set())
  const [indexingUrls, setIndexingUrls] = React.useState<Set<string>>(new Set())
  const [isBulkDrawerOpen, setIsBulkDrawerOpen] = React.useState(false)
  const [eligibleUrls, setEligibleUrls] = React.useState<UrlAudit[]>([])
  const [isLoadingEligible, setIsLoadingEligible] = React.useState(false)
  const [selectedUrls, setSelectedUrls] = React.useState<Set<string>>(new Set())
  const abortControllerRef = React.useRef<AbortController | null>(null)

  const {
    urls,
    recordCount,
    quotaUsage,
    isLoading,
    isScanning,
    isPushing,
    scanSitemap,
    inspectSingle,
    pushIndexing,
  } = useInspection(activeSiteId, debouncedSearch, pagination.pageIndex)

  // Fetch site details to check GSC connection
  interface SiteDetails {
    gscAccountId?: string | null
  }
  const [siteDetails, setSiteDetails] = React.useState<SiteDetails | null>(null)
  React.useEffect(() => {
    if (!activeSiteId) return
    fetch(`/api/sites/${activeSiteId}`)
      .then((res) => res.json())
      .then((data) => setSiteDetails(data as SiteDetails))
      .catch(console.error)
  }, [activeSiteId])

  const handleSyncStatus = async () => {
    if (!activeSiteId) return

    // 0. Check GSC connection
    if (!siteDetails?.gscAccountId) {
      toast.error("Google Account Not Connected", {
        description:
          "Please connect your Google Search Console account in settings to sync statuses.",
        duration: 5000,
      })
      return
    }

    try {
      setIsBatchSyncing(true)
      setSyncProgress({ current: 0, total: 0 })
      let successCount = 0
      let failCount = 0

      // 1. Get all pending URLs
      const res = await fetch(`/api/sites/${activeSiteId}/inspect/pending`)
      const { urls: pendingUrls } = (await res.json()) as { urls: string[] }

      if (!pendingUrls?.length) {
        toast.info("No URLs found to sync.")
        setIsBatchSyncing(false)
        return
      }

      setSyncProgress({ current: 0, total: pendingUrls.length })

      // 2. Process one by one
      for (let i = 0; i < pendingUrls.length; i++) {
        if (abortControllerRef.current?.signal.aborted) break

        const url = pendingUrls[i]
        setSyncProgress((prev) => ({ ...prev, current: i + 1 }))

        try {
          setSyncingUrls((prev) => new Set(prev).add(url))
          await inspectSingle(url)
          successCount++
        } catch (err: unknown) {
          failCount++
          console.error(`Failed to sync ${url}:`, err)
        } finally {
          setSyncingUrls((prev) => {
            const next = new Set(prev)
            next.delete(url)
            return next
          })
        }
      }

      if (failCount > 0) {
        toast.warning("Synchronization completed with issues.", {
          description: `Synced ${successCount} URLs, but ${failCount} failed. Check your GSC permissions or property matching.`,
        })
      } else {
        toast.success(`Successfully synced ${successCount} URLs.`)
      }

      // Invalidate once at the end
      await queryClient.invalidateQueries({
        queryKey: ["inspection", activeSiteId],
      })
    } catch {
      toast.error("Failed to start synchronization cycle.")
    } finally {
      setIsBatchSyncing(false)
      setSyncProgress({ current: 0, total: 0 })
    }
  }

  const cancelSync = () => {
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()
    setIsBatchSyncing(false)
    toast.info("Synchronization cancelled.")
  }

  React.useEffect(() => {
    abortControllerRef.current = new AbortController()
    return () => abortControllerRef.current?.abort()
  }, [])

  const fetchEligibleUrls = async () => {
    if (!activeSiteId) return
    try {
      setIsLoadingEligible(true)
      const res = await fetch(`/api/sites/${activeSiteId}/inspect/eligible`)
      const data = await res.json()
      setEligibleUrls(data.urls || [])
    } catch {
      toast.error("Failed to fetch eligible URLs")
    } finally {
      setIsLoadingEligible(false)
    }
  }

  const toggleUrlSelection = (url: string) => {
    setSelectedUrls((prev) => {
      const next = new Set(prev)
      if (next.has(url)) {
        next.delete(url)
      } else {
        if (next.size >= 50) {
          toast.warning("Google allows max 50 batch requests at once.")
          return prev
        }
        next.add(url)
      }
      return next
    })
  }

  const handleBulkPush = async () => {
    if (selectedUrls.size === 0) return
    try {
      const urlsToPush = Array.from(selectedUrls)
      await pushIndexing({ urls: urlsToPush })
      setIsBulkDrawerOpen(false)
      setSelectedUrls(new Set())
    } catch {
      // Handled in hook
    }
  }

  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})

  const columns = React.useMemo<ColumnDef<UrlAudit>[]>(
    () => [
      {
        accessorKey: "url",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Property URL" />
        ),
        cell: ({ row }) => {
          const url = row.getValue("url") as string
          const isSyncing = syncingUrls.has(url)
          return (
            <div
              className={cn(
                "flex max-w-[500px] items-center gap-2 transition-opacity",
                isSyncing ? "opacity-100" : "opacity-100"
              )}
            >
              <Globe
                className={cn(
                  "size-3 shrink-0 transition-colors",
                  isSyncing
                    ? "animate-spin text-primary"
                    : "text-muted-foreground/50"
                )}
              />
              <span
                className={cn(
                  "truncate font-medium transition-colors",
                  isSyncing ? "animate-pulse text-primary" : ""
                )}
              >
                {url}
              </span>
            </div>
          )
        },
      },
      {
        accessorKey: "inspectionStatus",
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            title="Status"
            className="justify-end px-0"
          />
        ),
        cell: ({ row }) => {
          const status = row.getValue("inspectionStatus") as string

          const baseClass =
            "h-3 border-transparent px-1 py-0 text-[8px] font-bold tracking-wider uppercase rounded-[2px]"

          const renderBadge = () => {
            if (status === "PASS" || status === "Indexed") {
              return (
                <Badge
                  variant="outline"
                  className={cn(
                    baseClass,
                    "border-emerald-500/10 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10"
                  )}
                >
                  <CheckCircle2 className="mr-1 size-2" />
                  Indexed
                </Badge>
              )
            }
            if (status === "Submitted") {
              return (
                <Badge
                  variant="outline"
                  className={cn(
                    baseClass,
                    "border-indigo-500/10 bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/10"
                  )}
                >
                  <Rocket className="mr-1 size-2" />
                  Requested
                </Badge>
              )
            }
            if (status === "FAIL") {
              return (
                <Badge
                  variant="outline"
                  className={cn(
                    baseClass,
                    "border-red-500/10 bg-red-500/10 text-red-600 hover:bg-red-500/10"
                  )}
                >
                  <AlertCircle className="mr-1 size-2" />
                  Error
                </Badge>
              )
            }
            if (
              status === "NEUTRAL" ||
              status === "PARTIAL" ||
              status === "Excluded"
            ) {
              return (
                <Badge
                  variant="outline"
                  className={cn(
                    baseClass,
                    "border-amber-500/10 bg-amber-500/10 text-amber-600 hover:bg-amber-500/10"
                  )}
                >
                  Excluded
                </Badge>
              )
            }

            const isSyncing = syncingUrls.has(row.original.url)
            const isIndexing = indexingUrls.has(row.original.url)

            if (isSyncing || isIndexing) {
              return (
                <Badge
                  variant="outline"
                  className={cn(
                    baseClass,
                    "animate-pulse border-primary/10 bg-primary/10 text-primary hover:bg-primary/10"
                  )}
                >
                  <Loader2 className="mr-1 size-2 animate-spin" />
                  {isIndexing ? "Pushing" : "Syncing"}
                </Badge>
              )
            }

            return (
              <Badge
                variant="outline"
                className={cn(
                  baseClass,
                  "border-muted/10 bg-muted/10 text-muted-foreground/60 hover:bg-muted/10"
                )}
              >
                <div className="mr-1 size-1 rounded-full bg-muted-foreground/30" />
                Pending
              </Badge>
            )
          }

          return (
            <div className="flex justify-end">
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex cursor-help items-center gap-2.5">
                      {row.original.coverageState && (
                        <div className="group/info flex size-4 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary transition-all hover:scale-110 hover:bg-primary hover:text-white">
                          <Info className="size-2.5" />
                        </div>
                      )}
                      <div className="flex justify-end">{renderBadge()}</div>
                    </div>
                  </TooltipTrigger>
                  {row.original.coverageState && (
                    <TooltipContent
                      side="left"
                      sideOffset={10}
                      className="animate-in fade-in zoom-in-95 max-w-[280px] border-none bg-white p-3 text-[11px] font-bold text-slate-900 shadow-2xl ring-1 ring-black/5"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="size-1.5 animate-pulse rounded-full bg-primary" />
                          <span className="tracking-tight uppercase opacity-70">
                            Reason
                          </span>
                        </div>
                        <p className="text-[12px] leading-relaxed text-slate-700">
                          {row.original.coverageState}
                        </p>
                        <div className="mt-2 rounded-sm bg-primary/5 p-2 text-[10px] leading-normal font-medium text-primary">
                          <span className="mb-1 block text-[8px] font-black tracking-widest uppercase opacity-70">
                            How to fix:
                          </span>
                          {row.original.inspectionStatus === "Submitted"
                            ? "Google has received your request. The bot will visit your site shortly (usually within 2-24 hours). Please check back later."
                            : getFixSuggestion(row.original.coverageState)}
                        </div>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          )
        },
        size: 120,
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => (
          <DataGridColumnHeader
            column={column}
            title="Discovered"
            className="justify-end px-0"
          />
        ),
        cell: ({ row }) => {
          const date = new Date(row.getValue("updatedAt"))
          return (
            <div className="text-right">
              <span className="text-[10px] font-medium text-muted-foreground/40 tabular-nums">
                {date.toLocaleDateString()}
              </span>
            </div>
          )
        },
        size: 120,
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const url = row.original.url
          const isSyncing = syncingUrls.has(url)
          const isIndexing = indexingUrls.has(url)

          const handleSingleSync = async () => {
            if (isSyncing) return
            try {
              setSyncingUrls((prev) => new Set(prev).add(url))
              await inspectSingle(url)
              await queryClient.invalidateQueries({
                queryKey: ["inspection", activeSiteId],
              })
              toast.success("URL inspection completed")
            } catch (err: unknown) {
              const message =
                err instanceof Error ? err.message : "Failed to inspect URL"
              toast.error(message)
            } finally {
              setSyncingUrls((prev) => {
                const next = new Set(prev)
                next.delete(url)
                return next
              })
            }
          }

          const handleSinglePush = async () => {
            if (isIndexing) return
            try {
              setIndexingUrls((prev) => new Set(prev).add(url))
              await pushIndexing({ url })
            } catch {
              // Toast handled in hook
            } finally {
              setIndexingUrls((prev) => {
                const next = new Set(prev)
                next.delete(url)
                return next
              })
            }
          }

          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                title="Push to Index"
                className={cn(
                  "size-7 transition-colors",
                  isIndexing
                    ? "text-primary"
                    : "text-amber-500 hover:text-amber-600"
                )}
                onClick={handleSinglePush}
                disabled={isIndexing || isSyncing}
              >
                <Zap className={cn("size-3.5", isIndexing && "animate-spin")} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                title="Sync Status"
                className={cn(
                  "size-7 transition-colors",
                  isSyncing
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary"
                )}
                onClick={handleSingleSync}
                disabled={isSyncing || isIndexing}
              >
                <RefreshCcw
                  className={cn("size-3.5", isSyncing && "animate-spin")}
                />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 text-muted-foreground transition-colors hover:text-primary"
                asChild
              >
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-3.5" />
                </a>
              </Button>
            </div>
          )
        },
        size: 100,
      },
    ],
    [
      syncingUrls,
      indexingUrls,
      activeSiteId,
      inspectSingle,
      queryClient,
      pushIndexing,
    ]
  )

  const table = useReactTable({
    data: urls,
    columns,
    state: {
      sorting,
      columnVisibility,
      pagination,
    },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(recordCount / pagination.pageSize),
  })

  // Table for eligible URLs in the sidebar
  const eligibleTable = useReactTable({
    data: eligibleUrls,
    columns: React.useMemo<ColumnDef<UrlAudit>[]>(
      () => [
        {
          id: "select",
          header: () => (
            <div className="flex justify-center">
              <Checkbox
                checked={
                  selectedUrls.size === Math.min(eligibleUrls.length, 50) &&
                  eligibleUrls.length > 0
                }
                onCheckedChange={(checked) => {
                  if (checked) {
                    const next = new Set<string>()
                    eligibleUrls.slice(0, 50).forEach((u) => next.add(u.url))
                    setSelectedUrls(next)
                  } else {
                    setSelectedUrls(new Set())
                  }
                }}
              />
            </div>
          ),
          cell: ({ row }) => (
            <div className="flex justify-center">
              <Checkbox
                checked={selectedUrls.has(row.original.url)}
                onCheckedChange={() => toggleUrlSelection(row.original.url)}
              />
            </div>
          ),
          size: 40,
        },
        ...columns.filter((c) => c.id !== "actions"),
      ],
      [eligibleUrls, selectedUrls, columns]
    ),
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  if (!activeSiteId) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-xl border border-dashed border-border/50 bg-muted/5">
        <div className="text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Please select a property to view inspection data.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="group relative w-full sm:max-w-md">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            placeholder="Filter URLs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 border-border/50 pl-10 focus-visible:ring-primary/20"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex h-9 items-center gap-1.5 rounded-md border border-border/50 bg-background/50 px-3 text-[10px] font-bold tracking-wider uppercase">
            <span className="text-muted-foreground">Indexing Quota</span>
            <div className="h-3 w-[1px] bg-border" />
            <span
              className={cn(
                quotaUsage >= 200 ? "text-red-500" : "text-emerald-500"
              )}
            >
              {quotaUsage} / 200
            </span>
          </div>

          {isBatchSyncing ? (
            <Button
              variant="destructive"
              size="lg"
              className="font-semibold"
              onClick={cancelSync}
            >
              <Loader2 className="size-3.5 animate-spin" />
              Stop Sync ({syncProgress.current}/{syncProgress.total})
            </Button>
          ) : (
            <Button
              variant="accent"
              size="lg"
              className="font-semibold"
              onClick={handleSyncStatus}
              disabled={isLoading || recordCount === 0}
            >
              <RefreshCcw className="size-3.5" />
              Sync Status
            </Button>
          )}

          {!siteDetails?.gscAccountId && (
            <div className="flex h-9 items-center gap-1.5 rounded-md border border-red-500/20 bg-red-500/5 px-3 text-[10px] font-bold text-red-500 uppercase">
              <AlertCircle className="size-3" />
              GSC Disconnected
            </div>
          )}

          <Button
            variant="warning"
            size="lg"
            className="font-semibold"
            onClick={() => {
              fetchEligibleUrls()
              setIsBulkDrawerOpen(true)
            }}
            disabled={isPushing || isBatchSyncing || recordCount === 0}
          >
            <Rocket className={cn("size-3.5", isPushing && "animate-pulse")} />
            Push to Index
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="bg-background/50 font-semibold shadow-xs"
            onClick={() => scanSitemap()}
            disabled={isScanning || isBatchSyncing || isPushing}
          >
            <FileText
              className={cn("size-3.5", isScanning && "animate-spin")}
            />
            {isScanning ? "Scanning..." : "Scan Sitemap"}
          </Button>
        </div>
      </div>

      {isBatchSyncing && (
        <div className="animate-in fade-in slide-in-from-top-2 flex items-center justify-between rounded-lg border border-primary/10 bg-primary/5 p-3">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
              <Loader2 className="size-4 animate-spin text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-primary">
                Synchronizing Inventory
              </p>
              <p className="text-[11px] text-primary/60">
                Processing Google Search Console data for your property...
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-primary">
              {syncProgress.total > 0
                ? Math.round((syncProgress.current / syncProgress.total) * 100)
                : 0}
              %
            </p>
            <p className="text-[10px] font-bold tracking-wider text-primary/60 uppercase">
              {syncProgress.current} of {syncProgress.total} URLs
            </p>
          </div>
        </div>
      )}

      <DataGrid
        table={table}
        recordCount={recordCount}
        isLoading={isLoading}
        loadingMode="skeleton"
        tableLayout={{
          dense: true,
          headerBackground: true,
          headerBorder: true,
          rowBorder: true,
          width: "fixed",
        }}
      >
        <DataGridContainer>
          <DataGridTable />
        </DataGridContainer>
        <DataGridPagination />
      </DataGrid>

      <div className="flex items-center justify-between px-2">
        <p className="text-[10px] font-black tracking-[0.2em] text-muted-foreground/50 uppercase">
          Discovery Inventory • {recordCount} URLs located across your sitemap
        </p>
      </div>

      <Sheet open={isBulkDrawerOpen} onOpenChange={setIsBulkDrawerOpen}>
        <SheetContent
          side="right"
          className="w-full border-l border-border/50 p-0 sm:w-1/2 data-[side=right]:sm:max-w-none"
        >
          <div className="flex h-full flex-col bg-background">
            <SheetHeader className="flex flex-col justify-between gap-4 space-y-0 border-b border-border/50 px-6 py-4 sm:flex-row sm:items-center">
              <div className="space-y-1">
                <SheetTitle className="flex items-center gap-2 text-[15px] font-bold whitespace-nowrap">
                  <Rocket className="size-4 text-amber-500" />
                  Bulk Indexing Inventory
                </SheetTitle>
                <SheetDescription className="text-[10px] font-bold tracking-widest text-muted-foreground/40 uppercase">
                  Select URLs to manually push to Google Search Console indexing
                  queue
                </SheetDescription>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-full border border-border/50 bg-muted/20 px-3 py-1.5">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    Selection
                  </span>
                  <div className="h-3 w-px bg-border" />
                  <span
                    className={cn(
                      "text-xs font-black tabular-nums",
                      selectedUrls.size > 0
                        ? "text-primary"
                        : "text-muted-foreground/50"
                    )}
                  >
                    {selectedUrls.size} / 50
                  </span>
                  {selectedUrls.size > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-4 hover:bg-transparent"
                      onClick={() => setSelectedUrls(new Set())}
                    >
                      <X className="size-3 text-red-500" />
                    </Button>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="accent"
                  className="h-8 px-4 font-bold"
                  disabled={selectedUrls.size === 0 || isPushing}
                  onClick={handleBulkPush}
                >
                  {isPushing ? (
                    <Loader2 className="mr-2 size-3 animate-spin" />
                  ) : (
                    <Zap className="mr-2 size-3" />
                  )}
                  {isPushing ? "Pushing..." : `Push ${selectedUrls.size} URLs`}
                </Button>
              </div>
            </SheetHeader>

            <div className="relative flex h-full min-h-0 flex-1 flex-col">
              <DataGrid
                className="h-full min-h-0 flex-1 gap-0"
                table={eligibleTable}
                recordCount={eligibleUrls.length}
                isLoading={isLoadingEligible}
                loadingMode="skeleton"
                tableLayout={{
                  dense: true,
                  headerBackground: true,
                  rowBorder: true,
                }}
              >
                <DataGridContainer className="h-full min-h-0 flex-1 !overflow-auto overflow-x-hidden overflow-y-auto">
                  <DataGridTable />
                </DataGridContainer>
              </DataGrid>

              {!isLoadingEligible && eligibleUrls.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
                  <div className="space-y-2 text-center">
                    <div className="inline-flex size-10 items-center justify-center rounded-full bg-muted/10">
                      <Check className="size-5 text-emerald-500" />
                    </div>
                    <p className="text-xs font-bold tracking-widest text-muted-foreground/50 uppercase">
                      Everything is indexed
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
