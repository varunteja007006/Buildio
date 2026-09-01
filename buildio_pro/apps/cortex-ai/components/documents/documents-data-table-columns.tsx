"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@workspace/ui/components/badge";
import { FileText } from "lucide-react";

import { formatDate, truncateHash } from "@/api/documents/helpers";
import type { Document } from "@/api/documents/types";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

export const documentsColumns: ColumnDef<Document>[] = [
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
      );
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
      const ingested = row.original.ingested;
      return (
        <Badge variant={ingested ? "default" : "secondary"}>
          {ingested ? "Ingested" : "Pending"}
        </Badge>
      );
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
];
