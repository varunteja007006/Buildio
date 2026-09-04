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
import { FileText, Loader2, Upload } from "lucide-react";
import * as React from "react";

import { useStatementUpload, type StatementDocumentType } from "@/hooks";

import { documentTypeLabels, formatFileSize } from "./constants";

export function StatementUploadCard() {
  const [documentType, setDocumentType] =
    React.useState<StatementDocumentType>("credit_card");
  const [file, setFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const uploadMutation = useStatementUpload();

  const handleFileChange = (selected: File | null) => {
    if (!selected) return;
    setFile(selected);
    uploadMutation.mutate({ file: selected, documentType });
  };

  return (
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
  );
}
