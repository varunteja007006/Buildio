import { AppBreadcrumb } from "@/components/app-breadcrumb"
import { BotIcon, PlugIcon } from "lucide-react"

export default function AgentConnectorsPage() {
  return (
    <>
      <AppBreadcrumb
        segments={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Agent", href: "/dashboard/agent/builder" },
          { label: "Connectors" },
        ]}
      />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-8 text-center">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <BotIcon className="size-12" />
          <PlugIcon className="size-12" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Agent Connectors</h2>
          <p className="text-sm text-muted-foreground">
            Connect databases and create tools for your agents.
          </p>
        </div>
      </div>
    </>
  )
}