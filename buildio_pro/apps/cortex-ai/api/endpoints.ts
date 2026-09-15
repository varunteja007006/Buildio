export const endpoints = {
  chat: {
    stream: "/chat",
    threads: "/chat/threads",
    thread: (id: string) => `/chat/threads/${id}`,
    threadRestore: (id: string) => `/chat/threads/${id}/restore`,
    models: "/chat/models",
    preferences: "/chat/preferences",
  },
  resources: {
    list: "/resources",
    detail: (id: string) => `/resources/${id}`,
  },
  workspaces: {
    list: "/workspaces",
    active: "/workspaces/active",
    detail: (id: string) => `/workspaces/${id}`,
    restore: (id: string) => `/workspaces/${id}/restore`,
    activate: (id: string) => `/workspaces/${id}/activate`,
  },
  auditLogs: {
    list: "/audit-logs",
  },
  documentAuditLogs: {
    list: "/document-audit-logs",
  },
  extractionTemplates: {
    list: "/extraction-templates",
    detail: (id: string) => `/extraction-templates/${id}`,
    restore: (id: string) => `/extraction-templates/${id}/restore`,
    permanent: (id: string) => `/extraction-templates/${id}/permanent`,
  },
  ingest: {
    run: "/ingest",
  },
  extractions: {
    list: "/extraction",
    detail: (id: string) => `/extraction/${id}`,
    run: (id: string) => `/extraction/${id}/run`,
    versions: (id: string) => `/extraction/${id}/versions`,
    restore: (id: string) => `/extraction/${id}/restore`,
  },
  documents: {
    list: "/documents",
    detail: (id: string) => `/documents/${id}`,
    restore: (id: string) => `/documents/${id}/restore`,
    permanent: (id: string) => `/documents/${id}/permanent`,
    trash: "/documents/trash",
  },
  folders: {
    list: "/folders",
    detail: (id: string) => `/folders/${id}`,
    restore: (id: string) => `/folders/${id}/restore`,
    permanent: (id: string) => `/folders/${id}/permanent`,
  },
  topics: {
    list: "/topics",
    detail: (id: string) => `/topics/${id}`,
    restore: (id: string) => `/topics/${id}/restore`,
    permanent: (id: string) => `/topics/${id}/permanent`,
  },
  dashboard: {
    stats: "/dashboard",
  },
} as const;
