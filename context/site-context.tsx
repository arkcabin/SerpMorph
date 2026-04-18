"use client"

import * as React from "react"

interface SiteContextType {
  activeSiteId: string | null
  setActiveSiteId: (id: string | null) => void
}

const SiteContext = React.createContext<SiteContextType>({
  activeSiteId: null,
  setActiveSiteId: () => {},
})

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [activeSiteId, setActiveSiteIdState] = React.useState<string | null>(
    null
  )

  // Initialize from localStorage on mount
  React.useEffect(() => {
    const saved = localStorage.getItem("seomo_active_site_id")
    if (saved) {
      setActiveSiteIdState(saved)
    }
  }, [])

  const setActiveSiteId = React.useCallback((id: string | null) => {
    setActiveSiteIdState(id)
    if (id) {
      localStorage.setItem("seomo_active_site_id", id)
    } else {
      localStorage.removeItem("seomo_active_site_id")
    }
  }, [])

  return (
    <SiteContext.Provider value={{ activeSiteId, setActiveSiteId }}>
      {children}
    </SiteContext.Provider>
  )
}

export function useSite() {
  return React.useContext(SiteContext)
}
