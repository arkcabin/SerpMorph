import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface UrlAudit {
  id: string
  url: string
  inspectionStatus: string | null
  coverageState: string | null
  lastCrawlTime: string | null
  isMobileFriendly: boolean | null
  sitemap: string | null
  createdAt: string
  updatedAt: string
}

export function useInspection(
  siteId?: string | null,
  search: string = "",
  page: number = 0
) {
  const queryClient = useQueryClient()
  const pageSize = 10

  const query = useQuery({
    queryKey: ["inspection", siteId, search, page],
    queryFn: async () => {
      if (!siteId) return { data: [], total: 0, limit: pageSize, offset: 0 }
      const offset = page * pageSize
      const res = await fetch(
        `/api/sites/${siteId}/inspect?offset=${offset}&limit=${pageSize}&search=${encodeURIComponent(search)}`
      )
      if (!res.ok) throw new Error("Failed to fetch URLs")
      return res.json() as Promise<{
        data: UrlAudit[]
        total: number
        limit: number
        offset: number
        quotaUsage: number
      }>
    },
    enabled: !!siteId,
  })

  const urls = query.data?.data || []
  const recordCount = query.data?.total || 0

  const scanMutation = useMutation({
    mutationFn: async () => {
      if (!siteId) throw new Error("No site selected")
      const res = await fetch(`/api/sites/${siteId}/inspect`, {
        method: "POST",
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Scan failed")
      }
      return res.json()
    },
    onSuccess: (data) => {
      toast.success(data.message || "Sitemap scan completed")
      queryClient.invalidateQueries({ queryKey: ["inspection", siteId] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to scan sitemap")
    },
  })

  const processMutation = useMutation({
    mutationFn: async () => {
      if (!siteId) throw new Error("No site selected")
      const res = await fetch(`/api/sites/${siteId}/inspect/process`, {
        method: "POST",
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Processing failed")
      }
      return res.json()
    },
    onSuccess: (data) => {
      if (data.count === 0) {
        toast.info("All URLs are already up to date.")
      } else if (data.errorCount > 0) {
        toast.error(
          `${data.message} ${data.firstError ? `Reason: ${data.firstError}` : ""}`,
          {
            duration: 5000,
          }
        )
      } else {
        toast.success(data.message || "Batch inspection completed")
      }
      queryClient.invalidateQueries({ queryKey: ["inspection", siteId] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to process index status")
    },
  })

  const inspectSingleMutation = useMutation({
    mutationFn: async (url: string) => {
      if (!siteId) throw new Error("No site selected")
      const res = await fetch(`/api/sites/${siteId}/inspect/single`, {
        method: "POST",
        body: JSON.stringify({ url }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Inspection failed")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inspection", siteId] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to inspect URL")
    },
  })

  const pushIndexingMutation = useMutation({
    mutationFn: async ({ url, urls }: { url?: string; urls?: string[] }) => {
      const urlsToPush = urls || (url ? [url] : [])
      if (urlsToPush.length === 0)
        return {
          successCount: 0,
          errorCount: 0,
          results: [],
          message: "No URLs to index",
        }

      if (!siteId) throw new Error("No site selected")
      const res = await fetch(`/api/sites/${siteId}/indexing/push`, {
        method: "POST",
        body: JSON.stringify({ url, urls }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Push failed")
      }
      return res.json()
    },
    onSuccess: (data) => {
      toast.success(`Requested indexing for ${data.successCount} URL(s)`)
      queryClient.invalidateQueries({ queryKey: ["inspection", siteId] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to push to Indexing API")
    },
  })

  return {
    urls,
    recordCount,
    quotaUsage: query.data?.quotaUsage || 0,
    isLoading: query.isLoading,
    isScanning: scanMutation.isPending,
    isProcessing: processMutation.isPending,
    isSyncingSingle: inspectSingleMutation.isPending,
    isPushing: pushIndexingMutation.isPending,
    scanSitemap: scanMutation.mutate,
    processStatus: processMutation.mutate,
    inspectSingle: inspectSingleMutation.mutateAsync,
    pushIndexing: pushIndexingMutation.mutateAsync,
  }
}
