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
import { ComboboxSelect } from "@workspace/ui/components/combobox-select";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
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
  Banknote,
  Check,
  CreditCard,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Landmark,
  Loader2,
  Pencil,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import {
  useStatementDelete,
  useStatementDownload,
  useStatementList,
  useStatementModels,
  useStatementProcess,
  useStatementRename,
  useStatementUpload,
  type StatementDocumentType,
} from "@/hooks";

const documentTypeLabels: Record<StatementDocumentType, string> = {
  credit_card: "Credit Card",
  bank_statement: "Bank Statement",
  income_statement: "Income Statement",
  income_tax_statement: "Income Tax Statement",
};

const documentTypeIcons: Record<StatementDocumentType, React.ElementType> = {
  credit_card: CreditCard,
  bank_statement: Landmark,
  income_statement: Banknote,
  income_tax_statement: FileSpreadsheet,
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

function StatementFilenameCell({
  uploadId,
  filename,
}: {
  uploadId: string;
  filename: string;
}) {
  const [editing, setEditing] = React.useState(false);
  const [value, setValue] = React.useState(filename);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const renameMutation = useStatementRename();

  React.useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const startEditing = () => {
    setValue(filename);
    setEditing(true);
  };

  const cancel = () => {
    setValue(filename);
    setEditing(false);
  };

  const save = () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === filename) {
      setEditing(false);
      return;
    }
    renameMutation.mutate(
      { uploadId, filename: trimmed },
      { onSuccess: () => setEditing(false) },
    );
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") cancel();
          }}
          className="h-8 w-56"
        />
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          disabled={renameMutation.isPending}
          onClick={save}
          aria-label="Save new filename"
        >
          <Check className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={cancel}
          aria-label="Cancel rename"
        >
          <X className="size-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="group flex max-w-64 items-center gap-1">
      <span className="min-w-0 flex-1 truncate">{filename}</span>
      <Button
        variant="ghost"
        size="icon"
        className="size-6 shrink-0 opacity-0 group-hover:opacity-100"
        onClick={startEditing}
        aria-label="Rename statement"
      >
        <Pencil className="size-3.5" />
      </Button>
    </div>
  );
}

function ExtractStatementDialog({
  statement,
  open,
  onOpenChange,
}: {
  statement: {
    id: string;
    originalFilename: string;
    documentType: StatementDocumentType;
    extractionModel: string | null;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const {
    data: models,
    isLoading: modelsLoading,
    isError: modelsError,
  } = useStatementModels();
  const processMutation = useStatementProcess({
    onSuccess: () => onOpenChange(false),
  });

  const options = React.useMemo(
    () =>
      (models ?? []).map((model) => ({
        value: model.id,
        label: model.id,
        searchValue: `${model.id} ${model.name} ${model.description ?? ""}`,
      })),
    [models],
  );

  const [selectedModel, setSelectedModel] = React.useState("");
  const [selectedType, setSelectedType] =
    React.useState<StatementDocumentType>("bank_statement");

  React.useEffect(() => {
    if (!open || !statement) return;
    setSelectedModel(
      statement.extractionModel ??
        options.find((option) => option.value === "openai/gpt-5.6-luna")
          ?.value ??
        options[0]?.value ??
        "",
    );
    setSelectedType(statement.documentType);
  }, [open, statement, options]);

  const canStart =
    !modelsLoading && Boolean(selectedModel) && Boolean(statement);

  const contentRef = React.useRef<HTMLDivElement>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent ref={contentRef} className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Extract transactions</DialogTitle>
          <DialogDescription>
            Parse {statement?.originalFilename ?? "this statement"} into
            normalized transactions using the Vercel AI Gateway.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Document type</Label>
            <Select
              value={selectedType}
              onValueChange={(val) =>
                setSelectedType(val as StatementDocumentType)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Document type" />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.keys(documentTypeLabels) as StatementDocumentType[]
                ).map((type) => (
                  <SelectItem key={type} value={type}>
                    {documentTypeLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Changing the type re-extracts with that document type&apos;s
              prompt. Previously extracted transactions are kept.
            </p>
          </div>
          <div className="space-y-2">
            <Label>Model</Label>
            {modelsLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading available models...
              </div>
            ) : (
              <ComboboxSelect
                container={contentRef}
                options={options}
                value={selectedModel}
                onValueChange={setSelectedModel}
                placeholder="Search and select a model"
                searchPlaceholder="Search by name or provider..."
                emptyMessage="No models returned by the gateway"
              />
            )}
          </div>
          {!modelsLoading && modelsError && (
            <p className="text-xs text-destructive">
              Could not reach the gateway to list models. Verify that
              AI_GATEWAY_API_KEY is configured on the server.
            </p>
          )}
          {!modelsLoading && !modelsError && models && models.length === 0 && (
            <p className="text-xs text-destructive">
              No models were returned by the gateway. Verify that
              AI_GATEWAY_API_KEY is configured on the server.
            </p>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={processMutation.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            disabled={!canStart || processMutation.isPending}
            onClick={() =>
              statement &&
              processMutation.mutate({
                uploadId: statement.id,
                model: selectedModel,
                documentType: selectedType,
              })
            }
          >
            {processMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Sparkles className="size-4" />
            )}
            {processMutation.isPending ? "Extracting..." : "Start extraction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
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
  const [extractingStatement, setExtractingStatement] = React.useState<{
    id: string;
    originalFilename: string;
    documentType: StatementDocumentType;
    extractionModel: string | null;
  } | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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
  const uploadMutation = useStatementUpload();
  const deleteMutation = useStatementDelete();
  const downloadMutation = useStatementDownload();
  const router = useRouter();

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
                  <SelectItem value="income_statement">
                    Income Statement
                  </SelectItem>
                  <SelectItem value="income_tax_statement">
                    Income Tax Statement
                  </SelectItem>
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
          <CardDescription>History of your uploaded statements</CardDescription>
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
                          <TableCell>
                            <StatementFilenameCell
                              uploadId={statement.id}
                              filename={statement.originalFilename}
                            />
                          </TableCell>
                          <TableCell>
                            {formatFileSize(statement.fileSize)}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    statusVariants[statement.status] ??
                                    "outline"
                                  }
                                  className="capitalize"
                                >
                                  {statement.status}
                                </Badge>
                                {statement.status === "processing" && (
                                  <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
                                )}
                                {typeof statement.processedTransactionsCount ===
                                  "number" &&
                                  statement.processedTransactionsCount > 0 && (
                                    <span className="text-xs text-muted-foreground">
                                      {statement.processedTransactionsCount}{" "}
                                      {statement.processedTransactionsCount ===
                                      1
                                        ? "transaction"
                                        : "transactions"}
                                    </span>
                                  )}
                              </div>
                              {statement.status === "failed" &&
                                statement.processingError && (
                                  <span className="max-w-56 truncate text-xs text-destructive">
                                    {statement.processingError}
                                  </span>
                                )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(statement.uploadedAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              {typeof statement.processedTransactionsCount ===
                                "number" &&
                                statement.processedTransactionsCount > 0 && (
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    title="View extracted transactions"
                                    onClick={() =>
                                      router.push(
                                        `/transactions?statementUploadId=${statement.id}`,
                                      )
                                    }
                                  >
                                    <Eye className="size-4" />
                                  </Button>
                                )}

                              <Button
                                variant="outline"
                                size="icon"
                                title="Extract transactions with AI"
                                disabled={
                                  statement.status === "processing" ||
                                  statement.status === "pending"
                                }
                                onClick={() =>
                                  setExtractingStatement({
                                    id: statement.id,
                                    originalFilename:
                                      statement.originalFilename,
                                    documentType: statement.documentType,
                                    extractionModel: statement.extractionModel,
                                  })
                                }
                              >
                                <Sparkles className="size-4" />
                              </Button>

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
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
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
