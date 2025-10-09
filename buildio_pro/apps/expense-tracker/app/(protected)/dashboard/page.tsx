"use client";

import useTRPCHealthCheck from "@/hooks/useTRPCHealthCheck";

export default function Page() {
  const { health, protectedHealth } = useTRPCHealthCheck();

  return (
    <div className="space-y-4">
      <div>Dashboard</div>
      <pre className="p-2 bg-black text-purple-200">{JSON.stringify(health, null, 2)}</pre>
      <pre className="p-2 bg-black text-purple-200">{JSON.stringify(protectedHealth, null, 2)}</pre>
    </div>
  );
}
