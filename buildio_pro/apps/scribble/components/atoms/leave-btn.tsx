import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import React from "react";

export default function LeaveBtn() {
  return (
    <Link href={"/rooms"}>
      <Button variant={"destructive"} className="cursor-pointer">
        Leave Room
      </Button>
    </Link>
  );
}
