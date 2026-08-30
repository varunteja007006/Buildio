"use client"

import { Button } from "@workspace/ui/components/button"
import { Progress } from "@workspace/ui/components/progress"
import { FileText, UploadCloud, X, Loader2 } from "lucide-react"
import * as React from "react"
import { toast } from "sonner"

import type { OurFileRouter } from "@/app/api/uploadthing/core"
import { useUploadThing } from "@/lib/uploadthing"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function parseFileSize(size: string): number {
  const units: Record<string, number> = {
    B: 1,
    KB: 1024,
    MB: 1024 * 1024,
    GB: 1024 * 1024 * 1024,
  }
  const match = size.trim().toUpperCase().match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)$/)
  if (!match) return 10 * 1024 * 1024 // default 10MB
  const value = parseFloat(match[1])
  const unit = match[2]
  return Math.round(value * (units[unit] ?? units.MB))
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  const val = bytes / Math.pow(k, i)
  return `${val % 1 === 0 ? val : val.toFixed(1)} ${sizes[i]}`
}

function matchesAccept(file: File, accept?: string): boolean {
  if (!accept || accept.trim() === "" || accept.trim() === "*") return true
  const tokens = accept
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)

  const fileExt = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`
  const mime = file.type.toLowerCase()

  return tokens.some((token) => {
    if (token.startsWith(".")) return fileExt === token
    if (token.endsWith("/*")) {
      const prefix = token.slice(0, -2)
      return mime.startsWith(prefix + "/")
    }
    // exact mime or fallback to extension check
    if (mime === token) return true
    // allow token like "application/pdf" to match extension .pdf
    if (token.includes("/")) return false
    return false
  })
}

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export type FileUploadConfig = {
  /** Value for the native `accept` attribute, e.g. ".pdf,.md,.txt" or "image/*" */
  accept?: string
  /** Human-readable max size, e.g. "10MB". Used for UI + client-side validation. */
  maxFileSize?: string
  /** Max number of files allowed in the queue. */
  maxFileCount?: number
  /** Whether multiple files can be selected/dropped. Default true. */
  multiple?: boolean
}

export interface FileUploadProps {
  /** UploadThing endpoint key – must exist in `OurFileRouter`. */
  endpoint: keyof OurFileRouter
  /** Optional input forwarded to UploadThing (e.g. `{ folderId, topicId }`). */
  input?: Record<string, unknown>
  /** Config that controls validation + UI copy. */
  config?: FileUploadConfig
  /** Disable the whole dropzone. */
  disabled?: boolean
  /** Additional container classes. */
  className?: string
  /** Called when UploadThing finishes successfully. */
  onUploadComplete?: (files: { name: string; url: string; key: string; serverData: unknown }[]) => void
  /** Called on upload error. */
  onUploadError?: (error: Error) => void
  /** If true, files are uploaded immediately on drop/select instead of waiting for the button. */
  autoUpload?: boolean
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export function FileUpload({
  endpoint,
  input,
  config,
  disabled = false,
  className,
  onUploadComplete,
  onUploadError,
  autoUpload = false,
}: FileUploadProps) {
  const {
    accept = ".pdf,.md,.mdx,.txt,.csv,application/pdf,text/plain,text/markdown",
    maxFileSize = "10MB",
    maxFileCount = 10,
    multiple = true,
  } = config ?? {}

  const maxBytes = React.useMemo(() => parseFileSize(maxFileSize), [maxFileSize])

  const [files, setFiles] = React.useState<File[]>([])
  const [isDragActive, setIsDragActive] = React.useState(false)
  const [progress, setProgress] = React.useState<number>(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const { startUpload, isUploading, routeConfig } = useUploadThing(
    endpoint as never,
    {
      onClientUploadComplete: (res) => {
        // `res` is ClientUploadedFileData[] from the server
        toast.success(`${res.length} file(s) uploaded`)
        setFiles([])
        setProgress(0)
        onUploadComplete?.(res as never)
      },
      onUploadError: (error: Error) => {
        toast.error(error.message || "Upload failed")
        setProgress(0)
        onUploadError?.(error)
      },
      onUploadBegin: () => {
        setProgress(0)
      },
      onUploadProgress: (p) => {
        setProgress(p)
      },
    },
  )

  const addFiles = React.useCallback(
    (incoming: FileList | File[]) => {
      const list = Array.from(incoming)
      if (list.length === 0) return

      // Per-file validation
      const valid: File[] = []
      const errors: string[] = []

      for (const file of list) {
        if (!matchesAccept(file, accept)) {
          errors.push(`${file.name}: file type not allowed`)
          continue
        }
        if (file.size > maxBytes) {
          errors.push(`${file.name}: exceeds ${maxFileSize} (${formatBytes(file.size)})`)
          continue
        }
        valid.push(file)
      }

      if (errors.length > 0) {
        errors.forEach((e) => toast.error(e))
      }
      if (valid.length === 0) return

      setFiles((prev) => {
        const next = multiple ? [...prev, ...valid] : [...valid].slice(-1)
        if (next.length > maxFileCount) {
          toast.error(`You can only upload up to ${maxFileCount} files`)
          return next.slice(0, maxFileCount)
        }
        // auto upload if enabled
        if (autoUpload) {
          // defer to effect / directly trigger
          queueMicrotask(() => {
            void handleUpload(next)
          })
        }
        return next
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accept, maxBytes, maxFileSize, maxFileCount, multiple, autoUpload],
  )

  const handleUpload = React.useCallback(
    async (overrideFiles?: File[]) => {
      const toUpload = overrideFiles ?? files
      if (toUpload.length === 0) {
        toast.error("No files to upload")
        return
      }
      try {
        await startUpload(toUpload, input as never)
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed"
        toast.error(message)
        onUploadError?.(err instanceof Error ? err : new Error(message))
      }
    },
    [files, input, startUpload, onUploadError],
  )

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const clearAll = () => setFiles([])

  // Drag handlers
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (disabled || isUploading) return
    setIsDragActive(true)
  }
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(false)
  }
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragActive(false)
    if (disabled || isUploading) return
    addFiles(e.dataTransfer.files)
  }

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files)
      // reset input so same file can be re-selected
      e.target.value = ""
    }
  }

  const openFileDialog = () => {
    if (disabled || isUploading) return
    inputRef.current?.click()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      openFileDialog()
    }
  }

  // Derive allowed content text from router config if available, else fallback to `accept`
  const allowedText =
    routeConfig
      ? Object.entries(routeConfig as Record<string, { maxFileSize: string }>)
          .map(([type, cfg]) => `${type} (${(cfg as { maxFileSize: string }).maxFileSize})`)
          .join(", ")
      : `${accept} up to ${maxFileSize}`

  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      {/* Dropzone */}
      <div
        role="button"
        tabIndex={disabled || isUploading ? -1 : 0}
        aria-disabled={disabled || isUploading}
        aria-label="File upload dropzone"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={openFileDialog}
        onKeyDown={onKeyDown}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center transition-colors",
          "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          isDragActive && "border-primary bg-primary/5",
          (disabled || isUploading) && "pointer-events-none opacity-60",
        )}
      >
        <span className="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
          {isUploading ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <UploadCloud className="size-5" />
          )}
        </span>
        <span className="text-sm font-medium">
          {isDragActive ? "Drop files here" : "Drop files here or click to browse"}
        </span>
        <span className="max-w-full truncate text-xs text-muted-foreground" title={allowedText}>
          {allowedText}
          {multiple ? ` • up to ${maxFileCount} files` : ""}
        </span>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled || isUploading}
          onChange={onInputChange}
          className="hidden"
          // prevent click bubbling from input to container (we handle it)
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {files.length} file{files.length > 1 ? "s" : ""} selected
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={clearAll}
              disabled={isUploading}
            >
              Clear all
            </Button>
          </div>

          <ul className="flex max-h-48 flex-col gap-2 overflow-y-auto pr-1">
            {files.map((file, idx) => (
              <li
                key={`${file.name}-${file.size}-${idx}`}
                className="flex items-center gap-2 rounded-md border bg-card px-2 py-1.5"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                  <FileText className="size-4" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-xs font-medium">{file.name}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {formatBytes(file.size)}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-6 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(idx)
                  }}
                  disabled={isUploading}
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>

          {isUploading && (
            <div className="flex flex-col gap-1">
              <Progress value={progress} className="h-1.5 w-full" />
              <span className="text-xs tabular-nums text-muted-foreground">
                {progress}% uploading…
              </span>
            </div>
          )}

          {!autoUpload && (
            <Button
              type="button"
              onClick={() => handleUpload()}
              disabled={isUploading || files.length === 0 || disabled}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                  Uploading…
                </>
              ) : (
                <>
                  <UploadCloud data-icon="inline-start" />
                  Upload {files.length} file{files.length > 1 ? "s" : ""}
                </>
              )}
            </Button>
          )}
        </div>
      )}

      {/* Helper: when no files and not uploading, show queue hint */}
      {files.length === 0 && !isUploading && (
        <p className="text-center text-xs text-muted-foreground">
          PDF, Markdown, or text files up to {maxFileSize}
        </p>
      )}
    </div>
  )
}
