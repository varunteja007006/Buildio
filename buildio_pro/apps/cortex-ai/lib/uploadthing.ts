import { generateReactHelpers } from "@uploadthing/react";

import type { OurFileRouter } from "@/app/api/uploadthing/core";

/**
 * Typed helpers for UploadThing.
 * Use `useUploadThing` for custom UI or `uploadFiles` for imperative uploads.
 *
 * @example
 * const { startUpload, isUploading } = useUploadThing("documentUploader", {
 *   onClientUploadComplete: (res) => console.log(res),
 *   onUploadError: (err) => toast.error(err.message),
 * });
 * await startUpload(files, { folderId: "..." });
 */
export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();
