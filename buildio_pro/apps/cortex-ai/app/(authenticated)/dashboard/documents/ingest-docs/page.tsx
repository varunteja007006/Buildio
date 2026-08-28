import { AppBreadcrumb } from "@/components/app-breadcrumb"
import { FileTextIcon } from "lucide-react"

export default function IngestDocsPage() {
  return (
    <>
      <AppBreadcrumb
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Ingest Docs" },
        ]}
      />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
        <FileTextIcon className="size-12 text-muted-foreground" />
        <div>
          <h2 className="text-lg font-semibold">Ingest Docs</h2>
          <p className="text-sm text-muted-foreground">
            Ingest documents here.
          </p>
        </div>
      </div>
    </>
  )
}