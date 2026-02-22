import React from "react";

import Link from "next/link";

import { Button } from "@workspace/ui/components/button";

export default function LeaveBtn() {
  return (
    <Link href={"/rooms"}>
      <Button variant={"destructive"} className="cursor-pointer">
        Leave Room
      </Button>
    </Link>
  );
}
