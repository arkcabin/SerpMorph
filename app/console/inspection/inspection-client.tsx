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
} from "lucide-react"

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

  const handleSyncStatus = async () => {
    if (!activeSiteId) return

    try {
      setIsBatchSyncing(true)
      setSyncProgress({ current: 0, total: 0 })

      // 1. Get all pending URLs
      const res = await fetch(`/api/sites/${activeSiteId}/inspect/pending`)
      const { urls: pendingUrls } = await res.json()

      if (!pendingUrls?.length) {
        toast.info("No pending URLs to sync.")
        setIsBatchSyncing(false)
        return
      }

      setSyncProgress({ current: 0, total: pendingUrls.length })

      // 2. Process one by one
      for (let i = 0; i < pendingUrls.length; i++) {
        if (abortControllerRef.current?.signal.aborted) break

        setSyncProgress((prev) => ({ ...prev, current: i + 1 }))
        const url = pendingUrls[i]

        try {
          setSyncingUrls((prev) => new Set(prev).add(url))
          await inspectSingle(url)
          // Await the refetch to ensure UI doesn't flicker back to "Pending"
          await queryClient.invalidateQueries({
            queryKey: ["inspection", activeSiteId],
          })
          // Small safety delay
          await new Promise((resolve) => setTimeout(resolve, 500))
        } catch (err) {
          console.error(`Failed to sync ${url}:`, err)
        } finally {
          setSyncingUrls((prev) => {
            const next = new Set(prev)
            next.delete(url)
            return next
          })
        }
      }

      toast.success("Synchronization cycle completed.")
    } catch {
      toast.error("Failed to start synchronization.")
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
          <DataGridColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
          const status = row.getValue("inspectionStatus") as string

          if (status === "PASS" || status === "Indexed") {
            return (
              <Badge
                variant="default"
                className="h-4.5 border-emerald-500/10 bg-emerald-500/5 px-1.5 py-0 text-[9px] font-black tracking-widest text-emerald-600 uppercase"
              >
                <CheckCircle2 className="mr-1 size-2.5" />
                Indexed
              </Badge>
            )
          }
          if (status === "FAIL") {
            return (
              <Badge
                variant="destructive"
                className="h-4.5 border-red-500/10 bg-red-500/5 px-1.5 py-0 text-[9px] font-black tracking-widest text-red-600 uppercase"
              >
                <AlertCircle className="mr-1 size-2.5" />
                Issues Found
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
                className="h-4.5 border-amber-500/10 bg-amber-500/5 px-1.5 py-0 text-[9px] font-black tracking-widest text-amber-600 uppercase"
              >
                Excluded
              </Badge>
            )
          }

          const isSyncing = syncingUrls.has(row.original.url)

          if (isSyncing) {
            return (
              <Badge
                variant="secondary"
                className="h-4.5 animate-pulse border-primary/10 bg-primary/5 px-1.5 py-0 text-[9px] font-black tracking-widest text-primary uppercase"
              >
                <Loader2 className="mr-1 size-2.5 animate-spin" />
                Syncing
              </Badge>
            )
          }

          return (
            <Badge
              variant="secondary"
              className="h-4.5 border-transparent bg-muted/30 px-1.5 py-0 text-[9px] font-bold tracking-widest text-muted-foreground/70 uppercase"
            >
              <div className="mr-1.5 size-1.5 rounded-full bg-muted-foreground/30" />
              Pending
            </Badge>
          )
        },
        size: 120,
      },
      {
        accessorKey: "updatedAt",
        header: ({ column }) => (
          <DataGridColumnHeader column={column} title="Discovered" />
        ),
        cell: ({ row }) => {
          const date = new Date(row.getValue("updatedAt"))
          return (
            <span className="text-muted-foreground/60">
              {date.toLocaleDateString()}
            </span>
          )
        },
        size: 120,
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const url = row.original.url
          const isSyncing = syncingUrls.has(url)

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
            if (isSyncing) return
            try {
              setSyncingUrls((prev) => new Set(prev).add(url))
              await pushIndexing({ url })
            } catch {
              // Toast handled in hook
            } finally {
              setSyncingUrls((prev) => {
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
                  isSyncing
                    ? "text-primary"
                    : "text-amber-500 hover:text-amber-600"
                )}
                onClick={handleSinglePush}
                disabled={isSyncing}
              >
                <Zap className={cn("size-3.5", isSyncing && "animate-spin")} />
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
                disabled={isSyncing}
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
    [syncingUrls, activeSiteId, inspectSingle, queryClient, pushIndexing]
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
            className="h-10 border-border/50 bg-background/50 pl-10 focus-visible:ring-primary/20"
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

          <Button
            variant="warning"
            size="lg"
            className="font-semibold"
            onClick={() => {
              const pendingUrls = urls
                .filter((u) => u.inspectionStatus === "Pending")
                .map((u) => u.url)
              if (pendingUrls.length > 0) pushIndexing({ urls: pendingUrls })
            }}
            disabled={
              isPushing ||
              isBatchSyncing ||
              recordCount === 0 ||
              !urls.some((u) => u.inspectionStatus === "Pending")
            }
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
    </div>
  )
}
