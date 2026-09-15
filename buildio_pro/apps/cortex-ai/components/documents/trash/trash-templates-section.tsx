"use client";

import { Button } from "@workspace/ui/components/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

import {
  useExtractionTemplates,
  usePermanentlyDeleteExtractionTemplate,
  useRestoreExtractionTemplate,
} from "@/api/extraction-templates/query";
import type { ExtractionTemplate } from "@/api/extraction-templates/types";
import { DataTable } from "@/components/data-table";
import { getTrashTemplateColumns } from "@/components/documents/trash/trash-columns";

const PAGE_SIZE = 5;

/** Deleted extraction templates section of the trash page (H8) */
export function TrashTemplatesSection({
  onConfirmDelete,
  onConfirmRestore,
}: {
  onConfirmDelete: (template: ExtractionTemplate) => void;
  onConfirmRestore: (id: string) => void;
}) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useExtractionTemplates(page, PAGE_SIZE, "deleted");
  const restore = useRestoreExtractionTemplate();
  const permanent = usePermanentlyDeleteExtractionTemplate();
  const pageCount = data?.pageCount || 1;

  const columns = getTrashTemplateColumns({
    onRestore: onConfirmRestore,
    onPermanentDelete: onConfirmDelete,
    restorePending: restore.isPending,
    permanentPending: permanent.isPending,
  });

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">Extraction templates</h2>
      <DataTable
        columns={columns}
        data={data?.templates ?? []}
        keyExtractor={(template) => template.id}
        loading={isLoading}
        emptyMessage="No deleted templates."
      />
      {pageCount > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((value) => value - 1)}
          >
            <ChevronLeft data-icon="inline-start" /> Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pageCount}
            onClick={() => setPage((value) => value + 1)}
          >
            Next <ChevronRight data-icon="inline-end" />
          </Button>
        </div>
      )}
    </section>
  );
}
