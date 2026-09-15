"use client";

import { formatDistanceToNow } from "date-fns";
import * as React from "react";

type RelativeTimeProps = Omit<React.ComponentProps<"time">, "children"> & {
  /** The date to render relative to now. */
  date: Date | string | number;
  /** Optional text rendered before the relative phrase. */
  prefix?: string;
  /** Optional text rendered after the relative phrase. */
  suffix?: string;
};

/** Renders a date as a self-updating relative phrase, e.g. "2 minutes ago". */
function RelativeTime({
  date,
  prefix,
  suffix,
  className,
  ...props
}: RelativeTimeProps) {
  const target = React.useMemo(() => new Date(date), [date]);
  const [, tick] = React.useReducer((n: number) => n + 1, 0);

  React.useEffect(() => {
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);

  if (Number.isNaN(target.getTime())) return null;

  return (
    <time
      dateTime={target.toISOString()}
      title={target.toLocaleString()}
      suppressHydrationWarning
      className={className}
      {...props}
    >
      {prefix ? `${prefix} ` : null}
      {formatDistanceToNow(target, { addSuffix: true })}
      {suffix ? ` ${suffix}` : null}
    </time>
  );
}

export { RelativeTime };
