import { appConfig } from "@/app/appConfig";
import { Copyright } from "lucide-react";
import React from "react";

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0 bg-card">
      <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <p className="text-center flex items-center flex-row flex-wrap gap-1 text-sm leading-loose text-muted-foreground md:text-left">
          <Copyright className="h-4 w-4" /> {new Date().getFullYear()}{" "}
          {appConfig.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
