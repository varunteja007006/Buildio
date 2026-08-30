"use client"

import type { Column } from "@tanstack/react-table"
import { Button } from "@workspace/ui/components/button"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"


interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>
  }

  const sorted = column.getIsSorted()
  const sortState = sorted === "asc" ? "asc" : sorted === "desc" ? "desc" : "none"

  const toggle = () => {
    if (sorted === false) {
      column.toggleSorting(false)
    } else if (sorted === "asc") {
      column.toggleSorting(true)
    } else {
      column.clearSorting()
    }
  }

  return (
    <div className={cn("flex items-center", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-1.5 -ml-1.5 text-xs font-medium text-foreground"
        onClick={toggle}
      >
        <span>{title}</span>
        {sortState === "asc" ? (
          <ArrowUp className="size-3.5" />
        ) : sortState === "desc" ? (
          <ArrowDown className="size-3.5" />
        ) : (
          <ChevronsUpDown className="size-3.5 opacity-50" />
        )}
      </Button>
    </div>
  )
}