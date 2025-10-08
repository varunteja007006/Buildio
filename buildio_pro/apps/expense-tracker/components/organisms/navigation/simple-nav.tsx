import NavLogo from "./nav-logo";
import { ModeToggle } from "../mode-toggle";

export default function Navbar() {
  return (
    <nav>
      <div className="flex flex-row items-center justify-between gap-4 px-2 py-2">
        <div>
          <NavLogo />
        </div>
        <div className="flex flex-row gap-4 items-center justify-end">
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
