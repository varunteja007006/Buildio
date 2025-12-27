import React from "react";

import { IncomeSourceFormComponent } from "./income-source-form-dialog";

import { useIncomeSourceList } from "@/hooks";
import { IncomeSourceDetailsComponent } from "./income-source-details-dialog";

import { IncomeSourceDeleteDialog } from "./income-source-delete-dialog";

import { DataTable } from "@workspace/ui/components/data-table/data-table";
import { DataTableAdvancedToolbar } from "@workspace/ui/components/data-table/data-table-advanced-toolbar";
import { useDataTable } from "@workspace/ui/hooks/use-data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useQueryState } from "nuqs";

import { SpinnerEmpty } from "@/components/atoms/loaders/spinner-empty";

const columns: ColumnDef<{
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
}>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  { accessorKey: "description", header: "Description" },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const val = row.original.createdAt;
      return new Date(val).toLocaleDateString();
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const sourceId = row.original.id;
      return (
        <div className="flex justify-end gap-2">
          <IncomeSourceDetailsComponent sourceId={sourceId} />

          <IncomeSourceFormComponent
            mode="edit"
            sourceId={sourceId}
            initialValues={{
              name: row.original.name,
              description: row.original.description || "",
            }}
          />

          <IncomeSourceDeleteDialog sourceId={sourceId} />
        </div>
      );
    },
    enableSorting: false,
  },
];

export const IncomeSourceListTable = () => {
  const [limit] = useQueryState("perPage", {
    defaultValue: 10,
    parse: (v) => parseInt(v, 10),
  });

  const [page] = useQueryState("page", {
    defaultValue: 1,
    parse: (v) => parseInt(v, 10),
  });

  const { data, isLoading } = useIncomeSourceList({
    limit,
    page,
  });

  const sources = data?.data || [];
  const totalPages = data?.meta?.totalPages ?? 0;

  const { table } = useDataTable({
    data: sources,
    columns,
    pageCount: totalPages,
  });

  return (
    <>
      {isLoading ? (
        <div className="min-h-[300px] flex flex-col items-center">
          <SpinnerEmpty />
        </div>
      ) : (
        <DataTable table={table}>
          <DataTableAdvancedToolbar table={table}></DataTableAdvancedToolbar>
        </DataTable>
      )}
    </>
  );
};
