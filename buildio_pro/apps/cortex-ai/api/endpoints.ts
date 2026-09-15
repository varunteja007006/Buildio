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
  extractionTemplates: {
    list: "/extraction-templates",
    detail: (id: string) => `/extraction-templates/${id}`,
    restore: (id: string) => `/extraction-templates/${id}/restore`,
    permanent: (id: string) => `/extraction-templates/${id}/permanent`,
  },
  extractions: {
    list: "/extraction",
  },
  documents: {
    list: "/documents",
    detail: (id: string) => `/documents/${id}`,
    restore: (id: string) => `/documents/${id}/restore`,
  },
  dashboard: {
    stats: "/dashboard",
  },
} as const;
