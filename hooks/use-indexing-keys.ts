import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

export interface IndexingKey {
  id: string
  name: string
  createdAt: string
}

export function useIndexingKeys(siteId?: string | null) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: ["indexing-keys", siteId],
    queryFn: async () => {
      if (!siteId) return { key: null }
      const res = await fetch(`/api/sites/${siteId}/indexing/keys`)
      if (!res.ok) throw new Error("Failed to fetch key")
      return res.json() as Promise<{ key: IndexingKey | null }>
    },
    enabled: !!siteId,
  })

  const uploadMutation = useMutation({
    mutationFn: async ({ name, json }: { name: string; json: string }) => {
      if (!siteId) throw new Error("No site selected")
      const res = await fetch(`/api/sites/${siteId}/indexing/keys`, {
        method: "POST",
        body: JSON.stringify({ name, serviceAccountJson: json }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || "Upload failed")
      }
      return res.json()
    },
    onSuccess: (data) => {
      toast.success(data.message || "Key configured successfully")
      queryClient.invalidateQueries({ queryKey: ["indexing-keys", siteId] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload key")
    },
  })

  const unlinkMutation = useMutation({
    mutationFn: async () => {
      if (!siteId) throw new Error("No site selected")
      const res = await fetch(`/api/sites/${siteId}/indexing/keys`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to unlink key")
      return res.json()
    },
    onSuccess: (data) => {
      toast.success(data.message || "Key unlinked")
      queryClient.invalidateQueries({ queryKey: ["indexing-keys", siteId] })
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to unlink key")
    },
  })

  return {
    key: query.data?.key || null,
    isLoading: query.isLoading,
    isUploading: uploadMutation.isPending,
    isUnlinking: unlinkMutation.isPending,
    uploadKey: uploadMutation.mutateAsync,
    unlinkKey: unlinkMutation.mutateAsync,
  }
}
