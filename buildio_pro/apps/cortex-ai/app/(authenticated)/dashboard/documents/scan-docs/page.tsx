import { AppBreadcrumb } from "@/components/app-breadcrumb"
import { FileTextIcon } from "lucide-react"

export default function ScanDocsPage() {
  return (
    <>
      <AppBreadcrumb
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Scan Docs" },
        ]}
      />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
        <FileTextIcon className="size-12 text-muted-foreground" />
        <div>
          <h2 className="text-lg font-semibold">Scan Docs</h2>
          <p className="text-sm text-muted-foreground">
            Scan documents here.
          </p>
        </div>
      </div>
    </>
  )
}