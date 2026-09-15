import type { Metadata } from "next";

import { DocumentsTrashPage } from "@/components/pages/documents-trash";

export const metadata: Metadata = {
  title: "Trash | Documents",
  description: "Restore or permanently delete trashed documents and templates",
};

export default function TrashPage() {
  return <DocumentsTrashPage />;
}
