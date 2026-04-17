"use client"

import * as React from "react"
import { type Table } from "@tanstack/react-table"
import { cn } from "@/lib/utils"

export interface DataGridTableLayout {
  dense?: boolean
  cellBorder?: boolean
  rowBorder?: boolean
  rowRounded?: boolean
  stripped?: boolean
  headerBackground?: boolean
  headerBorder?: boolean
  headerSticky?: boolean
  width?: "auto" | "fixed"
}

export interface DataGridTableClassNames {
  base?: string
  header?: string
  headerRow?: string
  headerSticky?: string
  body?: string
  bodyRow?: string
  footer?: string
  edgeCell?: string
}

interface DataGridContextValue<TData> {
  table: Table<TData>
  recordCount: number
  isLoading?: boolean
  loadingMode?: "skeleton" | "spinner"
  emptyMessage?: string
  tableLayout?: DataGridTableLayout
  tableClassNames?: DataGridTableClassNames
}

const DataGridContext = React.createContext<DataGridContextValue<any> | undefined>(undefined)

export function useDataGrid<TData>() {
  const context = React.useContext(DataGridContext)
  if (!context) {
    throw new Error("useDataGrid must be used within a DataGrid")
  }
  return context as DataGridContextValue<TData>
}

interface DataGridProps<TData> extends DataGridContextValue<TData> {
  children: React.ReactNode
  className?: string
}

export function DataGrid<TData>({
  children,
  className,
  ...props
}: DataGridProps<TData>) {
  return (
    <DataGridContext.Provider value={props}>
      <div className={cn("flex flex-col gap-4", className)}>
        {children}
      </div>
    </DataGridContext.Provider>
  )
}

export function DataGridContainer({
  children,
  className,
  border = true,
}: {
  children: React.ReactNode
  className?: string
  border?: boolean
}) {
  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden",
        border && "border border-border/50 shadow-xs bg-card/30 backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  )
}
