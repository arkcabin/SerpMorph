"use client"

import * as React from "react"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useDataGrid } from "./data-grid"
import { Button } from "@/components/ui/button"

interface DataGridPaginationProps {
  className?: string
  showInfo?: boolean
}

export function DataGridPagination({
  className,
  showInfo = true,
}: DataGridPaginationProps) {
  const { table, recordCount } = useDataGrid()
  
  const { pageIndex, pageSize } = table.getState().pagination
  const totalPages = table.getPageCount()

  return (
    <div className={cn("flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4", className)}>
      {showInfo && (
        <div className="flex-1 text-xs text-muted-foreground font-medium uppercase tracking-wider">
          {recordCount > 0 ? (
            <>
              {pageIndex * pageSize + 1} - {Math.min((pageIndex + 1) * pageSize, recordCount)} of{" "}
              <span className="text-foreground">{recordCount}</span> records
            </>
          ) : (
            "No records found"
          )}
        </div>
      )}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex border-border/50"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="h-8 w-8 p-0 border-border/50"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1">
            <span className="text-xs font-medium text-muted-foreground mx-1">
                Page {pageIndex + 1} of {totalPages}
            </span>
        </div>
        <Button
          variant="outline"
          className="h-8 w-8 p-0 border-border/50"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          className="hidden h-8 w-8 p-0 lg:flex border-border/50"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
