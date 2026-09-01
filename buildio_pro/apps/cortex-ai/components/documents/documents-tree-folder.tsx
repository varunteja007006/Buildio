"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import {
  ChevronRight,
  FilePlus,
  Folder as FolderIcon,
  FolderPlus,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";

import { useInfiniteDocuments } from "@/api/documents/query";
import { ActionButton } from "@/components/documents/action-button";
import { PaginatedFileList } from "@/components/documents/documents-tree-files";
import type {
  FolderNode,
  RowSharedProps,
} from "@/components/documents/documents-tree-types";
import { cn } from "@/lib/utils";

export function RowActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5 pr-1.5 opacity-0 transition-opacity group-hover/row:opacity-100 focus-within:opacity-100">
      {children}
    </div>
  );
}

export function FolderRow({
  node,
  depth,
  ...props
}: RowSharedProps & { node: FolderNode; depth: number }) {
  const id = node.folder.id;
  const isOpen = props.expandedFolders.has(id);
  const isSelected = props.selectedFolderId === id;

  // Per-folder infinite fetch — ensures uploadthing files appear inside correct folder
  // even when global pagination hasn't loaded them and handles 100s of files per folder
  const {
    data: folderData,
    hasNextPage: folderHasNext,
    isFetchingNextPage: folderFetching,
    fetchNextPage: folderFetchNext,
    isLoading: folderLoading,
  } = useInfiniteDocuments({ folderId: node.folder.id, pageSize: 25 });

  const folderDocs =
    folderData?.pages.flatMap((p) => p.documents) ?? node.documents;

  return (
    <li>
      <Collapsible open={isOpen} onOpenChange={() => props.onToggleFolder(id)}>
        <div
          className={cn(
            "group/row flex w-full items-center rounded-md hover:bg-muted",
            isSelected && "bg-muted",
          )}
        >
          <CollapsibleTrigger
            onClick={() => props.onSelectFolder(id)}
            className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left text-sm"
            style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
          >
            <ChevronRight
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform",
                isOpen && "rotate-90",
              )}
            />
            <FolderIcon
              className={cn(
                "size-4 shrink-0 text-muted-foreground",
                isSelected && "text-primary",
              )}
            />
            <span className="truncate">{node.folder.name}</span>
          </CollapsibleTrigger>
          <RowActions>
            <ActionButton
              label="New file"
              icon={FilePlus}
              onClick={() => props.onNewFileInFolder(node.folder)}
            />
            <ActionButton
              label="New folder"
              icon={FolderPlus}
              onClick={() => props.onNewFolderInFolder(node.folder)}
            />
            <ActionButton
              label="Rename folder"
              icon={Pencil}
              onClick={() => props.onRenameFolder(node.folder)}
            />
            <ActionButton
              label="Delete folder"
              icon={Trash2}
              variant="destructive"
              onClick={() => props.onDeleteFolder(node.folder)}
            />
          </RowActions>
        </div>
        <CollapsibleContent>
          <ul>
            {node.children.map((child) => (
              <FolderRow
                key={child.folder.id}
                node={child}
                depth={depth + 1}
                {...props}
              />
            ))}
            {isOpen && (
              <>
                {folderLoading ? (
                  <li
                    className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground"
                    style={{ paddingLeft: `${(depth + 1) * 1.25 + 0.5}rem` }}
                  >
                    <Loader2 className="size-3 animate-spin" />
                    Loading files…
                  </li>
                ) : (
                  <PaginatedFileList
                    docs={folderDocs}
                    depth={depth + 1}
                    hasNextPage={folderHasNext}
                    isFetchingNextPage={folderFetching}
                    fetchNextPage={folderFetchNext}
                  />
                )}
              </>
            )}
          </ul>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}
