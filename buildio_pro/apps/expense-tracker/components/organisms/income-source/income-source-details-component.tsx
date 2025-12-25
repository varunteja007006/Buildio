"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit2, Trash2, Calendar } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

import { toast } from "sonner";
import { useTRPC } from "@/lib/trpc-client";
import { useQuery, useMutation } from "@tanstack/react-query";

interface IncomeSourceDetailsComponentProps {
  sourceId: string;
}

export function IncomeSourceDetailsComponent({
  sourceId,
}: IncomeSourceDetailsComponentProps) {
  const router = useRouter();
  const trpc = useTRPC();

  const { data: source, isLoading } = useQuery(
    trpc.incomeSource.getSourceById.queryOptions({ sourceId }),
  ) as { data?: any; isLoading: boolean };

  const deleteMutation = useMutation(
    trpc.incomeSource.deleteSource.mutationOptions({
      onSuccess: () => {
        toast.success("Income source deleted successfully!");
        router.push("/income-sources");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete income source");
      },
    }),
  );

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this income source? This action cannot be undone.",
      )
    ) {
      deleteMutation.mutate({ sourceId });
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Loading source details...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!source) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Source not found
          </div>
        </CardContent>
      </Card>
    );
  }

  const formattedCreatedDate = new Date(source.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const formattedUpdatedDate = new Date(source.updatedAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-2xl">{source.name}</CardTitle>
            {source.description && (
              <p className="text-muted-foreground mt-2">{source.description}</p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Source Information */}
          <div className="pb-6 border-b">
            <h3 className="text-lg font-semibold mb-4">Source Information</h3>
            <div className="grid gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Source Name</p>
                <p className="text-base font-medium">{source.name}</p>
              </div>

              {source.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-base">{source.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Details</h3>
            <div className="grid gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Created</p>
                  <p className="text-base">{formattedCreatedDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="text-base">{formattedUpdatedDate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Income Records */}
          {source.incomes && source.incomes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Related Income ({source.incomes.length})
              </h3>
              <p className="text-sm text-muted-foreground">
                This source is used by {source.incomes.length} income{" "}
                {source.incomes.length === 1 ? "record" : "records"}.
              </p>
            </div>
          )}
        </div>
      </CardContent>

      {/* Footer with Actions */}
      <div className="flex gap-2 px-6 py-4 border-t bg-muted/50">
        <Button
          variant="outline"
          onClick={() => router.push("/income-sources")}
        >
          Back to Sources
        </Button>
        <Button onClick={() => router.push(`/income-sources/${sourceId}/edit`)}>
          <Edit2 className="mr-2 h-4 w-4" />
          Edit Source
        </Button>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </div>
    </Card>
  );
}
