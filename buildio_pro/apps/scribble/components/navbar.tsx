import { Pencil } from "lucide-react";

import { ModeToggle } from "@/components/mode-toggle";
import { LogoutBtn } from "@/components/logout-btn";
import { UserCard } from "@/components/user-card";

import Link from "next/link";

export function Navbar() {
  return (
    <nav className="flex w-full items-center justify-between p-4">
      <Link href={"/"}>
        <div className="flex items-center gap-2">
          <Pencil className="text-primary size-8" />
          <h1 className="text-primary text-xl font-bold">Scribble</h1>
        </div>
      </Link>
      <div className="flex items-center gap-2">
        <UserCard />
        <ModeToggle />
        <LogoutBtn />
      </div>
    </nav>
  );
}
