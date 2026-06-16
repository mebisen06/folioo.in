import * as React from 'react'
import { cn } from '../../utils/cn'

export interface TableColumn<T> {
  header: string
  accessor: keyof T | ((row: T) => React.ReactNode)
  className?: string
}

export interface TableProps<T> {
  data: T[]
  columns: TableColumn<T>[]
  keyExtractor: (row: T, index: number) => string | number
  onRowClick?: (row: T) => void
  isLoading?: boolean
  className?: string
  emptyState?: React.ReactNode
}

export function Table<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  isLoading,
  className,
  emptyState
}: TableProps<T>) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border bg-surface">
      <table className={cn('w-full border-collapse text-left text-sm text-zinc-300', className)}>
        <thead>
          <tr className="border-b border-border bg-neutral-900/40 text-xs font-semibold text-zinc-400 uppercase tracking-wider select-none">
            {columns.map((col, idx) => (
              <th key={idx} className={cn('px-6 py-3.5 font-semibold', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-zinc-500">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  Loading data...
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-zinc-500">
                {emptyState || 'No results found.'}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={keyExtractor(row, rowIdx)}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  'transition-colors hover:bg-neutral-900/30',
                  onRowClick && 'cursor-pointer'
                )}
              >
                {columns.map((col, colIdx) => {
                  const content =
                    typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : (row[col.accessor] as React.ReactNode)
                  return (
                    <td key={colIdx} className={cn('px-6 py-4 border-t border-border/40 font-medium text-zinc-300', col.className)}>
                      {content}
                    </td>
                  )
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
