"use client"

import * as React from "react"
import { flexRender } from "@tanstack/react-table"
import { cn } from "@/lib/utils"
import { useDataGrid } from "./data-grid"
import { Skeleton } from "@/components/ui/skeleton"

interface DataGridTableProps {
  footerContent?: React.ReactNode
  renderHeader?: boolean
}

export function DataGridTable({
  footerContent,
  renderHeader = true,
}: DataGridTableProps) {
  const {
    table,
    isLoading,
    loadingMode,
    emptyMessage,
    tableLayout,
    tableClassNames,
  } = useDataGrid()

  const isDense = tableLayout?.dense
  const hasCellBorder = tableLayout?.cellBorder
  const hasRowBorder = tableLayout?.rowBorder ?? true

  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn(
          "w-full border-collapse text-left",
          tableLayout?.width === "fixed" ? "table-fixed" : "table-auto",
          tableClassNames?.base
        )}
      >
        {renderHeader && (
          <thead
            className={cn(
              tableLayout?.headerBackground && "bg-muted/30",
              tableClassNames?.header
            )}
          >
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className={cn(
                  tableLayout?.headerBorder && "border-b border-border/50",
                  tableClassNames?.headerRow
                )}
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className={cn(
                      "font-semibold text-muted-foreground transition-colors",
                      isDense ? "px-3 py-2 text-[11px]" : "px-4 py-3 text-sm",
                      hasCellBorder &&
                        "border-r border-border/50 last:border-0",
                      tableClassNames?.edgeCell
                    )}
                    style={{
                      width:
                        header.getSize() !== 150 ? header.getSize() : undefined,
                    }}
                  >
                    {!header.isPlaceholder &&
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
        )}
        <tbody className={cn(tableClassNames?.body)}>
          {isLoading && loadingMode === "skeleton" ? (
            Array.from({ length: 15 }).map((_, i) => (
              <tr
                key={i}
                className={cn(
                  hasRowBorder && "border-b border-border/30 last:border-0"
                )}
              >
                {table.getVisibleFlatColumns().map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      isDense ? "px-3 py-2" : "px-4 py-3",
                      hasCellBorder && "border-r border-border/30 last:border-0"
                    )}
                  >
                    <Skeleton
                      className={cn(
                        "h-4 opacity-40",
                        column.id === "url"
                          ? "w-[85%]"
                          : column.id === "inspectionStatus"
                            ? "w-[60%]"
                            : column.id === "updatedAt"
                              ? "w-[40%]"
                              : "w-full"
                      )}
                    />
                  </td>
                ))}
              </tr>
            ))
          ) : table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  "group/row transition-colors hover:bg-muted/20",
                  hasRowBorder && "border-b border-border/30 last:border-0",
                  tableLayout?.stripped && "odd:bg-muted/5",
                  tableClassNames?.bodyRow
                )}
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className={cn(
                      "text-foreground/80",
                      isDense ? "px-3 py-2 text-[12px]" : "px-4 py-3 text-sm",
                      hasCellBorder &&
                        "border-r border-border/30 last:border-0",
                      tableClassNames?.edgeCell
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={table.getVisibleFlatColumns().length}
                className="px-4 py-12 text-center text-sm text-muted-foreground"
              >
                {emptyMessage || "No matches found."}
              </td>
            </tr>
          )}
        </tbody>
        {footerContent && (
          <tfoot className={cn("bg-muted/10", tableClassNames?.footer)}>
            {footerContent}
          </tfoot>
        )}
      </table>
    </div>
  )
}
