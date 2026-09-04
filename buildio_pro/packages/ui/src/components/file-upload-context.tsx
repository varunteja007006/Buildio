"use client";

import * as React from "react";

import { useLazyRef } from "@workspace/ui/hooks/use-lazy-ref";

export const ROOT_NAME = "FileUpload";
export const DROPZONE_NAME = "FileUploadDropzone";
export const TRIGGER_NAME = "FileUploadTrigger";
export const LIST_NAME = "FileUploadList";
export const ITEM_NAME = "FileUploadItem";
export const ITEM_PREVIEW_NAME = "FileUploadItemPreview";
export const ITEM_METADATA_NAME = "FileUploadItemMetadata";
export const ITEM_PROGRESS_NAME = "FileUploadItemProgress";
export const ITEM_DELETE_NAME = "FileUploadItemDelete";
export const CLEAR_NAME = "FileUploadClear";

export type Direction = "ltr" | "rtl";

export interface FileState {
  file: File;
  progress: number;
  error?: string;
  status: "idle" | "uploading" | "error" | "success";
}

export interface StoreState {
  files: Map<File, FileState>;
  dragOver: boolean;
  invalid: boolean;
}

export type StoreAction =
  | { type: "ADD_FILES"; files: File[] }
  | { type: "SET_FILES"; files: File[] }
  | { type: "SET_PROGRESS"; file: File; progress: number }
  | { type: "SET_SUCCESS"; file: File }
  | { type: "SET_ERROR"; file: File; error: string }
  | { type: "REMOVE_FILE"; file: File }
  | { type: "SET_DRAG_OVER"; dragOver: boolean }
  | { type: "SET_INVALID"; invalid: boolean }
  | { type: "CLEAR" };

export type Store = {
  getState: () => StoreState;
  dispatch: (action: StoreAction) => void;
  subscribe: (listener: () => void) => () => void;
};

export const StoreContext = React.createContext<Store | null>(null);

export function useStoreContext(consumerName: string) {
  const context = React.useContext(StoreContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

export function useStore<T>(selector: (state: StoreState) => T): T {
  const store = useStoreContext("useStore");

  const lastValueRef = useLazyRef<{ value: T; state: StoreState } | null>(
    () => null,
  );

  const getSnapshot = React.useCallback(() => {
    const state = store.getState();
    const prevValue = lastValueRef.current;

    if (prevValue && prevValue.state === state) {
      return prevValue.value;
    }

    const nextValue = selector(state);
    lastValueRef.current = { value: nextValue, state };
    return nextValue;
  }, [store, selector, lastValueRef]);

  return React.useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
}

export interface FileUploadContextValue {
  inputId: string;
  dropzoneId: string;
  listId: string;
  labelId: string;
  disabled: boolean;
  dir: Direction;
  inputRef: React.RefObject<HTMLInputElement | null>;
  urlCache: WeakMap<File, string>;
}

export const FileUploadContext =
  React.createContext<FileUploadContextValue | null>(null);

export function useFileUploadContext(consumerName: string) {
  const context = React.useContext(FileUploadContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ROOT_NAME}\``);
  }
  return context;
}

export interface FileUploadItemContextValue {
  id: string;
  fileState: FileState | undefined;
  nameId: string;
  sizeId: string;
  statusId: string;
  messageId: string;
}

export const FileUploadItemContext =
  React.createContext<FileUploadItemContextValue | null>(null);

export function useFileUploadItemContext(consumerName: string) {
  const context = React.useContext(FileUploadItemContext);
  if (!context) {
    throw new Error(`\`${consumerName}\` must be used within \`${ITEM_NAME}\``);
  }
  return context;
}

export interface FileUploadCallbacks {
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
}
