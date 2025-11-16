import React from "react";

import { ModeToggle } from "@/components/mode-toggle";
import { LoginBtn } from "./auth/login-btn";

export function Navbar() {
  return (
    <nav className="px-8 py-4 flex items-center justify-between w-full">
      <h1 className="text-primary font-bold">Expense Tracker</h1>
      <div className="flex flex-row items-center gap-4 justify-between">
        <LoginBtn />
        <ModeToggle />
      </div>
    </nav>
  );
}
