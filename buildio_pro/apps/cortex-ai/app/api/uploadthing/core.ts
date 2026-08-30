import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { documents } from "@/lib/db/schema/documents";
import { getActiveWorkspace } from "@/lib/workspaces";

const f = createUploadthing();

/**
 * FileRouter for the app.
 * - `documentUploader`: accepts PDF / text / md / blob up to 10MB, max 10 files.
 * - `input` optionally carries `folderId` / `topicId` so the DB row is linked.
 * - `middleware` validates the session via Better Auth.
 * - `onUploadComplete` inserts a `documents` row with `ingested=false` for later ingestion.
 */
export const ourFileRouter = {
  documentUploader: f(
    {
      // server allows up to 16MB; client enforces 10MB for UX (UploadThing only allows power-of-two sizes)
      pdf: { maxFileSize: "16MB", maxFileCount: 10 },
      text: { maxFileSize: "16MB", maxFileCount: 10 },
      blob: { maxFileSize: "16MB", maxFileCount: 10 },
    },
    {
      // allow overwriting / acl customization if needed
    },
  )
    .input(
      z
        .object({
          folderId: z.string().optional(),
          topicId: z.string().optional(),
        })
        .optional(),
    )
    .middleware(async ({ req, input }) => {
      const session = await auth.api.getSession({
        headers: req.headers,
      });
      if (!session?.user) {
        throw new UploadThingError("Unauthorized");
      }
      return {
        userId: session.user.id,
        folderId: input?.folderId ?? null,
        topicId: input?.topicId ?? null,
      };
    })
    .onUploadComplete(async ({ file, metadata }) => {
      try {
        const workspace = await getActiveWorkspace(metadata.userId);
        if (!workspace) {
          throw new Error("No active workspace");
        }

        // Persist the uploaded file as a tracked document (not yet ingested).
        // `filepath` stores the UploadThing CDN URL; `fileHash` is the UT hash.
        await db.insert(documents).values({
          workspaceId: workspace.id,
          filename: file.name,
          filepath: file.ufsUrl ?? file.url,
          fileHash: file.fileHash ?? file.key,
          folderId: metadata.folderId,
          topicId: metadata.topicId,
          ingested: false,
        });

        return {
          name: file.name,
          url: file.ufsUrl ?? file.url,
          key: file.key,
        };
      } catch (error) {
        // Log but don't throw – UploadThing will still mark the upload as failed if we throw.
        console.error("[uploadthing] onUploadComplete error:", error);
        throw new UploadThingError(
          error instanceof Error ? error.message : "Failed to persist document",
        );
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
