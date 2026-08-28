import type { Folder } from "./types";

/** A folder with its nested children */
export type FolderNode = Folder & {
  children: FolderNode[];
};

/**
 * Build a nested tree from a flat list of folders (children grouped under
 * their parent). `rootId` picks a subtree; null builds the full tree.
 */
export function buildFolderTree(
  folders: Folder[],
  rootId: string | null = null,
): FolderNode[] {
  const byParent = new Map<string | null, FolderNode[]>();
  for (const folder of folders) {
    const parentKey = folder.parentFolderId;
    const siblings = byParent.get(parentKey) ?? [];
    siblings.push({ ...folder, children: [] });
    byParent.set(parentKey, siblings);
  }

  const attach = (parentId: string | null): FolderNode[] =>
    (byParent.get(parentId) ?? [])
      .sort((a, b) => a.position - b.position)
      .map((node) => ({ ...node, children: attach(node.id) }));

  if (rootId) {
    const root = folders.find((folder) => folder.id === rootId);
    if (!root) return [];
    const node: FolderNode = { ...root, children: attach(rootId) };
    return [node];
  }

  return attach(null);
}