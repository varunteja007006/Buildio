"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useRouter } from "next/navigation";
import * as React from "react";

import { useStatementList, type StatementDocumentType } from "@/hooks";

import {
  ExtractStatementDialog,
  type ExtractStatement,
} from "./extract-statement-dialog";
import { StatementUploadCard } from "./statement-upload-card";
import { StatementsTable, type StatementRow } from "./statements-table";

export function StatementsPage() {
  const [filter, setFilter] = React.useState<"all" | StatementDocumentType>(
    "all",
  );
  const [limit, setLimit] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const [extractingStatement, setExtractingStatement] =
    React.useState<ExtractStatement | null>(null);
  const router = useRouter();

  const { data, isLoading, refetch } = useStatementList({
    limit,
    page,
    documentType: filter === "all" ? undefined : filter,
  });

  const hasProcessing = React.useMemo(
    () =>
      data?.data.some((statement) => statement.status === "processing") ??
      false,
    [data],
  );

  React.useEffect(() => {
    if (!hasProcessing) return;
    const interval = window.setInterval(() => {
      refetch();
    }, 3000);
    return () => window.clearInterval(interval);
  }, [hasProcessing, refetch]);

  const statements = data?.data || [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 0;
  const currentPage = meta?.currentPage ?? 1;

  const handleView = (statement: StatementRow) => {
    router.push(`/transactions?statementUploadId=${statement.id}`);
  };

  const handleExtract = (statement: StatementRow) => {
    setExtractingStatement({
      id: statement.id,
      originalFilename: statement.originalFilename,
      documentType: statement.documentType,
      extractionModel: statement.extractionModel,
    });
  };

  return (
    <div className="space-y-6">
      <StatementUploadCard />

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Statement Uploads</CardTitle>
          <CardDescription>
            History of your uploaded statements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <Select
                value={filter}
                onValueChange={(val) => {
                  setFilter(val as "all" | StatementDocumentType);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="bank_statement">
                    Bank Statement
                  </SelectItem>
                  <SelectItem value="income_statement">
                    Income Statement
                  </SelectItem>
                  <SelectItem value="income_tax_statement">
                    Income Tax Statement
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={String(limit)}
                onValueChange={(val) => {
                  setLimit(Number(val));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Items per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <StatementsTable
              statements={statements}
              isLoading={isLoading}
              onView={handleView}
              onExtract={handleExtract}
            />

            {meta && totalPages > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * limit + 1} to{" "}
                  {Math.min(currentPage * limit, meta.totalItems)} of{" "}
                  {meta.totalItems} statements
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={!meta.hasPrevPage}
                  >
                    Previous
                  </Button>
                  <span className="text-sm px-4 py-2">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!meta.hasNextPage}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ExtractStatementDialog
        statement={extractingStatement}
        open={Boolean(extractingStatement)}
        onOpenChange={(open) => {
          if (!open) setExtractingStatement(null);
        }}
      />
    </div>
  );
}
