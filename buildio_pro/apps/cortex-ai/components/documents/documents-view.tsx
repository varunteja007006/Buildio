"use client"

import { useState } from "react"
import {
  FileText as FileTextIcon,
  ListTree,
  Loader2,
  Table2,
  Upload,
} from "lucide-react"

import { useInfiniteDocuments } from "@/api/documents/query"
import { useDeleteTopic, useRenameTopic, useTopics } from "@/api/topics/query"
import {
  useAllFolders,
  useDeleteFolder,
  useRenameFolder,
} from "@/api/folders/query"
import type { Folder } from "@/api/folders/types"
import type { Topic } from "@/api/topics/types"
import { DocumentsDataTable } from "@/components/documents-data-table"
import { DocumentsTree } from "@/components/documents/documents-tree"
import { UploadDocumentDialog } from "@/components/documents/upload-dialog"
import { NewTopicDialog } from "@/components/documents/new-topic-dialog"
import { NewFolderDialog } from "@/components/documents/new-folder-dialog"
import { RenameDialog } from "@/components/documents/rename-dialog"
import { DeleteDialog } from "@/components/documents/delete-dialog"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty"
import { Button } from "@workspace/ui/components/button"
import { ToggleGroup, ToggleGroupItem } from "@workspace/ui/components/toggle-group"

type ViewMode = "tree" | "table"

type ActionTarget =
  | { kind: "topic"; id: string; name: string }
  | { kind: "folder"; id: string; name: string }

export function DocumentsView() {
  const [view, setView] = useState<ViewMode>("tree")
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [topicDialogOpen, setTopicDialogOpen] = useState(false)
  const [folderDialogOpen, setFolderDialogOpen] = useState(false)
  const [newFolderParent, setNewFolderParent] = useState<Folder | null>(null)
  const [newFolderDefaultTopicId, setNewFolderDefaultTopicId] = useState<
    string | null
  >(null)
  const [renameTarget, setRenameTarget] = useState<ActionTarget | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ActionTarget | null>(null)

  const {
    data: docsInfinite,
    isLoading: docsLoading,
    hasNextPage: docsHasNextPage,
    fetchNextPage: docsFetchNextPage,
    isFetchingNextPage: docsIsFetchingNextPage,
  } = useInfiniteDocuments({ pageSize: 100 })
  const docs = docsInfinite?.pages.flatMap((p) => p.documents) ?? []
  const { data: topicsData, isLoading: topicsLoading } = useTopics()
  const { data: foldersData, isLoading: foldersLoading } = useAllFolders()

  const renameTopic = useRenameTopic()
  const deleteTopic = useDeleteTopic()
  const renameFolder = useRenameFolder()
  const deleteFolder = useDeleteFolder()

  const topics = topicsData?.topics ?? []
  const folders = foldersData?.folders ?? []

  const hasTopics = topics.length > 0
  const isLoading = topicsLoading || foldersLoading || docsLoading

  const selectedFolder =
    folders.find((f) => f.id === selectedFolderId) ?? null

  const handleUploadClick = () => {
    if (!selectedFolder) {
      setView("tree")
      return
    }
    setUploadOpen(true)
  }

  const handleNewFolderClick = () => {
    setNewFolderParent(null)
    setNewFolderDefaultTopicId(null)
    setFolderDialogOpen(true)
  }

  const handleNewFileInFolder = (folder: Folder) => {
    setSelectedFolderId(folder.id)
    setUploadOpen(true)
  }

  const handleNewFolderInFolder = (parent: Folder) => {
    setNewFolderParent(parent)
    setNewFolderDefaultTopicId(null)
    setFolderDialogOpen(true)
  }

  const handleNewFolderInTopic = (topic: Topic) => {
    setNewFolderParent(null)
    setNewFolderDefaultTopicId(topic.id)
    setFolderDialogOpen(true)
  }

  const renamePending =
    renameTarget?.kind === "topic"
      ? renameTopic.isPending
      : renameTarget?.kind === "folder"
        ? renameFolder.isPending
        : false

  const renameError =
    renameTarget?.kind === "topic"
      ? (renameTopic.error?.message ?? null)
      : renameTarget?.kind === "folder"
        ? (renameFolder.error?.message ?? null)
        : null

  const handleRenameSubmit = (name: string) => {
    if (!renameTarget) return
    if (renameTarget.kind === "topic") {
      renameTopic.mutate(
        { id: renameTarget.id, input: { name } },
        { onSuccess: () => setRenameTarget(null) },
      )
    } else {
      renameFolder.mutate(
        { id: renameTarget.id, input: { name } },
        { onSuccess: () => setRenameTarget(null) },
      )
    }
  }

  const deletePending =
    deleteTarget?.kind === "topic"
      ? deleteTopic.isPending
      : deleteTarget?.kind === "folder"
        ? deleteFolder.isPending
        : false

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    if (deleteTarget.kind === "topic") {
      deleteTopic.mutate(deleteTarget.id, {
        onSuccess: () => setDeleteTarget(null),
      })
    } else {
      deleteFolder.mutate(deleteTarget.id, {
        onSuccess: () => setDeleteTarget(null),
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!hasTopics) {
    return (
      <>
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileTextIcon />
            </EmptyMedia>
            <EmptyTitle>Create a topic to get started</EmptyTitle>
            <EmptyDescription>
              Documents are organized into topics and folders. Create your
              first topic before uploading anything.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center gap-2">
            <Button onClick={() => setTopicDialogOpen(true)}>New Topic</Button>
          </EmptyContent>
        </Empty>
        <NewTopicDialog
          open={topicDialogOpen}
          onOpenChange={setTopicDialogOpen}
        />
      </>
    )
  }

  return (
    <div className="flex w-full flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2">
        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(value) => value && setView(value as ViewMode)}
        >
          <ToggleGroupItem value="tree" aria-label="Tree view">
            <ListTree className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="table" aria-label="Table view">
            <Table2 className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setTopicDialogOpen(true)}>
            New Topic
          </Button>
          <Button variant="outline" onClick={handleNewFolderClick}>
            New Folder
          </Button>
          <Button onClick={handleUploadClick}>
            <Upload data-icon="inline-start" />
            Upload
          </Button>
        </div>
      </div>

      {view === "tree" ? (
        <div className="flex w-full flex-col gap-2">
          <DocumentsTree
            topics={topics}
            folders={folders}
            documents={docs}
            hasNextPage={docsHasNextPage}
            isFetchingNextPage={docsIsFetchingNextPage}
            fetchNextPage={docsFetchNextPage}
            selectedFolderId={selectedFolderId}
            onSelectFolder={setSelectedFolderId}
            onRenameTopic={(topic) =>
              setRenameTarget({ kind: "topic", id: topic.id, name: topic.name })
            }
            onDeleteTopic={(topic) =>
              setDeleteTarget({ kind: "topic", id: topic.id, name: topic.name })
            }
            onRenameFolder={(folder) =>
              setRenameTarget({
                kind: "folder",
                id: folder.id,
                name: folder.name,
              })
            }
            onDeleteFolder={(folder) =>
              setDeleteTarget({
                kind: "folder",
                id: folder.id,
                name: folder.name,
              })
            }
            onNewFileInFolder={handleNewFileInFolder}
            onNewFolderInFolder={handleNewFolderInFolder}
            onNewFolderInTopic={handleNewFolderInTopic}
          />
          {!selectedFolder && (
            <p className="px-1 text-xs text-muted-foreground">
              Select a folder in the tree to enable uploads.
            </p>
          )}
        </div>
      ) : (
        <DocumentsDataTable />
      )}

      <UploadDocumentDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        folderName={selectedFolder?.name ?? null}
        folderId={selectedFolder?.id ?? null}
        topicId={selectedFolder?.topicId ?? null}
      />

      <NewTopicDialog
        open={topicDialogOpen}
        onOpenChange={setTopicDialogOpen}
      />

      <NewFolderDialog
        key={
          folderDialogOpen
            ? (newFolderParent?.id ??
              newFolderDefaultTopicId ??
              "root")
            : "new-folder-closed"
        }
        open={folderDialogOpen}
        onOpenChange={(open) => {
          setFolderDialogOpen(open)
          if (!open) {
            setNewFolderParent(null)
            setNewFolderDefaultTopicId(null)
          }
        }}
        topics={topics}
        parentFolder={newFolderParent}
        defaultTopicId={newFolderDefaultTopicId}
      />

      <RenameDialog
        key={
          renameTarget
            ? `${renameTarget.kind}-${renameTarget.id}`
            : "rename-closed"
        }
        open={renameTarget !== null}
        onOpenChange={(open) => !open && setRenameTarget(null)}
        title={renameTarget?.kind === "topic" ? "Rename topic" : "Rename folder"}
        initialName={renameTarget?.name ?? ""}
        isPending={renamePending}
        error={renameError}
        onSubmit={handleRenameSubmit}
      />

      <DeleteDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={
          deleteTarget?.kind === "topic" ? "Delete topic?" : "Delete folder?"
        }
        description={
          deleteTarget
            ? `"${deleteTarget.name}" will be removed. You can restore it later.`
            : ""
        }
        isPending={deletePending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}