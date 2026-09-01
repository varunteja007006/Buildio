"use client";

import * as React from "react";
import { toast } from "sonner";

import type { OurFileRouter } from "@/app/api/uploadthing/core";
import {
  FileUploadDropzone,
  FileUploadQueue,
} from "@/components/file-upload-parts";
import {
  formatBytes,
  matchesAccept,
  parseFileSize,
} from "@/lib/file-upload.utils";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";

export type FileUploadConfig = {
  /** Value for the native `accept` attribute, e.g. ".pdf,.md,.txt" or "image/*" */
  accept?: string;
  /** Human-readable max size, e.g. "10MB". Used for UI + client-side validation. */
  maxFileSize?: string;
  /** Max number of files allowed in the queue. */
  maxFileCount?: number;
  /** Whether multiple files can be selected/dropped. Default true. */
  multiple?: boolean;
};

export interface FileUploadProps {
  /** UploadThing endpoint key – must exist in `OurFileRouter`. */
  endpoint: keyof OurFileRouter;
  /** Optional input forwarded to UploadThing (e.g. `{ folderId, topicId }`). */
  input?: Record<string, unknown>;
  /** Config that controls validation + UI copy. */
  config?: FileUploadConfig;
  /** Disable the whole dropzone. */
  disabled?: boolean;
  /** Additional container classes. */
  className?: string;
  /** Called when UploadThing finishes successfully. */
  onUploadComplete?: (
    files: { name: string; url: string; key: string; serverData: unknown }[],
  ) => void;
  /** Called on upload error. */
  onUploadError?: (error: Error) => void;
  /** If true, files are uploaded immediately on drop/select instead of waiting for the button. */
  autoUpload?: boolean;
}

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
  } = config ?? {};

  const maxBytes = React.useMemo(
    () => parseFileSize(maxFileSize),
    [maxFileSize],
  );

  const [files, setFiles] = React.useState<File[]>([]);
  const [isDragActive, setIsDragActive] = React.useState(false);
  const [progress, setProgress] = React.useState<number>(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const { startUpload, isUploading, routeConfig } = useUploadThing(
    endpoint as never,
    {
      onClientUploadComplete: (res) => {
        toast.success(`${res.length} file(s) uploaded`);
        setFiles([]);
        setProgress(0);
        onUploadComplete?.(res as never);
      },
      onUploadError: (error: Error) => {
        toast.error(error.message || "Upload failed");
        setProgress(0);
        onUploadError?.(error);
      },
      onUploadBegin: () => {
        setProgress(0);
      },
      onUploadProgress: (p) => {
        setProgress(p);
      },
    },
  );

  const handleUpload = React.useCallback(
    async (overrideFiles?: File[]) => {
      const toUpload = overrideFiles ?? files;
      if (toUpload.length === 0) {
        toast.error("No files to upload");
        return;
      }
      try {
        await startUpload(toUpload, input as never);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upload failed";
        toast.error(message);
        onUploadError?.(err instanceof Error ? err : new Error(message));
      }
    },
    [files, input, startUpload, onUploadError],
  );

  const addFiles = React.useCallback(
    (incoming: FileList | File[]) => {
      const list = Array.from(incoming);
      if (list.length === 0) return;

      const valid: File[] = [];
      const errors: string[] = [];

      for (const file of list) {
        if (!matchesAccept(file, accept)) {
          errors.push(`${file.name}: file type not allowed`);
          continue;
        }
        if (file.size > maxBytes) {
          errors.push(
            `${file.name}: exceeds ${maxFileSize} (${formatBytes(file.size)})`,
          );
          continue;
        }
        valid.push(file);
      }

      if (errors.length > 0) {
        errors.forEach((e) => toast.error(e));
      }
      if (valid.length === 0) return;

      setFiles((prev) => {
        const next = multiple ? [...prev, ...valid] : [...valid].slice(-1);
        if (next.length > maxFileCount) {
          toast.error(`You can only upload up to ${maxFileCount} files`);
          return next.slice(0, maxFileCount);
        }
        if (autoUpload) {
          queueMicrotask(() => {
            void handleUpload(next);
          });
        }
        return next;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accept, maxBytes, maxFileSize, maxFileCount, multiple, autoUpload],
  );

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => setFiles([]);

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (disabled || isUploading) return;
    setIsDragActive(true);
  };
  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    if (disabled || isUploading) return;
    addFiles(e.dataTransfer.files);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(e.target.files);
      e.target.value = "";
    }
  };

  const openFileDialog = () => {
    if (disabled || isUploading) return;
    inputRef.current?.click();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openFileDialog();
    }
  };

  const allowedText = routeConfig
    ? Object.entries(routeConfig as Record<string, { maxFileSize: string }>)
        .map(
          ([type, cfg]) =>
            `${type} (${(cfg as { maxFileSize: string }).maxFileSize})`,
        )
        .join(", ")
    : `${accept} up to ${maxFileSize}`;

  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      <FileUploadDropzone
        accept={accept}
        multiple={multiple}
        maxFileCount={maxFileCount}
        allowedText={allowedText}
        isDragActive={isDragActive}
        isUploading={isUploading}
        disabled={disabled}
        inputRef={inputRef}
        onOpen={openFileDialog}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onInputChange={onInputChange}
        onKeyDown={onKeyDown}
      />

      {files.length > 0 && (
        <FileUploadQueue
          files={files}
          isUploading={isUploading}
          progress={progress}
          autoUpload={autoUpload}
          disabled={disabled}
          onClearAll={clearAll}
          onRemove={removeFile}
          onUpload={() => handleUpload()}
        />
      )}

      {files.length === 0 && !isUploading && (
        <p className="text-center text-xs text-muted-foreground">
          PDF, Markdown, or text files up to {maxFileSize}
        </p>
      )}
    </div>
  );
}
