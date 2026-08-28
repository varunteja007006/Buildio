import { AppBreadcrumb } from "@/components/app-breadcrumb"
import { BotIcon, SparklesIcon } from "lucide-react"

export default function AgentBuilderPage() {
  return (
    <>
      <AppBreadcrumb
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Agent", href: "/dashboard/agent/builder" },
          { label: "Builder" },
        ]}
      />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <BotIcon className="size-12" />
          <SparklesIcon className="size-12" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Agent Builder</h2>
          <p className="text-sm text-muted-foreground">
            Build and configure your AI agents here.
          </p>
        </div>
      </div>
    </>
  )
}