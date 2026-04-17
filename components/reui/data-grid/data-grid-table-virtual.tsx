"use client"

import * as React from "react"
import { flexRender, type Row } from "@tanstack/react-table"
import { useVirtualizer } from "@tanstack/react-virtual"
import { cn } from "@/lib/utils"
import { useDataGrid } from "./data-grid"
import { Loader2 } from "lucide-react"

interface DataGridTableVirtualProps<TData> {
  height?: number | string
  estimateSize?: number
  overscan?: number
  footerContent?: React.ReactNode
  renderHeader?: boolean
  onFetchMore?: () => void
  isFetchingMore?: boolean
  hasMore?: boolean
  fetchMoreOffset?: number
}

export function DataGridTableVirtual<TData>({
  height = "600px",
  estimateSize = 40,
  overscan = 12,
  footerContent,
  renderHeader = true,
  onFetchMore,
  isFetchingMore,
  hasMore,
  fetchMoreOffset = 5,
}: DataGridTableVirtualProps<TData>) {
  const { table, isLoading, emptyMessage, tableLayout, tableClassNames } = useDataGrid<TData>()
  const parentRef = React.useRef<HTMLDivElement>(null)

  const { rows } = table.getRowModel()
  
  const virtualizer = useVirtualizer({
    count: hasMore ? rows.length + 1 : rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
  })

  const virtualItems = virtualizer.getVirtualItems()
  const paddingTop = virtualItems.length > 0 ? virtualItems?.[0]?.start || 0 : 0
  const paddingBottom =
    virtualItems.length > 0
      ? virtualizer.getTotalSize() - (virtualItems?.[virtualItems.length - 1]?.end || 0)
      : 0

  // Infinite scroll trigger
  React.useEffect(() => {
    const lastItem = virtualItems[virtualItems.length - 1]
    if (!lastItem || !hasMore || isFetchingMore || !onFetchMore) return

    if (lastItem.index >= rows.length - fetchMoreOffset) {
      onFetchMore()
    }
  }, [virtualItems, hasMore, isFetchingMore, rows.length, onFetchMore, fetchMoreOffset])

  const isDense = tableLayout?.dense
  const hasCellBorder = tableLayout?.cellBorder
  const hasRowBorder = tableLayout?.rowBorder ?? true

  return (
    <div 
        ref={parentRef} 
        style={{ height }}
        className="w-full overflow-auto scrollbar-thin scrollbar-thumb-accent scrollbar-track-transparent border-t border-border/50"
    >
      <div style={{ height: `${virtualizer.getTotalSize()}px`, width: '100%' }}>
        <table
          className={cn(
            "w-full text-left border-collapse",
            tableLayout?.width === "fixed" ? "table-fixed" : "table-auto",
            tableClassNames?.base
          )}
        >
          {renderHeader && (
            <thead className={cn(
              "sticky top-0 z-20 bg-background/95 backdrop-blur-sm",
              tableLayout?.headerBorder && "border-b border-border/50 shadow-sm",
              tableClassNames?.header
            )}>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className={cn(tableClassNames?.headerRow)}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      className={cn(
                        "font-semibold text-muted-foreground transition-colors",
                        isDense ? "px-3 py-2 text-[11px]" : "px-4 py-3 text-sm",
                        hasCellBorder && "border-r border-border/50 last:border-0",
                        tableClassNames?.edgeCell
                      )}
                      style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                    >
                      {!header.isPlaceholder &&
                        flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
          )}
          
          <tbody className={cn(tableClassNames?.body)}>
            {paddingTop > 0 && (
              <tr>
                <td style={{ height: `${paddingTop}px` }} />
              </tr>
            )}
            {virtualItems.map((virtualRow) => {
              const isLoaderRow = virtualRow.index > rows.length - 1
              const row = rows[virtualRow.index] as Row<TData>

              return (
                <tr
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={virtualizer.measureElement}
                  className={cn(
                    "hover:bg-muted/10 transition-colors group/row text-foreground/80",
                    hasRowBorder && "border-b border-border/30 last:border-0",
                    tableLayout?.stripped && "odd:bg-muted/5",
                    tableClassNames?.bodyRow
                  )}
                >
                  {isLoaderRow ? (
                    <td 
                        colSpan={table.getVisibleFlatColumns().length} 
                        className="py-6 text-center"
                    >
                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <Loader2 className="size-3 animate-spin" />
                            Loading more...
                        </div>
                    </td>
                  ) : (
                    row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={cn(
                          isDense ? "px-3 py-2 text-[12px]" : "px-4 py-3 text-sm",
                          hasCellBorder && "border-r border-border/30 last:border-0",
                          tableClassNames?.edgeCell
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))
                  )}
                </tr>
              )
            })}
            {paddingBottom > 0 && (
              <tr>
                <td style={{ height: `${paddingBottom}px` }} />
              </tr>
            )}
          </tbody>

          {footerContent && (
            <tfoot className={cn("bg-muted/10", tableClassNames?.footer)}>
              {footerContent}
            </tfoot>
          )}
        </table>

        {rows.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-sm">
                {emptyMessage || "No matches found."}
            </div>
        )}
      </div>
    </div>
  )
}
