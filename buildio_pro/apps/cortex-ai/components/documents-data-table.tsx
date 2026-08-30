"use client"

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { FileText, Loader2 } from "lucide-react"
import { parseAsString, useQueryState } from "nuqs"
import * as React from "react"

import { formatDate, truncateHash } from "@/api/documents/helpers"
import { useInfiniteDocuments } from "@/api/documents/query"
import type { Document } from "@/api/documents/types"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { DataTableSearch } from "@/components/data-table/data-table-search"
import { cn } from "@/lib/utils"

const columns: ColumnDef<Document>[] = [
  {
    id: "filename",
    accessorKey: "filename",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Filename" />
    ),
    enableSorting: true,
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <FileText className="size-4 shrink-0 text-muted-foreground" />
          <span className="font-medium">{row.original.filename}</span>
        </div>
      )
    },
  },
  {
    id: "filepath",
    accessorKey: "filepath",
    header: "Path",
    enableSorting: true,
    cell: ({ row }) => (
      <span
        className="block max-w-64 truncate text-muted-foreground"
        title={row.original.filepath}
      >
        {row.original.filepath}
      </span>
    ),
  },
  {
    id: "fileHash",
    accessorKey: "fileHash",
    header: "Hash",
    enableSorting: true,
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {truncateHash(row.original.fileHash)}
      </span>
    ),
  },
  {
    id: "ingested",
    accessorKey: "ingested",
    header: "Status",
    enableSorting: true,
    cell: ({ row }) => {
      const ingested = row.original.ingested
      return (
        <Badge variant={ingested ? "default" : "secondary"}>
          {ingested ? "Ingested" : "Pending"}
        </Badge>
      )
    },
  },
  {
    id: "createdAt",
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    enableSorting: true,
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
]

const PAGE_SIZE = 20
const DEFAULT_SORT = "createdAt"
const DEFAULT_SORT_DIR = "desc"

export function DocumentsDataTable() {
  const [search] = useQueryState("search", parseAsString.withDefault(""))
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsString.withDefault(DEFAULT_SORT)
  )
  const [sortDir, setSortDir] = useQueryState(
    "sortDir",
    parseAsString.withDefault(DEFAULT_SORT_DIR)
  )

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isFetching,
  } = useInfiniteDocuments({
    pageSize: PAGE_SIZE,
    sort: sort as DocumentSort,
    sortDir: sortDir as "asc" | "desc",
    search: search || undefined,
  })

  const flatData = React.useMemo(
    () => data?.pages.flatMap((p) => p.documents) ?? [],
    [data]
  )
  const total = data?.pages[0]?.total ?? 0

  // TanStack sorting state synced to URL
  const sorting = React.useMemo<SortingState>(
    () => (sort ? [{ id: sort, desc: sortDir === "desc" }] : []),
    [sort, sortDir]
  )

  const onSortingChange = React.useCallback(
    (
      updater: SortingState | ((old: SortingState) => SortingState)
    ) => {
      const next =
        typeof updater === "function" ? updater(sorting) : updater
      const first = next?.[0]
      if (first) {
        setSort(first.id)
        setSortDir(first.desc ? "desc" : "asc")
      } else {
        setSort(DEFAULT_SORT)
        setSortDir(DEFAULT_SORT_DIR)
      }
    },
    [sorting, setSort, setSortDir]
  )

  const table = useReactTable({
    data: flatData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    state: { sorting },
    onSortingChange,
    getRowId: (row) => row.id,
  })

  // Infinite scroll sentinel
  const sentinelRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    if (!hasNextPage || isFetchingNextPage) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          void fetchNextPage()
        }
      },
      { rootMargin: "400px", threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, flatData.length])

  const visibleColumns = table.getVisibleLeafColumns().length

  return (
    <div className={cn("flex w-full flex-col gap-2.5 overflow-hidden")}>
      <DataTableSearch placeholder="Search documents…" />

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={visibleColumns} className="h-24 p-0">
                  <LoadingRows rows={PAGE_SIZE} />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={visibleColumns}
                  className="h-24 text-center text-muted-foreground"
                >
                  No documents found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer: count + infinite status */}
      <div className="flex flex-col gap-2.5 px-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-xs text-muted-foreground">
          {total > 0 ? (
            <>
              Showing{" "}
              <span className="font-medium text-foreground">
                {flatData.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">{total}</span>
              {isFetching && !isFetchingNextPage ? " · updating…" : ""}
            </>
          ) : isLoading ? (
            "Loading…"
          ) : (
            "0 results"
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          {hasNextPage ? `${total - flatData.length} more` : "All loaded"}
        </div>
      </div>

      {/* Sentinel + manual fallback */}
      <div ref={sentinelRef} className="h-1 w-full" aria-hidden />

      <div className="flex justify-center py-2">
        {isFetchingNextPage ? (
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading more…
          </span>
        ) : hasNextPage ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => void fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            Load more
          </Button>
        ) : flatData.length > 0 ? (
          <span className="text-xs text-muted-foreground">
            You&apos;ve reached the end
          </span>
        ) : null}
      </div>
    </div>
  )
}

function LoadingRows({ rows }: { rows: number }) {
  const count = Math.min(Math.max(rows, 1), 6)
  return (
    <div className="flex flex-col gap-2 px-2 py-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-6 w-full animate-pulse rounded bg-muted" />
      ))}
    </div>
  )
}

type DocumentSort =
  | "filename"
  | "filepath"
  | "fileHash"
  | "ingested"
  | "createdAt"
  | "updatedAt"
