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
  FilePlus,
  FileText,
  Folder as FolderIcon,
  FolderOpen,
  FolderPlus,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useInfiniteDocuments } from "@/api/documents/query";
import type { Document } from "@/api/documents/types";
import type { Folder } from "@/api/folders/types";
import type { Topic } from "@/api/topics/types";
import { ActionButton } from "@/components/documents/action-button";
import { cn } from "@/lib/utils";

type FolderNode = {
  folder: Folder;
  children: FolderNode[];
  documents: Document[];
};

type TopicNode = {
  topic: Topic | null;
  folders: FolderNode[];
  documents: Document[];
};

function buildFolderNodes(folders: Folder[]): FolderNode[] {
  const nodes = new Map<string, FolderNode>();
  const roots: FolderNode[] = [];

  for (const folder of folders) {
    nodes.set(folder.id, { folder, children: [], documents: [] });
  }

  for (const folder of folders) {
    const node = nodes.get(folder.id)!;
    if (folder.parentFolderId && nodes.has(folder.parentFolderId)) {
      nodes.get(folder.parentFolderId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots.sort((a, b) => a.folder.position - b.folder.position);
}

interface DocumentsTreeProps {
  topics: Topic[];
  folders: Folder[];
  documents: Document[];
  /** Global infinite pagination for the tree (100s of files) */
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string) => void;
  onRenameTopic: (topic: Topic) => void;
  onDeleteTopic: (topic: Topic) => void;
  onRenameFolder: (folder: Folder) => void;
  onDeleteFolder: (folder: Folder) => void;
  onNewFileInFolder: (folder: Folder) => void;
  onNewFolderInFolder: (parent: Folder) => void;
  onNewFolderInTopic: (topic: Topic) => void;
}

export function DocumentsTree({
  topics,
  folders,
  documents,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  selectedFolderId,
  onSelectFolder,
  onRenameTopic,
  onDeleteTopic,
  onRenameFolder,
  onDeleteFolder,
  onNewFileInFolder,
  onNewFolderInFolder,
  onNewFolderInTopic,
}: DocumentsTreeProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

  const folderNodes = buildFolderNodes(folders);

  // Auto-expand selected folder and its ancestors + topic
  useEffect(() => {
    if (!selectedFolderId) return;
    const target = folders.find((f) => f.id === selectedFolderId);
    if (!target) return;
    const ancestors = new Set<string>();
    let curr: Folder | undefined = target;
    while (curr) {
      ancestors.add(curr.id);
      curr = folders.find((f) => f.id === curr!.parentFolderId);
    }
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      let changed = false;
      for (const id of ancestors)
        if (!next.has(id)) {
          next.add(id);
          changed = true;
        }
      return changed ? next : prev;
    });
    if (target.topicId) {
      setExpandedTopics((prev) => {
        if (prev.has(target.topicId!)) return prev;
        const next = new Set(prev);
        next.add(target.topicId!);
        return next;
      });
    }
  }, [selectedFolderId, folders]);

  // Group documents by destination (for topic-level direct files & uncategorized)
  // Folder-level files will be fetched per-folder via useInfiniteDocuments({ folderId })
  // to ensure uploadthing files appear inside correct folder even with 100s of files
  const docsByFolder = new Map<string, Document[]>();
  const docsByTopic = new Map<string, Document[]>();
  const uncategorized: Document[] = [];

  for (const doc of documents) {
    if (doc.folderId) {
      const list = docsByFolder.get(doc.folderId) ?? [];
      list.push(doc);
      docsByFolder.set(doc.folderId, list);
    } else if (doc.topicId) {
      const list = docsByTopic.get(doc.topicId) ?? [];
      list.push(doc);
      docsByTopic.set(doc.topicId, list);
    } else {
      uncategorized.push(doc);
    }
  }

  // Folders whose topic is not loaded still appear under Uncategorized
  const topicNodes: TopicNode[] = topics.map((topic) => ({
    topic,
    folders: folderNodes.filter((n) => n.folder.topicId === topic.id),
    documents: docsByTopic.get(topic.id) ?? [],
  }));

  const orphanFolders = folderNodes.filter(
    (n) => !topics.some((t) => t.id === n.folder.topicId),
  );

  const showUncategorized =
    uncategorized.length > 0 || orphanFolders.length > 0;

  const toggleSet = (set: Set<string>, key: string) =>
    set.has(key)
      ? new Set([...set].filter((k) => k !== key))
      : new Set(set).add(key);

  return (
    <div className="w-full rounded-lg border">
      <ul className="p-2">
        {topicNodes.map((node) => (
          <TopicRow
            key={node.topic!.id}
            node={node}
            expanded={expandedTopics}
            expandedFolders={expandedFolders}
            selectedFolderId={selectedFolderId}
            onSelectFolder={onSelectFolder}
            onRenameTopic={onRenameTopic}
            onDeleteTopic={onDeleteTopic}
            onRenameFolder={onRenameFolder}
            onDeleteFolder={onDeleteFolder}
            onNewFileInFolder={onNewFileInFolder}
            onNewFolderInFolder={onNewFolderInFolder}
            onNewFolderInTopic={onNewFolderInTopic}
            onToggleTopic={(id) =>
              setExpandedTopics(toggleSet(expandedTopics, id))
            }
            onToggleFolder={(id) =>
              setExpandedFolders(toggleSet(expandedFolders, id))
            }
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
          />
        ))}
        {showUncategorized && (
          <TopicRow
            key="uncategorized"
            node={{
              topic: null,
              folders: orphanFolders,
              documents: uncategorized,
            }}
            expanded={expandedTopics}
            expandedFolders={expandedFolders}
            selectedFolderId={selectedFolderId}
            onSelectFolder={onSelectFolder}
            onRenameTopic={onRenameTopic}
            onDeleteTopic={onDeleteTopic}
            onRenameFolder={onRenameFolder}
            onDeleteFolder={onDeleteFolder}
            onNewFileInFolder={onNewFileInFolder}
            onNewFolderInFolder={onNewFolderInFolder}
            onNewFolderInTopic={onNewFolderInTopic}
            onToggleTopic={(id) =>
              setExpandedTopics(toggleSet(expandedTopics, id))
            }
            onToggleFolder={(id) =>
              setExpandedFolders(toggleSet(expandedFolders, id))
            }
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
          />
        )}
      </ul>
      {hasNextPage && (
        <div className="flex justify-center border-t px-2 py-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => fetchNextPage?.()}
            disabled={!!isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="mr-1 size-3 animate-spin" />
                Loading…
              </>
            ) : (
              "Load more documents"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

interface RowSharedProps {
  expanded: Set<string>;
  expandedFolders: Set<string>;
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string) => void;
  onRenameTopic: (topic: Topic) => void;
  onDeleteTopic: (topic: Topic) => void;
  onRenameFolder: (folder: Folder) => void;
  onDeleteFolder: (folder: Folder) => void;
  onNewFileInFolder: (folder: Folder) => void;
  onNewFolderInFolder: (parent: Folder) => void;
  onNewFolderInTopic: (topic: Topic) => void;
  onToggleTopic: (id: string) => void;
  onToggleFolder: (id: string) => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
}

function RowActions({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex shrink-0 items-center gap-0.5 pr-1.5 opacity-0 transition-opacity group-hover/row:opacity-100 focus-within:opacity-100">
      {children}
    </div>
  );
}

function TopicRow({ node, ...props }: RowSharedProps & { node: TopicNode }) {
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

function FolderRow({
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

const FOLDER_PAGE_SIZE = 25;

function PaginatedFileList({
  docs,
  depth,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  docs: Document[];
  depth: number;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
}) {
  const [visible, setVisible] = useState(FOLDER_PAGE_SIZE);
  const sentinelRef = useRef<HTMLLIElement | null>(null);

  // Reset visible when docs length shrinks (e.g. filter) — keep at least one page
  useEffect(() => {
    if (docs.length < visible)
      setVisible(Math.max(FOLDER_PAGE_SIZE, docs.length));
  }, [docs.length, visible]);

  const visibleDocs = docs.slice(0, visible);
  const canShowMoreLocal = visible < docs.length;
  const canFetchMoreGlobal =
    !canShowMoreLocal && !!hasNextPage && docs.length > 0;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    // If we can show more locally, observe to auto-expand; if need global fetch, also observe
    if (!canShowMoreLocal && !canFetchMoreGlobal) return;
    if (isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        if (canShowMoreLocal) {
          setVisible((v) => Math.min(v + FOLDER_PAGE_SIZE, docs.length));
        } else if (canFetchMoreGlobal) {
          fetchNextPage?.();
        }
      },
      { rootMargin: "200px", threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [
    canShowMoreLocal,
    canFetchMoreGlobal,
    isFetchingNextPage,
    docs.length,
    fetchNextPage,
  ]);

  if (docs.length === 0) return null;

  return (
    <>
      {visibleDocs.map((doc) => (
        <FileRow key={doc.id} doc={doc} depth={depth} />
      ))}
      {(canShowMoreLocal || canFetchMoreGlobal) && (
        <li
          ref={sentinelRef}
          className="flex items-center justify-center py-1"
          style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
        >
          {isFetchingNextPage ? (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" />
              Loading…
            </span>
          ) : canShowMoreLocal ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() =>
                setVisible((v) => Math.min(v + FOLDER_PAGE_SIZE, docs.length))
              }
            >
              Show more
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => fetchNextPage?.()}
            >
              Load more from server
            </Button>
          )}
        </li>
      )}
    </>
  );
}

function FileRow({ doc, depth }: { doc: Document; depth: number }) {
  return (
    <li>
      <div
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
        style={{ paddingLeft: `${depth * 1.25 + 0.5}rem` }}
      >
        <span className="w-4" />
        <FileText className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate">{doc.filename}</span>
        <span className="ml-auto shrink-0">
          <Badge
            variant={doc.ingested ? "default" : "secondary"}
            className="text-xs"
          >
            {doc.ingested ? "Ingested" : "Pending"}
          </Badge>
        </span>
      </div>
    </li>
  );
}
