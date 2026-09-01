"use client";

import { Button } from "@workspace/ui/components/button";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import type { Document } from "@/api/documents/types";
import type { Folder } from "@/api/folders/types";
import type { Topic } from "@/api/topics/types";
import { TopicRow } from "@/components/documents/documents-tree-row";
import {
  buildFolderNodes,
  type TopicNode,
} from "@/components/documents/documents-tree-types";

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

  const rowProps = {
    expanded: expandedTopics,
    expandedFolders,
    selectedFolderId,
    onSelectFolder,
    onRenameTopic,
    onDeleteTopic,
    onRenameFolder,
    onDeleteFolder,
    onNewFileInFolder,
    onNewFolderInFolder,
    onNewFolderInTopic,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  };

  return (
    <div className="w-full rounded-lg border">
      <ul className="p-2">
        {topicNodes.map((node) => (
          <TopicRow
            key={node.topic!.id}
            node={node}
            {...rowProps}
            onToggleTopic={(id) =>
              setExpandedTopics(toggleSet(expandedTopics, id))
            }
            onToggleFolder={(id) =>
              setExpandedFolders(toggleSet(expandedFolders, id))
            }
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
            {...rowProps}
            onToggleTopic={(id) =>
              setExpandedTopics(toggleSet(expandedTopics, id))
            }
            onToggleFolder={(id) =>
              setExpandedFolders(toggleSet(expandedFolders, id))
            }
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
