import { AppBreadcrumb } from "@/components/app-breadcrumb"
import { BadgeCheckIcon } from "lucide-react"

export default function AccountPage() {
  return (
    <>
      <AppBreadcrumb
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Account" },
        ]}
      />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
        <BadgeCheckIcon className="size-12 text-muted-foreground" />
        <div>
          <h2 className="text-lg font-semibold">Account</h2>
          <p className="text-sm text-muted-foreground">
            Manage your account settings here.
          </p>
        </div>
      </div>
    </>
  )
}
