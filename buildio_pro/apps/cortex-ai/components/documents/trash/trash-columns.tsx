import { Button } from "@workspace/ui/components/button";

import { formatDate } from "@/api/documents/helpers";
import type { Document } from "@/api/documents/types";
import type { ExtractionTemplate } from "@/api/extraction-templates/types";
import type { Column } from "@/components/data-table";

type TrashDocumentActions = {
  onRestore: (id: string) => void;
  onPermanentDelete: (doc: Document) => void;
  restorePending: boolean;
  permanentPending: boolean;
};

/** Columns for the trash page's deleted-documents table (H8) */
export function getTrashDocumentColumns({
  onRestore,
  onPermanentDelete,
  restorePending,
  permanentPending,
}: TrashDocumentActions): Column<Document>[] {
  return [
    {
      header: "Filename",
      accessor: (doc) => (
        <div>
          <div className="font-medium">{doc.filename}</div>
          <div className="max-w-sm truncate text-xs text-muted-foreground">
            {doc.filepath}
          </div>
        </div>
      ),
    },
    {
      header: "Deleted",
      accessor: (doc) => (
        <span className="text-muted-foreground">
          {doc.deletedAt ? formatDate(doc.deletedAt) : "—"}
        </span>
      ),
      headClassName: "hidden sm:table-cell",
      cellClassName: "hidden sm:table-cell",
    },
    {
      header: "",
      accessor: (doc) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRestore(doc.id)}
            disabled={restorePending}
          >
            Restore
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onPermanentDelete(doc)}
            disabled={permanentPending}
          >
            Delete permanently
          </Button>
        </div>
      ),
      cellClassName: "text-right",
    },
  ];
}

type TrashTemplateActions = {
  onRestore: (id: string) => void;
  onPermanentDelete: (template: ExtractionTemplate) => void;
  restorePending: boolean;
  permanentPending: boolean;
};

/** Columns for the trash page's deleted-extraction-templates table (H8) */
export function getTrashTemplateColumns({
  onRestore,
  onPermanentDelete,
  restorePending,
  permanentPending,
}: TrashTemplateActions): Column<ExtractionTemplate>[] {
  return [
    {
      header: "Name",
      accessor: (template) => (
        <div>
          <div className="font-medium">{template.name}</div>
          <div className="max-w-sm truncate text-xs text-muted-foreground">
            {template.description || "No description"}
          </div>
        </div>
      ),
    },
    {
      header: "Deleted",
      accessor: (template) => (
        <span className="text-muted-foreground">
          {template.deletedAt ? formatDate(template.deletedAt) : "—"}
        </span>
      ),
      headClassName: "hidden sm:table-cell",
      cellClassName: "hidden sm:table-cell",
    },
    {
      header: "",
      accessor: (template) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRestore(template.id)}
            disabled={restorePending}
          >
            Restore
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => onPermanentDelete(template)}
            disabled={permanentPending}
          >
            Delete permanently
          </Button>
        </div>
      ),
      cellClassName: "text-right",
    },
  ];
}
