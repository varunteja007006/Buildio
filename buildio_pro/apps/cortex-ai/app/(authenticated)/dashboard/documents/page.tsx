import { AppBreadcrumb } from "@/components/app-breadcrumb"
import { DocumentsView } from "@/components/documents/documents-view"

export default function DocumentsPage() {
  return (
    <>
      <AppBreadcrumb
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Documents" },
        ]}
      />
      <div className="flex w-full flex-1 flex-col">
        <DocumentsView />
      </div>
    </>
  )
}