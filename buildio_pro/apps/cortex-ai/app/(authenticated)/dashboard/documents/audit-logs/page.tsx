import { AppBreadcrumb } from "@/components/app-breadcrumb"
import { FileTextIcon, ClockIcon } from "lucide-react"

export default function AuditLogsPage() {
  return (
    <>
      <AppBreadcrumb
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Documents", href: "/dashboard/documents" },
          { label: "Audit Logs" },
        ]}
      />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <FileTextIcon className="size-12" />
          <ClockIcon className="size-12" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Audit Logs</h2>
          <p className="text-sm text-muted-foreground">
            View document audit logs here.
          </p>
        </div>
      </div>
    </>
  )
}