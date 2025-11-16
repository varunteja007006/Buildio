import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { cn } from "@workspace/ui/lib/utils";
import React from "react";

export type BreadCrumbsItem = {
  href: string;
  label: string;
  isPage: boolean;
};

export const DynamicBreadCrumbs = ({
  breadCrumbs,
}: {
  breadCrumbs?: BreadCrumbsItem[];
}) => {
  if (!breadCrumbs || (breadCrumbs && breadCrumbs.length === 0)) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadCrumbs.map((breadCrumb, index) => {
          const isLast = index === breadCrumbs.length - 1;
          const key = `${index} ${breadCrumb.label}`;

          if (breadCrumb.isPage) {
            return (
              <React.Fragment key={key}>
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </React.Fragment>
            );
          }
          return (
            <React.Fragment key={key}>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                  Building Your Application
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator
                className={cn(isLast ? "hidden md:hidden" : "hidden md:block")}
              />
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
