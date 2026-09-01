"use client";

import * as React from "react";

const IS_DEV = process.env.NODE_ENV === "development";

function logRender(
  id: string,
  phase: "mount" | "update" | "nested-update",
  actualDuration: number,
  baseDuration: number,
  startTime: number,
  commitTime: number,
) {
  if (!IS_DEV) return;

  const color =
    phase === "mount" ? "#4ade80" : actualDuration > 16 ? "#f87171" : "#facc15";

   
  console.info(
    `%c[Profiler] %c${id}`,
    "color:#818cf8;font-weight:bold",
    `color:${color};font-weight:bold`,
    {
      phase,
      actualDuration: `${actualDuration.toFixed(2)}ms`,
      baseDuration: `${baseDuration.toFixed(2)}ms`,
      startTime: `${startTime.toFixed(2)}ms`,
      commitTime: `${commitTime.toFixed(2)}ms`,
    },
  );
}

export function RenderProfiler({
  id,
  children,
}: Readonly<{ id: string; children: React.ReactNode }>) {
  if (!IS_DEV) return <>{children}</>;

  return (
    <React.Profiler id={id} onRender={logRender}>
      {children}
    </React.Profiler>
  );
}
