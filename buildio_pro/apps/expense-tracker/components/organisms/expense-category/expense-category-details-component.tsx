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

interface ExpenseCategoryDetailsComponentProps {
  categoryId: string;
}

export function ExpenseCategoryDetailsComponent({
  categoryId,
}: ExpenseCategoryDetailsComponentProps) {
  const router = useRouter();
  const trpc = useTRPC();

  const { data: category, isLoading } = useQuery(
    trpc.expenseCategory.getCategoryById.queryOptions({ categoryId }),
  ) as { data?: any; isLoading: boolean };

  const deleteMutation = useMutation(
    trpc.expenseCategory.deleteCategory.mutationOptions({
      onSuccess: () => {
        toast.success("Expense category deleted successfully!");
        router.push("/expense-categories");
      },
      onError: (error: any) => {
        toast.error(error.message || "Failed to delete expense category");
      },
    }),
  );

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this expense category? This action cannot be undone.",
      )
    ) {
      deleteMutation.mutate({ categoryId });
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Loading category details...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!category) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            Category not found
          </div>
        </CardContent>
      </Card>
    );
  }

  const formattedCreatedDate = new Date(category.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  );

  const formattedUpdatedDate = new Date(category.updatedAt).toLocaleDateString(
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
            <CardTitle className="text-2xl">{category.name}</CardTitle>
            {category.description && (
              <p className="text-muted-foreground mt-2">
                {category.description}
              </p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Category Information */}
          <div className="pb-6 border-b">
            <h3 className="text-lg font-semibold mb-4">Category Information</h3>
            <div className="grid gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Category Name</p>
                <p className="text-base font-medium">{category.name}</p>
              </div>

              {category.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-base">{category.description}</p>
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
        </div>
      </CardContent>

      {/* Footer with Actions */}
      <div className="flex gap-2 px-6 py-4 border-t bg-muted/50">
        <Button
          variant="outline"
          onClick={() => router.push("/expense-categories")}
        >
          Back to Categories
        </Button>
        <Button
          onClick={() => router.push(`/expense-categories/${categoryId}/edit`)}
        >
          <Edit2 className="mr-2 h-4 w-4" />
          Edit Category
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
