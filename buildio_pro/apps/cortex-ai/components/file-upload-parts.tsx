"use client";

import { Button } from "@workspace/ui/components/button";
import { Progress } from "@workspace/ui/components/progress";
import { FileText, Loader2, UploadCloud, X } from "lucide-react";
import * as React from "react";

import { formatBytes } from "@/lib/file-upload.utils";
import { cn } from "@/lib/utils";

interface FileUploadDropzoneProps {
  accept: string;
  multiple: boolean;
  maxFileCount: number;
  allowedText: string;
  isDragActive: boolean;
  isUploading: boolean;
  disabled: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onOpen: () => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export function FileUploadDropzone({
  accept,
  multiple,
  maxFileCount,
  allowedText,
  isDragActive,
  isUploading,
  disabled,
  inputRef,
  onOpen,
  onDragOver,
  onDragLeave,
  onDrop,
  onInputChange,
  onKeyDown,
}: FileUploadDropzoneProps) {
  return (
    <div
      role="button"
      tabIndex={disabled || isUploading ? -1 : 0}
      aria-disabled={disabled || isUploading}
      aria-label="File upload dropzone"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onOpen}
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
        {isDragActive
          ? "Drop files here"
          : "Drop files here or click to browse"}
      </span>
      <span
        className="max-w-full truncate text-xs text-muted-foreground"
        title={allowedText}
      >
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
  );
}

interface FileUploadQueueProps {
  files: File[];
  isUploading: boolean;
  progress: number;
  autoUpload: boolean;
  disabled: boolean;
  onClearAll: () => void;
  onRemove: (index: number) => void;
  onUpload: () => void;
}

export function FileUploadQueue({
  files,
  isUploading,
  progress,
  autoUpload,
  disabled,
  onClearAll,
  onRemove,
  onUpload,
}: FileUploadQueueProps) {
  return (
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
          onClick={onClearAll}
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
                e.stopPropagation();
                onRemove(idx);
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
          onClick={onUpload}
          disabled={isUploading || files.length === 0 || disabled}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2
                className="size-4 animate-spin"
                data-icon="inline-start"
              />
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
  );
}
