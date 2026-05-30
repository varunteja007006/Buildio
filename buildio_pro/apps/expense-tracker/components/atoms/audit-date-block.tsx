import React from "react";

import { Calendar } from "lucide-react";

import { localDateFormat } from "@/lib/utils/date.utils";

export function AuditDateBlock({
  createdAt,
  updatedAt,
  deletedAt,
}: {
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}) {
  const formattedCreatedDate = localDateFormat(createdAt);
  const formattedUpdatedDate = localDateFormat(updatedAt);
  const formattedDeletedDate = deletedAt ? localDateFormat(deletedAt) : "N/A";

  return (
    <div>
      <div className="grid md:grid-cols-3 justify-items-center gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="size-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Created</p>
            <p className="text-xs">{formattedCreatedDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="size-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Last Updated</p>
            <p className="text-xs">{formattedUpdatedDate}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="size-5 text-muted-foreground" />
          <div>
            <p className="text-xs text-muted-foreground">Deleted</p>
            <p className="text-xs">{formattedDeletedDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
