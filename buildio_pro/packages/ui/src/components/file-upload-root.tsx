"use client";

import {
  Direction as DirectionPrimitive,
  Slot as SlotPrimitive,
} from "radix-ui";
import * as React from "react";

import {
  type Direction,
  type FileState,
  type FileUploadContextValue,
  FileUploadContext,
  StoreContext,
} from "@workspace/ui/components/file-upload-context";
import {
  runFileUpload,
  runFilesChange,
} from "@workspace/ui/components/file-upload-flow";
import { createFileUploadStore } from "@workspace/ui/components/file-upload-store";
import { useAsRef } from "@workspace/ui/hooks/use-as-ref";
import { useLazyRef } from "@workspace/ui/hooks/use-lazy-ref";
import { cn } from "@workspace/ui/lib/utils";

export interface FileUploadProps extends Omit<
  React.ComponentProps<"div">,
  "defaultValue" | "onChange"
> {
  value?: File[];
  defaultValue?: File[];
  onValueChange?: (files: File[]) => void;
  onAccept?: (files: File[]) => void;
  onFileAccept?: (file: File) => void;
  onFileReject?: (file: File, message: string) => void;
  onFileValidate?: (file: File) => string | null | undefined;
  onUpload?: (
    files: File[],
    options: {
      onProgress: (file: File, progress: number) => void;
      onSuccess: (file: File) => void;
      onError: (file: File, error: Error) => void;
    },
  ) => Promise<void> | void;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
  dir?: Direction;
  label?: string;
  name?: string;
  asChild?: boolean;
  disabled?: boolean;
  invalid?: boolean;
  multiple?: boolean;
  required?: boolean;
}

function FileUpload(props: FileUploadProps) {
  const {
    value,
    defaultValue,
    onValueChange,
    onAccept,
    onFileAccept,
    onFileReject,
    onFileValidate,
    onUpload,
    accept,
    maxFiles,
    maxSize,
    dir: dirProp,
    label,
    name,
    asChild,
    disabled = false,
    invalid = false,
    multiple = false,
    required = false,
    children,
    className,
    ...rootProps
  } = props;

  const inputId = React.useId();
  const dropzoneId = React.useId();
  const listId = React.useId();
  const labelId = React.useId();
  const dir = DirectionPrimitive.useDirection(dirProp);
  const listeners = useLazyRef(() => new Set<() => void>()).current;
  const files = useLazyRef<Map<File, FileState>>(() => new Map()).current;
  const urlCache = useLazyRef(() => new WeakMap<File, string>()).current;
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isControlled = value !== undefined;

  const propsRef = useAsRef({
    onValueChange,
    onAccept,
    onFileAccept,
    onFileReject,
    onFileValidate,
    onUpload,
  });
  const store = React.useMemo(
    () =>
      createFileUploadStore({ files, listeners, urlCache, invalid, propsRef }),
    [listeners, files, invalid, propsRef, urlCache],
  );

  const acceptTypes = React.useMemo(
    () => accept?.split(",").map((t) => t.trim()) ?? null,
    [accept],
  );
  const onProgress = useLazyRef(() => {
    let frame = 0;
    return (file: File, progress: number) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        store.dispatch({
          type: "SET_PROGRESS",
          file,
          progress: Math.min(Math.max(0, progress), 100),
        });
      });
    };
  }).current;

  React.useEffect(() => {
    if (isControlled) {
      store.dispatch({ type: "SET_FILES", files: value });
    } else if (
      defaultValue &&
      defaultValue.length > 0 &&
      !store.getState().files.size
    ) {
      store.dispatch({ type: "SET_FILES", files: defaultValue });
    }
  }, [value, defaultValue, isControlled, store]);

  React.useEffect(() => {
    return () => {
      for (const file of files.keys()) {
        const cachedUrl = urlCache.get(file);
        if (cachedUrl) {
          URL.revokeObjectURL(cachedUrl);
        }
      }
    };
  }, [files, urlCache]);

  const onFilesUpload = React.useCallback(
    (uploadFiles: File[]) =>
      runFileUpload(uploadFiles, { store, propsRef, onProgress }),
    [store, propsRef, onProgress],
  );
  const onFilesChange = React.useCallback(
    (originalFiles: File[]) =>
      runFilesChange(originalFiles, {
        store,
        propsRef,
        isControlled,
        disabled,
        maxFiles,
        maxSize,
        acceptTypes,
        uploadFiles: onFilesUpload,
      }),
    [
      store,
      isControlled,
      propsRef,
      onFilesUpload,
      maxFiles,
      acceptTypes,
      maxSize,
      disabled,
    ],
  );

  const onInputChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const changeFiles = Array.from(event.target.files ?? []);
      onFilesChange(changeFiles);
      event.target.value = "";
    },
    [onFilesChange],
  );

  const contextValue = React.useMemo<FileUploadContextValue>(
    () => ({
      dropzoneId,
      inputId,
      listId,
      labelId,
      dir,
      disabled,
      inputRef,
      urlCache,
    }),
    [dropzoneId, inputId, listId, labelId, dir, disabled, urlCache],
  );

  const RootPrimitive = asChild ? SlotPrimitive.Slot : "div";

  return (
    <StoreContext.Provider value={store}>
      <FileUploadContext.Provider value={contextValue}>
        <RootPrimitive
          data-disabled={disabled ? "" : undefined}
          data-slot="file-upload"
          dir={dir}
          {...rootProps}
          className={cn("relative flex flex-col gap-2", className)}
        >
          {children}
          <input
            type="file"
            id={inputId}
            aria-labelledby={labelId}
            aria-describedby={dropzoneId}
            ref={inputRef}
            tabIndex={-1}
            accept={accept}
            name={name}
            className="sr-only"
            disabled={disabled}
            multiple={multiple}
            required={required}
            onChange={onInputChange}
          />
          <div id={labelId} className="sr-only">
            {label ?? "File upload"}
          </div>
        </RootPrimitive>
      </FileUploadContext.Provider>
    </StoreContext.Provider>
  );
}

export { FileUpload };
