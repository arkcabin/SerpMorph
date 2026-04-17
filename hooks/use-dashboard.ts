"use client"

import { useQuery } from "@tanstack/react-query"

export function useDashboardSummary(siteId?: string | null) {
  return useQuery({
    queryKey: ["dashboard-summary", siteId],
    queryFn: async () => {
      const url = siteId 
        ? `/api/dashboard/summary?siteId=${siteId}`
        : "/api/dashboard/summary"
      
      const res = await fetch(url)
      if (!res.ok) throw new Error("Failed to fetch dashboard summary")
      return res.json()
    },
    staleTime: 1000 * 60, // 1 minute
  })
}
