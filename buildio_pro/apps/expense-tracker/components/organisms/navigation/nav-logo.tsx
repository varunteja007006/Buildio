import { Wallet2 } from "lucide-react";
import Link from "next/link";

export default function NavLogo({ href }: Readonly<{ href?: string }>) {
  return (
    <Link
      className="flex flex-row items-center justify-start gap-2"
      href={href ?? "/"}
    >
      <Wallet2 className="size-8" />
      <h1 className="font-bold text-base">Expense Tracker</h1>
    </Link>
  );
}
