import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useTRPC, useTRPCClient } from "@/lib/trpc-client";

export type StatementDocumentType =
  | "credit_card"
  | "bank_statement"
  | "income_statement"
  | "income_tax_statement";

export const useStatementList = (params: {
  limit: number;
  page: number;
  documentType?: StatementDocumentType;
}) => {
  const trpc = useTRPC();

  return useQuery(
    trpc.statement.listStatements.queryOptions({
      limit: params.limit,
      page: params.page,
      documentType: params.documentType,
    }),
  );
};

export function useStatementUpload() {
  const trpc = useTRPC();
  const trpcClient = useTRPCClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      file,
      documentType,
    }: {
      file: File;
      documentType: StatementDocumentType;
    }) => {
      const { uploadId, uploadUrl } =
        await trpcClient.statement.createUpload.mutate({
          documentType,
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          fileSize: file.size,
        });

      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to upload file to storage");
      }

      return trpcClient.statement.completeUpload.mutate({ uploadId });
    },
    onSuccess: () => {
      toast.success("Statement uploaded successfully!");
      queryClient.invalidateQueries({
        queryKey: trpc.statement.listStatements.queryKey(),
      });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload statement");
    },
  });
}

export function useStatementRename(options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.statement.renameUpload.mutationOptions({
      onSuccess: () => {
        toast.success("Statement renamed successfully!");
        queryClient.invalidateQueries({
          queryKey: trpc.statement.listStatements.queryKey(),
        });
        options?.onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to rename statement");
        options?.onError?.(error);
      },
    }),
  );
}

export function useStatementDelete(options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.statement.deleteUpload.mutationOptions({
      onSuccess: () => {
        toast.success("Statement deleted successfully!");
        queryClient.invalidateQueries({
          queryKey: trpc.statement.listStatements.queryKey(),
        });
        options?.onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete statement");
        options?.onError?.(error);
      },
    }),
  );
}

export function useStatementDeleteSuperseded(options?: {
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.statement.deleteSupersededTransactions.mutationOptions({
      onSuccess: (data) => {
        toast.success(
          data.deletedCount > 0
            ? `Deleted ${data.deletedCount} superseded transaction(s).`
            : "No superseded transactions to delete.",
        );
        queryClient.invalidateQueries({
          queryKey: trpc.statement.listStatements.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.transaction.listTransactions.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.transaction.getAnalytics.queryKey(),
        });
        options?.onSuccess?.();
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete superseded transactions");
        options?.onError?.(error);
      },
    }),
  );
}

export function useStatementDownload() {
  const trpcClient = useTRPCClient();

  return useMutation({
    mutationFn: async (uploadId: string) => {
      const { downloadUrl, originalFilename, contentType } =
        await trpcClient.statement.getDownloadUrl.query({ uploadId });
      return { downloadUrl, originalFilename, contentType };
    },
  });
}

export function useStatementModels() {
  const trpc = useTRPC();

  return useQuery(trpc.statement.listExtractionModels.queryOptions());
}

export function useStatementProcess(options?: {
  onSuccess?: (data: {
    model: string;
    extractedCount: number;
    insertedCount: number;
    skippedCount: number;
    supersededCount: number;
    extractionVersion: number;
  }) => void;
  onError?: (error: Error) => void;
}) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.statement.processUpload.mutationOptions({
      onMutate: () => {
        queryClient.invalidateQueries({
          queryKey: trpc.statement.listStatements.queryKey(),
        });
      },
      onSuccess: (data) => {
        const message =
          data.supersededCount > 0
            ? `Extracted ${data.extractedCount} transactions from ${data.model} (v${data.extractionVersion}) — superseded ${data.supersededCount} old, ${data.insertedCount} new.`
            : `Extracted ${data.extractedCount} transactions (${data.insertedCount} new) from ${data.model}.`;
        toast.success(message);
        queryClient.invalidateQueries({
          queryKey: trpc.statement.listStatements.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.transaction.listTransactions.queryKey(),
        });
        queryClient.invalidateQueries({
          queryKey: trpc.transaction.getAnalytics.queryKey(),
        });
        options?.onSuccess?.(data);
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : "Failed to process statement",
        );
        queryClient.invalidateQueries({
          queryKey: trpc.statement.listStatements.queryKey(),
        });
        options?.onError?.(error instanceof Error ? error : new Error(String(error)));
      },
    }),
  );
}
