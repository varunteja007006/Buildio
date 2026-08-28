import { AppBreadcrumb } from "@/components/app-breadcrumb"
import { BellIcon } from "lucide-react"

export default function NotificationsPage() {
  return (
    <>
      <AppBreadcrumb
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Notifications" },
        ]}
      />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
        <BellIcon className="size-12 text-muted-foreground" />
        <div>
          <h2 className="text-lg font-semibold">Notifications</h2>
          <p className="text-sm text-muted-foreground">
            Your notifications will appear here.
          </p>
        </div>
      </div>
    </>
  )
}
