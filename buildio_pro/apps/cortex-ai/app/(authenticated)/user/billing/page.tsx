import { AppBreadcrumb } from "@/components/app-breadcrumb"
import { CreditCardIcon } from "lucide-react"

export default function BillingPage() {
  return (
    <>
      <AppBreadcrumb
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Billing" },
        ]}
      />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
        <CreditCardIcon className="size-12 text-muted-foreground" />
        <div>
          <h2 className="text-lg font-semibold">Billing</h2>
          <p className="text-sm text-muted-foreground">
            Manage your billing and subscription here.
          </p>
        </div>
      </div>
    </>
  )
}
