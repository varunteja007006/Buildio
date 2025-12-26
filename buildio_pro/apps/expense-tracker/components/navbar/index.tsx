import React from "react";

import { ModeToggle } from "@/components/mode-toggle";
import { LoginBtn } from "../organisms/auth/login-btn";
import { appConfig } from "@/app/appConfig";

export function Navbar() {
  return (
    <nav className="px-8 py-4 flex items-center justify-between w-full bg-sidebar">
      <h1 className="text-black font-bold">{appConfig.name}</h1>
      <div className="flex flex-row items-center gap-4 justify-between">
        <LoginBtn />
        <ModeToggle />
      </div>
    </nav>
  );
}
