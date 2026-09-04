import type {
  FileUploadCallbacks,
  Store,
} from "@workspace/ui/components/file-upload-context";

interface RunFileUploadOptions {
  store: Store;
  propsRef: { current: FileUploadCallbacks };
  onProgress: (file: File, progress: number) => void;
}

export async function runFileUpload(
  files: File[],
  options: RunFileUploadOptions,
): Promise<void> {
  const { store, propsRef, onProgress } = options;

  try {
    for (const file of files) {
      store.dispatch({ type: "SET_PROGRESS", file, progress: 0 });
    }

    if (propsRef.current.onUpload) {
      await propsRef.current.onUpload(files, {
        onProgress,
        onSuccess: (file) => {
          store.dispatch({ type: "SET_SUCCESS", file });
        },
        onError: (file, error) => {
          store.dispatch({
            type: "SET_ERROR",
            file,
            error: error.message ?? "Upload failed",
          });
        },
      });
    } else {
      for (const file of files) {
        store.dispatch({ type: "SET_SUCCESS", file });
      }
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Upload failed";
    for (const file of files) {
      store.dispatch({
        type: "SET_ERROR",
        file,
        error: errorMessage,
      });
    }
  }
}

interface RunFilesChangeOptions {
  store: Store;
  propsRef: { current: FileUploadCallbacks };
  isControlled: boolean;
  disabled: boolean;
  maxFiles?: number;
  maxSize?: number;
  acceptTypes: string[] | null;
  uploadFiles: (files: File[]) => Promise<void>;
}

export function runFilesChange(
  originalFiles: File[],
  options: RunFilesChangeOptions,
): void {
  const {
    store,
    propsRef,
    isControlled,
    disabled,
    maxFiles,
    maxSize,
    acceptTypes,
    uploadFiles,
  } = options;

  if (disabled) return;

  let filesToProcess = [...originalFiles];
  let invalid = false;

  if (maxFiles) {
    const currentCount = store.getState().files.size;
    const remainingSlotCount = Math.max(0, maxFiles - currentCount);

    if (remainingSlotCount < filesToProcess.length) {
      const rejectedFiles = filesToProcess.slice(remainingSlotCount);
      invalid = true;

      filesToProcess = filesToProcess.slice(0, remainingSlotCount);

      for (const file of rejectedFiles) {
        let rejectionMessage = `Maximum ${maxFiles} files allowed`;

        if (propsRef.current.onFileValidate) {
          const validationMessage = propsRef.current.onFileValidate(file);
          if (validationMessage) {
            rejectionMessage = validationMessage;
          }
        }

        propsRef.current.onFileReject?.(file, rejectionMessage);
      }
    }
  }

  const acceptedFiles: File[] = [];
  const rejectedFiles: { file: File; message: string }[] = [];

  for (const file of filesToProcess) {
    let rejected = false;
    let rejectionMessage = "";

    if (propsRef.current.onFileValidate) {
      const validationMessage = propsRef.current.onFileValidate(file);
      if (validationMessage) {
        rejectionMessage = validationMessage;
        propsRef.current.onFileReject?.(file, rejectionMessage);
        rejected = true;
        invalid = true;
        continue;
      }
    }

    if (acceptTypes) {
      const fileType = file.type;
      const fileExtension = `.${file.name.split(".").pop()}`;

      if (
        !acceptTypes.some(
          (type) =>
            type === fileType ||
            type === fileExtension ||
            (type.includes("/*") &&
              fileType.startsWith(type.replace("/*", "/"))),
        )
      ) {
        rejectionMessage = "File type not accepted";
        propsRef.current.onFileReject?.(file, rejectionMessage);
        rejected = true;
        invalid = true;
      }
    }

    if (maxSize && file.size > maxSize) {
      rejectionMessage = "File too large";
      propsRef.current.onFileReject?.(file, rejectionMessage);
      rejected = true;
      invalid = true;
    }

    if (!rejected) {
      acceptedFiles.push(file);
    } else {
      rejectedFiles.push({ file, message: rejectionMessage });
    }
  }

  if (invalid) {
    store.dispatch({ type: "SET_INVALID", invalid });
    setTimeout(() => {
      store.dispatch({ type: "SET_INVALID", invalid: false });
    }, 2000);
  }

  if (acceptedFiles.length > 0) {
    store.dispatch({ type: "ADD_FILES", files: acceptedFiles });

    if (isControlled && propsRef.current.onValueChange) {
      const currentFiles = Array.from(store.getState().files.values()).map(
        (f) => f.file,
      );
      propsRef.current.onValueChange([...currentFiles]);
    }

    if (propsRef.current.onAccept) {
      propsRef.current.onAccept(acceptedFiles);
    }

    for (const file of acceptedFiles) {
      propsRef.current.onFileAccept?.(file);
    }

    if (propsRef.current.onUpload) {
      requestAnimationFrame(() => {
        uploadFiles(acceptedFiles);
      });
    }
  }
}
