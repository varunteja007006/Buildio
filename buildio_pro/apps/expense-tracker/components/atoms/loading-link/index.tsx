import React from "react";

import Link, { useLinkStatus } from "next/link";
import { Spinner } from "../loader";
import { cn } from "@workspace/ui/lib/utils";

export const LoadingLink = ({
  children,
  href,
  className,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) => {
  return (
    <Link className={cn("", className)} href={href}>
      {children}
      <LinkLoader />
    </Link>
  );
};

export const LinkLoader = () => {
  const { pending } = useLinkStatus();

  if (!pending) {
    return <div className="w-4 h-4"></div>;
  }

  return <Spinner />;
};
