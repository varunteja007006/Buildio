"use client"

import { useQueryClient } from "@tanstack/react-query"
import { Button } from "@workspace/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { toast } from "sonner"


import { documentKeys } from "@/api/documents/query"
import { FileUpload, type FileUploadConfig } from "@/components/file-upload"

interface UploadDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Destination folder chosen from the tree (required before upload) */
  folderName: string | null
  folderId?: string | null
  topicId?: string | null
  /** Optional config to override defaults (accept, maxFileSize, maxFileCount, multiple) */
  config?: FileUploadConfig
}

/**
 * Upload dialog that wraps the reusable `FileUpload` drag-and-drop component.
 * Keeps a sticky header + footer and a scrollable body (max-h-[85vh]).
 * Forwards `folderId`/`topicId` as UploadThing input so the server can link the DB row.
 */
export function UploadDocumentDialog({
  open,
  onOpenChange,
  folderName,
  folderId = null,
  topicId = null,
  config,
}: UploadDocumentDialogProps) {
  const queryClient = useQueryClient()

  const handleComplete = () => {
    // Refresh the documents table/tree after a successful UploadThing upload
    void queryClient.invalidateQueries({ queryKey: documentKeys.all })
    toast.success("Documents queued for ingestion")
    onOpenChange(false)
  }

  const isReady = Boolean(folderId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="sticky top-0 z-10 shrink-0 border-b bg-popover p-4">
          <DialogTitle>Upload documents</DialogTitle>
          <DialogDescription>
            {isReady ? (
              <>
                Uploading to <span className="font-medium text-foreground">{folderName}</span>.
                Large files may take a moment to process.
              </>
            ) : (
              "Select a folder before uploading."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isReady ? (
            <FileUpload
              key={`${folderId}-${open ? "open" : "closed"}`}
              endpoint="documentUploader"
              input={{
                ...(folderId ? { folderId } : {}),
                ...(topicId ? { topicId } : {}),
              }}
              config={
                config ?? {
                  accept: ".pdf,.md,.mdx,.txt,.csv,application/pdf,text/plain,text/markdown",
                  maxFileSize: "10MB",
                  maxFileCount: 10,
                  multiple: true,
                }
              }
              onUploadComplete={handleComplete}
            />
          ) : (
            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No folder selected. Pick a folder in the tree first, then open this dialog.
            </div>
          )}
        </div>

        <DialogFooter className="sticky bottom-0 z-10 m-0 shrink-0 rounded-none bg-popover p-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}