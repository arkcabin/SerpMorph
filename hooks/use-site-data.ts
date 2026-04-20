"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function useSiteMetrics(id: string) {
  return useQuery({
    queryKey: ["site-metrics", id],
    queryFn: async () => {
      const res = await fetch(`/api/sites/${id}/metrics`)
      if (!res.ok) throw new Error("Failed to fetch site metrics")
      return res.json()
    },
  })
}

export function useSitePerformance(id: string) {
  return useQuery({
    queryKey: ["site-performance", id],
    queryFn: async () => {
      const res = await fetch(`/api/sites/${id}/performance`)
      if (!res.ok) throw new Error("Failed to fetch performance data")
      return res.json()
    },
  })
}

export function useSiteKeywords(id: string) {
  return useQuery({
    queryKey: ["site-keywords", id],
    queryFn: async () => {
      const res = await fetch(`/api/sites/${id}/keywords`)
      if (!res.ok) throw new Error("Failed to fetch keyword data")
      return res.json()
    },
  })
}

export function useSiteInsights(id: string) {
  return useQuery({
    queryKey: ["site-insights", id],
    queryFn: async () => {
      const res = await fetch(`/api/sites/${id}/insights`)
      if (!res.ok) throw new Error("Failed to fetch site insights")
      return res.json()
    },
  })
}

export function useSiteIntelligence(id: string) {
  return useQuery({
    queryKey: ["site-intelligence", id],
    queryFn: async () => {
      const res = await fetch(`/api/sites/${id}/intelligence`)
      if (!res.ok) throw new Error("Failed to fetch site intelligence")
      return res.json()
    },
  })
}

export function useSiteSync(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/sites/${id}/sync`, { method: "POST" })
      if (!res.ok) throw new Error("Failed to sync site data")
      return res
    },
    onSuccess: async () => {
      // Invalidate all site-related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["site-metrics", id] })
      queryClient.invalidateQueries({ queryKey: ["site-performance", id] })
      queryClient.invalidateQueries({ queryKey: ["site-keywords", id] })
      queryClient.invalidateQueries({ queryKey: ["site-insights", id] })
      queryClient.invalidateQueries({ queryKey: ["site-intelligence", id] })

      // Trigger intelligence discovery automatically after main sync
      try {
        await fetch(`/api/sites/${id}/intelligence`, { method: "POST" })
        queryClient.invalidateQueries({ queryKey: ["site-intelligence", id] })
      } catch (error) {
        console.error("Auto-sync intelligence failed:", error)
      }
    },
  })
}

export function useIntelligenceSync(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/sites/${id}/intelligence`, {
        method: "POST",
      })
      if (!res.ok) throw new Error("Failed to sync site intelligence")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-intelligence", id] })
    },
  })
}
