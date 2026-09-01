"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import {
  ChevronRight,
  FolderOpen,
  FolderPlus,
  Pencil,
  Trash2,
} from "lucide-react";

import { ActionButton } from "@/components/documents/action-button";
import { PaginatedFileList } from "@/components/documents/documents-tree-files";
import {
  FolderRow,
  RowActions,
} from "@/components/documents/documents-tree-folder";
import type {
  RowSharedProps,
  TopicNode,
} from "@/components/documents/documents-tree-types";
import { cn } from "@/lib/utils";

export function TopicRow({
  node,
  ...props
}: RowSharedProps & { node: TopicNode }) {
  const id = node.topic ? node.topic.id : "uncategorized";
  const isOpen = props.expanded.has(id);
  const isEmpty = node.folders.length === 0 && node.documents.length === 0;

  return (
    <li>
      <Collapsible open={isOpen} onOpenChange={() => props.onToggleTopic(id)}>
        <div className="group/row flex w-full items-center rounded-md hover:bg-muted">
          <CollapsibleTrigger className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-sm">
            <ChevronRight
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform",
                isOpen && "rotate-90",
              )}
            />
            <FolderOpen className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate font-medium">
              {node.topic ? node.topic.name : "Uncategorized"}
            </span>
            {isEmpty && (
              <Badge variant="secondary" className="ml-auto text-xs">
                Empty
              </Badge>
            )}
          </CollapsibleTrigger>
          {node.topic && (
            <RowActions>
              <ActionButton
                label="New folder"
                icon={FolderPlus}
                onClick={() => props.onNewFolderInTopic(node.topic!)}
              />
              <ActionButton
                label="Rename topic"
                icon={Pencil}
                onClick={() => props.onRenameTopic(node.topic!)}
              />
              <ActionButton
                label="Delete topic"
                icon={Trash2}
                variant="destructive"
                onClick={() => props.onDeleteTopic(node.topic!)}
              />
            </RowActions>
          )}
        </div>
        <CollapsibleContent>
          {isEmpty ? (
            <div className="mx-2 mt-1 flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-4 text-center">
              <p className="text-xs text-muted-foreground">
                No folders yet. Create a folder to start organizing documents in
                this topic.
              </p>
              {node.topic && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => props.onNewFolderInTopic(node.topic!)}
                >
                  <FolderPlus className="size-4" />
                  New Folder
                </Button>
              )}
            </div>
          ) : (
            <ul>
              {node.folders.map((child) => (
                <FolderRow
                  key={child.folder.id}
                  node={child}
                  depth={1}
                  {...props}
                />
              ))}
              <PaginatedFileList
                docs={node.documents}
                depth={1}
                hasNextPage={props.hasNextPage}
                isFetchingNextPage={props.isFetchingNextPage}
                fetchNextPage={props.fetchNextPage}
              />
            </ul>
          )}
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}
