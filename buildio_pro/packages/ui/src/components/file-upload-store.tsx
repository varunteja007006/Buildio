import type {
  FileState,
  Store,
  StoreAction,
  StoreState,
} from "@workspace/ui/components/file-upload-context";

interface CreateFileUploadStoreOptions {
  files: Map<File, FileState>;
  listeners: Set<() => void>;
  urlCache: WeakMap<File, string>;
  invalid: boolean;
  propsRef: { current: { onValueChange?: (files: File[]) => void } };
}

export function createFileUploadStore({
  files,
  listeners,
  urlCache,
  invalid,
  propsRef,
}: CreateFileUploadStoreOptions): Store {
  let state: StoreState = {
    files,
    dragOver: false,
    invalid: invalid,
  };

  function reducer(state: StoreState, action: StoreAction): StoreState {
    switch (action.type) {
      case "ADD_FILES": {
        for (const file of action.files) {
          files.set(file, {
            file,
            progress: 0,
            status: "idle",
          });
        }

        if (propsRef.current.onValueChange) {
          const fileList = Array.from(files.values()).map(
            (fileState) => fileState.file,
          );
          propsRef.current.onValueChange(fileList);
        }
        return { ...state, files };
      }

      case "SET_FILES": {
        const newFileSet = new Set(action.files);
        for (const existingFile of files.keys()) {
          if (!newFileSet.has(existingFile)) {
            files.delete(existingFile);
          }
        }

        for (const file of action.files) {
          const existingState = files.get(file);
          if (!existingState) {
            files.set(file, {
              file,
              progress: 0,
              status: "idle",
            });
          }
        }
        return { ...state, files };
      }

      case "SET_PROGRESS": {
        const fileState = files.get(action.file);
        if (fileState) {
          files.set(action.file, {
            ...fileState,
            progress: action.progress,
            status: "uploading",
          });
        }
        return { ...state, files };
      }

      case "SET_SUCCESS": {
        const fileState = files.get(action.file);
        if (fileState) {
          files.set(action.file, {
            ...fileState,
            progress: 100,
            status: "success",
          });
        }
        return { ...state, files };
      }

      case "SET_ERROR": {
        const fileState = files.get(action.file);
        if (fileState) {
          files.set(action.file, {
            ...fileState,
            error: action.error,
            status: "error",
          });
        }
        return { ...state, files };
      }

      case "REMOVE_FILE": {
        const cachedUrl = urlCache.get(action.file);
        if (cachedUrl) {
          URL.revokeObjectURL(cachedUrl);
          urlCache.delete(action.file);
        }

        files.delete(action.file);

        if (propsRef.current.onValueChange) {
          const fileList = Array.from(files.values()).map(
            (fileState) => fileState.file,
          );
          propsRef.current.onValueChange(fileList);
        }
        return { ...state, files };
      }

      case "SET_DRAG_OVER": {
        return { ...state, dragOver: action.dragOver };
      }

      case "SET_INVALID": {
        return { ...state, invalid: action.invalid };
      }

      case "CLEAR": {
        for (const file of files.keys()) {
          const cachedUrl = urlCache.get(file);
          if (cachedUrl) {
            URL.revokeObjectURL(cachedUrl);
            urlCache.delete(file);
          }
        }

        files.clear();
        if (propsRef.current.onValueChange) {
          propsRef.current.onValueChange([]);
        }
        return { ...state, files, invalid: false };
      }

      default:
        return state;
    }
  }

  return {
    getState: () => state,
    dispatch: (action) => {
      state = reducer(state, action);
      for (const listener of listeners) {
        listener();
      }
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
