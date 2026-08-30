"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@workspace/ui/components/alert-dialog";
import { Badge } from "@workspace/ui/components/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  CreditCard,
  Download,
  FileText,
  Landmark,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import * as React from "react";

import {
  useStatementDelete,
  useStatementDownload,
  useStatementList,
  useStatementUpload,
  type StatementDocumentType,
} from "@/hooks";

const documentTypeLabels: Record<StatementDocumentType, string> = {
  credit_card: "Credit Card",
  bank_statement: "Bank Statement",
};

const documentTypeIcons: Record<StatementDocumentType, React.ElementType> = {
  credit_card: CreditCard,
  bank_statement: Landmark,
};

const statusVariants: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  pending: "outline",
  uploaded: "secondary",
  processing: "default",
  processed: "default",
  failed: "destructive",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "-";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function StatementsPage() {
  const [documentType, setDocumentType] =
    React.useState<StatementDocumentType>("credit_card");
  const [filter, setFilter] = React.useState<"all" | StatementDocumentType>(
    "all",
  );
  const [limit, setLimit] = React.useState(10);
  const [page, setPage] = React.useState(1);
  const [file, setFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { data, isLoading } = useStatementList({
    limit,
    page,
    documentType: filter === "all" ? undefined : filter,
  });
  const uploadMutation = useStatementUpload();
  const deleteMutation = useStatementDelete();
  const downloadMutation = useStatementDownload();

  const statements = data?.data || [];
  const meta = data?.meta;
  const totalPages = meta?.totalPages ?? 0;
  const currentPage = meta?.currentPage ?? 1;

  const handleFileChange = (selected: File | null) => {
    if (!selected) return;
    setFile(selected);
    uploadMutation.mutate({ file: selected, documentType });
  };

  const handleDownload = (uploadId: string) => {
    downloadMutation.mutate(uploadId, {
      onSuccess: ({ downloadUrl }) => {
        window.open(downloadUrl, "_blank", "noopener,noreferrer");
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Upload Statement</CardTitle>
          <CardDescription>
            Upload credit card or bank statements for record keeping
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <Select
                value={documentType}
                onValueChange={(val) =>
                  setDocumentType(val as StatementDocumentType)
                }
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="bank_statement">Bank Statement</SelectItem>
                </SelectContent>
              </Select>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.csv,.xlsx,.xls,.txt,application/pdf,text/csv,text/plain"
                className="hidden"
                onChange={(e) => {
                  handleFileChange(e.target.files?.[0] ?? null);
                  e.target.value = "";
                }}
              />

              <Button
                variant="outline"
                disabled={uploadMutation.isPending}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Upload className="size-4" />
                )}
                {uploadMutation.isPending
                  ? "Uploading..."
                  : `Upload ${documentTypeLabels[documentType]}`}
              </Button>
            </div>

            <div
              role="button"
              tabIndex={0}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  fileInputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFileChange(e.dataTransfer.files?.[0] ?? null);
              }}
            >
              {file ? (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="size-5 text-muted-foreground" />
                  <span className="font-medium">{file.name}</span>
                  <span className="text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                </div>
              ) : (
                <>
                  <FileText className="size-8 text-muted-foreground" />
                  <p className="text-sm font-medium">
                    Drag & drop your statement file here
                  </p>
                  <p className="text-xs text-muted-foreground">
                    or click to browse. Max 20 MB.
                  </p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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
                  <SelectItem value="bank_statement">Bank Statement</SelectItem>
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

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Filename</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        Loading statements...
                      </TableCell>
                    </TableRow>
                  ) : statements.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No statements uploaded yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    statements.map((statement) => {
                      const Icon =
                        documentTypeIcons[statement.documentType] ?? FileText;
                      return (
                        <TableRow key={statement.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Icon className="size-4 text-muted-foreground" />
                              <span className="font-medium">
                                {documentTypeLabels[statement.documentType] ??
                                  statement.documentType}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-64 truncate">
                            {statement.originalFilename}
                          </TableCell>
                          <TableCell>
                            {formatFileSize(statement.fileSize)}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={statusVariants[statement.status] ?? "outline"}
                              className="capitalize"
                            >
                              {statement.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {formatDate(statement.uploadedAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                disabled={downloadMutation.isPending}
                                onClick={() => handleDownload(statement.id)}
                              >
                                <Download className="size-4" />
                              </Button>

                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="icon">
                                    <Trash2 className="size-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Are you absolutely sure?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete the uploaded
                                      statement file. This action cannot be
                                      undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <Button
                                      variant="destructive"
                                      disabled={deleteMutation.isPending}
                                      onClick={() =>
                                        deleteMutation.mutate({
                                          uploadId: statement.id,
                                        })
                                      }
                                    >
                                      Delete
                                    </Button>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

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
    </div>
  );
}
