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
    VisibilityState
} from "@tanstack/react-table"
import { 
    RefreshCcw, 
    CheckCircle2, 
    Loader2, 
    ExternalLink, 
    Search,
    FileText,
    Globe,
    AlertCircle
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
    DataGrid, 
    DataGridContainer, 
    DataGridTable,
    DataGridPagination,
    DataGridColumnHeader
} from "@/components/reui/data-grid"
import { cn } from "@/lib/utils"

export default function InspectionClient() {
  const { activeSiteId } = useSite()
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
  const [syncProgress, setSyncProgress] = React.useState({ current: 0, total: 0 })
  const abortControllerRef = React.useRef<AbortController | null>(null)

  const { 
    urls, 
    recordCount,
    isLoading, 
    isScanning, 
    scanSitemap,
    inspectSingle
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
            
            setSyncProgress(prev => ({ ...prev, current: i + 1 }))
            
            try {
                await inspectSingle(pendingUrls[i])
                // Small safety delay
                await new Promise(resolve => setTimeout(resolve, 500))
            } catch (err) {
                console.error(`Failed to sync ${pendingUrls[i]}:`, err)
            }
        }

        toast.success("Synchronization cycle completed.")
    } catch (error: any) {
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
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})

  const columns = React.useMemo<ColumnDef<UrlAudit>[]>(() => [
    {
      accessorKey: "url",
      header: ({ column }) => (
        <DataGridColumnHeader column={column} title="Property URL" />
      ),
      cell: ({ row }) => {
          const url = row.getValue("url") as string
          return (
            <div className="flex items-center gap-2 max-w-[500px]">
                <Globe className="size-3 text-muted-foreground/50 shrink-0" />
                <span className="truncate font-medium">{url}</span>
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
                <Badge variant="default" className="bg-emerald-500/5 text-emerald-600 border-emerald-500/10 text-[9px] py-0 px-1.5 h-4.5 font-black uppercase tracking-widest">
                    <CheckCircle2 className="size-2.5 mr-1" />
                    Indexed
                </Badge>
            )
        }
        if (status === "FAIL") {
            return (
                <Badge variant="destructive" className="bg-red-500/5 text-red-600 border-red-500/10 text-[9px] py-0 px-1.5 h-4.5 font-black uppercase tracking-widest">
                    <AlertCircle className="size-2.5 mr-1" />
                    Issues Found
                </Badge>
            )
        }
        if (status === "NEUTRAL" || status === "PARTIAL" || status === "Excluded") {
            return (
                <Badge variant="outline" className="bg-amber-500/5 text-amber-600 border-amber-500/10 text-[9px] py-0 px-1.5 h-4.5 font-black uppercase tracking-widest">
                    Excluded
                </Badge>
            )
        }
        return (
            <Badge variant="secondary" className="bg-muted/50 text-muted-foreground border-transparent text-[9px] py-0 px-1.5 h-4.5 font-black uppercase tracking-widest">
                <Loader2 className="size-2.5 mr-1 animate-spin" />
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
        return <span className="text-muted-foreground/60">{date.toLocaleDateString()}</span>
      },
      size: 120,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex justify-end">
            <Button 
                variant="ghost" 
                size="icon" 
                className="size-7 text-muted-foreground hover:text-primary transition-colors"
                asChild
            >
                <a href={row.original.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-3.5" />
                </a>
            </Button>
        </div>
      ),
      size: 60,
    },
  ], [])

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
          <p className="text-sm text-muted-foreground font-medium">Please select a property to view inspection data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-md group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                    placeholder="Filter URLs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-10 bg-background/50 border-border/50 focus-visible:ring-primary/20"
                />
            </div>
            
            <div className="flex items-center gap-2">
                {isBatchSyncing ? (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9 gap-2 shadow-xs bg-red-500/10 text-red-600 hover:bg-red-500/20 font-semibold border-red-500/20" 
                        onClick={cancelSync}
                    >
                        <Loader2 className="size-3.5 animate-spin" />
                        Stop Sync ({syncProgress.current}/{syncProgress.total})
                    </Button>
                ) : (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="h-9 gap-2 shadow-xs bg-background/50 border-primary/20 text-primary hover:bg-primary/5 font-semibold" 
                        onClick={handleSyncStatus}
                        disabled={isLoading || recordCount === 0}
                    >
                        <RefreshCcw className="size-3.5" />
                        Sync Status
                    </Button>
                )}
                <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-9 gap-2 shadow-xs bg-background/50 font-semibold" 
                    onClick={() => scanSitemap()}
                    disabled={isScanning || isBatchSyncing}
                >
                    <FileText className={cn("size-3.5", isScanning && "animate-spin")} />
                    {isScanning ? "Scanning..." : "Scan Sitemap"}
                </Button>
            </div>
        </div>

        {isBatchSyncing && (
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Loader2 className="size-4 text-primary animate-spin" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-primary">Synchronizing Inventory</p>
                        <p className="text-[11px] text-primary/60">Processing Google Search Console data for your property...</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm font-bold text-primary">{syncProgress.total > 0 ? Math.round((syncProgress.current / syncProgress.total) * 100) : 0}%</p>
                    <p className="text-[10px] text-primary/60 uppercase tracking-wider font-bold">{syncProgress.current} of {syncProgress.total} URLs</p>
                </div>
            </div>
        )}

        <DataGrid
            table={table}
            recordCount={recordCount}
            isLoading={isLoading}
            tableLayout={{
                dense: true,
                headerBackground: true,
                headerBorder: true,
                rowBorder: true,
                width: "fixed"
            }}
        >
            <DataGridContainer>
                <DataGridTable />
            </DataGridContainer>
            <DataGridPagination />
        </DataGrid>
        
        <div className="flex items-center justify-between px-2">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50">
                Discovery Inventory • {recordCount} URLs located across your sitemap
            </p>
        </div>
    </div>
  )
}
