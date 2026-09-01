import type { Document } from "@/api/documents/types";
import type { Folder } from "@/api/folders/types";
import type { Topic } from "@/api/topics/types";

export type FolderNode = {
  folder: Folder;
  children: FolderNode[];
  documents: Document[];
};

export type TopicNode = {
  topic: Topic | null;
  folders: FolderNode[];
  documents: Document[];
};

export interface RowSharedProps {
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

export function buildFolderNodes(folders: Folder[]): FolderNode[] {
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
