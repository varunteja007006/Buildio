import { AppBreadcrumb } from "@/components/app-breadcrumb"
import { SparklesIcon } from "lucide-react"

export default function UpgradePage() {
  return (
    <>
      <AppBreadcrumb
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Upgrade to Pro" },
        ]}
      />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
        <SparklesIcon className="size-12 text-muted-foreground" />
        <div>
          <h2 className="text-lg font-semibold">Upgrade to Pro</h2>
          <p className="text-sm text-muted-foreground">
            Upgrade your plan to unlock premium features.
          </p>
        </div>
      </div>
    </>
  )
}
