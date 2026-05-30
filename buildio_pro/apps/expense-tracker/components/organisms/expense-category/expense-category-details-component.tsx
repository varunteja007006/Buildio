"use client";

import * as React from "react";

import { Calendar, Eye } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog";

import { useExpenseCategoryDetails } from "@/hooks";
import { localDateFormat } from "@/lib/utils/date.utils";

interface ExpenseCategoryDetailsComponentProps {
  categoryId: string;
}

export function ExpenseCategoryDetailsDialog({
  categoryId,
}: ExpenseCategoryDetailsComponentProps) {
  const { data: category, isLoading } = useExpenseCategoryDetails(categoryId);

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

  const formattedCreatedDate = localDateFormat(category.createdAt);

  const formattedUpdatedDate = localDateFormat(category.updatedAt);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category.name}</DialogTitle>
          <DialogDescription>
            {category.description && (
              <p className="text-muted-foreground mt-2">
                {category.description}
              </p>
            )}
          </DialogDescription>
        </DialogHeader>

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
      </DialogContent>
    </Dialog>
  );
}
