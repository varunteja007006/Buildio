"use client";

import { Button } from "@workspace/ui/components/button";
import { useState } from "react";

import { AppBreadcrumb } from "@/components/app-breadcrumb";
import { ExtractedDocumentsSection } from "@/components/extraction-templates/extracted-documents-section";
import { ExtractionTemplatesSection } from "@/components/extraction-templates/templates-section";

type View = "templates" | "extracted";

export function ExtractionTemplatesPage() {
  const [view, setView] = useState<View>("templates");

  return (
    <>
      <AppBreadcrumb
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Documents", href: "/dashboard/documents" },
          { label: "Extraction" },
        ]}
      />
      <div className="flex w-full flex-1 flex-col gap-3">
        <div>
          <h1 className="text-xl font-semibold">Extraction</h1>
          <p className="text-sm text-muted-foreground">
            Templates and the documents extracted with them.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === "templates" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("templates")}
          >
            Templates
          </Button>
          <Button
            variant={view === "extracted" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setView("extracted")}
          >
            Extracted docs
          </Button>
        </div>
        {view === "templates" ? (
          <ExtractionTemplatesSection />
        ) : (
          <ExtractedDocumentsSection />
        )}
      </div>
    </>
  );
}