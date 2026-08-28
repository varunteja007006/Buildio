"use client";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { useScanDocuments } from "@/api/documents/query";

export function ScanDocsButton() {
  const scanMutation = useScanDocuments();

  function handleScan() {
    scanMutation.mutate();
  }

  const response = scanMutation.data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Scanner</CardTitle>
        <CardDescription>
          Scan the <code>docs/</code> folder for new files and track them in the
          database.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Button
          onClick={handleScan}
          disabled={scanMutation.isPending}
          className="w-fit"
        >
          {scanMutation.isPending ? "Scanning..." : "Scan Docs"}
        </Button>

        {response && (
          <div className="rounded-lg border p-4 text-sm">
            {response.success ? (
              <>
                <p className="mb-2 font-medium">
                  Scanned {response.scanned} file(s)
                </p>
                {response.results.length === 0 ? (
                  <p className="text-muted-foreground">
                    No files found in docs/ folder.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {response.results.map((r: import("@/api/documents/types").ScanResult) => (
                      <li
                        key={r.fileHash}
                        className="flex items-center justify-between gap-4 rounded-md bg-muted/50 px-3 py-2"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{r.filename}</span>
                          <span className="text-xs text-muted-foreground">
                            Hash: {r.fileHash.slice(0, 16)}...
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              r.status === "new"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            }`}
                          >
                            {r.status === "new" ? "NEW" : "EXISTS"}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                              r.ingested
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            }`}
                          >
                            {r.ingested ? "INGESTED" : "PENDING"}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <p className="text-destructive">Error: {response.error}</p>
            )}
          </div>
        )}

        {scanMutation.isError && !response && (
          <p className="text-destructive text-sm">
            Error: {scanMutation.error?.message ?? "Request failed"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
