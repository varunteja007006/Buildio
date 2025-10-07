"use client";

import React from "react";

import { breadCrumbsStore } from "@/lib/store/navigation-breadcrumbs.store";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { Separator } from "@workspace/ui/components/separator";

export default function HeaderBreadcrumbs() {
  const breadCrumbs = breadCrumbsStore.useGetBreadCrumbs();

  if (!breadCrumbs) {
    return null;
  }

  return (
    <>
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
      />
      <Breadcrumb>
        <BreadcrumbList>
          {breadCrumbs.map((breadCrumb) => {
            if (breadCrumb.isPage) {
              return (
                <React.Fragment key={breadCrumb.label}>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                  </BreadcrumbItem>
                </React.Fragment>
              );
            }
            return (
              <BreadcrumbItem
                className="hidden md:block"
                key={breadCrumb.label}
              >
                <BreadcrumbLink href="#">
                  Building Your Application
                </BreadcrumbLink>
              </BreadcrumbItem>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}
