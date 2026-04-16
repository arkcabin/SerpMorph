"use client"

import { useQuery } from "@tanstack/react-query"

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/summary")
      if (!res.ok) throw new Error("Failed to fetch dashboard summary")
      return res.json()
    },
    staleTime: 1000 * 60, // 1 minute
  })
}
